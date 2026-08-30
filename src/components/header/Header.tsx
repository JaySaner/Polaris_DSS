import React, { useState, useEffect } from 'react';
import {
  Compass,
  Radio,
  Clock,
  Activity,
  AlertTriangle,
  Shield,
  Layers,
  Database,
  BarChart2,
  Ship,
  Sparkles,
  RefreshCw,
  Anchor,
  CloudSnow,
  MapPin,
  Film,
  HelpCircle,
} from 'lucide-react';
import { UserGuideModal } from '../modals/UserGuideModal';

interface HeaderProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  activeAlertCount: number;
  onTriggerSimulationEvent: () => void;
  mapProvider: 'antarctic-polar' | 'google-maps-satellite';
  onToggleMapProvider: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  activeAlertCount,
  onTriggerSimulationEvent,
  mapProvider,
  onToggleMapProvider,
}) => {
  const [utcTime, setUtcTime] = useState<string>('');
  const [stationTime, setStationTime] = useState<string>('');
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const utcHours = now.getUTCHours().toString().padStart(2, '0');
      const utcMins = now.getUTCMinutes().toString().padStart(2, '0');
      const utcSecs = now.getUTCSeconds().toString().padStart(2, '0');
      setUtcTime(`${utcHours}:${utcMins}:${utcSecs} UTC`);

      // Bharati / Maitri Station Time (UTC+5:00)
      const stnDate = new Date(now.getTime() + 5 * 3600 * 1000);
      const stnHours = stnDate.getUTCHours().toString().padStart(2, '0');
      const stnMins = stnDate.getUTCMinutes().toString().padStart(2, '0');
      const stnSecs = stnDate.getUTCSeconds().toString().padStart(2, '0');
      setStationTime(`${stnHours}:${stnMins}:${stnSecs}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const navTabs = [
    { id: 'dashboard', label: 'Voyage & Map', icon: Compass, badge: 'LIVE' },
    { id: 'icebergs', label: 'Iceberg Animations', icon: Film, badge: 'NASA SCP' },
    { id: 'forecasts', label: '72h Forecasts', icon: CloudSnow },
    { id: 'routes', label: 'Route Comparison', icon: BarChart2 },
    { id: 'explainable-ai', label: 'Explainable AI', icon: Shield },
    { id: 'metrics', label: 'AI Validation', icon: Radio },
    { id: 'datasources', label: 'Satellite Feeds', icon: Database },
    { id: 'vessel', label: 'Vessel Profile', icon: Ship },
  ];

  return (
    <header
      id="console-header"
      className="bg-[#050E1D] border-b border-cyan-900/40 text-slate-100 flex flex-col z-30 select-none shadow-2xl relative"
    >
      {/* Top Atmospheric Glow Line */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-80" />

      {/* Main Command Bar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2.5 gap-3 border-b border-slate-800/60 bg-gradient-to-b from-[#08152B] to-[#050E1D]">
        {/* Left: Branding & Mission Info */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-900/40 border border-cyan-400/40 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
            <Compass className="w-5 h-5 text-cyan-300 animate-spin-slow" />
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-widest text-cyan-400 uppercase">
                POLARIS DSS
              </span>
              <span className="text-[10px] px-2 py-0.5 bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 rounded-full font-medium">
                MoES • NCPOR
              </span>
              <span className="hidden sm:inline-block text-[10px] px-2 py-0.5 bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 rounded-full font-medium">
                Polar Code PC5 Safe
              </span>
            </div>
            <h1 className="text-sm font-semibold tracking-tight text-slate-100 font-sans flex items-center gap-1.5">
              Antarctic Sea-Ice, Iceberg Trajectory & Navigation System
            </h1>
          </div>
        </div>

        {/* Right: Telemetry Clocks, UI Guide, Scenario Simulation, Map Engine Switcher */}
        <div className="flex items-center flex-wrap gap-2.5 text-xs">
          {/* Synchronized Polar Clocks */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#091830] border border-cyan-500/20 rounded-lg text-slate-200 shadow-inner">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <div className="flex items-center gap-2 text-[11px]">
              <span className="font-semibold text-slate-100 font-mono">{utcTime || '02:30:00 UTC'}</span>
              <span className="text-slate-600">|</span>
              <span className="text-cyan-300 font-mono" title="Indian Antarctic Stations (Bharati / Maitri Time)">
                STN (UTC+5): {stationTime || '07:30:00'}
              </span>
            </div>
          </div>

          {/* Quick UI Guide Modal Trigger */}
          <button
            id="btn-open-user-guide"
            onClick={() => setIsGuideOpen(true)}
            title="Open Interactive System Guide & Visual Map Explanations"
            className="px-3 py-1.5 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-400/50 hover:border-cyan-300 text-cyan-200 rounded-lg transition flex items-center gap-1.5 text-xs font-semibold shadow-[0_0_12px_rgba(6,182,212,0.25)] active:scale-95"
          >
            <HelpCircle className="w-4 h-4 text-cyan-300" />
            <span>UI Guide</span>
          </button>

          {/* Map Engine Toggle */}
          <button
            id="btn-toggle-map-provider"
            onClick={onToggleMapProvider}
            title="Toggle between South Polar Stereographic Canvas and Google Maps Satellite"
            className="px-3 py-1.5 bg-[#091830] hover:bg-[#0E2448] border border-cyan-500/30 hover:border-cyan-400 text-slate-200 hover:text-cyan-200 rounded-lg transition flex items-center gap-1.5 text-xs font-medium shadow-sm"
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Map: {mapProvider === 'antarctic-polar' ? 'Polar 3D Canvas' : 'Satellite View'}</span>
          </button>

          {/* Simulate Hazardous Drift Event Button */}
          <button
            id="btn-simulate-event-header"
            onClick={onTriggerSimulationEvent}
            title="Simulate sudden iceberg accelerated drift into transit lane to trigger automated bypass reroute"
            className="px-3 py-1.5 bg-rose-950/80 hover:bg-rose-900 border border-rose-500/60 hover:border-rose-400 text-rose-200 rounded-lg transition flex items-center gap-1.5 text-xs font-semibold shadow-[0_0_15px_rgba(244,63,94,0.2)] active:scale-95"
          >
            <Activity className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
            <span>Simulate Berg Drift Surge</span>
          </button>

          {/* Alert Status Pill */}
          {activeAlertCount > 0 ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-950/90 text-amber-200 border border-amber-500/60 rounded-lg font-semibold text-xs animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>{activeAlertCount} Warning{activeAlertCount > 1 ? 's' : ''}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Normal Operations</span>
            </div>
          )}
        </div>
      </div>

      {/* Modern Navigation Tabs Ribbon */}
      <nav
        id="console-nav-tabs"
        className="flex items-center overflow-x-auto px-4 bg-[#050D1C] scrollbar-none border-b border-cyan-900/30"
      >
        <div className="flex space-x-1 py-1.5">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`nav-tab-${tab.id}`}
                onClick={() => onSelectTab(tab.id)}
                className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-2 whitespace-nowrap relative ${
                  isActive
                    ? 'text-cyan-200 bg-gradient-to-b from-[#0C254A] to-[#091D3B] border border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.2)] font-semibold'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-[#081730]/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-300' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="text-[9px] px-1.5 py-0.2 bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 rounded font-bold">
                    {tab.badge}
                  </span>
                )}
                {isActive && (
                  <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-cyan-400 rounded-full shadow-[0_0_8px_#38bdf8]" />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Render User Guide Modal */}
      <UserGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
    </header>
  );
};

