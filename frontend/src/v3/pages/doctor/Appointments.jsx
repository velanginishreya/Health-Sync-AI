import React, { useMemo, useState } from 'react';
import { CalendarClock, CheckCheck } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { Page } from '../../components/layout/Container';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { Card, PanelTitle, RuleGrid, SectionHeader } from '../../components/ui/Card';
import { Figure } from '../../components/ui/Figure';
import { EmptyState } from '../../components/ui/EmptyState';
import { PageSkeleton } from '../../components/ui/Skeleton';
import { Toast, useToast } from '../../components/ui/Toast';
import { dayDelta } from '../../lib/format';
import { errorText, get, put, useLoad } from '../../lib/api';
import { VisitRow } from '../patient/Appointments';

export const DoctorAppointments = () => {
  const { toast, show, clear } = useToast();
  const [completing, setCompleting] = useState(null);

  const { data, loading, reload } = useLoad(() => get('/api/v1/appointments'), []);
  const appointments = data || [];

  const { todays, upcoming, past } = useMemo(() => {
    const scheduled = appointments.filter((item) => item.status === 'SCHEDULED');
    return {
      todays: scheduled
        .filter((item) => dayDelta(item.appointment_date) === 0)
        .sort((a, b) => String(a.appointment_time).localeCompare(String(b.appointment_time))),
      upcoming: scheduled
        .filter((item) => (dayDelta(item.appointment_date) ?? -1) > 0)
        .sort((a, b) => String(a.appointment_date).localeCompare(String(b.appointment_date))),
      past: appointments
        .filter((item) => item.status !== 'SCHEDULED' || (dayDelta(item.appointment_date) ?? 0) < 0)
        .sort((a, b) => String(b.appointment_date).localeCompare(String(a.appointment_date))),
    };
  }, [appointments]);

  const complete = async (appointment) => {
    setCompleting(appointment.id);
    try {
      await put(`/api/v1/appointments/${appointment.id}?status_val=COMPLETED`);
      await reload({ quiet: true });
      show(`${appointment.patient_name || 'Visit'} marked as completed.`, 'good');
    } catch (err) {
      show(errorText(err, 'Could not update that visit.'), 'critical');
    } finally {
      setCompleting(null);
    }
  };

  return (
    <AppShell role="DOCTOR">
      <Page>
        <PageHeader
          title="Schedule"
          description="Visits booked with you, in date order. Completed visits stay in the record."
        />

        {loading ? (
          <PageSkeleton figures={3} rows={5} />
        ) : (
          <>
            <RuleGrid columns={3}>
              <div className="bg-bone-raised p-4 sm:p-5">
                <Figure label="Today" value={todays.length} hint={todays.length === 1 ? 'visit' : 'visits'} />
              </div>
              <div className="bg-bone-raised p-4 sm:p-5">
                <Figure label="Upcoming" value={upcoming.length} hint="scheduled ahead" />
              </div>
              <div className="bg-bone-raised p-4 sm:p-5">
                <Figure label="Completed" value={past.filter((item) => item.status === 'COMPLETED').length} hint="in the record" />
              </div>
            </RuleGrid>

            <Card pad="lg">
              <PanelTitle icon={CalendarClock} count={todays.length}>Today</PanelTitle>
              {todays.length === 0 ? (
                <EmptyState bare icon={CalendarClock} title="No visits today" body="Anything booked for today appears here, newest first." />
              ) : (
                <ul className="divide-y divide-sand-200">
                  {todays.map((appointment) => (
                    <VisitRow
                      key={appointment.id}
                      appointment={appointment}
                      action={
                        <Button
                          variant="vellum"
                          size="sm"
                          icon={CheckCheck}
                          loading={completing === appointment.id}
                          onClick={() => complete(appointment)}
                        >
                          Mark completed
                        </Button>
                      }
                    />
                  ))}
                </ul>
              )}
            </Card>

            {upcoming.length > 0 && (
              <section>
                <SectionHeader title="Upcoming" count={`${upcoming.length} scheduled`} />
                <Card pad="lg" className="mt-4">
                  <ul className="divide-y divide-sand-200">
                    {upcoming.map((appointment) => (
                      <VisitRow key={appointment.id} appointment={appointment} />
                    ))}
                  </ul>
                </Card>
              </section>
            )}

            {past.length > 0 && (
              <section>
                <SectionHeader title="Earlier visits" count={`${past.length} on file`} />
                <Card pad="lg" className="mt-4">
                  <ul className="divide-y divide-sand-200">
                    {past.slice(0, 12).map((appointment) => (
                      <VisitRow key={appointment.id} appointment={appointment} />
                    ))}
                  </ul>
                  {past.length > 12 && (
                    <p className="mt-4 border-t border-sand-200 pt-4 text-b3 text-sand-600">
                      Showing the 12 most recent of {past.length} earlier visits.
                    </p>
                  )}
                </Card>
              </section>
            )}
          </>
        )}
      </Page>

      <Toast toast={toast} onClose={clear} />
    </AppShell>
  );
};

export default DoctorAppointments;
