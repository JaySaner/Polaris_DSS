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
          className="flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-sky-600 text-xs font-semibold rounded-xl shadow-sm transition active:scale-95"
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
        className="bg-white border-t border-slate-200 text-slate-900 px-4 py-2 select-none shadow-sm flex items-center justify-between gap-3 z-20 transition-all duration-200"
      >
        <div className="flex items-center gap-3 overflow-x-auto text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-500 font-bold uppercase text-[10px]">Voyage Telemetry</span>
          </div>

          {activeRoute && (
            <>
              <div className="flex items-center gap-1 px-2 py-0.5 bg-white border border-slate-200 rounded-md text-[11px]">
                <Shield className="w-3 h-3 text-emerald-400" />
                <span className="text-slate-500">Safety:</span>
                <span className="font-bold text-emerald-700 font-mono">{activeRoute.safetyScore}/100</span>
              </div>

              <div className="flex items-center gap-1 px-2 py-0.5 bg-white border border-slate-200 rounded-md text-[11px]">
                <Flame className="w-3 h-3 text-amber-400" />
                <span className="text-slate-500">Fuel:</span>
                <span className="font-bold text-amber-700 font-mono">{activeRoute.fuelPercentageOfCapacity}%</span>
              </div>

              <div className="flex items-center gap-1 px-2 py-0.5 bg-white border border-slate-200 rounded-md text-[11px]">
                <Navigation className="w-3 h-3 text-sky-600" />
                <span className="text-slate-500">ETA:</span>
                <span className="font-bold text-slate-900 font-mono">
                  {activeRoute.totalDistanceKm} km ({(activeRoute.estimatedTravelTimeHours / 24).toFixed(1)}d)
                </span>
              </div>

              <div className="flex items-center gap-1 px-2 py-0.5 bg-white border border-slate-200 rounded-md text-[11px]">
                <span className="text-slate-500">CPA:</span>
                <span className="font-bold text-red-700 font-mono">{activeRoute.closestIcebergCpaNm} NM</span>
              </div>
            </>
          )}

          {primaryAlert && (
            <div className="flex items-center gap-1 px-2 py-0.5 bg-red-50 border border-red-200 text-red-700 rounded-md text-[11px] font-semibold">
              <AlertTriangle className="w-3 h-3 text-rose-400 animate-pulse" />
              <span className="truncate max-w-[200px]">{primaryAlert.title}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={onOpenRouteComparison}
            className="px-2.5 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-[11px] font-bold transition flex items-center gap-1"
          >
            <span>Compare Routes</span>
            <ArrowRight className="w-3 h-3" />
          </button>
          <button
            id="btn-expand-telemetry"
            onClick={() => setIsMinimized(false)}
            className="p-1 hover:bg-slate-50 text-slate-600 hover:text-sky-600 rounded-lg transition text-[11px] flex items-center gap-1 px-2 border border-slate-200"
            title="Expand Full Telemetry HUD"
          >
            <ChevronUp className="w-3.5 h-3.5" />
            <span>Expand HUD</span>
          </button>
          <button
            onClick={() => setIsDismissed(true)}
            className="p-1 hover:bg-slate-50 text-slate-500 hover:text-slate-900 rounded-lg transition"
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
      className="bg-white border-t border-slate-200 text-slate-900 px-3 py-2.5 select-none shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 z-20 transition-all duration-200"
    >
      {/* 1. Environmental Telemetry Snapshot Cards (Compact Row) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 flex-shrink-0">
        {/* Sea Ice Concentration Exposure */}
        <div className="bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[9px] text-slate-400 uppercase font-semibold">Ice Exposure</span>
            <span className="text-[9px] text-sky-600 font-mono">AMSR2</span>
          </div>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xs font-bold text-sky-600">
              {activeRoute ? `${activeRoute.seaIceExposureKm} km` : '48 km'}
            </span>
            <span className="text-[9px] text-slate-500">
              {activeRoute && activeRoute.seaIceExposureKm > 100 ? 'HEAVY' : 'MOD'}
            </span>
          </div>
        </div>

        {/* Iceberg Proximity (CPA) */}
        <div className="bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[9px] text-slate-500 uppercase font-semibold">Iceberg CPA</span>
            <span className="text-[9px] text-red-600 font-mono">US-NIC</span>
          </div>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span
              className={`text-xs font-bold ${
                activeRoute && activeRoute.closestIcebergCpaNm < 20
                  ? 'text-red-700 animate-pulse'
                  : 'text-emerald-700'
              }`}
            >
              {activeRoute ? `${activeRoute.closestIcebergCpaNm} NM` : '28.4 NM'}
            </span>
            <span className="text-[9px] text-slate-500">BUFFER</span>
          </div>
        </div>

        {/* Metocean Wind & Wave */}
        <div className="bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[9px] text-slate-500 uppercase font-semibold">Wind & Wave</span>
            <span className="text-[9px] text-amber-700 font-mono">ECMWF</span>
          </div>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xs font-bold text-amber-700">38 km/h</span>
            <span className="text-[9px] text-slate-500">3.2m</span>
          </div>
        </div>

        {/* Ocean Current Streamlines */}
        <div className="bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[9px] text-slate-500 uppercase font-semibold">ACC Current</span>
            <span className="text-[9px] text-sky-600 font-mono">HYCOM</span>
          </div>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xs font-bold text-sky-600">1.2 kts</span>
            <span className="text-[9px] text-slate-500">E-WARD</span>
          </div>
        </div>
      </div>

      {/* 2. Active Route Safety, Fuel & ETA Command HUD */}
      {activeRoute ? (
        <div className="flex-1 bg-white border border-slate-200 px-3 py-2 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            {/* Safety Score with Radial/Pill Glow */}
            <div className="flex items-center gap-1.5">
              <div className="p-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700">
                <Shield className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-[9px] text-slate-500 uppercase font-semibold block">Safety Index</span>
                <span className="text-xs font-bold text-emerald-700 font-mono">
                  {activeRoute.safetyScore}<span className="text-[10px] text-slate-500">/100</span>
                </span>
              </div>
            </div>

            <div className="h-6 w-px bg-slate-200 hidden sm:block" />

            {/* Fuel Consumption */}
            <div className="flex items-center gap-1.5">
              <div className="p-1 rounded-md bg-amber-50 border border-amber-200 text-amber-700">
                <Flame className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-[9px] text-slate-500 uppercase font-semibold block">Est. Fuel</span>
                <span className="text-xs font-bold text-amber-700 font-mono">
                  {activeRoute.fuelPercentageOfCapacity}%{' '}
                  <span className="text-[9px] text-slate-500">({Math.round(activeRoute.estimatedFuelConsumptionL / 1000)} kL)</span>
                </span>
              </div>
            </div>

            <div className="h-6 w-px bg-slate-200 hidden lg:block" />

            {/* Distance & ETA */}
            <div className="hidden lg:flex items-center gap-1.5">
              <div className="p-1 rounded-md bg-sky-50 border border-sky-200 text-sky-600">
                <Navigation className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-[9px] text-slate-500 uppercase font-semibold block">Transit ETA</span>
                <span className="text-xs font-bold text-slate-900 font-mono">
                  {activeRoute.totalDistanceKm} km{' '}
                  <span className="text-[9px] text-sky-600">({(activeRoute.estimatedTravelTimeHours / 24).toFixed(1)}d)</span>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action Navigation CTAs */}
          <div className="flex items-center gap-1.5">
            <button
              id="btn-open-route-xai"
              onClick={onOpenExplainableAI}
              className="px-2.5 py-1 bg-white hover:bg-slate-50 text-sky-600 border border-slate-200 hover:border-sky-300 rounded-lg text-xs font-semibold transition flex items-center gap-1 shadow-sm"
            >
              <Info className="w-3 h-3" />
              <span>Explain</span>
            </button>
            <button
              id="btn-open-route-compare"
              onClick={onOpenRouteComparison}
              className="px-3 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-sm active:scale-95"
            >
              <span>Compare Routes</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 bg-white border border-slate-200 px-3 py-2 rounded-xl flex items-center justify-center text-slate-500 text-xs shadow-sm">
          Computing Polar Passage Waypoints...
        </div>
      )}

      {/* 3. Real-Time Alert Ribbon */}
      {primaryAlert && (
        <div
          id="active-alert-ribbon"
          className={`flex-shrink-0 px-2.5 py-1 rounded-xl border flex items-center justify-between gap-2 max-w-xs ${
            primaryAlert.type === 'CRITICAL'
              ? 'bg-red-50 border-red-200 text-red-700 shadow-sm'
              : primaryAlert.type === 'WARNING'
              ? 'bg-amber-50 border-amber-200 text-amber-700 shadow-sm'
              : 'bg-white border-slate-200 text-slate-700 shadow-sm'
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
              className="px-1.5 py-0.5 bg-white hover:bg-slate-50 text-[9px] font-bold text-slate-700 rounded border border-slate-300 flex-shrink-0 transition"
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
          className="p-1.5 hover:bg-slate-50 text-slate-500 hover:text-sky-600 rounded-lg transition border border-slate-200"
          title="Minimize Telemetry HUD (More Map Space)"
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => setIsDismissed(true)}
          className="p-1.5 hover:bg-slate-50 text-slate-500 hover:text-slate-900 rounded-lg transition border border-slate-200"
          title="Hide Telemetry HUD"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
