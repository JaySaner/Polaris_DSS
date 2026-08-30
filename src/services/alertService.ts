import { NavAlert, CandidateRoute, IcebergObservation, GeoCoordinate } from '../types';

export class AlertService {
  private alerts: NavAlert[] = [
    {
      id: 'alert-001',
      type: 'WARNING',
      title: 'Iceberg B-001 Approaching Planned Route Corridor',
      message: 'Iceberg B-001 is predicted to drift within 14.8 nm of Waypoint 16 in Prydz Bay within 18 hours. CPA: 12.4 nm at +24h.',
      affectedLocation: { lat: -66.8, lon: 74.2 },
      affectedRouteId: 'route-a-direct',
      timestamp: '2026-08-27 01:45 UTC',
      recommendedAction: 'Execute Route B bypass or alter course 12° North to maintain minimum 25 nm safety buffer.',
      acknowledged: false,
    },
    {
      id: 'alert-002',
      type: 'WARNING',
      title: 'Sea-Ice Concentration Surge (+18% / 24h)',
      message: 'XGBoost forecast models indicate pack ice compaction between 67°S-69°S en route to Larsemann Hills (Bharati Station).',
      affectedLocation: { lat: -68.4, lon: 75.8 },
      affectedRouteId: 'route-a-direct',
      timestamp: '2026-08-27 00:30 UTC',
      recommendedAction: 'Engage icebreaker escort protocol or navigate via coastal polynya lead.',
      acknowledged: false,
    },
    {
      id: 'alert-003',
      type: 'ADVISORY',
      title: 'Active Navigation Route Verification: Normal Limits',
      message: 'Recommended Route B (Ice Bypass) remains within Polar Code PC5 safety parameters. Overall safety index: 92/100.',
      timestamp: '2026-08-27 02:00 UTC',
      recommendedAction: 'Continue planned passage plan with 4-hourly satellite SAR telemetry update.',
      acknowledged: true,
    },
    {
      id: 'alert-004',
      type: 'CRITICAL',
      title: 'Mega-Iceberg A-23a High Drift Rate in Scotia Sea',
      message: 'Drift velocity has accelerated to 2.4 knots due to Antarctic Circumpolar Current vortex. Southern Drake passage clearance restricted.',
      affectedLocation: { lat: -60.85, lon: -46.20 },
      timestamp: '2026-08-26 22:15 UTC',
      recommendedAction: 'All vessels transit north of 59°S when rounding Elephant Island sector.',
      acknowledged: false,
    }
  ];

  public getAlerts(): NavAlert[] {
    return [...this.alerts];
  }

  public getActiveWarningCount(): number {
    return this.alerts.filter((a) => !a.acknowledged && (a.type === 'CRITICAL' || a.type === 'WARNING')).length;
  }

  public acknowledgeAlert(id: string) {
    const a = this.alerts.find((al) => al.id === id);
    if (a) a.acknowledged = true;
  }

  public addAlert(alert: Omit<NavAlert, 'id' | 'acknowledged'>): NavAlert {
    const newAlert: NavAlert = {
      ...alert,
      id: `alert-${Date.now()}`,
      acknowledged: false,
    };
    this.alerts.unshift(newAlert);
    return newAlert;
  }

  /**
   * Evaluates active route and detects if automatic recalculation is required
   */
  public inspectRouteHazards(
    activeRoute: CandidateRoute,
    icebergs: IcebergObservation[]
  ): { needsRecalculation: boolean; triggeringAlert?: NavAlert } {
    if (activeRoute.overallRiskScore > 65 || activeRoute.closestIcebergCpaNm < 15) {
      const alert = this.addAlert({
        type: 'CRITICAL',
        title: 'AUTOMATIC ROUTE RECALCULATION REQUIRED',
        message: `Active passage plan risk (${activeRoute.overallRiskScore}/100) exceeded safety threshold. Iceberg CPA is critically close (${activeRoute.closestIcebergCpaNm} nm).`,
        affectedRouteId: activeRoute.id,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
        recommendedAction: 'System generated optimal safe alternative bypass route. Review and switch recommendation.',
      });
      return { needsRecalculation: true, triggeringAlert: alert };
    }
    return { needsRecalculation: false };
  }
}

export const alertService = new AlertService();
