import {
  GeoCoordinate,
  SeaIceGridPoint,
  IcebergObservation,
  WeatherObservation,
  DataSourceStatus,
} from '../types';
import {
  INITIAL_ICEBERGS,
  INITIAL_DATA_SOURCES,
  ANTARCTIC_RESEARCH_STATIONS,
} from '../data/antarcticData';

export interface ISatelliteProvider {
  getSatellitePassInfo(): { mission: string; nextPassUtc: string; swathCount: number };
}

export interface ISeaIceProvider {
  getSeaIceGrid(): SeaIceGridPoint[];
  getSeaIceAtPoint(coord: GeoCoordinate): SeaIceGridPoint;
}

export interface IIcebergProvider {
  getIcebergs(): IcebergObservation[];
  getIcebergById(id: string): IcebergObservation | undefined;
  updateIcebergObservation(id: string, updatedPos: GeoCoordinate, newSpeed?: number): void;
}

export interface IWeatherProvider {
  getWeatherAtPoint(coord: GeoCoordinate): WeatherObservation;
}

export interface IOceanProvider {
  getOceanCurrentAtPoint(coord: GeoCoordinate): { speedKnots: number; directionDeg: number; sstC: number };
}

/**
 * Concrete implementations using deterministic scientific simulation
 * Clearly labeled as Prototype/Demonstration Data
 */
class SatelliteProvider implements ISatelliteProvider {
  getSatellitePassInfo() {
    return {
      mission: 'Copernicus Sentinel-1 SAR & AMSR2 Constellation',
      nextPassUtc: '2026-08-27 04:30 UTC',
      swathCount: 18,
    };
  }
}

class SeaIceProvider implements ISeaIceProvider {
  private gridCache: SeaIceGridPoint[] = [];

  constructor() {
    this.generateDeterministicGrid();
  }

  private generateDeterministicGrid() {
    // Generate regular polar grid for Antarctic waters (-55°S down to -80°S)
    const points: SeaIceGridPoint[] = [];
    const latStep = 2.0; // 2 degree resolution for clean interactive rendering
    const lonStep = 5.0; // 5 degree lon step

    for (let lat = -55; lat >= -78; lat -= latStep) {
      for (let lon = -180; lon < 180; lon += lonStep) {
        const concentration = this.calculateBaseConcentration(lat, lon);
        const thickness = concentration > 15 ? (concentration / 100) * 2.2 + 0.3 : 0.1;
        const airTemp = -5 + (lat + 60) * 0.8; // colder towards pole
        const surfaceTemp = concentration > 50 ? -1.8 : 0.5;

        // Model predictions with diurnal/wind drift factor (+6h, +12h, +24h, +48h, +72h)
        const driftNoise = Math.sin((lon * Math.PI) / 60) * 3;
        const forecast6h = Math.max(0, Math.min(100, concentration + driftNoise * 0.4));
        const forecast12h = Math.max(0, Math.min(100, concentration + driftNoise * 0.8));
        const forecast24h = Math.max(0, Math.min(100, concentration + driftNoise * 1.5 + 2));
        const forecast48h = Math.max(0, Math.min(100, concentration + driftNoise * 2.2 + 4));
        const forecast72h = Math.max(0, Math.min(100, concentration + driftNoise * 3.0 + 6));

        points.push({
          lat,
          lon,
          currentConcentration: Math.round(concentration),
          thicknessM: parseFloat(thickness.toFixed(2)),
          forecast6h: Math.round(forecast6h),
          forecast12h: Math.round(forecast12h),
          forecast24h: Math.round(forecast24h),
          forecast48h: Math.round(forecast48h),
          forecast72h: Math.round(forecast72h),
          confidenceScore: 0.88 + (Math.abs(lat) / 100) * 0.08,
          surfaceTempC: parseFloat(surfaceTemp.toFixed(1)),
          airTempC: parseFloat(airTemp.toFixed(1)),
          timestamp: '2026-08-27 02:00 UTC',
        });
      }
    }
    this.gridCache = points;
  }

  private calculateBaseConcentration(lat: number, lon: number): number {
    // High ice concentration in Weddell Sea (-60 to -20 lon, lat < -65),
    // Ross Sea (160 to -160 lon, lat < -70),
    // Prydz Bay / Amery (65 to 80 lon, lat < -66)
    let base = 0;
    if (lat < -72) base = 85 + (Math.abs(lat) - 72) * 2.5;
    else if (lat < -66) base = 40 + (Math.abs(lat) - 66) * 7.5;
    else if (lat < -60) base = 10 + (Math.abs(lat) - 60) * 5.0;
    else base = 0;

    // Sector variations (Weddell Sea has perennial heavy pack ice)
    if (lon >= -60 && lon <= -20 && lat < -63) {
      base += 25;
    }
    // Ross Sea gyre
    if ((lon >= 160 || lon <= -160) && lat < -68) {
      base += 20;
    }
    // Prydz Bay / Bharati coastal leads & pack ice
    if (lon >= 70 && lon <= 85 && lat < -65) {
      base += 18;
    }

    // Add mild spatial wave
    base += Math.sin((lon * Math.PI) / 30) * 8;
    return Math.max(0, Math.min(100, base));
  }

  getSeaIceGrid(): SeaIceGridPoint[] {
    return this.gridCache;
  }

