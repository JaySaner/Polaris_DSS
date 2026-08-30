import React from 'react';
import { SeaIceGridPoint } from '../../types';
import { formatPolarCoordinates } from '../../utils/geoUtils';
import { seaIceModel } from '../../services/seaIceModel';
import { X, Thermometer, Wind, Compass, Shield, Activity, BarChart2, Sparkles } from 'lucide-react';

interface SeaIceModalProps {
  point: SeaIceGridPoint | null;
  onClose: () => void;
}

export const SeaIceModal: React.FC<SeaIceModalProps> = ({ point, onClose }) => {
  if (!point) return null;

  const forecast = seaIceModel.predict(point, point.currentConcentration);
  const features = seaIceModel.extractFeatures(point, point.currentConcentration);

  const getIceColor = (conc: number) => {
    if (conc > 80) return 'text-slate-100 bg-sky-950 border-cyan-400 shadow-[0_0_10px_rgba(56,189,248,0.3)]';
    if (conc > 50) return 'text-cyan-200 bg-cyan-950 border-cyan-500';
    if (conc > 20) return 'text-blue-200 bg-blue-950 border-blue-500';
    return 'text-emerald-300 bg-emerald-950 border-emerald-500';
  };

  return (
    <div
      id="sea-ice-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="sea-ice-modal-panel"
        className="bg-[#071326] border border-cyan-500/30 text-slate-100 rounded-2xl max-w-2xl w-full p-5 shadow-2xl space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-cyan-900/30 pb-3">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xl shadow-md">
              ❄️
            </span>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-base font-bold text-slate-100 font-mono tracking-tight">
                  SEA-ICE OBSERVATION & PREDICTION
                </h3>
                <span
                  className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${getIceColor(
                    point.currentConcentration
                  )}`}
                >
                  {point.currentConcentration}% CONCENTRATION
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Fix: {formatPolarCoordinates(point)} | Model: {forecast.modelType}
              </p>
            </div>
          </div>
          <button
            id="btn-close-sea-ice-modal"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-2 rounded-xl hover:bg-[#0B1E38] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Environmental State */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
          <div className="bg-[#050D1A] p-2.5 rounded-xl border border-cyan-500/20">
            <span className="text-slate-400 block text-[10px]">Ice Thickness</span>
            <span className="font-semibold text-cyan-300 font-mono">{point.thicknessM} meters</span>
          </div>
          <div className="bg-[#050D1A] p-2.5 rounded-xl border border-cyan-500/20">
            <span className="text-slate-400 block text-[10px]">2M Air Temp</span>
            <span className="font-semibold text-blue-300 font-mono">{features.air_temperature}°C</span>
          </div>
          <div className="bg-[#050D1A] p-2.5 rounded-xl border border-cyan-500/20">
            <span className="text-slate-400 block text-[10px]">Sea Surface Temp</span>
            <span className="font-semibold text-sky-300 font-mono">{features.sea_surface_temperature}°C</span>
          </div>
          <div className="bg-[#050D1A] p-2.5 rounded-xl border border-cyan-500/20">
            <span className="text-slate-400 block text-[10px]">Wind Velocity</span>
            <span className="font-semibold text-emerald-400 font-mono">
              {features.wind_speed_kmh} km/h @ {features.wind_direction_deg}°
            </span>
          </div>
        </div>

        {/* Multi-Horizon Forecast Matrix */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Multi-Horizon Forecast Concentration Matrix
            </h4>
            <span className="text-xs font-mono text-cyan-300 font-semibold">
              Confidence: {(point.confidenceScore * 100).toFixed(0)}%
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs font-mono">
            {forecast.forecasts.map((f) => (
              <div
                key={f.horizonHours}
                className="bg-[#050D1A] p-2.5 rounded-xl border border-cyan-500/20 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>+{f.horizonHours}h</span>
                  <span
                    className={
                      f.trend === 'INCREASING'
                        ? 'text-rose-400 font-bold'
                        : f.trend === 'DECREASING'
                        ? 'text-emerald-400 font-bold'
                        : 'text-slate-400'
                    }
                  >
                    {f.trend === 'INCREASING' ? '▲ Ice Growth' : f.trend === 'DECREASING' ? '▼ Melt' : '▬ Stable'}
                  </span>
                </div>
                <div className="text-lg font-bold text-cyan-300 my-1">
                  {f.predictedConcentration}%
                </div>
                <div className="text-[9px] text-slate-400">
                  CI: [{f.confidenceInterval[0]}% - {f.confidenceInterval[1]}%]
                </div>
                <div className="text-[10px] text-slate-300 mt-1 border-t border-cyan-900/30 pt-1">
                  Thk: {f.iceThicknessEstimateM}m
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Feature Importance / Explainability */}
        <div className="bg-[#050D1A] p-3.5 rounded-xl border border-cyan-500/20 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <BarChart2 className="w-4 h-4 text-cyan-400" />
              AI Prediction Factor Weights (SHAP Analysis)
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Pack Divergence: {forecast.divergenceRateKmPerDay} km/day
            </span>
          </div>
          <div className="space-y-2">
            {forecast.featureImportance.map((fi) => (
              <div key={fi.feature} className="flex items-center gap-2 text-xs">
                <span className="w-48 truncate text-slate-300 text-[11px]">{fi.feature}</span>
                <div className="flex-1 bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full"
                    style={{ width: `${fi.importanceWeight * 100}%` }}
                  />
                </div>
                <span className="w-10 text-right text-cyan-300 font-mono text-[11px] font-bold">
                  {(fi.importanceWeight * 100).toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Timestamp */}
        <div className="flex items-center justify-between pt-2 border-t border-cyan-900/30 text-xs text-slate-400">
          <span>Observation Fix: {point.timestamp}</span>
          <span className="text-cyan-400 font-semibold">Sensor: AMSR2 89GHz / Sentinel-1 SAR</span>
        </div>
      </div>
    </div>
  );
};
