import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { LogoMark } from '../components/LogoMark';
import { Button } from '../components/ui';
import { AlertTriangle } from 'lucide-react';

const inputClass = "w-full px-3 py-2.5 text-sm border border-line rounded-control bg-surface-raised focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition";
const labelClass = "block text-xs font-semibold text-ink-700 mb-1.5";

export const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    role: 'PATIENT',
    phone: '',
    date_of_birth: '',
    gender: 'Male'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await axios.post('/api/v1/auth/register', formData);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please check your details and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-6.5rem)] flex items-center justify-center bg-surface py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <LogoMark size={44} className="mx-auto mb-3" />
          <h1 className="text-xl font-semibold text-ink-900">Create your patient account</h1>
          <p className="text-sm text-ink-500 mt-1">Initialize your Digital Twin health context.</p>
        </div>

        <div className="panel p-6 sm:p-7">
          {error && (
            <div className="bg-status-critical-50 text-status-critical-700 text-xs p-3 rounded-control border border-status-critical-100 flex items-center gap-2 mb-4">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleRegister}>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>First name</label>
                <input type="text" required name="first_name" value={formData.first_name} onChange={handleChange} className={inputClass} placeholder="Arjun" />
              </div>
              <div>
                <label className={labelClass}>Last name</label>
                <input type="text" required name="last_name" value={formData.last_name} onChange={handleChange} className={inputClass} placeholder="Kumar" />
              </div>
            </div>

            <div>
              <label className={labelClass}>Email address</label>
              <input type="email" required name="email" autoComplete="email" value={formData.email} onChange={handleChange} className={inputClass} placeholder="arjun@demo.com" />
            </div>

            <div>
              <label className={labelClass}>Password</label>
              <input type="password" required name="password" autoComplete="new-password" value={formData.password} onChange={handleChange} className={inputClass} placeholder="••••••••" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Date of birth</label>
                <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange} className={inputClass}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <Button type="submit" variant="primary" size="lg" className="w-full" disabled={loading}>
              {loading ? 'Creating profile…' : 'Create account'}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-ink-500">
          Already registered?{' '}
          <Link to="/login" className="text-accent-700 font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
};
