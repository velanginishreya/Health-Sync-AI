import React, { useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Activity, HeartPulse, Plus } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { Page } from '../../components/layout/Container';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { Card, PanelTitle, RuleGrid } from '../../components/ui/Card';
import { Figure } from '../../components/ui/Figure';
import { Input, Label } from '../../components/ui/Field';
import { EmptyState } from '../../components/ui/EmptyState';
import { PageSkeleton } from '../../components/ui/Skeleton';
import { Toast, useToast } from '../../components/ui/Toast';
import { Table, TableWrap, TBody, TD, TH, THead, TR } from '../../components/ui/Table';
import { Meta } from '../../components/ui/Text';
import { CHART } from '../../lib/clinical';
import { fmtDateShort, fmtNumber } from '../../lib/format';
import { errorText, get, post, useLoad } from '../../lib/api';

/*
  Charts follow one grammar: no axis lines, no tick marks, horizontal gridlines at
  low alpha, a soft area falloff under one 2px round-capped line, direct labels
  instead of legends where possible, and a reference band for the usual range.
  Domains are derived from the data, never hard-coded, so a legal reading can
  never render off-canvas.
*/

const LIMITS = {
  systolic_bp: { min: 70, max: 250, label: 'Systolic', unit: 'mmHg' },
  diastolic_bp: { min: 40, max: 150, label: 'Diastolic', unit: 'mmHg' },
  heart_rate: { min: 30, max: 220, label: 'Heart rate', unit: 'bpm' },
  spo2: { min: 50, max: 100, label: 'Oxygen saturation', unit: '%' },
  blood_glucose: { min: 20, max: 600, label: 'Glucose', unit: 'mg/dL' },
};

const domainFor = (values, pad = 0.12) => {
  const nums = values.map(Number).filter((n) => Number.isFinite(n));
  if (nums.length === 0) return [0, 1];
  const min = Math.min(...nums);
  const max = Math.max(...nums);
  const span = max - min || Math.max(4, max * 0.1);
  return [Math.floor(min - span * pad), Math.ceil(max + span * pad)];
};

