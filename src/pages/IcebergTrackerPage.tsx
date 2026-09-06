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
      className="flex-1 flex flex-col h-full bg-slate-50 text-slate-900 overflow-y-auto p-4 md:p-6 space-y-5"
    >
      {/* Top Header & Educational Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-sky-50 border border-sky-200 text-sky-600 text-lg shadow-sm">
              🧊
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 font-sans tracking-tight">
                  NASA SCP Iceberg Tracker & Movement Animations
                </h1>
                <span className="text-[10px] px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-mono font-semibold">
                  Live Satellite Feeds
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
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
            className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-sky-600 rounded-xl shadow-sm transition flex items-center gap-1.5"
          >
            <span>Joel Hanson Tracker</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <a
            href="https://www.scp.byu.edu/data/ice_tracking/antarctic.html"
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-sky-600 rounded-xl shadow-sm transition flex items-center gap-1.5"
          >
            <span>NASA BYU SCP Portal</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Easy-to-Understand Step-by-Step UI/UX Guide */}
      {showHelpGuide && (
        <div className="bg-white border border-slate-200 p-3.5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs shadow-sm relative">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-sky-50 border border-sky-200 text-sky-600 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
                <span className="font-bold text-slate-900 block text-xs">
                How Antarctic Iceberg Tracking Works:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-1.5 text-slate-500 text-[11px]">
                <div className="flex items-start gap-1.5">
                  <span className="font-bold text-sky-600">1. Satellite SAR:</span>
                  <span>Spaceborne radar penetrates polar cloud cover to measure iceberg perimeter & area.</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="font-bold text-sky-600">2. Scatterometer Motion:</span>
                  <span>NASA BYU SCP records multi-month animations of iceberg drift patterns.</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="font-bold text-sky-600">3. Vessel Proximity:</span>
                  <span>Our AI model projects +72h drift vectors to keep vessel routes clear of collisions.</span>
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowHelpGuide(false)}
            className="text-slate-500 hover:text-slate-900 text-[11px] underline flex-shrink-0"
          >
            Hide Guide
          </button>
        </div>
      )}

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-slate-500 text-[10px] uppercase font-semibold block">Tracked Icebergs</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-bold text-slate-900 font-mono">{icebergs.length}</span>
            <span className="text-[10px] text-sky-600">Major Bergs</span>
          </div>
          <span className="text-[10px] text-slate-500 block mt-0.5">Quadrants A, B, C, D</span>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-slate-500 text-[10px] uppercase font-semibold block">Total Ice Surface Area</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-bold text-sky-600 font-mono">{Math.round(totalArea).toLocaleString()}</span>
            <span className="text-[10px] text-slate-500">km²</span>
          </div>
          <span className="text-[10px] text-slate-500 block mt-0.5">A23A is largest (1,428 km²)</span>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-slate-500 text-[10px] uppercase font-semibold block">Average Drift Speed</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-bold text-emerald-700 font-mono">{avgSpeed}</span>
            <span className="text-[10px] text-slate-500">knots</span>
          </div>
          <span className="text-[10px] text-slate-500 block mt-0.5">Driven by Circumpolar Current</span>
        </div>

        <div className="bg-white p-3 rounded-xl border border-red-200 shadow-sm">
          <span className="text-slate-500 text-[10px] uppercase font-semibold block">High/Extreme Hazard Bergs</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-bold text-red-700 font-mono">{highRiskCount}</span>
            <span className="text-[10px] text-slate-500">monitored</span>
          </div>
          <span className="text-[10px] text-red-700 block mt-0.5">Active CPA warnings</span>
        </div>
      </div>

      {/* Main Content Layout: Left Master List + Right Full Animation Player & Telemetry Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left 5 Cols: Search, Filters & Iceberg Cards */}
        <div className="lg:col-span-5 space-y-3">
          {/* Search & Filter Controls */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200 space-y-2.5 shadow-sm">
            {/* Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search iceberg name (e.g. A23A, C18B, A76)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-200"
              />
            </div>

            {/* Quadrant & Risk Filter Pills */}
            <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
              {/* Quadrant filter */}
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-slate-500">Sector:</span>
                {['ALL', 'A', 'B', 'C', 'D'].map((q) => (
                  <button
                    key={q}
                    onClick={() => setSelectedQuadrant(q)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-mono transition ${
                      selectedQuadrant === q
                        ? 'bg-sky-600 text-white font-bold'
                        : 'bg-white text-slate-500 hover:text-slate-900 border border-slate-200'
                    }`}
                  >
                    {q === 'ALL' ? 'All' : `Q-${q}`}
                  </button>
                ))}
              </div>

              {/* Risk filter */}
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-slate-500">Risk:</span>
                {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map((r) => (
                  <button
                    key={r}
                    onClick={() => setSelectedRisk(r)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-mono transition ${
                      selectedRisk === r
                        ? 'bg-amber-50 text-amber-700 border border-amber-200 font-bold'
                        : 'bg-white text-slate-500 hover:text-slate-900 border border-slate-200'
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
              <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-300 text-slate-500 text-xs shadow-sm">
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
                        ? 'bg-sky-50 border-sky-400 shadow-sm'
                        : 'bg-white hover:bg-slate-50 border-slate-200 shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-base">🧊</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-900 font-mono">
                              {berg.name}
                            </span>
                            {berg.quadrant && (
                              <span className="text-[9px] px-1.5 py-0.2 bg-sky-50 text-sky-700 border border-sky-200 rounded font-mono">
                                Q-{berg.quadrant}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-500 block truncate max-w-[220px]">
                            {berg.calvingSource}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`text-[9px] px-2 py-0.5 rounded-full font-mono font-bold ${
                          berg.riskRating === 'EXTREME'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : berg.riskRating === 'HIGH'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : berg.riskRating === 'MEDIUM'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {berg.riskRating}
                      </span>
                    </div>

                    {/* Meta info row */}
                    <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-slate-200 text-[11px] font-mono">
                      <div>
                        <span className="text-[9px] text-slate-500 block">Position</span>
                        <span className="text-sky-600 text-[10px] truncate block">
                          {berg.dmsLat ? `${berg.dmsLat}` : `${berg.currentPosition.lat.toFixed(1)}°S`}
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 block">Area</span>
                        <span className="text-slate-900 text-[10px]">{berg.areaKm2} km²</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 block">Drift</span>
                        <span className="text-emerald-700 text-[10px]">{berg.speedKnots} kts</span>
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
            <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-sky-600" />
                  Satellite Observation Dossier & Coordinate Fixes
                </span>
                <span className="text-[10px] text-sky-600 font-mono">
                  SAR Pass: {activeBerg.lastObservedDate}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block text-[10px]">DMS Coordinates</span>
                  <span className="font-bold text-sky-600 font-mono text-[11px]">
                    {activeBerg.dmsLat || '60°51\'S'}, {activeBerg.dmsLon || '46°12\'W'}
                  </span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block text-[10px]">Decimal Degrees</span>
                  <span className="font-bold text-slate-900 font-mono text-[11px]">
                    {activeBerg.currentPosition.lat.toFixed(3)}°, {activeBerg.currentPosition.lon.toFixed(3)}°
                  </span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block text-[10px]">Physical Geometry</span>
                  <span className="font-bold text-slate-900 font-mono text-[11px]">
                    {activeBerg.lengthKm}km x {activeBerg.widthKm}km
                  </span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block text-[10px]">Underkeel Draft</span>
                  <span className="font-bold text-amber-700 font-mono text-[11px]">
                    {activeBerg.estimatedDraftM}m Draft
                  </span>
                </div>
              </div>

              {/* Historical Track Timeline if available */}
              {activeBerg.historyTrack && activeBerg.historyTrack.length > 0 && (
                <div className="space-y-1.5 pt-2">
                  <span className="text-[11px] font-semibold text-slate-700 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-sky-600" />
                    Historical Drift Milestones:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] font-mono">
                    {activeBerg.historyTrack.map((h, i) => (
                      <div
                        key={i}
                        className="bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200 flex items-center justify-between text-slate-600"
                      >
                        <span className="font-bold text-sky-600">{h.date}</span>
                        <span>{h.lat.toFixed(2)}°S, {h.lon.toFixed(2)}°W</span>
                        <span className="text-emerald-700">{h.speedKnots} kts</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons: Simulate Drift Surge or View on Map */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200">
                <button
                  onClick={() => onSimulateDriftSpike(activeBerg.id)}
                  className="px-3.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-semibold transition flex items-center gap-2 active:scale-95"
                >
                  <Activity className="w-3.5 h-3.5 text-red-600" />
                  <span>Simulate Drift Surge (+1.2 kts into Route)</span>
                </button>

                <div className="text-[11px] text-slate-500">
                  Data Provider: <strong className="text-slate-900">{activeBerg.dataSource}</strong>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
