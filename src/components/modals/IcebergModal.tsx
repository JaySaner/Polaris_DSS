import React, { useState } from 'react';
import { IcebergObservation, IcebergForecast } from '../../types';
import { formatPolarCoordinates } from '../../utils/geoUtils';
import {
  X,
  AlertTriangle,
  Compass,
  Navigation,
  Shield,
  Activity,
  Clock,
  Sparkles,
  Film,
  ExternalLink,
  Info,
} from 'lucide-react';
import { IcebergAnimationPlayer } from '../icebergs/IcebergAnimationPlayer';

interface IcebergModalProps {
  iceberg: IcebergObservation | null;
  forecast: IcebergForecast | null;
  onClose: () => void;
  onSimulateDriftSpike?: (icebergId: string) => void;
}

export const IcebergModal: React.FC<IcebergModalProps> = ({
  iceberg,
  forecast,
  onClose,
  onSimulateDriftSpike,
}) => {
  const [activeModalTab, setActiveModalTab] = useState<'overview' | 'animation' | 'trajectory'>(
    'overview'
  );

  if (!iceberg || !forecast) return null;

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case 'EXTREME':
        return 'bg-rose-950 text-rose-300 border-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.3)]';
      case 'HIGH':
        return 'bg-amber-950 text-amber-300 border-amber-500';
      case 'MEDIUM':
        return 'bg-yellow-950 text-yellow-300 border-yellow-500';
      default:
        return 'bg-cyan-950 text-cyan-300 border-cyan-500';
    }
  };

  return (
    <div
      id="iceberg-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="iceberg-modal-panel"
        className="bg-[#071326] border border-cyan-500/30 text-slate-100 rounded-2xl max-w-2xl w-full p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-cyan-900/30 pb-3">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xl shadow-md">
              🧊
            </span>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-base font-bold text-slate-100 font-mono tracking-tight">
                  {iceberg.name}
                </h3>
                <span
                  className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${getRiskBadgeColor(
                    iceberg.riskRating
                  )}`}
                >
                  {iceberg.riskRating} RISK
                </span>
                {iceberg.quadrant && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-blue-950 text-blue-300 border border-blue-500/30">
                    Quadrant {iceberg.quadrant}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Calving Origin: {iceberg.calvingSource}
              </p>
            </div>
          </div>
          <button
            id="btn-close-iceberg-modal"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-2 rounded-xl hover:bg-[#0B1E38] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Navigation Tabs (Overview / Satellite Animation / Forecast) */}
        <div className="flex items-center gap-1.5 p-1 bg-[#040C1A] border border-cyan-900/40 rounded-xl text-xs">
          <button
            onClick={() => setActiveModalTab('overview')}
            className={`flex-1 py-1.5 px-3 rounded-lg font-semibold transition flex items-center justify-center gap-1.5 ${
              activeModalTab === 'overview'
                ? 'bg-cyan-600 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            <span>Overview & Proximity</span>
          </button>
          <button
            onClick={() => setActiveModalTab('animation')}
            className={`flex-1 py-1.5 px-3 rounded-lg font-semibold transition flex items-center justify-center gap-1.5 ${
              activeModalTab === 'animation'
                ? 'bg-cyan-600 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>Satellite Drift Animation</span>
          </button>
          <button
            onClick={() => setActiveModalTab('trajectory')}
            className={`flex-1 py-1.5 px-3 rounded-lg font-semibold transition flex items-center justify-center gap-1.5 ${
              activeModalTab === 'trajectory'
                ? 'bg-cyan-600 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>72h AI Forecast Table</span>
          </button>
        </div>

        {/* Tab 1: Overview & Proximity */}
        {activeModalTab === 'overview' && (
          <div className="space-y-3.5">
            {/* Current Position & Physical Dimensions */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="bg-[#050D1A] p-2.5 rounded-xl border border-cyan-500/20">
                <span className="text-slate-400 block text-[10px]">Position (Lat/Lon)</span>
                <span className="font-semibold text-cyan-300 font-mono">
                  {iceberg.dmsLat && iceberg.dmsLon
                    ? `${iceberg.dmsLat}, ${iceberg.dmsLon}`
                    : formatPolarCoordinates(iceberg.currentPosition)}
                </span>
                <span className="text-[9px] text-slate-500 block">
                  {iceberg.currentPosition.lat.toFixed(2)}°, {iceberg.currentPosition.lon.toFixed(2)}°
                </span>
              </div>
              <div className="bg-[#050D1A] p-2.5 rounded-xl border border-cyan-500/20">
                <span className="text-slate-400 block text-[10px]">Dimensions & Area</span>
                <span className="font-semibold text-slate-200 font-mono">
                  {iceberg.lengthKm} x {iceberg.widthKm} km
                </span>
                <span className="text-[9px] text-slate-400 block">{iceberg.areaKm2} km² footprint</span>
              </div>
              <div className="bg-[#050D1A] p-2.5 rounded-xl border border-cyan-500/20">
                <span className="text-slate-400 block text-[10px]">Drift Velocity</span>
                <span className="font-semibold text-emerald-400 font-mono">
                  {iceberg.speedKnots} kts @ {iceberg.driftHeadingDeg}°
                </span>
                <span className="text-[9px] text-slate-400 block">
                  {(iceberg.speedKnots * 1.852).toFixed(1)} km/h
                </span>
              </div>
              <div className="bg-[#050D1A] p-2.5 rounded-xl border border-cyan-500/20">
                <span className="text-slate-400 block text-[10px]">Estimated Draft</span>
                <span className="font-semibold text-slate-200 font-mono">
                  {iceberg.estimatedDraftM}m submerged
                </span>
                <span className="text-[9px] text-slate-400 block">+{iceberg.heightAboveWaterM}m freeboard</span>
              </div>
            </div>

            {/* Route Collision / CPA Risk Assessment */}
            <div className="bg-gradient-to-r from-[#1A0A14] to-[#0D1526] border border-rose-500/40 p-3.5 rounded-xl space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-rose-300 flex items-center gap-2 text-[11px] uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  Route Proximity & Closest Point of Approach (CPA)
                </span>
                <span className="font-mono text-cyan-300 text-xs font-semibold">
                  Model Confidence: {(forecast.modelConfidence * 100).toFixed(0)}%
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 font-mono text-xs">
                <div>
                  <span className="text-slate-400">Closest Approach: </span>
                  <span className="font-bold text-amber-300">
                    {forecast.closestPointOfApproachNm !== undefined
                      ? `${forecast.closestPointOfApproachNm} NM`
                      : 'Clear (>50 NM)'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Time to CPA: </span>
                  <span className="font-semibold text-slate-100">
                    {forecast.timeToCpaHours !== undefined ? `+${forecast.timeToCpaHours} Hours` : 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Data Feed: </span>
                  <span className="font-semibold text-cyan-300">{iceberg.dataSource}</span>
                </div>
              </div>
            </div>

            {/* Quick Preview of Satellite Animation */}
            <div className="p-3 bg-[#050D1A] border border-cyan-500/20 rounded-xl flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Film className="w-4 h-4 text-cyan-400" />
                <div>
                  <span className="font-bold text-slate-200 block">NASA SCP Scatterometer Movement Track</span>
                  <span className="text-[11px] text-slate-400">
                    Historical satellite animation available from BYU Climate Pathfinder
                  </span>
                </div>
              </div>
              <button
                onClick={() => setActiveModalTab('animation')}
                className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-lg transition text-xs flex items-center gap-1"
              >
                <span>Watch Animation</span>
                <Film className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Satellite Drift Animation Player */}
        {activeModalTab === 'animation' && (
          <div className="space-y-3">
            <IcebergAnimationPlayer iceberg={iceberg} forecast={forecast} />
          </div>
        )}

        {/* Tab 3: Predicted Trajectory Horizons Table */}
        {activeModalTab === 'trajectory' && (
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              AI/ML Trajectory Forecast Horizons (XGBoost + Hydrodynamic Model)
            </h4>
            <div className="overflow-x-auto border border-cyan-500/20 rounded-xl bg-[#050D1A]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#030914] text-slate-400 border-b border-cyan-900/30 text-[10px] uppercase">
                  <tr>
                    <th className="p-2.5">Horizon</th>
                    <th className="p-2.5">Predicted Position</th>
                    <th className="p-2.5">Speed</th>
                    <th className="p-2.5">Heading</th>
                    <th className="p-2.5">Uncertainty Cone</th>
                    <th className="p-2.5">Route Risk</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 font-mono">
                  {forecast.trajectory.map((tp) => (
                    <tr key={tp.hourOffset} className="hover:bg-[#0A1F3C]/40 transition">
                      <td className="p-2.5 font-bold text-cyan-300">+{tp.hourOffset}h</td>
                      <td className="p-2.5 text-slate-200">
                        {tp.lat.toFixed(3)}°S, {tp.lon.toFixed(3)}°E
                      </td>
                      <td className="p-2.5 text-slate-300">{tp.predictedSpeedKnots} kts</td>
                      <td className="p-2.5 text-slate-300">{tp.predictedHeadingDeg}°</td>
                      <td className="p-2.5 text-slate-400">±{tp.confidenceRadiusKm} km</td>
                      <td className="p-2.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            tp.riskToActiveRoute === 'HIGH'
                              ? 'bg-rose-950 text-rose-200 border border-rose-500/50'
                              : tp.riskToActiveRoute === 'MEDIUM'
                              ? 'bg-amber-950 text-amber-200 border border-amber-500/50'
                              : 'bg-emerald-950 text-emerald-200 border border-emerald-500/50'
                          }`}
                        >
                          {tp.riskToActiveRoute}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Footer & Live Simulation Trigger */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-cyan-900/30 text-xs">
          <span className="text-slate-400 font-mono text-[11px]">
            Last Synced SAR Pass: {iceberg.lastObservedDate}
          </span>
          {onSimulateDriftSpike && (
            <button
              id="btn-simulate-berg-drift"
              onClick={() => onSimulateDriftSpike(iceberg.id)}
              className="px-3.5 py-1.5 bg-rose-950 hover:bg-rose-900 text-rose-200 border border-rose-500/60 rounded-xl text-xs font-semibold transition flex items-center gap-2 active:scale-95 shadow-md"
            >
              <Activity className="w-4 h-4 text-rose-400" />
              <span>Simulate Surge Drift (+0.8 kts)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
