import React from 'react';
import { AlertOctagon, AlertTriangle, CheckCircle2, Circle, Info } from 'lucide-react';
import { cn } from '../../lib/cn';
import { clinicalTone } from '../../lib/clinical';

/*
  Tag: a labelled chip. Colour comes from the `tone` prop only.
  StatusPill: the product's trust primitive. A clinical state is NEVER colour alone:
  every pill ships an icon and a text label, at every size, everywhere.
*/

const TONES = {
  neutral: 'border-sand-300/80 bg-sand-100 text-sand-800',
  petrol: 'border-petrol-200 bg-petrol-50 text-petrol-800',
  dusk: 'border-sand-300/80 bg-sand-200/70 text-sand-800',
  // For tags that sit ON a dusk surface: translucent chalk, never a light pill.
  onDusk: 'border-white/15 bg-white/10 text-dusk-body',
  good: 'border-sig-good-100 bg-sig-good-50 text-sig-good-700',
  watch: 'border-sig-watch-100 bg-sig-watch-50 text-sig-watch-700',
  critical: 'border-sig-critical-100 bg-sig-critical-50 text-sig-critical-700',
  info: 'border-petrol-200 bg-petrol-50 text-petrol-800',
};

/**
 * The same tones on the dark green ink. A clinical state keeps its colour and its
 * icon, but the fill goes translucent so the pill reads as part of the instrument
 * face instead of a sticker on top of it. One rule, every dark surface.
 */
const DUSK_TONES = {
  neutral: 'border-white/15 bg-white/10 text-dusk-body',
  petrol: 'border-petrol-400/40 bg-petrol-400/15 text-petrol-200',
  dusk: 'border-white/15 bg-white/10 text-dusk-body',
  onDusk: 'border-white/15 bg-white/10 text-dusk-body',
  good: 'border-sig-good-500/40 bg-sig-good-500/15 text-sig-good-300',
  watch: 'border-sig-watch-500/40 bg-sig-watch-500/15 text-sig-watch-300',
  critical: 'border-sig-critical-500/40 bg-sig-critical-500/15 text-sig-critical-300',
  info: 'border-petrol-400/40 bg-petrol-400/15 text-petrol-200',
};

export const Tag = ({ children, tone = 'neutral', surface = 'light', icon: Icon, case: casing = 'caps', className = '' }) => (
  <span
    className={cn(
      'inline-flex max-w-full items-center gap-1.5 rounded-full border px-2.5 py-1 text-m4 font-semibold',
      casing === 'caps' ? 'uppercase tracking-caps' : 'normal-case tracking-normal',
      tagTone(tone, surface),
      className
    )}
  >
    {Icon && <Icon className="h-3 w-3 shrink-0" strokeWidth={2.4} />}
    <span className="truncate">{children}</span>
  </span>
);

const PILL_ICON = {
  good: CheckCircle2,
  watch: AlertTriangle,
  critical: AlertOctagon,
  info: Info,
  neutral: Circle,
};

/**
 * The one place a tag/pill colour is resolved. Exported so the few surfaces that
 * cannot use the Tag markup itself (chat source pills, the login demo chip) still
 * read their colour from the same table instead of re-deriving it and drifting.
 */
export const tagTone = (tone = 'neutral', surface = 'light') =>
  ((surface === 'dusk' ? DUSK_TONES : TONES)[tone] || TONES.neutral);

/**
 * StatusPill: give it a clinical value and a label; the tone resolves through the
 * one clinicalTone() map so the same value is the same colour on every screen.
 * Pass `domain` when a word is ambiguous across domains ('HIGH' risk vs 'HIGH' lab).
 */
export const StatusPill = ({ value, label, domain, tone, surface = 'light', className = '', size = 'md' }) => {
  const resolved = tone || clinicalTone(value, domain);
  const Icon = PILL_ICON[resolved] || Circle;
  return (
    <span
      className={cn(
        'inline-flex max-w-full items-center gap-1.5 rounded-full border font-semibold',
        size === 'sm' ? 'px-2 py-0.5 text-m4' : 'px-2.5 py-1 text-b4',
        tagTone(resolved, surface),
        className
      )}
    >
      <Icon className={cn('shrink-0', size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5')} strokeWidth={2.4} />
      <span className="truncate">{label}</span>
    </span>
  );
};
