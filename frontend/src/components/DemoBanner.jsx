import React from 'react';
import { FlaskConical } from 'lucide-react';

/**
 * Honest, quiet disclosure that this is an academic prototype running on
 * seeded demo data, present on every screen, but never the visual centerpiece.
 */
export const DemoBanner = () => {
  return (
    <div className="bg-ink-900 text-ink-200 px-4 py-1.5 text-center sm:text-left">
      <div className="max-w-7xl mx-auto flex items-center justify-center sm:justify-start gap-2 text-[11px] font-medium tracking-wide">
        <FlaskConical className="w-3.5 h-3.5 text-accent-400 shrink-0" strokeWidth={2} />
        <span>Academic prototype &middot; running on seeded demo data, not real patients</span>
      </div>
    </div>
  );
};
