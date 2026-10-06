import React from 'react';
import clsx from 'clsx';

/** Base instrument-panel surface: every card in the app is built from this. */
export const Panel = ({ as: Tag = 'div', className, children, ...props }) => (
  <Tag className={clsx('panel', className)} {...props}>
    {children}
  </Tag>
);

export const PanelHeader = ({ title, action, className }) => (
  <div className={clsx('flex items-start justify-between gap-3', className)}>
    {title && <h3 className="text-sm font-semibold text-ink-900">{title}</h3>}
    {action}
  </div>
);
