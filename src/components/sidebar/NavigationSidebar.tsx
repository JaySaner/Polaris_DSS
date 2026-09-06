import React, { useState, useEffect } from 'react';
import {
  MapLayerVisibility,
  RoutingObjective,
  VesselProfile,
  CandidateRoute,
  GeoCoordinate,
} from '../../types';
import { ANTARCTIC_RESEARCH_STATIONS } from '../../data/antarcticData';
import {
  Navigation,
  Compass,
  Layers,
  Shield,
  Sliders,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Ship,
  Flame,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Wind,
  Waves,
  Eye,
  Zap,
  Check,
  HelpCircle,
  ShieldCheck,
  ShieldAlert,
  MapPin,
  Clock,
  Anchor,
  Info,
} from 'lucide-react';

interface NavigationSidebarProps {
  userRole?: 'navigator' | 'researcher';
  layers: MapLayerVisibility;
  onToggleLayer: (layerKey: keyof MapLayerVisibility) => void;
  vessel: VesselProfile;
  startLocation: { name: string; coords: GeoCoordinate };
  destination: { name: string; coords: GeoCoordinate };
  onSelectStartLocation: (name: string, coords: GeoCoordinate) => void;
  onSelectDestination: (name: string, coords: GeoCoordinate) => void;
  objective: RoutingObjective;
  onChangeObjective: (obj: RoutingObjective) => void;
  selectedHorizon: number;
  onChangeHorizon: (horizon: number) => void;
  activeRoute: CandidateRoute | null;
  onRecalculateRoutes: () => void;
}

/** Format hours into readable duration */
function formatDuration(hours: number): string {
  if (!hours || !isFinite(hours) || hours <= 0) return '--';
  const days = Math.floor(hours / 24);
  const rem = Math.round(hours % 24);
  if (days === 0) return `${rem}h`;
  if (rem === 0) return `${days}d`;
  return `${days}d ${rem}h`;
}

function getSafetyLabel(score: number): { label: string; color: string } {
  if (score >= 75) return { label: 'SAFE', color: 'text-emerald-500' };
  if (score >= 50) return { label: 'CAUTION', color: 'text-amber-500' };
  return { label: 'HIGH RISK', color: 'text-rose-500' };
}

