import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { MarketingShell } from '../components/layout/MarketingShell';
import { Container } from '../components/layout/Container';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input, Label, Select } from '../components/ui/Field';
import { Caps, Meta } from '../components/ui/Text';
import { riseIn, stagger, staggerItem } from '../lib/motion';
import { errorText, post } from '../lib/api';

const PROMISES = [
  'Free to create. No card, no plan, nothing to cancel.',
  'Your record stays in this app, tied to the account you make here.',
  'The patient screens are written in plain English, not clinical codes.',
];

const NEXT_STEPS = [
  'You land on Today: readings, medicines, and anything worth a look.',
  'Upload a lab report as a PDF or a photo. Values are read automatically.',
  'Ask questions in your own words. Every answer cites what it used.',
];

export const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: '',
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [pending, setPending] = useState(false);

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const validate = () => {
    const next = {};
    if (!form.first_name.trim()) next.first_name = 'Tell us your first name.';
    if (!form.last_name.trim()) next.last_name = 'Tell us your last name.';
    if (!form.email.trim()) next.email = 'An email address signs you in.';
    if (form.password.length < 6) next.password = 'Use at least 6 characters.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (event) => {
    event.preventDefault();
    setFormError('');
    if (!validate()) return;
    setPending(true);
    try {
      await post('/api/v1/auth/register', {
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim(),
        password: form.password,
        date_of_birth: form.date_of_birth || undefined,
        gender: form.gender || undefined,
        role: 'PATIENT',
      });
      navigate('/v3/login', { state: { justRegistered: true, email: form.email.trim() } });
    } catch (err) {
      setFormError(errorText(err, 'We could not create the account. Check the details and try again.'));
    } finally {
      setPending(false);
    }
  };

  return (
    <MarketingShell>
      <Container width="marketing" className="py-12 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-[1fr_440px] lg:gap-16">
          <motion.div {...stagger(0.06)}>
            <motion.div variants={staggerItem}>
              <h1 className="text-d2 text-sand-950">Create your account.</h1>
              <p className="mt-6 max-w-prose text-b1 text-sand-600">
                One record for your medicines, reports, readings and visits, and one assistant
                that reads it with you.
              </p>
            </motion.div>

            <motion.ul variants={staggerItem} className="mt-8 space-y-3.5">
              {PROMISES.map((promise) => (
                <li key={promise} className="flex items-start gap-3">
                  <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-petrol-500" />
                  <span className="text-b2 text-sand-700">{promise}</span>
                </li>
              ))}
            </motion.ul>

            <motion.div variants={staggerItem} className="mt-10 rounded-card3 border border-sand-200 bg-bone-raised p-5">
              <Caps>What happens next</Caps>
              <ol className="mt-4 space-y-3">
                {NEXT_STEPS.map((step, index) => (
                  <li key={step} className="flex gap-3">
                    <span className="v3-num shrink-0 font-mono3 text-m4 font-semibold text-petrol-700">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="text-b3 leading-relaxed text-sand-700">{step}</span>
                  </li>
                ))}
              </ol>
            </motion.div>
          </motion.div>

          <motion.div {...riseIn(0.1)}>
            <Card pad="lg">
              {formError && (
                <p role="alert" className="mb-5 rounded-card3 border border-sig-critical-100 bg-sig-critical-50 px-4 py-3.5 text-b2 text-sig-critical-700">
                  {formError}
                </p>
              )}

              <form onSubmit={submit} className="space-y-5" noValidate>
                <h3 className="text-d4 text-sand-950">About you</h3>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="register-first" required>
                      First name
                    </Label>
                    <Input
                      id="register-first"
                      autoComplete="given-name"
                      placeholder="Arjun"
                      value={form.first_name}
                      error={errors.first_name}
                      onChange={set('first_name')}
                    />
                  </div>
                  <div>
                    <Label htmlFor="register-last" required>
                      Last name
                    </Label>
                    <Input
                      id="register-last"
                      autoComplete="family-name"
                      placeholder="Kumar"
                      value={form.last_name}
                      error={errors.last_name}
                      onChange={set('last_name')}
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="register-dob" hint="Optional">
                      Date of birth
                    </Label>
                    <Input
                      id="register-dob"
                      type="date"
                      value={form.date_of_birth}
                      onChange={set('date_of_birth')}
                    />
                  </div>
                  <div>
                    <Label htmlFor="register-gender" hint="Optional">
                      Gender
                    </Label>
                    <Select id="register-gender" value={form.gender} onChange={set('gender')}>
                      <option value="">Not specified</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </Select>
                  </div>
                </div>

                <h3 className="text-d4 text-sand-950">Sign-in details</h3>

                <div>
                  <Label htmlFor="register-email" required>
                    Email
                  </Label>
                  <Input
                    id="register-email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={form.email}
                    error={errors.email}
                    onChange={set('email')}
                  />
                </div>

                <div>
                  <Label htmlFor="register-password" required hint="At least 6 characters">
                    Password
                  </Label>
                  <Input
                    id="register-password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Your password"
                    value={form.password}
                    error={errors.password}
                    onChange={set('password')}
                  />
                </div>

                <Button type="submit" size="lg" block loading={pending} iconRight={pending ? undefined : ArrowRight}>
                  Create account
                </Button>

                <Meta className="block leading-relaxed">
                  Creating an account acknowledges this is a student prototype, not a medical
                  service.
                </Meta>
              </form>

              <p className="mt-6 border-t border-sand-200 pt-5 text-b3 text-sand-600">
                Already have an account?{' '}
                <Link
                  to="/v3/login"
                  className="font-medium text-petrol-700 underline decoration-petrol-200 underline-offset-2 transition-colors hover:decoration-petrol-500"
                >
                  Sign in
                </Link>
              </p>
            </Card>
          </motion.div>
        </div>
      </Container>
    </MarketingShell>
  );
};

export default Register;
