import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Bot, Plus, ArrowLeft, ShieldAlert } from 'lucide-react';
import { Panel, PanelHeader, Button } from '../../components/ui';

export const PatientDetail = () => {
  const { id } = useParams();
  const [digitalTwin, setDigitalTwin] = useState(null);
  const [aiSummary, setAiSummary] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPatientData();
  }, [id]);

  const fetchPatientData = async () => {
    try {
      const [dtRes, sumRes] = await Promise.all([
        axios.get(`/api/v1/doctor/patients/${id}`),
        axios.get(`/api/v1/doctor/patients/${id}/summary`)
      ]);
      setDigitalTwin(dtRes.data);
      setAiSummary(sumRes.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load patient records (Access Denied)');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    try {
      await axios.post(`/api/v1/doctor/patients/${id}/notes?note=${encodeURIComponent(noteText)}`);
      setNoteText('');
      fetchPatientData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="panel h-16" />
        <div className="panel h-24" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="panel h-40" />
          <div className="panel h-40" />
        </div>
        <div className="panel h-36" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-lg mx-auto mt-6">
        <div className="panel p-10 flex flex-col items-center text-center gap-3">
          <div className="w-12 h-12 rounded-control bg-status-critical-50 text-status-critical-600 flex items-center justify-center">
            <ShieldAlert className="w-6 h-6" strokeWidth={1.75} />
          </div>
          <div className="space-y-1 max-w-sm">
            <h2 className="text-sm font-semibold text-ink-900">Authorization violation (403 Forbidden)</h2>
            <p className="text-xs text-ink-500">{error}</p>
          </div>
          <Button as={Link} to="/doctor/dashboard" variant="danger" size="sm">
            Return to doctor dashboard
          </Button>
        </div>
      </div>
    );
  }

  const patient = digitalTwin?.patient || {};
  const vitals = digitalTwin?.recent_vitals?.[0] || {};

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button as={Link} to="/doctor/dashboard" variant="secondary" size="md" icon={ArrowLeft} aria-label="Back to doctor dashboard" />
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-semibold text-ink-900 truncate">{patient.name}</h1>
          <p className="text-xs text-ink-500 mt-1 readout">
            Age {patient.age || '—'} &middot; Gender {patient.gender || '—'} &middot; Blood group{' '}
            <span className="text-accent-700 font-semibold">{patient.blood_group || '—'}</span>
          </p>
        </div>
      </div>

      {/* AI patient summary for doctors */}
      {aiSummary && (
        <div className="bg-ink-950 text-white p-5 rounded-card space-y-2.5">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-accent-400" strokeWidth={2} />
            <span className="text-sm font-semibold">AI clinical decision-support summary</span>
          </div>
          <p className="text-xs text-ink-200 leading-relaxed whitespace-pre-wrap">{aiSummary.summary}</p>
        </div>
      )}

      {/* Structured Digital Twin highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Panel className="p-5 space-y-3">
          <PanelHeader label="Regimen" title="Active prescribed medications" />
          <div className="space-y-2">
            {digitalTwin?.active_medications?.length ? (
              digitalTwin.active_medications.map((m, idx) => (
                <div key={idx} className="p-2.5 bg-surface-sunken border border-line rounded-control">
                  <span className="text-xs font-semibold text-ink-900 block">
                    {m.name} <span className="font-normal text-ink-500 readout">({m.dosage})</span>
                  </span>
                  <span className="text-[11px] text-ink-500">Frequency: {m.frequency}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-ink-500">No active medications on record.</p>
            )}
          </div>
        </Panel>

        <Panel className="p-5 space-y-3">
          <PanelHeader label="Vitals" title="Latest vitals baseline" />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-[11px] text-ink-500 block mb-0.5">Blood pressure</span>
              <span className="readout text-sm font-semibold text-ink-900">
                {vitals.bp || '138/88'} <span className="text-[11px] font-normal text-ink-400">mmHg</span>
              </span>
            </div>
            <div>
              <span className="text-[11px] text-ink-500 block mb-0.5">Heart rate</span>
              <span className="readout text-sm font-semibold text-ink-900">
                {vitals.heart_rate || 74} <span className="text-[11px] font-normal text-ink-400">bpm</span>
              </span>
            </div>
            <div>
              <span className="text-[11px] text-ink-500 block mb-0.5">SpO2</span>
              <span className="readout text-sm font-semibold text-ink-900">
                {vitals.spo2 || 98} <span className="text-[11px] font-normal text-ink-400">%</span>
              </span>
            </div>
            <div>
              <span className="text-[11px] text-ink-500 block mb-0.5">Blood glucose</span>
              <span className="readout text-sm font-semibold text-ink-900">
                {vitals.glucose || 138} <span className="text-[11px] font-normal text-ink-400">mg/dL</span>
              </span>
            </div>
          </div>
        </Panel>
      </div>

      {/* Add clinical note */}
      <Panel className="p-6 space-y-3">
        <PanelHeader label="Documentation" title="Add doctor clinical note" />
        <form onSubmit={handleAddNote} className="space-y-3">
          <textarea
            required
            rows="3"
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Enter clinical observations, recommended tests, or medication adjustment notes..."
            className="w-full p-3 text-xs border border-line rounded-control bg-surface-raised focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition resize-none"
          />
          <Button type="submit" variant="primary" size="sm" icon={Plus}>
            Save clinical note
          </Button>
        </form>
      </Panel>
    </div>
  );
};
