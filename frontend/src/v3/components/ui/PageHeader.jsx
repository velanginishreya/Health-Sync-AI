import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/cn';
import { riseIn } from '../../lib/motion';

/**
 * PageHeader: h1 + one-sentence purpose + actions, with a hairline underneath.
 * It owns the page's top rhythm; the Page wrapper (layout/Container.jsx) owns the
 * spacing below it. No eyebrow label above the heading, ever.
 */
export const PageHeader = ({ title, description, actions, back, meta, className = '' }) => (
  <motion.header
    {...riseIn(0, 10)}
    className={cn('border-b border-sand-200 pb-5', className)}
  >
    {back && (
      <Link
        to={back.to}
        className="mb-3 inline-flex min-h-8 items-center gap-1 text-b3 font-medium text-sand-600 transition-colors hover:text-petrol-700"
      >
        <ChevronLeft className="h-4 w-4" strokeWidth={2.2} />
        {back.label}
      </Link>
    )}

    {/* Phones stack: title block first (full width), actions below. Side by side,
        the actions steal enough width that a one-sentence description wraps into a
        six-line column. */}
    <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between sm:gap-x-6 sm:gap-y-3">
      <div className="min-w-0 sm:flex-1">
        <h1 className="text-d3 text-sand-950">{title}</h1>
        {description && (
          <p className="mt-2 max-w-2xl text-b2 leading-relaxed text-sand-600">{description}</p>
        )}
        {meta && <div className="mt-3 flex flex-wrap items-center gap-2">{meta}</div>}
      </div>

      {actions && (
        <div className="flex min-w-0 flex-wrap items-center gap-2 sm:justify-end">{actions}</div>
      )}
    </div>
  </motion.header>
);
