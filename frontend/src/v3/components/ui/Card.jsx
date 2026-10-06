import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/cn';

/*
  Surfaces. Two materials, two jobs:
  - Card     : vellum. The everyday content surface, on the bone canvas.
  - DuskPanel: the instrument face. Deep petrol ink with a bloom of light at the
               top-left and grain. Reserved for surfaces that carry live or
               consequential data: risk, vitals, the AI, the hero.

  `SectionHeader` and `PanelTitle` exist so the "label + count + action" row is
  never hand-built again: the v2 audit found eight different versions.
*/

export const Card = ({ children, className = '', pad = 'md', interactive = false, as: As = 'section', ...props }) => {
  const Comp = interactive ? motion[As] || motion.section : As;
  const extra = interactive
    ? { whileHover: { y: -3 }, transition: { type: 'spring', stiffness: 380, damping: 30 } }
    : {};

  return (
    <Comp
      className={cn(
        'rounded-card3 border border-sand-200/90 bg-bone-raised',
        pad === 'none' ? '' : pad === 'sm' ? 'p-4' : pad === 'lg' ? 'p-6 sm:p-7' : 'p-5 sm:p-6',
        interactive ? 'shadow-v3card transition-shadow hover:shadow-v3lift' : 'shadow-v3card',
        className
      )}
      {...extra}
      {...props}
    >
      {children}
    </Comp>
  );
};

export const DuskPanel = ({ children, className = '', pad = 'md', grain = true, ...props }) => (
  <section
    className={cn(
      'v3-dusk rounded-panel3',
      pad === 'none' ? '' : pad === 'sm' ? 'p-4' : pad === 'lg' ? 'p-6 sm:p-8' : 'p-5 sm:p-6',
      grain && 'v3-grain',
      className
    )}
    {...props}
  >
    {children}
  </section>
);

/** PanelTitle: the header inside a card. Owns its own bottom offset, so content
    below never has to guess (audit SP-7). `size="lg"` promotes it to the marketing
    card-title step, so a marketing page has one card-title size, not two. */
export const PanelTitle = ({ children, icon: Icon, count, action, tone = 'sand', size = 'md', className = '' }) => (
  <div className={cn('mb-4 flex items-center justify-between gap-3', className)}>
    <h3
      className={cn(
        size === 'lg' ? 'text-d4' : 'text-d5',
        'flex min-w-0 items-center gap-2',
        tone === 'dusk' ? 'text-dusk-text' : 'text-sand-950'
      )}
    >
      {Icon && (
        <span
          className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-tile3',
            tone === 'dusk' ? 'bg-white/10 text-petrol-200' : 'bg-petrol-50 text-petrol-700'
          )}
        >
          <Icon className="h-4 w-4" strokeWidth={2} />
        </span>
      )}
      <span className="truncate">{children}</span>
      {count !== undefined && (
        <span
          className={cn(
            'v3-num shrink-0 font-mono3 text-m4 font-normal',
            tone === 'dusk' ? 'text-dusk-faint' : 'text-sand-500'
          )}
        >
          {count}
        </span>
      )}
    </h3>
    {action && <div className="shrink-0">{action}</div>}
  </div>
);

/** SectionHeader: the heading + right-hand meta row above a block of content, and
    the only place a section-level action lives. */
export const SectionHeader = ({ title, count, action, hint, className = '' }) => (
  <div className={cn('flex flex-wrap items-end justify-between gap-x-4 gap-y-2', className)}>
    <div className="min-w-0">
      <h2 className="text-d4 font-light text-sand-950">{title}</h2>
      {hint && <p className="mt-1 max-w-xl text-b3 text-sand-600">{hint}</p>}
    </div>
    <div className="flex items-center gap-3">
      {count !== undefined && (
        <span className="v3-num font-mono3 text-m4 text-sand-500">{count}</span>
      )}
      {action}
    </div>
  </div>
);

/** RuleGrid: the 1px-hairline grid behind figure rows and skeleton states. */
export const RuleGrid = ({ children, columns = 4, className = '' }) => (
  <div
    className={cn(
      'grid grid-cols-2 gap-px overflow-hidden rounded-card3 border border-sand-200/90 bg-sand-200',
      columns === 6 ? 'sm:grid-cols-3 lg:grid-cols-6' : columns === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-4',
      className
    )}
  >
    {children}
  </div>
);
