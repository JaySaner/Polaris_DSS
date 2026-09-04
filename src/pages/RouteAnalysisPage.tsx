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
    <div id="route-analysis-page" className="flex-1 bg-sky-50 text-slate-800 p-4 md:p-6 overflow-y-auto space-y-5 font-sans">
      {/* ── Page Header ─── */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-sky-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-sky-100 border border-sky-300 text-sky-600 shadow-sm">
            <Navigation className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-base font-bold text-slate-800 tracking-tight">
                Passage Plan Route Comparison
              </h2>
              <span className="text-[10px] bg-emerald-100 text-emerald-700 border border-emerald-300 px-2 py-0.5 rounded-full font-semibold">
                IMO Polar Code PC5
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Comparative evaluation of Direct, Lead Bypass Safety, and Fuel-Optimal Corridors
            </p>
          </div>
        </div>
        <div className="text-right text-xs text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-sky-200 shadow-sm">
          <span>Vessel: </span>
          <span className="text-sky-700 font-bold">{vessel.name.split('/')[0]}</span>
          <span className="text-slate-400 ml-1">({vessel.iceClass})</span>
        </div>
      </div>

      {/* ── AI Recommendation Summary ─── */}
      <div className="bg-white border border-sky-200 p-4 rounded-2xl shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-sky-500 animate-pulse" />
            <h3 className="text-sm font-bold text-sky-800 uppercase tracking-wide">
              AI Navigation Recommendation
            </h3>
          </div>
          <span className="text-[10px] px-2.5 py-0.5 polar-badge-emerald rounded-full font-bold">
            RECOMMENDED: {recommendedRoute.tag}
          </span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed font-sans">
          {recommendedRoute.rationale} Navigating via <strong className="text-sky-700">{recommendedRoute.tag}</strong> keeps the vessel at a minimum distance of <strong className="text-sky-700">{recommendedRoute.closestIcebergCpaNm} NM</strong> from major icebergs while following natural polynya leads, reducing ice hull friction and ensuring maximum safety index (<strong className="text-sky-700">{recommendedRoute.safetyScore}/100</strong>).
        </p>
      </div>

      {/* ── Route Cards Grid ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {routes.map((route) => {
          const isSelected = activeRoute?.id === route.id;
          const isRecommended = route.isRecommended;

          return (
            <div
              key={route.id}
              className={`bg-white border rounded-2xl p-4 space-y-4 flex flex-col justify-between transition-all shadow-sm ${
                isSelected
                  ? 'border-sky-400 ring-2 ring-sky-200 shadow-md'
                  : 'border-sky-100 hover:border-sky-300 hover:shadow-md'
              }`}
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-sky-100 pb-2.5">
                  <span className="font-bold text-slate-800 text-sm tracking-tight">{route.tag}</span>
                  {isRecommended ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 bg-sky-100 text-sky-700 border border-sky-300 rounded-full">
                      <Award className="w-3.5 h-3.5" />
                      RECOMMENDED
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-mono">ALTERNATIVE</span>
                  )}
                </div>

                {/* Score Bars */}
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-600">Safety Index</span>
                      <span
                        className={
                          route.safetyScore >= 85
                            ? 'text-emerald-600 font-bold'
                            : route.safetyScore >= 65
                            ? 'text-amber-600 font-bold'
                            : 'text-rose-600 font-bold'
                        }
                      >
                        {route.safetyScore} / 100
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          route.safetyScore >= 85
                            ? 'bg-emerald-500'
                            : route.safetyScore >= 65
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                        style={{ width: `${route.safetyScore}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-600">Fuel Consumption</span>
                      <span className="text-amber-600 font-bold">{route.fuelPercentageOfCapacity}% of tank</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
                      <div
                        className="h-full bg-amber-400 rounded-full transition-all duration-500"
                        style={{ width: `${route.fuelPercentageOfCapacity}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Metrics Table */}
                <div className="space-y-1.5 text-xs bg-sky-50 p-3 rounded-xl border border-sky-100">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Distance:</span>
                    <span className="text-slate-800 font-semibold font-mono">
                      {route.totalDistanceKm} km ({route.totalDistanceNm} NM)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Passage Duration:</span>
                    <span className="text-slate-800 font-semibold font-mono">
                      {route.estimatedTravelTimeHours}h ({(route.estimatedTravelTimeHours / 24).toFixed(1)} Days)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Fuel Burn:</span>
                    <span className="text-amber-700 font-semibold font-mono">
                      {route.estimatedFuelConsumptionL.toLocaleString()} L
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Pack Ice Exposure:</span>
                    <span
                      className={`font-semibold font-mono ${
                        route.seaIceExposureKm > 100 ? 'text-rose-600' : 'text-sky-600'
                      }`}
                    >
                      {route.seaIceExposureKm} km
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Nearest Iceberg CPA:</span>
                    <span
                      className={`font-semibold font-mono ${
                        route.closestIcebergCpaNm < 18 ? 'text-rose-600' : 'text-emerald-600'
                      }`}
                    >
                      {route.closestIcebergCpaNm} NM
                    </span>
                  </div>
                </div>
              </div>

              {/* Select Button */}
              <button
                id={`btn-select-route-${route.id}`}
                onClick={() => onSelectActiveRoute(route.id)}
                className={`w-full py-2.5 rounded-xl font-bold uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-2 ${
                  isSelected
                    ? 'bg-sky-500 hover:bg-sky-600 text-white shadow-md'
                    : 'bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-300'
                }`}
              >
                {isSelected ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Active Navigational Plan</span>
                  </>
                ) : (
                  <>
                    <span>Select This Route</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* ── Charts Grid ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Chart 1: Safety Score */}
        <div className="bg-white border border-sky-200 rounded-2xl p-4 space-y-3 shadow-sm">
          <div className="flex items-center justify-between border-b border-sky-100 pb-2">
            <span className="font-semibold text-slate-700 text-xs uppercase tracking-wider flex items-center gap-2">
              <Shield className="w-4 h-4 text-sky-500" />
              Safety Index vs Ice Exposure
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Score / 100</span>
          </div>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#bae3fd', borderRadius: '8px', fontSize: '12px', color: '#0f172a' }}
                />
                <Bar dataKey="safetyScore" name="Safety Score" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Fuel Comparison */}
        <div className="bg-white border border-sky-200 rounded-2xl p-4 space-y-3 shadow-sm">
          <div className="flex items-center justify-between border-b border-sky-100 pb-2">
            <span className="font-semibold text-slate-700 text-xs uppercase tracking-wider flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-500" />
              Bunker Fuel Burn (kL)
            </span>
            <span className="text-[10px] text-slate-400 font-mono">% of Capacity</span>
          </div>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#fde68a', borderRadius: '8px', fontSize: '12px', color: '#0f172a' }}
                />
                <Bar dataKey="fuelLitres" name="Fuel Burn (kL)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
