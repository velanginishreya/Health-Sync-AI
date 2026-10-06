import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { HeartPulse, Plus, TrendingUp, Zap, Droplet } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Panel, PanelHeader, Button, PageHeader, EmptyState } from '../../components/ui';

const CHART_GRID = '#E1E4E1';
const CHART_AXIS = '#7C8996';
const CHART_TOOLTIP_STYLE = {
  backgroundColor: '#FFFFFF',
  border: '1px solid #E1E4E1',
  borderRadius: 10,
  fontSize: 12,
  boxShadow: '0 1px 2px rgba(10,14,19,0.05)',
};
const CHART_LEGEND_STYLE = { fontSize: 11, color: '#5B6875' };

const inputClass = 'w-full px-3 py-2.5 text-xs border border-line rounded-control bg-surface-raised focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition';

export const Vitals = () => {
  const [trends, setTrends] = useState({ bp: [], heart_rate: [], spo2: [], glucose: [], weight: [] });
  const [loading, setLoading] = useState(true);
  const [streaming, setStreaming] = useState(false);

  // Form states
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [heartRate, setHeartRate] = useState('');
  const [spo2, setSpo2] = useState('');
  const [glucose, setGlucose] = useState('');

  useEffect(() => {
    fetchTrends();
  }, []);

  const fetchTrends = async () => {
    try {
      const res = await axios.get('/api/v1/patients/me/vitals/trends');
      setTrends(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateStream = async () => {
    setStreaming(true);
    try {
      await axios.post('/api/v1/patients/me/vitals/simulate-stream');
      fetchTrends();
    } catch (err) {
      console.error(err);
    } finally {
      setStreaming(false);
    }
  };

  const handleRecordVitals = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/v1/patients/me/vitals', {
        systolic_bp: systolic ? parseFloat(systolic) : null,
        diastolic_bp: diastolic ? parseFloat(diastolic) : null,
        heart_rate: heartRate ? parseFloat(heartRate) : null,
        spo2: spo2 ? parseFloat(spo2) : null,
        blood_glucose: glucose ? parseFloat(glucose) : null
      });
      setSystolic('');
      setDiastolic('');
      setHeartRate('');
      setSpo2('');
      setGlucose('');
      fetchTrends();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="panel h-20" />
        <div className="panel h-40" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="panel h-72" />
          <div className="panel h-72" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        label="Longitudinal monitoring"
        title="Vital Signs & Trend Analytics"
        description="Log measurements and analyze longitudinal trends"
        actions={
          <Button variant="dark" icon={Zap} onClick={handleSimulateStream} disabled={streaming}>
            <span className={streaming ? 'animate-pulse' : ''}>
              {streaming ? 'Streaming vitals…' : 'Simulate live vitals stream'}
            </span>
          </Button>
        }
      />

      {/* Manual Entry Form */}
      <Panel className="p-6 space-y-4">
        <PanelHeader label="New entry" title="Record new vital reading" />
        <form onSubmit={handleRecordVitals} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <input
            type="number" placeholder="Systolic BP"
            value={systolic} onChange={(e) => setSystolic(e.target.value)}
            className={inputClass}
          />
          <input
            type="number" placeholder="Diastolic BP"
            value={diastolic} onChange={(e) => setDiastolic(e.target.value)}
            className={inputClass}
          />
          <input
            type="number" placeholder="Heart rate (bpm)"
            value={heartRate} onChange={(e) => setHeartRate(e.target.value)}
            className={inputClass}
          />
          <input
            type="number" placeholder="SpO2 (%)"
            value={spo2} onChange={(e) => setSpo2(e.target.value)}
            className={inputClass}
          />
          <input
            type="number" placeholder="Glucose (mg/dL)"
            value={glucose} onChange={(e) => setGlucose(e.target.value)}
            className={inputClass}
          />
          <Button type="submit" variant="primary" icon={Plus} className="col-span-2 sm:col-span-1 justify-center">
            Save reading
          </Button>
        </form>
      </Panel>

      {/* Trend Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Blood Pressure Chart */}
        <Panel className="p-5 space-y-3">
          <div className="flex items-center gap-2 text-ink-500 border-b border-line pb-2.5">
            <TrendingUp className="w-4 h-4" strokeWidth={2} />
            <h3 className="text-sm font-semibold text-ink-900">Blood pressure trend (mmHg)</h3>
          </div>
          {trends.bp && trends.bp.length > 0 ? (
            <div className="h-64 -ml-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trends.bp}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} />
                  <XAxis dataKey="date" stroke={CHART_AXIS} fontSize={11} tickLine={false} />
                  <YAxis stroke={CHART_AXIS} fontSize={11} domain={[60, 160]} tickLine={false} />
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                  <Legend wrapperStyle={CHART_LEGEND_STYLE} />
                  <Line type="monotone" dataKey="systolic" stroke="#2563A8" strokeWidth={2} name="Systolic BP" isAnimationActive={false} dot={{ r: 2.5 }} />
                  <Line type="monotone" dataKey="diastolic" stroke="#93BAE5" strokeWidth={2} name="Diastolic BP" isAnimationActive={false} dot={{ r: 2.5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState
              icon={HeartPulse}
              title="No blood pressure readings yet"
              description="Record a reading above, or simulate a live vitals stream, to see your trend here."
            />
          )}
        </Panel>

        {/* Glucose Chart */}
        <Panel className="p-5 space-y-3">
          <div className="flex items-center gap-2 text-ink-500 border-b border-line pb-2.5">
            <Droplet className="w-4 h-4" strokeWidth={2} />
            <h3 className="text-sm font-semibold text-ink-900">Fasting blood glucose trend (mg/dL)</h3>
          </div>
          {trends.glucose && trends.glucose.length > 0 ? (
            <div className="h-64 -ml-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trends.glucose}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} />
                  <XAxis dataKey="date" stroke={CHART_AXIS} fontSize={11} tickLine={false} />
                  <YAxis stroke={CHART_AXIS} fontSize={11} domain={[70, 180]} tickLine={false} />
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                  <Line type="monotone" dataKey="glucose" stroke="#2563A8" strokeWidth={2} name="Fasting glucose" isAnimationActive={false} dot={{ r: 2.5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState
              icon={Droplet}
              title="No glucose readings yet"
              description="Log a fasting glucose reading above to start tracking your trend."
            />
          )}
        </Panel>
      </div>
    </div>
  );
};
