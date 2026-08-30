import React from 'react';
import { RouteWaypoint } from '../../types';
import { formatPolarCoordinates } from '../../utils/geoUtils';
import { X, Navigation, Shield, Wind, Waves, AlertTriangle, Sparkles } from 'lucide-react';

interface WaypointModalProps {
  waypoint: RouteWaypoint | null;
  onClose: () => void;
}

export const WaypointModal: React.FC<WaypointModalProps> = ({ waypoint, onClose }) => {
  if (!waypoint) return null;

  return (
    <div
      id="waypoint-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="waypoint-modal-panel"
        className="bg-[#071326] border border-cyan-500/30 text-slate-100 rounded-2xl max-w-lg w-full p-5 shadow-2xl space-y-4 text-xs"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-cyan-900/30 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-cyan-950 border border-cyan-500/40 text-cyan-300 shadow-md">
              <Navigation className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-tight">
                Route Waypoint #{waypoint.index}
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Fix: {formatPolarCoordinates(waypoint)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-2 rounded-xl hover:bg-[#0B1E38] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2.5 text-xs">
          <div className="bg-[#050D1A] p-2.5 rounded-xl border border-cyan-500/20">
            <span className="text-slate-400 block text-[10px]">Cumulative Distance</span>
            <span className="font-semibold text-cyan-300 font-mono">
              {waypoint.cumulativeDistanceKm} km ({(waypoint.cumulativeDistanceKm * 0.539957).toFixed(1)} NM)
            </span>
          </div>
          <div className="bg-[#050D1A] p-2.5 rounded-xl border border-cyan-500/20">
            <span className="text-slate-400 block text-[10px]">Passage Time (ETA)</span>
            <span className="font-semibold text-slate-100 font-mono">
              +{waypoint.estimatedTimeHours} hours
            </span>
          </div>
          <div className="bg-[#050D1A] p-2.5 rounded-xl border border-cyan-500/20">
            <span className="text-slate-400 block text-[10px]">Segment Risk Score</span>
            <span
              className={`font-semibold font-mono ${
                waypoint.segmentRiskScore > 60
                  ? 'text-rose-400'
                  : waypoint.segmentRiskScore > 35
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }`}
            >
              {waypoint.segmentRiskScore}/100 ({waypoint.segmentRiskCategory})
            </span>
          </div>
          <div className="bg-[#050D1A] p-2.5 rounded-xl border border-cyan-500/20">
            <span className="text-slate-400 block text-[10px]">Sea-Ice Concentration</span>
            <span className="font-semibold text-sky-300 font-mono">
              {waypoint.expectedSeaIceConcentration}%
            </span>
          </div>
          <div className="bg-[#050D1A] p-2.5 rounded-xl border border-cyan-500/20">
            <span className="text-slate-400 block text-[10px]">Wind & Swell</span>
            <span className="font-semibold text-slate-200 font-mono">
              {waypoint.windSpeedKmh} km/h | {waypoint.waveHeightM}m swell
            </span>
          </div>
          <div className="bg-[#050D1A] p-2.5 rounded-xl border border-cyan-500/20">
            <span className="text-slate-400 block text-[10px]">Nearest Iceberg CPA</span>
            <span className="font-semibold text-amber-300 font-mono">
              {waypoint.icebergCpaNm} NM
            </span>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 border-t border-cyan-900/30 pt-2.5 flex justify-between">
          <span>Polar Code PC5 Safe Corridor</span>
          <span className="text-cyan-400 font-semibold">Hydrodynamically Cleared</span>
        </div>
      </div>
    </div>
  );
};
