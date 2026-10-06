import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/cn';
import { pressable, pressableFlat } from '../../lib/motion';

/*
  Button: a clay key. The physical parts live in theme.css (.clay-*), the transform
  physics live in Framer (pressable), and this file only decides which material and
  which size. On tap the face translates down by exactly the edge height while CSS
  collapses the edge from 4px to 1px, so the key bottoms out on the bone; release
  springs back with one soft wobble. Both parts stay in one system: never set
  transform in CSS on a clay control, never animate box-shadow in JS.
*/

const VARIANTS = {
  petrol: { cls: 'clay-petrol', edge: 4 },
  dusk: { cls: 'clay-dusk', edge: 4 },
  vellum: { cls: 'clay-vellum', edge: 3 },
  critical: { cls: 'clay-critical', edge: 4 },
  quiet: { cls: 'clay-quiet', edge: 0, flat: true },
  quietDusk: { cls: 'clay-quiet-dusk', edge: 0, flat: true },
};

const SIZES = {
  sm: 'h-9 px-3.5 text-b3',
  md: 'h-11 px-4 text-b2',
  lg: 'h-12 px-5 text-b2',
};

const MotionLink = motion.create(Link);

export const Button = React.forwardRef(function Button(
  {
    to,
    href,
    variant = 'petrol',
    size = 'md',
    icon: Icon,
    iconRight: IconRight,
    loading = false,
    disabled = false,
    block = false,
    className = '',
    children,
    type = 'button',
    ...props
  },
  ref
) {
  const v = VARIANTS[variant] || VARIANTS.petrol;
  const inert = disabled || loading;
  const Comp = to ? MotionLink : href ? motion.a : motion.button;
  const physics =
    v.flat
      ? { whileTap: pressableFlat.whileTap, transition: pressableFlat.transition }
      : pressable(v.edge);

  return (
    <Comp
      ref={ref}
      {...physics}
      aria-disabled={inert || undefined}
      disabled={!to && !href ? inert : undefined}
      type={!to && !href ? type : undefined}
      className={cn(
        'v3-clay group rounded-ctl3',
        v.cls,
        SIZES[size] || SIZES.md,
        'font-semibold',
        block && 'w-full',
        inert && 'pointer-events-none opacity-55 saturate-[0.6]',
        className
      )}
      {...(to ? { to } : href ? { href } : {})}
      {...props}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 shrink-0 animate-spin" strokeWidth={2.2} />
      ) : (
        Icon && <Icon className="h-4 w-4 shrink-0" strokeWidth={2.2} />
      )}
      {children && <span className="truncate">{children}</span>}
      {!loading && IconRight && (
        <IconRight
          className="h-4 w-4 shrink-0 transition-transform duration-150 ease-out group-hover:translate-x-0.5"
          strokeWidth={2.2}
        />
      )}
    </Comp>
  );
});

/** Square icon control. `label` is required on purpose: an icon-only button
    without an accessible name is a bug, not a style choice. */
export const IconButton = React.forwardRef(function IconButton(
  { label, icon: Icon, variant = 'vellum', size = 'md', className = '', ...props },
  ref
) {
  const v = VARIANTS[variant] || VARIANTS.vellum;
  const physics =
    v.flat
      ? { whileTap: pressableFlat.whileTap, transition: pressableFlat.transition }
      : pressable(v.edge, { lift: 1.5 });

  return (
    <motion.button
      ref={ref}
      type="button"
      aria-label={label}
      title={label}
      {...physics}
      className={cn(
        'v3-clay clay-icon rounded-ctl3',
        v.cls,
        size === 'sm' ? 'h-9 w-9' : 'h-11 w-11',
        className
      )}
      {...props}
    >
      <Icon className="h-4 w-4" strokeWidth={2} />
    </motion.button>
  );
});
