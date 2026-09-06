import React from 'react';
import { ModelMetricData } from '../types';
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
  CheckCircle2,
  Database,
  Cpu,
  Award,
  Layers,
  Activity,
  FileText,
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
    <div id="model-performance-page" className="flex-1 bg-slate-50 text-slate-900 p-4 md:p-6 overflow-y-auto space-y-5">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-200 text-sky-600 shadow-sm">
            <Radio className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                AI/ML Model Benchmarks & Validation Metrics
              </h2>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-mono">
                Production Validated
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Quantitative validation metrics (MAE, RMSE, R², Position Error) across 14-year Antarctic satellite datasets
            </p>
          </div>
        </div>

        <div className="text-xs text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
          <span>Validation Benchmark: </span>
          <span className="text-sky-600 font-bold">2026 Austral Winter Dataset</span>
        </div>
      </div>

      {/* Grid 1: Model Cards (3 Models) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {metrics.map((m) => (
          <div
            key={m.modelName}
            className="bg-white border border-slate-200 p-4 rounded-xl space-y-3.5 shadow-sm flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="font-bold text-slate-900 text-sm tracking-tight">{m.modelName}</span>
                <span className="text-[10px] bg-sky-50 text-sky-700 border border-sky-200 px-2 py-0.5 rounded-full font-mono font-bold">
                  {m.status}
                </span>
              </div>
              <div className="text-xs text-slate-500">{m.architecture}</div>

              {/* Metric Scores */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                <div className="bg-sky-50 p-2.5 rounded-xl border border-sky-200 text-center">
                  <span className="text-[10px] text-slate-500 block font-semibold">MAE</span>
                  <span className="text-base font-bold text-sky-600 font-mono">{m.mae}</span>
                </div>
                <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 text-center">
                  <span className="text-[10px] text-slate-500 block font-semibold">RMSE</span>
                  <span className="text-base font-bold text-emerald-700 font-mono">{m.rmse}</span>
                </div>
                <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-center">
                  <span className="text-[10px] text-slate-500 block font-semibold">R² SCORE</span>
                  <span className="text-base font-bold text-amber-700 font-mono">{m.r2}</span>
                </div>
              </div>

              {/* Training details */}
              <div className="space-y-1.5 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="flex justify-between">
                  <span className="text-slate-500">Training Window:</span>
                  <span className="text-slate-900 font-mono">{m.trainingPeriod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Dataset Records:</span>
                  <span className="text-slate-900 font-mono">{m.datasetRecordCount.toLocaleString()} pts</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Model Version:</span>
                  <span className="text-emerald-700 font-bold font-mono">{m.version}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 text-xs text-slate-500 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-sky-600" />
              <span>Features: {m.featuresUsed.slice(0, 3).join(', ')}...</span>
            </div>
          </div>
        ))}
      </div>

      {/* Grid 2: Comparative Iceberg Position Error Bar Chart */}
      <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-3.5 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
          <div>
            <span className="font-semibold text-slate-900 text-xs uppercase tracking-wider block">
              Iceberg Trajectory Position Error Benchmark (km)
            </span>
            <span className="text-[11px] text-slate-500">
              Hybrid Hydrodynamic + ML Model vs. Traditional Pure-Physics Drift Equation
            </span>
          </div>
          <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-mono font-bold text-xs">56.7% Error Reduction</span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={icebergErrorData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#0F2444" />
              <XAxis dataKey="horizon" stroke="#64748B" tick={{ fill: '#94A3B8', fontSize: 11 }} />
              <YAxis unit=" km" stroke="#64748B" tick={{ fill: '#94A3B8', fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#071326', borderColor: '#0284C7', borderRadius: 8 }}
              />
              <Legend wrapperStyle={{ fontSize: 11, color: '#94A3B8' }} />
              <Bar
                dataKey="errorKm"
                name="AI Hybrid Trajectory Error (km)"
                fill="#38BDF8"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="baselinePhysics"
                name="Traditional Baseline Drift Error (km)"
                fill="#64748B"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
