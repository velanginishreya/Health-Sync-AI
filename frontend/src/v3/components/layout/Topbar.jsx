import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Bell, ChevronDown, ChevronRight, LayoutDashboard, LogOut, Menu, Sparkles, UserRound } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { get, useLoad } from '../../lib/api';
import { initials } from '../../lib/format';
import { IconButton } from '../ui/Button';
import { Popover } from '../ui/Popover';
import { Sheet } from '../ui/Overlay';
import { Wordmark } from '../ui/LogoMark';
import { Caps, Meta } from '../ui/Text';
import { findNavItem, findNavSectionLabel, ROLE_LABEL, roleHome } from './nav';

/*
  Topbar. Three fixes worth naming:
  - the row is constrained to the same content width as the page below it, so the
    right-hand controls share the page's right edge (v2 floated them to the
    viewport edge);
  - the left half carries a breadcrumb (section, then destination), which is the
    only place this app names where you are;
  - the bell and the account menu render ONE content component into a popover on
    desktop and a sheet on phones, instead of two hand-maintained copies.
*/

const NotificationRow = ({ item }) => (
  <li className="flex gap-3 px-4 py-3">
    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-petrol-500" aria-hidden />
    <div className="min-w-0">
      <p className="text-b2 font-medium text-sand-900">{item.title}</p>
      <p className="mt-0.5 text-b3 leading-relaxed text-sand-600">{item.message}</p>
      <span className="v3-num mt-1 inline-block font-mono3 text-m4 text-sand-500">{item.date}</span>
    </div>
  </li>
);

const NotificationsContent = ({ items }) => (
  <div>
    <div className="flex items-center justify-between border-b border-sand-200 px-4 py-3">
      <span className="text-d5 text-sand-950">Notifications</span>
      {items.length > 0 && <Meta>{items.length} on file</Meta>}
    </div>
    {items.length === 0 ? (
      <p className="px-4 py-6 text-center text-b3 text-sand-600">
        Nothing new. Reports, visits and risk alerts show up here as they happen.
      </p>
    ) : (
      <ul className="max-h-[380px] divide-y divide-sand-200 overflow-y-auto">
        {items.map((item) => (
          <NotificationRow key={item.id} item={item} />
        ))}
      </ul>
    )}
  </div>
);

const AccountContent = ({ user, role, onSignOut, onNavigate }) => (
  <div>
    <div className="flex items-center gap-3 border-b border-sand-200 px-4 py-3.5">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-ctl3 bg-petrol-600 font-body3 text-b3 font-semibold text-white">
        {initials(user?.name) || 'HS'}
      </span>
      <div className="min-w-0">
        <p className="truncate text-b2 font-semibold text-sand-950">{user?.name || 'Signed in'}</p>
        <p className="truncate text-b3 text-sand-600">
          {ROLE_LABEL[role] || role}
          {user?.email ? ` · ${user.email}` : ''}
        </p>
      </div>
    </div>
    <div className="p-1.5">
      <Link
        to={roleHome(role)}
        onClick={onNavigate}
        className="flex min-h-touch items-center gap-3 rounded-ctl3 px-3 text-b2 font-medium text-sand-800 transition-colors hover:bg-sand-100"
      >
        <LayoutDashboard className="h-4 w-4 text-sand-500" strokeWidth={2} />
        My workspace
      </Link>
      <Link
        to="/v3"
        onClick={onNavigate}
        className="flex min-h-touch items-center gap-3 rounded-ctl3 px-3 text-b2 font-medium text-sand-800 transition-colors hover:bg-sand-100"
      >
        <Sparkles className="h-4 w-4 text-sand-500" strokeWidth={2} />
        About this prototype
      </Link>
      <button
        type="button"
        onClick={onSignOut}
        className="flex min-h-touch w-full items-center gap-3 rounded-ctl3 px-3 text-b2 font-medium text-sig-critical-700 transition-colors hover:bg-sig-critical-50"
      >
        <LogOut className="h-4 w-4" strokeWidth={2} />
        Sign out
      </button>
    </div>
  </div>
);

