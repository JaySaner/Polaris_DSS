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
      className="w-full md:w-80 lg:w-88 flex-shrink-0 bg-[#071326]/95 border-r border-cyan-900/40 text-slate-100 flex flex-col h-full overflow-y-auto select-none p-3.5 space-y-3.5 shadow-xl scrollbar-thin scrollbar-thumb-cyan-900"
    >
      {/* Sidebar Header Title */}
      <div className="flex items-center justify-between border-b border-cyan-900/50 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
            <Navigation className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-slate-100 text-xs tracking-wider uppercase font-sans">
            Passage Planner Controls
          </span>
        </div>
        <span className="text-[10px] px-2 py-0.5 bg-cyan-950/90 text-cyan-300 border border-cyan-500/40 rounded-full font-mono">
          Polaris Engine
        </span>
      </div>

      {/* STEP 1: Passage Destination & Objectives */}
      <div className="bg-gradient-to-b from-[#0C203F] to-[#08152B] p-3.5 rounded-xl border border-cyan-500/30 shadow-lg space-y-3">
        <div className="flex items-center justify-between border-b border-cyan-900/40 pb-1.5">
          <span className="font-bold text-cyan-300 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
            <span className="w-4 h-4 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center font-extrabold text-[10px]">
              1
            </span>
            Plan Destination & Objective
          </span>
        </div>

        {/* Departure Point */}
        <div className="space-y-1">
          <label className="text-[11px] text-slate-300 font-medium flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Departure Origin
          </label>
          <select
            id="select-departure-location"
            className="w-full bg-[#050D1A] border border-cyan-500/30 text-slate-100 text-xs rounded-lg p-2 focus:border-cyan-400 focus:outline-none transition font-medium"
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
        <div className="space-y-1">
          <label className="text-[11px] text-slate-300 font-medium flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            Target Antarctic Station
          </label>
          <select
            id="select-destination-station"
            className="w-full bg-[#050D1A] border border-cyan-500/40 text-slate-100 text-xs rounded-lg p-2 focus:border-cyan-400 focus:outline-none transition font-semibold"
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

          {/* Quick Select Station Chips */}
          <div className="flex flex-wrap gap-1 pt-1">
            {quickStations.map((qs) => {
              if (!qs.station) return null;
              const isSelected = destination.name === qs.station.name;
              return (
                <button
                  key={qs.name}
                  onClick={() => onSelectDestination(qs.station!.name, qs.station!.coords)}
                  className={`text-[10px] px-2 py-1 rounded-md transition font-semibold border ${
                    isSelected
                      ? 'bg-cyan-500/30 text-cyan-200 border-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.3)]'
                      : 'bg-[#050D1A]/80 text-slate-400 border-slate-700 hover:text-slate-200 hover:border-slate-500'
                  }`}
                >
                  {qs.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Routing Objective Chips */}
        <div className="space-y-1.5 pt-1">
          <label className="text-[11px] text-slate-300 font-medium flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            Route Optimization Mode
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
                  className={`p-2 rounded-lg text-left border transition-all ${
                    isSelected
                      ? 'bg-gradient-to-br from-[#0E284E] to-[#0A1E3C] border-cyan-400 text-cyan-100 shadow-[0_0_10px_rgba(56,189,248,0.25)] font-semibold'
                      : 'bg-[#050D1A] border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 font-semibold text-[11px]">
                      <Icon className={`w-3 h-3 ${obj.color}`} />
                      <span>{obj.label}</span>
                    </div>
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
          className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-lg shadow-[0_0_18px_rgba(6,182,212,0.3)] transition flex items-center justify-center gap-2 text-xs uppercase tracking-wider active:scale-98"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Recalculate Safe Corridor</span>
        </button>
      </div>

      {/* STEP 2: 72-Hour Forecast Scrubber */}
      <div className="bg-[#091830] p-3.5 rounded-xl border border-cyan-900/30 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="font-bold text-cyan-300 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
            <span className="w-4 h-4 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center font-extrabold text-[10px]">
              2
            </span>
            72h Ice Forecast Horizon
          </span>
          <span className="text-cyan-300 font-bold text-[10px] bg-[#050D1A] px-2 py-0.5 rounded-full border border-cyan-500/30 font-mono">
            {selectedHorizon === 0 ? 'NOW (Live Sat)' : `+${selectedHorizon}h Forecast`}
          </span>
        </div>

        {/* Timeline Stepper Buttons */}
        <div className="flex items-center justify-between gap-1 pt-0.5">
          <button
            onClick={() => setIsPlayingForecast(!isPlayingForecast)}
            title={isPlayingForecast ? 'Pause 72h forecast simulation' : 'Play 72h forecast simulation'}
            className={`p-1.5 rounded-lg border transition ${
              isPlayingForecast
                ? 'bg-rose-950 text-rose-300 border-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.3)]'
                : 'bg-[#050D1A] text-cyan-300 border-cyan-500/30 hover:border-cyan-400'
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
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                  : 'bg-[#050D1A] text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              {h === 0 ? '0h' : `+${h}h`}
            </button>
          ))}
        </div>
      </div>

      {/* STEP 3: Map Preset Modes (Simplified Layer Controls) */}
      <div className="bg-[#091830] p-3.5 rounded-xl border border-cyan-900/30 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="font-bold text-cyan-300 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
            <span className="w-4 h-4 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center font-extrabold text-[10px]">
              3
            </span>
            Map Display Mode
          </span>
          <button
            onClick={() => setShowManualCheckboxes(!showManualCheckboxes)}
            className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1 font-medium"
          >
            {showManualCheckboxes ? 'Hide Manual Layers' : 'Manual Layers'}
            {showManualCheckboxes ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        {/* Preset Cards */}
        <div className="grid grid-cols-3 gap-1.5">
          <button
            onClick={() => applyPreset('tactical')}
            className={`p-2 rounded-lg border text-center transition ${
              activePreset === 'tactical'
                ? 'bg-cyan-950 text-cyan-200 border-cyan-400 font-bold shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                : 'bg-[#050D1A] text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <div className="text-[11px]">🎯 Tactical</div>
            <div className="text-[9px] text-slate-400 mt-0.5">Clean View</div>
          </button>
          <button
            onClick={() => applyPreset('hazard')}
            className={`p-2 rounded-lg border text-center transition ${
              activePreset === 'hazard'
                ? 'bg-cyan-950 text-cyan-200 border-cyan-400 font-bold shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                : 'bg-[#050D1A] text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <div className="text-[11px]">⚠️ Hazard Radar</div>
            <div className="text-[9px] text-slate-400 mt-0.5">Risk Grid</div>
          </button>
          <button
            onClick={() => applyPreset('metocean')}
            className={`p-2 rounded-lg border text-center transition ${
              activePreset === 'metocean'
                ? 'bg-cyan-950 text-cyan-200 border-cyan-400 font-bold shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                : 'bg-[#050D1A] text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <div className="text-[11px]">🌊 Metocean</div>
            <div className="text-[9px] text-slate-400 mt-0.5">Wind/Waves</div>
          </button>
        </div>

        {/* Optional Manual Checkboxes (Collapsed by Default) */}
        {showManualCheckboxes && (
          <div className="pt-2 border-t border-slate-800/80 space-y-2 text-xs">
            <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider block">
              ⚙️ Manual Overlay Checkboxes
            </span>
            <div className="grid grid-cols-1 gap-1.5 pl-1 max-h-48 overflow-y-auto scrollbar-thin">
              {[
                { key: 'seaIce', label: 'Sea-Ice Concentration (Heatmap)' },
                { key: 'predictedSeaIce', label: 'Predicted Ice Expansion (+72h)' },
                { key: 'icebergs', label: 'Iceberg Fixes' },
                { key: 'predictedIcebergTrajectories', label: 'Iceberg Trajectory Vectors' },
                { key: 'uncertaintyCones', label: 'Uncertainty Ellipses' },
                { key: 'navigationRiskGrid', label: 'Polar Risk Grid' },
                { key: 'recommendedRoute', label: 'Recommended Route' },
                { key: 'alternativeRoutes', label: 'Alternative Routes' },
                { key: 'researchStations', label: 'Research Stations' },
                { key: 'vessel', label: 'Vessel Fix & Heading' },
                { key: 'windVectors', label: '10m Wind Vectors' },
                { key: 'oceanCurrents', label: 'Ocean Current Vectors' },
                { key: 'graticule', label: 'Polar Graticule Grid' },
              ].map((item) => (
                <label
                  key={item.key}
                  className="flex items-center gap-2 text-slate-300 hover:text-slate-100 cursor-pointer text-[11px]"
                >
                  <input
                    type="checkbox"
                    id={`checkbox-layer-${item.key}`}
                    checked={layers[item.key as keyof MapLayerVisibility]}
                    onChange={() => {
                      setActivePreset('custom');
                      onToggleLayer(item.key as keyof MapLayerVisibility);
                    }}
                    className="rounded border-slate-700 bg-[#050D1A] text-cyan-500 focus:ring-cyan-400 focus:ring-offset-[#071326] h-3.5 w-3.5"
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Active Vessel Specifications Card */}
      <div className="bg-[#091830] p-3 rounded-xl border border-cyan-900/30 space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ship className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-bold text-slate-200 text-xs uppercase tracking-wider">
              {vessel.name.split('/')[0]}
            </span>
          </div>
          <span className="text-[10px] px-2 py-0.2 bg-emerald-950 text-emerald-300 border border-emerald-500/50 rounded-full font-bold">
            {vessel.iceClass}
          </span>
        </div>
        <div className="flex justify-between text-[10px] text-slate-400 pt-0.5">
          <span>Speed: <strong className="text-cyan-300 font-mono">{vessel.cruisingSpeedKnots} kts</strong></span>
          <span>Fuel: <strong className="text-amber-300 font-mono">{vessel.fuelConsumptionLPerHr} L/hr</strong></span>
        </div>
      </div>
    </aside>
  );
};

