import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Stethoscope, Users, Calendar, AlertCircle, Eye, Activity } from 'lucide-react';
import { Panel, PanelHeader, Readout, Button, PageHeader, EmptyState } from '../../components/ui';

export const DoctorDashboard = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/v1/doctor/patients')
      .then(res => setPatients(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="panel h-20" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map(i => <div key={i} className="panel h-20" />)}
        </div>
        <div className="panel h-72" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        label="Clinical workspace"
        title="Doctor Dashboard"
        description="Role-based access to authorized, assigned patient Digital Twins and clinical schedule."
      />

      {/* Doctor summary readouts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Readout icon={Users} tone="accent" label="Assigned patients" value={patients.length} unit="active" />
        <Readout icon={Calendar} tone="ink" label="Today's visits" value={2} unit="scheduled" />
        <Readout icon={AlertCircle} tone="watch" label="Patient alerts" value={2} unit="high BP" />
        <Readout icon={Activity} tone="good" label="Reports reviewed" value={4} unit="labs" />
      </div>

      {/* Assigned patient directory */}
      <Panel className="p-6 space-y-4">
        <PanelHeader label="Roster" title={`Assigned patient roster (${patients.length})`} />

        {patients.length === 0 ? (
          <EmptyState
            icon={Stethoscope}
            title="No patients assigned yet"
            description="Patients assigned to you by an administrator will appear here."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[640px]">
              <thead>
                <tr className="text-ink-500 font-semibold border-b border-line">
                  <th className="p-3">Patient name</th>
                  <th className="p-3">Age / gender</th>
                  <th className="p-3">Blood group</th>
                  <th className="p-3">Active conditions</th>
                  <th className="p-3">Prescriptions</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {patients.map((p) => (
                  <tr key={p.id} className="hover:bg-surface-sunken transition">
                    <td className="p-3 font-semibold text-ink-900">{p.name}</td>
                    <td className="p-3 text-ink-600 readout whitespace-nowrap">{p.age || 45} yrs / {p.gender || 'Male'}</td>
                    <td className="p-3 font-semibold text-accent-700 readout">{p.blood_group || 'O+'}</td>
                    <td className="p-3 text-ink-700">
                      {p.active_conditions?.map(c => c.condition).join(', ') || 'Type 2 Diabetes, Hypertension'}
                    </td>
                    <td className="p-3 text-ink-600 readout whitespace-nowrap">{p.active_medications_count || 2} active drugs</td>
                    <td className="p-3 text-right">
                      <Button as={Link} to={`/doctor/patients/${p.id}`} variant="dark" size="sm" icon={Eye}>
                        Inspect
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
};
