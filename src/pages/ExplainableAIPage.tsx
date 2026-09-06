import React, { useState } from 'react';
import { RiskWeights, CandidateRoute } from '../types';
import {
  Shield,
  Sliders,
  BarChart2,
  HelpCircle,
  Activity,
  Layers,
  Cpu,
  Info,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface ExplainableAIPageProps {
  weights: RiskWeights;
  onUpdateWeights: (newWeights: RiskWeights) => void;
  activeRoute: CandidateRoute | null;
}

export const ExplainableAIPage: React.FC<ExplainableAIPageProps> = ({
  weights,
  onUpdateWeights,
  activeRoute,
}) => {
  const [localWeights, setLocalWeights] = useState<RiskWeights>(weights);

  const handleSliderChange = (key: keyof RiskWeights, val: number) => {
    const updated = { ...localWeights, [key]: val };
    const sum: number =
      (updated.seaIce || 0) +
      (updated.iceberg || 0) +
      (updated.weather || 0) +
      (updated.ocean || 0) +
      (updated.visibility || 0) || 1.0;

    const normalized: RiskWeights = {
      seaIce: parseFloat(((updated.seaIce || 0) / sum).toFixed(2)),
      iceberg: parseFloat(((updated.iceberg || 0) / sum).toFixed(2)),
      weather: parseFloat(((updated.weather || 0) / sum).toFixed(2)),
      ocean: parseFloat(((updated.ocean || 0) / sum).toFixed(2)),
      visibility: parseFloat(((updated.visibility || 0) / sum).toFixed(2)),
    };
    setLocalWeights(normalized);
    onUpdateWeights(normalized);
  };

  const resetDefaultWeights = () => {
    const defaultWeights: RiskWeights = {
      seaIce: 0.40,
      iceberg: 0.30,
      weather: 0.15,
      ocean: 0.10,
      visibility: 0.05,
    };
    setLocalWeights(defaultWeights);
    onUpdateWeights(defaultWeights);
  };

  return (
    <div id="explainable-ai-page" className="flex-1 bg-slate-50 text-slate-900 p-4 md:p-6 overflow-y-auto space-y-5">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-200 text-sky-600 shadow-sm">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Explainable AI (XAI) & Navigation Risk Calibration
              </h2>
              <span className="text-[10px] bg-sky-50 text-sky-700 border border-sky-200 px-2 py-0.5 rounded-full font-mono">
                Multi-Factor Hydrodynamic Engine
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Calibrate operational risk weights, inspect SHAP factor attributions, and evaluate Polar Code navigation equations
            </p>
          </div>
        </div>

        <button
          id="btn-reset-risk-weights"
          onClick={resetDefaultWeights}
          className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-sky-600 rounded-lg text-xs font-semibold transition flex items-center gap-2 shadow-sm"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Default Weights</span>
        </button>
      </div>

      {/* Grid 1: Risk Weight Calibration Sliders + Active Route Factor Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Interactive Calibration Sliders */}
        <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-sky-600" />
              <span className="font-semibold text-slate-900 text-xs uppercase tracking-wider">
                Multi-Factor Risk Weights Calibration
              </span>
            </div>
            <span className="text-[10px] text-sky-700 font-mono font-bold bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
              Normalized: 100%
            </span>
          </div>

          <div className="space-y-3.5 text-xs">
            {/* Sea Ice Weight */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-slate-900 font-semibold">1. Sea-Ice Concentration & Thickness (w_ice)</span>
                <span className="text-sky-600 font-bold font-mono text-sm">{(localWeights.seaIce * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.80"
                step="0.05"
                value={localWeights.seaIce}
                onChange={(e) => handleSliderChange('seaIce', parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
              />
              <p className="text-[10px] text-slate-500">
                Accounts for pack ice resistance, ridge jamming, and hull compressive load.
              </p>
            </div>

            {/* Iceberg Proximity Weight */}
            <div className="bg-slate-50 p-3 rounded-xl border border-red-200 space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-slate-900 font-semibold">2. Iceberg Proximity & Drift Velocity (w_berg)</span>
                <span className="text-red-700 font-bold font-mono text-sm">{(localWeights.iceberg * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.80"
                step="0.05"
                value={localWeights.iceberg}
                onChange={(e) => handleSliderChange('iceberg', parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-red-600"
              />
              <p className="text-[10px] text-slate-500">
                Evaluates collision potential, uncertainty ellipse overlap, and minimum CPA buffer.
              </p>
            </div>

            {/* Weather Weight */}
            <div className="bg-slate-50 p-3 rounded-xl border border-amber-200 space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-slate-900 font-semibold">3. Meteorological Wind & Wave Energy (w_wx)</span>
                <span className="text-amber-700 font-bold font-mono text-sm">{(localWeights.weather * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.60"
                step="0.05"
                value={localWeights.weather}
                onChange={(e) => handleSliderChange('weather', parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
              />
              <p className="text-[10px] text-slate-500">
                10m wind speed, katabatic gale gusts, and significant wave height (SWH).
              </p>
            </div>

            {/* Ocean Current Weight */}
            <div className="bg-slate-50 p-3 rounded-xl border border-sky-200 space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-slate-900 font-semibold">4. Ocean Currents & ACC Shear (w_ocean)</span>
                <span className="text-sky-600 font-bold font-mono text-sm">{(localWeights.ocean * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.40"
                step="0.05"
                value={localWeights.ocean}
                onChange={(e) => handleSliderChange('ocean', parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
              />
              <p className="text-[10px] text-slate-500">
                Antarctic Circumpolar Current velocity vectors and eddy turbulence.
              </p>
            </div>

            {/* Visibility Weight */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-slate-900 font-semibold">5. Polar Visibility & Fog Impairment (w_vis)</span>
                <span className="text-sky-600 font-bold font-mono text-sm">{(localWeights.visibility * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.01"
                max="0.30"
                step="0.02"
                value={localWeights.visibility}
                onChange={(e) => handleSliderChange('visibility', parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
              />
              <p className="text-[10px] text-slate-500">
                Visual iceberg sighting range and radar sea-clutter attenuation.
              </p>
            </div>
          </div>
        </div>

        {/* Active Route Risk Factor Decomposition */}
        <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-4 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold text-slate-900 text-xs uppercase tracking-wider">
                  Active Passage Risk Decomposition
                </span>
              </div>
              <span className="text-sky-700 font-bold text-xs bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200 font-mono">
                {activeRoute?.tag || 'Recommended Route'}
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {[
                { label: 'Sea Ice Risk Contribution', val: activeRoute?.riskFactorBreakdown.seaIce || 24, color: 'bg-sky-600' },
                { label: 'Iceberg Proximity Contribution', val: activeRoute?.riskFactorBreakdown.iceberg || 12, color: 'bg-red-500' },
                { label: 'Weather / Gale Contribution', val: activeRoute?.riskFactorBreakdown.weather || 18, color: 'bg-amber-500' },
                { label: 'Ocean Current Opposition', val: activeRoute?.riskFactorBreakdown.ocean || 8, color: 'bg-sky-500' },
                { label: 'Polar Visibility Impairment', val: activeRoute?.riskFactorBreakdown.visibility || 6, color: 'bg-slate-500' },
              ].map((factor) => (
                <div key={factor.label} className="space-y-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600">{factor.label}</span>
                    <span className="font-bold text-slate-900 font-mono">{factor.val} / 100</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className={`${factor.color} h-full rounded-full`}
                      style={{ width: `${factor.val}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-sky-50 p-3.5 rounded-xl border border-sky-200 space-y-2 text-xs">
            <div className="text-sky-700 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-sky-600" />
              Live Operational Risk Equation
            </div>
            <p className="text-slate-800 font-mono text-[11px] leading-relaxed bg-white p-2.5 rounded-lg border border-sky-200">
              Risk(x, y) = {localWeights.seaIce}·R_ice + {localWeights.iceberg}·R_berg +{' '}
              {localWeights.weather}·R_wx + {localWeights.ocean}·R_ocean +{' '}
              {localWeights.visibility}·R_vis
            </p>
            <div className="text-slate-500 text-[10px]">
              Cell safety tiers: Safe (0-20) | Low (21-40) | Moderate (41-60) | High (61-80) | Extreme (81-100)
            </div>
          </div>
        </div>
      </div>

      {/* Grid 2: Polar Code PC5 Safety Margin Equations */}
      <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-3 shadow-sm">
        <span className="font-semibold text-slate-900 text-xs uppercase tracking-wider block border-b border-slate-200 pb-2">
          IMO Polar Code PC5 Operational Safety Guidelines
        </span>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-xs">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
            <span className="text-sky-600 font-bold block text-[11px]">Ice-Class Speed Adjustment</span>
            <span className="text-slate-600 text-[11px] leading-relaxed block font-mono">
              v_eff = v_cruise · (1.0 - 0.45 · (C_ice / 100)) for pack ice concentration C_ice &gt; 20%.
            </span>
          </div>
          <div className="bg-red-50 p-3 rounded-xl border border-red-200 space-y-1">
            <span className="text-red-700 font-bold block text-[11px]">Iceberg Safety Buffer</span>
            <span className="text-slate-600 text-[11px] leading-relaxed block">
              Minimum 25 NM buffer maintained around all tracked tabular bergs &gt; 15 km in length.
            </span>
          </div>
          <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 space-y-1">
            <span className="text-amber-700 font-bold block text-[11px]">Automated Rerouting Trigger</span>
            <span className="text-slate-600 text-[11px] leading-relaxed block">
              Triggers instant multi-objective graph recalculation when segment risk exceeds 65/100 or CPA &lt; 15 NM.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
