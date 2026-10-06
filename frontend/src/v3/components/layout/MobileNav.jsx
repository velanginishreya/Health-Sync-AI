import React from 'react';
import { Link } from 'react-router-dom';
import { Drawer } from '../ui/Overlay';
import { NavList, SidebarFooter } from './Sidebar';
import { Wordmark } from '../ui/LogoMark';
import { roleHome } from './nav';

/**
 * MobileNav: the drawer. Same NavList as the rail, same footer, so the two
 * navigation surfaces cannot diverge (v2 shipped two different footers).
 */
export const MobileNav = ({ role, open, onClose }) => (
  <Drawer open={open} onClose={onClose} label="Navigation">
    <div className="flex items-center justify-between px-4 pb-2 pt-4">
      <Link to={roleHome(role)} onClick={onClose} className="rounded-ctl3">
        <Wordmark />
      </Link>
    </div>
    <div className="flex min-h-0 flex-1 flex-col gap-6 px-3 py-3">
      <NavList role={role} onNavigate={onClose} variant="drawer" className="flex-1" />
      <SidebarFooter role={role} />
    </div>
  </Drawer>
);
