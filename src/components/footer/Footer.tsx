import React from 'react';
import { Shield, AlertCircle, Compass, Radio } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer
      id="console-footer"
      className="bg-slate-950 border-t border-slate-800 text-slate-400 px-4 py-2 text-[11px] font-mono select-none flex flex-col sm:flex-row items-center justify-between gap-2 z-30"
    >
      <div className="flex items-center gap-2 text-slate-400">
        <AlertCircle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
        <span>
          <strong>Disclaimer:</strong> Prototype decision-support system. Forecasts and route recommendations are model outputs and should not replace official navigation procedures or maritime safety guidance.
        </span>
      </div>

      <div className="flex items-center gap-3 text-[10px] text-slate-500 whitespace-nowrap">
        <span>MoES • NCPOR • PS #26059</span>
        <span>|</span>
        <span className="text-cyan-400">IMO Polar Code PC5</span>
        <span>|</span>
        <span>v2.4.1 (MoES Build)</span>
      </div>
    </footer>
  );
};
