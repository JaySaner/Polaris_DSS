import React, { useState } from 'react';
import {
  MapLayerVisibility,
  VesselProfile,
  IcebergObservation,
  IcebergForecast,
  CandidateRoute,
  SeaIceGridPoint,
  RiskGridCell,
  RouteWaypoint,
  RoutingObjective,
  NavAlert,
  GeoCoordinate,
} from '../types';
import { AntarcticMap } from '../components/map/AntarcticMap';
import { GoogleMapsAntarcticProvider } from '../components/map/GoogleMapsAntarcticProvider';
import { NavigationSidebar } from '../components/sidebar/NavigationSidebar';
import { VoyageTelemetryBar } from '../components/telemetry/VoyageTelemetryBar';
import { IcebergModal } from '../components/modals/IcebergModal';
import { SeaIceModal } from '../components/modals/SeaIceModal';
import { WaypointModal } from '../components/modals/WaypointModal';
import {
  AlertTriangle,
  PanelLeftClose,
  PanelLeftOpen,
  Compass,
  ArrowRight,
  BarChart2,
  Info,
  Shield,
  ShieldCheck,
  ShieldAlert,
  RotateCcw,
  Navigation,
  Anchor,
} from 'lucide-react';

interface HomeDashboardProps {
  userRole?: 'navigator' | 'researcher';
  layers: MapLayerVisibility;
  onToggleLayer: (layerKey: keyof MapLayerVisibility) => void;
  vessel: VesselProfile;
  icebergs: IcebergObservation[];
  activeRoute: CandidateRoute | null;
  allRoutes: CandidateRoute[];
  onSelectRoute?: (routeId: string) => void;
  seaIceGrid: SeaIceGridPoint[];
  riskGrid: RiskGridCell[];
  selectedHorizon: number;
  onChangeHorizon: (horizon: number) => void;
  startLocation: { name: string; coords: GeoCoordinate };
  destination: { name: string; coords: GeoCoordinate };
  onSelectStartLocation: (name: string, coords: GeoCoordinate) => void;
  onSelectDestination: (name: string, coords: GeoCoordinate) => void;
  objective: RoutingObjective;
  onChangeObjective: (obj: RoutingObjective) => void;
  onRecalculateRoutes: () => void;
  alerts: NavAlert[];
  onAcknowledgeAlert: (id: string) => void;
  onSimulateDriftSpike: (bergId: string) => void;
  mapProvider: 'antarctic-polar' | 'google-maps-satellite';
  onNavigateToTab: (tabId: string) => void;
  recalculationBanner: { show: boolean; oldRouteName: string; newRouteName: string; reason: string } | null;
  onDismissRecalculationBanner: () => void;
  destinationSet?: boolean;
}

/** Returns safety status label + color classes based on the actual safetyScore (0–100, higher = safer) */
function getSafetyStatus(score: number): {
  label: string;
  colorClass: string;
  bgClass: string;
  borderClass: string;
  Icon: React.FC<{ className?: string }>;
} {
  if (score >= 75) {
    return {
      label: 'SAFE',
      colorClass: 'text-emerald-400',
      bgClass: 'bg-emerald-500/20',
      borderClass: 'border-emerald-500/60',
      Icon: ShieldCheck,
    };
  } else if (score >= 50) {
    return {
      label: 'CAUTION',
      colorClass: 'text-amber-400',
      bgClass: 'bg-amber-500/20',
      borderClass: 'border-amber-500/60',
      Icon: Shield,
    };
  } else {
    return {
      label: 'HIGH RISK',
      colorClass: 'text-rose-400',
      bgClass: 'bg-rose-500/20',
      borderClass: 'border-rose-500/60',
      Icon: ShieldAlert,
    };
  }
}

