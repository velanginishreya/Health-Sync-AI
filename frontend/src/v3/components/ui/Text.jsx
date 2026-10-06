import React from 'react';
import { cn } from '../../lib/cn';

/*
  Text primitives. Four roles, no more:
  - Caps   : the small letter-spaced label. Labels a value or a group, never sits
             above a heading as decoration (the v2 hard rule, kept).
  - Meta   : quiet supporting sentence under a value or title.
  - Mono   : machine text and every inline clinical value. Geist Mono, tabular.
  - Readout: a clinical number as a first-class object (mono, tabular, sized).
*/

export const Caps = ({ children, tone = 'sand', className = '', as: As = 'span' }) => (
  <As
    className={cn(
      'text-mic uppercase tracking-caps',
      tone === 'dusk' ? 'text-petrol-200' : 'text-sand-600',
      className
    )}
  >
    {children}
  </As>
);

export const Meta = ({ children, tone = 'sand', className = '' }) => (
  <span
    className={cn('text-b4', tone === 'dusk' ? 'text-dusk-soft' : 'text-sand-600', className)}
  >
    {children}
  </span>
);

export const Mono = ({ children, tone = 'sand', className = '' }) => (
  <span
    className={cn(
      'v3-num font-mono3 text-m4',
      tone === 'dusk' ? 'text-dusk-soft' : 'text-sand-600',
      className
    )}
  >
    {children}
  </span>
);

const READOUT_SIZES = {
  sm: 'text-m3',
  md: 'text-m2',
  lg: 'text-m1',
};

export const Readout = ({ children, size = 'md', tone = 'sand', className = '' }) => (
  <span
    className={cn(
      'v3-num font-mono3 font-medium',
      READOUT_SIZES[size] || READOUT_SIZES.md,
      tone === 'dusk' ? 'text-dusk-text' : 'text-sand-950',
      className
    )}
  >
    {children}
  </span>
);

/** Inline value + unit, baseline-aligned the same way everywhere (the v2 audit
    found five different alignments across pages). */
export const ValueUnit = ({ value, unit, className = '', unitClassName = '' }) => (
  <span className={cn('inline-flex items-baseline gap-1', className)}>
    <span className="v3-num font-mono3 font-medium text-sand-950">{value}</span>
    {unit && <span className={cn('text-m4 text-sand-500', unitClassName)}>{unit}</span>}
  </span>
);
