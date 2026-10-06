import {
  Bot,
  Calendar,
  ClipboardList,
  Clock,
  FileText,
  HeartPulse,
  Pill,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Users,
} from 'lucide-react';

/*
  One navigation model. Sidebar, drawer and bottom tabs all derive from here; the
  v2 audit found the tab bar carrying different labels than the rail for the same
  destinations, which is how navigation stops feeling trustworthy.
*/

export const RECORD_LINKS = [
  { to: '/v3/patient/digital-twin', label: 'Health profile', short: 'Health', icon: Sparkles, tab: true },
  { to: '/v3/patient/vitals', label: 'Vitals', icon: HeartPulse },
  { to: '/v3/patient/medications', label: 'Medicines', icon: Pill },
  { to: '/v3/patient/reports', label: 'Lab reports', short: 'Reports', icon: FileText },
  { to: '/v3/patient/timeline', label: 'Timeline', icon: Clock },
  { to: '/v3/patient/medical-history', label: 'Medical history', short: 'History', icon: Stethoscope },
];

export const NAV = {
  PATIENT: [
    {
      items: [
        { to: '/v3/patient/dashboard', label: 'Today', icon: ClipboardList, tab: true },
      ],
    },
    {
      label: 'Your record',
      items: RECORD_LINKS,
    },
    {
      items: [
        { to: '/v3/patient/ai-assistant', label: 'Ask Sync AI', short: 'Ask', icon: Bot, tab: true },
        { to: '/v3/patient/appointments', label: 'Visits', icon: Calendar, tab: true },
      ],
    },
  ],
  DOCTOR: [
    {
      items: [
        { to: '/v3/doctor/dashboard', label: 'Today', icon: ClipboardList, tab: true },
        { to: '/v3/doctor/patients', label: 'Patients', icon: Users, tab: true },
        { to: '/v3/doctor/appointments', label: 'Schedule', icon: Calendar, tab: true },
      ],
    },
  ],
  ADMIN: [
    {
      label: 'System',
      items: [
        { to: '/v3/admin/dashboard', label: 'Overview', icon: ClipboardList, tab: true },
        { to: '/v3/admin/users', label: 'Users', icon: Users, tab: true },
        { to: '/v3/admin/audit-logs', label: 'Audit log', short: 'Audit', icon: ShieldCheck, tab: true },
      ],
    },
  ],
};

export const ROLE_LABEL = { PATIENT: 'Patient', DOCTOR: 'Doctor', ADMIN: 'Admin' };

export const roleHome = (role) => {
  if (role === 'DOCTOR') return '/v3/doctor/dashboard';
  if (role === 'ADMIN') return '/v3/admin/dashboard';
  return '/v3/patient/dashboard';
};

export const navSections = (role) => NAV[String(role || '').toUpperCase()] || [];

export const navItems = (role) => navSections(role).flatMap((section) => section.items);

export const tabItems = (role) => navItems(role).filter((item) => item.tab);

/** Exact match first, then longest prefix: the deepest matching destination wins
    (one matcher for the rail, the drawer and the tabs). */
export const isPathWithin = (pathname, to) =>
  pathname === to || pathname.startsWith(`${to}/`);

export const findNavItem = (role, pathname) => {
  const items = navItems(role);
  const matches = items.filter((item) => isPathWithin(pathname, item.to));
  if (matches.length === 0) return null;
  return matches.sort((a, b) => b.to.length - a.to.length)[0];
};

export const findNavSectionLabel = (role, pathname) => {
  const target = findNavItem(role, pathname);
  if (!target) return null;
  const section = navSections(role).find((s) => s.items.includes(target));
  return section?.label || null;
};