  getSeaIceAtPoint(coord: GeoCoordinate): SeaIceGridPoint {
    // Find closest grid point
    let closest = this.gridCache[0];
    let minDist = Infinity;
    for (const pt of this.gridCache) {
      const d = Math.hypot(pt.lat - coord.lat, pt.lon - coord.lon);
      if (d < minDist) {
        minDist = d;
        closest = pt;
      }
    }
    return closest || {
      lat: coord.lat,
      lon: coord.lon,
      currentConcentration: this.calculateBaseConcentration(coord.lat, coord.lon),
      thicknessM: 1.2,
      forecast6h: 45,
      forecast12h: 50,
      forecast24h: 55,
      forecast48h: 60,
      forecast72h: 65,
      confidenceScore: 0.91,
      surfaceTempC: -1.8,
      airTempC: -12.4,
      timestamp: '2026-08-27 02:00 UTC',
    };
  }
}

class IcebergProvider implements IIcebergProvider {
  private icebergs: IcebergObservation[] = [...INITIAL_ICEBERGS];

  getIcebergs(): IcebergObservation[] {
    return this.icebergs;
  }

  getIcebergById(id: string): IcebergObservation | undefined {
    return this.icebergs.find((b) => b.id === id);
  }

  updateIcebergObservation(id: string, updatedPos: GeoCoordinate, newSpeed?: number) {
    const berg = this.icebergs.find((b) => b.id === id);
    if (berg) {
      berg.currentPosition = updatedPos;
      if (newSpeed !== undefined) berg.speedKnots = newSpeed;
      berg.lastObservedDate = '2026-08-27 02:15 UTC (Dynamic Telemetry)';
    }
  }
}

class WeatherProvider implements IWeatherProvider {
  getWeatherAtPoint(coord: GeoCoordinate): WeatherObservation {
    // Southern Ocean winds: strong Westerlies between 50°S-65°S ("Roaring Forties", "Furious Fifties", "Screaming Sixties")
    // Polar Easterlies close to coastline (< 65°S)
    let windSpeed = 35;
    let windDir = 270; // Westerly by default
    if (coord.lat < -65) {
      windDir = 90; // Polar Easterlies near coastline
      windSpeed = 25 + Math.abs(Math.sin((coord.lon * Math.PI) / 45)) * 30; // Katabatic wind spikes
    } else {
      windSpeed = 40 + Math.abs(Math.sin((coord.lat * Math.PI) / 10)) * 25;
    }

    const waveHeight = Math.max(1.2, (windSpeed / 50) * 4.5);
    const airTemp = -2 + (coord.lat + 55) * 0.7;
    const visibility = windSpeed > 55 ? 3.5 : 18.0;

    return {
      coords: coord,
      windSpeedKmh: Math.round(windSpeed),
      windDirectionDeg: Math.round(windDir),
      airTempC: parseFloat(airTemp.toFixed(1)),
      waveHeightM: parseFloat(waveHeight.toFixed(1)),
      surfaceCurrentSpeedKnots: parseFloat((0.8 + (windSpeed / 100) * 0.6).toFixed(1)),
      surfaceCurrentDirectionDeg: (windDir + 35) % 360, // Ekman transport right-hand deflection (left in SH = + or -)
      visibilityKm: parseFloat(visibility.toFixed(1)),
      barometricPressureHpa: 978 + Math.round(Math.sin(coord.lon / 20) * 18),
    };
  }
}

class OceanProvider implements IOceanProvider {
  getOceanCurrentAtPoint(coord: GeoCoordinate) {
    // Antarctic Circumpolar Current (ACC) flows eastward between 50°S and 65°S
    // Antarctic Coastal Current (East Wind Drift) flows westward near the continent (< 66°S)
    let speed = 1.2;
    let dir = 85; // Eastward ACC
    if (coord.lat < -66) {
      dir = 265; // Westward East Wind Drift
      speed = 0.8 + Math.abs(Math.sin(coord.lon / 30)) * 0.6;
    } else {
      speed = 1.4 + Math.abs(Math.cos(coord.lat / 10)) * 1.1;
    }
    const sst = coord.lat < -62 ? -1.6 : 1.5 + (coord.lat + 60) * 0.3;
    return {
      speedKnots: parseFloat(speed.toFixed(1)),
      directionDeg: Math.round(dir),
      sstC: parseFloat(sst.toFixed(1)),
    };
  }
}

/**
 * Main DataProvider Singleton Abstraction
 */
export class DataProvider {
  public static readonly IS_PROTOTYPE_DEMO = true;
  public static readonly DEMO_LABEL = 'Prototype / Demonstration Data (MoES-NCPOR Simulation)';

  public satellite: ISatelliteProvider;
  public seaIce: ISeaIceProvider;
  public iceberg: IIcebergProvider;
  public weather: IWeatherProvider;
  public ocean: IOceanProvider;

  private static instance: DataProvider;

  private constructor() {
    this.satellite = new SatelliteProvider();
    this.seaIce = new SeaIceProvider();
    this.iceberg = new IcebergProvider();
    this.weather = new WeatherProvider();
    this.ocean = new OceanProvider();
  }

  public static getInstance(): DataProvider {
    if (!DataProvider.instance) {
      DataProvider.instance = new DataProvider();
    }
    return DataProvider.instance;
  }

  public getDataSourcesStatus(): DataSourceStatus[] {
    return INITIAL_DATA_SOURCES;
  }

  public getResearchStations() {
    return ANTARCTIC_RESEARCH_STATIONS;
  }
}

export const dataProvider = DataProvider.getInstance();
