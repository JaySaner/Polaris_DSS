import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { IcebergObservation, SeaIceGridPoint, VesselProfile } from '../types';
import { seaIceModel } from '../services/seaIceModel';
import { icebergTrajectoryModel } from '../services/icebergTrajectoryModel';
import {
  CloudSnow,
  Activity,
  Sliders,
  Shield,
  Layers,
  Thermometer,
  Eye,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';

interface ForecastPageProps {
  icebergs: IcebergObservation[];
  seaIceGrid: SeaIceGridPoint[];
  vessel: VesselProfile;
  onSimulateDriftSpike: (bergId: string) => void;
}

export const ForecastPage: React.FC<ForecastPageProps> = ({
  icebergs,
  seaIceGrid,
  vessel,
  onSimulateDriftSpike,
}) => {
  const [selectedSector, setSelectedSector] = useState<string>('Prydz Bay (Bharati Sector)');

  const sectors = [
    { name: 'Prydz Bay (Bharati Sector)', lat: -68.5, lon: 76.0, desc: 'Indian Polar Operations Sector' },
    { name: 'Princess Astrid Coast (Maitri Sector)', lat: -70.7, lon: 11.7, desc: 'Queen Maud Land' },
    { name: 'Weddell Sea (Larsen C Ice Shelf)', lat: -67.0, lon: -45.0, desc: 'Heavy Multi-Year Ice Zone' },
    { name: 'Ross Sea (McMurdo Sound)', lat: -77.5, lon: 166.0, desc: 'Polynya & Fast Ice Corridor' },
    { name: 'Drake Passage Polar Gateway', lat: -59.0, lon: -62.0, desc: 'High Wave & Iceberg Drift' },
  ];

  const currentSectorObj = sectors.find((s) => s.name === selectedSector) || sectors[0];
  const sectorForecast = seaIceModel.predict({ lat: currentSectorObj.lat, lon: currentSectorObj.lon });

  const timeSeriesData = [
    {
      horizon: 'Now (+0h)',
      concentration: sectorForecast.currentConcentration,
      upperCI: sectorForecast.currentConcentration,
      lowerCI: sectorForecast.currentConcentration,
      thicknessM: 1.3,
      airTempC: -22,
    },
    ...sectorForecast.forecasts.map((f) => ({
      horizon: `+${f.horizonHours}h`,
      concentration: f.predictedConcentration,
      upperCI: f.confidenceInterval[1],
      lowerCI: f.confidenceInterval[0],
      thicknessM: f.iceThicknessEstimateM,
      airTempC: -22 - f.horizonHours * 0.08,
    })),
  ];

  const icebergForecastList = icebergs.map((b) => ({
    berg: b,
    forecast: icebergTrajectoryModel.predictTrajectory(b),
  }));

  return (
    <div id="forecasts-page" className="flex-1 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 p-4 md:p-6 overflow-y-auto space-y-5 font-sans">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-900/40 border border-blue-300 dark:border-blue-800 text-blue-600 dark:text-blue-400 shadow-sm">
            <CloudSnow className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                Polar AI/ML 72-Hour Forecasting Laboratory
              </h2>
              <span className="text-[10px] bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800 px-2 py-0.5 rounded-full font-mono font-semibold">
                XGBoost + Hydrodynamic Hybrid
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Antarctic sea-ice concentration & iceberg trajectory multi-horizon predictive modeling (+6h to +72h)
            </p>
          </div>
        </div>

        {/* Sector Quick Selector */}
        <div className="flex items-center gap-2">
          <span className="text-slate-600 dark:text-slate-300 text-xs font-medium">Regional Sector:</span>
          <select
            id="select-forecast-sector"
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-lg p-2 text-xs font-semibold focus:border-blue-500 focus:outline-none transition shadow-sm"
          >
            {sectors.map((s) => (
              <option key={s.name} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid 1: Sea-Ice Predictive Concentration Curve & Feature Weights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Forecast Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl space-y-3.5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800 dark:text-slate-100 text-xs uppercase tracking-wider">
                Sea-Ice Concentration Multi-Horizon Forecast (%)
              </span>
              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-mono">95% CI Confidence Band</span>
            </div>
            <span className="text-emerald-600 dark:text-emerald-400 text-xs font-mono font-semibold">R²: 0.914 | MAE: 4.82%</span>
          </div>

          <div className="h-68 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeSeriesData}>
                <defs>
                  <linearGradient id="iceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="horizon" stroke="#94a3b8" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis domain={[0, 100]} stroke="#94a3b8" tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#bfdbfe', borderRadius: 8, fontSize: 12, color: '#0f172a' }}
                />
                <Legend wrapperStyle={{ fontSize: 11, color: '#64748b' }} />
                <Area
                  type="monotone"
                  dataKey="upperCI"
                  name="Upper 95% Confidence"
                  stroke="none"
                  fill="#2563eb"
                  fillOpacity={0.15}
                />
                <Area
                  type="monotone"
                  dataKey="lowerCI"
                  name="Lower 95% Confidence"
                  stroke="none"
                  fill="#2563eb"
                  fillOpacity={0.15}
                />
                <Line
                  type="monotone"
                  dataKey="concentration"
                  name="Predicted Concentration %"
                  stroke="#2563eb"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#2563eb', stroke: '#ffffff', strokeWidth: 1.5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Feature Importance & Thermodynamics */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl space-y-4 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <span className="font-semibold text-slate-800 dark:text-slate-100 text-xs uppercase tracking-wider">
                XGBoost Feature Importance
              </span>
              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-mono">SHAP Attributions</span>
            </div>
            <div className="space-y-2.5 mt-3.5 text-xs">
              {sectorForecast.featureImportance.map((f) => (
                <div key={f.feature} className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-700 dark:text-slate-300 truncate">{f.feature}</span>
                    <span className="text-blue-600 dark:text-blue-400 font-bold font-mono">{(f.importanceWeight * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
                    <div
                      className="bg-blue-600 h-full rounded-full"
                      style={{ width: `${f.importanceWeight * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
            <div className="text-blue-600 dark:text-blue-400 font-semibold uppercase text-[10px]">Pack Ice Thermodynamics</div>
            <div className="flex justify-between text-slate-700 dark:text-slate-300">
              <span className="text-slate-500">Est. Ice Thickness:</span>
              <span className="text-slate-900 dark:text-white font-bold font-mono">{sectorForecast.forecasts[2]?.iceThicknessEstimateM || 1.3} m</span>
            </div>
            <div className="flex justify-between text-slate-700 dark:text-slate-300">
              <span className="text-slate-500">Pack Divergence Rate:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold font-mono">{sectorForecast.divergenceRateKmPerDay} km/day</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid 2: Tracked Icebergs Catalog & Trajectory Predictions */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl space-y-3.5 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800 dark:text-slate-100 text-xs uppercase tracking-wider">
              Tracked Antarctic Iceberg Database & AI Drift Trajectories
            </span>
            <span className="text-[10px] bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800 px-2 py-0.5 rounded-full font-mono font-semibold">
              US NIC / Sentinel-1 SAR Synchronized
            </span>
          </div>
          <span className="text-xs text-slate-500">Total Active Targets: {icebergs.length}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
          {icebergForecastList.map(({ berg, forecast }) => (
            <div
              key={berg.id}
              className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 p-3.5 rounded-xl space-y-3 hover:border-blue-300 dark:hover:border-blue-700 transition-all flex flex-col justify-between shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🧊</span>
                    <span className="font-bold text-slate-900 dark:text-white text-xs font-mono">{berg.name}</span>
                  </div>
                  <span
                    className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                      berg.riskRating === 'EXTREME'
                        ? 'bg-rose-100 text-rose-700 border-rose-300 dark:bg-rose-950 dark:text-rose-300'
                        : berg.riskRating === 'HIGH'
                        ? 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-950 dark:text-blue-300'
                    }`}
                  >
                    {berg.riskRating} RISK
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1">Calving Origin: {berg.calvingSource}</div>

                <div className="grid grid-cols-2 gap-2 mt-2.5 text-xs">
                  <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Dimensions</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
                      {berg.lengthKm}x{berg.widthKm} km
                    </span>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Drift Velocity</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400 font-mono">
                      {berg.speedKnots} kts @ {berg.driftHeadingDeg}°
                    </span>
                  </div>
                </div>

                {/* Proximity & CPA */}
                <div className="mt-2.5 text-[11px] space-y-1.5 bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                  <div className="flex justify-between text-slate-600 dark:text-slate-300">
                    <span className="text-slate-400">Predicted +24h Fix:</span>
                    <span className="font-mono text-blue-600 dark:text-blue-400 font-semibold">
                      {forecast.trajectory[1]?.lat.toFixed(2)}°S, {forecast.trajectory[1]?.lon.toFixed(2)}°E
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-300">
                    <span className="text-slate-400">Route CPA Proximity:</span>
                    <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                      {forecast.closestPointOfApproachNm !== undefined
                        ? `${forecast.closestPointOfApproachNm} NM`
                        : 'Clear (>50 NM)'}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-300">
                    <span className="text-slate-400">Uncertainty Cone:</span>
                    <span className="text-slate-500 font-mono">±{forecast.trajectory[1]?.confidenceRadiusKm} km</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2.5 border-t border-slate-200 dark:border-slate-800 text-xs">
                <span className="text-slate-400 font-mono text-[10px]">{berg.dataSource}</span>
                <button
                  onClick={() => onSimulateDriftSpike(berg.id)}
                  className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold transition text-xs active:scale-95 shadow-sm"
                >
                  Simulate Surge (+0.8 kts)
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
