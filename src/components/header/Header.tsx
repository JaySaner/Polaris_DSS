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
  UserCheck,
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
    { id: 'dashboard', label: 'Home & Map View', icon: Compass },
    { id: 'routes', label: 'Voyage Planning', icon: BarChart2 },
    { id: 'forecasts', label: '72h Forecasts', icon: CloudSnow },
    { id: 'icebergs', label: 'Iceberg Tracker', icon: Film, badge: 'NASA' },
    { id: 'explainable-ai', label: 'Explainable AI', icon: Shield },
    { id: 'metrics', label: 'AI Validation', icon: Radio },
    { id: 'datasources', label: 'Data Feeds', icon: Database },
    { id: 'vessel', label: 'Vessel Profile', icon: Ship },
  ];

  const isLight = theme === 'light';

  return (
    <header
      id="console-header"
      className={`${
        isLight
          ? 'bg-white border-b border-slate-200 text-slate-800'
          : 'bg-[#0B132B] border-b border-slate-800 text-slate-100'
      } flex flex-col z-30 select-none font-sans sticky top-0 shadow-sm`}
    >
      {/* Primary Top Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 gap-4">
        {/* Left: Branding + Global Search */}
        <div className="flex items-center gap-4 flex-1 max-w-2xl">
          <div className="flex items-center gap-2.5 flex-shrink-0 cursor-pointer" onClick={() => onSelectTab('dashboard')}>
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Compass className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-extrabold tracking-wider text-slate-900 dark:text-white uppercase">
                  POLARIS <span className="text-blue-600 dark:text-blue-400">DSS</span>
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  MoES / NCPOR
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-none mt-0.5">
                Antarctic Iceberg & Sea-Ice Navigation System
              </p>
            </div>
          </div>

          {/* Quick Search */}
          <div className="relative flex-1 hidden md:block max-w-xs ml-2">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search waypoints, icebergs, vessel data..."
              className={`w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border transition outline-none ${
                isLight
                  ? 'bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 text-slate-800 placeholder-slate-400'
                  : 'bg-slate-900 border-slate-700 focus:border-blue-400 text-slate-200 placeholder-slate-500'
              }`}
            />
          </div>
        </div>

        {/* Center / Status info */}
        <div className="hidden lg:flex items-center gap-4 text-xs font-medium">
          {/* Live Status Pill */}
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-[11px]">LIVE DATA STREAM</span>
          </div>

          {/* UTC Clock */}
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-mono text-[11px] bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-md">
            <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>{utcTime || '05 SEP 2026 01:38:00 UTC'}</span>
          </div>
        </div>

        {/* Right Controls & User Info */}
        <div className="flex items-center gap-2">
          {/* Active Alerts Pill */}
          {activeAlertCount > 0 && (
            <div className="flex items-center gap-1 px-2 py-1 bg-amber-500 text-white font-bold text-xs rounded-md shadow-sm animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{activeAlertCount}</span>
            </div>
          )}

          {/* Drift Surge Simulation */}
          <button
            onClick={onTriggerSimulationEvent}
            title="Simulate sudden iceberg drift surge"
            className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition active:scale-95"
          >
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            <span className="hidden xl:inline">Drift Surge</span>
          </button>

          {/* Map Layer Switcher */}
          <button
            onClick={onToggleMapProvider}
            title="Toggle Polar / Satellite map view"
            className={`p-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span className="hidden sm:inline">
              {mapProvider === 'antarctic-polar' ? 'Polar' : 'Satellite'}
            </span>
          </button>

          {/* Role Switcher */}
          <button
            onClick={onToggleRole}
            title={`Current Role: ${userRole}. Click to toggle.`}
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition ${
              userRole === 'navigator'
                ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800'
                : 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/40 dark:text-purple-300 dark:border-purple-800'
            }`}
          >
            {userRole === 'navigator' ? (
              <>
                <UserCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Navigator</span>
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
            title="Toggle Theme"
            className={`p-1.5 rounded-lg border transition ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
            }`}
          >
            {isLight ? <Sun className="w-3.5 h-3.5 text-amber-500" /> : <Moon className="w-3.5 h-3.5 text-blue-400" />}
          </button>

          {/* Help / Guide button */}
          <button
            onClick={() => setIsGuideOpen(true)}
            className={`p-1.5 rounded-lg border transition ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
            }`}
            title="System User Guide"
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>

          {/* User Badge */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
            <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-200 font-bold text-xs">
              <User className="w-4 h-4" />
            </div>
            <div className="hidden xl:block">
              <p className="text-xs font-bold leading-none text-slate-800 dark:text-slate-200">Team Catalyst</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 capitalize">{userRole}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Horizontal Nav Ribbon */}
      <nav className={`flex items-center overflow-x-auto px-4 py-1 gap-1 border-t scrollbar-none ${
        isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'
      }`}>
        {secondaryTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition flex items-center gap-1.5 whitespace-nowrap ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm font-semibold'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`text-[9px] px-1 py-0.2 rounded font-bold ${
                  isActive ? 'bg-blue-700 text-white' : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Guide Modal */}
      <UserGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
    </header>
  );
};
