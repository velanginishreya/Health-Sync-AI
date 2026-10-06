import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogoMark } from './LogoMark';
import {
  LayoutDashboard, Cpu, Activity, Pill, HeartPulse, FileText,
  Clock, Bot, Calendar, Users, ShieldCheck, Stethoscope, X
} from 'lucide-react';

const PATIENT_LINKS = [
  { to: '/patient/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/patient/digital-twin', label: 'Digital Twin Map', icon: Cpu },
  { to: '/patient/ai-assistant', label: 'AI Assistant', icon: Bot, badge: 'RAG' },
  { to: '/patient/reports', label: 'Lab Reports', icon: FileText },
  { to: '/patient/vitals', label: 'Vitals & Analytics', icon: HeartPulse },
  { to: '/patient/medications', label: 'Medications', icon: Pill },
  { to: '/patient/timeline', label: 'Health Timeline', icon: Clock },
  { to: '/patient/medical-history', label: 'Medical History', icon: Activity },
  { to: '/patient/appointments', label: 'Appointments', icon: Calendar },
];

const DOCTOR_LINKS = [
  { to: '/doctor/dashboard', label: 'Doctor Dashboard', icon: LayoutDashboard },
  { to: '/doctor/patients', label: 'Assigned Patients', icon: Stethoscope },
  { to: '/doctor/appointments', label: 'Clinical Schedule', icon: Calendar },
];

const ADMIN_LINKS = [
  { to: '/admin/dashboard', label: 'Admin Dashboard', icon: LayoutDashboard },
  { to: '/admin/users', label: 'User Directory', icon: Users },
  { to: '/admin/audit-logs', label: 'Security & Audit Logs', icon: ShieldCheck },
];

const NavLinks = ({ links, onNavigate }) => (
  <nav className="space-y-0.5">
    {links.map((link) => {
      const Icon = link.icon;
      return (
        <NavLink
          key={link.to}
          to={link.to}
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center justify-between px-3.5 py-2.5 rounded-control text-sm font-medium transition ${
              isActive
                ? 'bg-accent-50 text-accent-700 font-semibold'
                : 'text-ink-600 hover:bg-surface-sunken hover:text-ink-900'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-accent-600' : 'text-ink-400'}`} strokeWidth={2} />
                <span>{link.label}</span>
              </div>
              {link.badge && (
                <span className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded bg-accent-100 text-accent-700">
                  {link.badge}
                </span>
              )}
            </>
          )}
        </NavLink>
      );
    })}
  </nav>
);

const SidebarContent = ({ role, onNavigate }) => {
  let links = PATIENT_LINKS;
  if (role === 'DOCTOR') links = DOCTOR_LINKS;
  if (role === 'ADMIN') links = ADMIN_LINKS;

  return (
    <>
      <div className="mb-4 px-3 py-2.5 bg-surface-sunken rounded-control border border-line">
        <span className="instrument-label block">Workspace</span>
        <span className="text-sm font-semibold text-ink-800 capitalize">{role?.toLowerCase()} portal</span>
      </div>
      <NavLinks links={links} onNavigate={onNavigate} />
    </>
  );
};

export const Sidebar = ({ mobileOpen, onClose }) => {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <>
      {/* Desktop: static left column */}
      <aside className="w-64 bg-surface-raised border-r border-line min-h-[calc(100vh-4rem)] p-4 shrink-0 hidden md:block">
        <SidebarContent role={user.role} />
      </aside>

      {/* Mobile: off-canvas drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-ink-950/50 backdrop-blur-[1px]" onClick={onClose} />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-surface-raised p-4 shadow-overlay overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <LogoMark size={32} />
                <span className="font-bold text-sm text-ink-900">Health Sync AI</span>
              </div>
              <button onClick={onClose} className="p-2 -mr-2 rounded-control text-ink-500 hover:bg-ink-50" aria-label="Close menu">
                <X className="w-5 h-5" />
              </button>
            </div>
            <SidebarContent role={user.role} onNavigate={onClose} />
          </aside>
        </div>
      )}
    </>
  );
};
