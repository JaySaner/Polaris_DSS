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

export default function App() {
  // Navigation, Role & Theme State
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [userRole, setUserRole] = useState<'navigator' | 'researcher'>('navigator');
  const [theme, setTheme] = useState<'dark' | 'light'>('light');
  const [mapProvider, setMapProvider] = useState<'antarctic-polar' | 'google-maps-satellite'>('antarctic-polar');

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

  // Layer Visibility
  const [layers, setLayers] = useState<MapLayerVisibility>({
    seaIce: true,
    predictedSeaIce: true,
    icebergs: true,
    predictedIcebergTrajectories: true,
    uncertaintyCones: true,
    navigationRiskGrid: true,
    windVectors: true,
    oceanCurrents: true,
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

  // Scenario Simulation: Simulate Iceberg Sudden Drift Surge (Tests reactive hazard recalculation)
  const handleSimulateDriftSpike = useCallback((bergId: string) => {
    setIcebergs((prev) =>
      prev.map((b) => {
        if (b.id === bergId || b.id === 'B-001') {
          return {
            ...b,
            currentPosition: {
              lat: startLocation.coords.lat - 1.2,
              lon: startLocation.coords.lon + 0.8,
            },
            speedKnots: parseFloat((b.speedKnots + 1.2).toFixed(1)),
            riskRating: 'EXTREME' as const,
          };
        }
        return b;
      })
    );

    const newAlert = alertService.addAlert({
      type: 'CRITICAL',
      title: `HAZARD DETECTED: Iceberg ${bergId} Accelerated Drift Intercept`,
      message: `Iceberg ${bergId} accelerated by +1.2 knots heading directly into Route A transit lane. CPA dropped to 4.2 NM. Safety index degraded to 42/100.`,
      affectedRouteId: 'route-a-direct',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
      recommendedAction: 'Execute automatic bypass reroute via Route B corridor.',
    });

    setAlerts(alertService.getAlerts());

    setSelectedRouteId('route-b-safety');
    setRecalculationBanner({
      show: true,
      oldRouteName: 'Route A (Direct Great Circle)',
      newRouteName: 'Route B (Polar Safety & Lead Bypass)',
      reason: `Iceberg ${bergId} accelerated drift surge into track corridor (CPA < 5 NM). Automatic safe bypass executed.`,
    });
  }, [startLocation]);

  const activeAlertCount = alerts.filter((a) => !a.acknowledged && (a.type === 'CRITICAL' || a.type === 'WARNING')).length;

  return (
    <div
      id="antarctic-dss-application"
      className={`flex flex-col w-full h-screen ${theme === 'light' ? 'theme-light bg-slate-50' : 'theme-dark bg-slate-950'} select-none overflow-hidden font-sans`}
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
        />

        {/* Main View Container */}
        <main id="main-view-container" className="flex-1 flex flex-col overflow-hidden relative bg-slate-50 dark:bg-slate-950">
          {activeTab === 'dashboard' && (
            <HomeDashboard
              layers={layers}
              onToggleLayer={handleToggleLayer}
              vessel={vessel}
              icebergs={icebergs}
              activeRoute={activeRoute}
              allRoutes={candidateRoutes}
              seaIceGrid={seaIceGrid}
              riskGrid={riskGrid}
              selectedHorizon={selectedHorizon}
              onChangeHorizon={setSelectedHorizon}
              startLocation={startLocation}
              destination={destination}
              onSelectStartLocation={(name, coords) => setStartLocation({ name, coords })}
              onSelectDestination={(name, coords) => setDestination({ name, coords })}
              objective={objective}
              onChangeObjective={setObjective}
              onRecalculateRoutes={handleRecalculateRoutes}
              alerts={alerts}
              onAcknowledgeAlert={handleAcknowledgeAlert}
              onSimulateDriftSpike={handleSimulateDriftSpike}
              mapProvider={mapProvider}
              onNavigateToTab={(tab) => setActiveTab(tab)}
              recalculationBanner={recalculationBanner}
              onDismissRecalculationBanner={() => setRecalculationBanner(null)}
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
