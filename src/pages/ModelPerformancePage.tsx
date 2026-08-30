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
    <div id="model-performance-page" className="flex-1 bg-[#040914] text-slate-100 p-4 md:p-6 overflow-y-auto space-y-5">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cyan-900/30 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-900/40 border border-cyan-400/40 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <Radio className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-base font-bold text-slate-100 tracking-tight">
                AI/ML Model Benchmarks & Validation Metrics
              </h2>
              <span className="text-[10px] bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-mono">
                Production Validated
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Quantitative validation metrics (MAE, RMSE, R², Position Error) across 14-year Antarctic satellite datasets
            </p>
          </div>
        </div>

        <div className="text-xs text-slate-400 bg-[#071326] px-3 py-1.5 rounded-lg border border-cyan-500/20">
          <span>Validation Benchmark: </span>
          <span className="text-cyan-300 font-bold">2026 Austral Winter Dataset</span>
        </div>
      </div>

      {/* Grid 1: Model Cards (3 Models) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {metrics.map((m) => (
          <div
            key={m.modelName}
            className="bg-[#071326]/95 border border-cyan-500/20 p-4 rounded-2xl space-y-3.5 shadow-xl flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-cyan-900/30 pb-2">
                <span className="font-bold text-slate-100 text-sm tracking-tight">{m.modelName}</span>
                <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded-full font-mono font-bold">
                  {m.status}
                </span>
              </div>
              <div className="text-xs text-slate-400">{m.architecture}</div>

              {/* Metric Scores */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                <div className="bg-[#050D1A] p-2.5 rounded-xl border border-cyan-500/20 text-center">
                  <span className="text-[10px] text-slate-400 block font-semibold">MAE</span>
                  <span className="text-base font-bold text-cyan-300 font-mono">{m.mae}</span>
                </div>
                <div className="bg-[#050D1A] p-2.5 rounded-xl border border-cyan-500/20 text-center">
                  <span className="text-[10px] text-slate-400 block font-semibold">RMSE</span>
                  <span className="text-base font-bold text-emerald-300 font-mono">{m.rmse}</span>
                </div>
                <div className="bg-[#050D1A] p-2.5 rounded-xl border border-cyan-500/20 text-center">
                  <span className="text-[10px] text-slate-400 block font-semibold">R² SCORE</span>
                  <span className="text-base font-bold text-amber-300 font-mono">{m.r2}</span>
                </div>
              </div>

              {/* Training details */}
              <div className="space-y-1.5 text-xs bg-[#050D1A] p-3 rounded-xl border border-cyan-500/20">
                <div className="flex justify-between">
                  <span className="text-slate-400">Training Window:</span>
                  <span className="text-slate-200 font-mono">{m.trainingPeriod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Dataset Records:</span>
                  <span className="text-slate-200 font-mono">{m.datasetRecordCount.toLocaleString()} pts</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Model Version:</span>
                  <span className="text-emerald-400 font-bold font-mono">{m.version}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-cyan-900/30 text-xs text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Features: {m.featuresUsed.slice(0, 3).join(', ')}...</span>
            </div>
          </div>
        ))}
      </div>

      {/* Grid 2: Comparative Iceberg Position Error Bar Chart */}
      <div className="bg-[#071326]/90 border border-cyan-500/20 p-4 rounded-2xl space-y-3.5 shadow-xl">
        <div className="flex items-center justify-between border-b border-cyan-900/30 pb-2.5">
          <div>
            <span className="font-semibold text-slate-100 text-xs uppercase tracking-wider block">
              Iceberg Trajectory Position Error Benchmark (km)
            </span>
            <span className="text-[11px] text-slate-400">
              Hybrid Hydrodynamic + ML Model vs. Traditional Pure-Physics Drift Equation
            </span>
          </div>
          <span className="text-emerald-400 font-mono font-bold text-xs">56.7% Error Reduction</span>
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
