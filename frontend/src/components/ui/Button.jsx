import React from 'react';
import clsx from 'clsx';

const VARIANTS = {
  primary: 'bg-accent-600 hover:bg-accent-700 text-white shadow-panel disabled:bg-accent-300',
  dark: 'bg-ink-900 hover:bg-ink-800 text-white shadow-panel disabled:bg-ink-300',
  secondary: 'bg-surface-raised hover:bg-surface-sunken text-ink-800 border border-line disabled:text-ink-300',
  ghost: 'text-ink-600 hover:bg-ink-50 disabled:text-ink-300',
  danger: 'bg-status-critical-600 hover:bg-status-critical-700 text-white shadow-panel disabled:bg-status-critical-200',
};

const SIZES = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2.5 text-sm gap-2',
  lg: 'px-5 py-3 text-sm gap-2',
};

export const Button = React.forwardRef(
  ({ as: Tag = 'button', variant = 'primary', size = 'md', icon: Icon, iconPosition = 'left', className, children, ...props }, ref) => (
    <Tag
      ref={ref}
      className={clsx(
        'inline-flex items-center justify-center font-semibold rounded-control transition disabled:cursor-not-allowed disabled:opacity-60',
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      {...props}
    >
      {Icon && iconPosition === 'left' && <Icon className="w-4 h-4 shrink-0" strokeWidth={2.25} />}
      {children}
      {Icon && iconPosition === 'right' && <Icon className="w-4 h-4 shrink-0" strokeWidth={2.25} />}
    </Tag>
  )
);
Button.displayName = 'Button';
