import React, { useState, useEffect } from 'react';
import {
  Compass,
  Search,
  Bell,
  Clock,
  Activity,
  AlertTriangle,
  Layers,
  HelpCircle,
  Microscope,
  Sun,
  Moon,
  Shield,
  Radio,
  Database,
  Ship,
  BarChart2,
  CloudSnow,
  Film,
  User,
} from 'lucide-react';
import { UserGuideModal } from '../modals/UserGuideModal';

interface HeaderProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  activeAlertCount: number;
  onTriggerSimulationEvent: () => void;
  mapProvider: 'antarctic-polar' | 'google-maps-satellite';
  onToggleMapProvider: () => void;
  userRole: 'navigator' | 'researcher';
  onToggleRole: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  activeAlertCount,
  onTriggerSimulationEvent,
  mapProvider,
  onToggleMapProvider,
  userRole,
  onToggleRole,
  theme,
  onToggleTheme,
}) => {
  const [utcTime, setUtcTime] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const dateStr = now.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        timeZone: 'UTC',
      }).toUpperCase();
      const timeStr = now.toISOString().substring(11, 19);
      setUtcTime(`${dateStr} ${timeStr} UTC`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const secondaryTabs = [
    { id: 'dashboard', label: 'Home & Map', icon: Compass, researcherOnly: false },
    { id: 'routes', label: 'Voyage Planning', icon: BarChart2, researcherOnly: false },
    { id: 'forecasts', label: '72h Forecasts', icon: CloudSnow, researcherOnly: false },
    { id: 'icebergs', label: 'Iceberg Tracker', icon: Film, badge: 'NASA', researcherOnly: true },
    { id: 'explainable-ai', label: 'Explainable AI', icon: Shield, researcherOnly: true },
    { id: 'metrics', label: 'AI Validation', icon: Radio, researcherOnly: true },
    { id: 'datasources', label: 'Data Feeds', icon: Database, researcherOnly: true },
    { id: 'vessel', label: 'Vessel Profile', icon: Ship, researcherOnly: false },
  ];

  const visibleTabs = secondaryTabs.filter(tab => userRole === 'researcher' || !tab.researcherOnly);
  const isLight = theme === 'light';

  return (
    <header
      id="console-header"
      className={`${
        isLight
          ? 'bg-white border-b border-slate-200 text-slate-900 shadow-sm'
          : 'bg-[#091122] border-b border-slate-800 text-slate-100 shadow-md'
      } flex flex-col z-30 select-none font-sans sticky top-0`}
    >
      {/* Primary Top Bar — 3 zone flex layout */}
      <div className="flex items-center gap-2 px-3 py-2 min-w-0">

        {/* LEFT: Logo & Branding — fixed narrow zone, never overlaps center */}
        <div className="flex items-center gap-2 flex-shrink-0 min-w-0" style={{ maxWidth: '200px' }}>
          <div
            className="flex items-center gap-2 cursor-pointer min-w-0"
            onClick={() => onSelectTab('dashboard')}
            title="POLARIS DSS — Antarctic Decision Support System"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-sky-400 flex items-center justify-center text-white shadow-md shadow-blue-500/30 flex-shrink-0 border border-blue-400/30">
              <Compass className="w-4 h-4" />
            </div>
            <div className="flex flex-col leading-none min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h1 className="text-sm font-black tracking-wider uppercase text-slate-900 dark:text-white leading-none whitespace-nowrap">
                  <span className="text-blue-600 dark:text-blue-400">POLARIS</span>
                  {' '}
                  <span className="px-1 py-0.5 rounded bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-black text-[10px] shadow-sm">
                    DSS
                  </span>
                </h1>
              </div>
              <p className="text-[9px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5 whitespace-nowrap hidden sm:block">
                MoES / NCPOR
              </p>
            </div>
          </div>
        </div>

        {/* Vertical divider */}
        <div className="hidden md:block w-px h-6 bg-slate-200 dark:bg-slate-700 flex-shrink-0" />

        {/* CENTER: Search + Status — takes remaining space, min-w-0 prevents overflow */}
        <div className="flex-1 min-w-0 flex items-center gap-2">
          {/* Quick Search */}
          <div className="relative hidden md:block w-44 xl:w-52 flex-shrink-0">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search waypoints, bergs..."
              className={`w-full pl-7 pr-2 py-1.5 text-xs rounded-lg border transition outline-none font-medium ${
                isLight
                  ? 'bg-slate-100 border-slate-300 focus:bg-white focus:border-blue-500 text-slate-900 placeholder-slate-400'
                  : 'bg-slate-900 border-slate-700 focus:border-blue-400 text-slate-100 placeholder-slate-500'
              }`}
            />
          </div>

          {/* Live Data Stream Indicator */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 flex-shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
            <span className="font-black text-[10px] tracking-wide whitespace-nowrap">LIVE DATA</span>
          </div>

          {/* UTC Clock */}
          <div className={`hidden xl:flex items-center gap-1 text-slate-800 dark:text-slate-200 font-mono text-[10px] px-2 py-1.5 rounded-lg border whitespace-nowrap font-bold flex-shrink-0 ${
            isLight ? 'bg-slate-100 border-slate-300' : 'bg-slate-800 border-slate-700'
          }`}>
            <Clock className="w-3 h-3 text-blue-600 dark:text-blue-400" />
            <span>{utcTime || '--'}</span>
          </div>
        </div>

        {/* RIGHT: Controls — flex-shrink-0, no wrapping */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Active Alerts */}
          {activeAlertCount > 0 && (
            <div className="flex items-center gap-1 px-2 py-1 bg-amber-500 text-white font-black text-xs rounded-lg shadow animate-pulse whitespace-nowrap">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{activeAlertCount}</span>
              <span className="hidden sm:inline">ALERTS</span>
            </div>
          )}

          {/* Drift Surge Simulation */}
          <button
            onClick={onTriggerSimulationEvent}
            title="Simulate sudden iceberg drift surge hazard"
            className="p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition active:scale-95 flex items-center gap-1"
          >
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            <span className="hidden xl:inline text-xs font-bold">Surge</span>
          </button>

          {/* Map Layer Switcher */}
          <button
            onClick={onToggleMapProvider}
            title="Toggle Polar Vector / Satellite map"
            className={`p-1.5 rounded-lg border text-xs font-bold flex items-center gap-1 transition whitespace-nowrap ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span className="hidden lg:inline">
              {mapProvider === 'antarctic-polar' ? 'Polar' : 'Satellite'}
            </span>
          </button>

          {/* Role Switcher */}
          <button
            onClick={onToggleRole}
            title={`View: ${userRole === 'navigator' ? 'Ship Captain / Bridge' : 'Polar Researcher'}. Click to toggle.`}
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-black flex items-center gap-1.5 shadow transition active:scale-95 whitespace-nowrap ${
              userRole === 'navigator'
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500'
                : 'bg-purple-600 hover:bg-purple-700 text-white border-purple-500'
            }`}
          >
            {userRole === 'navigator' ? (
              <>
                <Ship className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Captain</span>
              </>
            ) : (
              <>
                <Microscope className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Researcher</span>
              </>
            )}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            title="Toggle Light/Dark Theme"
            className={`p-1.5 rounded-lg border transition ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
            }`}
          >
            {isLight ? <Sun className="w-3.5 h-3.5 text-amber-500" /> : <Moon className="w-3.5 h-3.5 text-blue-400" />}
          </button>

          {/* Help */}
          <button
            onClick={() => setIsGuideOpen(true)}
            className={`p-1.5 rounded-lg border transition ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
            }`}
            title="System User Guide"
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>

          {/* User Badge */}
          <div className="flex items-center gap-1.5 pl-1.5 border-l border-slate-200 dark:border-slate-700">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shadow-sm flex-shrink-0 ${
              userRole === 'navigator' ? 'bg-emerald-600 text-white' : 'bg-purple-600 text-white'
            }`}>
              <User className="w-3.5 h-3.5" />
            </div>
            <div className="hidden xl:block leading-tight">
              <p className="text-xs font-black text-slate-900 dark:text-slate-100 whitespace-nowrap">Team Catalyst</p>
              <p className="text-[9px] text-slate-500 dark:text-slate-400 font-semibold capitalize whitespace-nowrap">
                {userRole === 'navigator' ? 'Bridge Officer' : 'Chief Scientist'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Horizontal Nav Ribbon */}
      <nav className={`flex items-center overflow-x-auto px-3 py-1 gap-1 border-t scrollbar-none ${
        isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#070D18] border-slate-800'
      }`}>
        {visibleTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 ${
                isActive
                  ? 'bg-blue-600 text-white shadow font-bold'
                  : isLight
                  ? 'text-slate-600 hover:bg-blue-50 hover:text-blue-700'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`text-[9px] px-1.5 rounded font-black ${
                  isActive ? 'bg-blue-800 text-white' : 'bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-300'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <UserGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
    </header>
  );
};
