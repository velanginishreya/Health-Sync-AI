import React from 'react';
import { cn } from '../../lib/cn';

/*
  Two layout primitives, so no page invents its own gutters again.

  - Container: named widths only, and the widths are viewport variables (see
    theme.css) so the page grows on a large display instead of rendering as a
    1200px strip in the middle of it.
  - Page: owns the vertical rhythm below the header. Every page's spacing is
    therefore identical, instead of 24px on two pages and 32px on twelve (the v2
    audit counted exactly that split).
*/
const WIDTHS = {
  app: 'max-w-[var(--v3-content)]',
  marketing: 'max-w-[var(--v3-marketing)]',
  wide: 'max-w-[var(--v3-wide)]',
  reading: 'max-w-[var(--v3-reading)]',
};

export const Container = ({ children, width = 'app', className = '', as: As = 'div' }) => (
  <As
    className={cn(
      'mx-auto w-full px-5 sm:px-8 lg:px-10 2xl:px-14',
      WIDTHS[width] || WIDTHS.app,
      className
    )}
  >
    {children}
  </As>
);

export const Page = ({ children, width = 'app', className = '' }) => (
  <Container width={width} className={cn('py-6 sm:py-8', className)}>
    <div className="space-y-6 sm:space-y-7">{children}</div>
  </Container>
);
