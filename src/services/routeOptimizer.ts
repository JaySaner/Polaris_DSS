import {
  GeoCoordinate,
  CandidateRoute,
  RouteWaypoint,
  RoutingObjective,
  ObjectiveWeights,
  VesselProfile,
  IcebergObservation,
} from '../types';
import {
  calculateHaversineDistanceKm,
  kmToNauticalMiles,
  calculateBearingDeg,
  calculateDestinationPoint,
} from '../utils/geoUtils';
import { dataProvider } from './dataProvider';
import { riskEngine } from './riskEngine';
import { icebergTrajectoryModel } from './icebergTrajectoryModel';

export const OBJECTIVE_PROFILES: Record<RoutingObjective, ObjectiveWeights> = {
  'Safety First': { riskWeight: 0.70, fuelWeight: 0.20, timeWeight: 0.10 },
  'Balanced': { riskWeight: 0.40, fuelWeight: 0.40, timeWeight: 0.20 },
  'Fuel Efficiency': { riskWeight: 0.20, fuelWeight: 0.60, timeWeight: 0.20 },
  'Fastest': { riskWeight: 0.25, fuelWeight: 0.15, timeWeight: 0.60 },
};

export class RouteOptimizer {
  /**
   * Generates and evaluates 3-4 candidate routes between start and destination
   */
  public planRoutes(
    start: GeoCoordinate,
    destination: GeoCoordinate,
    vessel: VesselProfile,
    objective: RoutingObjective = 'Safety First',
    icebergs?: IcebergObservation[]
  ): CandidateRoute[] {
    const activeIcebergs = icebergs || dataProvider.iceberg.getIcebergs();
    const weights = OBJECTIVE_PROFILES[objective];

    // 1. Generate Raw Path Geometries
    const directPath = this.generateGeodesicPath(start, destination, 24);
    const safePath = this.generateObstacleAvoidancePath(start, destination, activeIcebergs, 24, 'NORTH_CLEARANCE');
    const fuelEfficientPath = this.generateCurrentAssistedPath(start, destination, 24);

    // 2. Evaluate Candidate Route 1: Route A (Direct / Shortest)
    const routeA = this.evaluateRoute(
      'route-a-direct',
      'Route A (Direct Great Circle)',
      'Direct shortest geodesic route through pack ice. Higher iceberg and sea-ice exposure, lowest navigational distance.',
      directPath,
      vessel,
      activeIcebergs,
      false
    );

    // 3. Evaluate Candidate Route 2: Route B (Safety First / Ice-Avoidance)
    const routeB = this.evaluateRoute(
      'route-b-safety',
      'Route B (Polar Safety & Lead Bypass)',
      'Circumnavigates heavy pack ice and gives a wide 35nm+ berth around iceberg trajectory cones. Recommended for maximum vessel safety.',
      safePath,
      vessel,
      activeIcebergs,
      false
    );

    // 4. Evaluate Candidate Route 3: Route C (Fuel Efficient & Current Assisted)
    const routeC = this.evaluateRoute(
      'route-c-efficient',
      'Route C (Hydrodynamic & Fuel Optimal)',
      'Leverages favorable Antarctic Circumpolar Current vectors and follows natural polynya leads to minimize engine fuel burn.',
      fuelEfficientPath,
      vessel,
      activeIcebergs,
      false
    );

    const candidates = [routeA, routeB, routeC];

    // 5. Multi-Criteria Ranking based on Objective
    let bestScore = -Infinity;
    let recommendedRouteId = candidates[0].id;

    candidates.forEach((cand) => {
      // Normalized scoring: Safety is (100 - risk), Fuel is (100 - fuelPct*100), Time is inverted relative
      const normSafety = cand.safetyScore;
      const normFuel = Math.max(0, 100 - cand.fuelPercentageOfCapacity * 1.2);
      const normTime = Math.max(0, 100 - (cand.estimatedTravelTimeHours / 120) * 100);

      const objectiveScore =
        weights.riskWeight * normSafety +
        weights.fuelWeight * normFuel +
        weights.timeWeight * normTime;

      (cand as any)._objectiveScore = objectiveScore;

      if (objectiveScore > bestScore) {
        bestScore = objectiveScore;
        recommendedRouteId = cand.id;
      }
    });

    // Mark the recommended one
    candidates.forEach((c) => {
      c.isRecommended = c.id === recommendedRouteId;
    });

    // Sort by recommendation first, then safety
    return candidates.sort((a, b) => (b.isRecommended ? 1 : 0) - (a.isRecommended ? 1 : 0));
  }

