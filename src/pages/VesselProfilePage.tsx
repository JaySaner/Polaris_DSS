import React, { useState } from 'react';
import { VesselProfile } from '../types';
import { Ship, Shield, Flame, Navigation, CheckCircle2, RotateCcw, AlertTriangle, Sparkles } from 'lucide-react';

interface VesselProfilePageProps {
  vessel: VesselProfile;
  onUpdateVessel: (updated: VesselProfile) => void;
}

export const VesselProfilePage: React.FC<VesselProfilePageProps> = ({
  vessel,
  onUpdateVessel,
}) => {
  const [formState, setFormState] = useState<VesselProfile>(vessel);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const polarClasses = [
    { code: 'PC1', desc: 'Year-round operation in all polar waters (Heavy icebreaker)' },
    { code: 'PC2', desc: 'Year-round operation in moderate multi-year ice conditions' },
    { code: 'PC3', desc: 'Year-round operation in second-year ice which may include multi-year ice' },
    { code: 'PC4', desc: 'Year-round operation in thick first-year ice' },
    { code: 'PC5', desc: 'Year-round operation in medium first-year ice (MoES Polar Research Standard)' },
    { code: 'PC6', desc: 'Summer/autumn operation in medium first-year ice' },
    { code: 'PC7', desc: 'Summer/autumn operation in thin first-year ice' },
    { code: 'NON-ICE-CLASS', desc: 'Open water only (Zero pack ice navigation permitted)' },
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateVessel(formState);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div id="vessel-profile-page" className="flex-1 bg-[#040914] text-slate-100 p-4 md:p-6 overflow-y-auto space-y-5">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cyan-900/30 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-900/40 border border-cyan-400/40 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <Ship className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-base font-bold text-slate-100 tracking-tight">
                Vessel Hydrodynamics & Polar Code Ice-Class Specification
              </h2>
              <span className="text-[10px] bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-mono">
                IMO Polar Code Calibrated
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Configure vessel speed, fuel burn rate, hull ice-class, and environmental safety tolerances
            </p>
          </div>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-2 px-3.5 py-1.5 bg-emerald-950 text-emerald-300 border border-emerald-500/60 rounded-xl font-semibold text-xs shadow-lg animate-pulse">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Profile Saved & Risk Engine Recalibrated!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Vessel Specifications */}
        <div className="bg-[#071326]/95 border border-cyan-500/20 p-4 rounded-2xl space-y-4 shadow-xl">
          <span className="font-semibold text-slate-100 text-xs uppercase tracking-wider block border-b border-cyan-900/30 pb-2.5">
            Vessel Identity & Hull Dimensions
          </span>

          <div className="space-y-1.5">
            <label className="text-slate-400 block text-xs font-semibold">Vessel Name / Call Sign</label>
            <input
              type="text"
              value={formState.name}
              onChange={(e) => setFormState({ ...formState, name: e.target.value })}
              className="w-full bg-[#050D1A] border border-cyan-500/20 text-slate-100 rounded-xl p-2.5 text-xs font-medium focus:border-cyan-400 focus:outline-none transition"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-400 block text-xs font-semibold">IMO Polar Class Rating</label>
            <select
              value={formState.iceClass}
              onChange={(e) => setFormState({ ...formState, iceClass: e.target.value })}
              className="w-full bg-[#050D1A] border border-cyan-500/20 text-cyan-300 font-semibold rounded-xl p-2.5 text-xs focus:border-cyan-400 focus:outline-none transition"
            >
              {polarClasses.map((pc) => (
                <option key={pc.code} value={pc.code}>
                  {pc.code} — {pc.desc}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-slate-400 block text-xs">Length Overall (LOA m)</label>
              <input
                type="number"
                value={formState.lengthM}
                onChange={(e) => setFormState({ ...formState, lengthM: parseFloat(e.target.value) })}
                className="w-full bg-[#050D1A] border border-cyan-500/20 text-slate-100 rounded-xl p-2.5 text-xs font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-slate-400 block text-xs">Beam (Width m)</label>
              <input
                type="number"
                value={formState.beamM}
                onChange={(e) => setFormState({ ...formState, beamM: parseFloat(e.target.value) })}
                className="w-full bg-[#050D1A] border border-cyan-500/20 text-slate-100 rounded-xl p-2.5 text-xs font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-slate-400 block text-xs">Draft (m)</label>
              <input
                type="number"
                value={formState.draftM}
                onChange={(e) => setFormState({ ...formState, draftM: parseFloat(e.target.value) })}
                className="w-full bg-[#050D1A] border border-cyan-500/20 text-slate-100 rounded-xl p-2.5 text-xs font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-slate-400 block text-xs">Displacement (Tons)</label>
              <input
                type="number"
                value={formState.displacementTons}
                onChange={(e) => setFormState({ ...formState, displacementTons: parseFloat(e.target.value) })}
                className="w-full bg-[#050D1A] border border-cyan-500/20 text-slate-100 rounded-xl p-2.5 text-xs font-mono"
              />
            </div>
          </div>
        </div>

        {/* Propulsion & Environmental Limits */}
        <div className="bg-[#071326]/95 border border-cyan-500/20 p-4 rounded-2xl space-y-4 shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            <span className="font-semibold text-slate-100 text-xs uppercase tracking-wider block border-b border-cyan-900/30 pb-2.5">
              Propulsion, Fuel & Operational Tolerances
            </span>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-slate-400 block text-xs">Cruising Speed (Knots)</label>
                <input
                  type="number"
                  step="0.5"
                  value={formState.cruisingSpeedKnots}
                  onChange={(e) => setFormState({ ...formState, cruisingSpeedKnots: parseFloat(e.target.value) })}
                  className="w-full bg-[#050D1A] border border-cyan-500/20 text-cyan-300 font-bold font-mono rounded-xl p-2.5 text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-slate-400 block text-xs">Max Speed (Knots)</label>
                <input
                  type="number"
                  step="0.5"
                  value={formState.maxSpeedKnots}
                  onChange={(e) => setFormState({ ...formState, maxSpeedKnots: parseFloat(e.target.value) })}
                  className="w-full bg-[#050D1A] border border-cyan-500/20 text-slate-100 font-mono rounded-xl p-2.5 text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-slate-400 block text-xs">Fuel Capacity (Litres)</label>
                <input
                  type="number"
                  value={formState.fuelCapacityL}
                  onChange={(e) => setFormState({ ...formState, fuelCapacityL: parseFloat(e.target.value) })}
                  className="w-full bg-[#050D1A] border border-cyan-500/20 text-slate-100 font-mono rounded-xl p-2.5 text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-slate-400 block text-xs">Fuel Burn Rate (L/hr)</label>
                <input
                  type="number"
                  value={formState.fuelConsumptionLPerHr}
                  onChange={(e) => setFormState({ ...formState, fuelConsumptionLPerHr: parseFloat(e.target.value) })}
                  className="w-full bg-[#050D1A] border border-cyan-500/20 text-amber-300 font-bold font-mono rounded-xl p-2.5 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-slate-400 block text-xs">Max Safe Wave Height (m)</label>
                <input
                  type="number"
                  step="0.5"
                  value={formState.maxSafeWaveHeightM}
                  onChange={(e) => setFormState({ ...formState, maxSafeWaveHeightM: parseFloat(e.target.value) })}
                  className="w-full bg-[#050D1A] border border-cyan-500/20 text-slate-100 font-mono rounded-xl p-2.5 text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-slate-400 block text-xs">Max Safe Wind Speed (km/h)</label>
                <input
                  type="number"
                  value={formState.maxSafeWindSpeedKmh}
                  onChange={(e) => setFormState({ ...formState, maxSafeWindSpeedKmh: parseFloat(e.target.value) })}
                  className="w-full bg-[#050D1A] border border-cyan-500/20 text-slate-100 font-mono rounded-xl p-2.5 text-xs"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            id="btn-save-vessel-profile"
            className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg active:scale-98"
          >
            Update Vessel Specifications & Recalibrate Passage Plan
          </button>
        </div>
      </form>
    </div>
  );
};
