import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  MapLayerVisibility,
  VesselProfile,
  IcebergObservation,
  CandidateRoute,
  SeaIceGridPoint,
  RiskGridCell,
  RoutingObjective,
  NavAlert,
  GeoCoordinate,
  RiskWeights,
} from './types';
import {
  DEFAULT_VESSEL_PROFILE,
  DEFAULT_ICEBERGS,
  ANTARCTIC_RESEARCH_STATIONS,
} from './data/antarcticData';
import { dataProvider } from './services/dataProvider';
import { seaIceModel } from './services/seaIceModel';
import { icebergTrajectoryModel } from './services/icebergTrajectoryModel';
import { riskEngine } from './services/riskEngine';
import { routeOptimizer } from './services/routeOptimizer';
import { alertService } from './services/alertService';
import { calculateHaversineDistanceKm } from './utils/geoUtils';
import { Header } from './components/header/Header';
import { IconSidebar } from './components/sidebar/IconSidebar';
import { Footer } from './components/footer/Footer';
import { HomeDashboard } from './pages/HomeDashboard';
import { ForecastPage } from './pages/ForecastPage';
import { RouteAnalysisPage } from './pages/RouteAnalysisPage';
import { ExplainableAIPage } from './pages/ExplainableAIPage';
import { ModelPerformancePage } from './pages/ModelPerformancePage';
import { DataSourcesPage } from './pages/DataSourcesPage';
import { VesselProfilePage } from './pages/VesselProfilePage';
import { IcebergTrackerPage } from './pages/IcebergTrackerPage';
import { RouteHistoryPage } from './pages/RouteHistoryPage';

const TAB_SLUGS: Record<string, string> = {
  dashboard: 'home',
  routes: 'voyage-planning',
  forecasts: '72h-forecasts',
  icebergs: 'iceberg-tracker',
  'explainable-ai': 'explainable-ai',
  metrics: 'ai-validation',
  datasources: 'data-feeds',
  vessel: 'vessel-profile',
  'route-history': 'route-history',
};

const SLUG_TO_TAB: Record<string, string> = {
  home: 'dashboard',
  dashboard: 'dashboard',
  'voyage-planning': 'routes',
  routes: 'routes',
  '72h-forecasts': 'forecasts',
  forecasts: 'forecasts',
  'iceberg-tracker': 'icebergs',
  icebergs: 'icebergs',
  'explainable-ai': 'explainable-ai',
  'ai-validation': 'metrics',
  metrics: 'metrics',
  'data-feeds': 'datasources',
  datasources: 'datasources',
  'vessel-profile': 'vessel',
  vessel: 'vessel',
  'route-history': 'route-history',
};

function getHashForState(role: 'navigator' | 'researcher', tab: string): string {
  const rolePrefix = role === 'navigator' ? 'captain' : 'researcher';
  const slug = TAB_SLUGS[tab] || tab;
  return `#${rolePrefix}/${slug}`;
}

