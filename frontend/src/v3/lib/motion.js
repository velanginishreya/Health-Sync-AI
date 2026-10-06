/*
  Motion vocabulary for the v3 "Vital Clay" redesign. One set of eases, one set of
  springs, one stagger rhythm. Every component imports from here; nothing anywhere
  in /v3 hard-codes a duration or a curve.

  The rules this file encodes (Emil Kowalski's utilitarian doctrine + the 12
  principles at interface scale):

  frequency law
    100+/day actions (nav, filters)      no entrance animation at all
    tens/day (hover, list rows)          remove or shrink to <=120ms
    occasional (menus, dialogs, sheets)  one authored entrance, 150 to 250ms
    rare (page mount, first view)        the only place travel is allowed

  duration law
    press feedback        90ms   (must beat perception, or it reads as lag)
    hover / colour        150ms
    menus, popovers       180ms
    dialogs, sheets       200 to 340ms, exits always faster than entrances
    page entrances        420ms, once per page, transform + opacity only
    nothing functional ever exceeds 300ms

  easing law
    entering / exiting    easeOut  cubic-bezier(0.23, 1, 0.32, 1)
    moving on screen      easeInOut cubic-bezier(0.77, 0, 0.175, 1)
    sheets                easeDrawer cubic-bezier(0.32, 0.72, 0, 1)
    never ease-in. Ever.

  springs
    taps read crisp (near critical damping, no wobble on the way down);
    releases read soft (one gentle overshoot, zeta about 0.6). That difference
    is the plush feel: fast down, soft back.

  the twelve principles, as they apply here
    squash and stretch    the clay press (scaleX 1.025 / scaleY 0.955)
    anticipation          a 2px hover lift before the press
    staging               one entrance per page, nothing competes with it
    pose to pose          key states only; springs interpolate the rest
    follow through        springRelease settles instead of stopping dead
    overlapping action    30 to 60ms stagger, never one element per beat
    slow in slow out      custom curves above, never the built-ins
    arcs                  menus grow from their trigger corner
    secondary action      icons shift 2px on hover, labels do not
    timing                the frequency and duration laws above
    exaggeration          almost none: this is health data, calm is the point
    appeal                one vocabulary, applied without exception
*/

// ------------------------------------------------------------------- eases
export const easeOut = [0.23, 1, 0.32, 1];
export const easeInOut = [0.77, 0, 0.175, 1];
export const easeDrawer = [0.32, 0.72, 0, 1];
export const easeSoft = [0.16, 1, 0.3, 1];

// --------------------------------------------------------------- durations
export const dur = {
  press: 0.09,
  hover: 0.15,
  menu: 0.18,
  enter: 0.42,
  exit: 0.15,
};

// ----------------------------------------------------------------- springs
/** Touch down: near-critical, fast, no wobble. `restDelta` makes the face land
    flush on the 4px edge rather than stopping half a pixel short. */
export const springTap = { type: 'spring', stiffness: 700, damping: 38, mass: 0.6, restDelta: 0.1 };
/** Let go: one soft overshoot, damping ratio about 0.53. This is the wobble that
    reads as "plush": fast down, soft back, settled in under half a second. */
export const springRelease = { type: 'spring', stiffness: 520, damping: 21, mass: 0.75 };
/** Sheets and drawers: heavy enough to feel anchored. */
export const springSheet = { type: 'spring', stiffness: 300, damping: 32, mass: 0.9 };
/** Menus and popovers: quick, tiny overshoot, no drama. */
export const springPop = { type: 'spring', stiffness: 520, damping: 30, mass: 0.7 };
/** Shared-layout indicators (underline, segmented pill). */
export const springIndicator = { type: 'spring', stiffness: 480, damping: 34, mass: 0.7 };

// ---------------------------------------------------------------- presets

/**
 * The clay press. `edge` is the control's hard bottom edge in px; the face
 * translates down by exactly that much while the CSS edge collapses, then springs
 * back through springRelease with one wobble.
 *
 * BOTH phases are springs, and that is the whole trick. A tween for the press phase
 * looks right on the first click and wrong on every one after it: a keyframe/tween
 * animation starts with zero velocity, so a second click that lands mid-release
 * snaps instead of continuing the motion, and the travel distance changes every
 * time. Springs retarget with inherited velocity, so click five is exactly the same
 * physics as click one.
 *
 * The hover state carries no transition of its own for the same reason: if it did,
 * the release would resolve with that tween instead of the spring whenever the
 * pointer is still over the button, which is the normal case for a click.
 */
export const pressable = (edge = 4, { lift = 2 } = {}) => ({
  whileHover: { y: -lift },
  whileTap: {
    y: edge,
    scaleX: 1.025,
    scaleY: 0.955,
    transition: springTap,
  },
  transition: springRelease,
});

/** Rows, cards, chips: press feedback without travel. */
export const pressableFlat = {
  whileTap: { scale: 0.995, transition: springTap },
  transition: springRelease,
};

/** Page entrance, fires on mount, above the fold only. */
export const riseIn = (delay = 0, distance = 14) => ({
  initial: { opacity: 0, y: distance },
  animate: { opacity: 1, y: 0 },
  transition: { duration: dur.enter, ease: easeOut, delay },
});

export const fadeIn = (delay = 0, duration = 0.32) => ({
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration, ease: easeOut, delay },
});

/** Stagger group. Children use `staggerItem`. */
export const stagger = (step = 0.055, delayChildren = 0.04) => ({
  initial: 'hidden',
  animate: 'visible',
  variants: {
    hidden: {},
    visible: { transition: { staggerChildren: step, delayChildren } },
  },
});

export const staggerItem = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.36, ease: easeOut } },
};

/** Sections below the fold: fire once, in view, never replay. */
export const inView = (amount = 0.25) => ({
  initial: 'hidden',
  whileInView: 'visible',
  viewport: { once: true, amount },
  variants: {
    hidden: {},
    visible: { transition: { staggerChildren: 0.06, delayChildren: 0.02 } },
  },
});

/** Display lines climbing out of their mask. The one editorial flourish. */
export const revealLine = (delay = 0, duration = 0.8) => ({
  initial: { y: '112%' },
  animate: { y: '0%' },
  transition: { duration, ease: easeInOut, delay },
});

/** Menus open from their trigger corner. */
export const popIn = {
  initial: { opacity: 0, scale: 0.96, y: -4 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.97, y: -3 },
  transition: { duration: dur.menu, ease: easeOut },
};

export const fade = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.18, ease: easeOut },
};

export const dialogIn = {
  initial: { opacity: 0, scale: 0.965, y: 10 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.98, y: 6 },
  transition: { duration: 0.2, ease: easeOut },
};

export const sheetUp = {
  initial: { y: '100%' },
  animate: { y: 0 },
  exit: { y: '100%' },
  transition: springSheet,
};

export const drawerIn = {
  initial: { x: '-102%' },
  animate: { x: 0 },
  exit: { x: '-102%' },
  transition: { type: 'spring', stiffness: 360, damping: 34, mass: 0.9 },
};

/** Toast: arrives with weight, leaves immediately. */
export const toastIn = {
  initial: { opacity: 0, y: 16, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 8, scale: 0.98 },
  transition: springPop,
};