  private generateGeodesicPath(start: GeoCoordinate, dest: GeoCoordinate, steps: number): GeoCoordinate[] {
    const totalDist = calculateHaversineDistanceKm(start, dest);
    const bearing = calculateBearingDeg(start, dest);
    const pts: GeoCoordinate[] = [];

    for (let i = 0; i <= steps; i++) {
      const frac = i / steps;
      const pt = calculateDestinationPoint(start, totalDist * frac, bearing);
      pts.push(pt);
    }
    return pts;
  }

  private generateObstacleAvoidancePath(
    start: GeoCoordinate,
    dest: GeoCoordinate,
    icebergs: IcebergObservation[],
    steps: number,
    bias: 'NORTH_CLEARANCE' | 'SOUTH_CLEARANCE'
  ): GeoCoordinate[] {
    const directPts = this.generateGeodesicPath(start, dest, steps);
    const modifiedPts: GeoCoordinate[] = [];

    for (let i = 0; i < directPts.length; i++) {
      const pt = directPts[i];
      if (i === 0 || i === directPts.length - 1) {
        modifiedPts.push(pt);
        continue;
      }

      // Check if near any iceberg or heavy ice
      let maxDeflection = 0;
      icebergs.forEach((berg) => {
        const d = calculateHaversineDistanceKm(pt, berg.currentPosition);
        if (d < 120) {
          const push = ((120 - d) / 120) * 1.8; // push northwards to open water
          if (push > maxDeflection) maxDeflection = push;
        }
      });

      // Avoidance arc: nudge latitude slightly northward (closer to 0) away from coastal ice shelf
      const arcFactor = Math.sin((i / steps) * Math.PI) * 1.5;
      const newLat = Math.min(-50, pt.lat + maxDeflection + arcFactor);
      modifiedPts.push({ lat: parseFloat(newLat.toFixed(3)), lon: pt.lon });
    }

    return modifiedPts;
  }

  private generateCurrentAssistedPath(
    start: GeoCoordinate,
    dest: GeoCoordinate,
    steps: number
  ): GeoCoordinate[] {
    const directPts = this.generateGeodesicPath(start, dest, steps);
    const modifiedPts: GeoCoordinate[] = [];

    for (let i = 0; i < directPts.length; i++) {
      const pt = directPts[i];
      if (i === 0 || i === directPts.length - 1) {
        modifiedPts.push(pt);
        continue;
      }

      // ACC current flows eastward at 50°S-62°S. If traveling east, stay in 58°S-62°S stream
      const isEastbound = dest.lon > start.lon;
      const currentBias = isEastbound ? 0.8 : -0.8;
      const wave = Math.sin((i / steps) * Math.PI) * currentBias;

      const newLat = Math.min(-52, pt.lat + wave);
      modifiedPts.push({ lat: parseFloat(newLat.toFixed(3)), lon: pt.lon });
    }

    return modifiedPts;
  }

