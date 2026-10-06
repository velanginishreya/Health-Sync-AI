import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Activity, Plus, Trash2, Stethoscope, ShieldAlert } from 'lucide-react';
import { Panel, PanelHeader, StatusPill, Button, PageHeader, EmptyState } from '../../components/ui';

const CONDITION_STATUS_VARIANT = {
  ACTIVE: 'watch',
  CHRONIC: 'watch',
  RESOLVED: 'good',
};

const ALLERGY_SEVERITY_VARIANT = {
  Severe: 'critical',
  Moderate: 'watch',
  Mild: 'good',
};

const inputClass = 'w-full px-3 py-2 text-xs border border-line rounded-control bg-surface-raised focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition';

export const MedicalHistory = () => {
  const [conditions, setConditions] = useState([]);
  const [allergies, setAllergies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [conditionName, setConditionName] = useState('');
  const [diagnosisDate, setDiagnosisDate] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [description, setDescription] = useState('');

  const [allergen, setAllergen] = useState('');
  const [reaction, setReaction] = useState('');
  const [severity, setSeverity] = useState('Moderate');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [condRes, algRes] = await Promise.all([
        axios.get('/api/v1/patients/me/medical-history'),
        axios.get('/api/v1/patients/me/allergies')
      ]);
      setConditions(condRes.data);
      setAllergies(algRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCondition = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/v1/patients/me/medical-history', {
        condition_name: conditionName,
        diagnosis_date: diagnosisDate,
        status,
        description
      });
      setConditionName('');
      setDiagnosisDate('');
      setDescription('');
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCondition = async (id) => {
    try {
      await axios.delete(`/api/v1/patients/me/medical-history/${id}`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddAllergy = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/v1/patients/me/allergies', {
        allergen, reaction, severity
      });
      setAllergen('');
      setReaction('');
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAllergy = async (id) => {
    try {
      await axios.delete(`/api/v1/patients/me/allergies/${id}`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="panel h-16" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="panel h-80" />
          <div className="panel h-80" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        label="Health record"
        title="Medical History & Allergies"
        description="Manage diagnosed conditions and allergen sensitivities."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conditions Section */}
        <Panel className="p-6 space-y-4">
          <PanelHeader label="Diagnoses" title="Medical conditions" />

          <form onSubmit={handleAddCondition} className="space-y-3 bg-surface-sunken p-4 rounded-card border border-line">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text" required placeholder="Condition name (e.g. Asthma)"
                value={conditionName} onChange={(e) => setConditionName(e.target.value)}
                className={inputClass}
              />
              <input
                type="date" placeholder="Diagnosis date"
                value={diagnosisDate} onChange={(e) => setDiagnosisDate(e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <select
                value={status} onChange={(e) => setStatus(e.target.value)}
                className={`${inputClass} sm:w-40 shrink-0`}
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="RESOLVED">RESOLVED</option>
                <option value="CHRONIC">CHRONIC</option>
              </select>
              <input
                type="text" placeholder="Short description / notes"
                value={description} onChange={(e) => setDescription(e.target.value)}
                className={inputClass}
              />
            </div>
            <Button type="submit" variant="primary" size="sm" icon={Plus}>
              Add condition
            </Button>
          </form>

          {conditions.length === 0 ? (
            <EmptyState
              icon={Stethoscope}
              title="No conditions recorded yet"
              description="Diagnosed conditions you add above will appear here."
            />
          ) : (
            <div className="space-y-2">
              {conditions.map((c) => (
                <div key={c.id} className="p-3 bg-surface-sunken rounded-card border border-line flex items-center justify-between gap-3">
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-xs text-ink-900">{c.condition_name}</span>
                      <StatusPill variant={CONDITION_STATUS_VARIANT[c.status] || 'neutral'}>{c.status}</StatusPill>
                    </div>
                    <span className="text-[11px] text-ink-500 readout block">
                      Diagnosed {c.diagnosis_date || 'N/A'}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteCondition(c.id)}
                    className="text-status-critical-600 hover:text-status-critical-700 p-2 -m-2 rounded-control shrink-0"
                    aria-label="Delete condition"
                  >
                    <Trash2 className="w-4 h-4" strokeWidth={2} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Panel>

        {/* Allergies Section */}
        <Panel className="p-6 space-y-4">
          <PanelHeader label="Sensitivities" title="Allergies registry" />

          <form onSubmit={handleAddAllergy} className="space-y-3 bg-surface-sunken p-4 rounded-card border border-line">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text" required placeholder="Allergen (e.g. Penicillin)"
                value={allergen} onChange={(e) => setAllergen(e.target.value)}
                className={inputClass}
              />
              <input
                type="text" placeholder="Reaction (e.g. Rash)"
                value={reaction} onChange={(e) => setReaction(e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <select
                value={severity} onChange={(e) => setSeverity(e.target.value)}
                className={`${inputClass} sm:w-40 shrink-0`}
              >
                <option value="Mild">Mild</option>
                <option value="Moderate">Moderate</option>
                <option value="Severe">Severe</option>
              </select>
              <Button type="submit" variant="primary" size="sm" icon={Plus} className="shrink-0">
                Add allergy
              </Button>
            </div>
          </form>

          {allergies.length === 0 ? (
            <EmptyState
              icon={ShieldAlert}
              title="No allergies recorded yet"
              description="Allergens and reactions you add above will appear here."
            />
          ) : (
            <div className="space-y-2">
              {allergies.map((a) => (
                <div key={a.id} className="p-3 bg-status-watch-50 rounded-card border border-status-watch-100 flex items-center justify-between gap-3">
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-xs text-status-watch-700">{a.allergen}</span>
                      <StatusPill variant={ALLERGY_SEVERITY_VARIANT[a.severity] || 'watch'}>{a.severity}</StatusPill>
                    </div>
                    <span className="text-[11px] text-status-watch-700 block">
                      Reaction: {a.reaction || 'Unspecified'}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteAllergy(a.id)}
                    className="text-status-critical-600 hover:text-status-critical-700 p-2 -m-2 rounded-control shrink-0"
                    aria-label="Delete allergy"
                  >
                    <Trash2 className="w-4 h-4" strokeWidth={2} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
};