function parseHash(hashString: string): { role: 'navigator' | 'researcher'; tab: string } {
  let hash = hashString.replace(/^#\/?/, '').trim();
  if (!hash) {
    return { role: 'navigator', tab: 'dashboard' };
  }

  let role: 'navigator' | 'researcher' = 'navigator';
  let slug = hash;

  if (hash.startsWith('captain/')) {
    role = 'navigator';
    slug = hash.replace('captain/', '');
  } else if (hash.startsWith('researcher/')) {
    role = 'researcher';
    slug = hash.replace('researcher/', '');
  } else if (
    ['iceberg-tracker', 'icebergs', 'explainable-ai', 'ai-validation', 'metrics', 'data-feeds', 'datasources'].includes(slug)
  ) {
    role = 'researcher';
  }

  const tab = SLUG_TO_TAB[slug] || 'dashboard';
  return { role, tab };
}

export default function App() {
  // Navigation, Role & Theme State initialized from URL hash
  const initialNav = useMemo(() => parseHash(window.location.hash), []);
  const [activeTab, setActiveTab] = useState<string>(initialNav.tab);
  const [userRole, setUserRole] = useState<'navigator' | 'researcher'>(initialNav.role);
  const [theme, setTheme] = useState<'dark' | 'light'>('light');
  const [mapProvider, setMapProvider] = useState<'antarctic-polar' | 'google-maps-satellite'>('antarctic-polar');

  // Synchronize window.location.hash with activeTab and userRole
  useEffect(() => {
    const targetHash = getHashForState(userRole, activeTab);
    if (window.location.hash !== targetHash) {
      window.history.replaceState(null, '', targetHash);
    }
  }, [activeTab, userRole]);

  // Listen for hashchange events (back/forward or manual URL edit)
  useEffect(() => {
    const handleHashChange = () => {
      const parsed = parseHash(window.location.hash);
      setActiveTab(parsed.tab);
      setUserRole(parsed.role);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Sync theme with HTML document element for proper Tailwind dark: styling
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }, [theme]);

  // Vessel Profile State
  const [vessel, setVessel] = useState<VesselProfile>(DEFAULT_VESSEL_PROFILE);

  // Icebergs State
  const [icebergs, setIcebergs] = useState<IcebergObservation[]>(DEFAULT_ICEBERGS);

  // Voyage Origin and Destination State
  const [startLocation, setStartLocation] = useState<{ name: string; coords: GeoCoordinate }>({
    name: 'Current Vessel Fix (Prydz Bay Gateway)',
    coords: { lat: -64.20, lon: 72.50 },
  });

  const [destination, setDestination] = useState<{ name: string; coords: GeoCoordinate }>({
    name: 'Bharati Research Station (Larsemann Hills)',
    coords: { lat: -69.41, lon: 76.19 },
  });

  const [objective, setObjective] = useState<RoutingObjective>('Safety First');
  const [selectedHorizon, setSelectedHorizon] = useState<number>(0);

  // Tracks whether the user has explicitly chosen a destination (controls map route display)
  const [destinationSet, setDestinationSet] = useState<boolean>(false);

  // Layer Visibility — Default to Tactical View (clean map for Captain)
  const [layers, setLayers] = useState<MapLayerVisibility>({
    seaIce: true,
    predictedSeaIce: false,
    icebergs: true,
    predictedIcebergTrajectories: false,
    uncertaintyCones: false,
    navigationRiskGrid: false,
    windVectors: false,
    oceanCurrents: false,
    researchStations: true,
    vessel: true,
    recommendedRoute: true,
    alternativeRoutes: true,
    graticule: true,
  });

  // Risk Engine Weights
  const [riskWeights, setRiskWeights] = useState<RiskWeights>(riskEngine.getWeights());

  // Alerts State
  const [alerts, setAlerts] = useState<NavAlert[]>(alertService.getAlerts());

  // Dynamic Route Recalculation Banner State
  const [recalculationBanner, setRecalculationBanner] = useState<{
    show: boolean;
    oldRouteName: string;
    newRouteName: string;
    reason: string;
  } | null>(null);

  // 1. Compute Candidate Routes
  const candidateRoutes = useMemo(() => {
    return routeOptimizer.planRoutes(
      startLocation.coords,
      destination.coords,
      vessel,
      objective,
      icebergs
    );
  }, [startLocation, destination, vessel, objective, icebergs]);

  // Active Recommended Route
  const [selectedRouteId, setSelectedRouteId] = useState<string>('route-b-safety');

  const activeRoute = useMemo(() => {
    return (
      candidateRoutes.find((r) => r.id === selectedRouteId) ||
      candidateRoutes.find((r) => r.isRecommended) ||
      candidateRoutes[0] ||
      null
    );
  }, [candidateRoutes, selectedRouteId]);

  // 2. Compute Sea Ice & Risk Grids
  const seaIceGrid = useMemo(() => {
    return dataProvider.seaIce.getSeaIceGrid();
  }, []);

  const riskGrid = useMemo(() => {
    return riskEngine.generateRiskGrid(icebergs, vessel);
  }, [icebergs, vessel]);

  // Handlers
  const handleToggleLayer = useCallback((layerKey: keyof MapLayerVisibility) => {
    setLayers((prev) => ({ ...prev, [layerKey]: !prev[layerKey] }));
  }, []);

  const handleAcknowledgeAlert = useCallback((id: string) => {
    alertService.acknowledgeAlert(id);
    setAlerts(alertService.getAlerts());
  }, []);

  const handleUpdateWeights = useCallback((newWeights: RiskWeights) => {
    riskEngine.setWeights(newWeights);
    setRiskWeights(newWeights);
  }, []);

  const handleUpdateVessel = useCallback((updated: VesselProfile) => {
    setVessel(updated);
  }, []);

  const handleSelectDestination = useCallback((name: string, coords: GeoCoordinate) => {
    setDestination({ name, coords });
    setDestinationSet(true);
    const newRoutes = routeOptimizer.planRoutes(startLocation.coords, coords, vessel, objective, icebergs);
    const rec = newRoutes.find((r) => r.isRecommended) || newRoutes[0];
    if (rec) setSelectedRouteId(rec.id);
  }, [startLocation, vessel, objective, icebergs]);

  const handleSelectStartLocation = useCallback((name: string, coords: GeoCoordinate) => {
    setStartLocation({ name, coords });
    const newRoutes = routeOptimizer.planRoutes(coords, destination.coords, vessel, objective, icebergs);
    const rec = newRoutes.find((r) => r.isRecommended) || newRoutes[0];
    if (rec) setSelectedRouteId(rec.id);
  }, [destination, vessel, objective, icebergs]);

  const handleChangeObjective = useCallback((obj: RoutingObjective) => {
    setObjective(obj);
    const newRoutes = routeOptimizer.planRoutes(startLocation.coords, destination.coords, vessel, obj, icebergs);
    const rec = newRoutes.find((r) => r.isRecommended) || newRoutes[0];
    if (rec) setSelectedRouteId(rec.id);
  }, [startLocation, destination, vessel, icebergs]);

  // Recalculate routes manually
  const handleRecalculateRoutes = useCallback(() => {
    setAlerts(alertService.getAlerts());
    const routes = routeOptimizer.planRoutes(
      startLocation.coords,
      destination.coords,
      vessel,
      objective,
      icebergs
    );
    const rec = routes.find((r) => r.isRecommended) || routes[0];
    if (rec) setSelectedRouteId(rec.id);
  }, [startLocation, destination, vessel, objective, icebergs]);

  // Scenario Simulation: Simulate Iceberg Drift Surge (+0.8 kts)
  const handleSimulateDriftSpike = useCallback(
    (bergId: string) => {
      let targetBergName = `Iceberg ${bergId}`;
      let isThreat = false;

      setIcebergs((prev) =>
        prev.map((b) => {
          if (b.id === bergId) {
            targetBergName = b.name;
            const newSpeed = parseFloat((b.speedKnots + 0.8).toFixed(1));
            const distKm = calculateHaversineDistanceKm(b.currentPosition, startLocation.coords);

            // Compute realistic risk rating after speed surge
            let newRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME' = b.riskRating;
            if (distKm < 150 && newSpeed >= 2.0) {
              newRisk = 'EXTREME';
              isThreat = true;
            } else if (distKm < 250 || newSpeed >= 2.2 || b.areaKm2 > 1000) {
              newRisk = b.riskRating === 'LOW' ? 'MEDIUM' : b.riskRating === 'MEDIUM' ? 'HIGH' : b.riskRating;
              if (distKm < 200) isThreat = true;
            } else {
              newRisk = b.riskRating;
            }

            return {
              ...b,
              speedKnots: newSpeed,
              riskRating: newRisk,
            };
          }
          return b;
        })
      );

      // Trigger route update alert ONLY if the surging iceberg is in proximity to transit route
      if (isThreat) {
        alertService.addAlert({
          type: 'CRITICAL',
          title: `HAZARD DETECTED: ${targetBergName} Drift Surge (+0.8 kts)`,
          message: `${targetBergName} accelerated to higher speed near transit corridor. Proximity hazard updated.`,
          affectedRouteId: 'route-a-direct',
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
          recommendedAction: 'Execute safe bypass reroute via Route B corridor.',
        });

        setAlerts(alertService.getAlerts());
        setSelectedRouteId('route-b-safety');
        setRecalculationBanner({
          show: true,
          oldRouteName: 'Route A (Direct Great Circle)',
          newRouteName: 'Route B (Polar Safety & Lead Bypass)',
          reason: `${targetBergName} drift surge (+0.8 kts) detected near track corridor. Safe bypass active.`,
        });
      }
    },
    [startLocation]
  );

  // If user role changes to navigator while on a researcher-only tab, switch back to dashboard
  useEffect(() => {
    if (userRole === 'navigator') {
      const researcherOnly = ['icebergs', 'explainable-ai', 'metrics', 'datasources'];
      if (researcherOnly.includes(activeTab)) {
        setActiveTab('dashboard');
      }
    }
  }, [userRole, activeTab]);

  const activeAlertCount = alerts.filter((a) => !a.acknowledged && (a.type === 'CRITICAL' || a.type === 'WARNING')).length;

  return (
    <div
      id="antarctic-dss-application"
      className={`flex flex-col w-full h-screen ${theme === 'light' ? 'theme-light bg-slate-50 text-slate-900' : 'theme-dark dark bg-slate-950 text-slate-100'} select-none overflow-hidden font-sans`}
    >
      {/* 1. Header Bar */}
      <Header
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        activeAlertCount={activeAlertCount}
        onTriggerSimulationEvent={() => handleSimulateDriftSpike('B-001')}
        mapProvider={mapProvider}
        onToggleMapProvider={() =>
          setMapProvider((p) => (p === 'antarctic-polar' ? 'google-maps-satellite' : 'antarctic-polar'))
        }
        userRole={userRole}
        onToggleRole={() => setUserRole((r) => (r === 'navigator' ? 'researcher' : 'navigator'))}
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
      />

      {/* 2. Main Body with Icon Sidebar & View Area */}
      <div className="flex-1 flex flex-row overflow-hidden relative">
        {/* Far-left Icon Navigation Sidebar */}
        <IconSidebar
          activeTab={activeTab}
          onSelectTab={(tab) => setActiveTab(tab)}
          userRole={userRole}
          onToggleRole={() => setUserRole((r) => (r === 'navigator' ? 'researcher' : 'navigator'))}
        />

        {/* Main View Container */}
        <main id="main-view-container" className="flex-1 flex flex-col overflow-hidden relative bg-slate-50 dark:bg-slate-950">
          {activeTab === 'dashboard' && (
            <HomeDashboard
              userRole={userRole}
              layers={layers}
              onToggleLayer={handleToggleLayer}
              vessel={vessel}
              icebergs={icebergs}
              activeRoute={destinationSet ? activeRoute : null}
              allRoutes={destinationSet ? candidateRoutes : []}
              onSelectRoute={(id) => setSelectedRouteId(id)}
              seaIceGrid={seaIceGrid}
              riskGrid={riskGrid}
              selectedHorizon={selectedHorizon}
              onChangeHorizon={setSelectedHorizon}
              startLocation={startLocation}
              destination={destination}
              onSelectStartLocation={handleSelectStartLocation}
              onSelectDestination={handleSelectDestination}
              objective={objective}
              onChangeObjective={handleChangeObjective}
              onRecalculateRoutes={handleRecalculateRoutes}
              alerts={alerts}
              onAcknowledgeAlert={handleAcknowledgeAlert}
              onSimulateDriftSpike={handleSimulateDriftSpike}
              mapProvider={mapProvider}
              onToggleMapProvider={() =>
                setMapProvider((p) => (p === 'antarctic-polar' ? 'google-maps-satellite' : 'antarctic-polar'))
              }
              onNavigateToTab={(tab) => setActiveTab(tab)}
              recalculationBanner={recalculationBanner}
              onDismissRecalculationBanner={() => setRecalculationBanner(null)}
              destinationSet={destinationSet}
            />
          )}

          {activeTab === 'icebergs' && (
            <IcebergTrackerPage
              icebergs={icebergs}
              vessel={vessel}
              onSimulateDriftSpike={handleSimulateDriftSpike}
            />
          )}

          {activeTab === 'forecasts' && (
            <ForecastPage
              icebergs={icebergs}
              seaIceGrid={seaIceGrid}
              vessel={vessel}
              onSimulateDriftSpike={handleSimulateDriftSpike}
            />
          )}

          {activeTab === 'routes' && (
            <RouteAnalysisPage
              routes={candidateRoutes}
              activeRoute={activeRoute}
              onSelectActiveRoute={(id) => {
                setSelectedRouteId(id);
                setActiveTab('dashboard');
              }}
              vessel={vessel}
            />
          )}

          {activeTab === 'route-history' && (
            <RouteHistoryPage />
          )}

          {activeTab === 'explainable-ai' && (
            <ExplainableAIPage
              weights={riskWeights}
              onUpdateWeights={handleUpdateWeights}
              activeRoute={activeRoute}
            />
          )}

          {activeTab === 'metrics' && <ModelPerformancePage />}

          {activeTab === 'datasources' && <DataSourcesPage />}

          {activeTab === 'vessel' && (
            <VesselProfilePage vessel={vessel} onUpdateVessel={handleUpdateVessel} />
          )}
        </main>
      </div>

      {/* 3. Footer */}
      <Footer />
    </div>
  );
}
