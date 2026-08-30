import React, { useState } from 'react';
import { IcebergObservation, IcebergForecast, VesselProfile } from '../types';
import { IcebergAnimationPlayer } from '../components/icebergs/IcebergAnimationPlayer';
import {
  Film,
  Search,
  Filter,
  Layers,
  Compass,
  AlertTriangle,
  ExternalLink,
  Shield,
  Activity,
  Calendar,
  CheckCircle,
  HelpCircle,
  Sparkles,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { formatPolarCoordinates } from '../utils/geoUtils';

interface IcebergTrackerPageProps {
  icebergs: IcebergObservation[];
  vessel: VesselProfile;
  onSimulateDriftSpike: (icebergId: string) => void;
  onSelectIcebergOnMap?: (icebergId: string) => void;
}

export const IcebergTrackerPage: React.FC<IcebergTrackerPageProps> = ({
  icebergs,
  vessel,
  onSimulateDriftSpike,
  onSelectIcebergOnMap,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedQuadrant, setSelectedQuadrant] = useState<string>('ALL');
  const [selectedRisk, setSelectedRisk] = useState<string>('ALL');
  const [selectedBergId, setSelectedBergId] = useState<string>(icebergs[0]?.id || 'A23A');
  const [showHelpGuide, setShowHelpGuide] = useState<boolean>(true);

  // Filtered list
  const filteredIcebergs = icebergs.filter((berg) => {
    const matchesSearch =
      berg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      berg.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      berg.calvingSource.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesQuadrant =
      selectedQuadrant === 'ALL' || berg.quadrant === selectedQuadrant;
    const matchesRisk =
      selectedRisk === 'ALL' || berg.riskRating === selectedRisk;
    return matchesSearch && matchesQuadrant && matchesRisk;
  });

  const activeBerg =
    icebergs.find((b) => b.id === selectedBergId) || icebergs[0] || null;

  // Aggregate stats
  const totalArea = icebergs.reduce((acc, b) => acc + b.areaKm2, 0);
  const avgSpeed = (
    icebergs.reduce((acc, b) => acc + b.speedKnots, 0) / (icebergs.length || 1)
  ).toFixed(1);
  const highRiskCount = icebergs.filter(
    (b) => b.riskRating === 'HIGH' || b.riskRating === 'EXTREME'
  ).length;

  return (
    <div
      id="iceberg-tracker-animation-page"
      className="flex-1 flex flex-col h-full bg-[#040A15] text-slate-100 overflow-y-auto p-4 md:p-6 space-y-5"
    >
      {/* Top Header & Educational Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-cyan-900/40 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-lg shadow-md">
              🧊
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-100 font-sans tracking-tight">
                  NASA SCP Iceberg Tracker & Movement Animations
                </h1>
                <span className="text-[10px] px-2.5 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-500/40 rounded-full font-mono font-semibold">
                  Live Satellite Feeds
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Scatterometer Climate Record Pathfinder (SCP) dataset, BYU tracking database, and Sentinel-1 radar movement time-lapse.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Links & Sources */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <a
            href="https://joel-hanson.github.io/Iceberg-locations/"
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 bg-[#081730] hover:bg-[#0E2A54] border border-cyan-500/30 text-cyan-300 rounded-xl transition flex items-center gap-1.5"
          >
            <span>Joel Hanson Tracker</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <a
            href="https://www.scp.byu.edu/data/ice_tracking/antarctic.html"
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 bg-[#081730] hover:bg-[#0E2A54] border border-cyan-500/30 text-cyan-300 rounded-xl transition flex items-center gap-1.5"
          >
            <span>NASA BYU SCP Portal</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Easy-to-Understand Step-by-Step UI/UX Guide */}
      {showHelpGuide && (
        <div className="bg-gradient-to-r from-[#07172F] via-[#051124] to-[#07172F] border border-cyan-500/30 p-3.5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs shadow-lg relative">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-slate-200 block text-xs">
                How Antarctic Iceberg Tracking Works:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-1.5 text-slate-300 text-[11px]">
                <div className="flex items-start gap-1.5">
                  <span className="font-bold text-cyan-400">1. Satellite SAR:</span>
                  <span>Spaceborne radar penetrates polar cloud cover to measure iceberg perimeter & area.</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="font-bold text-cyan-400">2. Scatterometer Motion:</span>
                  <span>NASA BYU SCP records multi-month animations of iceberg drift patterns.</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="font-bold text-cyan-400">3. Vessel Proximity:</span>
                  <span>Our AI model projects +72h drift vectors to keep vessel routes clear of collisions.</span>
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowHelpGuide(false)}
            className="text-slate-400 hover:text-slate-200 text-[11px] underline flex-shrink-0"
          >
            Hide Guide
          </button>
        </div>
      )}

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-[#061224] p-3 rounded-xl border border-cyan-500/20 shadow-md">
          <span className="text-slate-400 text-[10px] uppercase font-semibold block">Tracked Icebergs</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-bold text-slate-100 font-mono">{icebergs.length}</span>
            <span className="text-[10px] text-cyan-400">Major Bergs</span>
          </div>
          <span className="text-[10px] text-slate-500 block mt-0.5">Quadrants A, B, C, D</span>
        </div>

        <div className="bg-[#061224] p-3 rounded-xl border border-cyan-500/20 shadow-md">
          <span className="text-slate-400 text-[10px] uppercase font-semibold block">Total Ice Surface Area</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-bold text-cyan-300 font-mono">{Math.round(totalArea).toLocaleString()}</span>
            <span className="text-[10px] text-slate-400">km²</span>
          </div>
          <span className="text-[10px] text-slate-500 block mt-0.5">A23A is largest (1,428 km²)</span>
        </div>

        <div className="bg-[#061224] p-3 rounded-xl border border-cyan-500/20 shadow-md">
          <span className="text-slate-400 text-[10px] uppercase font-semibold block">Average Drift Speed</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-bold text-emerald-300 font-mono">{avgSpeed}</span>
            <span className="text-[10px] text-slate-400">knots</span>
          </div>
          <span className="text-[10px] text-slate-500 block mt-0.5">Driven by Circumpolar Current</span>
        </div>

        <div className="bg-[#061224] p-3 rounded-xl border border-rose-500/30 shadow-md">
          <span className="text-slate-400 text-[10px] uppercase font-semibold block">High/Extreme Hazard Bergs</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-bold text-rose-400 font-mono">{highRiskCount}</span>
            <span className="text-[10px] text-slate-400">monitored</span>
          </div>
          <span className="text-[10px] text-rose-300/80 block mt-0.5">Active CPA warnings</span>
        </div>
      </div>

      {/* Main Content Layout: Left Master List + Right Full Animation Player & Telemetry Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left 5 Cols: Search, Filters & Iceberg Cards */}
        <div className="lg:col-span-5 space-y-3">
          {/* Search & Filter Controls */}
          <div className="bg-[#061224] p-3 rounded-2xl border border-cyan-500/20 space-y-2.5 shadow-md">
            {/* Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search iceberg name (e.g. A23A, C18B, A76)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#030812] border border-cyan-500/30 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            {/* Quadrant & Risk Filter Pills */}
            <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
              {/* Quadrant filter */}
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-slate-400">Sector:</span>
                {['ALL', 'A', 'B', 'C', 'D'].map((q) => (
                  <button
                    key={q}
                    onClick={() => setSelectedQuadrant(q)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-mono transition ${
                      selectedQuadrant === q
                        ? 'bg-cyan-500 text-slate-950 font-bold'
                        : 'bg-[#030812] text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {q === 'ALL' ? 'All' : `Q-${q}`}
                  </button>
                ))}
              </div>

              {/* Risk filter */}
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-slate-400">Risk:</span>
                {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map((r) => (
                  <button
                    key={r}
                    onClick={() => setSelectedRisk(r)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-mono transition ${
                      selectedRisk === r
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'bg-[#030812] text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Iceberg Card List */}
          <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
            {filteredIcebergs.length === 0 ? (
              <div className="p-8 text-center bg-[#061224] rounded-2xl border border-dashed border-slate-700 text-slate-400 text-xs">
                No icebergs match the filter query. Try selecting "All".
              </div>
            ) : (
              filteredIcebergs.map((berg) => {
                const isSelected = berg.id === activeBerg?.id;
                return (
                  <div
                    key={berg.id}
                    onClick={() => setSelectedBergId(berg.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer select-none ${
                      isSelected
                        ? 'bg-[#091D3E] border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                        : 'bg-[#061224] hover:bg-[#0A1A33] border-cyan-500/20'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-base">🧊</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-100 font-mono">
                              {berg.name}
                            </span>
                            {berg.quadrant && (
                              <span className="text-[9px] px-1.5 py-0.2 bg-blue-950 text-blue-300 border border-blue-500/30 rounded font-mono">
                                Q-{berg.quadrant}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 block truncate max-w-[220px]">
                            {berg.calvingSource}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`text-[9px] px-2 py-0.5 rounded-full font-mono font-bold ${
                          berg.riskRating === 'EXTREME'
                            ? 'bg-rose-950 text-rose-300 border border-rose-500/50'
                            : berg.riskRating === 'HIGH'
                            ? 'bg-amber-950 text-amber-300 border border-amber-500/50'
                            : berg.riskRating === 'MEDIUM'
                            ? 'bg-yellow-950 text-yellow-300 border border-yellow-500/50'
                            : 'bg-cyan-950 text-cyan-300 border border-cyan-500/50'
                        }`}
                      >
                        {berg.riskRating}
                      </span>
                    </div>

                    {/* Meta info row */}
                    <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-slate-800/80 text-[11px] font-mono">
                      <div>
                        <span className="text-[9px] text-slate-500 block">Position</span>
                        <span className="text-cyan-300 text-[10px] truncate block">
                          {berg.dmsLat ? `${berg.dmsLat}` : `${berg.currentPosition.lat.toFixed(1)}°S`}
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 block">Area</span>
                        <span className="text-slate-200 text-[10px]">{berg.areaKm2} km²</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 block">Drift</span>
                        <span className="text-emerald-300 text-[10px]">{berg.speedKnots} kts</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right 7 Cols: Selected Iceberg Detail, Animation Replay Player & Collision Drill */}
        {activeBerg && (
          <div className="lg:col-span-7 space-y-4">
            {/* 1. Iceberg Movement Animation Player Component */}
            <IcebergAnimationPlayer iceberg={activeBerg} />

            {/* 2. Detailed Technical & Calving Dossier */}
            <div className="bg-[#061224] p-4 rounded-2xl border border-cyan-500/20 space-y-3 shadow-md">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-cyan-400" />
                  Satellite Observation Dossier & Coordinate Fixes
                </span>
                <span className="text-[10px] text-cyan-300 font-mono">
                  SAR Pass: {activeBerg.lastObservedDate}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div className="bg-[#030812] p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">DMS Coordinates</span>
                  <span className="font-bold text-cyan-300 font-mono text-[11px]">
                    {activeBerg.dmsLat || '60°51\'S'}, {activeBerg.dmsLon || '46°12\'W'}
                  </span>
                </div>
                <div className="bg-[#030812] p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Decimal Degrees</span>
                  <span className="font-bold text-slate-200 font-mono text-[11px]">
                    {activeBerg.currentPosition.lat.toFixed(3)}°, {activeBerg.currentPosition.lon.toFixed(3)}°
                  </span>
                </div>
                <div className="bg-[#030812] p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Physical Geometry</span>
                  <span className="font-bold text-slate-200 font-mono text-[11px]">
                    {activeBerg.lengthKm}km x {activeBerg.widthKm}km
                  </span>
                </div>
                <div className="bg-[#030812] p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Underkeel Draft</span>
                  <span className="font-bold text-amber-300 font-mono text-[11px]">
                    {activeBerg.estimatedDraftM}m Draft
                  </span>
                </div>
              </div>

              {/* Historical Track Timeline if available */}
              {activeBerg.historyTrack && activeBerg.historyTrack.length > 0 && (
                <div className="space-y-1.5 pt-2">
                  <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-cyan-400" />
                    Historical Drift Milestones:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] font-mono">
                    {activeBerg.historyTrack.map((h, i) => (
                      <div
                        key={i}
                        className="bg-[#030812] px-2.5 py-1.5 rounded-lg border border-slate-800/80 flex items-center justify-between text-slate-300"
                      >
                        <span className="font-bold text-cyan-300">{h.date}</span>
                        <span>{h.lat.toFixed(2)}°S, {h.lon.toFixed(2)}°W</span>
                        <span className="text-emerald-400">{h.speedKnots} kts</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons: Simulate Drift Surge or View on Map */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
                <button
                  onClick={() => onSimulateDriftSpike(activeBerg.id)}
                  className="px-3.5 py-1.5 bg-rose-950 hover:bg-rose-900 text-rose-200 border border-rose-500/50 rounded-xl text-xs font-semibold transition flex items-center gap-2 active:scale-95"
                >
                  <Activity className="w-3.5 h-3.5 text-rose-400" />
                  <span>Simulate Drift Surge (+1.2 kts into Route)</span>
                </button>

                <div className="text-[11px] text-slate-400">
                  Data Provider: <strong className="text-slate-200">{activeBerg.dataSource}</strong>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
