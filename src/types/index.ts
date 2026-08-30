export type IceClass = 'PC1' | 'PC2' | 'PC3' | 'PC4' | 'PC5' | 'PC6' | 'PC7' | '1A-Super' | '1A' | '1B' | 'Open-Water';

export interface GeoCoordinate {
  lat: number; // Decimal degrees (negative for South)
  lon: number; // Decimal degrees (-180 to 180 or 0 to 360)
}

export interface ResearchStation {
  id: string;
  name: string;
  country: string;
  operator: string;
  coords: GeoCoordinate;
  type: 'Year-round' | 'Summer-only';
  openedYear: number;
  description: string;
  hasPortOrAnchor: boolean;
}

export interface IcebergObservation {
  id: string;
  name: string;
  calvingSource: string; // e.g. "Ross Ice Shelf", "Amery Ice Shelf", "Ronne Ice Shelf"
  quadrant?: 'A' | 'B' | 'C' | 'D'; // Antarctic Quadrant A (0-90W Weddell), B (90W-180 Amundsen/Ross), C (180-90E Wilkes), D (90E-0 Enderby/Prydz)
  currentPosition: GeoCoordinate;
  dmsLat?: string;
  dmsLon?: string;
  lengthKm: number;
  widthKm: number;
  areaKm2: number;
  heightAboveWaterM: number;
  estimatedDraftM: number;
  speedKnots: number;
  driftHeadingDeg: number;
  lastObservedDate: string;
  dataSource: string;
  riskRating: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  animationUrl?: string; // NASA SCP BYU animation URL (e.g. https://ftp.scp.byu.edu/data/misc/iceberg_animations/a23a_movie.gif)
  scpPageUrl?: string;
  status?: 'ACTIVE_DRIFT' | 'GROUNDED' | 'DISINTEGRATING' | 'CALVED';
  historyTrack?: Array<{ date: string; lat: number; lon: number; speedKnots: number }>;
}

