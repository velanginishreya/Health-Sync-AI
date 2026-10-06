import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Bot,
  FileText,
  HeartPulse,
  Pill,
  Plus,
  Calendar,
  X,
} from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { Page } from '../../components/layout/Container';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button, IconButton } from '../../components/ui/Button';
import { Card, DuskPanel, PanelTitle, RuleGrid, SectionHeader } from '../../components/ui/Card';
import { Figure } from '../../components/ui/Figure';
import { StatusPill, Tag } from '../../components/ui/Tag';
import { RiskBand } from '../../components/ui/RiskBand';
import { Sparkline } from '../../components/ui/Sparkline';
import { Table, TableWrap, TBody, TD, TH, THead, TR } from '../../components/ui/Table';
import { EmptyState } from '../../components/ui/EmptyState';
import { PageSkeleton } from '../../components/ui/Skeleton';
import { Toast, useToast } from '../../components/ui/Toast';
import { Caps, Meta, Mono } from '../../components/ui/Text';
import { clinicalTone, labStatusLabel } from '../../lib/clinical';
import { fmtDateShort, fmtDateTime, fmtNumber, greeting, todayLine, relativeDay, dayDelta } from '../../lib/format';
import { errorText, get, post, useLoad } from '../../lib/api';
import { useAuth } from '../../../contexts/AuthContext';

const plainInsight = (insight) => {
  const type = String(insight.insight_type || '');
  if (type === 'BP_ELEVATED_TREND') {
    return {
      title: 'Blood pressure has been above target',
      body: 'Several recent readings are above 135 over 85. That is worth showing your doctor.',
    };
  }
  if (type === 'LAB_ABNORMALITY') {
    return {
      title: 'A lab value sits outside its range',
      body: 'One of your recent results is outside its reference range. Open the report to see which.',
    };
  }
  if (type === 'DL_NEURAL_NETWORK_RISK') {
    return {
      title: 'Your recent readings trend together',
      body: 'The trend classifier flagged a moderate pattern across your last readings.',
    };
  }
  return { title: insight.title, body: insight.description };
};

