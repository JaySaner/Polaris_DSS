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
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  Compass,
  ShieldCheck,
  ArrowRight,
  HelpCircle,
  BarChart2,
  Info,
} from 'lucide-react';

interface HomeDashboardProps {
  layers: MapLayerVisibility;
  onToggleLayer: (layerKey: keyof MapLayerVisibility) => void;
  vessel: VesselProfile;
  icebergs: IcebergObservation[];
  activeRoute: CandidateRoute | null;
  allRoutes: CandidateRoute[];
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
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  layers,
  onToggleLayer,
  vessel,
  icebergs,
  activeRoute,
  allRoutes,
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

  return (
    <div id="home-operational-dashboard" className="flex flex-col flex-1 h-full overflow-hidden relative font-sans">
      {/* Dynamic Recalculation Alert Banner if triggered */}
      {recalculationBanner && recalculationBanner.show && (
        <div
          id="dynamic-recalculation-banner"
          className="bg-rose-950 border-b border-rose-600 text-rose-100 px-4 py-1.5 flex flex-wrap items-center justify-between gap-2 text-xs z-30 shadow-lg animate-pulse"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span className="font-bold uppercase tracking-wider text-rose-300">
              ROUTE UPDATE REQUIRED:
            </span>
            <span>
              Previous route ({recalculationBanner.oldRouteName}) risk exceeded threshold. New recommended route:{' '}
              <strong className="text-cyan-300">{recalculationBanner.newRouteName}</strong>. Reason: {recalculationBanner.reason}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigateToTab('routes')}
              className="px-2.5 py-0.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded text-[11px] transition"
            >
              Review Alternative
            </button>
            <button
              onClick={onDismissRecalculationBanner}
              className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] transition"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area: Left Controls Sidebar + Right Polar Map */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative min-h-0">
        {/* Collapsible Left Navigation Sidebar */}
        <div
          className={`${
            isSidebarCollapsed ? 'hidden md:hidden' : 'w-full md:w-80 lg:w-88 flex-shrink-0'
          } h-full overflow-hidden transition-all duration-200`}
        >
          <NavigationSidebar
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

        {/* Floating Sidebar Toggle Button on Desktop */}
        <button
          id="btn-toggle-sidebar"
          onClick={() => setIsSidebarCollapsed((prev) => !prev)}
          className="hidden md:flex absolute top-3 left-3 z-30 items-center justify-center p-2 rounded-xl bg-[#07152B]/90 hover:bg-[#0E2A54] border border-cyan-500/30 text-cyan-300 shadow-xl backdrop-blur-md transition active:scale-95"
          style={{ left: isSidebarCollapsed ? '12px' : 'calc(20rem + 8px)' }}
          title={isSidebarCollapsed ? 'Expand Passage Planner Sidebar' : 'Collapse Sidebar for Full Map View'}
        >
          {isSidebarCollapsed ? (
            <PanelLeftOpen className="w-4 h-4" />
          ) : (
            <PanelLeftClose className="w-4 h-4" />
          )}
        </button>

        {/* Antarctic Map Area */}
        <div className="flex-1 relative flex flex-col h-full bg-[#060B19] min-w-0 min-h-0">
          {/* Floating Top Voyage Status Card on Map */}
          <div className="absolute top-3 right-3 left-14 md:left-4 z-20 pointer-events-none">
            <div className="bg-[#071730]/90 border border-cyan-500/30 rounded-xl p-2.5 shadow-2xl backdrop-blur-md text-slate-100 flex flex-wrap items-center justify-between gap-3 pointer-events-auto max-w-4xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 flex-shrink-0">
                  <Compass className="w-4 h-4 animate-spin-slow" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">
                      ACTIVE PASSAGE CORRIDOR
                    </span>
                    {activeRoute?.isRecommended && (
                      <span className="text-[9px] px-1.5 py-0.2 bg-emerald-950 text-emerald-300 border border-emerald-500/40 rounded font-semibold">
                        RECOMMENDED SAFE
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-bold text-slate-100 flex items-center gap-2">
                    <span>{startLocation.name.split('(')[0]}</span>
                    <ArrowRight className="w-3 h-3 text-cyan-400" />
                    <span className="text-cyan-300 font-extrabold">{destination.name}</span>
                  </div>
                </div>
              </div>

              {activeRoute && (
                <div className="flex items-center gap-4 text-xs font-mono">
                  <div className="hidden sm:block text-right">
                    <span className="text-[10px] text-slate-400 block font-sans">Distance / ETA</span>
                    <span className="font-bold text-cyan-200">
                      {activeRoute.totalDistanceNm} NM | {activeRoute.estimatedDurationHours} hrs
                    </span>
                  </div>
                  <div className="hidden sm:block text-right">
                    <span className="text-[10px] text-slate-400 block font-sans">Safety Index</span>
                    <span
                      className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                        activeRoute.safetyIndex >= 80
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                          : activeRoute.safetyIndex >= 50
                          ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                          : 'bg-rose-950 text-rose-300 border border-rose-500/40'
                      }`}
                    >
                      {activeRoute.safetyIndex}/100
                    </span>
                  </div>
                  <button
                    onClick={() => onNavigateToTab('routes')}
                    className="px-2.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-lg transition text-xs flex items-center gap-1.5 shadow-md active:scale-95"
                  >
                    <BarChart2 className="w-3.5 h-3.5" />
                    <span>Compare Routes</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Floating Bottom-Right Interactive Quick Legend */}
          <div className="absolute bottom-4 right-4 z-20">
            {showMapLegend ? (
              <div className="bg-[#071730]/95 border border-cyan-500/30 rounded-xl p-3 shadow-2xl backdrop-blur-md text-slate-100 text-xs w-64 space-y-2">
                <div className="flex items-center justify-between border-b border-cyan-900/40 pb-1.5">
                  <span className="font-bold text-cyan-300 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-cyan-400" />
                    Map Visual Legend
                  </span>
                  <button
                    onClick={() => setShowMapLegend(false)}
                    className="text-[10px] text-slate-400 hover:text-slate-200"
                  >
                    Hide
                  </button>
                </div>
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-1 bg-emerald-400 rounded-full shadow-[0_0_6px_#34d399]" />
                    <span className="text-slate-200">Recommended Safe Corridor</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-1 bg-amber-400 rounded-full" />
                    <span className="text-slate-300">Alternative Direct Route</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                    <span className="text-slate-200">Vessel Position Fix</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 border border-white" />
                    <span className="text-slate-200">Iceberg Hazard & Trajectory</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-2 bg-gradient-to-r from-sky-900 via-cyan-600 to-blue-950 rounded border border-cyan-500/30" />
                    <span className="text-slate-300">Sea-Ice Density (0-100%)</span>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowMapLegend(true)}
                className="px-2.5 py-1.5 bg-[#071730]/90 hover:bg-[#0E2A54] border border-cyan-500/30 text-cyan-300 rounded-lg shadow-xl backdrop-blur-md text-xs font-semibold flex items-center gap-1.5"
              >
                <Info className="w-3.5 h-3.5" />
                <span>Map Legend</span>
              </button>
            )}
          </div>

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
            />
          )}
        </div>
      </div>

      {/* Bottom Voyage Telemetry and Alert Status Ribbon */}
      <VoyageTelemetryBar
        activeRoute={activeRoute}
        alerts={alerts}
        onAcknowledgeAlert={onAcknowledgeAlert}
        onOpenRouteComparison={() => onNavigateToTab('routes')}
        onOpenExplainableAI={() => onNavigateToTab('explainable-ai')}
      />

      {/* Detail Modals for Click Inspection */}
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

