/** Scroll helpers that respect the OS-level reduced-motion setting. A CSS
    scroll-behavior rule cannot override an explicit JS `behavior: 'smooth'`, so
    the check has to happen here. */
export const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;

export const scrollBehavior = () => (prefersReducedMotion() ? 'auto' : 'smooth');

export const scrollToHash = (hash, block = 'start') => {
  if (!hash) return;
  const el = document.getElementById(String(hash).replace(/^#/, ''));
  if (!el) return;
  el.scrollIntoView({ behavior: scrollBehavior(), block });
};

export const softScrollIntoView = (el, block = 'end') => {
  if (!el) return;
  el.scrollIntoView({ behavior: scrollBehavior(), block });
};
