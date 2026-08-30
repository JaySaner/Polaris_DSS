import { ModelMetricData } from '../types';

export class ModelMetricsService {
  private metrics: ModelMetricData[] = [
    {
      modelName: 'MoES SeaIce-XGBoost Regressor (v2.4)',
      version: '2.4.1-prod',
      architecture: 'Gradient Boosted Trees with Spatial-Lag & Thermodynamic Loss',
      target: 'future_sea_ice_concentration (0-100%) at +6h, +12h, +24h, +48h, +72h',
      mae: 4.82,
      rmse: 6.74,
      r2: 0.914,
      trainingPeriod: '2012-01-01 to 2024-12-31 (12 Austral Cycles)',
      validationPeriod: '2025-01-01 to 2025-12-31',
      testPeriod: '2026-01-01 to 2026-08-20 (Recent Austral Winter)',
      datasetRecordCount: 1482000,
      featuresUsed: [
        'previous_sea_ice_concentration',
        'air_temperature_2m (ERA5)',
        'sea_surface_temperature (SST)',
        '10m_wind_vector (u, v)',
        'ocean_current_vector (u, v CMEMS)',
        '30yr_historical_climatology_mean',
        'day_of_year_sin_cos',
        'spatial_laplacian_ice_gradient'
      ],
      lastTrainingDate: '2026-08-15 04:00 UTC',
      status: 'TRAINED_ACTIVE',
    },
    {
      modelName: 'MoES IcebergDrift-Hybrid Physics-ML (v3.1)',
      version: '3.1.0-prod',
      architecture: 'Hydrodynamic Momentum Drift (Water/Wind/Coriolis) + XGBoost Residual Corrector',
      target: 'future_latitude, future_longitude at +6h, +12h, +24h, +48h, +72h',
      mae: 3.18,
      rmse: 5.02,
      r2: 0.887,
      meanPositionErrorKm: 4.12, // at +24h
      trajectoryErrorKm: 8.65,   // at +48h
      trainingPeriod: '2000-01-01 to 2024-12-31 (US NIC Database)',
      validationPeriod: '2025-01-01 to 2025-12-31',
      testPeriod: '2026-01-01 to 2026-08-25',
      datasetRecordCount: 84320,
      featuresUsed: [
        'observed_latitude_longitude',
        'lagged_position_velocity',
        'deep_ocean_current_layer (HYCOM)',
        'surface_wind_stress_drag',
        'coriolis_acceleration_parameter',
        'iceberg_calving_area_and_draft',
        'bathymetric_depth_grounding_constraint'
      ],
      lastTrainingDate: '2026-08-18 11:30 UTC',
      status: 'TRAINED_ACTIVE',
    },
    {
      modelName: 'MoES PolarRoute A* Dynamic Cost Solver (v1.8)',
      version: '1.8.2',
      architecture: 'Multi-Objective Spherical Graph Search with Polar Code Ice Resistance',
      target: 'Optimal 4D Waypoint Corridor & Fuel-Risk Minima',
      mae: 1.25,
      rmse: 2.10,
      r2: 0.965,
      trainingPeriod: 'Continuous Simulation & Voyage Log Calibrations',
      validationPeriod: '2024-2026 Sagar Nidhi & Maitri Expedition Legs',
      testPeriod: 'Active Operational Demo',
      datasetRecordCount: 12500,
      featuresUsed: [
        'multi_layer_risk_grid',
        'vessel_ice_class_coefficient',
        'fuel_burn_speed_polar_curve',
        'iceberg_cpa_hazard_barrier',
        'wave_wind_retardation_factor'
      ],
      lastTrainingDate: '2026-08-22 08:15 UTC',
      status: 'TRAINED_ACTIVE',
    }
  ];

  public getModelMetrics(): ModelMetricData[] {
    return this.metrics;
  }
}

export const modelMetricsService = new ModelMetricsService();
