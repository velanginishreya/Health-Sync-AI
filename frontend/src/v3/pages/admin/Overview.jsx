import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Download, ShieldCheck, Users } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { Page } from '../../components/layout/Container';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { Card, PanelTitle, RuleGrid, SectionHeader } from '../../components/ui/Card';
import { Figure } from '../../components/ui/Figure';
import { StatusPill } from '../../components/ui/Tag';
import { EmptyState } from '../../components/ui/EmptyState';
import { PageSkeleton } from '../../components/ui/Skeleton';
import { Toast, useToast } from '../../components/ui/Toast';
import { Caps, Meta, Mono } from '../../components/ui/Text';
import { fmtDateTime, humanize } from '../../lib/format';
import { errorText, get, useLoad } from '../../lib/api';

const actionTone = (action) => {
  const key = String(action || '').toUpperCase();
  if (key.includes('ACCESS') || key.includes('DELETE')) return 'critical';
  if (key.includes('LOGIN') || key.includes('LOGOUT')) return 'info';
  if (key.includes('AI') || key.includes('EXPORT')) return 'watch';
  if (key.includes('UPLOAD') || key.includes('REGISTER')) return 'good';
  return 'neutral';
};

export const AdminOverview = () => {
  const { toast, show, clear } = useToast();
  const [exporting, setExporting] = useState(false);

  const { data, loading } = useLoad(
    async () => {
      const [stats, logs] = await Promise.all([
        get('/api/v1/admin/stats'),
        get('/api/v1/admin/audit-logs'),
      ]);
      return { stats, logs };
    },
    []
  );

  const stats = data?.stats || {};
  const logs = data?.logs || [];

  const exportDataset = async () => {
    setExporting(true);
    try {
      const dataset = await get('/api/v1/admin/export-anonymized');
      const blob = new Blob([JSON.stringify(dataset, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'hipaa_deidentified_research_dataset.json';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      show('De-identified dataset downloaded.', 'good');
    } catch (err) {
      show(errorText(err, 'Could not build the export right now.'), 'critical');
    } finally {
      setExporting(false);
    }
  };

  return (
    <AppShell role="ADMIN">
      <Page>
        <PageHeader
          title="Overview"
          description="System-level numbers, the security trail, and the de-identified research export."
          actions={
            <Button icon={Download} loading={exporting} onClick={exportDataset}>
              Export research dataset
            </Button>
          }
        />

        {loading ? (
          <PageSkeleton figures={6} columns={6} rows={5} />
        ) : (
          <>
            <RuleGrid columns={6}>
              <div className="bg-bone-raised p-4 sm:p-5">
                <Figure label="Total users" value={stats.total_users ?? 0} size="sm" />
              </div>
              <div className="bg-bone-raised p-4 sm:p-5">
                <Figure label="Patients" value={stats.patients_count ?? 0} size="sm" />
              </div>
              <div className="bg-bone-raised p-4 sm:p-5">
                <Figure label="Doctors" value={stats.doctors_count ?? 0} size="sm" />
              </div>
              <div className="bg-bone-raised p-4 sm:p-5">
                <Figure label="Reports processed" value={stats.reports_processed ?? 0} size="sm" />
              </div>
              <div className="bg-bone-raised p-4 sm:p-5">
                <Figure label="AI conversations" value={stats.ai_conversations ?? 0} size="sm" />
              </div>
              <div className="bg-bone-raised p-4 sm:p-5">
                <Figure label="Appointments" value={stats.appointments_count ?? 0} size="sm" />
              </div>
            </RuleGrid>

            <div className="flex items-start gap-3.5 rounded-card3 border border-petrol-200 bg-petrol-50/70 px-5 py-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-tile3 bg-white text-petrol-700">
                <ShieldCheck className="h-4 w-4" strokeWidth={2.1} />
              </span>
              <p className="text-b3 leading-relaxed text-petrol-900">
                <span className="font-semibold">How the export stays honest. </span>
                Research exports strip direct identifiers before they leave the system, following
                HIPAA Safe Harbor guidance: names, dates and contact details are replaced, and
                subjects are re-keyed.
              </p>
            </div>

            <Card pad="lg">
              <PanelTitle
                count={`${logs.length} entries`}
                action={
                  <Link to="/v3/admin/audit-logs" className="text-b3 font-medium text-petrol-700 hover:text-petrol-800">
                    Full audit log
                  </Link>
                }
              >
                Recent activity
              </PanelTitle>
              {logs.length === 0 ? (
                <EmptyState bare icon={ShieldCheck} title="No activity recorded yet" body="Sign-ins, record access, AI requests and exports are written here as they happen." />
              ) : (
                <ul className="divide-y divide-sand-200">
                  {logs.slice(0, 6).map((log) => (
                    <li key={log.id} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-3 first:pt-0 last:pb-0">
                      <div className="flex min-w-0 items-center gap-3">
                        <StatusPill
                          value={log.action}
                          tone={actionTone(log.action)}
                          label={humanize(log.action)}
                          size="sm"
                        />
                        <Meta className="truncate">{log.resource_type || 'System'}</Meta>
                      </div>
                      <Mono>{fmtDateTime(log.timestamp)}</Mono>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <section>
              <SectionHeader title="Jump to" hint="The two places this overview points into." />
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Link
                  to="/v3/admin/users"
                  className="group rounded-card3 border border-sand-200 bg-bone-raised p-5 shadow-v3card transition-shadow hover:shadow-v3lift"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-ctl3 bg-petrol-50 text-petrol-700">
                      <Users className="h-4 w-4" strokeWidth={2} />
                    </span>
                    <ArrowRight className="h-4 w-4 text-sand-400 transition-transform duration-150 group-hover:translate-x-0.5" strokeWidth={2.2} />
                  </div>
                  <p className="mt-4 text-d5 text-sand-950">User directory</p>
                  <Meta>Roles, accounts, and care-team assignments.</Meta>
                </Link>
                <Link
                  to="/v3/admin/audit-logs"
                  className="group rounded-card3 border border-sand-200 bg-bone-raised p-5 shadow-v3card transition-shadow hover:shadow-v3lift"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-ctl3 bg-petrol-50 text-petrol-700">
                      <ShieldCheck className="h-4 w-4" strokeWidth={2} />
                    </span>
                    <ArrowRight className="h-4 w-4 text-sand-400 transition-transform duration-150 group-hover:translate-x-0.5" strokeWidth={2.2} />
                  </div>
                  <p className="mt-4 text-d5 text-sand-950">Audit log</p>
                  <Meta>Every access, append-only and never edited.</Meta>
                </Link>
              </div>
            </section>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              <Caps>Counts as recorded</Caps>
              <Meta>
                AI conversations counted: {stats.ai_conversations ?? 0} · Appointments: {stats.appointments_count ?? 0}
              </Meta>
            </div>
          </>
        )}
      </Page>

      <Toast toast={toast} onClose={clear} />
    </AppShell>
  );
};

export default AdminOverview;
