import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Cpu, HeartPulse, Pill, AlertTriangle, Activity, FileText } from 'lucide-react';
import { Panel, StatusPill, Button, PageHeader } from '../../components/ui';

const ORGAN_STATUS_VARIANT = {
  NORMAL: 'good',
  GUARDED: 'watch',
};

const CONDITION_STATUS_VARIANT = {
  ACTIVE: 'watch',
  CHRONIC: 'watch',
  RESOLVED: 'good',
};

const LAB_STATUS_VARIANT = {
  HIGH: 'watch',
  LOW: 'watch',
};

export const DigitalTwin = () => {
  const [digitalTwin, setDigitalTwin] = useState(null);
  const [organSystems, setOrganSystems] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exportingFhir, setExportingFhir] = useState(false);

  useEffect(() => {
    Promise.all([
      axios.get('/api/v1/patients/me/digital-twin'),
      axios.get('/api/v1/patients/me/organ-systems')
    ])
      .then(([twinRes, organRes]) => {
        setDigitalTwin(twinRes.data);
        setOrganSystems(organRes.data);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleExportFHIR = async () => {
    try {
      setExportingFhir(true);
      const res = await axios.get('/api/v1/patients/me/fhir-export');
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fhir_bundle_${digitalTwin?.patient?.name || 'patient'}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert("Failed to export FHIR bundle: " + err.message);
    } finally {
      setExportingFhir(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="panel h-20" />
        <div className="panel h-56" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[0, 1, 2, 3, 4, 5].map((i) => <div key={i} className="panel h-40" />)}
        </div>
      </div>
    );
  }

  const patient = digitalTwin?.patient || {};
  const meds = digitalTwin?.active_medications || [];
  const conditions = digitalTwin?.medical_history || [];
  const allergies = digitalTwin?.allergies || [];
  const vitals = digitalTwin?.recent_vitals || [];
  const labs = digitalTwin?.lab_results || [];
  const family = digitalTwin?.family_history || [];

  return (
    <div className="space-y-6">
      <PageHeader
        label="Digital twin"
        title="Patient Digital Twin Architecture"
        description={
          <>Dynamic physiological context constructed for patient{' '}
            <span className="font-semibold text-ink-800">{patient.name}</span>
          </>
        }
        actions={
          <>
            <Button variant="primary" size="sm" icon={FileText} onClick={handleExportFHIR} disabled={exportingFhir}>
              {exportingFhir ? 'Exporting FHIR…' : 'Export HL7 FHIR R4 bundle'}
            </Button>
            <StatusPill variant="good">Authorized context active</StatusPill>
          </>
        }
      />

      {/* 5-Organ Systems Health Heatmap */}
      {organSystems && (
        <div className="bg-ink-950 text-white p-5 rounded-card space-y-4 shadow-panel">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-accent-400" strokeWidth={2} />
              <h2 className="text-base font-semibold tracking-tight">Digital twin: organ systems health heatmap</h2>
            </div>
            <span className="text-[11px] font-mono text-accent-300 bg-white/10 px-2.5 py-1 rounded-control font-semibold self-start sm:self-auto">
              Dynamic physiological matrix
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {Object.entries(organSystems).map(([key, sys]) => (
              <div key={key} className="bg-ink-900 p-3.5 rounded-control border border-ink-700 space-y-2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-xs font-semibold text-ink-200">{sys.name}</span>
                    <StatusPill variant={ORGAN_STATUS_VARIANT[sys.status] || 'critical'} icon={false} className="py-0 px-1.5 shrink-0">
                      {sys.status}
                    </StatusPill>
                  </div>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="readout text-xl font-semibold text-white">{sys.score}</span>
                    <span className="text-[10px] text-ink-400">/100 score</span>
                  </div>
                </div>
                <p className="text-[11px] text-ink-400 leading-tight pt-2 border-t border-ink-700">
                  {sys.key_metrics}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interactive Central Node Map */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Node 1: Patient Profile & Demographics */}
        <Panel className="p-5 space-y-3">
          <div className="flex items-center gap-2 text-ink-500 border-b border-line pb-2.5">
            <Cpu className="w-4 h-4" strokeWidth={2} />
            <h3 className="text-sm font-semibold text-ink-900">Demographics & lifestyle</h3>
          </div>
          <div className="space-y-1.5 text-xs text-ink-600">
            <p><span className="text-ink-500">Name</span> <span className="font-medium text-ink-800">{patient.name}</span></p>
            <p>
              <span className="text-ink-500">Age</span> <span className="readout font-medium text-ink-800">{patient.age}</span> years
              {' '}&middot;{' '}
              <span className="text-ink-500">Gender</span> <span className="font-medium text-ink-800">{patient.gender}</span>
            </p>
            <p><span className="text-ink-500">Blood group</span> <span className="readout font-semibold text-accent-700">{patient.blood_group}</span></p>
            <p><span className="text-ink-500">Height / weight</span> <span className="readout font-medium text-ink-800">{patient.height_cm} cm / {patient.weight_kg} kg</span></p>
            <p><span className="text-ink-500">Diet</span> <span className="font-medium text-ink-800">{patient.lifestyle?.diet || 'Vegetarian'}</span></p>
            <p><span className="text-ink-500">Exercise</span> <span className="font-medium text-ink-800">{patient.lifestyle?.exercise || '2x weekly'}</span></p>
          </div>
        </Panel>

        {/* Node 2: Active Medical Conditions */}
        <Panel className="p-5 space-y-3">
          <div className="flex items-center gap-2 text-ink-500 border-b border-line pb-2.5">
            <Activity className="w-4 h-4" strokeWidth={2} />
            <h3 className="text-sm font-semibold text-ink-900">Active chronic conditions <span className="readout text-ink-400">({conditions.length})</span></h3>
          </div>
          {conditions.length > 0 ? (
            <div className="space-y-2">
              {conditions.map((c, idx) => (
                <div key={idx} className="bg-surface-sunken p-2.5 rounded-control border border-line text-xs space-y-1">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="font-semibold text-ink-900">{c.condition}</span>
                    <StatusPill variant={CONDITION_STATUS_VARIANT[c.status] || 'neutral'} className="py-0.5 px-2">{c.status}</StatusPill>
                  </div>
                  <span className="text-[11px] text-ink-500 readout block">Diagnosed {c.diagnosis_date}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-ink-400">No chronic conditions recorded.</p>
          )}
        </Panel>

        {/* Node 3: Prescribed Medications */}
        <Panel className="p-5 space-y-3">
          <div className="flex items-center gap-2 text-ink-500 border-b border-line pb-2.5">
            <Pill className="w-4 h-4" strokeWidth={2} />
            <h3 className="text-sm font-semibold text-ink-900">Active prescribed medications <span className="readout text-ink-400">({meds.length})</span></h3>
          </div>
          {meds.length > 0 ? (
            <div className="space-y-2">
              {meds.map((m, idx) => (
                <div key={idx} className="bg-surface-sunken p-2.5 rounded-control border border-line text-xs">
                  <span className="font-semibold text-ink-900 block">
                    {m.name} <span className="readout font-normal text-ink-500">({m.dosage})</span>
                  </span>
                  <span className="text-[11px] text-ink-500">{m.frequency}, prescribed by {m.prescribed_by || 'doctor'}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-ink-400">No active medications recorded.</p>
          )}
        </Panel>

        {/* Node 4: Latest Vitals Baseline */}
        <Panel className="p-5 space-y-3">
          <div className="flex items-center gap-2 text-ink-500 border-b border-line pb-2.5">
            <HeartPulse className="w-4 h-4" strokeWidth={2} />
            <h3 className="text-sm font-semibold text-ink-900">Recent vitals baseline</h3>
          </div>
          {vitals.length > 0 ? (
            <div className="space-y-1.5 text-xs text-ink-600">
              <p><span className="text-ink-500">Blood pressure</span> <span className="readout font-medium text-ink-800">{vitals[0].bp}</span> mmHg</p>
              <p><span className="text-ink-500">Heart rate</span> <span className="readout font-medium text-ink-800">{vitals[0].heart_rate}</span> bpm</p>
              <p><span className="text-ink-500">SpO2</span> <span className="readout font-medium text-ink-800">{vitals[0].spo2}</span>%</p>
              <p><span className="text-ink-500">Blood glucose</span> <span className="readout font-medium text-ink-800">{vitals[0].glucose}</span> mg/dL</p>
            </div>
          ) : (
            <p className="text-xs text-ink-400">No vitals logged yet.</p>
          )}
        </Panel>

        {/* Node 5: Lab Parameters */}
        <Panel className="p-5 space-y-3">
          <div className="flex items-center gap-2 text-ink-500 border-b border-line pb-2.5">
            <FileText className="w-4 h-4" strokeWidth={2} />
            <h3 className="text-sm font-semibold text-ink-900">Structured lab parameters <span className="readout text-ink-400">({labs.length})</span></h3>
          </div>
          {labs.length > 0 ? (
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {labs.map((l, idx) => (
                <div key={idx} className="flex items-center justify-between gap-2 text-xs border-b border-line pb-1.5">
                  <span className="font-medium text-ink-800 truncate">{l.test_name}</span>
                  <span className="flex items-center gap-1.5 shrink-0">
                    <span className="readout font-semibold text-ink-800">{l.value} {l.unit}</span>
                    <StatusPill variant={LAB_STATUS_VARIANT[l.status] || 'good'} icon={false} className="py-0 px-1.5">{l.status}</StatusPill>
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-ink-400">No lab parameters recorded.</p>
          )}
        </Panel>

        {/* Node 6: Allergies & Family History */}
        <Panel className="p-5 space-y-3">
          <div className="flex items-center gap-2 text-ink-500 border-b border-line pb-2.5">
            <AlertTriangle className="w-4 h-4" strokeWidth={2} />
            <h3 className="text-sm font-semibold text-ink-900">Allergies & family history</h3>
          </div>
          <div className="space-y-3 text-xs">
            <div>
              <span className="font-semibold text-ink-700 block mb-1.5">Allergies</span>
              {allergies.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {allergies.map((a, idx) => (
                    <StatusPill key={idx} variant="watch" icon={false}>{a.allergen} ({a.reaction})</StatusPill>
                  ))}
                </div>
              ) : (
                <span className="text-ink-400">No known drug allergies recorded.</span>
              )}
            </div>
            <div>
              <span className="font-semibold text-ink-700 block mb-1.5">Family history</span>
              {family.length > 0 ? (
                <div className="space-y-1">
                  {family.map((f, idx) => (
                    <p key={idx} className="text-ink-600">{f.relation}: <span className="font-medium text-ink-800">{f.condition}</span></p>
                  ))}
                </div>
              ) : (
                <span className="text-ink-400">No family history recorded.</span>
              )}
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
};
