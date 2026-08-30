import React, { useState } from 'react';
import { CandidateRoute, NavAlert } from '../../types';
import {
  Shield,
  Flame,
  Navigation,
  AlertTriangle,
  Info,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  X,
} from 'lucide-react';

interface VoyageTelemetryBarProps {
  activeRoute: CandidateRoute | null;
  alerts: NavAlert[];
  onAcknowledgeAlert: (alertId: string) => void;
  onOpenRouteComparison: () => void;
  onOpenExplainableAI: () => void;
}

export const VoyageTelemetryBar: React.FC<VoyageTelemetryBarProps> = ({
  activeRoute,
  alerts,
  onAcknowledgeAlert,
  onOpenRouteComparison,
  onOpenExplainableAI,
}) => {
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);

  const unacknowledgedAlerts = alerts.filter((a) => !a.acknowledged);
  const primaryAlert = unacknowledgedAlerts[0] || null;

  if (isDismissed) {
    return (
      <div className="absolute bottom-3 right-4 z-30">
        <button
          id="btn-restore-telemetry-bar"
          onClick={() => setIsDismissed(false)}
          className="flex items-center gap-2 px-3 py-1.5 bg-[#07152B]/90 hover:bg-[#0E2A54] border border-cyan-500/40 text-cyan-300 text-xs font-semibold rounded-xl shadow-xl backdrop-blur-md transition active:scale-95"
          title="Restore Voyage Telemetry HUD"
        >
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          <span>Show Telemetry HUD</span>
          <ChevronUp className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  // Minimized Compact Mode
  if (isMinimized) {
    return (
      <div
        id="voyage-telemetry-minimized"
        className="bg-[#050E1D]/95 border-t border-cyan-900/40 text-slate-100 px-4 py-1.5 select-none shadow-xl flex items-center justify-between gap-3 z-20 backdrop-blur-md transition-all duration-200"
      >
        <div className="flex items-center gap-3 overflow-x-auto text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-400 font-bold uppercase text-[10px]">Voyage Telemetry</span>
          </div>

          {activeRoute && (
            <>
              <div className="flex items-center gap-1 px-2 py-0.5 bg-[#081730] border border-cyan-500/20 rounded-md text-[11px]">
                <Shield className="w-3 h-3 text-emerald-400" />
                <span className="text-slate-400">Safety:</span>
                <span className="font-bold text-emerald-300 font-mono">{activeRoute.safetyScore}/100</span>
              </div>

              <div className="flex items-center gap-1 px-2 py-0.5 bg-[#081730] border border-cyan-500/20 rounded-md text-[11px]">
                <Flame className="w-3 h-3 text-amber-400" />
                <span className="text-slate-400">Fuel:</span>
                <span className="font-bold text-amber-300 font-mono">{activeRoute.fuelPercentageOfCapacity}%</span>
              </div>

              <div className="flex items-center gap-1 px-2 py-0.5 bg-[#081730] border border-cyan-500/20 rounded-md text-[11px]">
                <Navigation className="w-3 h-3 text-cyan-400" />
                <span className="text-slate-400">ETA:</span>
                <span className="font-bold text-slate-200 font-mono">
                  {activeRoute.totalDistanceKm} km ({(activeRoute.estimatedTravelTimeHours / 24).toFixed(1)}d)
                </span>
              </div>

              <div className="flex items-center gap-1 px-2 py-0.5 bg-[#081730] border border-cyan-500/20 rounded-md text-[11px]">
                <span className="text-slate-400">CPA:</span>
                <span className="font-bold text-rose-300 font-mono">{activeRoute.closestIcebergCpaNm} NM</span>
              </div>
            </>
          )}

          {primaryAlert && (
            <div className="flex items-center gap-1 px-2 py-0.5 bg-rose-950/80 border border-rose-500/40 text-rose-200 rounded-md text-[11px] font-semibold">
              <AlertTriangle className="w-3 h-3 text-rose-400 animate-pulse" />
              <span className="truncate max-w-[200px]">{primaryAlert.title}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={onOpenRouteComparison}
            className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-slate-950 rounded-lg text-[11px] font-bold transition flex items-center gap-1"
          >
            <span>Compare Routes</span>
            <ArrowRight className="w-3 h-3" />
          </button>
          <button
            id="btn-expand-telemetry"
            onClick={() => setIsMinimized(false)}
            className="p-1 hover:bg-[#0E2A54] text-slate-300 hover:text-cyan-300 rounded-lg transition text-[11px] flex items-center gap-1 px-2 border border-slate-700"
            title="Expand Full Telemetry HUD"
          >
            <ChevronUp className="w-3.5 h-3.5" />
            <span>Expand HUD</span>
          </button>
          <button
            onClick={() => setIsDismissed(true)}
            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-lg transition"
            title="Hide HUD Bar"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // Expanded Streamlined Mode
  return (
    <div
      id="voyage-telemetry-bar"
      className="bg-[#050E1D]/95 border-t border-cyan-900/40 text-slate-100 px-3 py-2 select-none shadow-[0_-10px_30px_rgba(0,0,0,0.5)] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 z-20 backdrop-blur-md transition-all duration-200"
    >
      {/* 1. Environmental Telemetry Snapshot Cards (Compact Row) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 flex-shrink-0">
        {/* Sea Ice Concentration Exposure */}
        <div className="bg-[#081730]/90 border border-cyan-500/20 px-2.5 py-1.5 rounded-lg flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[9px] text-slate-400 uppercase font-semibold">Ice Exposure</span>
            <span className="text-[9px] text-cyan-300 font-mono">AMSR2</span>
          </div>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xs font-bold text-cyan-300">
              {activeRoute ? `${activeRoute.seaIceExposureKm} km` : '48 km'}
            </span>
            <span className="text-[9px] text-slate-400">
              {activeRoute && activeRoute.seaIceExposureKm > 100 ? 'HEAVY' : 'MOD'}
            </span>
          </div>
        </div>

        {/* Iceberg Proximity (CPA) */}
        <div className="bg-[#081730]/90 border border-cyan-500/20 px-2.5 py-1.5 rounded-lg flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[9px] text-slate-400 uppercase font-semibold">Iceberg CPA</span>
            <span className="text-[9px] text-rose-400 font-mono">US-NIC</span>
          </div>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span
              className={`text-xs font-bold ${
                activeRoute && activeRoute.closestIcebergCpaNm < 20
                  ? 'text-rose-400 animate-pulse'
                  : 'text-emerald-400'
              }`}
            >
              {activeRoute ? `${activeRoute.closestIcebergCpaNm} NM` : '28.4 NM'}
            </span>
            <span className="text-[9px] text-slate-400">BUFFER</span>
          </div>
        </div>

        {/* Metocean Wind & Wave */}
        <div className="bg-[#081730]/90 border border-cyan-500/20 px-2.5 py-1.5 rounded-lg flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[9px] text-slate-400 uppercase font-semibold">Wind & Wave</span>
            <span className="text-[9px] text-amber-300 font-mono">ECMWF</span>
          </div>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xs font-bold text-amber-300">38 km/h</span>
            <span className="text-[9px] text-slate-400">3.2m</span>
          </div>
        </div>

        {/* Ocean Current Streamlines */}
        <div className="bg-[#081730]/90 border border-cyan-500/20 px-2.5 py-1.5 rounded-lg flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[9px] text-slate-400 uppercase font-semibold">ACC Current</span>
            <span className="text-[9px] text-sky-300 font-mono">HYCOM</span>
          </div>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xs font-bold text-sky-300">1.2 kts</span>
            <span className="text-[9px] text-slate-400">E-WARD</span>
          </div>
        </div>
      </div>

      {/* 2. Active Route Safety, Fuel & ETA Command HUD */}
      {activeRoute ? (
        <div className="flex-1 bg-gradient-to-r from-[#091C3A] via-[#081832] to-[#091C3A] border border-cyan-500/30 px-3 py-1.5 rounded-xl flex flex-wrap items-center justify-between gap-2.5 shadow-md">
          <div className="flex items-center gap-3">
            {/* Safety Score with Radial/Pill Glow */}
            <div className="flex items-center gap-1.5">
              <div className="p-1 rounded-md bg-emerald-950/80 border border-emerald-500/50 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                <Shield className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-[9px] text-slate-400 uppercase font-semibold block">Safety Index</span>
                <span className="text-xs font-bold text-emerald-300 font-mono">
                  {activeRoute.safetyScore}<span className="text-[10px] text-slate-400">/100</span>
                </span>
              </div>
            </div>

            <div className="h-6 w-px bg-cyan-900/40 hidden sm:block" />

            {/* Fuel Consumption */}
            <div className="flex items-center gap-1.5">
              <div className="p-1 rounded-md bg-amber-950/80 border border-amber-500/50 text-amber-400">
                <Flame className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-[9px] text-slate-400 uppercase font-semibold block">Est. Fuel</span>
                <span className="text-xs font-bold text-amber-300 font-mono">
                  {activeRoute.fuelPercentageOfCapacity}%{' '}
                  <span className="text-[9px] text-slate-400">({Math.round(activeRoute.estimatedFuelConsumptionL / 1000)} kL)</span>
                </span>
              </div>
            </div>

            <div className="h-6 w-px bg-cyan-900/40 hidden lg:block" />

            {/* Distance & ETA */}
            <div className="hidden lg:flex items-center gap-1.5">
              <div className="p-1 rounded-md bg-cyan-950/80 border border-cyan-500/50 text-cyan-400">
                <Navigation className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-[9px] text-slate-400 uppercase font-semibold block">Transit ETA</span>
                <span className="text-xs font-bold text-slate-100 font-mono">
                  {activeRoute.totalDistanceKm} km{' '}
                  <span className="text-[9px] text-cyan-300">({(activeRoute.estimatedTravelTimeHours / 24).toFixed(1)}d)</span>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action Navigation CTAs */}
          <div className="flex items-center gap-1.5">
            <button
              id="btn-open-route-xai"
              onClick={onOpenExplainableAI}
              className="px-2.5 py-1 bg-[#07152B] hover:bg-[#0B2042] text-cyan-300 border border-cyan-500/40 hover:border-cyan-400 rounded-lg text-xs font-semibold transition flex items-center gap-1 shadow-sm"
            >
              <Info className="w-3 h-3" />
              <span>Explain</span>
            </button>
            <button
              id="btn-open-route-compare"
              onClick={onOpenRouteComparison}
              className="px-3 py-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-[0_0_15px_rgba(6,182,212,0.3)] active:scale-95"
            >
              <span>Compare Routes</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 bg-[#081730] border border-cyan-500/20 px-3 py-1.5 rounded-xl flex items-center justify-center text-slate-400 text-xs">
          Computing Polar Passage Waypoints...
        </div>
      )}

      {/* 3. Real-Time Alert Ribbon */}
      {primaryAlert && (
        <div
          id="active-alert-ribbon"
          className={`flex-shrink-0 px-2.5 py-1 rounded-xl border flex items-center justify-between gap-2 max-w-xs ${
            primaryAlert.type === 'CRITICAL'
              ? 'bg-rose-950/90 border-rose-500/70 text-rose-100 shadow-[0_0_15px_rgba(244,63,94,0.25)]'
              : primaryAlert.type === 'WARNING'
              ? 'bg-amber-950/90 border-amber-500/70 text-amber-100 shadow-[0_0_15px_rgba(251,191,36,0.2)]'
              : 'bg-[#081730] border-slate-700 text-slate-200'
          }`}
        >
          <div className="flex items-center gap-1.5 overflow-hidden">
            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 text-amber-400 animate-pulse" />
            <div className="truncate">
              <span className="font-bold text-[11px] block truncate">{primaryAlert.title}</span>
            </div>
          </div>
          {!primaryAlert.acknowledged && (
            <button
              id={`btn-ack-alert-${primaryAlert.id}`}
              onClick={() => onAcknowledgeAlert(primaryAlert.id)}
              className="px-1.5 py-0.5 bg-slate-900 hover:bg-slate-800 text-[9px] font-bold text-slate-200 rounded border border-slate-600 flex-shrink-0 transition"
            >
              Ack
            </button>
          )}
        </div>
      )}

      {/* Minimize / Dismiss Controls */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          id="btn-minimize-telemetry"
          onClick={() => setIsMinimized(true)}
          className="p-1.5 hover:bg-[#0E2A54] text-slate-400 hover:text-cyan-300 rounded-lg transition border border-slate-700/60"
          title="Minimize Telemetry HUD (More Map Space)"
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => setIsDismissed(true)}
          className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-lg transition border border-slate-700/60"
          title="Hide Telemetry HUD"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