const ChartTooltip = ({ active, payload, label, unit }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-ctl3 border border-sand-200 bg-bone-raised px-3.5 py-2.5 shadow-v3menu">
      <p className="v3-num text-mic uppercase tracking-caps text-sand-600">{label}</p>
      <ul className="mt-2 space-y-1.5">
        {payload.map((entry) => (
          <li key={entry.dataKey} className="flex items-center gap-2.5">
            <span aria-hidden className="h-2 w-2 shrink-0 rounded-full" style={{ background: entry.color }} />
            <span className="text-b3 text-sand-600">{entry.name}</span>
            <span className="v3-num ml-auto font-mono3 text-m3 font-medium text-sand-950">
              {entry.value}
              {unit ? <span className="ml-1 text-m4 text-sand-500">{unit}</span> : null}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

const ChartPanel = ({ title, description, data, series, band, unit, yDomain, emptyBody }) => {
  const hasData = Array.isArray(data) && data.length > 0;
  const domain =
    yDomain ||
    domainFor(
      hasData ? series.flatMap((serie) => data.map((row) => row[serie.key])) : [0, 1]
    );

  return (
    <Card pad="lg">
      <PanelTitle icon={Activity} count={hasData ? `${data.length} readings` : undefined}>
        {title}
      </PanelTitle>
      {description && <p className="-mt-1 mb-4 text-b3 leading-relaxed text-sand-600">{description}</p>}

      {!hasData ? (
        <EmptyState bare icon={Activity} title="No readings yet" body={emptyBody} />
      ) : (
        <>
          <div style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  {series.map((serie) => (
                    <linearGradient key={serie.key} id={`fill-${serie.key}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={serie.color} stopOpacity={0.22} />
                      <stop offset="100%" stopColor={serie.color} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>

                {band && (
                  <ReferenceArea
                    y1={band[0]}
                    y2={band[1]}
                    fill={CHART.band}
                    stroke={CHART.bandLine}
                    strokeDasharray="3 5"
                    strokeWidth={1}
                    ifOverflow="extendDomain"
                  />
                )}

                <CartesianGrid vertical={false} stroke={CHART.grid} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: CHART.axis, fontSize: 11 }}
                  interval="preserveStartEnd"
                  tickMargin={10}
                />
                <YAxis
                  width={44}
                  domain={domain}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: CHART.axis, fontSize: 11 }}
                  tickCount={5}
                />
                <Tooltip
                  content={<ChartTooltip unit={unit} />}
                  cursor={{ stroke: CHART.bandLine, strokeWidth: 1 }}
                />
                {series.map((serie) => (
                  <Area
                    key={serie.key}
                    type="monotone"
                    dataKey={serie.key}
                    name={serie.name}
                    stroke={serie.color}
                    strokeWidth={2}
                    strokeLinecap="round"
                    fill={`url(#fill-${serie.key})`}
                    dot={false}
                    activeDot={{ r: 3.5, strokeWidth: 0, fill: serie.color }}
                    isAnimationActive={false}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {band && (
            <p className="mt-3 flex items-center gap-2 text-b4 text-sand-600">
              <span aria-hidden className="h-2.5 w-4 rounded-sm border border-petrol-300 bg-petrol-100" />
              Shaded band: the usual reference range. A guide, not a diagnosis.
            </p>
          )}
        </>
      )}
    </Card>
  );
};

const emptyReadings = {
  systolic_bp: '',
  diastolic_bp: '',
  heart_rate: '',
  spo2: '',
  blood_glucose: '',
};

export const Vitals = () => {
  const { toast, show, clear } = useToast();
  const [form, setForm] = useState(emptyReadings);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [sampling, setSampling] = useState(false);

  const { data, loading, reload } = useLoad(
    async () => {
      const [trends, readings] = await Promise.all([
        get('/api/v1/patients/me/vitals/trends'),
        get('/api/v1/patients/me/vitals'),
      ]);
      return { trends, readings };
    },
    []
  );

  const trends = data?.trends || {};
  const readings = data?.readings || [];
  const latest = readings[0];

  const bpDomain = useMemo(
    () =>
      domainFor([
        ...(trends.bp || []).map((row) => row.systolic),
        ...(trends.bp || []).map((row) => row.diastolic),
        120,
        80,
      ]),
    [trends]
  );

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const validate = () => {
    const next = {};
    Object.entries(form).forEach(([key, raw]) => {
      if (raw === '') return;
      const value = Number(raw);
      const limit = LIMITS[key];
      if (!Number.isFinite(value)) next[key] = 'Use a number.';
      else if (value < limit.min || value > limit.max) next[key] = `Expected between ${limit.min} and ${limit.max}.`;
    });
    if (form.systolic_bp && form.diastolic_bp && Number(form.systolic_bp) <= Number(form.diastolic_bp)) {
      next.systolic_bp = 'Systolic is usually higher than diastolic.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const save = async (event) => {
    event.preventDefault();
    if (!validate()) return;
    const payload = Object.fromEntries(
      Object.entries(form).map(([key, value]) => [key, value === '' ? null : Number(value)])
    );
    if (Object.values(payload).every((value) => value === null)) {
      setErrors({ systolic_bp: 'Fill in at least one reading before saving.' });
      return;
    }
    setSaving(true);
    try {
      await post('/api/v1/patients/me/vitals', { ...payload, source: 'manual_entry' });
      setForm(emptyReadings);
      setErrors({});
      await reload({ quiet: true });
      show('Reading saved to your record.', 'good');
    } catch (err) {
      show(errorText(err, 'Could not save that reading.'), 'critical');
    } finally {
      setSaving(false);
    }
  };

  const addSample = async () => {
    setSampling(true);
    try {
      await post('/api/v1/patients/me/vitals/simulate-stream');
      await reload({ quiet: true });
      show('A live-stream sample reading was added.', 'good');
    } catch (err) {
      show(errorText(err, 'Could not add a sample reading.'), 'critical');
    } finally {
      setSampling(false);
    }
  };

  return (
    <AppShell role="PATIENT">
      <Page>
        <PageHeader
          title="Vitals"
          description="Log a reading any time, and watch how it moves over weeks instead of one day."
          actions={
            <Button variant="vellum" icon={Plus} loading={sampling} onClick={addSample}>
              Add a sample reading
            </Button>
          }
        />

        {loading ? (
          <PageSkeleton figures={4} rows={3} />
        ) : (
          <>
            <RuleGrid columns={4}>
              <div className="bg-bone-raised p-4 sm:p-5">
                <Figure
                  label="Blood pressure"
                  value={latest?.systolic_bp ? `${fmtNumber(latest.systolic_bp)}/${fmtNumber(latest.diastolic_bp)}` : 'No reading'}
                  unit={latest?.systolic_bp ? 'mmHg' : undefined}
                  hint={latest ? fmtDateShort(latest.recorded_at) : undefined}
                />
              </div>
              <div className="bg-bone-raised p-4 sm:p-5">
                <Figure label="Heart rate" value={latest?.heart_rate ? fmtNumber(latest.heart_rate) : 'No reading'} unit={latest?.heart_rate ? 'bpm' : undefined} />
              </div>
              <div className="bg-bone-raised p-4 sm:p-5">
                <Figure label="Oxygen" value={latest?.spo2 ? fmtNumber(latest.spo2) : 'No reading'} unit={latest?.spo2 ? '%' : undefined} />
              </div>
              <div className="bg-bone-raised p-4 sm:p-5">
                <Figure label="Readings on file" value={readings.length} hint={readings.length === 1 ? 'one reading' : 'in the record'} />
              </div>
            </RuleGrid>

            <Card pad="lg">
              <PanelTitle icon={HeartPulse} count="every field is optional">
                Add a reading
              </PanelTitle>
              <form onSubmit={save} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5" noValidate>
                <div>
                  <Label htmlFor="vitals-systolic" hint="mmHg">
                    Systolic
                  </Label>
                  <Input
                    id="vitals-systolic"
                    inputMode="numeric"
                    placeholder="138"
                    value={form.systolic_bp}
                    error={errors.systolic_bp}
                    onChange={set('systolic_bp')}
                  />
                </div>
                <div>
                  <Label htmlFor="vitals-diastolic" hint="mmHg">
                    Diastolic
                  </Label>
                  <Input
                    id="vitals-diastolic"
                    inputMode="numeric"
                    placeholder="88"
                    value={form.diastolic_bp}
                    error={errors.diastolic_bp}
                    onChange={set('diastolic_bp')}
                  />
                </div>
                <div>
                  <Label htmlFor="vitals-hr" hint="bpm">
                    Heart rate
                  </Label>
                  <Input
                    id="vitals-hr"
                    inputMode="numeric"
                    placeholder="74"
                    value={form.heart_rate}
                    error={errors.heart_rate}
                    onChange={set('heart_rate')}
                  />
                </div>
                <div>
                  <Label htmlFor="vitals-spo2" hint="%">
                    Oxygen
                  </Label>
                  <Input
                    id="vitals-spo2"
                    inputMode="numeric"
                    placeholder="98"
                    value={form.spo2}
                    error={errors.spo2}
                    onChange={set('spo2')}
                  />
                </div>
                <div>
                  <Label htmlFor="vitals-glucose" hint="mg/dL">
                    Glucose
                  </Label>
                  <Input
                    id="vitals-glucose"
                    inputMode="numeric"
                    placeholder="136"
                    value={form.blood_glucose}
                    error={errors.blood_glucose}
                    onChange={set('blood_glucose')}
                  />
                </div>

                <div className="flex items-center gap-3 sm:col-span-2 lg:col-span-5">
                  <Button type="submit" loading={saving}>
                    Save reading
                  </Button>
                  <Meta>Only fill in what you measured.</Meta>
                </div>
              </form>
            </Card>

            <div className="grid gap-5 lg:grid-cols-2">
              <ChartPanel
                title="Blood pressure"
                description="Systolic over diastolic, against the usual 90 to 120 systolic range."
                data={trends.bp || []}
                unit="mmHg"
                yDomain={bpDomain}
                band={[90, 120]}
                emptyBody="Add a reading above and it appears here."
                series={[
                  { key: 'systolic', name: 'Systolic', color: CHART.petrol },
                  { key: 'diastolic', name: 'Diastolic', color: CHART.watch },
                ]}
              />
              <ChartPanel
                title="Fasting glucose"
                description="Against the usual 70 to 100 mg/dL range."
                data={trends.glucose || []}
                unit="mg/dL"
                band={[70, 100]}
                emptyBody="Glucose readings appear here once you log one."
                series={[{ key: 'glucose', name: 'Glucose', color: CHART.petrol }]}
              />
              <ChartPanel
                title="Heart rate"
                description="Resting readings, against the usual 60 to 100 bpm."
                data={trends.heart_rate || []}
                unit="bpm"
                band={[60, 100]}
                emptyBody="Heart rate readings appear here once you log one."
                series={[{ key: 'heart_rate', name: 'Heart rate', color: CHART.petrol }]}
              />
              <ChartPanel
                title="Oxygen saturation"
                description="Against the usual 95 to 100 percent."
                data={trends.spo2 || []}
                unit="%"
                band={[95, 100]}
                yDomain={[90, 100]}
                emptyBody="Oxygen readings appear here once you log one."
                series={[{ key: 'spo2', name: 'SpO2', color: CHART.petrol }]}
              />
            </div>

            <Card pad="lg">
              <PanelTitle icon={Activity} count={`${readings.length} on file`}>
                Recent readings
              </PanelTitle>
              {readings.length === 0 ? (
                <EmptyState bare icon={Activity} title="Nothing logged yet" body="Your readings, newest first, with the source of each one." />
              ) : (
                <TableWrap>
                  <Table minWidth={640}>
                    <THead>
                      <TR>
                        <TH>Recorded</TH>
                        <TH align="right">BP</TH>
                        <TH align="right">Heart rate</TH>
                        <TH align="right">Oxygen</TH>
                        <TH align="right">Glucose</TH>
                        <TH>Source</TH>
                      </TR>
                    </THead>
                    <TBody>
                      {readings.slice(0, 8).map((reading) => (
                        <TR key={reading.id}>
                          <TD>
                            <span className="font-mono3 text-m3 text-sand-800">{fmtDateShort(reading.recorded_at)}</span>
                            <span className="ml-2 text-m4 text-sand-500">{reading.recorded_at?.slice(11, 16)}</span>
                          </TD>
                          <TD align="right">
                            {reading.systolic_bp ? `${fmtNumber(reading.systolic_bp)}/${fmtNumber(reading.diastolic_bp)}` : 'Not taken'}
                          </TD>
                          <TD align="right">{reading.heart_rate ? fmtNumber(reading.heart_rate) : 'Not taken'}</TD>
                          <TD align="right">{reading.spo2 ? `${fmtNumber(reading.spo2)}%` : 'Not taken'}</TD>
                          <TD align="right">{reading.blood_glucose ? fmtNumber(reading.blood_glucose) : 'Not taken'}</TD>
                          <TD>
                            <span className="text-b4 text-sand-600">
                              {reading.source === 'live_iot_stream' ? 'Simulated stream' : 'Manual entry'}
                            </span>
                          </TD>
                        </TR>
                      ))}
                    </TBody>
                  </Table>
                </TableWrap>
              )}
            </Card>
          </>
        )}
      </Page>

      <Toast toast={toast} onClose={clear} />
    </AppShell>
  );
};

export default Vitals;
