import React, { useMemo, useState } from 'react';
import { CalendarPlus, Clock, Stethoscope } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { Page } from '../../components/layout/Container';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { Card, PanelTitle, RuleGrid, SectionHeader } from '../../components/ui/Card';
import { Figure } from '../../components/ui/Figure';
import { StatusPill } from '../../components/ui/Tag';
import { Input, Label, Select, Textarea } from '../../components/ui/Field';
import { Dialog } from '../../components/ui/Overlay';
import { EmptyState } from '../../components/ui/EmptyState';
import { PageSkeleton } from '../../components/ui/Skeleton';
import { Toast, useToast } from '../../components/ui/Toast';
import { Meta } from '../../components/ui/Text';
import { appointmentStatusLabel } from '../../lib/clinical';
import { dayDelta, fmtDate, isoDay, relativeDay } from '../../lib/format';
import { errorText, get, post, put, useLoad } from '../../lib/api';

const TIMES = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM',
  '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM',
];

/** One row geometry for every visit, on both sides of the record. */
export const VisitRow = ({ appointment, action }) => (
  <li className="grid grid-cols-[76px_minmax(0,1fr)] items-start gap-4 py-4 first:pt-0 last:pb-0 sm:grid-cols-[96px_minmax(0,1fr)_auto]">
    <div className="rounded-ctl3 border border-sand-200 bg-bone px-2.5 py-2 text-center">
      <span className="v3-num block font-mono3 text-m4 uppercase tracking-caps text-sand-600">
        {appointment.appointment_date?.slice(5, 7)}/
        {appointment.appointment_date?.slice(8, 10)}
      </span>
      <span className="mt-0.5 block text-b3 font-semibold text-sand-900">
        {appointment.appointment_time}
      </span>
      <span className="mt-0.5 block text-m4 text-sand-500">{relativeDay(appointment.appointment_date)}</span>
    </div>

    <div className="min-w-0">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-b2 font-semibold text-sand-950">
          {appointment.doctor_name || appointment.patient_name || 'Visit'}
        </p>
        <StatusPill
          value={appointment.status}
          label={appointmentStatusLabel(appointment.status)}
          size="sm"
        />
      </div>
      <p className="mt-1 text-b3 text-sand-700">{appointment.reason || 'General consultation'}</p>
      {appointment.notes && <p className="mt-1 text-b3 italic text-sand-600">{appointment.notes}</p>}
    </div>

    {action && <div className="col-span-2 flex justify-end sm:col-span-1 sm:justify-start">{action}</div>}
  </li>
);

