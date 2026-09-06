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
      className="bg-slate-900 border-b border-slate-700 text-white flex flex-col z-30 select-none shadow-lg relative"
    >
      {/* Top Atmospheric Glow Line */}
      <div className="h-[2px] w-full bg-sky-600" />

      {/* Main Command Bar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-3 gap-3 border-b border-slate-700 bg-slate-900">
        {/* Left: Branding & Mission Info */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-slate-800 border border-slate-700">
            <Compass className="w-5 h-5 text-sky-400 animate-spin-slow" />
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-sky-400 animate-ping" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-widest text-sky-400 uppercase">
                POLARIS DSS
              </span>
              <span className="text-[10px] px-2 py-0.5 bg-slate-800 text-slate-300 border border-slate-700 rounded-full font-medium">
                MoES • NCPOR
              </span>
              <span className="hidden sm:inline-block text-[10px] px-2 py-0.5 bg-emerald-900/30 text-emerald-300 border border-emerald-700 rounded-full font-medium">
                Polar Code PC5 Safe
              </span>
            </div>
            <h1 className="text-sm font-semibold tracking-tight text-white font-sans flex items-center gap-1.5">
              Antarctic Sea-Ice, Iceberg Trajectory & Navigation System
            </h1>
          </div>
        </div>

        {/* Right: Telemetry Clocks, UI Guide, Scenario Simulation, Map Engine Switcher */}
        <div className="flex items-center flex-wrap gap-2.5 text-xs">
          {/* Synchronized Polar Clocks */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200">
            <Clock className="w-3.5 h-3.5 text-sky-400" />
            <div className="flex items-center gap-2 text-[11px]">
              <span className="font-semibold text-white font-mono">{utcTime || '02:30:00 UTC'}</span>
              <span className="text-slate-600">|</span>
              <span className="text-sky-400 font-mono" title="Indian Antarctic Stations (Bharati / Maitri Time)">
                STN (UTC+5): {stationTime || '07:30:00'}
              </span>
            </div>
          </div>

          {/* Quick UI Guide Modal Trigger */}
          <button
            id="btn-open-user-guide"
            onClick={() => setIsGuideOpen(true)}
            title="Open Interactive System Guide & Visual Map Explanations"
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-sky-500 text-white rounded-lg transition flex items-center gap-1.5 text-xs font-semibold active:scale-95"
          >
            <HelpCircle className="w-4 h-4 text-sky-400" />
            <span>UI Guide</span>
          </button>

          {/* Map Engine Toggle */}
          <button
            id="btn-toggle-map-provider"
            onClick={onToggleMapProvider}
            title="Toggle between South Polar Stereographic Canvas and Google Maps Satellite"
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-sky-500 text-slate-200 hover:text-white rounded-lg transition flex items-center gap-1.5 text-xs font-medium shadow-sm"
          >
            <Layers className="w-3.5 h-3.5 text-sky-400" />
            <span>Map: {mapProvider === 'antarctic-polar' ? 'Polar 3D Canvas' : 'Satellite View'}</span>
          </button>

          {/* Simulate Hazardous Drift Event Button */}
          <button
            id="btn-simulate-event-header"
            onClick={onTriggerSimulationEvent}
            title="Simulate sudden iceberg accelerated drift into transit lane to trigger automated bypass reroute"
            className="px-3 py-1.5 bg-rose-900/40 hover:bg-rose-900/60 border border-rose-700 hover:border-rose-500 text-rose-200 rounded-lg transition flex items-center gap-1.5 text-xs font-semibold active:scale-95"
          >
            <Activity className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
            <span>Simulate Berg Drift Surge</span>
          </button>

          {/* Alert Status Pill */}
          {activeAlertCount > 0 ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-900/30 text-amber-200 border border-amber-700 rounded-lg font-semibold text-xs animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>{activeAlertCount} Warning{activeAlertCount > 1 ? 's' : ''}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-900/30 text-emerald-300 border border-emerald-700 rounded-lg text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Normal Operations</span>
            </div>
          )}
        </div>
      </div>

      {/* Modern Navigation Tabs Ribbon */}
      <nav
        id="console-nav-tabs"
        className="flex items-center overflow-x-auto px-4 bg-slate-900 scrollbar-none border-b border-slate-700"
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
                    ? 'text-white bg-slate-800 border border-sky-500 font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="text-[9px] px-1.5 py-0.2 bg-sky-900/40 text-sky-300 border border-sky-700 rounded font-bold">
                    {tab.badge}
                  </span>
                )}
                {isActive && (
                  <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-sky-400 rounded-full" />
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