export const NavigationSidebar: React.FC<NavigationSidebarProps> = ({
  userRole = 'navigator',
  layers,
  onToggleLayer,
  vessel,
  startLocation,
  destination,
  onSelectStartLocation,
  onSelectDestination,
  objective,
  onChangeObjective,
  selectedHorizon,
  onChangeHorizon,
  activeRoute,
  onRecalculateRoutes,
}) => {
  const [isPlayingForecast, setIsPlayingForecast] = useState<boolean>(false);
  const [activePreset, setActivePreset] = useState<'tactical' | 'hazard' | 'metocean' | 'custom'>('tactical');
  const [showManualCheckboxes, setShowManualCheckboxes] = useState<boolean>(false);
  const [showAdvancedLayers, setShowAdvancedLayers] = useState<boolean>(false);

  const isNavigator = userRole === 'navigator';

  const departures = [
    { name: `Current Fix: ${vessel.name.split('/')[0]} (Prydz Bay)`, coords: vessel.currentPosition },
    { name: 'Cape Town Departure Port', coords: { lat: -34.40, lon: 18.42 } },
    { name: 'Hobart Polar Port', coords: { lat: -43.50, lon: 147.33 } },
    { name: 'Punta Arenas Gateway', coords: { lat: -53.16, lon: -70.91 } },
  ];

  const quickStations = [
    { name: '🇮🇳 Bharati', station: ANTARCTIC_RESEARCH_STATIONS.find((s) => s.id === 'bharati') },
    { name: '🇮🇳 Maitri', station: ANTARCTIC_RESEARCH_STATIONS.find((s) => s.id === 'maitri') },
    { name: '🇺🇸 McMurdo', station: ANTARCTIC_RESEARCH_STATIONS.find((s) => s.id === 'mcmurdo') },
    { name: '🇬🇧 Rothera', station: ANTARCTIC_RESEARCH_STATIONS.find((s) => s.id === 'rothera') },
  ];

  const objectives: {
    id: RoutingObjective;
    label: string;
    badge: string;
    desc: string;
    icon: any;
    color: string;
  }[] = [
    { id: 'Safety First', label: 'Safety First', badge: 'IMO PC5', desc: 'Max ice avoidance & lead bypass', icon: Shield, color: 'text-emerald-500' },
    { id: 'Balanced', label: 'Balanced', badge: 'RECOMMENDED', desc: 'Optimal fuel & risk trade-off', icon: Compass, color: 'text-blue-500' },
    { id: 'Fuel Efficiency', label: 'Fuel Saver', badge: 'ECO', desc: 'Minimizes bunker oil burn', icon: Flame, color: 'text-amber-500' },
    { id: 'Fastest', label: 'Express', badge: 'DIRECT', desc: 'Shortest transit time', icon: Zap, color: 'text-sky-500' },
  ];

  const horizons = [0, 6, 12, 24, 48, 72];

  // Auto playback of 72h forecast
  useEffect(() => {
    if (!isPlayingForecast) return;
    const interval = setInterval(() => {
      onChangeHorizon(
        selectedHorizon === 72 ? 0 : horizons[(horizons.indexOf(selectedHorizon) + 1) % horizons.length]
      );
    }, 1500);
    return () => clearInterval(interval);
  }, [isPlayingForecast, selectedHorizon, onChangeHorizon]);

  // Apply Layer Presets
  const applyPreset = (preset: 'tactical' | 'hazard' | 'metocean' | 'custom') => {
    setActivePreset(preset);
    if (preset === 'custom') {
      setShowManualCheckboxes(true);
      return;
    }
    setShowManualCheckboxes(false);

    const presetConfigs: Record<string, Partial<MapLayerVisibility>> = {
      tactical: {
        seaIce: true, predictedSeaIce: false, icebergs: true,
        predictedIcebergTrajectories: false, uncertaintyCones: false,
        navigationRiskGrid: false, recommendedRoute: true, alternativeRoutes: true,
        researchStations: true, vessel: true, windVectors: false,
        oceanCurrents: false, graticule: true,
      },
      hazard: {
        seaIce: true, predictedSeaIce: true, icebergs: true,
        predictedIcebergTrajectories: true, uncertaintyCones: true,
        navigationRiskGrid: true, recommendedRoute: true, alternativeRoutes: true,
        researchStations: true, vessel: true, windVectors: false,
        oceanCurrents: false, graticule: true,
      },
      metocean: {
        seaIce: true, predictedSeaIce: false, icebergs: true,
        predictedIcebergTrajectories: false, uncertaintyCones: false,
        navigationRiskGrid: false, recommendedRoute: true, alternativeRoutes: false,
        researchStations: true, vessel: true, windVectors: true,
        oceanCurrents: true, graticule: true,
      },
    };

    const targetConfig = presetConfigs[preset];
    if (targetConfig) {
      Object.keys(targetConfig).forEach((key) => {
        const k = key as keyof MapLayerVisibility;
        if (layers[k] !== targetConfig[k]) {
          onToggleLayer(k);
        }
      });
    }
  };

  // Route safety for navigator summary
  const safetyScore = activeRoute?.safetyScore ?? null;
  const safetyInfo = safetyScore !== null ? getSafetyLabel(safetyScore) : null;
  const durationHours = activeRoute?.estimatedTravelTimeHours ?? null;
  const bergCpaNm = activeRoute?.closestIcebergCpaNm ?? null;

  return (
    <aside
      id="navigation-controls-sidebar"
      className="w-full md:w-80 lg:w-88 flex-shrink-0 bg-white dark:bg-[#0A1224] border-r border-slate-200 dark:border-slate-800 flex flex-col h-full overflow-y-auto select-none p-3.5 space-y-3 shadow-md font-sans"
    >
      {/* ── Sidebar Header ── */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-300">
            <Navigation className="w-4 h-4" />
          </div>
          <div>
            <span className="font-black text-[12px] tracking-wide uppercase text-slate-900 dark:text-slate-100 block leading-tight">
              Passage Planner
            </span>
            <div className="text-[9px] text-blue-600 dark:text-blue-400 font-extrabold tracking-widest">
              POLARIS ROUTING ENGINE
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] px-2 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 rounded-md font-black">
            LIVE
          </span>
          {isNavigator && (
            <span className="text-[9px] px-2 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-300 dark:border-blue-800 rounded-md font-black">
              CAPTAIN
            </span>
          )}
        </div>
      </div>

      {/* ── Guidance Note ── */}
      <div className="bg-blue-50/90 dark:bg-blue-950/50 border border-blue-200/80 dark:border-blue-800/70 rounded-xl p-2.5 flex items-start gap-2 shadow-sm">
        <Info className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <p className="text-[10.5px] font-medium text-slate-700 dark:text-slate-300 leading-snug">
          <span className="font-bold text-blue-700 dark:text-blue-300">Note: </span>
          Please select your target station & route options below to calculate and display the route on the map.
        </p>
      </div>

      {/* ══════════════════════════════════════════
          NAVIGATOR (CAPTAIN) MODE — Compact Layout
          ══════════════════════════════════════════ */}
      {isNavigator ? (
        <>
          {/* Active Voyage Status Card */}
          {activeRoute && (
            <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Ship className="w-3.5 h-3.5 text-blue-500" />
                  Active Voyage Status
                </span>
                {safetyInfo && (
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                    safetyScore! >= 75
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                      : safetyScore! >= 50
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-700'
                  }`}>
                    {safetyInfo.label}
                  </span>
                )}
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Vessel
                  </span>
                  <span className="font-bold text-slate-900 dark:text-slate-100 text-right max-w-[10rem] truncate">
                    {vessel.name.split('/')[0].trim()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                    <Anchor className="w-3 h-3" /> Destination
                  </span>
                  <span className="font-bold text-blue-600 dark:text-blue-400 text-right max-w-[10rem] truncate">
                    {destination.name.split('(')[0].trim()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                    <Shield className="w-3 h-3" /> Safety
                  </span>
                  <span className={`font-black font-mono ${safetyInfo?.color ?? 'text-slate-400'}`}>
                    {safetyScore !== null ? `${safetyScore} / 100` : '--'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3" /> ETA
                  </span>
                  <span className="font-black text-slate-900 dark:text-slate-100 font-mono">
                    {durationHours !== null ? formatDuration(durationHours) : '--'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Nearest Hazard</span>
                  <span className={`font-black font-mono ${bergCpaNm !== null && bergCpaNm < 20 ? 'text-rose-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    {bergCpaNm !== null ? `${bergCpaNm} NM` : '--'}
                  </span>
                </div>
              </div>

              <button
                id="btn-recalculate-route-plan"
                onClick={onRecalculateRoutes}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow transition flex items-center justify-center gap-2 text-xs uppercase tracking-wide active:scale-98"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Recalculate Safe Corridor</span>
              </button>
            </div>
          )}

          {/* STEP 1: Destination */}
          <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-3.5 space-y-3">
            <div className="flex items-center gap-2 pb-1.5 border-b border-slate-200 dark:border-slate-700">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-[10px] flex-shrink-0">1</span>
              <span className="font-bold text-[11px] uppercase tracking-wider text-slate-800 dark:text-slate-200">Set Destination</span>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                Departure Origin
              </label>
              <select
                id="select-departure-location"
                className="w-full border rounded-xl px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium bg-white border-slate-300 text-slate-900 dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100"
                value={startLocation.name}
                onChange={(e) => {
                  const selected = departures.find((d) => d.name === e.target.value);
                  if (selected) onSelectStartLocation(selected.name, selected.coords);
                }}
              >
                {departures.map((d) => (
                  <option key={d.name} value={d.name}>{d.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse flex-shrink-0" />
                Target Antarctic Station
              </label>
              <select
                id="select-destination-station"
                className="w-full border rounded-xl px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium bg-white border-slate-300 text-slate-900 dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100"
                value={destination.name}
                onChange={(e) => {
                  const selected = ANTARCTIC_RESEARCH_STATIONS.find((s) => s.name === e.target.value);
                  if (selected) onSelectDestination(selected.name, selected.coords);
                }}
              >
                {ANTARCTIC_RESEARCH_STATIONS.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.country === 'India' ? `🇮🇳 ★ ${s.name} (India)` : `${s.name} (${s.country})`}
                  </option>
                ))}
              </select>
              <div className="flex flex-wrap gap-1 pt-0.5">
                {quickStations.map((qs) => {
                  if (!qs.station) return null;
                  const isSelected = destination.name === qs.station.name;
                  return (
                    <button
                      key={qs.name}
                      onClick={() => onSelectDestination(qs.station!.name, qs.station!.coords)}
                      className={`text-[10px] px-2 py-0.5 rounded-lg transition font-bold border ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-blue-50 hover:text-blue-700 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                      }`}
                    >
                      {qs.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* STEP 2: Routing Objective */}
          <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-3.5 space-y-2.5">
            <div className="flex items-center gap-2 pb-1.5 border-b border-slate-200 dark:border-slate-700">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-[10px] flex-shrink-0">2</span>
              <span className="font-bold text-[11px] uppercase tracking-wider text-slate-800 dark:text-slate-200">Route Priority</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {objectives.map((obj) => {
                const Icon = obj.icon;
                const isSelected = objective === obj.id;
                return (
                  <button
                    key={obj.id}
                    id={`btn-obj-${obj.id.toLowerCase().replace(/ /g, '-')}`}
                    onClick={() => onChangeObjective(obj.id)}
                    className={`p-2 rounded-xl text-left border transition-all ${
                      isSelected
                        ? 'bg-blue-600 border-blue-600 text-white shadow'
                        : 'bg-white border-slate-300 text-slate-800 hover:bg-blue-50 hover:border-blue-300 dark:bg-slate-950 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-1 font-black text-[10px]">
                      <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : obj.color}`} />
                      <span>{obj.label}</span>
                    </div>
                    <div className={`text-[9px] mt-0.5 leading-tight ${isSelected ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'}`}>
                      {obj.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 3: Forecast Horizon */}
          <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-slate-700">
              <span className="font-bold text-[11px] uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-[10px]">3</span>
                Forecast Horizon
              </span>
              <span className="text-blue-700 dark:text-blue-300 font-bold text-[10px] bg-blue-100 dark:bg-blue-950 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800 font-mono">
                {selectedHorizon === 0 ? 'NOW' : `+${selectedHorizon}h`}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsPlayingForecast(!isPlayingForecast)}
                title={isPlayingForecast ? 'Pause' : 'Play 72h simulation'}
                className={`p-1.5 rounded-lg border transition flex-shrink-0 ${
                  isPlayingForecast
                    ? 'bg-rose-600 text-white border-rose-600'
                    : 'bg-white text-blue-600 border-slate-300 hover:bg-blue-50 dark:bg-slate-800 dark:text-blue-400 dark:border-slate-700'
                }`}
              >
                {isPlayingForecast ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>
              {horizons.map((h) => (
                <button
                  key={h}
                  id={`btn-horizon-${h}`}
                  onClick={() => onChangeHorizon(h)}
                  className={`flex-1 py-1.5 rounded-lg text-center text-[10px] font-bold border transition ${
                    selectedHorizon === h
                      ? 'bg-blue-600 text-white border-blue-600 shadow'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-blue-50 hover:text-blue-700 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                  }`}
                >
                  {h === 0 ? 'Now' : `+${h}h`}
                </button>
              ))}
            </div>
          </div>

          {/* STEP 4 (Captain): Simple Map Layers — compact toggle only */}
          <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-3.5 space-y-2.5">
            <button
              className="flex items-center justify-between w-full"
              onClick={() => setShowAdvancedLayers(!showAdvancedLayers)}
            >
              <span className="font-bold text-[11px] uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-[10px]">4</span>
                Map Layers
              </span>
              {showAdvancedLayers
                ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
            </button>

            {/* Quick essential toggles — always visible for Captain */}
            <div className="grid grid-cols-2 gap-1.5">
              {([
                { key: 'recommendedRoute', label: '✅ Route', essential: true },
                { key: 'icebergs',         label: '▲ Hazards', essential: true },
                { key: 'seaIce',           label: '🧊 Sea Ice', essential: false },
                { key: 'researchStations', label: '📍 Stations', essential: false },
              ] as const).map((item) => (
                <button
                  key={item.key}
                  onClick={() => onToggleLayer(item.key as keyof MapLayerVisibility)}
                  className={`px-2 py-1.5 rounded-lg border text-[10px] font-bold transition text-left flex items-center gap-1.5 ${
                    layers[item.key as keyof MapLayerVisibility]
                      ? 'bg-blue-100 border-blue-400 text-blue-900 dark:bg-blue-950 dark:border-blue-600 dark:text-blue-200'
                      : 'bg-white border-slate-300 text-slate-500 hover:border-blue-300 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-400'
                  }`}
                >
                  {layers[item.key as keyof MapLayerVisibility]
                    ? <Check className="w-3 h-3 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    : <div className="w-3 h-3 rounded border border-slate-400 flex-shrink-0" />
                  }
                  {item.label}
                </button>
              ))}
            </div>

            {/* Advanced layers — collapsed by default for Captain */}
            {showAdvancedLayers && (
              <div className="space-y-1.5 pt-1 border-t border-slate-200 dark:border-slate-700">
                <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest block">Advanced Overlays</span>
                {([
                  { key: 'predictedIcebergTrajectories', label: 'Iceberg Drift Paths' },
                  { key: 'uncertaintyCones',             label: 'Uncertainty Cones' },
                  { key: 'navigationRiskGrid',           label: 'Risk Heat Grid' },
                  { key: 'windVectors',                  label: 'Wind Vectors' },
                  { key: 'oceanCurrents',                label: 'Ocean Currents' },
                  { key: 'graticule',                    label: 'Grid Lines' },
                ] as const).map((item) => (
                  <label
                    key={item.key}
                    className="flex items-center gap-2 text-slate-700 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-300 cursor-pointer text-[10px] font-medium"
                  >
                    <input
                      type="checkbox"
                      id={`checkbox-layer-${item.key}`}
                      checked={layers[item.key as keyof MapLayerVisibility]}
                      onChange={() => onToggleLayer(item.key as keyof MapLayerVisibility)}
                      className="rounded border-slate-300 bg-white text-blue-600 focus:ring-blue-500 h-3.5 w-3.5 dark:border-slate-700 dark:bg-slate-900"
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Active Vessel Summary */}
          <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Ship className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span className="font-extrabold text-slate-900 dark:text-slate-100 text-xs">
                  {vessel.name.split('/')[0].trim()}
                </span>
              </div>
              <span className="text-[9px] px-1.5 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 rounded-md font-bold">
                {vessel.iceClass}
              </span>
            </div>
            <div className="flex justify-between text-[10px] text-slate-600 dark:text-slate-300">
              <span>Speed: <strong className="text-blue-600 dark:text-blue-400 font-mono">{vessel.cruisingSpeedKnots} kts</strong></span>
              <span>Fuel: <strong className="text-amber-600 dark:text-amber-400 font-mono">{vessel.fuelConsumptionLPerHr} L/hr</strong></span>
            </div>
          </div>
        </>
      ) : (
        /* ══════════════════════════════════════════
            RESEARCHER MODE — Full layout
           ══════════════════════════════════════════ */
        <>
          {/* STEP 1: Destination & Objective */}
          <div className="bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 space-y-3 shadow-sm">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-[11px] flex-shrink-0">1</span>
              <span className="font-bold text-[11px] uppercase tracking-wider text-slate-900 dark:text-slate-100">Destination & Objective</span>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" /> Departure Origin
              </label>
              <select
                id="select-departure-location"
                className="w-full border rounded-xl px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none transition font-bold bg-white border-slate-300 text-slate-900 dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100"
                value={startLocation.name}
                onChange={(e) => {
                  const selected = departures.find((d) => d.name === e.target.value);
                  if (selected) onSelectStartLocation(selected.name, selected.coords);
                }}
              >
                {departures.map((d) => <option key={d.name} value={d.name}>{d.name}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse flex-shrink-0" /> Target Antarctic Station
              </label>
              <select
                id="select-destination-station"
                className="w-full border rounded-xl px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none transition font-bold bg-white border-slate-300 text-slate-900 dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100"
                value={destination.name}
                onChange={(e) => {
                  const selected = ANTARCTIC_RESEARCH_STATIONS.find((s) => s.name === e.target.value);
                  if (selected) onSelectDestination(selected.name, selected.coords);
                }}
              >
                {ANTARCTIC_RESEARCH_STATIONS.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.country === 'India' ? `🇮🇳 ★ ${s.name} (India)` : `${s.name} (${s.country})`}
                  </option>
                ))}
              </select>
              <div className="flex flex-wrap gap-1 pt-1">
                {quickStations.map((qs) => {
                  if (!qs.station) return null;
                  const isSelected = destination.name === qs.station.name;
                  return (
                    <button
                      key={qs.name}
                      onClick={() => onSelectDestination(qs.station!.name, qs.station!.coords)}
                      className={`text-[10px] px-2 py-0.5 rounded-lg transition font-bold border ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-blue-50 hover:text-blue-700 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                      }`}
                    >
                      {qs.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1 pt-0.5">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                Route Optimization Objective
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {objectives.map((obj) => {
                  const Icon = obj.icon;
                  const isSelected = objective === obj.id;
                  return (
                    <button
                      key={obj.id}
                      id={`btn-obj-${obj.id.toLowerCase().replace(/ /g, '-')}`}
                      onClick={() => onChangeObjective(obj.id)}
                      className={`p-2 rounded-xl text-left border transition-all ${
                        isSelected
                          ? 'bg-blue-600 border-blue-600 text-white font-bold shadow-md'
                          : 'bg-white border-slate-300 text-slate-800 hover:bg-blue-50 hover:border-blue-300 dark:bg-slate-950 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-extrabold text-[11px]">
                        <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : obj.color}`} />
                        <span>{obj.label}</span>
                      </div>
                      <div className={`text-[9px] mt-0.5 leading-tight font-medium ${isSelected ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'}`}>
                        {obj.desc}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              id="btn-recalculate-route-plan"
              onClick={onRecalculateRoutes}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-extrabold rounded-xl shadow-md transition flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Recalculate Safe Corridor</span>
            </button>
          </div>

          {/* STEP 2: 72h Forecast Horizon */}
          <div className="bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 space-y-2.5 shadow-sm">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-200 dark:border-slate-800">
              <span className="font-bold text-[11px] uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-[11px]">2</span>
                72h Forecast Horizon
              </span>
              <span className="text-blue-700 dark:text-blue-300 font-bold text-[10px] bg-blue-100 dark:bg-blue-950 px-2 py-0.5 rounded-full border border-blue-300 dark:border-blue-800 font-mono">
                {selectedHorizon === 0 ? 'NOW (Live)' : `+${selectedHorizon}h`}
              </span>
            </div>
            <div className="flex items-center justify-between gap-1">
              <button
                onClick={() => setIsPlayingForecast(!isPlayingForecast)}
                title={isPlayingForecast ? 'Pause' : 'Play 72h simulation'}
                className={`p-1.5 rounded-lg border transition flex-shrink-0 ${
                  isPlayingForecast
                    ? 'bg-rose-600 text-white border-rose-600 shadow'
                    : 'bg-white text-blue-600 border-slate-300 hover:bg-blue-50 dark:bg-slate-800 dark:text-blue-400 dark:border-slate-700'
                }`}
              >
                {isPlayingForecast ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>
              {horizons.map((h) => (
                <button
                  key={h}
                  id={`btn-horizon-${h}`}
                  onClick={() => onChangeHorizon(h)}
                  className={`flex-1 py-1.5 rounded-lg text-center text-[11px] font-bold border transition ${
                    selectedHorizon === h
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-blue-50 hover:text-blue-700 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                  }`}
                >
                  {h === 0 ? '0h' : `+${h}h`}
                </button>
              ))}
            </div>
          </div>

          {/* STEP 3: Map Display Mode (Researcher only) */}
          <div className="bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 space-y-2.5 shadow-sm">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-200 dark:border-slate-800">
              <span className="font-bold text-[11px] uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-[11px]">3</span>
                Map Display Mode
              </span>
              <button
                onClick={() => setShowManualCheckboxes(!showManualCheckboxes)}
                className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-bold"
              >
                {showManualCheckboxes ? 'Hide' : 'Manual Layers'}
                {showManualCheckboxes ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'tactical' as const,  emoji: '🎯', label: 'Tactical',  sub: 'Clean View' },
                { id: 'hazard'   as const,  emoji: '⚠️', label: 'Hazard',    sub: 'Risk Grid' },
                { id: 'metocean' as const,  emoji: '🌊', label: 'Metocean',  sub: 'Wind/Waves' },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => applyPreset(p.id)}
                  className={`p-2 rounded-xl border text-center transition ${
                    activePreset === p.id
                      ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-md'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-blue-50 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                  }`}
                >
                  <div className="text-[11px] font-bold">{p.emoji} {p.label}</div>
                  <div className={`text-[9px] mt-0.5 ${activePreset === p.id ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'}`}>{p.sub}</div>
                </button>
              ))}
            </div>

            {showManualCheckboxes && (
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-1.5 text-xs">
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-extrabold uppercase tracking-wider block">⚙️ Manual Layers</span>
                <div className="grid grid-cols-1 gap-1 pl-1 max-h-44 overflow-y-auto scrollbar-thin">
                  {([
                    { key: 'seaIce',                        label: 'Sea-Ice Concentration' },
                    { key: 'predictedSeaIce',               label: 'Predicted Ice (+72h)' },
                    { key: 'icebergs',                       label: 'Iceberg Fixes' },
                    { key: 'predictedIcebergTrajectories',  label: 'Iceberg Trajectories' },
                    { key: 'uncertaintyCones',              label: 'Uncertainty Ellipses' },
                    { key: 'navigationRiskGrid',            label: 'Polar Risk Grid' },
                    { key: 'recommendedRoute',              label: 'Recommended Route' },
                    { key: 'alternativeRoutes',             label: 'Alternative Routes' },
                    { key: 'researchStations',              label: 'Research Stations' },
                    { key: 'vessel',                        label: 'Vessel Fix & Heading' },
                    { key: 'windVectors',                   label: '10m Wind Vectors' },
                    { key: 'oceanCurrents',                 label: 'Ocean Currents' },
                    { key: 'graticule',                     label: 'Polar Graticule Grid' },
                  ] as const).map((item) => (
                    <label
                      key={item.key}
                      className="flex items-center gap-2 text-slate-700 dark:text-slate-200 hover:text-blue-700 cursor-pointer text-[11px] font-medium"
                    >
                      <input
                        type="checkbox"
                        id={`checkbox-layer-${item.key}`}
                        checked={layers[item.key as keyof MapLayerVisibility]}
                        onChange={() => {
                          setActivePreset('custom');
                          onToggleLayer(item.key as keyof MapLayerVisibility);
                        }}
                        className="rounded border-slate-300 bg-white text-blue-600 focus:ring-blue-500 h-3.5 w-3.5 dark:border-slate-700 dark:bg-slate-900"
                      />
                      <span>{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Active Vessel Card */}
          <div className="bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 space-y-1.5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Ship className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="font-extrabold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wide">
                  {vessel.name.split('/')[0]}
                </span>
              </div>
              <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 rounded-full font-bold">
                {vessel.iceClass}
              </span>
            </div>
            <div className="flex justify-between text-[10px] text-slate-600 dark:text-slate-300 font-medium">
              <span>Speed: <strong className="text-blue-600 dark:text-blue-400 font-mono text-xs">{vessel.cruisingSpeedKnots} kts</strong></span>
              <span>Fuel: <strong className="text-amber-600 dark:text-amber-400 font-mono text-xs">{vessel.fuelConsumptionLPerHr} L/hr</strong></span>
            </div>
          </div>
        </>
      )}
    </aside>
  );
};
