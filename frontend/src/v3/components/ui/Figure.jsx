import React from 'react';
import { cn } from '../../lib/cn';
import { Caps } from './Text';

/*
  Figure: one clinical value, set the way a well-printed record sets it. Label in
  caps above, value in Fraunces with tabular figures, unit baseline-aligned, meaning
  spelled out underneath. This is the product's unit of emphasis; there is no
  "metric card" with an icon tile.
*/

/** The one set of figure sizes in the product. Anything that prints a first-class
    clinical value reads its size from here, so a phone mock and a dashboard tile
    can never invent their own. */
export const FIGURE_SIZE = {
  xs: 'text-[20px]',
  sm: 'text-[26px]',
  md: 'text-[34px]',
  lg: 'text-[46px]',
};

export const Figure = ({
  label,
  value,
  unit,
  tag,
  hint,
  size = 'md',
  tone = 'sand',
  className = '',
}) => (
  <div className={cn('min-w-0', className)}>
    {/* The label reserves a two-line slot (min-h-7 = 28px, exactly two 11px/1.3
        caps lines). One figure in a row will always have a label that wraps; without
        the reservation its value drops a line and the whole row misaligns. */}
    <div className="min-w-0 min-h-7">
      <Caps tone={tone}>{label}</Caps>
    </div>
    <div className="mt-2 flex flex-wrap items-baseline gap-x-1.5 gap-y-1">
      <span
        className={cn(
          'v3-num font-display3 leading-none',
          tone === 'dusk' ? 'text-dusk-text' : 'text-sand-950',
          FIGURE_SIZE[size] || FIGURE_SIZE.md
        )}
      >
        {value}
      </span>
      {unit && (
        <span className={cn('text-b4 font-medium', tone === 'dusk' ? 'text-dusk-faint' : 'text-sand-500')}>
          {unit}
        </span>
      )}
    </div>
    {(tag || hint) && (
      <div className="mt-2.5 flex flex-wrap items-center gap-2">
        {tag}
        {hint && (
          <span className={cn('text-b4', tone === 'dusk' ? 'text-dusk-soft' : 'text-sand-600')}>{hint}</span>
        )}
      </div>
    )}
  </div>
);