/** Format hours into readable duration e.g. "2d 14h" */
function formatDuration(hours: number): string {
  if (!isFinite(hours) || hours <= 0) return '--';
  const days = Math.floor(hours / 24);
  const remainHours = Math.round(hours % 24);
  if (days === 0) return `${remainHours}h`;
  if (remainHours === 0) return `${days}d`;
  return `${days}d ${remainHours}h`;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  userRole = 'navigator',
  layers,
  onToggleLayer,
  vessel,
  icebergs,
  activeRoute,
  allRoutes,
  onSelectRoute,
  seaIceGrid,
  riskGrid,
  selectedHorizon,
  onChangeHorizon,
  startLocation,
  destination,
  onSelectStartLocation,
  onSelectDestination,
  objective,
  onChangeObjective,
  onRecalculateRoutes,
  alerts,
  onAcknowledgeAlert,
  onSimulateDriftSpike,
  mapProvider,
  onNavigateToTab,
  recalculationBanner,
  onDismissRecalculationBanner,
  destinationSet = false,
}) => {
  const [selectedIceberg, setSelectedIceberg] = useState<{
    obs: IcebergObservation;
    forecast: IcebergForecast;
  } | null>(null);
  const [selectedSeaIcePoint, setSelectedSeaIcePoint] = useState<SeaIceGridPoint | null>(null);
  const [selectedWaypoint, setSelectedWaypoint] = useState<RouteWaypoint | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [showMapLegend, setShowMapLegend] = useState<boolean>(true);

  const googleApiKey = (import.meta as any).env?.VITE_MAP_API_KEY || 'AIzaSyACETGOeAE-n_LsfRVN3isRGx5rJFLP1LU';

  // Safely extract route values with proper fallbacks
  const distanceNm = activeRoute ? activeRoute.totalDistanceNm : null;
  const distanceKm = activeRoute ? activeRoute.totalDistanceKm : null;
  const durationHours = activeRoute ? activeRoute.estimatedTravelTimeHours : null;
  const safetyScore = activeRoute ? activeRoute.safetyScore : null;
  const bergCpaNm = activeRoute ? activeRoute.closestIcebergCpaNm : null;
  const bergName = activeRoute ? activeRoute.closestIcebergName : null;
  const routeName = activeRoute ? activeRoute.name : null;
  const isRecommended = activeRoute ? activeRoute.isRecommended : false;

  const safetyStatus = safetyScore !== null ? getSafetyStatus(safetyScore) : null;
  const isNavigator = userRole === 'navigator';

  const unacknowledgedCritical = alerts.filter((a) => !a.acknowledged && (a.type === 'CRITICAL' || a.type === 'WARNING'));
  const primaryAlert = unacknowledgedCritical[0] || null;

  return (
    <div id="home-operational-dashboard" className="flex flex-col flex-1 h-full overflow-hidden relative font-sans">

      {/* Dynamic Recalculation Alert Banner */}
      {recalculationBanner && recalculationBanner.show && (
        <div
          id="dynamic-recalculation-banner"
          className="bg-rose-950 border-b border-rose-700 text-rose-100 px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs z-30 shadow-lg"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 animate-pulse" />
            <span className="font-extrabold uppercase tracking-wider text-rose-300">ROUTE UPDATE:</span>
            <span>
              <strong className="text-white">{recalculationBanner.oldRouteName}</strong> risk exceeded threshold.{' '}
              Switching to <strong className="text-cyan-300 font-mono">{recalculationBanner.newRouteName}</strong>.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigateToTab('routes')}
              className="px-3 py-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-lg text-xs transition"
            >
              Review Routes
            </button>
            <button
              onClick={onDismissRecalculationBanner}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg text-xs transition"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area: Left Sidebar + Right Map */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative min-h-0">

        {/* Collapsible Left Navigation Sidebar */}
        <div
          className={`${
            isSidebarCollapsed ? 'hidden md:hidden' : 'w-full md:w-80 lg:w-88 flex-shrink-0'
          } h-full overflow-hidden transition-all duration-200`}
        >
          <NavigationSidebar
            userRole={userRole}
            layers={layers}
            onToggleLayer={onToggleLayer}
            vessel={vessel}
            startLocation={startLocation}
            destination={destination}
            onSelectStartLocation={onSelectStartLocation}
            onSelectDestination={onSelectDestination}
            objective={objective}
            onChangeObjective={onChangeObjective}
            selectedHorizon={selectedHorizon}
            onChangeHorizon={onChangeHorizon}
            activeRoute={activeRoute}
            onRecalculateRoutes={onRecalculateRoutes}
          />
        </div>

        {/* Floating Sidebar Toggle Button */}
        <button
          id="btn-toggle-sidebar"
          onClick={() => setIsSidebarCollapsed((prev) => !prev)}
          className="hidden md:flex absolute top-3 z-30 items-center justify-center p-2 rounded-xl bg-slate-900/90 hover:bg-blue-600 border border-slate-700 text-white shadow-xl backdrop-blur-md transition active:scale-95"
          style={{ left: isSidebarCollapsed ? '12px' : 'calc(20rem + 8px)' }}
          title={isSidebarCollapsed ? 'Expand Passage Planner' : 'Collapse Sidebar'}
        >
          {isSidebarCollapsed ? (
            <PanelLeftOpen className="w-4 h-4" />
          ) : (
            <PanelLeftClose className="w-4 h-4" />
          )}
        </button>

        {/* MAP AREA */}
        <div className="flex-1 relative flex flex-col h-full min-w-0 min-h-0">

          {/* ─── Floating Top Passage Corridor Status Banner (only when destination is set) ─── */}
          {destinationSet && activeRoute && (
          <div className="absolute top-3 right-3 left-14 md:left-12 z-20 pointer-events-none">
            <div className="bg-slate-900/92 border border-slate-700/80 rounded-2xl px-4 py-2.5 shadow-2xl backdrop-blur-xl flex items-center justify-between gap-3 pointer-events-auto text-white font-sans flex-wrap">

              {/* Left: Route info */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white flex-shrink-0 shadow-md">
                  <Compass className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">
                      ACTIVE PASSAGE CORRIDOR
                    </span>
                    {allRoutes.length > 0 && onSelectRoute && (
                      <select
                        id="select-active-route-banner"
                        value={activeRoute?.id || ''}
                        onChange={(e) => onSelectRoute(e.target.value)}
                        className="bg-slate-800 border border-slate-700 text-cyan-300 font-bold text-[10px] rounded px-1.5 py-0.5 outline-none cursor-pointer hover:bg-slate-700 transition"
                        title="Select active passage corridor route"
                      >
                        {allRoutes.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.isRecommended ? `★ ${r.name}` : r.name} ({r.totalDistanceNm} NM)
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                  <div className="text-xs font-bold flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="text-slate-200 truncate max-w-[12rem]">{startLocation.name.split('(')[0].trim()}</span>
                    <ArrowRight className="w-3 h-3 text-blue-400 flex-shrink-0" />
                    <span className="font-black text-cyan-300 truncate max-w-[14rem]">{destination.name}</span>
                  </div>
                </div>
              </div>

              {/* Right: Metrics row — each metric is a clean pill */}
              <div className="flex items-center gap-3 flex-shrink-0 flex-wrap">
                {/* Distance */}
                <div className="text-center">
                  <div className="text-[9px] text-slate-400 uppercase font-semibold tracking-wider">Distance</div>
                  <div className="text-sm font-black font-mono text-cyan-300 leading-none mt-0.5">
                    {distanceNm !== null ? `${distanceNm} NM` : '--'}
                  </div>
                </div>
                <div className="w-px h-8 bg-slate-700" />

                {/* Duration */}
                <div className="text-center">
                  <div className="text-[9px] text-slate-400 uppercase font-semibold tracking-wider">ETA</div>
                  <div className="text-sm font-black font-mono text-cyan-300 leading-none mt-0.5">
                    {durationHours !== null ? formatDuration(durationHours) : '--'}
                  </div>
                </div>
                <div className="w-px h-8 bg-slate-700" />

                {/* Safety Score */}
                <div className="text-center">
                  <div className="text-[9px] text-slate-400 uppercase font-semibold tracking-wider">Safety</div>
                  <div className={`text-sm font-black font-mono leading-none mt-0.5 ${safetyStatus ? safetyStatus.colorClass : 'text-slate-400'}`}>
                    {safetyScore !== null ? `${safetyScore}/100` : '--'}
                  </div>
                </div>

                {/* Compare Routes CTA */}
                <button
                  onClick={() => onNavigateToTab('routes')}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition text-xs flex items-center gap-1.5 shadow-md active:scale-95 flex-shrink-0"
                >
                  <BarChart2 className="w-3.5 h-3.5" />
                  <span>Compare</span>
                </button>
              </div>
            </div>
          </div>
          )}

          {/* ─── Captain Quick Decision Panel (Only when sidebar is collapsed to prevent overlap) ─── */}
          {isNavigator && isSidebarCollapsed && (
            <div
              id="captain-decision-panel"
              className="absolute bottom-20 left-3 z-20 w-60 pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-slate-900/95 border border-slate-700 rounded-2xl p-3.5 shadow-2xl backdrop-blur-xl text-white space-y-3 font-sans">

                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                    <Navigation className="w-3.5 h-3.5 text-blue-400" />
                    Active Voyage
                  </span>
                  {safetyStatus && (
                    <span className={`text-[9px] font-black uppercase tracking-wide px-2 py-0.5 rounded-md border ${safetyStatus.bgClass} ${safetyStatus.borderClass} ${safetyStatus.colorClass}`}>
                      {safetyStatus.label}
                    </span>
                  )}
                </div>

                {/* Status Signal */}
                {safetyStatus && (
                  <div className={`flex items-center gap-2 p-2 rounded-xl border ${safetyStatus.bgClass} ${safetyStatus.borderClass}`}>
                    <safetyStatus.Icon className={`w-5 h-5 flex-shrink-0 ${safetyStatus.colorClass}`} />
                    <div>
                      <div className={`text-sm font-black ${safetyStatus.colorClass}`}>{safetyStatus.label} TO PROCEED</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {routeName ? routeName.split('(')[0].trim() : 'Calculating...'}
                      </div>
                    </div>
                  </div>
                )}

                {/* Key Metrics */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-slate-400 font-medium">Safety Score</span>
                    <span className={`text-xs font-black font-mono ${safetyStatus ? safetyStatus.colorClass : 'text-slate-400'}`}>
                      {safetyScore !== null ? `${safetyScore} / 100` : '--'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-slate-400 font-medium">Nearest Iceberg</span>
                    <span className={`text-xs font-black font-mono ${
                      bergCpaNm !== null && bergCpaNm < 20 ? 'text-rose-400' : 'text-emerald-400'
                    }`}>
                      {bergCpaNm !== null ? `${bergCpaNm} NM` : '--'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-slate-400 font-medium">Distance</span>
                    <span className="text-xs font-black font-mono text-cyan-300">
                      {distanceKm !== null ? `${distanceKm} km` : '--'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-slate-400 font-medium">ETA</span>
                    <span className="text-xs font-black font-mono text-cyan-300">
                      {durationHours !== null ? formatDuration(durationHours) : '--'}
                    </span>
                  </div>
                </div>

                {/* Rationale */}
                {activeRoute?.rationale && (
                  <div className="text-[9px] text-slate-400 bg-slate-800/60 rounded-lg p-2 leading-tight border border-slate-700/50">
                    "{activeRoute.rationale.substring(0, 100)}
                    {activeRoute.rationale.length > 100 ? '...' : ''}"
                  </div>
                )}

                {/* Active Alert */}
                {primaryAlert && (
                  <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/40 rounded-lg p-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5 animate-pulse" />
                    <div>
                      <div className="text-[10px] font-black text-amber-300 leading-tight">{primaryAlert.title}</div>
                      <div className="text-[9px] text-slate-400 mt-0.5">{primaryAlert.recommendedAction}</div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-0.5">
                  <button
                    onClick={() => onNavigateToTab('routes')}
                    className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black rounded-lg transition flex items-center justify-center gap-1 active:scale-95"
                  >
                    <BarChart2 className="w-3 h-3" />
                    View Route
                  </button>
                  <button
                    onClick={onRecalculateRoutes}
                    className="flex-1 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-[10px] font-bold rounded-lg transition flex items-center justify-center gap-1 active:scale-95"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Recalculate
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ─── Floating Map Legend (Researcher or collapsed) ─── */}
          <div className="absolute bottom-4 right-4 z-20">
            {showMapLegend ? (
              <div className="bg-slate-900/95 border border-slate-700 rounded-2xl p-3.5 shadow-2xl backdrop-blur-xl text-xs w-64 space-y-2.5 font-sans text-white">
                <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                  <span className="font-black text-xs uppercase tracking-wider flex items-center gap-2 text-cyan-300">
                    <Info className="w-3.5 h-3.5 text-blue-400" />
                    MAP LEGEND
                  </span>
                  <button
                    onClick={() => setShowMapLegend(false)}
                    className="text-[10px] text-slate-400 hover:text-white font-bold bg-slate-800 px-2 py-0.5 rounded border border-slate-700"
                  >
                    Hide
                  </button>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-1.5 bg-emerald-400 rounded-full shadow flex-shrink-0" />
                    <span className="font-bold text-white">Recommended Safe Corridor</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-1.5 bg-amber-400 rounded-full opacity-70 flex-shrink-0" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #f59e0b 0px, #f59e0b 4px, transparent 4px, transparent 8px)' }} />
                    <span className="text-slate-300">Alternative Route</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-400 border-2 border-white shadow flex-shrink-0" />
                    <span className="font-bold text-white">Vessel Position (ORV Sagar Nidhi)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-sm bg-rose-500 border border-white shadow flex-shrink-0" />
                    <span className="font-bold text-white">Iceberg Hazard</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber-400 border border-white shadow flex-shrink-0" />
                    <span className="text-slate-300">🇮🇳 Indian Research Station</span>
                  </div>
                  <div className="pt-1.5 border-t border-slate-700/60 space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                      <span>Sea-Ice Density</span>
                      <span className="font-mono">0% → 100%</span>
                    </div>
                    <div className="w-full h-2.5 rounded bg-gradient-to-r from-transparent via-cyan-700/60 to-white border border-slate-700" />
                    <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                      <span>Open Water</span>
                      <span>Pack Ice</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowMapLegend(true)}
                className="px-3 py-2 bg-slate-900/95 hover:bg-blue-700 border border-slate-700 text-white rounded-xl shadow-2xl backdrop-blur-xl text-xs font-black flex items-center gap-2 transition active:scale-95"
              >
                <Info className="w-3.5 h-3.5 text-cyan-400" />
                <span>Map Legend</span>
              </button>
            )}
          </div>



          {/* MAP */}
          {mapProvider === 'antarctic-polar' ? (
            <AntarcticMap
              layers={layers}
              onToggleLayer={onToggleLayer}
              vessel={vessel}
              icebergs={icebergs}
              activeRoute={activeRoute}
              allRoutes={allRoutes}
              seaIceGrid={seaIceGrid}
              riskGrid={riskGrid}
              selectedHorizon={selectedHorizon}
              onSelectStation={(stn, role) => {
                if (role === 'start') onSelectStartLocation(stn.name, stn.coords);
                else onSelectDestination(stn.name, stn.coords);
              }}
              onSelectIceberg={(berg, forecast) => setSelectedIceberg({ obs: berg, forecast })}
              onSelectSeaIcePoint={(pt) => setSelectedSeaIcePoint(pt)}
              onSelectWaypoint={(wp) => setSelectedWaypoint(wp)}
              mapProviderType={mapProvider}
              onToggleMapProvider={() => setMapProvider((prev) => (prev === 'antarctic-polar' ? 'google-maps-satellite' : 'antarctic-polar'))}
            />
          ) : (
            <GoogleMapsAntarcticProvider
              apiKey={googleApiKey}
              vessel={vessel}
              icebergs={icebergs}
              activeRoute={activeRoute}
              onSelectStation={(stn) => onSelectDestination(stn.name, stn.coords)}
              onSelectIceberg={(berg) => {
                const forecast = (window as any)._tempForecast || null;
                setSelectedIceberg({ obs: berg, forecast });
              }}
              onToggleMapProvider={() => setMapProvider((prev) => (prev === 'antarctic-polar' ? 'google-maps-satellite' : 'antarctic-polar'))}
            />
          )}
        </div>
      </div>

      {/* Bottom Voyage Telemetry Bar */}
      <VoyageTelemetryBar
        activeRoute={activeRoute}
        alerts={alerts}
        onAcknowledgeAlert={onAcknowledgeAlert}
        onOpenRouteComparison={() => onNavigateToTab('routes')}
        onOpenExplainableAI={() => onNavigateToTab('explainable-ai')}
      />

      {/* Detail Modals */}
      <IcebergModal
        iceberg={selectedIceberg?.obs || null}
        forecast={selectedIceberg?.forecast || null}
        onClose={() => setSelectedIceberg(null)}
        onSimulateDriftSpike={(id) => {
          onSimulateDriftSpike(id);
          setSelectedIceberg(null);
        }}
      />

      <SeaIceModal
        point={selectedSeaIcePoint}
        onClose={() => setSelectedSeaIcePoint(null)}
      />

      <WaypointModal
        waypoint={selectedWaypoint}
        onClose={() => setSelectedWaypoint(null)}
      />
    </div>
  );
};
