import React from 'react';
import { CandidateRoute, VesselProfile } from '../types';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  Shield,
  Flame,
  Navigation,
  Clock,
  CheckCircle2,
  ArrowRight,
  Award,
  Sparkles,
  Info,
} from 'lucide-react';

interface RouteAnalysisPageProps {
  routes: CandidateRoute[];
  activeRoute: CandidateRoute | null;
  onSelectActiveRoute: (routeId: string) => void;
  vessel: VesselProfile;
}

export const RouteAnalysisPage: React.FC<RouteAnalysisPageProps> = ({
  routes,
  activeRoute,
  onSelectActiveRoute,
  vessel,
}) => {
  const chartData = routes.map((r) => ({
    name: r.tag,
    fuelPct: r.fuelPercentageOfCapacity,
    fuelLitres: Math.round(r.estimatedFuelConsumptionL / 1000), // in kL
    safetyScore: r.safetyScore,
    timeHours: r.estimatedTravelTimeHours,
    iceExposureKm: r.seaIceExposureKm,
  }));

  const recommendedRoute = routes.find((r) => r.isRecommended) || routes[0];

  return (
    <div id="route-analysis-page" className="flex-1 bg-slate-50 text-slate-900 p-4 md:p-6 overflow-y-auto space-y-6 font-sans">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-200 text-sky-600 shadow-sm">
            <Navigation className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Passage Plan Route Comparison
              </h2>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-mono">
                IMO Polar Code PC5 Compliant
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Comparative evaluation of Direct, Lead Bypass Safety, and Fuel-Optimal Corridors
            </p>
          </div>
        </div>

        <div className="text-right text-xs text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
          <span>Active Vessel: </span>
          <span className="text-sky-600 font-bold">{vessel.name.split('/')[0]}</span>
          <span className="text-slate-500 ml-1">({vessel.iceClass})</span>
        </div>
      </div>

      {/* Plain-English AI Recommendation Summary Box */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-sky-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              AI Navigation Recommendation Overview
            </h3>
          </div>
          <span className="text-[10px] px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-bold">
            RECOMMENDED: {recommendedRoute.tag}
          </span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          {recommendedRoute.rationale} Navigating via <strong>{recommendedRoute.tag}</strong> keeps the vessel at a minimum distance of <strong>{recommendedRoute.closestIcebergCpaNm} NM</strong> from major icebergs while following natural polynya leads, reducing ice hull friction and ensuring maximum safety index (<strong>{recommendedRoute.safetyScore}/100</strong>).
        </p>
      </div>

      {/* Grid 1: Candidate Route Comparison Cards (3 Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {routes.map((route) => {
          const isSelected = activeRoute?.id === route.id;
          const isRecommended = route.isRecommended;

          return (
            <div
              key={route.id}
              className={`bg-white border rounded-2xl p-4 space-y-4 flex flex-col justify-between transition-all shadow-sm ${
                isSelected
                  ? 'border-sky-400 ring-1 ring-sky-200 bg-sky-50'
                  : 'border-slate-200 hover:border-sky-300'
              }`}
            >
              <div className="space-y-3">
                {/* Header Tag and Recommendation Badge */}
                <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                  <span className="font-bold text-slate-900 text-sm tracking-tight">{route.tag}</span>
                  {isRecommended ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                      <Award className="w-3.5 h-3.5 text-emerald-600" />
                      RECOMMENDED
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500 font-mono">ALTERNATIVE</span>
                  )}
                </div>

                {/* Score Key Metric Visual Gauges */}
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-600">Safety Index</span>
                        <span
                        className={
                          route.safetyScore >= 85
                              ? 'text-emerald-700 font-bold'
                            : route.safetyScore >= 65
                              ? 'text-amber-700 font-bold'
                              : 'text-red-700 font-bold'
                        }
                      >
                        {route.safetyScore} / 100
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                      <div
                            className={`h-full rounded-full transition-all duration-500 ${
                          route.safetyScore >= 85
                              ? 'bg-emerald-500'
                            : route.safetyScore >= 65
                              ? 'bg-amber-500'
                              : 'bg-red-500'
                        }`}
                        style={{ width: `${route.safetyScore}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-600">Fuel Consumption</span>
                      <span className="text-amber-700 font-bold">{route.fuelPercentageOfCapacity}% of tank</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                      <div className="h-full bg-amber-500 rounded-full transition-all duration-500"
                        style={{ width: `${route.fuelPercentageOfCapacity}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Metrics Breakdown List */}
                <div className="space-y-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Distance:</span>
                    <span className="text-slate-900 font-semibold font-mono">
                      {route.totalDistanceKm} km ({route.totalDistanceNm} NM)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Passage Duration:</span>
                    <span className="text-slate-900 font-semibold font-mono">
                      {route.estimatedTravelTimeHours}h ({(route.estimatedTravelTimeHours / 24).toFixed(1)} Days)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Estimated Fuel Burn:</span>
                    <span className="text-amber-700 font-semibold font-mono">
                      {route.estimatedFuelConsumptionL.toLocaleString()} L
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Heavy Pack Ice:</span>
                    <span
                      className={`font-semibold font-mono ${
                        route.seaIceExposureKm > 100 ? 'text-red-700' : 'text-sky-600'
                      }`}
                    >
                      {route.seaIceExposureKm} km
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Nearest Iceberg CPA:</span>
                    <span
                      className={`font-semibold font-mono ${
                        route.closestIcebergCpaNm < 18 ? 'text-red-700' : 'text-emerald-700'
                      }`}
                    >
                      {route.closestIcebergCpaNm} NM
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button to Activate */}
              <button
                id={`btn-select-route-${route.id}`}
                onClick={() => onSelectActiveRoute(route.id)}
                className={`w-full py-2.5 rounded-xl font-bold uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-2 ${
                  isSelected
                    ? 'bg-sky-600 hover:bg-sky-700 text-white shadow-sm'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
                }`}
              >
                {isSelected ? (
                  <>
                    <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                    <span>Active Navigational Plan</span>
                  </>
                ) : (
                  <>
                    <span>Select This Route</span>
                    <ArrowRight className="w-4 h-4 text-sky-600" />
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Grid 2: Graphical Visualizations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Chart 1: Safety vs Ice Exposure */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="font-semibold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
              <Shield className="w-4 h-4 text-sky-600" />
              Safety Index vs Ice Exposure
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Score out of 100</span>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#071326', borderColor: '#38bdf8', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="safetyScore" name="Safety Score" fill="#38bdf8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Fuel Consumption Comparison */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="font-semibold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" />
              Bunker Fuel Burn (kL)
            </span>
            <span className="text-[10px] text-slate-500 font-mono">% of Capacity</span>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#071326', borderColor: '#fbbf24', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="fuelLitres" name="Fuel Burn (kL)" fill="#fbbf24" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
