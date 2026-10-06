import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { LogoMark } from './LogoMark';
import { Button } from './ui';
import { LogOut, Bell, Menu, PlayCircle, X, Bot, Cpu, Activity, ShieldCheck, Stethoscope, FileText, LockKeyhole } from 'lucide-react';

const DEMO_STEPS = [
  { title: 'Access the patient workspace', desc: 'Sign in as Arjun Kumar to view a personalized health record.', Icon: Activity },
  { title: 'Inspect the Digital Twin map & organ systems', desc: 'A structured profile graph of history, medications, allergies, vitals, and organ-system risk.', Icon: Cpu },
  { title: 'Upload or generate a lab report PDF', desc: 'Clinical PDF reports are parsed automatically into structured lab values.', Icon: FileText },
  { title: 'Stream live physiological vitals', desc: 'Triggers real-time deep-learning risk evaluation and 10-year ASCVD risk scoring.', Icon: Activity },
  { title: 'Ask the AI health assistant', desc: 'Ask clinical questions and inspect the "context used" panel behind every answer.', Icon: Bot },
  { title: 'Test the safety-intercept guardrails', desc: 'Verify the assistant refuses dosage changes or unauthorized diagnostic claims.', Icon: ShieldCheck },
  { title: 'Switch to the physician workspace', desc: 'Sign in as Dr. Robert Smith to review assigned patients and AI clinical summaries.', Icon: Stethoscope },
  { title: 'Test role-based security isolation', desc: 'Confirm an unauthorized doctor request to another patient is rejected.', Icon: LockKeyhole },
];

export const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);

  useEffect(() => {
    if (user && user.role === 'PATIENT') {
      axios.get('/api/v1/patients/me/notifications')
        .then(res => setNotifications(res.data))
        .catch(() => {});
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-surface-raised border-b border-line sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          {user && (
            <button
              onClick={onMenuClick}
              className="md:hidden -ml-2 p-2 rounded-control text-ink-500 hover:bg-ink-50 hover:text-ink-900 transition shrink-0"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          <Link to="/" className="flex items-center gap-2.5 min-w-0">
            <LogoMark size={38} className="shrink-0" />
            <div className="min-w-0">
              <span className="font-bold text-base text-ink-900 tracking-tight block leading-tight truncate">
                Health Sync <span className="text-accent-600">AI</span>
              </span>
              <span className="text-[10px] text-ink-400 font-medium block truncate">Personalized Digital Twin</span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Button
            variant="secondary"
            size="sm"
            icon={PlayCircle}
            onClick={() => setShowDemoModal(true)}
            className="hidden sm:inline-flex"
          >
            Architecture Guide
          </Button>
          <button
            onClick={() => setShowDemoModal(true)}
            className="sm:hidden p-2 rounded-control text-ink-500 hover:bg-ink-50 hover:text-ink-900 transition"
            aria-label="Open architecture guide"
          >
            <PlayCircle className="w-5 h-5" />
          </button>

          {user ? (
            <div className="flex items-center gap-2 sm:gap-3">
              {user.role === 'PATIENT' && (
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-2 rounded-control text-ink-500 hover:text-accent-600 hover:bg-ink-50 relative transition"
                    aria-label="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {notifications.length > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-status-critical-500 rounded-full ring-2 ring-surface-raised" />
                    )}
                  </button>

                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 max-w-[85vw] panel p-4 z-40 space-y-3">
                      <div className="flex items-center justify-between border-b border-line pb-2">
                        <span className="instrument-label">Notifications ({notifications.length})</span>
                        <button onClick={() => setShowNotifications(false)} className="text-ink-400 hover:text-ink-700" aria-label="Close">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                        {notifications.length === 0 ? (
                          <p className="text-xs text-ink-400 py-2">You're all caught up. Nothing new.</p>
                        ) : notifications.map((n) => (
                          <div key={n.id} className="p-2.5 rounded-control bg-surface-sunken border border-line text-xs space-y-0.5">
                            <span className="font-semibold text-ink-900 block">{n.title}</span>
                            <span className="text-[11px] text-ink-600 block">{n.message}</span>
                            <span className="text-[10px] text-ink-400 block readout mt-0.5">{n.date}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="hidden md:flex flex-col text-right">
                <span className="text-sm font-semibold text-ink-800 leading-tight">{user.name}</span>
                <span className="text-[10px] text-accent-700 font-semibold capitalize bg-accent-50 px-1.5 py-0.5 rounded-control inline-block self-end border border-accent-100 mt-0.5">
                  {user.role}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-control text-ink-500 hover:text-status-critical-600 hover:bg-status-critical-50 transition"
                aria-label="Log out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="px-3 sm:px-4 py-2 text-sm font-medium text-ink-700 hover:text-accent-600 transition">
                Sign In
              </Link>
              <Button as={Link} to="/register" size="sm" variant="primary">
                Register
              </Button>
            </div>
          )}
        </div>
      </div>

      {showDemoModal && (
        <div className="fixed inset-0 bg-ink-950/50 backdrop-blur-[2px] z-50 flex items-center justify-center p-4" onClick={() => setShowDemoModal(false)}>
          <div className="bg-surface-raised rounded-card max-w-lg w-full p-6 space-y-4 border border-line shadow-overlay max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h3 className="text-base font-semibold text-ink-900">Clinical architecture guide</h3>
              <button onClick={() => setShowDemoModal(false)} className="text-ink-400 hover:text-ink-700" aria-label="Close">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-ink-500">
              An evaluation walkthrough across four modules: the Digital Twin engine, document AI parser, explainable RAG assistant, and role-based security framework.
            </p>

            <ol className="space-y-2.5">
              {DEMO_STEPS.map((s, i) => (
                <li key={s.title} className="flex gap-3 p-3 bg-surface-sunken rounded-control border border-line">
                  <div className="w-6 h-6 rounded-full bg-ink-900 text-white text-[11px] font-bold flex items-center justify-center shrink-0 readout">
                    {i + 1}
                  </div>
                  <div className="min-w-0">
                    <span className="font-semibold text-ink-900 block text-xs">{s.title}</span>
                    <span className="text-[11px] text-ink-500">{s.desc}</span>
                  </div>
                </li>
              ))}
            </ol>

            <Button variant="dark" size="md" className="w-full" onClick={() => setShowDemoModal(false)}>
              Close guide
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};
