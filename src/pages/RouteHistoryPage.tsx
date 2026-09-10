import React, { useState } from 'react';
import { MOCK_HISTORICAL_ROUTES } from '../data/antarcticData';
import { HistoricalRoute } from '../types';
import { Archive, Shield, Droplet, Clock, Download, Map, TrendingUp, AlertTriangle } from 'lucide-react';

export const RouteHistoryPage: React.FC = () => {
  const [selectedRoute, setSelectedRoute] = useState<HistoricalRoute | null>(null);

  // Stats aggregation
  const totalFuel = MOCK_HISTORICAL_ROUTES.reduce((sum, r) => sum + r.actualFuelUsedL, 0);
  const totalDistance = MOCK_HISTORICAL_ROUTES.reduce((sum, r) => sum + r.totalDistanceNm, 0);
  const avgSafety = Math.round(MOCK_HISTORICAL_ROUTES.reduce((sum, r) => sum + r.safetyScore, 0) / MOCK_HISTORICAL_ROUTES.length);
  const totalIncidents = MOCK_HISTORICAL_ROUTES.reduce((sum, r) => sum + r.incidents, 0);

  return (
    <div id="route-history-page" className="flex-1 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 p-4 md:p-6 overflow-y-auto space-y-5 font-sans">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-900/40 border border-purple-300 dark:border-purple-800 text-purple-600 dark:text-purple-400 shadow-sm">
            <Archive className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                Historical Voyage Archive
              </h2>
              <span className="text-[10px] bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800 px-2 py-0.5 rounded-full font-mono font-semibold">
                Reference Metrics
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Review past routes, fuel consumption, transit times, and safety scores to plan future expeditions.
            </p>
          </div>
        </div>
        
        <button
          title="Export CSV"
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold transition"
          onClick={() => alert('CSV Export initiated...')}
        >
          <Download className="w-3.5 h-3.5" />
          Export Data
        </button>
      </div>

      {/* Aggregate Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
            <Droplet className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total Fuel Burned</p>
            <p className="text-lg font-black font-mono text-slate-900 dark:text-white">{(totalFuel / 1000).toFixed(1)}k L</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total Distance</p>
            <p className="text-lg font-black font-mono text-slate-900 dark:text-white">{totalDistance.toLocaleString()} NM</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Avg Safety Score</p>
            <p className="text-lg font-black font-mono text-slate-900 dark:text-white">{avgSafety}/100</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900/40 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total Incidents</p>
            <p className="text-lg font-black font-mono text-slate-900 dark:text-white">{totalIncidents}</p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Table Section */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Voyage Records</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-slate-50 dark:bg-slate-800/30 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-2 font-semibold">Date</th>
                  <th className="px-4 py-2 font-semibold">Mission Name</th>
                  <th className="px-4 py-2 font-semibold">Vessel</th>
                  <th className="px-4 py-2 font-semibold">Distance</th>
                  <th className="px-4 py-2 font-semibold">Time (Hrs)</th>
                  <th className="px-4 py-2 font-semibold">Fuel (L)</th>
                  <th className="px-4 py-2 font-semibold">Safety</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                {MOCK_HISTORICAL_ROUTES.map((route) => (
                  <tr 
                    key={route.id} 
                    className={`cursor-pointer hover:bg-blue-50 dark:hover:bg-slate-800/80 transition ${selectedRoute?.id === route.id ? 'bg-blue-50 dark:bg-slate-800 border-l-2 border-blue-500' : ''}`}
                    onClick={() => setSelectedRoute(route)}
                  >
                    <td className="px-4 py-3 font-mono">{route.dateCompleted}</td>
                    <td className="px-4 py-3 font-semibold">{route.name}</td>
                    <td className="px-4 py-3">{route.vesselName}</td>
                    <td className="px-4 py-3 font-mono">{route.totalDistanceNm} NM</td>
                    <td className="px-4 py-3 font-mono">{route.actualTimeHours}</td>
                    <td className="px-4 py-3 font-mono">{(route.actualFuelUsedL).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                        route.safetyScore >= 70 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' 
                        : route.safetyScore >= 50 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
                        : 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400'
                      }`}>
                        {route.safetyScore}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Details Pane */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-4 flex flex-col gap-4">
          {selectedRoute ? (
            <>
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{selectedRoute.name}</h3>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">{selectedRoute.missionObjective}</p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Completed On</span>
                  <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{selectedRoute.dateCompleted}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Vessel</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedRoute.vesselName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Incidents</span>
                  <span className={`font-mono font-black ${selectedRoute.incidents > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>{selectedRoute.incidents}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <Droplet className="w-4 h-4 text-blue-500" />
                  <span className="text-[10px] font-bold uppercase text-slate-600 dark:text-slate-300">Fuel Consumption Analysis</span>
                </div>
                <div className="flex justify-between text-xs text-slate-700 dark:text-slate-300">
                  <span>Actual Fuel Used</span>
                  <span className="font-mono font-bold">{(selectedRoute.actualFuelUsedL).toLocaleString()} L</span>
                </div>
                <div className="flex justify-between text-xs text-slate-700 dark:text-slate-300">
                  <span>Estimated Fuel</span>
                  <span className="font-mono">{(selectedRoute.estimatedFuelConsumptionL).toLocaleString()} L</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-2">
                  <div className={`h-full rounded-full ${selectedRoute.actualFuelUsedL > selectedRoute.estimatedFuelConsumptionL ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(100, (selectedRoute.actualFuelUsedL / (selectedRoute.estimatedFuelConsumptionL || 1)) * 100)}%` }} />
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-emerald-500" />
                  <span className="text-[10px] font-bold uppercase text-slate-600 dark:text-slate-300">Time & Distance Analysis</span>
                </div>
                <div className="flex justify-between text-xs text-slate-700 dark:text-slate-300">
                  <span>Actual Time</span>
                  <span className="font-mono font-bold">{selectedRoute.actualTimeHours} Hrs</span>
                </div>
                <div className="flex justify-between text-xs text-slate-700 dark:text-slate-300">
                  <span>Ice Exposure</span>
                  <span className="font-mono">{selectedRoute.seaIceExposureKm} km</span>
                </div>
                <div className="flex justify-between text-xs text-slate-700 dark:text-slate-300">
                  <span>Closest Iceberg CPA</span>
                  <span className="font-mono">{selectedRoute.closestIcebergCpaNm} NM</span>
                </div>
              </div>

            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2 opacity-50">
              <Map className="w-12 h-12" />
              <span className="text-xs font-semibold">Select a route to view details</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
