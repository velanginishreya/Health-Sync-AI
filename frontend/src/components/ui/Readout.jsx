import React from 'react';
import clsx from 'clsx';

/**
 * The control-room "instrument readout": an icon tile, a label, and a big
 * tabular-numeral value with an optional unit. Used for every quick-stat
 * (blood pressure, medication count, lab count, next appointment, etc.)
 * so clinical numbers always share one visual grammar.
 */
export const Readout = ({ icon: Icon, tone = 'ink', label, value, unit, className }) => {
  const toneClasses = {
    ink: 'bg-ink-50 text-ink-600',
    accent: 'bg-accent-50 text-accent-600',
    good: 'bg-status-good-50 text-status-good-600',
    watch: 'bg-status-watch-50 text-status-watch-600',
    critical: 'bg-status-critical-50 text-status-critical-600',
  };

  return (
    <div className={clsx('panel p-5 flex items-center gap-4', className)}>
      {Icon && (
        <div className={clsx('w-10 h-10 rounded-control flex items-center justify-center shrink-0', toneClasses[tone])}>
          <Icon className="w-5 h-5" strokeWidth={2} />
        </div>
      )}
      <div className="min-w-0">
        <span className="text-xs font-medium text-ink-500 block truncate">{label}</span>
        <span className="readout text-lg font-semibold text-ink-900 leading-tight">
          {value} {unit && <span className="text-xs font-normal text-ink-400">{unit}</span>}
        </span>
      </div>
    </div>
  );
};
