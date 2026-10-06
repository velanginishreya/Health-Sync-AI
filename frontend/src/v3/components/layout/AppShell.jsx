import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { DemoStrip } from './DemoStrip';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { Topbar } from './Topbar';
import { BottomTabs } from './BottomTabs';

/**
 * AppShell: the authenticated frame.
 * DemoStrip, then a sidebar column plus a content column; the topbar sticks inside
 * the content column only, so its controls share the page's right edge at every
 * width. The drawer and the tab bar are siblings of the sticky, blurred topbar.
 */
export const AppShell = ({ role, children }) => {
  const [navOpen, setNavOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setNavOpen(false);
  }, [location.pathname]);

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-ctl3 focus:bg-sand-950 focus:px-4 focus:py-2.5 focus:text-b2 focus:font-semibold focus:text-bone"
      >
        Skip to content
      </a>

      <DemoStrip />

      <div className="mx-auto flex w-full max-w-[var(--v3-shell)] items-start">
        <Sidebar role={role} />
        <div className="min-w-0 flex-1 pb-[calc(env(safe-area-inset-bottom)+var(--v3-tabbar-h)+8px)] lg:pb-0">
          <Topbar role={role} onMenu={() => setNavOpen(true)} />
          <main id="main" tabIndex={-1} className="outline-none">
            {children}
          </main>
        </div>
      </div>

      <BottomTabs role={role} />
      <MobileNav role={role} open={navOpen} onClose={() => setNavOpen(false)} />
    </>
  );
};
