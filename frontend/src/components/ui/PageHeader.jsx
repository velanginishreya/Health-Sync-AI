import React from 'react';

/** Consistent page-level header: title, description, actions. The heading carries its own weight; no eyebrow label above it. */
export const PageHeader = ({ title, description, actions }) => (
  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
    <div className="min-w-0">
      <h1 className="text-xl sm:text-2xl font-semibold text-ink-900 tracking-tight">{title}</h1>
      {description && <p className="text-sm text-ink-500 mt-1 max-w-2xl">{description}</p>}
    </div>
    {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
  </div>
);
