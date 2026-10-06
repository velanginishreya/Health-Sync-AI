import React from 'react';
import { cn } from '../../lib/cn';
import { fmtNumber } from '../../lib/format';

/*
  The four zones of the 2018 AHA/ACC 10-year risk model as a horizontal clinical
  scale. Band widths are equal on purpose (legible at a glance); each zone prints
  its real numeric range; the marker sits at the real value and is clamped to
  2 to 98 percent so it can never hang outside the card (a v2 defect).
*/
const ZONES = [
  { key: 'low', label: 'Low', range: 'under 5%', fill: 'bg-sig-good-100' },
  { key: 'borderline', label: 'Borderline', range: '5 to 7.4%', fill: 'bg-sig-watch-100' },
  { key: 'intermediate', label: 'Intermediate', range: '7.5 to 19.9%', fill: 'bg-sig-critical-100' },
  { key: 'high', label: 'High', range: '20% and above', fill: 'bg-sig-critical-600' },
];

const ZONE_TEXT = {
  low: 'text-sig-good-700',
  borderline: 'text-sig-watch-700',
  intermediate: 'text-sig-critical-700',
  high: 'text-sig-critical-700',
};

const markerPercent = (value) => {
  const v = Math.max(0, Number(value) || 0);
  let left;
  if (v < 5) left = (v / 5) * 25;
  else if (v < 7.5) left = 25 + ((v - 5) / 2.5) * 25;
  else if (v < 20) left = 50 + ((v - 7.5) / 12.5) * 25;
  else left = 75 + ((v - 20) / 40) * 25;
  return Math.min(98, Math.max(2, left));
};

export const RiskBand = ({ value, tone = 'sand', className = '', showZones = true }) => {
  const left = markerPercent(value);
  const dusk = tone === 'dusk';

  return (
    <div className={cn('pt-10', className)}>
      <div className="relative">
        <div className="absolute -top-10 z-10 -translate-x-1/2" style={{ left: `${left}%` }}>
          <div className="flex flex-col items-center">
            <span
              className={cn(
                'v3-num rounded-md px-2 py-1 font-mono3 text-m4 font-semibold shadow-v3card',
                dusk ? 'bg-bone text-sand-950' : 'bg-sand-900 text-bone'
              )}
            >
              {fmtNumber(value)}%
            </span>
            <span aria-hidden className={cn('h-3.5 w-px', dusk ? 'bg-bone/70' : 'bg-sand-900/70')} />
          </div>
        </div>

        <div className="flex h-4 overflow-hidden rounded-full">
          {ZONES.map((zone) => (
            <div
              key={zone.key}
              className={cn(
                'flex-1 border-r-2 last:border-r-0',
                dusk ? 'border-dusk-900' : 'border-bone-raised',
                zone.fill
              )}
            />
          ))}
        </div>
      </div>

      {showZones && (
        <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2.5 sm:grid-cols-4">
          {ZONES.map((zone) => (
            <div key={zone.key} className="flex min-w-0 flex-col gap-0.5">
              <span className={cn('text-b3 font-semibold', dusk ? 'text-dusk-body' : ZONE_TEXT[zone.key])}>
                {zone.label}
              </span>
              <span className={cn('v3-num font-mono3 text-m4', dusk ? 'text-dusk-faint' : 'text-sand-500')}>
                {zone.range}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
