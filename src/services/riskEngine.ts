import {
  GeoCoordinate,
  RiskGridCell,
  RiskWeights,
  IcebergObservation,
  VesselProfile,
} from '../types';
import { calculateHaversineDistanceKm } from '../utils/geoUtils';
import { dataProvider } from './dataProvider';
import { icebergTrajectoryModel } from './icebergTrajectoryModel';

export const DEFAULT_RISK_WEIGHTS: RiskWeights = {
  seaIce: 0.40,
  iceberg: 0.30,
  weather: 0.15,
  ocean: 0.10,
  visibility: 0.05,
};

export class NavigationRiskEngine {
  private weights: RiskWeights = { ...DEFAULT_RISK_WEIGHTS };
  private cachedRiskGrid: RiskGridCell[] = [];

  public getWeights(): RiskWeights {
    return { ...this.weights };
  }

  public setWeights(newWeights: Partial<RiskWeights>) {
    this.weights = { ...this.weights, ...newWeights };
    // Recalculate grid when weights change
    this.generateRiskGrid();
  }

  public resetWeights() {
    this.weights = { ...DEFAULT_RISK_WEIGHTS };
    this.generateRiskGrid();
  }

  /**
   * Computes risk metrics for an individual geographic coordinate
   */
  public evaluateCoordinateRisk(
    coord: GeoCoordinate,
    icebergs?: IcebergObservation[],
    vessel?: VesselProfile
  ): RiskGridCell {
    const seaIce = dataProvider.seaIce.getSeaIceAtPoint(coord);
    const wx = dataProvider.weather.getWeatherAtPoint(coord);
    const ocean = dataProvider.ocean.getOceanCurrentAtPoint(coord);
    const allIcebergs = icebergs || dataProvider.iceberg.getIcebergs();

    // 1. Sea Ice Risk (0 - 100)
    // Non-linear risk curve: ice < 15% is low risk, 15-40% is moderate, 40-70% is high, >70% is extreme
    let seaIceRisk = 0;
    if (seaIce.currentConcentration < 15) {
      seaIceRisk = seaIce.currentConcentration * 0.8;
    } else if (seaIce.currentConcentration < 50) {
      seaIceRisk = 12 + (seaIce.currentConcentration - 15) * 1.2;
    } else if (seaIce.currentConcentration < 80) {
      seaIceRisk = 54 + (seaIce.currentConcentration - 50) * 1.0;
    } else {
      seaIceRisk = 84 + (seaIce.currentConcentration - 80) * 0.8;
    }
    // Adjust by thickness if available
    if (seaIce.thicknessM > 1.5) seaIceRisk = Math.min(100, seaIceRisk * 1.15);

    // Vessel ice-class attenuation
    if (vessel) {
      if (vessel.iceClass === 'PC1' || vessel.iceClass === 'PC2') seaIceRisk *= 0.6;
      else if (vessel.iceClass === 'PC3' || vessel.iceClass === 'PC4' || vessel.iceClass === '1A-Super') seaIceRisk *= 0.75;
      else if (vessel.iceClass === 'PC5' || vessel.iceClass === 'PC6') seaIceRisk *= 0.88;
      else if (vessel.iceClass === 'Open-Water') seaIceRisk *= 1.4;
    }

    // 2. Iceberg Proximity Risk (0 - 100)
    let icebergRisk = 0;
    for (const berg of allIcebergs) {
      const distKm = calculateHaversineDistanceKm(coord, berg.currentPosition);
      // Inverse square decay within 150 km
      if (distKm < 15) {
        icebergRisk = Math.max(icebergRisk, 95);
      } else if (distKm < 50) {
        icebergRisk = Math.max(icebergRisk, 85 * Math.pow(1 - distKm / 50, 0.8));
      } else if (distKm < 120) {
        icebergRisk = Math.max(icebergRisk, 45 * Math.pow(1 - distKm / 120, 1.2));
      }

      // Also check iceberg future trajectory positions (+6h to +48h)
      const forecast = icebergTrajectoryModel.predictTrajectory(berg);
      for (const tp of forecast.trajectory) {
        const trajDistKm = calculateHaversineDistanceKm(coord, tp);
        if (trajDistKm < tp.confidenceRadiusKm * 1.5) {
          const trajHazard = (1 - trajDistKm / (tp.confidenceRadiusKm * 2)) * 80;
          icebergRisk = Math.max(icebergRisk, trajHazard);
        }
      }
    }

    // 3. Weather Risk (0 - 100)
    let wxRisk = 0;
    if (wx.windSpeedKmh < 30) wxRisk = (wx.windSpeedKmh / 30) * 15;
    else if (wx.windSpeedKmh < 60) wxRisk = 15 + ((wx.windSpeedKmh - 30) / 30) * 45;
    else wxRisk = 60 + Math.min(40, ((wx.windSpeedKmh - 60) / 40) * 40);

    // Wave height impact
    if (wx.waveHeightM > 4.0) {
      wxRisk = Math.min(100, wxRisk + (wx.waveHeightM - 4.0) * 8);
    }

    // 4. Ocean Risk (0 - 100)
    let oceanRisk = 0;
    if (ocean.speedKnots > 2.0) oceanRisk = 30 + (ocean.speedKnots - 2.0) * 25;
    else oceanRisk = ocean.speedKnots * 12;
    if (ocean.sstC < -1.5) oceanRisk += 10; // near-freezing supercooled water

    // 5. Visibility Risk (0 - 100)
    let visRisk = 0;
    if (wx.visibilityKm < 1.0) visRisk = 95;
    else if (wx.visibilityKm < 5.0) visRisk = 65;
    else if (wx.visibilityKm < 10.0) visRisk = 30;
    else visRisk = 5;

    // Overall Weighted Risk:
    const overallRisk =
      this.weights.seaIce * seaIceRisk +
      this.weights.iceberg * icebergRisk +
      this.weights.weather * wxRisk +
      this.weights.ocean * oceanRisk +
      this.weights.visibility * visRisk;

    const roundedOverall = Math.round(Math.max(0, Math.min(100, overallRisk)));

    let riskCategory: 'SAFE' | 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME' = 'SAFE';
    if (roundedOverall <= 20) riskCategory = 'SAFE';
    else if (roundedOverall <= 40) riskCategory = 'LOW';
    else if (roundedOverall <= 60) riskCategory = 'MODERATE';
    else if (roundedOverall <= 80) riskCategory = 'HIGH';
    else riskCategory = 'EXTREME';

    return {
      id: `cell_${coord.lat.toFixed(1)}_${coord.lon.toFixed(1)}`,
      lat: coord.lat,
      lon: coord.lon,
      seaIceRisk: Math.round(seaIceRisk),
      icebergRisk: Math.round(icebergRisk),
      weatherRisk: Math.round(wxRisk),
      oceanRisk: Math.round(oceanRisk),
      visibilityRisk: Math.round(visRisk),
      overallRisk: roundedOverall,
      riskCategory,
    };
  }

  /**
   * Generates dynamic risk grid across navigable Antarctic seas
   */
  public generateRiskGrid(icebergs?: IcebergObservation[], vessel?: VesselProfile): RiskGridCell[] {
    const cells: RiskGridCell[] = [];
    const latStep = 2.5;
    const lonStep = 6.0;

    for (let lat = -55; lat >= -78; lat -= latStep) {
      for (let lon = -180; lon < 180; lon += lonStep) {
        const cell = this.evaluateCoordinateRisk({ lat, lon }, icebergs, vessel);
        cells.push(cell);
      }
    }

    this.cachedRiskGrid = cells;
    return cells;
  }

  public getRiskGrid(): RiskGridCell[] {
    if (this.cachedRiskGrid.length === 0) {
      return this.generateRiskGrid();
    }
    return this.cachedRiskGrid;
  }
}

export const riskEngine = new NavigationRiskEngine();
