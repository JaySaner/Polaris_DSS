import React from 'react';
import {
  Home,
  Map,
  AlertTriangle,
  CloudSnow,
  BarChart2,
  Database,
  Ship,
  Compass,
  Microscope,
} from 'lucide-react';

interface IconSidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  userRole: 'navigator' | 'researcher';
  onToggleRole: () => void;
}

const navItems = [
  { id: 'dashboard', icon: Home, label: 'Home' },
  { id: 'routes', icon: Compass, label: 'Voyage' },
  { id: 'forecasts', icon: CloudSnow, label: 'Weather', researcherOnly: false },
  { id: 'icebergs', icon: Map, label: 'Monitor', researcherOnly: true },
  { id: 'explainable-ai', icon: AlertTriangle, label: 'Safety', researcherOnly: true },
  { id: 'metrics', icon: BarChart2, label: 'Analysis', researcherOnly: true },
  { id: 'datasources', icon: Database, label: 'Data Hub', researcherOnly: true },
  { id: 'vessel', icon: Ship, label: 'Vessel' },
];

export const IconSidebar: React.FC<IconSidebarProps> = ({ activeTab, onSelectTab, userRole, onToggleRole }) => {
  return (
    <aside className="hidden md:flex flex-col w-16 bg-white border-r border-slate-200 flex-shrink-0 items-center py-3 gap-1 select-none z-20">
      {/* Logo */}
      <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center mb-3 shadow-md">
        <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2L12 22M2 12L22 12M5.6 5.6L18.4 18.4M18.4 5.6L5.6 18.4" strokeLinecap="round" />
        </svg>
      </div>

      {/* Nav Icons */}
      <nav className="flex-1 flex flex-col items-center gap-0.5 w-full px-1.5">
        {navItems.map((item) => {
          // In navigator mode, skip researcher-only tabs
          if (userRole === 'navigator' && item.researcherOnly) return null;
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              title={item.label}
              className={`w-full flex flex-col items-center gap-0.5 py-2 rounded-xl text-[10px] font-medium transition-all ${
                isActive
                  ? 'bg-blue-50 text-blue-600 font-semibold'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-5 h-5" strokeWidth={isActive ? 2.2 : 1.8} />
              <span className="leading-none">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom: Role Toggle */}
      <div className="mt-auto flex flex-col items-center gap-1 w-full px-1.5 pb-2">
        <div className="w-full h-px bg-slate-200 mb-1" />
        <button
          onClick={onToggleRole}
          title={userRole === 'navigator' ? 'Switch to Researcher View' : 'Switch to Captain View'}
          className={`w-full flex flex-col items-center gap-0.5 py-2 rounded-xl text-[10px] font-semibold transition ${
            userRole === 'navigator'
              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
          }`}
        >
          {userRole === 'navigator' ? (
            <>
              <Ship className="w-5 h-5" strokeWidth={1.8} />
              <span className="leading-none">Captain</span>
            </>
          ) : (
            <>
              <Microscope className="w-5 h-5" strokeWidth={1.8} />
              <span className="leading-none">Research</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};