export const PatientDashboard = () => {
  const { user } = useAuth();
  const { toast, show, clear } = useToast();
  const [adding, setAdding] = useState(false);

  const { data, loading, reload } = useLoad(
    async () => {
      const [twin, insights, appointments, risk] = await Promise.all([
        get('/api/v1/patients/me/digital-twin'),
        get('/api/v1/patients/me/insights'),
        get('/api/v1/appointments'),
        get('/api/v1/patients/me/ascvd-risk'),
      ]);
      return { twin, insights, appointments, risk };
    },
    []
  );

  const twin = data?.twin;
  const patient = twin?.patient;
  const vitals = twin?.recent_vitals?.[0];
  const medicines = twin?.active_medications || [];
  const labs = twin?.lab_results || [];
  const insights = useMemo(() => {
    // The risk service can emit the same finding more than once (one per trigger).
    // Print each finding once; the first is the freshest.
    const seen = new Set();
    return (data?.insights || []).filter((insight) => {
      const key = plainInsight(insight).title;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [data]);
  const risk = data?.risk;

  const upcoming = useMemo(() => {
    const list = data?.appointments || [];
    return (
      list
        .filter((item) => item.status === 'SCHEDULED' && (dayDelta(item.appointment_date) ?? -1) >= 0)
        .sort((a, b) => `${a.appointment_date}${a.appointment_time}`.localeCompare(`${b.appointment_date}${b.appointment_time}`))[0] || null
    );
  }, [data]);

  const trend = useMemo(
    () => (twin?.recent_vitals || []).map((item) => item.heart_rate).filter(Boolean),
    [twin]
  );

  const overall = useMemo(() => {
    const worst = insights.reduce(
      (acc, item) => {
        const tone = clinicalTone(item.severity, 'insight');
        if (tone === 'critical') return 'critical';
        if (tone === 'watch' && acc !== 'critical') return 'watch';
        return acc;
      },
      risk?.risk_category === 'HIGH' ? 'watch' : 'good'
    );
    if (worst === 'critical') return { tone: 'critical', label: 'Needs attention', pill: 'critical' };
    if (worst === 'watch') return { tone: 'watch', label: 'Worth a look', pill: 'watch' };
    return { tone: 'good', label: 'Steady', pill: 'good' };
  }, [insights, risk]);

  const addSample = async () => {
    setAdding(true);
    try {
      await post('/api/v1/patients/me/vitals/simulate-stream');
      await reload({ quiet: true });
      show('A new sample reading was added to your record.', 'good');
    } catch (err) {
      show(errorText(err, 'Could not add a reading right now.'), 'critical');
    } finally {
      setAdding(false);
    }
  };

  const dismissInsight = async (insight) => {
    try {
      await post(`/api/v1/patients/me/insights/${insight.id}/dismiss`);
      await reload({ quiet: true });
      show('Dismissed. It stays in your record.', 'neutral');
    } catch (err) {
      show(errorText(err, 'Could not dismiss that note.'), 'critical');
    }
  };

  return (
    <AppShell role="PATIENT">
      <Page>
        <PageHeader
          title={`${greeting()}, ${patient?.name?.split(' ')[0] || user?.name?.split(' ')[0] || 'there'}.`}
          description="Here is where your record stands today. Anything that changed is called out below."
          meta={
            <>
              <StatusPill tone={overall.pill} label={overall.label} />
              <Meta>{todayLine()}</Meta>
            </>
          }
          actions={
            <>
              <Button to="/v3/patient/ai-assistant" variant="vellum" icon={Bot}>
                Ask Sync AI
              </Button>
              <Button icon={Plus} loading={adding} onClick={addSample}>
                Add a sample reading
              </Button>
            </>
          }
        />

        {loading ? (
          <PageSkeleton figures={4} rows={4} />
        ) : (
          <>
            <RuleGrid columns={4}>
              <div className="bg-bone-raised p-4 sm:p-5">
                <Figure
                  label="Blood pressure"
                  value={vitals?.bp || 'No reading'}
                  unit={vitals?.bp ? 'mmHg' : undefined}
                  hint={vitals?.recorded_at ? fmtDateTime(vitals.recorded_at) : undefined}
                />
              </div>
              <div className="bg-bone-raised p-4 sm:p-5">
                <Figure
                  label="Heart rate"
                  value={vitals?.heart_rate ? fmtNumber(vitals.heart_rate) : 'No reading'}
                  unit={vitals?.heart_rate ? 'bpm' : undefined}
                  hint={trend.length > 1 ? undefined : 'Add a reading'}
                  tag={trend.length > 1 ? <Sparkline data={trend} width={72} height={24} /> : undefined}
                />
              </div>
              <div className="bg-bone-raised p-4 sm:p-5">
                <Figure
                  label="Medicines"
                  value={medicines.length}
                  unit={medicines.length === 1 ? 'active' : 'active'}
                  hint={medicines[0]?.name || 'None recorded'}
                />
              </div>
              <div className="bg-bone-raised p-4 sm:p-5">
                <Figure
                  label="Next visit"
                  value={upcoming ? upcoming.appointment_time : 'None'}
                  unit={upcoming ? fmtDateShort(upcoming.appointment_date) : undefined}
                  hint={upcoming ? relativeDay(upcoming.appointment_date) : 'Book one from Visits'}
                />
              </div>
            </RuleGrid>

            {risk && (
              <DuskPanel pad="lg">
                <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,460px)] lg:gap-14">
                  <div>
                    <Caps tone="dusk">Heart risk, next ten years</Caps>
                    <h2 className="mt-2 text-d3 text-dusk-text">
                      {fmtNumber(risk.ascvd_10yr_risk_percent)}% ten-year risk
                    </h2>
                    <p className="mt-3 max-w-md text-b2 leading-relaxed text-dusk-soft">
                      {risk.interpretation}
                    </p>
                    <p className="mt-4 font-mono3 text-m4 text-dusk-dim">{risk.clinical_guideline}</p>
                  </div>
                  <div>
                    <RiskBand value={risk.ascvd_10yr_risk_percent} tone="dusk" />
                  </div>
                </div>
              </DuskPanel>
            )}

            <section>
              <SectionHeader
                title="Worth knowing"
                hint="Notes the record raised on its own. Dismissing one keeps it in your history."
                count={insights.length ? `${insights.length} open` : undefined}
              />
              <div className="mt-4 space-y-3">
                {insights.length === 0 ? (
                  <EmptyState
                    bare
                    icon={HeartPulse}
                    title="Nothing needs your attention"
                    body="When a reading or a lab value trends the wrong way, it appears here with the reasoning."
                  />
                ) : (
                  insights.map((insight) => {
                    const plain = plainInsight(insight);
                    const tone = clinicalTone(insight.severity, 'insight');
                    return (
                      <Card key={insight.id} pad="md" className="flex items-start gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <StatusPill value={insight.severity} domain="insight" label={tone === 'critical' ? 'High' : tone === 'watch' ? 'Worth a look' : 'Note'} size="sm" />
                            {insight.confidence !== null && insight.confidence !== undefined && (
                              <Mono>{Math.round(insight.confidence * 100)}% confidence</Mono>
                            )}
                          </div>
                          <h3 className="mt-2.5 text-d5 text-sand-950">{plain.title}</h3>
                          <p className="mt-1 text-b2 leading-relaxed text-sand-600">{plain.body}</p>
                          <Link
                            to="/v3/patient/ai-assistant"
                            state={{ ask: `Tell me more about this: ${plain.title}` }}
                            className="mt-3 inline-flex min-h-8 items-center gap-1.5 text-b3 font-medium text-petrol-700 transition-colors hover:text-petrol-800"
                          >
                            Ask about this
                            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.2} />
                          </Link>
                        </div>
                        <IconButton
                          label={`Dismiss note: ${plain.title}`}
                          icon={X}
                          variant="quiet"
                          size="sm"
                          onClick={() => dismissInsight(insight)}
                        />
                      </Card>
                    );
                  })
                )}
              </div>
            </section>

            <div className="grid gap-5 lg:grid-cols-2">
              <Card pad="lg">
                <PanelTitle
                  icon={FileText}
                  count={labs.length}
                  action={
                    <Link to="/v3/patient/reports" className="text-b3 font-medium text-petrol-700 hover:text-petrol-800">
                      All reports
                    </Link>
                  }
                >
                  Recent lab values
                </PanelTitle>
                {labs.length === 0 ? (
                  <EmptyState
                    bare
                    icon={FileText}
                    title="No lab values yet"
                    body="Upload a report and its values are read into your record automatically."
                    action={
                      <Button to="/v3/patient/reports" variant="vellum" size="sm">
                        Upload a report
                      </Button>
                    }
                  />
                ) : (
                  <TableWrap>
                    <Table minWidth={520}>
                      <THead>
                        <TR>
                          <TH>Test</TH>
                          <TH align="right">Value</TH>
                          <TH>Range</TH>
                          <TH align="right">Status</TH>
                        </TR>
                      </THead>
                      <TBody>
                        {labs.slice(0, 5).map((lab, index) => (
                          <TR key={`${lab.test_name}-${index}`}>
                            <TD>
                              <span className="text-b3 font-medium text-sand-900">{lab.test_name}</span>
                              <span className="mt-0.5 block text-m4 text-sand-500">{lab.report_type}</span>
                            </TD>
                            <TD align="right">
                              <span className="font-mono3 text-m3 text-sand-950">{fmtNumber(lab.value)}</span>
                              <span className="ml-1 text-m4 text-sand-500">{lab.unit}</span>
                            </TD>
                            <TD>
                              <Mono>{lab.reference_range || 'Not given'}</Mono>
                            </TD>
                            <TD align="right">
                              <StatusPill value={lab.status} domain="lab" label={labStatusLabel(lab.status)} size="sm" />
                            </TD>
                          </TR>
                        ))}
                      </TBody>
                    </Table>
                  </TableWrap>
                )}
              </Card>

              <Card pad="lg">
                <PanelTitle
                  icon={Pill}
                  count={`${medicines.length} active`}
                  action={
                    <Link to="/v3/patient/medications" className="text-b3 font-medium text-petrol-700 hover:text-petrol-800">
                      All medicines
                    </Link>
                  }
                >
                  Active medicines
                </PanelTitle>
                {medicines.length === 0 ? (
                  <EmptyState
                    bare
                    icon={Pill}
                    title="No medicines recorded"
                    body="Add what you take and every combination is checked automatically."
                  />
                ) : (
                  <ul className="divide-y divide-sand-200">
                    {medicines.map((medicine, index) => (
                      <li key={`${medicine.name}-${index}`} className="flex items-start justify-between gap-4 py-3.5 first:pt-0">
                        <div className="min-w-0">
                          <p className="text-b3 font-semibold text-sand-950">{medicine.name}</p>
                          <p className="mt-0.5 text-b3 text-sand-600">
                            {medicine.dosage} · {medicine.frequency}
                          </p>
                        </div>
                        <Tag tone="neutral" case="sentence">
                          {medicine.route}
                        </Tag>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button to="/v3/patient/reports" variant="vellum" icon={FileText} size="sm">
                Upload a lab report
              </Button>
              <Button to="/v3/patient/timeline" variant="vellum" icon={Calendar} size="sm">
                See your timeline
              </Button>
              <Button to="/v3/patient/appointments" variant="vellum" icon={Calendar} size="sm">
                Book a visit
              </Button>
            </div>
          </>
        )}
      </Page>

      <Toast toast={toast} onClose={clear} />
    </AppShell>
  );
};

export default PatientDashboard;
