import React from 'react';

/** Calm, helpful empty/zero-data state: never a bare "No data" line. */
export const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="panel p-10 flex flex-col items-center text-center gap-3">
    {Icon && (
      <div className="w-12 h-12 rounded-control bg-ink-50 text-ink-400 flex items-center justify-center">
        <Icon className="w-6 h-6" strokeWidth={1.75} />
      </div>
    )}
    <div className="space-y-1 max-w-sm">
      <h3 className="text-sm font-semibold text-ink-800">{title}</h3>
      {description && <p className="text-xs text-ink-500">{description}</p>}
    </div>
    {action}
  </div>
);
