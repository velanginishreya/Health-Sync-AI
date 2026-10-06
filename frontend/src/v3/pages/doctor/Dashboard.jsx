import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarClock, ShieldCheck, Users } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { Page } from '../../components/layout/Container';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { Card, PanelTitle, RuleGrid, SectionHeader } from '../../components/ui/Card';
import { Figure } from '../../components/ui/Figure';
import { Tag } from '../../components/ui/Tag';
import { EmptyState } from '../../components/ui/EmptyState';
import { PageSkeleton } from '../../components/ui/Skeleton';
import { Table, TableWrap, TBody, TD, TH, THead, TR } from '../../components/ui/Table';
import { Caps, Meta, Mono } from '../../components/ui/Text';
import { dayDelta } from '../../lib/format';
import { get, useLoad } from '../../lib/api';
import { VisitRow } from '../patient/Appointments';

export const DoctorDashboard = () => {
  const { data, loading } = useLoad(
    async () => {
      const [patients, appointments] = await Promise.all([
        get('/api/v1/doctor/patients'),
        get('/api/v1/appointments'),
      ]);
      return { patients, appointments };
    },
    []
  );

  const patients = data?.patients || [];
  const appointments = data?.appointments || [];

  const { todays, upcoming } = useMemo(() => {
    const scheduled = appointments.filter((item) => item.status === 'SCHEDULED');
    return {
      todays: scheduled.filter((item) => dayDelta(item.appointment_date) === 0),
      upcoming: scheduled
        .filter((item) => (dayDelta(item.appointment_date) ?? -1) > 0)
        .sort((a, b) => String(a.appointment_date).localeCompare(String(b.appointment_date)))
        .slice(0, 4),
    };
  }, [appointments]);

  const conditionCount = patients.reduce((total, patient) => total + (patient.active_conditions?.length || 0), 0);
  const medicineCount = patients.reduce((total, patient) => total + (patient.active_medications_count || 0), 0);

  return (
    <AppShell role="DOCTOR">
      <Page>
        <PageHeader
          title="Today"
          description="Your assigned patients and the visits ahead. You only ever see patients assigned to you."
          actions={
            <Button to="/v3/doctor/patients" variant="vellum" icon={Users}>
              Full roster
            </Button>
          }
        />

        {loading ? (
          <PageSkeleton figures={4} rows={5} />
        ) : (
          <>
            <RuleGrid columns={4}>
              <div className="bg-bone-raised p-4 sm:p-5">
                <Figure label="Assigned patients" value={patients.length} hint="scoped to you" />
              </div>
              <div className="bg-bone-raised p-4 sm:p-5">
                <Figure label="Visits today" value={todays.length} hint={todays[0]?.appointment_time || 'nothing booked'} />
              </div>
              <div className="bg-bone-raised p-4 sm:p-5">
                <Figure label="Active conditions" value={conditionCount} hint="across your panel" />
              </div>
              <div className="bg-bone-raised p-4 sm:p-5">
                <Figure label="Medicines managed" value={medicineCount} hint="currently active" />
              </div>
            </RuleGrid>

            <Card pad="lg">
              <PanelTitle
                icon={Users}
                count={`${patients.length} assigned`}
                action={
                  <Link to="/v3/doctor/patients" className="text-b3 font-medium text-petrol-700 hover:text-petrol-800">
                    Open full roster
                  </Link>
                }
              >
                Patient roster
              </PanelTitle>

              {patients.length === 0 ? (
                <EmptyState
                  bare
                  icon={Users}
                  title="No patients assigned yet"
                  body="An administrator assigns patients to you. Once assigned, their record appears here."
                />
              ) : (
                <TableWrap>
                  <Table minWidth={760}>
                    <THead>
                      <TR>
                        <TH>Patient</TH>
                        <TH>Age</TH>
                        <TH>Blood group</TH>
                        <TH>Conditions</TH>
                        <TH align="right">Medicines</TH>
                        <TH align="right">Record</TH>
                      </TR>
                    </THead>
                    <TBody>
                      {patients.map((patient) => (
                        <TR key={patient.id}>
                          <TD>
                            <span className="block text-b3 font-semibold text-sand-900">{patient.name}</span>
                            <Mono>{patient.email}</Mono>
                          </TD>
                          <TD>{patient.age ?? 'Not given'}</TD>
                          <TD>{patient.blood_group || 'Not given'}</TD>
                          <TD>
                            <span className="flex flex-wrap gap-1.5">
                              {(patient.active_conditions || []).slice(0, 2).map((condition) => (
                                <Tag key={condition.condition} tone="dusk" case="sentence">
                                  {condition.condition}
                                </Tag>
                              ))}
                              {(patient.active_conditions?.length || 0) > 2 && (
                                <Tag tone="neutral" case="sentence">
                                  +{(patient.active_conditions?.length || 0) - 2}
                                </Tag>
                              )}
                              {(patient.active_conditions?.length || 0) === 0 && (
                                <Meta>None recorded</Meta>
                              )}
                            </span>
                          </TD>
                          <TD align="right">{patient.active_medications_count ?? 0} active</TD>
                          <TD align="right">
                            <Link
                              to={`/v3/doctor/patients/${patient.id}`}
                              className="inline-flex min-h-8 items-center gap-1.5 text-b3 font-semibold text-petrol-700 transition-colors hover:text-petrol-800"
                            >
                              Open
                              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.2} />
                            </Link>
                          </TD>
                        </TR>
                      ))}
                    </TBody>
                  </Table>
                </TableWrap>
              )}
            </Card>

            <div className="grid gap-5 lg:grid-cols-2">
              <Card pad="lg">
                <PanelTitle icon={CalendarClock} count={todays.length}>Today's visits</PanelTitle>
                {todays.length === 0 ? (
                  <EmptyState bare icon={CalendarClock} title="No visits today" body="Booked visits for today appear here with the reason and any note." />
                ) : (
                  <ul className="divide-y divide-sand-200">
                    {todays.map((appointment) => (
                      <VisitRow key={appointment.id} appointment={appointment} />
                    ))}
                  </ul>
                )}
              </Card>

              <Card pad="lg">
                <PanelTitle icon={CalendarClock} count={upcoming.length}>Coming up</PanelTitle>
                {upcoming.length === 0 ? (
                  <EmptyState bare icon={CalendarClock} title="Nothing booked ahead" body="Future visits are listed here in date order." />
                ) : (
                  <ul className="divide-y divide-sand-200">
                    {upcoming.map((appointment) => (
                      <VisitRow key={appointment.id} appointment={appointment} />
                    ))}
                  </ul>
                )}
              </Card>
            </div>

            <section>
              <SectionHeader title="Access and scope" hint="How this view stays limited to the patients in your care." />
              <div className="mt-4 flex items-start gap-3.5 rounded-card3 border border-sand-200 bg-bone-sunken/70 px-5 py-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-tile3 bg-petrol-50 text-petrol-700">
                  <ShieldCheck className="h-4 w-4" strokeWidth={2.1} />
                </span>
                <p className="text-b3 leading-relaxed text-sand-700">
                  Opening a record for a patient who is not assigned to you is refused by the server
                  and written to the audit log, with your user, the patient, and the time.
                  <Caps className="ml-2 inline">Append only</Caps>
                </p>
              </div>
            </section>
          </>
        )}
      </Page>
    </AppShell>
  );
};

export default DoctorDashboard;