export const Topbar = ({ role, onMenu }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(null);

  const { data: notificationsData } = useLoad(
    async () => (role === 'PATIENT' ? get('/api/v1/patients/me/notifications') : []),
    [role]
  );
  const notifications = Array.isArray(notificationsData) ? notificationsData : [];

  const current = findNavItem(role, location.pathname);
  const sectionLabel = findNavSectionLabel(role, location.pathname);

  const close = () => setOpen(null);
  const signOut = () => {
    close();
    logout();
    navigate('/v3/login');
  };

  return (
    <header className="sticky top-0 z-30 border-b border-sand-200/90 bg-bone/92 backdrop-blur-md">
      <div className="mx-auto flex h-[var(--v3-topbar-h)] w-full max-w-[var(--v3-content)] items-center gap-3 px-5 sm:px-8 lg:px-10">
        <IconButton label="Open navigation" icon={Menu} variant="quiet" onClick={onMenu} className="lg:hidden" />

        <Link to={roleHome(role)} aria-label="Health Sync AI home" className="rounded-ctl3 lg:hidden">
          <Wordmark markSize={28} />
        </Link>

        {current && (
          <nav aria-label="Breadcrumb" className="hidden min-w-0 items-center gap-2 lg:flex">
            {sectionLabel && (
              <>
                <Caps>{sectionLabel}</Caps>
                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-sand-400" strokeWidth={2} />
              </>
            )}
            <span className="truncate text-b2 font-semibold text-sand-950">{current.label}</span>
          </nav>
        )}

        <div className="ml-auto flex items-center gap-1.5">
          {role === 'PATIENT' && (
            <div className="relative hidden sm:block">
              <IconButton
                label={notifications.length ? `Notifications, ${notifications.length} on file` : 'Notifications'}
                icon={Bell}
                variant="quiet"
                aria-expanded={open === 'bell'}
                aria-haspopup="dialog"
                onClick={() => setOpen(open === 'bell' ? null : 'bell')}
              />
              {notifications.length > 0 && (
                <span
                  aria-hidden
                  className="pointer-events-none absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-petrol-500 ring-2 ring-bone"
                />
              )}
              <Popover open={open === 'bell'} onClose={close} label="Notifications" width="w-[380px]">
                <NotificationsContent items={notifications} />
              </Popover>
            </div>
          )}

          <div className="relative hidden sm:block">
            <button
              type="button"
              onClick={() => setOpen(open === 'account' ? null : 'account')}
              aria-expanded={open === 'account'}
              aria-haspopup="dialog"
              className="flex min-h-touch items-center gap-2.5 rounded-ctl3 px-2 transition-colors hover:bg-sand-200/50"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-tile3 bg-petrol-600 font-body3 text-m4 font-semibold text-white">
                {initials(user?.name) || 'HS'}
              </span>
              <span className="hidden max-w-[140px] truncate text-b3 font-medium text-sand-800 lg:block">
                {user?.name || ROLE_LABEL[role]}
              </span>
              <ChevronDown className="h-4 w-4 text-sand-500" strokeWidth={2} />
            </button>
            <Popover open={open === 'account'} onClose={close} label="Account" width="w-[320px]">
              <AccountContent user={user} role={role} onSignOut={signOut} onNavigate={close} />
            </Popover>
          </div>

          {/* Phones: the same two surfaces, delivered as sheets (portalled, so the
              topbar's backdrop blur can never trap them). */}
          {role === 'PATIENT' && (
            <IconButton
              label={notifications.length ? `Notifications, ${notifications.length} on file` : 'Notifications'}
              icon={Bell}
              variant="quiet"
              aria-expanded={open === 'bell'}
              aria-haspopup="dialog"
              onClick={() => setOpen(open === 'bell' ? null : 'bell')}
              className="sm:hidden"
            />
          )}
          <IconButton
            label="Account and sign out"
            icon={UserRound}
            variant="quiet"
            aria-expanded={open === 'account'}
            aria-haspopup="dialog"
            onClick={() => setOpen(open === 'account' ? null : 'account')}
            className="sm:hidden"
          />
        </div>
      </div>

      <Sheet open={open === 'bell'} onClose={close} title="Notifications">
        <NotificationsContent items={notifications} />
      </Sheet>
      <Sheet open={open === 'account'} onClose={close} title="Account">
        <AccountContent user={user} role={role} onSignOut={signOut} onNavigate={close} />
      </Sheet>
    </header>
  );
};
