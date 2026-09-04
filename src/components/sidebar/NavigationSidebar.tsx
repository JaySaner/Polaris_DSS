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
  Clock,
  Sparkles,
  Ship,
  Anchor,
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
} from 'lucide-react';

interface NavigationSidebarProps {
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

export const NavigationSidebar: React.FC<NavigationSidebarProps> = ({
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

  const departures = [
    { name: `Current Fix: ${vessel.name.split('/')[0]} (Prydz Bay)`, coords: vessel.currentPosition },
    { name: 'Cape Town Departure Port', coords: { lat: -34.40, lon: 18.42 } },
    { name: 'Hobart Polar Port', coords: { lat: -43.50, lon: 147.33 } },
    { name: 'Punta Arenas Gateway', coords: { lat: -53.16, lon: -70.91 } },
  ];

  const quickStations = [
    { name: '🇮🇳 Bharati (India)', station: ANTARCTIC_RESEARCH_STATIONS.find((s) => s.id === 'bharati') },
    { name: '🇮🇳 Maitri (India)', station: ANTARCTIC_RESEARCH_STATIONS.find((s) => s.id === 'maitri') },
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
    {
      id: 'Safety First',
      label: 'Safety First',
      badge: 'IMO PC5',
      desc: 'Max ice avoidance & lead bypass',
      icon: Shield,
      color: 'text-emerald-400',
    },
    {
      id: 'Balanced',
      label: 'Balanced',
      badge: 'RECOMMENDED',
      desc: 'Optimal fuel & risk trade-off',
      icon: Compass,
      color: 'text-cyan-400',
    },
    {
      id: 'Fuel Efficiency',
      label: 'Fuel Saver',
      badge: 'ECO MODE',
      desc: 'Minimizes bunker oil burn',
      icon: Flame,
      color: 'text-amber-400',
    },
    {
      id: 'Fastest',
      label: 'Express Speed',
      badge: 'DIRECT',
      desc: 'Shortest transit time',
      icon: Zap,
      color: 'text-sky-400',
    },
  ];

  const horizons = [0, 6, 12, 24, 48, 72];

  // Auto playback of 72h forecast simulation
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

    // Batch toggle layers based on preset
    const presetConfigs: Record<string, Partial<MapLayerVisibility>> = {
      tactical: {
        seaIce: true,
        predictedSeaIce: false,
        icebergs: true,
        predictedIcebergTrajectories: true,
        uncertaintyCones: false,
        navigationRiskGrid: false,
        recommendedRoute: true,
        alternativeRoutes: true,
        researchStations: true,
        vessel: true,
        windVectors: false,
        oceanCurrents: false,
        graticule: true,
      },
      hazard: {
        seaIce: true,
        predictedSeaIce: true,
        icebergs: true,
        predictedIcebergTrajectories: true,
        uncertaintyCones: true,
        navigationRiskGrid: true,
        recommendedRoute: true,
        alternativeRoutes: true,
        researchStations: true,
        vessel: true,
        windVectors: false,
        oceanCurrents: false,
        graticule: true,
      },
      metocean: {
        seaIce: true,
        predictedSeaIce: false,
        icebergs: true,
        predictedIcebergTrajectories: false,
        uncertaintyCones: false,
        navigationRiskGrid: false,
        recommendedRoute: true,
        alternativeRoutes: false,
        researchStations: true,
        vessel: true,
        windVectors: true,
        oceanCurrents: true,
        graticule: true,
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

  return (
    <aside
      id="navigation-controls-sidebar"
      className="w-full md:w-80 lg:w-88 flex-shrink-0 polar-card-bg border-r flex flex-col h-full overflow-y-auto select-none p-3.5 space-y-3.5 shadow-lg font-sans"
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between border-b border-sky-200/60 dark:border-slate-700/60 pb-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-sky-100 border border-sky-300 flex items-center justify-center text-sky-600 dark:bg-cyan-950 dark:border-cyan-500/50 dark:text-cyan-300">
            <Navigation className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-[11px] tracking-widest uppercase text-slate-700 dark:text-slate-200">
              Passage Planner
            </span>
            <div className="text-[9px] text-sky-600 dark:text-cyan-400 font-semibold tracking-wider">
              POLARIS ROUTING ENGINE
            </div>
          </div>
        </div>
        <span className="text-[9px] px-2 py-0.5 polar-badge-cyan rounded-full font-bold">
          LIVE
        </span>
      </div>

      {/* ── STEP 1: Destination & Objective ─── */}
      <div className="polar-card-elevated border rounded-xl p-3.5 space-y-3">
        {/* Section heading */}
        <div className="flex items-center gap-2 pb-1.5 border-b border-sky-200/50 dark:border-slate-700/50">
          <span className="w-5 h-5 rounded-full bg-sky-500 text-white flex items-center justify-center font-extrabold text-[10px] flex-shrink-0">
            1
          </span>
          <span className="font-bold text-[11px] uppercase tracking-wider text-slate-700 dark:text-slate-200">
            Destination & Objective
          </span>
        </div>

        {/* Departure Point */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
            Departure Origin
          </label>
          <select
            id="select-departure-location"
            className="w-full border rounded-lg px-2.5 py-1.5 text-[11px] focus:ring-2 focus:ring-sky-400 focus:outline-none transition font-medium bg-white border-sky-200 text-slate-800 dark:bg-[#0A1528] dark:border-cyan-800/50 dark:text-slate-200"
            value={startLocation.name}
            onChange={(e) => {
              const selected = departures.find((d) => d.name === e.target.value);
              if (selected) onSelectStartLocation(selected.name, selected.coords);
            }}
          >
            {departures.map((d) => (
              <option key={d.name} value={d.name}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        {/* Destination Station */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse flex-shrink-0" />
            Target Antarctic Station
          </label>
          <select
            id="select-destination-station"
            className="w-full border rounded-lg px-2.5 py-1.5 text-[11px] focus:ring-2 focus:ring-sky-400 focus:outline-none transition font-bold bg-white border-sky-300 text-sky-800 dark:bg-[#0A1528] dark:border-cyan-500/40 dark:text-cyan-200"
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

          {/* Quick Select Chips */}
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {quickStations.map((qs) => {
              if (!qs.station) return null;
              const isSelected = destination.name === qs.station.name;
              return (
                <button
                  key={qs.name}
                  onClick={() => onSelectDestination(qs.station!.name, qs.station!.coords)}
                  className={`text-[10px] px-2 py-0.5 rounded-md transition font-semibold border ${
                    isSelected
                      ? 'bg-sky-100 text-sky-800 border-sky-400 shadow-sm dark:bg-cyan-900/60 dark:text-cyan-200 dark:border-cyan-400'
                      : 'bg-white text-slate-500 border-slate-300 hover:bg-sky-50 hover:text-sky-700 hover:border-sky-300 dark:bg-slate-800/50 dark:text-slate-400 dark:border-slate-700 dark:hover:text-slate-200'
                  }`}
                >
                  {qs.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Routing Objective */}
        <div className="space-y-1.5 pt-0.5">
          <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-sky-500 dark:text-cyan-400" />
            Route Optimization Objective
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {objectives.map((obj) => {
              const Icon = obj.icon;
              const isSelected = objective === obj.id;
              return (
                <button
                  key={obj.id}
                  id={`btn-obj-${obj.id.toLowerCase().replace(' ', '-')}`}
                  onClick={() => onChangeObjective(obj.id)}
                  className={`p-2.5 rounded-lg text-left border transition-all ${
                    isSelected
                      ? 'bg-sky-50 border-sky-400 text-sky-900 font-semibold shadow-sm dark:bg-cyan-950 dark:border-cyan-400 dark:text-cyan-100'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-sky-50 hover:border-sky-300 dark:bg-[#0A1528] dark:border-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-[11px]">
                    <Icon className={`w-3.5 h-3.5 ${obj.color}`} />
                    <span>{obj.label}</span>
                  </div>
                  <div className="text-[9px] text-slate-400 mt-0.5 leading-tight">{obj.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Recalculate CTA */}
        <button
          id="btn-recalculate-route-plan"
          onClick={onRecalculateRoutes}
          className="w-full py-2.5 bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 text-xs uppercase tracking-wider active:scale-98 dark:bg-cyan-500 dark:hover:bg-cyan-400 dark:text-slate-950"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Recalculate Safe Corridor</span>
        </button>
      </div>

      {/* ── STEP 2: 72h Forecast Horizon ─── */}
      <div className="polar-card-elevated border rounded-xl p-3.5 space-y-2.5">
        <div className="flex items-center justify-between pb-1.5 border-b border-sky-200/50 dark:border-slate-700/50">
          <span className="font-bold text-[11px] uppercase tracking-wider text-slate-700 dark:text-cyan-300 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-sky-500 text-white dark:bg-cyan-400 dark:text-slate-950 flex items-center justify-center font-extrabold text-[10px]">
              2
            </span>
            72h Forecast Horizon
          </span>
          <span className="text-sky-700 dark:text-cyan-300 font-bold text-[10px] bg-sky-100 dark:bg-[#081022] px-2 py-0.5 rounded-full border border-sky-300 dark:border-cyan-500/30 font-mono">
            {selectedHorizon === 0 ? 'NOW (Live)' : `+${selectedHorizon}h`}
          </span>
        </div>

        {/* Timeline Buttons */}
        <div className="flex items-center justify-between gap-1">
          <button
            onClick={() => setIsPlayingForecast(!isPlayingForecast)}
            title={isPlayingForecast ? 'Pause' : 'Play 72h simulation'}
            className={`p-1.5 rounded-lg border transition flex-shrink-0 ${
              isPlayingForecast
                ? 'bg-rose-100 text-rose-700 border-rose-300 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-500'
                : 'bg-sky-50 text-sky-600 border-sky-300 hover:bg-sky-100 dark:bg-[#081022] dark:text-cyan-300 dark:border-cyan-500/40'
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
                  ? 'bg-sky-500 text-white border-sky-600 shadow-sm dark:bg-cyan-500 dark:text-slate-950 dark:border-cyan-400'
                  : 'bg-white text-slate-500 border-slate-200 hover:bg-sky-50 hover:text-sky-700 hover:border-sky-300 dark:bg-[#081022] dark:text-slate-400 dark:border-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {h === 0 ? '0h' : `+${h}h`}
            </button>
          ))}
        </div>
      </div>

      {/* ── STEP 3: Map Display Mode ─── */}
      <div className="polar-card-elevated border rounded-xl p-3.5 space-y-2.5">
        <div className="flex items-center justify-between pb-1.5 border-b border-sky-200/50 dark:border-slate-700/50">
          <span className="font-bold text-[11px] uppercase tracking-wider text-slate-700 dark:text-cyan-300 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-sky-500 text-white dark:bg-cyan-400 dark:text-slate-950 flex items-center justify-center font-extrabold text-[10px]">
              3
            </span>
            Map Display Mode
          </span>
          <button
            onClick={() => setShowManualCheckboxes(!showManualCheckboxes)}
            className="text-[10px] text-sky-600 dark:text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
          >
            {showManualCheckboxes ? 'Hide' : 'Manual Layers'}
            {showManualCheckboxes ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        {/* Preset Cards */}
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { id: 'tactical' as const, emoji: '🎯', label: 'Tactical', sub: 'Clean View' },
            { id: 'hazard'   as const, emoji: '⚠️', label: 'Hazard',   sub: 'Risk Grid' },
            { id: 'metocean' as const, emoji: '🌊', label: 'Metocean', sub: 'Wind/Waves' },
          ].map((p) => (
            <button
              key={p.id}
              onClick={() => applyPreset(p.id)}
              className={`p-2 rounded-lg border text-center transition ${
                activePreset === p.id
                  ? 'bg-sky-100 text-sky-900 border-sky-400 font-bold shadow-sm dark:bg-cyan-950 dark:text-cyan-200 dark:border-cyan-400'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-sky-50 hover:border-sky-300 dark:bg-[#081022] dark:text-slate-400 dark:border-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <div className="text-[11px]">{p.emoji} {p.label}</div>
              <div className="text-[9px] text-slate-400 mt-0.5">{p.sub}</div>
            </button>
          ))}
        </div>

        {/* Manual Checkboxes */}
        {showManualCheckboxes && (
          <div className="pt-2 border-t border-sky-200/50 dark:border-slate-700/60 space-y-2 text-xs">
            <span className="text-[10px] text-sky-600 dark:text-cyan-400 font-bold uppercase tracking-wider block">
              ⚙️ Manual Overlay Layers
            </span>
            <div className="grid grid-cols-1 gap-1.5 pl-1 max-h-48 overflow-y-auto scrollbar-thin">
              {[
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
              ].map((item) => (
                <label
                  key={item.key}
                  className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-sky-700 dark:hover:text-slate-100 cursor-pointer text-[11px]"
                >
                  <input
                    type="checkbox"
                    id={`checkbox-layer-${item.key}`}
                    checked={layers[item.key as keyof MapLayerVisibility]}
                    onChange={() => {
                      setActivePreset('custom');
                      onToggleLayer(item.key as keyof MapLayerVisibility);
                    }}
                    className="rounded border-sky-300 bg-white text-sky-500 focus:ring-sky-400 h-3.5 w-3.5 dark:border-slate-700 dark:bg-[#081022] dark:text-cyan-500"
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Active Vessel Card ─── */}
      <div className="polar-card-elevated border rounded-xl p-3 space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ship className="w-3.5 h-3.5 text-sky-500 dark:text-cyan-400" />
            <span className="font-bold text-slate-700 dark:text-slate-200 text-xs uppercase tracking-wide">
              {vessel.name.split('/')[0]}
            </span>
          </div>
          <span className="text-[10px] px-2 py-0.5 polar-badge-emerald rounded-full font-bold">
            {vessel.iceClass}
          </span>
        </div>
        <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400 pt-0.5">
          <span>Speed: <strong className="text-sky-600 dark:text-cyan-300 font-mono">{vessel.cruisingSpeedKnots} kts</strong></span>
          <span>Fuel: <strong className="text-amber-600 dark:text-amber-300 font-mono">{vessel.fuelConsumptionLPerHr} L/hr</strong></span>
        </div>
      </div>
    </aside>
  );
};
