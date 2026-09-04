import React from 'react';
import { AlertCircle } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer
      id="console-footer"
      className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 px-4 py-2 text-[11px] font-sans select-none flex flex-col sm:flex-row items-center justify-between gap-2 z-30"
    >
      <div className="flex items-center gap-2">
        <AlertCircle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
        <span>
          <strong className="font-semibold text-slate-700 dark:text-slate-300">Disclaimer:</strong> Research decision-support prototype. Recommendations do not replace official maritime safety procedures or bridge officer judgment.
        </span>
      </div>

      <div className="flex items-center gap-3 text-[10px] text-slate-400 dark:text-slate-500 whitespace-nowrap font-mono">
        <span>MoES • NCPOR</span>
        <span>|</span>
        <span className="text-blue-600 dark:text-blue-400 font-semibold">IMO Polar Code PC5</span>
        <span>|</span>
        <span>v2.4.1 (Polaris Engine)</span>
      </div>
    </footer>
  );
};
