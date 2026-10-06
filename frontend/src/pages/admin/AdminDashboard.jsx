import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldCheck, Users, Stethoscope, FileText, Bot, Calendar, UserPlus, Lock, Activity } from 'lucide-react';
import { Panel, PanelHeader, Readout, StatusPill, Button, PageHeader, EmptyState } from '../../components/ui';

/** Presentational-only heuristic: maps an audit action string to a StatusPill severity. */
const auditVariant = (action = '') => {
  const a = action.toUpperCase();
  if (a.includes('DELETE') || a.includes('FAIL') || a.includes('DENIED') || a.includes('VIOLATION')) return 'critical';
  if (a.includes('UPDATE') || a.includes('ASSIGN') || a.includes('EXPORT')) return 'watch';
  if (a.includes('LOGIN') || a.includes('CREATE') || a.includes('VIEW') || a.includes('READ')) return 'good';
  return 'neutral';
};

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedPatient, setSelectedPatient] = useState('');
  const [assignMsg, setAssignMsg] = useState('');
  const [exportingAnonymized, setExportingAnonymized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const [statRes, userRes, logRes] = await Promise.all([
        axios.get('/api/v1/admin/stats'),
        axios.get('/api/v1/admin/users'),
        axios.get('/api/v1/admin/audit-logs')
      ]);
      setStats(statRes.data);
      setUsers(userRes.data);
      setAuditLogs(logRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportAnonymized = async () => {
    try {
      setExportingAnonymized(true);
      const res = await axios.get('/api/v1/admin/export-anonymized');
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hipaa_deidentified_research_dataset.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert("Failed to export dataset: " + err.message);
    } finally {
      setExportingAnonymized(false);
    }
  };

  const handleAssignPatient = async (e) => {
    e.preventDefault();
    if (!selectedDoctor || !selectedPatient) return;
    try {
      await axios.post(`/api/v1/admin/assign-patient?doctor_id=${selectedDoctor}&patient_id=${selectedPatient}`);
      setAssignMsg('Patient successfully assigned to Doctor!');
      setTimeout(() => setAssignMsg(''), 3000);
    } catch (err) {
      setAssignMsg('Assignment failed');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="panel h-20" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[0, 1, 2, 3, 4, 5].map(i => <div key={i} className="panel h-20" />)}
        </div>
        <div className="panel h-40" />
        <div className="panel h-72" />
      </div>
    );
  }

  const doctors = users.filter(u => u.role === 'DOCTOR');
  const patients = users.filter(u => u.role === 'PATIENT');

  return (
    <div className="space-y-6">
      <PageHeader
        label="System administration"
        title="Admin & Security Management"
        description="System stats, patient-doctor assignments, and audit logging."
        actions={
          <Button variant="dark" icon={Lock} onClick={handleExportAnonymized} disabled={exportingAnonymized}>
            {exportingAnonymized ? 'Exporting…' : 'Export HIPAA research dataset'}
          </Button>
        }
      />

      {/* Trust signal: safety is visible, not hidden */}
      <div className="bg-accent-50 border border-accent-100 rounded-card p-3.5 flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-accent-600 shrink-0 mt-0.5" strokeWidth={2} />
        <p className="text-xs text-accent-800 leading-relaxed">
          Research exports are stripped of direct identifiers before leaving the system, per HIPAA Safe Harbor guidance.
        </p>
      </div>

      {/* System stat readouts */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <Readout icon={Users} tone="ink" label="Total users" value={stats?.total_users || 0} />
        <Readout icon={Activity} tone="accent" label="Patients" value={stats?.patients_count || 0} />
        <Readout icon={Stethoscope} tone="good" label="Doctors" value={stats?.doctors_count || 0} />
        <Readout icon={FileText} tone="watch" label="Reports" value={stats?.reports_processed || 0} />
        <Readout icon={Bot} tone="accent" label="AI chats" value={stats?.ai_conversations || 0} />
        <Readout icon={Calendar} tone="ink" label="Visits" value={stats?.appointments_count || 0} />
      </div>

      {/* Doctor-patient assignment tool */}
      <Panel className="p-6 space-y-4">
        <PanelHeader label="Care team" title="Patient-doctor clinical assignment" />

        {assignMsg && (
          <div className="bg-status-good-50 border border-status-good-100 text-status-good-700 text-xs font-semibold px-3 py-2 rounded-control">
            {assignMsg}
          </div>
        )}

        <form onSubmit={handleAssignPatient} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <select
            required
            value={selectedDoctor}
            onChange={(e) => setSelectedDoctor(e.target.value)}
            className="px-3 py-2.5 text-xs border border-line rounded-control bg-surface-raised focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition"
          >
            <option value="">Select doctor</option>
            {doctors.map(d => (
              <option key={d.id} value={d.id}>Dr. {d.first_name} {d.last_name}</option>
            ))}
          </select>

          <select
            required
            value={selectedPatient}
            onChange={(e) => setSelectedPatient(e.target.value)}
            className="px-3 py-2.5 text-xs border border-line rounded-control bg-surface-raised focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition"
          >
            <option value="">Select patient</option>
            {patients.map(p => (
              <option key={p.id} value={p.id}>{p.first_name} {p.last_name} ({p.email})</option>
            ))}
          </select>

          <Button type="submit" variant="primary" icon={UserPlus}>
            Assign care
          </Button>
        </form>
      </Panel>

      {/* Audit log table */}
      <Panel className="p-6 space-y-4">
        <PanelHeader label="Security" title={`Audit logs (${auditLogs.length})`} />

        {auditLogs.length === 0 ? (
          <EmptyState
            icon={Lock}
            title="No audit events yet"
            description="Security and access events will be logged here as they occur."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[640px]">
              <thead>
                <tr className="text-ink-500 font-semibold border-b border-line">
                  <th className="p-3">Action</th>
                  <th className="p-3">Resource type</th>
                  <th className="p-3">User ID</th>
                  <th className="p-3">IP address</th>
                  <th className="p-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-surface-sunken transition">
                    <td className="p-3">
                      <StatusPill variant={auditVariant(log.action)}>{log.action}</StatusPill>
                    </td>
                    <td className="p-3 text-ink-700">{log.resource_type}</td>
                    <td className="p-3 text-ink-500 readout">{log.user_id?.substring(0, 8)}...</td>
                    <td className="p-3 text-ink-500 readout">{log.ip_address || '127.0.0.1'}</td>
                    <td className="p-3 text-ink-400 readout whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
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
