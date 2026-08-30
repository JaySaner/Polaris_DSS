import React from 'react';
import {
  Compass,
  HelpCircle,
  X,
  Shield,
  Activity,
  Layers,
  MapPin,
  Clock,
  Film,
  BarChart2,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Database,
  Ship,
  Sparkles,
} from 'lucide-react';

interface UserGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserGuideModal: React.FC<UserGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in select-none">
      <div className="bg-[#07152B] border border-cyan-500/40 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#091E3D] via-[#0D2952] to-[#091E3D] px-6 py-4 border-b border-cyan-500/30 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
              <Compass className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                Polaris DSS User Guide & System Overview
                <span className="text-[10px] px-2 py-0.5 bg-cyan-950 text-cyan-300 border border-cyan-500/40 rounded-full font-mono">
                  MoES / NCPOR
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Understanding Antarctic Sea-Ice Forecasting & Iceberg Navigation Decision Support
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs leading-relaxed font-sans">
          {/* Quick Intro Banner */}
          <div className="bg-gradient-to-r from-cyan-950/60 via-blue-950/40 to-cyan-950/60 border border-cyan-500/30 p-4 rounded-xl flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xs font-bold text-cyan-200 uppercase tracking-wide">
                Welcome to Polaris DSS
              </h3>
              <p className="text-slate-300 mt-1">
                Polaris DSS helps polar captains and ice navigators safely maneuver research vessels (like R/V Bharati/Maitri expeditions) through Southern Ocean ice fields by combining satellite ice feeds, hydrodynamic drift forecasts, and multi-objective route planning.
              </p>
            </div>
          </div>

          {/* Section 1: How to Read the Interactive Map */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-cyan-300 flex items-center gap-2 border-b border-slate-800 pb-1.5">
              <MapPin className="w-4 h-4 text-cyan-400" />
              1. Interactive Polar Map & Layer Control
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-[#091932] p-3 rounded-xl border border-cyan-900/40 space-y-1">
                <div className="font-bold text-slate-200 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  Polar Stereographic Projection
                </div>
                <p className="text-slate-400">
                  Custom high-accuracy canvas rendering optimized for South Polar regions (-60° to -75°S). Use mouse scroll to zoom and click-drag to pan.
                </p>
              </div>
              <div className="bg-[#091932] p-3 rounded-xl border border-cyan-900/40 space-y-1">
                <div className="font-bold text-slate-200 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  Layer Filters Sidebar
                </div>
                <p className="text-slate-400">
                  Toggle Sea-Ice Heatmaps, Iceberg Fixes, Trajectory Vectors, Navigation Risk Grids, and Ocean/Wind fields on demand.
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Icebergs & Sea-Ice Interpretation */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-cyan-300 flex items-center gap-2 border-b border-slate-800 pb-1.5">
              <Layers className="w-4 h-4 text-cyan-400" />
              2. Iceberg Drift & Hazard Indicators
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
              <div className="bg-[#091932] p-3 rounded-xl border border-emerald-500/30">
                <span className="inline-block px-2.5 py-1 bg-emerald-950 text-emerald-300 rounded font-bold text-[11px] mb-1">
                  GREEN CORRIDOR
                </span>
                <p className="text-slate-400 text-[11px]">
                  Open leads & low sea-ice concentration (&lt; 20%). Safe passage.
                </p>
              </div>
              <div className="bg-[#091932] p-3 rounded-xl border border-amber-500/30">
                <span className="inline-block px-2.5 py-1 bg-amber-950 text-amber-300 rounded font-bold text-[11px] mb-1">
                  AMBER WARNING
                </span>
                <p className="text-slate-400 text-[11px]">
                  Moderate ice concentration (30-60%) & growing trajectory uncertainty.
                </p>
              </div>
              <div className="bg-[#091932] p-3 rounded-xl border border-rose-500/30">
                <span className="inline-block px-2.5 py-1 bg-rose-950 text-rose-300 rounded font-bold text-[11px] mb-1">
                  RED HAZARD
                </span>
                <p className="text-slate-400 text-[11px]">
                  Iceberg intercept risk (CPA &lt; 5 NM) or heavy fast ice.Reroute needed.
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Navigation Tabs Explained */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-cyan-300 flex items-center gap-2 border-b border-slate-800 pb-1.5">
              <BarChart2 className="w-4 h-4 text-cyan-400" />
              3. Navigating Application Modules
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
              <div className="bg-[#091932] p-2.5 rounded-lg border border-slate-800 flex items-start gap-2">
                <Compass className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-200">Voyage & Map:</strong> Main tactical view with live vessel fix, interactive map, passage planner, and route recalculation.
                </div>
              </div>
              <div className="bg-[#091932] p-2.5 rounded-lg border border-slate-800 flex items-start gap-2">
                <Film className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-200">Iceberg Animations:</strong> Satellite trajectory playbacks showing historical and predicted drift of major icebergs.
                </div>
              </div>
              <div className="bg-[#091932] p-2.5 rounded-lg border border-slate-800 flex items-start gap-2">
                <Clock className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-200">72h Forecasts:</strong> Predictive grid scrubber showing how ice density and wind vectors shift over 72 hours.
                </div>
              </div>
              <div className="bg-[#091932] p-2.5 rounded-lg border border-slate-800 flex items-start gap-2">
                <BarChart2 className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-200">Route Comparison:</strong> Detailed breakdown of Direct vs Safety Bypass routes (distance, fuel, safety rating).
                </div>
              </div>
              <div className="bg-[#091932] p-2.5 rounded-lg border border-slate-800 flex items-start gap-2">
                <Shield className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-200">Explainable AI:</strong> Tune hazard engine weights (Ice concentration, berg distance, weather impact) in real-time.
                </div>
              </div>
              <div className="bg-[#091932] p-2.5 rounded-lg border border-slate-800 flex items-start gap-2">
                <Activity className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-200">Simulate Berg Drift Surge:</strong> Click the red button in the top bar to trigger a reactive hazard alert and watch automatic rerouting in action.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#050E1D] px-6 py-3 border-t border-cyan-900/40 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2 text-slate-400 text-[11px]">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Compliant with IMO Polar Code Safety Regulations</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-slate-950 font-bold rounded-lg transition text-xs"
          >
            Got it, Let's Explore
          </button>
        </div>
      </div>
    </div>
  );
};