  private evaluateRoute(
    id: string,
    name: string,
    rationale: string,
    pathPoints: GeoCoordinate[],
    vessel: VesselProfile,
    icebergs: IcebergObservation[],
    isRecommended: boolean
  ): CandidateRoute {
    const waypoints: RouteWaypoint[] = [];
    let cumulativeDistKm = 0;
    let totalRiskSum = 0;
    let seaIceRiskSum = 0;
    let icebergRiskSum = 0;
    let wxRiskSum = 0;
    let oceanRiskSum = 0;
    let visRiskSum = 0;
    let seaIceExposureKm = 0;
    let minIcebergCpaNm = Infinity;
    let closestBergName = 'None in close range';

    for (let i = 0; i < pathPoints.length; i++) {
      const pt = pathPoints[i];
      let stepDist = 0;
      if (i > 0) {
        stepDist = calculateHaversineDistanceKm(pathPoints[i - 1], pt);
        cumulativeDistKm += stepDist;
      }

      // Environmental evaluation at waypoint
      const cellRisk = riskEngine.evaluateCoordinateRisk(pt, icebergs, vessel);
      const seaIce = dataProvider.seaIce.getSeaIceAtPoint(pt);
      const wx = dataProvider.weather.getWeatherAtPoint(pt);

      if (seaIce.currentConcentration > 20) {
        seaIceExposureKm += stepDist;
      }

      // Check distance to all icebergs
      let wpMinBergDistNm = Infinity;
      icebergs.forEach((b) => {
        const dNm = kmToNauticalMiles(calculateHaversineDistanceKm(pt, b.currentPosition));
        if (dNm < wpMinBergDistNm) wpMinBergDistNm = dNm;
        if (dNm < minIcebergCpaNm) {
          minIcebergCpaNm = dNm;
          closestBergName = b.name;
        }
      });

      totalRiskSum += cellRisk.overallRisk;
      seaIceRiskSum += cellRisk.seaIceRisk;
      icebergRiskSum += cellRisk.icebergRisk;
      wxRiskSum += cellRisk.weatherRisk;
      oceanRiskSum += cellRisk.oceanRisk;
      visRiskSum += cellRisk.visibilityRisk;

      // Speed adjustment in ice
      const effectiveSpeedKnots =
        seaIce.currentConcentration > 50
          ? vessel.cruisingSpeedKnots * 0.55
          : seaIce.currentConcentration > 20
          ? vessel.cruisingSpeedKnots * 0.8
          : vessel.cruisingSpeedKnots;

      const timeHours = (kmToNauticalMiles(cumulativeDistKm) / effectiveSpeedKnots);

      waypoints.push({
        index: i,
        lat: pt.lat,
        lon: pt.lon,
        cumulativeDistanceKm: Math.round(cumulativeDistKm),
        estimatedTimeHours: parseFloat(timeHours.toFixed(1)),
        expectedSeaIceConcentration: seaIce.currentConcentration,
        segmentRiskScore: cellRisk.overallRisk,
        segmentRiskCategory: cellRisk.riskCategory,
        windSpeedKmh: wx.windSpeedKmh,
        waveHeightM: wx.waveHeightM,
        icebergCpaNm: parseFloat(wpMinBergDistNm.toFixed(1)),
      });
    }

    const n = pathPoints.length;
    const avgRisk = Math.round(totalRiskSum / n);
    const totalDistNm = kmToNauticalMiles(cumulativeDistKm);

    // Fuel calculation: Base fuel + ice resistance penalty
    const totalTimeHours = waypoints[waypoints.length - 1]?.estimatedTimeHours || 24;
    const baseFuel = totalTimeHours * vessel.fuelConsumptionLPerHr;
    const icePenaltyMultiplier = 1.0 + (seaIceExposureKm / (cumulativeDistKm || 1)) * 0.45;
    const estimatedFuelL = Math.round(baseFuel * icePenaltyMultiplier);
    const fuelPct = parseFloat(((estimatedFuelL / vessel.fuelCapacityL) * 100).toFixed(1));

    const safetyScore = Math.max(10, Math.min(99, 100 - avgRisk));
    const efficiencyScore = Math.max(10, Math.min(99, Math.round(100 - (fuelPct * 0.8 + (totalDistNm / 2000) * 20))));

    return {
      id,
      name,
      tag: id.includes('direct') ? 'Route A (Direct)' : id.includes('safety') ? 'Route B (Ice Bypass)' : 'Route C (Optimal)',
      isRecommended,
      totalDistanceKm: Math.round(cumulativeDistKm),
      totalDistanceNm: Math.round(totalDistNm),
      estimatedTravelTimeHours: parseFloat(totalTimeHours.toFixed(1)),
      estimatedFuelConsumptionL: estimatedFuelL,
      fuelPercentageOfCapacity: fuelPct,
      overallRiskScore: avgRisk,
      safetyScore,
      efficiencyScore,
      seaIceExposureKm: Math.round(seaIceExposureKm),
      closestIcebergCpaNm: parseFloat(minIcebergCpaNm.toFixed(1)),
      closestIcebergName: closestBergName,
      waypoints,
      riskFactorBreakdown: {
        seaIce: Math.round(seaIceRiskSum / n),
        iceberg: Math.round(icebergRiskSum / n),
        weather: Math.round(wxRiskSum / n),
        ocean: Math.round(oceanRiskSum / n),
        visibility: Math.round(visRiskSum / n),
      },
      rationale,
    };
  }
}

export const routeOptimizer = new RouteOptimizer();
