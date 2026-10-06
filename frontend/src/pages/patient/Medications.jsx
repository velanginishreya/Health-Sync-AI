import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Pill, Plus, ShieldAlert, Ban, AlertOctagon } from 'lucide-react';
import { Panel, PanelHeader, StatusPill, Button, PageHeader, EmptyState } from '../../components/ui';

const DDI_SEVERITY_VARIANT = {
  HIGH: 'critical',
  MODERATE: 'watch',
  LOW: 'good',
};

const MED_STATUS_VARIANT = {
  ACTIVE: 'good',
  DISCONTINUED: 'neutral',
  STOPPED: 'neutral',
};

const DDI_TONE_CLASSES = {
  critical: {
    banner: 'bg-status-critical-50 border-status-critical-100',
    icon: 'text-status-critical-600',
    title: 'text-status-critical-700',
    body: 'text-status-critical-700',
  },
  watch: {
    banner: 'bg-status-watch-50 border-status-watch-100',
    icon: 'text-status-watch-600',
    title: 'text-status-watch-700',
    body: 'text-status-watch-700',
  },
  good: {
    banner: 'bg-status-good-50 border-status-good-100',
    icon: 'text-status-good-600',
    title: 'text-status-good-700',
    body: 'text-status-good-700',
  },
};

const inputClass = 'w-full px-3 py-2.5 text-xs border border-line rounded-control bg-surface-raised focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition';

export const Medications = () => {
  const [medications, setMedications] = useState([]);
  const [ddiInteractions, setDdiInteractions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [prescribedBy, setPrescribedBy] = useState('');

  useEffect(() => {
    fetchMeds();
  }, []);

  const fetchMeds = async () => {
    try {
      const [medRes, ddiRes] = await Promise.all([
        axios.get('/api/v1/patients/me/medications'),
        axios.get('/api/v1/patients/me/medications/check-interactions')
      ]);
      setMedications(medRes.data);
      setDdiInteractions(ddiRes.data.interactions_found || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMedication = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/v1/patients/me/medications', {
        name, dosage, frequency, prescribed_by: prescribedBy, status: 'ACTIVE'
      });
      setName('');
      setDosage('');
      setFrequency('');
      setPrescribedBy('');
      fetchMeds();
    } catch (err) {
      console.error(err);
    }
  };

  const handleStopMedication = async (id) => {
    try {
      await axios.post(`/api/v1/patients/me/medications/${id}/stop`);
      fetchMeds();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="panel h-16" />
        <div className="panel h-24" />
        <div className="panel h-40" />
        <div className="panel h-48" />
      </div>
    );
  }

  const activeCount = medications.filter((m) => m.status === 'ACTIVE').length;

  return (
    <div className="space-y-6">
      <PageHeader
        label="Medication tracker"
        title="Active Prescriptions & Medication Tracker"
        description="Track prescribed drugs, frequency, and real-time clinical interaction alerts."
      />

      {/* Drug-Drug Interaction Warning Banner */}
      {ddiInteractions.length > 0 && (
        <div className="space-y-3">
          {ddiInteractions.map((ddi, idx) => {
            const variant = DDI_SEVERITY_VARIANT[ddi.severity] || 'watch';
            const tone = DDI_TONE_CLASSES[variant] || DDI_TONE_CLASSES.watch;
            return (
              <div
                key={idx}
                className={`p-4 rounded-card border flex items-start gap-3 ${tone.banner}`}
              >
                <ShieldAlert className={`w-5 h-5 shrink-0 mt-0.5 ${tone.icon}`} strokeWidth={2} />
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`font-semibold text-sm ${tone.title}`}>{ddi.title}</span>
                    <StatusPill variant={variant}>{ddi.severity} severity interaction</StatusPill>
                  </div>
                  <p className={`text-xs leading-relaxed ${tone.body}`}>{ddi.description}</p>
                  <p className={`text-[11px] font-semibold ${tone.body}`}>Recommendation: {ddi.recommendation}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Safety Alert Banner */}
      <div className="bg-status-watch-50 border border-status-watch-100 p-4 rounded-card text-xs text-status-watch-700 flex items-start gap-3">
        <AlertOctagon className="w-4 h-4 text-status-watch-600 shrink-0 mt-0.5" strokeWidth={2} />
        <span>
          <strong>Medication safety policy:</strong> Health Sync AI provides information over prescribed medicines. The AI Assistant will <strong>never</strong> modify dosage or instruct stopping prescribed treatments. Always consult your prescribing doctor.
        </span>
      </div>

      {/* Add Medication Form */}
      <Panel className="p-6 space-y-4">
        <PanelHeader label="New entry" title="Add prescribed medication" />
        <form onSubmit={handleAddMedication} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <input
            type="text" required placeholder="Medicine name (e.g. Metformin)"
            value={name} onChange={(e) => setName(e.target.value)}
            className={inputClass}
          />
          <input
            type="text" required placeholder="Dosage (e.g. 500 mg)"
            value={dosage} onChange={(e) => setDosage(e.target.value)}
            className={inputClass}
          />
          <input
            type="text" required placeholder="Frequency (e.g. Twice daily)"
            value={frequency} onChange={(e) => setFrequency(e.target.value)}
            className={inputClass}
          />
          <input
            type="text" placeholder="Prescribed by (optional)"
            value={prescribedBy} onChange={(e) => setPrescribedBy(e.target.value)}
            className={inputClass}
          />
          <Button type="submit" variant="primary" icon={Plus} className="sm:col-span-2 lg:col-span-4">
            Add medication
          </Button>
        </form>
      </Panel>

      {/* Medication List */}
      <Panel className="p-6 space-y-4">
        <PanelHeader label="Current regimen" title={`${activeCount} active medication${activeCount === 1 ? '' : 's'}`} />

        {medications.length === 0 ? (
          <EmptyState
            icon={Pill}
            title="No medications recorded yet"
            description="Medications you add above will appear here, along with automatic drug-interaction checks."
          />
        ) : (
          <div className="space-y-3">
            {medications.map((m) => (
              <div key={m.id} className="p-4 rounded-card border border-line bg-surface-sunken flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-ink-900">{m.name}</span>
                    <span className="text-xs bg-accent-100 text-accent-700 font-semibold px-2 py-0.5 rounded-control readout">
                      {m.dosage}
                    </span>
                    <StatusPill variant={MED_STATUS_VARIANT[m.status] || 'neutral'}>{m.status}</StatusPill>
                  </div>
                  <p className="text-xs text-ink-500">
                    Frequency: {m.frequency} &middot; Prescribed by: {m.prescribed_by || 'Physician'}
                  </p>
                </div>

                {m.status === 'ACTIVE' && (
                  <Button
                    variant="danger"
                    size="sm"
                    icon={Ban}
                    onClick={() => handleStopMedication(m.id)}
                    className="shrink-0 self-start sm:self-auto"
                  >
                    Stop medication
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
};
