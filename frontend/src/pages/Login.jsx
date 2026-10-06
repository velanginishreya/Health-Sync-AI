import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { LogoMark } from '../components/LogoMark';
import { Button } from '../components/ui';
import { Lock, Mail, UserCircle2, Stethoscope, ShieldCheck, AlertTriangle, Cpu, Activity, FileText } from 'lucide-react';

const QUICK_LOGINS = [
  { role: 'Patient', email: 'patient@healthsync.demo', password: 'Patient@123', Icon: UserCircle2 },
  { role: 'Doctor', email: 'doctor@healthsync.demo', password: 'Doctor@123', Icon: Stethoscope },
  { role: 'Admin', email: 'admin@healthsync.demo', password: 'Admin@123', Icon: ShieldCheck },
];

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingRole, setPendingRole] = useState(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const routeForRole = (role) => {
    if (role === 'PATIENT') return '/patient/dashboard';
    if (role === 'DOCTOR') return '/doctor/dashboard';
    return '/admin/dashboard';
  };

  const performLogin = async (loginEmail, loginPassword) => {
    setError('');
    setLoading(true);
    try {
      const res = await axios.post('/api/v1/auth/login', { email: loginEmail, password: loginPassword });
      login(res.data.access_token, { id: res.data.user_id, name: res.data.name, role: res.data.role });
      navigate(routeForRole(res.data.role));
    } catch (err) {
      setError(err.response?.data?.detail || 'That email or password doesn’t match our records.');
    } finally {
      setLoading(false);
      setPendingRole(null);
    }
  };

  const handleLogin = (e) => {
    e?.preventDefault();
    performLogin(email, password);
  };

  const handleQuickLogin = (demo) => {
    setEmail(demo.email);
    setPassword(demo.password);
    setPendingRole(demo.role);
    performLogin(demo.email, demo.password);
  };

  return (
    <div className="min-h-[calc(100vh-6.5rem)] grid lg:grid-cols-2">
      {/* Brand / value panel: hidden on small screens to keep the form the priority */}
      <div className="hidden lg:flex flex-col justify-between bg-ink-950 text-white p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.07] pointer-events-none" style={{
          backgroundImage: 'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
          backgroundSize: '32px 32px'
        }} />
        <div className="relative">
          <div className="flex items-center gap-2.5">
            <LogoMark size={40} />
            <span className="font-bold text-lg">Health Sync AI</span>
          </div>
        </div>

        <div className="relative space-y-8 max-w-sm">
          <div>
            <h2 className="text-2xl font-semibold leading-snug">One structured record. Every role, its own readout.</h2>
          </div>
          <div className="space-y-4">
            {[
              { Icon: Cpu, text: 'Real-time DL risk classification & ACC/AHA ASCVD scoring' },
              { Icon: Activity, text: 'Drug-drug interaction safety checks on every prescription' },
              { Icon: FileText, text: 'HIPAA-anonymized export & FHIR R4 interoperability' },
            ].map(({ Icon, text }) => (
              <div key={text} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-control bg-white/10 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-accent-400" strokeWidth={2} />
                </div>
                <p className="text-sm text-ink-200 leading-relaxed pt-1">{text}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-[11px] text-ink-500">Academic prototype &middot; seeded demo data, not real patients.</p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center bg-surface p-6 sm:p-12">
        <div className="max-w-sm w-full space-y-7">
          <div className="lg:hidden flex items-center gap-2.5 justify-center mb-2">
            <LogoMark size={34} />
            <span className="font-bold text-ink-900">Health Sync AI</span>
          </div>

          <div>
            <h1 className="text-xl font-semibold text-ink-900">Sign in</h1>
            <p className="text-sm text-ink-500 mt-1">Access your Digital Twin context and clinical portal.</p>
          </div>

          {error && (
            <div className="bg-status-critical-50 text-status-critical-700 text-xs p-3 rounded-control border border-status-critical-100 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-ink-700 mb-1.5">Email address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-ink-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-sm border border-line rounded-control bg-surface-raised focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition"
                  placeholder="patient@healthsync.org"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-ink-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-ink-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-sm border border-line rounded-control bg-surface-raised focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <Button type="submit" variant="primary" size="lg" className="w-full" disabled={loading}>
              {loading && !pendingRole ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>

          <div className="pt-5 border-t border-line">
            <span className="instrument-label block mb-2.5">Preset clinical portals &middot; one click</span>
            <div className="grid grid-cols-3 gap-2">
              {QUICK_LOGINS.map((demo) => (
                <button
                  key={demo.role}
                  onClick={() => handleQuickLogin(demo)}
                  disabled={loading}
                  className="px-2 py-3 bg-surface-raised hover:bg-surface-sunken border border-line rounded-control text-xs font-medium flex flex-col items-center gap-1.5 transition text-ink-700 disabled:opacity-50"
                >
                  <demo.Icon className={`w-4 h-4 ${loading && pendingRole === demo.role ? 'animate-pulse text-accent-600' : 'text-ink-500'}`} />
                  <span>{demo.role}</span>
                </button>
              ))}
            </div>
          </div>

          <p className="text-center text-xs text-ink-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-accent-700 font-semibold hover:underline">Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};
