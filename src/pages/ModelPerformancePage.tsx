import React from 'react';
import { modelMetricsService } from '../services/modelMetricsService';
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
  Radio,
  Sparkles,
} from 'lucide-react';

export const ModelPerformancePage: React.FC = () => {
  const metrics = modelMetricsService.getModelMetrics();

  const icebergErrorData = [
    { horizon: '+6h', errorKm: 1.15, baselinePhysics: 2.80 },
    { horizon: '+12h', errorKm: 2.30, baselinePhysics: 5.40 },
    { horizon: '+24h', errorKm: 4.12, baselinePhysics: 9.80 },
    { horizon: '+48h', errorKm: 8.65, baselinePhysics: 19.50 },
    { horizon: '+72h', errorKm: 14.80, baselinePhysics: 34.20 },
  ];

  return (
    <div id="model-performance-page" className="flex-1 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 p-4 md:p-6 overflow-y-auto space-y-5 font-sans">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-900/40 border border-blue-300 dark:border-blue-800 text-blue-600 dark:text-blue-400 shadow-sm">
            <Radio className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                AI/ML Model Benchmarks & Validation Metrics
              </h2>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 px-2 py-0.5 rounded-full font-mono font-semibold">
                Production Validated
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Quantitative validation metrics (MAE, RMSE, R², Position Error) across 14-year Antarctic satellite datasets
            </p>
          </div>
        </div>

        <div className="text-xs text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span>Validation Benchmark: </span>
          <span className="text-blue-600 dark:text-blue-400 font-bold">2026 Austral Winter Dataset</span>
        </div>
      </div>

      {/* Grid 1: Model Cards (3 Models) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {metrics.map((m) => (
          <div
            key={m.modelName}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl space-y-3.5 shadow-sm flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="font-bold text-slate-900 dark:text-white text-sm tracking-tight">{m.modelName}</span>
                <span className="text-[10px] bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800 px-2 py-0.5 rounded-full font-mono font-bold">
                  {m.status}
                </span>
              </div>
              <div className="text-xs text-slate-500">{m.architecture}</div>

              {/* Metric Scores */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                <div className="bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-center shadow-sm">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-bold">MAE</span>
                  <span className="text-base font-black text-blue-600 dark:text-blue-400 font-mono">{m.mae}</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-center shadow-sm">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-bold">RMSE</span>
                  <span className="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono">{m.rmse}</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-center shadow-sm">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-bold">R² SCORE</span>
                  <span className="text-base font-black text-amber-600 dark:text-amber-400 font-mono">{m.r2}</span>
                </div>
              </div>

              {/* Training details */}
              <div className="space-y-1.5 text-xs bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex justify-between font-medium">
                  <span className="text-slate-500 dark:text-slate-400">Training Window:</span>
                  <span className="text-slate-900 dark:text-slate-100 font-mono font-bold">{m.trainingPeriod}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span className="text-slate-500 dark:text-slate-400">Dataset Records:</span>
                  <span className="text-slate-900 dark:text-slate-100 font-mono font-bold">{m.datasetRecordCount.toLocaleString()} pts</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span className="text-slate-500 dark:text-slate-400">Model Version:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-black font-mono">{m.version}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Features: {m.featuresUsed.slice(0, 3).join(', ')}...</span>
            </div>
          </div>
        ))}
      </div>

      {/* Grid 2: Comparative Iceberg Position Error Bar Chart */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl space-y-3.5 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
          <div>
            <span className="font-semibold text-slate-800 dark:text-slate-100 text-xs uppercase tracking-wider block">
              Iceberg Trajectory Position Error Benchmark (km)
            </span>
            <span className="text-[11px] text-slate-500">
              Hybrid Hydrodynamic + ML Model vs. Traditional Pure-Physics Drift Equation
            </span>
          </div>
          <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold text-xs">56.7% Error Reduction</span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={icebergErrorData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="horizon" stroke="#94a3b8" tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis unit=" km" stroke="#94a3b8" tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#bfdbfe', borderRadius: 8, fontSize: 12, color: '#0f172a' }}
              />
              <Legend wrapperStyle={{ fontSize: 11, color: '#64748b' }} />
              <Bar
                dataKey="errorKm"
                name="AI Hybrid Trajectory Error (km)"
                fill="#2563eb"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="baselinePhysics"
                name="Traditional Baseline Drift Error (km)"
                fill="#94a3b8"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
