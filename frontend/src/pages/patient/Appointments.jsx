import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Plus, Clock, User } from 'lucide-react';
import { Panel, StatusPill, Button, PageHeader, EmptyState } from '../../components/ui';

const statusVariant = (status) => {
  const s = (status || '').toUpperCase();
  if (s === 'CONFIRMED' || s === 'COMPLETED') return 'good';
  if (s === 'PENDING' || s === 'SCHEDULED') return 'watch';
  if (s === 'CANCELLED' || s === 'CANCELED') return 'critical';
  return 'neutral';
};

export const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form
  const [date, setDate] = useState('');
  const [time, setTime] = useState('10:00 AM');
  const [reason, setReason] = useState('');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await axios.get('/api/v1/appointments');
      setAppointments(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    try {
      // Fetch available doctor
      const docsRes = await axios.get('/api/v1/admin/users');
      const docs = docsRes.data.filter(u => u.role === 'DOCTOR');
      const docId = docs.length > 0 ? docs[0].id : 'doc-fallback-id';

      await axios.post('/api/v1/appointments', {
        doctor_id: docId,
        appointment_date: date,
        appointment_time: time,
        reason
      });

      setDate('');
      setReason('');
      fetchAppointments();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="panel h-16" />
        <div className="panel h-40" />
        <div className="panel h-56" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        label="Care coordination"
        title="Appointments"
        description="Schedule and manage visits with your assigned clinical team."
      />

      {/* Book Appointment Card */}
      <Panel className="p-6 space-y-4">
        <h2 className="text-sm font-semibold text-ink-900">Schedule clinical visit</h2>
        <form onSubmit={handleBookAppointment} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label htmlFor="appt-date" className="block text-xs font-semibold text-ink-700 mb-1.5">Date</label>
            <input
              id="appt-date"
              type="date" required
              value={date} onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-line rounded-control bg-surface-raised focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition readout"
            />
          </div>
          <div>
            <label htmlFor="appt-time" className="block text-xs font-semibold text-ink-700 mb-1.5">Time</label>
            <input
              id="appt-time"
              type="text" required placeholder="10:00 AM"
              value={time} onChange={(e) => setTime(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-line rounded-control bg-surface-raised focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition readout"
            />
          </div>
          <div>
            <label htmlFor="appt-reason" className="block text-xs font-semibold text-ink-700 mb-1.5">Reason for visit</label>
            <input
              id="appt-reason"
              type="text" required placeholder="e.g. Follow-up consultation"
              value={reason} onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-line rounded-control bg-surface-raised focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition"
            />
          </div>
          <div className="flex items-end">
            <Button type="submit" variant="primary" icon={Plus} className="w-full">
              Book visit
            </Button>
          </div>
        </form>
      </Panel>

      {/* Appointment History List */}
      <Panel className="p-6 space-y-4">
        <h2 className="text-sm font-semibold text-ink-900">
          Scheduled appointments <span className="readout text-ink-500">({appointments.length})</span>
        </h2>

        {appointments.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No appointments scheduled"
            description="Book your first visit with our clinical team using the form above."
          />
        ) : (
          <div className="space-y-3">
            {appointments.map((a) => (
              <div key={a.id} className="p-4 rounded-card border border-line bg-surface-sunken flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-sm text-ink-900 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-ink-400 shrink-0" strokeWidth={2} />
                      {a.doctor_name || 'Dr. Robert Smith'}
                    </span>
                    <span className="text-xs bg-accent-50 text-accent-700 font-semibold px-2 py-0.5 rounded-control flex items-center gap-1.5 readout">
                      <Clock className="w-3 h-3 shrink-0" strokeWidth={2} />
                      {a.appointment_date} at {a.appointment_time}
                    </span>
                  </div>
                  <p className="text-xs text-ink-600">Reason: {a.reason || 'General follow-up'}</p>
                </div>
                <StatusPill variant={statusVariant(a.status)} className="shrink-0 self-start sm:self-auto">
                  {a.status}
                </StatusPill>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
};