export const Appointments = () => {
  const { toast, show, clear } = useToast();
  const [form, setForm] = useState({ doctor_id: '', appointment_date: '', appointment_time: '10:00 AM', reason: '' });
  const [errors, setErrors] = useState({});
  const [booking, setBooking] = useState(false);
  const [cancelling, setCancelling] = useState(null);
  const [cancelPending, setCancelPending] = useState(false);

  const { data, loading, reload } = useLoad(
    async () => {
      const [appointments, doctors] = await Promise.all([
        get('/api/v1/appointments'),
        get('/api/v1/appointments/doctors'),
      ]);
      return { appointments, doctors };
    },
    []
  );

  const appointments = data?.appointments || [];
  const doctors = data?.doctors || [];

  const { upcoming, earlier } = useMemo(() => {
    const up = appointments
      .filter((item) => item.status === 'SCHEDULED' && (dayDelta(item.appointment_date) ?? -1) >= 0)
      .sort((a, b) => `${a.appointment_date}${a.appointment_time}`.localeCompare(`${b.appointment_date}${b.appointment_time}`));
    const past = appointments
      .filter((item) => !up.includes(item))
      .sort((a, b) => String(b.appointment_date).localeCompare(String(a.appointment_date)));
    return { upcoming: up, earlier: past };
  }, [appointments]);

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const book = async (event) => {
    event.preventDefault();
    const next = {};
    if (!form.doctor_id) next.doctor_id = 'Choose the doctor you want to see.';
    if (!form.appointment_date) next.appointment_date = 'Pick a date for the visit.';
    else if ((dayDelta(form.appointment_date) ?? 0) < 0) next.appointment_date = 'That date is in the past. Pick today or later.';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setBooking(true);
    try {
      await post('/api/v1/appointments', {
        doctor_id: form.doctor_id,
        appointment_date: form.appointment_date,
        appointment_time: form.appointment_time,
        reason: form.reason.trim() || 'General consultation',
      });
      setForm({ doctor_id: '', appointment_date: '', appointment_time: '10:00 AM', reason: '' });
      await reload({ quiet: true });
      show('Visit booked. It now appears in your timeline.', 'good');
    } catch (err) {
      setErrors({ form: errorText(err, 'Could not book that visit.') });
    } finally {
      setBooking(false);
    }
  };

  const cancelVisit = async () => {
    if (!cancelling) return;
    setCancelPending(true);
    try {
      await put(`/api/v1/appointments/${cancelling.id}?status_val=CANCELLED`);
      setCancelling(null);
      await reload({ quiet: true });
      show('Visit cancelled. Your care team sees the change.', 'neutral');
    } catch (err) {
      show(errorText(err, 'Could not cancel that visit.'), 'critical');
    } finally {
      setCancelPending(false);
    }
  };

  return (
    <AppShell role="PATIENT">
      <Page>
        <PageHeader
          title="Visits"
          description="Book a visit with your care team, and keep every appointment in one place."
        />

        {loading ? (
          <PageSkeleton figures={3} rows={4} />
        ) : (
          <>
            <RuleGrid columns={3}>
              <div className="bg-bone-raised p-4 sm:p-5">
                <Figure label="Upcoming" value={upcoming.length} hint={upcoming[0] ? relativeDay(upcoming[0].appointment_date) : 'nothing booked'} />
              </div>
              <div className="bg-bone-raised p-4 sm:p-5">
                <Figure label="Earlier visits" value={earlier.length} hint="kept in the record" />
              </div>
              <div className="bg-bone-raised p-4 sm:p-5">
                <Figure
                  label="Your care team"
                  value={doctors.length}
                  hint={doctors[0]?.name || 'No doctors listed'}
                />
              </div>
            </RuleGrid>

            <Card pad="lg">
              <PanelTitle icon={CalendarPlus}>Book a visit</PanelTitle>
              <form onSubmit={book} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" noValidate>
                <div className="lg:col-span-2">
                  <Label htmlFor="visit-doctor" required>
                    Doctor
                  </Label>
                  <Select id="visit-doctor" value={form.doctor_id} error={errors.doctor_id} onChange={set('doctor_id')}>
                    <option value="">Choose a doctor</option>
                    {doctors.map((doctor) => (
                      <option key={doctor.id} value={doctor.id}>
                        {doctor.name}
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <Label htmlFor="visit-date" required hint="today or later">
                    Date
                  </Label>
                  <Input
                    id="visit-date"
                    type="date"
                    min={isoDay()}
                    value={form.appointment_date}
                    error={errors.appointment_date}
                    onChange={set('appointment_date')}
                  />
                </div>

                <div>
                  <Label htmlFor="visit-time" required>
                    Time
                  </Label>
                  <Select id="visit-time" value={form.appointment_time} onChange={set('appointment_time')}>
                    {TIMES.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="sm:col-span-2 lg:col-span-4">
                  <Label htmlFor="visit-reason" hint="optional">
                    Reason for the visit
                  </Label>
                  <Textarea
                    id="visit-reason"
                    rows={2}
                    placeholder="Follow-up on blood pressure"
                    value={form.reason}
                    onChange={set('reason')}
                  />
                </div>

                {errors.form && (
                  <p role="alert" className="rounded-ctl3 border border-sig-critical-100 bg-sig-critical-50 px-4 py-3 text-b3 text-sig-critical-700 sm:col-span-2 lg:col-span-4">
                    {errors.form}
                  </p>
                )}

                <div className="flex items-center gap-3 sm:col-span-2 lg:col-span-4">
                  <Button type="submit" icon={Stethoscope} loading={booking}>
                    Book visit
                  </Button>
                  <Meta>You will see it in your timeline straight away.</Meta>
                </div>
              </form>
            </Card>

            <section>
              <SectionHeader
                title="Upcoming"
                count={upcoming.length === 1 ? '1 visit' : `${upcoming.length} visits`}
              />
              {upcoming.length === 0 ? (
                <EmptyState
                  bare
                  icon={Clock}
                  title="No visits booked"
                  body="When you book a visit it appears here with the doctor, the time, and what it is for."
                />
              ) : (
                <Card pad="lg" className="mt-4">
                  <ul className="divide-y divide-sand-200">
                    {upcoming.map((appointment) => (
                      <VisitRow
                        key={appointment.id}
                        appointment={appointment}
                        action={
                          <Button variant="quiet" size="sm" onClick={() => setCancelling(appointment)}>
                            Cancel
                          </Button>
                        }
                      />
                    ))}
                  </ul>
                </Card>
              )}
              <p className="mt-4 text-b3 leading-relaxed text-sand-600">
                For symptoms that cannot wait, contact your doctor's clinic or an emergency service
                directly. This page is for planned visits only.
              </p>
            </section>

            {earlier.length > 0 && (
              <section>
                <SectionHeader title="Earlier visits" count={`${earlier.length} on file`} />
                <Card pad="lg" className="mt-4">
                  <ul className="divide-y divide-sand-200">
                    {earlier.map((appointment) => (
                      <VisitRow key={appointment.id} appointment={appointment} />
                    ))}
                  </ul>
                </Card>
              </section>
            )}

            <p className="text-b3 leading-relaxed text-sand-600">
              Visits are with the doctors listed here. Your record shows{' '}
              {appointments.length === 0 ? 'no bookings yet' : `${appointments.length} in total`}.
            </p>
          </>
        )}
      </Page>

      <Dialog
        open={Boolean(cancelling)}
        onClose={() => setCancelling(null)}
        title="Cancel this visit?"
        description={
          cancelling
            ? `${cancelling.doctor_name || 'Your doctor'} on ${fmtDate(cancelling.appointment_date)} at ${cancelling.appointment_time}. ${relativeDay(cancelling.appointment_date)}.`
            : ''
        }
        footer={
          <>
            <Button variant="vellum" onClick={() => setCancelling(null)}>
              Keep the visit
            </Button>
            <Button variant="critical" loading={cancelPending} onClick={cancelVisit}>
              Cancel visit
            </Button>
          </>
        }
      />

      <Toast toast={toast} onClose={clear} />
    </AppShell>
  );
};

export default Appointments;
