import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  HeartPulse, Pill, FileText, Calendar, AlertTriangle, Bot, Upload, Activity, Zap, Cpu, ArrowRight, X
} from 'lucide-react';
import { Panel, Readout, StatusPill, Button, PageHeader, EmptyState } from '../../components/ui';

export const PatientDashboard = () => {
  const [digitalTwin, setDigitalTwin] = useState(null);
  const [insights, setInsights] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [dlAssessment, setDlAssessment] = useState(null);
  const [ascvdRisk, setAscvdRisk] = useState(null);
  const [loading, setLoading] = useState(true);
  const [streaming, setStreaming] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [dtRes, insRes, apptRes, ascvdRes] = await Promise.all([
        axios.get('/api/v1/patients/me/digital-twin'),
        axios.get('/api/v1/patients/me/insights'),
        axios.get('/api/v1/appointments'),
        axios.get('/api/v1/patients/me/ascvd-risk')
      ]);
      setDigitalTwin(dtRes.data);
      setInsights(insRes.data);
      setAppointments(apptRes.data);
      setAscvdRisk(ascvdRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateStream = async () => {
    setStreaming(true);
    try {
      const res = await axios.post('/api/v1/patients/me/vitals/simulate-stream');
      setDlAssessment(res.data.dl_neural_network_assessment);
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setStreaming(false);
    }
  };

  const handleDismissInsight = async (id) => {
    try {
      await axios.post(`/api/v1/patients/me/insights/${id}/dismiss`);
      setInsights(insights.filter(i => i.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="panel h-28" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="panel h-28" /><div className="panel h-28" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map(i => <div key={i} className="panel h-20" />)}
        </div>
      </div>
    );
  }

  const patient = digitalTwin?.patient || {};
  const vitals = digitalTwin?.recent_vitals?.[0] || {};
  const meds = digitalTwin?.active_medications || [];
  const labs = digitalTwin?.lab_results || [];

  let completenessScore = 30;
  if (patient.blood_group) completenessScore += 10;
  if (digitalTwin?.medical_history?.length > 0) completenessScore += 15;
  if (meds.length > 0) completenessScore += 15;
  if (vitals.bp) completenessScore += 15;
  if (labs.length > 0) completenessScore += 15;

  return (
    <div className="space-y-6">
      {/* Identity strip + live stream control */}
      <Panel className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-ink-900">Welcome back, {patient.name || 'Patient'}</h1>
          <p className="text-xs text-ink-500 mt-1.5 readout">
            ID {patient.id?.substring(0, 8) || '—'} &middot; Age {patient.age || '—'} &middot; Blood group {patient.blood_group || '—'}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button variant="dark" icon={Zap} onClick={handleSimulateStream} disabled={streaming}>
            <span className={streaming ? 'animate-pulse' : ''}>
              {streaming ? 'Streaming vitals…' : 'Stream live vitals'}
            </span>
          </Button>

          <div className="bg-surface-sunken border border-line px-3.5 py-1.5 rounded-control flex items-center gap-3">
            <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
              <svg className="w-10 h-10 transform -rotate-90">
                <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="3" className="text-ink-200" fill="transparent" />
                <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="3" className="text-accent-600" fill="transparent"
                  strokeDasharray={100.5} strokeDashoffset={100.5 - (100.5 * completenessScore) / 100} strokeLinecap="round" />
              </svg>
              <span className="absolute text-[10px] font-bold text-ink-800 readout">{completenessScore}%</span>
            </div>
            <div className="hidden sm:block">
              <span className="text-xs font-semibold text-ink-800 block">Data completeness</span>
              <span className="text-[10px] text-ink-500">Wellness profile integrity</span>
            </div>
          </div>
        </div>
      </Panel>

      {/* Risk readout panels: the two clinical engines, on a dark instrument-panel surface */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-ink-950 text-white p-5 rounded-card space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <Cpu className="w-4 h-4 text-accent-400 shrink-0" strokeWidth={2} />
              <span className="text-sm font-semibold">Deep neural network risk classifier</span>
            </div>
            <span className="text-xs font-semibold bg-white/10 text-ink-100 px-2.5 py-1 rounded-full shrink-0 readout self-start sm:self-auto">
              {dlAssessment ? `${dlAssessment.confidence}%` : '91.67%'} confidence
            </span>
          </div>
          <p className="text-xs text-ink-300 leading-relaxed">
            {dlAssessment ? (
              <>
                Inputs: SBP <span className="readout text-ink-100">{dlAssessment.inputs.systolic_bp}</span> mmHg, SpO2{' '}
                <span className="readout text-ink-100">{dlAssessment.inputs.spo2}</span>%, glucose{' '}
                <span className="readout text-ink-100">{dlAssessment.inputs.glucose}</span> mg/dL. Classification:{' '}
                <strong className="text-status-watch-500">{dlAssessment.label}</strong>
              </>
            ) : (
              'MLP neural network trained on physiological parameters. Stream live vitals to re-evaluate real-time risk classification.'
            )}
          </p>
        </div>

        {ascvdRisk && (
          <div className="bg-ink-950 text-white p-5 rounded-card space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <Activity className="w-4 h-4 text-accent-400 shrink-0" strokeWidth={2} />
                <span className="text-sm font-semibold">ACC/AHA ASCVD 10-year risk engine</span>
              </div>
              <StatusPill variant={ascvdRisk.risk_category === 'HIGH' ? 'critical' : 'good'} className="shrink-0 bg-opacity-100 self-start sm:self-auto">
                <span className="readout">{ascvdRisk.ascvd_10yr_risk_percent}%</span> ({ascvdRisk.risk_category})
              </StatusPill>
            </div>
            <p className="text-xs text-ink-300 leading-relaxed">
              {ascvdRisk.interpretation}
              <span className="text-[11px] text-ink-500 block mt-1">Guideline: {ascvdRisk.clinical_guideline}</span>
            </p>
          </div>
        )}
      </div>

      {/* Quick-stat readouts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Readout icon={HeartPulse} tone="critical" label="Blood pressure" value={vitals.bp || '—'} unit="mmHg" />
        <Readout icon={Pill} tone="accent" label="Active medications" value={meds.length} unit="prescribed" />
        <Readout icon={FileText} tone="good" label="Lab parameters" value={labs.length} unit="recorded" />
        <Readout icon={Calendar} tone="ink" label="Next appointment" value={appointments[0]?.appointment_date || 'None scheduled'} />
      </div>

      {/* AI / risk alerts: state is always labeled, never color-only */}
      {insights.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-ink-900 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-status-watch-600" strokeWidth={2} /> Dynamic health signals
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((ins) => (
              <div key={ins.id} className="bg-status-watch-50 border border-status-watch-100 p-4 rounded-card flex items-start justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-status-watch-700">{ins.title}</span>
                    <StatusPill variant="watch" icon={false} className="py-0 px-1.5">{ins.severity}</StatusPill>
                  </div>
                  <p className="text-xs text-ink-700">{ins.description}</p>
                  <span className="text-[10px] text-status-watch-600 block readout">Source: {ins.source}</span>
                </div>
                <button
                  onClick={() => handleDismissInsight(ins.id)}
                  className="text-ink-400 hover:text-ink-700 shrink-0 p-1 -m-1 rounded-control transition"
                  aria-label="Dismiss insight"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Primary next actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link to="/patient/ai-assistant" className="bg-accent-600 hover:bg-accent-700 text-white p-5 rounded-card transition flex items-center justify-between group">
          <div className="min-w-0">
            <span className="text-sm font-semibold block">Ask AI health assistant</span>
            <span className="text-xs text-accent-100">Explain report & vitals context</span>
          </div>
          <Bot className="w-6 h-6 text-accent-200 group-hover:translate-x-0.5 transition shrink-0" strokeWidth={1.75} />
        </Link>

        <Link to="/patient/reports" className="panel p-5 hover:border-ink-300 transition flex items-center justify-between text-ink-900 group">
          <div className="min-w-0">
            <span className="text-sm font-semibold block">Upload PDF lab report</span>
            <span className="text-xs text-ink-500">Extract test values automatically</span>
          </div>
          <Upload className="w-5 h-5 text-ink-400 group-hover:text-accent-600 transition shrink-0" strokeWidth={1.75} />
        </Link>

        <Link to="/patient/digital-twin" className="panel p-5 hover:border-ink-300 transition flex items-center justify-between text-ink-900 group">
          <div className="min-w-0">
            <span className="text-sm font-semibold block">View Digital Twin map</span>
            <span className="text-xs text-ink-500">Structured health profile graph</span>
          </div>
          <ArrowRight className="w-5 h-5 text-ink-400 group-hover:text-accent-600 group-hover:translate-x-0.5 transition shrink-0" strokeWidth={1.75} />
        </Link>
      </div>
    </div>
  );
};
