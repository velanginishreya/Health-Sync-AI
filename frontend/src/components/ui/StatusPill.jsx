import React from 'react';
import clsx from 'clsx';
import { CheckCircle2, AlertTriangle, AlertOctagon, Info, Circle } from 'lucide-react';

const VARIANTS = {
  good: { className: 'status-pill-good', Icon: CheckCircle2 },
  watch: { className: 'status-pill-watch', Icon: AlertTriangle },
  critical: { className: 'status-pill-critical', Icon: AlertOctagon },
  info: { className: 'status-pill-info', Icon: Info },
  neutral: { className: 'status-pill-neutral', Icon: Circle },
};

/**
 * A semantic clinical-status chip. `variant` must reflect a real state
 * (good/watch/critical/info/neutral); color here is never decorative.
 * The label text always ships alongside the color so state never depends on hue alone.
 */
export const StatusPill = ({ variant = 'neutral', children, icon = true, className }) => {
  const { className: variantClass, Icon } = VARIANTS[variant] || VARIANTS.neutral;
  return (
    <span className={clsx('status-pill', variantClass, className)}>
      {icon && <Icon className="w-3.5 h-3.5" strokeWidth={2.25} />}
      {children}
    </span>
  );
};
