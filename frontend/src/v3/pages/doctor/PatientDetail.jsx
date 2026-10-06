import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ArrowLeft, Bot, FileText, HeartPulse, Pill, ShieldAlert, Stethoscope } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { Page } from '../../components/layout/Container';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { Card, PanelTitle, RuleGrid, SectionHeader } from '../../components/ui/Card';
import { Figure } from '../../components/ui/Figure';
import { StatusPill, Tag } from '../../components/ui/Tag';
import { Tabs, TabPanel } from '../../components/ui/Tabs';
import { Label, Textarea } from '../../components/ui/Field';
import { EmptyState } from '../../components/ui/EmptyState';
import { PageSkeleton } from '../../components/ui/Skeleton';
import { Toast, useToast } from '../../components/ui/Toast';
import { Table, TableWrap, TBody, TD, TH, THead, TR } from '../../components/ui/Table';
import { Caps, Meta } from '../../components/ui/Text';
import { Prose } from '../../components/ui/Prose';
import { clinicalTone, labStatusLabel } from '../../lib/clinical';
import { fmtDate, fmtDateTime, fmtNumber, humanize } from '../../lib/format';
import { errorText, get, post, useLoad } from '../../lib/api';

export const DoctorPatientDetail = () => {
  const { id } = useParams();
  const { toast, show, clear } = useToast();
  const [tab, setTab] = useState('overview');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const { data, loading, error, reload } = useLoad(
    async () => {
      const [record, summary] = await Promise.all([
        get(`/api/v1/doctor/patients/${id}`),
        get(`/api/v1/doctor/patients/${id}/summary`),
      ]);
      return { record, summary };
    },
    [id]
  );

  const record = data?.record;
  const summary = data?.summary;
  const patient = record?.patient;
  const vitals = record?.recent_vitals || [];
  const medicines = record?.active_medications || [];
  const conditions = record?.medical_history || [];
  const allergies = record?.allergies || [];
  const labs = record?.lab_results || [];

  const notes = useMemo(
    () => (record?.recent_events || []).filter((event) => event.type === 'DOCTOR_NOTE'),
    [record]
  );

  const saveNote = async (event) => {
    event.preventDefault();
    if (!note.trim()) return;
    setSaving(true);
    try {
      await post(`/api/v1/doctor/patients/${id}/notes?note=${encodeURIComponent(note.trim())}`);
      setNote('');
      await reload({ quiet: true });
      show('Clinical note added to the record.', 'good');
    } catch (err) {
      show(errorText(err, 'Could not save that note.'), 'critical');
    } finally {
      setSaving(false);
    }
  };

  if (error) {
    const status = error?.response?.status;
    return (
      <AppShell role="DOCTOR">
        <Page width="reading">
          <EmptyState
            icon={ShieldAlert}
            title={status === 403 ? 'Access not authorized' : 'Record unavailable'}
            body={
              status === 403
                ? 'This patient is not assigned to your care. The refusal is recorded in the audit log.'
                : errorText(error, 'The record could not be loaded right now.')
            }
            action={
              <Button to="/v3/doctor/patients" variant="vellum" icon={ArrowLeft}>
                Back to patients
              </Button>
            }
          />
        </Page>
      </AppShell>
    );
  }

  return (
    <AppShell role="DOCTOR">
      <Page>
        {loading ? (
          <PageSkeleton figures={4} rows={5} />
        ) : (
          <>
            <PageHeader
              back={{ to: '/v3/doctor/patients', label: 'All patients' }}
              title={patient?.name || 'Patient record'}
              description={
                patient
                  ? `Age ${patient.age ?? 'not given'} · ${patient.gender || 'gender not given'} · Blood group ${patient.blood_group || 'not given'}`
                  : undefined
              }
              meta={
                <>
                  <Tag tone="dusk" case="sentence" icon={Stethoscope}>
                    {conditions.length} {conditions.length === 1 ? 'condition' : 'conditions'}
                  </Tag>
                  <Tag tone="petrol" case="sentence" icon={Pill}>
                    {medicines.length} active {medicines.length === 1 ? 'medicine' : 'medicines'}
                  </Tag>
                </>
              }
            />

            <Tabs
              idPrefix="record"
              label="Patient record sections"
              value={tab}
              onChange={setTab}
              tabs={[
                { value: 'overview', label: 'Overview' },
                { value: 'vitals', label: 'Vitals', count: vitals.length },
                { value: 'medicines', label: 'Medicines', count: medicines.length },
                { value: 'notes', label: 'Notes', count: notes.length },
              ]}
            />

            <TabPanel idPrefix="record" value="overview" active={tab} className="space-y-5">
              {summary?.summary && (
                <Card pad="lg" className="border-petrol-200">
                  <PanelTitle
                    icon={Bot}
                    action={<Caps className="text-petrol-800">Verify against source records</Caps>}
                  >
                    AI clinical summary
                  </PanelTitle>
                  <Prose text={summary.summary} />
                  {!/verify against source records/i.test(summary.summary) && (
                    <p className="mt-4 border-t border-sand-200 pt-4 text-b4 leading-relaxed text-sand-600">
                      {summary.disclaimer}
                    </p>
                  )}
                </Card>
              )}

              {vitals[0] && (
                <RuleGrid columns={4}>
                  <div className="bg-bone-raised p-4 sm:p-5">
                    <Figure label="Latest BP" value={vitals[0].bp || 'Not taken'} unit={vitals[0].bp ? 'mmHg' : undefined} />
                  </div>
                  <div className="bg-bone-raised p-4 sm:p-5">
                    <Figure
                      label="Heart rate"
                      value={vitals[0].heart_rate ? fmtNumber(vitals[0].heart_rate) : 'Not taken'}
                      unit={vitals[0].heart_rate ? 'bpm' : undefined}
                    />
                  </div>
                  <div className="bg-bone-raised p-4 sm:p-5">
                    <Figure
                      label="Oxygen"
                      value={vitals[0].spo2 ? fmtNumber(vitals[0].spo2) : 'Not taken'}
                      unit={vitals[0].spo2 ? '%' : undefined}
                    />
                  </div>
                  <div className="bg-bone-raised p-4 sm:p-5">
                    <Figure
                      label="Glucose"
                      value={vitals[0].glucose ? fmtNumber(vitals[0].glucose) : 'Not taken'}
                      unit={vitals[0].glucose ? 'mg/dL' : undefined}
                    />
                  </div>
                </RuleGrid>
              )}

              <div className="grid gap-5 lg:grid-cols-2">
                <Card pad="lg">
                  <PanelTitle icon={Stethoscope} count={conditions.length}>Conditions</PanelTitle>
                  {conditions.length === 0 ? (
                    <EmptyState bare icon={Stethoscope} title="Nothing recorded" body="No conditions on file for this patient." />
                  ) : (
                    <ul className="divide-y divide-sand-200">
                      {conditions.map((condition) => (
                        <li key={condition.condition} className="flex items-start justify-between gap-3 py-3 first:pt-0">
                          <div className="min-w-0">
                            <p className="text-b2 font-semibold text-sand-950">{condition.condition}</p>
                            <p className="mt-0.5 text-b3 text-sand-600">
                              {condition.diagnosis_date ? `Diagnosed ${fmtDate(condition.diagnosis_date)}` : 'Date not recorded'}
                            </p>
                            {condition.description && (
                              <p className="mt-1 text-b3 leading-relaxed text-sand-600">{condition.description}</p>
                            )}
                          </div>
                          <StatusPill value={condition.status} label={humanize(condition.status)} size="sm" />
                        </li>
                      ))}
                    </ul>
                  )}
                </Card>

                <Card pad="lg">
                  <PanelTitle count={allergies.length}>Allergies</PanelTitle>
                  {allergies.length === 0 ? (
                    <EmptyState bare icon={ShieldAlert} title="None recorded" body="No allergies on file for this patient." />
                  ) : (
                    <ul className="space-y-3">
                      {allergies.map((allergy) => (
                        <li key={allergy.allergen} className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-b2 font-semibold text-sand-950">{allergy.allergen}</p>
                            <p className="mt-0.5 text-b3 text-sand-600">{allergy.reaction || 'Reaction not recorded'}</p>
                          </div>
                          <StatusPill
                            value={allergy.severity}
                            domain="allergy"
                            label={clinicalTone(allergy.severity, 'allergy') === 'critical' ? 'Severe' : clinicalTone(allergy.severity, 'allergy') === 'watch' ? 'Moderate' : 'Mild'}
                            size="sm"
                          />
                        </li>
                      ))}
                    </ul>
                  )}
                </Card>
              </div>

              <Card pad="lg">
                <PanelTitle icon={FileText} count={labs.length}>Lab values</PanelTitle>
                {labs.length === 0 ? (
                  <EmptyState bare icon={FileText} title="No lab values" body="Values extracted from uploaded reports appear here." />
                ) : (
                  <TableWrap>
                    <Table minWidth={640}>
                      <THead>
                        <TR>
                          <TH>Test</TH>
                          <TH>Report</TH>
                          <TH align="right">Value</TH>
                          <TH>Reference</TH>
                          <TH align="right">Status</TH>
                        </TR>
                      </THead>
                      <TBody>
                        {labs.map((lab, index) => (
                          <TR key={`${lab.test_name}-${index}`}>
                            <TD>
                              <span className="text-b3 font-medium text-sand-900">{lab.test_name}</span>
                            </TD>
                            <TD>
                              <span className="text-b3 text-sand-600">{lab.report_type}</span>
                              <span className="mt-0.5 block text-m4 text-sand-500">{fmtDate(lab.report_date)}</span>
                            </TD>
                            <TD align="right">
                              <span className="font-mono3 text-m3 text-sand-950">{fmtNumber(lab.value)}</span>
                              <span className="ml-1 text-m4 text-sand-500">{lab.unit}</span>
                            </TD>
                            <TD>
                              <span className="font-mono3 text-m4 text-sand-600">{lab.reference_range || 'Not given'}</span>
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
            </TabPanel>

            <TabPanel idPrefix="record" value="vitals" active={tab}>
              <Card pad="lg">
                <PanelTitle icon={HeartPulse} count={`${vitals.length} recent`}>Recorded vitals</PanelTitle>
                {vitals.length === 0 ? (
                  <EmptyState bare icon={HeartPulse} title="No readings" body="Readings this patient logs appear here, newest first." />
                ) : (
                  <TableWrap>
                    <Table minWidth={720}>
                      <THead>
                        <TR>
                          <TH>Recorded</TH>
                          <TH align="right">BP</TH>
                          <TH align="right">Heart rate</TH>
                          <TH align="right">Oxygen</TH>
                          <TH align="right">Glucose</TH>
                          <TH align="right">Temperature</TH>
                          <TH align="right">Weight</TH>
                        </TR>
                      </THead>
                      <TBody>
                        {vitals.map((vital, index) => (
                          <TR key={`${vital.recorded_at}-${index}`}>
                            <TD>
                              <span className="font-mono3 text-m3 text-sand-800">{fmtDateTime(vital.recorded_at)}</span>
                            </TD>
                            <TD align="right">{vital.bp || 'Not taken'}</TD>
                            <TD align="right">{vital.heart_rate ? fmtNumber(vital.heart_rate) : 'Not taken'}</TD>
                            <TD align="right">{vital.spo2 ? `${fmtNumber(vital.spo2)}%` : 'Not taken'}</TD>
                            <TD align="right">{vital.glucose ? fmtNumber(vital.glucose) : 'Not taken'}</TD>
                            <TD align="right">{vital.temperature ? fmtNumber(vital.temperature) : 'Not taken'}</TD>
                            <TD align="right">{vital.weight ? `${fmtNumber(vital.weight)} kg` : 'Not taken'}</TD>
                          </TR>
                        ))}
                      </TBody>
                    </Table>
                  </TableWrap>
                )}
                <p className="mt-4 border-t border-sand-200 pt-4 text-b3 text-sand-600">
                  Trend charts live on the patient's side of the record.
                </p>
              </Card>
            </TabPanel>

            <TabPanel idPrefix="record" value="medicines" active={tab}>
              <Card pad="lg">
                <PanelTitle icon={Pill} count={`${medicines.length} active`}>Active medicines</PanelTitle>
                {medicines.length === 0 ? (
                  <EmptyState bare icon={Pill} title="No active medicines" body="Medicines this patient records appear here with dose and prescriber." />
                ) : (
                  <ul className="divide-y divide-sand-200">
                    {medicines.map((medicine, index) => (
                      <li key={`${medicine.name}-${index}`} className="py-4 first:pt-0 last:pb-0">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <h3 className="text-d5 text-sand-950">{medicine.name}</h3>
                          <Tag tone="neutral" case="sentence">
                            {medicine.route}
                          </Tag>
                        </div>
                        <p className="mt-1.5 text-b2 text-sand-700">
                          {medicine.dosage}
                          <span aria-hidden className="mx-1.5 text-sand-400">·</span>
                          {medicine.frequency}
                        </p>
                        {medicine.prescribed_by && (
                          <p className="mt-1 text-b3 text-sand-500">Prescribed by {medicine.prescribed_by}</p>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </TabPanel>

            <TabPanel idPrefix="record" value="notes" active={tab} className="space-y-5">
              <Card pad="lg">
                <PanelTitle icon={Stethoscope}>Add a clinical note</PanelTitle>
                <form onSubmit={saveNote} className="space-y-4">
                  <div>
                    <Label htmlFor="clinical-note" hint="the patient sees this in their timeline">
                      Note
                    </Label>
                    <Textarea
                      id="clinical-note"
                      rows={4}
                      placeholder="Observations, recommended tests, or medication notes."
                      value={note}
                      onChange={(event) => setNote(event.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <Button type="submit" loading={saving} disabled={!note.trim()}>
                      Save note
                    </Button>
                    <Meta>Notes are appended to the record. Earlier ones are never edited.</Meta>
                  </div>
                </form>
              </Card>

              <section>
                <SectionHeader title="Clinical notes on file" count={notes.length} />
                {notes.length === 0 ? (
                  <EmptyState
                    bare
                    icon={Stethoscope}
                    title="No notes yet"
                    body="What you write here is added to the patient's record and timeline."
                  />
                ) : (
                  <ul className="mt-4 space-y-3">
                    {notes.map((item) => (
                      <li key={item.date + item.title}>
                        <Card pad="md">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="text-b2 font-semibold text-sand-950">{item.title}</p>
                            <Meta>{item.date}</Meta>
                          </div>
                          <div className="mt-2">
                            <Tag tone="sand" case="sentence">
                              Clinical note
                            </Tag>
                          </div>
                        </Card>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </TabPanel>
          </>
        )}
      </Page>

      <Toast toast={toast} onClose={clear} />
    </AppShell>
  );
};

export default DoctorPatientDetail;
