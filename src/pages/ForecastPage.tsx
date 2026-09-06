import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { IcebergObservation, SeaIceGridPoint, VesselProfile } from '../types';
import { ANTARCTIC_RESEARCH_STATIONS } from '../data/antarcticData';
import { icebergTrajectoryModel } from '../services/icebergTrajectoryModel';
import { seaIceModel } from '../services/seaIceModel';
import {
  Activity,
  Compass,
  Wind,
  Shield,
  Layers,
  Thermometer,
  Eye,
  BarChart2,
  AlertTriangle,
  CloudSnow,
  Sparkles,
  MapPin,
  TrendingUp,
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
    <div id="forecasts-page" className="flex-1 bg-slate-50 text-slate-900 p-4 md:p-6 overflow-y-auto space-y-5">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-200 text-sky-600 shadow-sm">
            <CloudSnow className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Polar AI/ML 72-Hour Forecasting Laboratory
              </h2>
              <span className="text-[10px] bg-sky-50 text-sky-700 border border-sky-200 px-2 py-0.5 rounded-full font-mono">
                XGBoost + Hydrodynamic Hybrid
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Antarctic sea-ice concentration & iceberg trajectory multi-horizon predictive modeling (+6h to +72h)
            </p>
          </div>
        </div>

        {/* Sector Quick Selector */}
        <div className="flex items-center gap-2">
          <span className="text-slate-500 text-xs font-medium">Regional Sector:</span>
          <select
            id="select-forecast-sector"
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
            className="bg-white border border-slate-300 text-slate-900 rounded-lg p-2 text-xs font-semibold focus:border-sky-500 focus:ring-1 focus:ring-sky-200 focus:outline-none transition shadow-sm"
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
        <div className="lg:col-span-2 bg-white border border-slate-200 p-4 rounded-xl space-y-3.5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900 text-xs uppercase tracking-wider">
                Sea-Ice Concentration Multi-Horizon Forecast (%)
              </span>
              <span className="text-[10px] text-sky-600 font-mono">95% CI Confidence Band</span>
            </div>
            <span className="text-emerald-700 text-xs font-mono font-semibold">R²: 0.914 | MAE: 4.82%</span>
          </div>

          <div className="h-68 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeSeriesData}>
                <defs>
                  <linearGradient id="iceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#38BDF8" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#0F2444" />
                <XAxis dataKey="horizon" stroke="#64748B" tick={{ fill: '#94A3B8', fontSize: 11 }} />
                <YAxis domain={[0, 100]} stroke="#64748B" tick={{ fill: '#94A3B8', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#071326', borderColor: '#0284C7', borderRadius: 8 }}
                  labelStyle={{ color: '#38BDF8', fontWeight: 'bold' }}
                />
                <Legend wrapperStyle={{ fontSize: 11, color: '#94A3B8' }} />
                <Area
                  type="monotone"
                  dataKey="upperCI"
                  name="Upper 95% Confidence"
                  stroke="none"
                  fill="#0284C7"
                  fillOpacity={0.2}
                />
                <Area
                  type="monotone"
                  dataKey="lowerCI"
                  name="Lower 95% Confidence"
                  stroke="none"
                  fill="#0284C7"
                  fillOpacity={0.2}
                />
                <Line
                  type="monotone"
                  dataKey="concentration"
                  name="Predicted Concentration %"
                  stroke="#38BDF8"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#38BDF8', stroke: '#FFFFFF', strokeWidth: 1.5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Feature Importance & Thermodynamics */}
        <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-4 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <span className="font-semibold text-slate-900 text-xs uppercase tracking-wider">
                XGBoost Feature Importance
              </span>
              <span className="text-[10px] text-sky-600 font-mono">SHAP Attributions</span>
            </div>
            <div className="space-y-2.5 mt-3.5 text-xs">
              {sectorForecast.featureImportance.map((f) => (
                <div key={f.feature} className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-600 truncate">{f.feature}</span>
                    <span className="text-sky-600 font-bold font-mono">{(f.importanceWeight * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                    <div
                      className="bg-sky-600 h-full rounded-full"
                      style={{ width: `${f.importanceWeight * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1.5">
            <div className="text-slate-700 font-semibold uppercase text-[10px] text-sky-600">Pack Ice Thermodynamics</div>
            <div className="flex justify-between text-slate-600">
              <span className="text-slate-500">Est. Ice Thickness:</span>
              <span className="text-sky-600 font-bold font-mono">{sectorForecast.forecasts[2]?.iceThicknessEstimateM || 1.3} m</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span className="text-slate-500">Pack Divergence Rate:</span>
              <span className="text-emerald-700 font-bold font-mono">{sectorForecast.divergenceRateKmPerDay} km/day</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid 2: Tracked Icebergs Catalog & Trajectory Predictions */}
      <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-3.5 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900 text-xs uppercase tracking-wider">
              Tracked Antarctic Iceberg Database & AI Drift Trajectories
            </span>
            <span className="text-[10px] bg-sky-50 text-sky-700 border border-sky-200 px-2 py-0.5 rounded-full font-mono">
              US NIC / Sentinel-1 SAR Synchronized
            </span>
          </div>
          <span className="text-xs text-slate-500">Total Active Targets: {icebergs.length}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
          {icebergForecastList.map(({ berg, forecast }) => (
            <div
              key={berg.id}
              className="bg-white border border-slate-200 p-3.5 rounded-xl space-y-3 hover:border-sky-300 transition-all flex flex-col justify-between shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🧊</span>
                    <span className="font-bold text-slate-900 text-xs font-mono">{berg.name}</span>
                  </div>
                  <span
                    className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                      berg.riskRating === 'EXTREME'
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : berg.riskRating === 'HIGH'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : berg.riskRating === 'MEDIUM'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}
                  >
                    {berg.riskRating} RISK
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1">Calving Origin: {berg.calvingSource}</div>

                <div className="grid grid-cols-2 gap-2 mt-2.5 text-xs">
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                    <span className="text-slate-500 block text-[10px]">Dimensions</span>
                    <span className="font-semibold text-slate-900 font-mono">
                      {berg.lengthKm}x{berg.widthKm} km
                    </span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                    <span className="text-slate-500 block text-[10px]">Drift Velocity</span>
                    <span className="font-semibold text-emerald-700 font-mono">
                      {berg.speedKnots} kts @ {berg.driftHeadingDeg}°
                    </span>
                  </div>
                </div>

                {/* Proximity & CPA */}
                <div className="mt-2.5 text-[11px] space-y-1.5 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <div className="flex justify-between text-slate-600">
                    <span className="text-slate-500">Predicted +24h Fix:</span>
                    <span className="font-mono text-sky-600 font-semibold">
                      {forecast.trajectory[1]?.lat.toFixed(2)}°S, {forecast.trajectory[1]?.lon.toFixed(2)}°E
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span className="text-slate-500">Route CPA Proximity:</span>
                    <span className="font-mono font-bold text-amber-700">
                      {forecast.closestPointOfApproachNm !== undefined
                        ? `${forecast.closestPointOfApproachNm} NM`
                        : 'Clear (>50 NM)'}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span className="text-slate-500">Uncertainty Cone:</span>
                    <span className="text-slate-500 font-mono">±{forecast.trajectory[1]?.confidenceRadiusKm} km</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2.5 border-t border-slate-200 text-xs">
                <span className="text-slate-500 font-mono text-[10px]">{berg.dataSource}</span>
                <button
                  onClick={() => onSimulateDriftSpike(berg.id)}
                  className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg font-semibold transition text-xs active:scale-95 shadow-sm"
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
