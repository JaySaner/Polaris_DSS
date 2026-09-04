import React, { useState } from 'react';
import { IcebergObservation, VesselProfile } from '../types';
import { IcebergAnimationPlayer } from '../components/icebergs/IcebergAnimationPlayer';
import {
  Film,
  Search,
  ExternalLink,
  Sparkles,
  Compass,
  Calendar,
  Activity,
} from 'lucide-react';

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
      className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 overflow-y-auto p-4 md:p-6 space-y-5 font-sans"
    >
      {/* Top Header & Educational Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/40 border border-blue-300 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-lg shadow-sm">
              🧊
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  NASA SCP Iceberg Tracker & Movement Animations
                </h1>
                <span className="text-[10px] px-2.5 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 rounded-full font-mono font-semibold">
                  Live Satellite Feeds
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Scatterometer Climate Record Pathfinder (SCP) dataset, BYU tracking database, and Sentinel-1 radar movement time-lapse.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <a
            href="https://joel-hanson.github.io/Iceberg-locations/"
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 text-blue-600 dark:text-blue-400 rounded-xl transition flex items-center gap-1.5 font-medium shadow-sm"
          >
            <span>Joel Hanson Tracker</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <a
            href="https://www.scp.byu.edu/data/ice_tracking/antarctic.html"
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 text-blue-600 dark:text-blue-400 rounded-xl transition flex items-center gap-1.5 font-medium shadow-sm"
          >
            <span>NASA BYU SCP Portal</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Easy-to-Understand Step-by-Step UI/UX Guide */}
      {showHelpGuide && (
        <div className="bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800 p-3.5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs shadow-sm">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-slate-800 dark:text-slate-200 block text-xs">
                How Antarctic Iceberg Tracking Works:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-1.5 text-slate-600 dark:text-slate-300 text-[11px]">
                <div className="flex items-start gap-1.5">
                  <span className="font-bold text-blue-600 dark:text-blue-400">1. Satellite SAR:</span>
                  <span>Spaceborne radar penetrates polar cloud cover to measure iceberg perimeter & area.</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="font-bold text-blue-600 dark:text-blue-400">2. Scatterometer Motion:</span>
                  <span>NASA BYU SCP records multi-month animations of iceberg drift patterns.</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="font-bold text-blue-600 dark:text-blue-400">3. Vessel Proximity:</span>
                  <span>Our AI model projects +72h drift vectors to keep vessel routes clear of collisions.</span>
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowHelpGuide(false)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-[11px] underline flex-shrink-0"
          >
            Hide Guide
          </button>
        </div>
      )}

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-slate-500 text-[10px] uppercase font-semibold block">Tracked Icebergs</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-bold text-slate-900 dark:text-white font-mono">{icebergs.length}</span>
            <span className="text-[10px] text-blue-600 dark:text-blue-400">Major Bergs</span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">Quadrants A, B, C, D</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-slate-500 text-[10px] uppercase font-semibold block">Total Ice Surface Area</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-bold text-blue-600 dark:text-blue-400 font-mono">{Math.round(totalArea).toLocaleString()}</span>
            <span className="text-[10px] text-slate-400">km²</span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">A23A is largest (1,428 km²)</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-slate-500 text-[10px] uppercase font-semibold block">Average Drift Speed</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">{avgSpeed}</span>
            <span className="text-[10px] text-slate-400">knots</span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">Driven by Circumpolar Current</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-rose-200 dark:border-rose-900 shadow-sm">
          <span className="text-slate-500 text-[10px] uppercase font-semibold block">High/Extreme Hazard Bergs</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-bold text-rose-600 dark:text-rose-400 font-mono">{highRiskCount}</span>
            <span className="text-[10px] text-slate-400">monitored</span>
          </div>
          <span className="text-[10px] text-rose-500 block mt-0.5">Active CPA warnings</span>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left 5 Cols: Search, Filters & Iceberg Cards */}
        <div className="lg:col-span-5 space-y-3">
          {/* Search & Filter Controls */}
          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2.5 shadow-sm">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search iceberg name (e.g. A23A, C18B)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-slate-400">Sector:</span>
                {['ALL', 'A', 'B', 'C', 'D'].map((q) => (
                  <button
                    key={q}
                    onClick={() => setSelectedQuadrant(q)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-mono transition ${
                      selectedQuadrant === q
                        ? 'bg-blue-600 text-white font-bold'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {q === 'ALL' ? 'All' : `Q-${q}`}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1">
                <span className="text-[10px] text-slate-400">Risk:</span>
                {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map((r) => (
                  <button
                    key={r}
                    onClick={() => setSelectedRisk(r)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-mono transition ${
                      selectedRisk === r
                        ? 'bg-amber-500 text-white font-bold'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
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
              <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-500 text-xs">
                No icebergs match the filter query. Try selecting "All".
              </div>
            ) : (
              filteredIcebergs.map((berg) => {
                const isSelected = berg.id === activeBerg?.id;
                return (
                  <div
                    key={berg.id}
                    onClick={() => setSelectedBergId(berg.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer select-none ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-400 shadow-md'
                        : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60 border-slate-200 dark:border-slate-800 shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-base">🧊</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-900 dark:text-white font-mono">
                              {berg.name}
                            </span>
                            {berg.quadrant && (
                              <span className="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-300 dark:border-blue-800 rounded font-mono">
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
                            ? 'bg-rose-100 text-rose-700 border border-rose-300 dark:bg-rose-950 dark:text-rose-300'
                            : berg.riskRating === 'HIGH'
                            ? 'bg-amber-100 text-amber-700 border border-amber-300 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-blue-100 text-blue-700 border border-blue-300 dark:bg-blue-950 dark:text-blue-300'
                        }`}
                      >
                        {berg.riskRating}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] font-mono">
                      <div>
                        <span className="text-[9px] text-slate-400 block">Position</span>
                        <span className="text-blue-600 dark:text-blue-400 text-[10px] truncate block font-bold">
                          {berg.dmsLat ? `${berg.dmsLat}` : `${berg.currentPosition.lat.toFixed(1)}°S`}
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 block">Area</span>
                        <span className="text-slate-700 dark:text-slate-300 text-[10px]">{berg.areaKm2} km²</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 block">Drift</span>
                        <span className="text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">{berg.speedKnots} kts</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right 7 Cols: Selected Iceberg Detail */}
        {activeBerg && (
          <div className="lg:col-span-7 space-y-4">
            <IcebergAnimationPlayer iceberg={activeBerg} />

            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  Satellite Observation Dossier & Coordinate Fixes
                </span>
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-mono">
                  SAR Pass: {activeBerg.lastObservedDate}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 block text-[10px]">DMS Coordinates</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400 font-mono text-[11px]">
                    {activeBerg.dmsLat || '60°51\'S'}, {activeBerg.dmsLon || '46°12\'W'}
                  </span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 block text-[10px]">Decimal Degrees</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 font-mono text-[11px]">
                    {activeBerg.currentPosition.lat.toFixed(3)}°, {activeBerg.currentPosition.lon.toFixed(3)}°
                  </span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 block text-[10px]">Physical Geometry</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 font-mono text-[11px]">
                    {activeBerg.lengthKm}km x {activeBerg.widthKm}km
                  </span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 block text-[10px]">Underkeel Draft</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400 font-mono text-[11px]">
                    {activeBerg.estimatedDraftM}m Draft
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => onSimulateDriftSpike(activeBerg.id)}
                  className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold transition flex items-center gap-2 shadow-sm active:scale-95"
                >
                  <Activity className="w-3.5 h-3.5 text-white" />
                  <span>Simulate Drift Surge (+1.2 kts into Route)</span>
                </button>

                <div className="text-[11px] text-slate-500">
                  Data Provider: <strong className="text-slate-800 dark:text-slate-200">{activeBerg.dataSource}</strong>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