export interface TrajectoryPoint extends GeoCoordinate {
  hourOffset: number; // +6, +12, +24, +48, +72
  timestamp: string;
  predictedSpeedKnots: number;
  predictedHeadingDeg: number;
  confidenceRadiusKm: number; // Uncertainty cone radius
  riskToActiveRoute: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface IcebergForecast {
  icebergId: string;
  name: string;
  calvingOrigin: string;
  currentPosition: GeoCoordinate;
  lengthKm: number;
  widthKm: number;
  driftSpeedKnots: number;
  driftHeadingDeg: number;
  modelConfidence: number; // 0.0 - 1.0
  trajectory: TrajectoryPoint[];
  closestPointOfApproachNm?: number;
  timeToCpaHours?: number;
}

export interface SeaIceGridPoint extends GeoCoordinate {
  currentConcentration: number; // 0 to 100%
  thicknessM: number;
  forecast6h: number;
  forecast12h: number;
  forecast24h: number;
  forecast48h: number;
  forecast72h: number;
  confidenceScore: number; // 0.0 - 1.0
  surfaceTempC: number;
  airTempC: number;
  timestamp: string;
}

export interface WeatherObservation {
  coords: GeoCoordinate;
  windSpeedKmh: number;
  windDirectionDeg: number;
  airTempC: number;
  waveHeightM: number;
  surfaceCurrentSpeedKnots: number;
  surfaceCurrentDirectionDeg: number;
  visibilityKm: number;
  barometricPressureHpa: number;
}

export interface RiskGridCell extends GeoCoordinate {
  id: string;
  seaIceRisk: number;    // 0 - 100
  icebergRisk: number;   // 0 - 100
  weatherRisk: number;   // 0 - 100
  oceanRisk: number;     // 0 - 100
  visibilityRisk: number;// 0 - 100
  overallRisk: number;   // 0 - 100
  riskCategory: 'SAFE' | 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME';
}

export interface RiskWeights {
  seaIce: number;    // default 0.40
  iceberg: number;   // default 0.30
  weather: number;   // default 0.15
  ocean: number;     // default 0.10
  visibility: number;// default 0.05
}

export interface RiskFactorWeights {
  seaIceWeight: number;
  icebergWeight: number;
  weatherWeight: number;
  oceanCurrentWeight: number;
  visibilityWeight: number;
}

export type RoutingObjective = 'Safety First' | 'Balanced' | 'Fuel Efficiency' | 'Fastest';

export interface ObjectiveWeights {
  riskWeight: number;
  fuelWeight: number;
  timeWeight: number;
}

export interface VesselProfile {
  id: string;
  name: string;
  callSign: string;
  iceClass: IceClass;
  lengthM: number;
  beamM: number;
  draftM: number;
  cruisingSpeedKnots: number;
  maxSpeedKnots: number;
  fuelConsumptionLPerHr: number;
  fuelCapacityL: number;
  currentFuelL: number;
  maxSafeWaveHeightM: number;
  maxSafeWindSpeedKmh: number;
  currentPosition: GeoCoordinate;
  currentHeadingDeg: number;
}

export interface RouteWaypoint extends GeoCoordinate {
  index: number;
  name?: string;
  cumulativeDistanceKm: number;
  estimatedTimeHours: number;
  expectedSeaIceConcentration: number;
  segmentRiskScore: number;
  segmentRiskCategory: 'SAFE' | 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME';
  windSpeedKmh: number;
  waveHeightM: number;
  icebergCpaNm: number;
}

export interface CandidateRoute {
  id: string;
  name: string;
  tag: string; // e.g. "Route A (Direct)", "Route B (Ice Bypass)", "Route C (Current Assisted)"
  isRecommended: boolean;
  totalDistanceKm: number;
  totalDistanceNm: number;
  estimatedTravelTimeHours: number;
  estimatedFuelConsumptionL: number;
  fuelPercentageOfCapacity: number;
  overallRiskScore: number; // 0 - 100 (lower is safer)
  safetyScore: number;      // 0 - 100 (higher is safer)
  efficiencyScore: number;  // 0 - 100
  seaIceExposureKm: number; // Distance traveling through >20% ice
  closestIcebergCpaNm: number;
  closestIcebergName: string;
  waypoints: RouteWaypoint[];
  riskFactorBreakdown: {
    seaIce: number;
    iceberg: number;
    weather: number;
    ocean: number;
    visibility: number;
  };
  rationale: string;
}

export interface NavAlert {
  id: string;
  type: 'CRITICAL' | 'WARNING' | 'ADVISORY' | 'NORMAL';
  title: string;
  message: string;
  affectedLocation?: GeoCoordinate;
  affectedRouteId?: string;
  timestamp: string;
  recommendedAction: string;
  acknowledged: boolean;
}

export interface ModelMetricData {
  modelName: string;
  version: string;
  architecture: string;
  target: string;
  mae: number;
  rmse: number;
  r2: number;
  meanPositionErrorKm?: number;
  trajectoryErrorKm?: number;
  trainingPeriod: string;
  validationPeriod: string;
  testPeriod: string;
  datasetRecordCount: number;
  featuresUsed: string[];
  lastTrainingDate: string;
  status: 'TRAINED_ACTIVE' | 'BASELINE_SIMULATED' | 'RETRAINING_SCHEDULED';
}

export interface DataSourceStatus {
  id: string;
  name: string;
  category: 'Satellite' | 'Sea Ice' | 'Iceberg' | 'Weather' | 'Oceanographic';
  sourceOrganization: string;
  status: 'CONNECTED_DEMO' | 'REAL_TIME_MOCKED' | 'OFFLINE';
  lastUpdateUtc: string;
  recordCount: number;
  coverageArea: string;
  resolution: string;
  latencyMinutes: number;
  description: string;
}

export interface MapLayerVisibility {
  seaIce: boolean;
  predictedSeaIce: boolean;
  icebergs: boolean;
  predictedIcebergTrajectories: boolean;
  navigationRiskGrid: boolean;
  windVectors: boolean;
  oceanCurrents: boolean;
  vessel: boolean;
  recommendedRoute: boolean;
  alternativeRoutes: boolean;
  researchStations: boolean;
  uncertaintyCones: boolean;
  graticule: boolean;
}
