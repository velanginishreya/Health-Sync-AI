import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { MarketingShell } from '../components/layout/MarketingShell';
import { Container } from '../components/layout/Container';
import { Button } from '../components/ui/Button';
import { DuskPanel } from '../components/ui/Card';
import { Input, Label } from '../components/ui/Field';
import { Caps, Meta } from '../components/ui/Text';
import { tagTone } from '../components/ui/Tag';
import { cn } from '../lib/cn';
import { riseIn, stagger, staggerItem } from '../lib/motion';
import { post, errorText } from '../lib/api';
import { DEMO_ACCOUNTS } from '../lib/demo';
import { useAuth } from '../../contexts/AuthContext';
import { roleHome } from '../components/layout/nav';

/*
  Sign in. The demo accounts are not a fallback hidden in a corner: this is a
  prototype with seeded data, so they are the fastest honest path in, and they sit
  beside the form rather than under it.
*/
export const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState(location.state?.email || '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const [pendingRole, setPendingRole] = useState(null);
  const justRegistered = Boolean(location.state?.justRegistered);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setPending(true);
    try {
      const res = await post('/api/v1/auth/login', { email: email.trim(), password });
      login(res.access_token, { id: res.user_id, name: res.name, role: res.role });
      navigate(roleHome(res.role));
    } catch (err) {
      setError(
        err?.response?.status === 401 || err?.response?.status === 400
          ? 'That email and password do not match. Check both and try again.'
          : errorText(err)
      );
    } finally {
      setPending(false);
    }
  };

  const openDemo = async (account) => {
    setError('');
    setPendingRole(account.role);
    try {
      const res = await post('/api/v1/auth/login', { email: account.email, password: account.password });
      login(res.access_token, { id: res.user_id, name: res.name, role: res.role });
      navigate(roleHome(res.role));
    } catch {
      setError('The demo server is not responding right now. Start the backend and try again.');
    } finally {
      setPendingRole(null);
    }
  };

  return (
    <MarketingShell>
      <Container width="marketing" className="py-12 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-[1fr_440px] lg:gap-16">
          <motion.div {...stagger(0.06)}>
            <motion.div variants={staggerItem}>
              <h1 className="text-d2 text-sand-950">Welcome back.</h1>
              <p className="mt-6 max-w-prose text-b1 text-sand-600">
                Sign in to open your record exactly where you left it.
              </p>
            </motion.div>

            {justRegistered && (
              <motion.div
                variants={staggerItem}
                className="mt-6 flex items-start gap-3 rounded-card3 border border-sig-good-100 bg-sig-good-50 px-4 py-3.5"
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-sig-good-600" strokeWidth={2.2} />
                <p className="text-b2 text-sig-good-700">
                  Account created. Sign in with your email and password to continue.
                </p>
              </motion.div>
            )}

            {error && (
              <motion.p
                variants={staggerItem}
                role="alert"
                className="mt-6 rounded-card3 border border-sig-critical-100 bg-sig-critical-50 px-4 py-3.5 text-b2 text-sig-critical-700"
              >
                {error}
              </motion.p>
            )}

            <motion.form variants={staggerItem} onSubmit={submit} className="mt-8 max-w-md space-y-5" noValidate>
              <div>
                <Label htmlFor="login-email" required>
                  Email
                </Label>
                <Input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="login-password" required>
                  Password
                </Label>
                <Input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="Your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </div>

              <Button type="submit" size="lg" block loading={pending} iconRight={pending ? undefined : ArrowRight}>
                Sign in
              </Button>
            </motion.form>

            <motion.p variants={staggerItem} className="mt-6 text-b3 text-sand-600">
              New here?{' '}
              <Link
                to="/v3/register"
                className="font-medium text-petrol-700 underline decoration-petrol-200 underline-offset-2 transition-colors hover:decoration-petrol-500"
              >
                Create a free account
              </Link>
            </motion.p>
          </motion.div>

          <motion.div {...riseIn(0.1)}>
            <DuskPanel pad="lg">
              <Caps tone="dusk">One click each</Caps>
              <h3 className="mt-2 text-d4 text-dusk-text">Or open the app with demo data.</h3>
              <p className="mt-2 text-b2 leading-relaxed text-dusk-soft">
                Three roles, one seeded record. No typing, no sign-up, nothing to install.
              </p>

              <ul className="mt-6 space-y-2.5">
                {DEMO_ACCOUNTS.map((account) => (
                  <li key={account.role}>
                    <button
                      type="button"
                      onClick={() => openDemo(account)}
                      disabled={pendingRole !== null}
                      className="group flex w-full items-center gap-3 rounded-card3 border border-white/10 bg-white/5 px-4 py-3.5 text-left transition-colors duration-150 hover:border-white/20 hover:bg-white/10 disabled:cursor-wait disabled:opacity-60"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block text-b2 font-semibold text-dusk-text">
                          {account.label}
                        </span>
                        <span className="mt-0.5 block truncate font-mono3 text-m4 text-dusk-faint">
                          {account.email}
                        </span>
                      </span>
                      <span
                        className={cn(
                          'flex h-9 shrink-0 items-center rounded-full border px-3.5 text-b3 font-semibold transition-all duration-150 group-hover:translate-x-0.5',
                          tagTone('onDusk', 'dusk'),
                          'group-hover:border-petrol-300/50'
                        )}
                      >
                        {pendingRole === account.role ? 'Opening' : 'Open'}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>

              <Meta tone="dusk" className="mt-5 block leading-relaxed">
                These accounts are part of the prototype and are reset with the seeded database.
              </Meta>
            </DuskPanel>
          </motion.div>
        </div>
      </Container>
    </MarketingShell>
  );
};

export default Login;
