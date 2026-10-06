import React, { useMemo, useState } from 'react';
import { Activity, Download, FlaskConical, HeartPulse, ActivitySquare, Users } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { Page } from '../../components/layout/Container';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { Card, DuskPanel, PanelTitle, SectionHeader } from '../../components/ui/Card';
import { StatusPill } from '../../components/ui/Tag';
import { SubNav } from '../../components/ui/Tabs';
import { DataRow } from '../../components/ui/Field';
import { EmptyState } from '../../components/ui/EmptyState';
import { FIGURE_SIZE } from '../../components/ui/Figure';
import { cn } from '../../lib/cn';
import { PageSkeleton } from '../../components/ui/Skeleton';
import { Toast, useToast } from '../../components/ui/Toast';
import { Caps, Meta, Mono } from '../../components/ui/Text';
import { clinicalTone, labStatusLabel } from '../../lib/clinical';
import { fmtDate, fmtDateTime, fmtNumber, humanize } from '../../lib/format';
import { errorText, get, useLoad } from '../../lib/api';
import { RECORD_LINKS } from '../../components/layout/nav';

/*
  The health profile: the whole record on one screen, ordered the way a person
  would read it. Organ systems lead because the score tiles are the only place the
  record aggregates across domains.
*/
/**
 * "Cardiovascular System" -> "Cardiovascular". The panel heading already says
 * these are systems, so repeating the word five times only eats the width the
 * label needs to stay on one line.
 */
const shortSystemName = (name) => String(name || '').replace(/\s*system$/i, '');

const OrganTile = ({ system }) => (
  <div className="flex h-full flex-col rounded-card3 border border-white/10 bg-white/5 p-4">
    {/* Two-line label slot. Without it, the one label that wraps pushes its score,
        pill and metrics a line lower than every other tile in the row. */}
    <div className="min-h-7">
      <Caps tone="dusk">{shortSystemName(system.name)}</Caps>
    </div>
    <div className="mt-2.5 flex items-baseline gap-1.5">
      <span className={cn('v3-num font-display3 leading-none text-dusk-text', FIGURE_SIZE.md)}>
        {system.score}
      </span>
      <span className="text-b4 text-dusk-faint">/ 100</span>
    </div>
    <div className="mt-3">
      <StatusPill
        value={system.status}
        surface="dusk"
        label={humanize(system.status)}
        size="sm"
        tone={system.status === 'NORMAL' ? 'good' : 'watch'}
      />
    </div>
    <p className="mt-3.5 border-t border-white/10 pt-3 font-mono3 text-m4 leading-relaxed text-dusk-faint">
      {system.key_metrics}
    </p>
  </div>
);

export const DigitalTwin = () => {
  const { toast, show, clear } = useToast();
  const [downloading, setDownloading] = useState(false);

  const { data, loading } = useLoad(
    async () => {
      const [twin, systems] = await Promise.all([
        get('/api/v1/patients/me/digital-twin'),
        get('/api/v1/patients/me/organ-systems'),
      ]);
      return { twin, systems };
    },
    []
  );

  const twin = data?.twin;
  const systems = useMemo(() => Object.values(data?.systems || {}), [data]);
  const patient = twin?.patient || {};
  const vitals = twin?.recent_vitals?.[0];
  const labs = twin?.lab_results || [];
  const conditions = twin?.medical_history || [];
  const medicines = twin?.active_medications || [];
  const allergies = twin?.allergies || [];
  const family = twin?.family_history || [];

  const download = async () => {
    setDownloading(true);
    try {
      const bundle = await get('/api/v1/patients/me/fhir-export');
      const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `health_record_${String(patient.name || 'patient').replace(/\s+/g, '_').toLowerCase()}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      show('Record downloaded as FHIR R4.', 'good');
    } catch (err) {
      show(errorText(err, 'Could not export the record right now.'), 'critical');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <AppShell role="PATIENT">
      <Page width="wide">
        <PageHeader
          title="Health profile"
          description={`Everything about your health, gathered in one place for ${patient.name || 'you'}.`}
          actions={
            <Button icon={Download} loading={downloading} onClick={download}>
              Download full record
            </Button>
          }
        />

        <SubNav items={RECORD_LINKS} />

        {loading ? (
          <PageSkeleton figures={5} rows={5} />
        ) : (
          <>
            {systems.length > 0 && (
              <DuskPanel pad="lg">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <Caps tone="dusk">Across your record</Caps>
                    <h2 className="mt-2 text-d3 text-dusk-text">How your body systems are doing</h2>
                  </div>
                  <Meta tone="dusk">Updated after every new result</Meta>
                </div>
                <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                  {systems.map((system) => (
                    <OrganTile key={system.name} system={system} />
                  ))}
                </div>
              </DuskPanel>
            )}

            <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
              <Card pad="lg">
                <PanelTitle icon={Users}>About you</PanelTitle>
                <dl className="divide-y divide-sand-200">
                  <DataRow label="Name" value={patient.name || 'Not recorded'} />
                  <DataRow label="Age" value={patient.age ? `${patient.age}` : 'Not recorded'} />
                  <DataRow label="Gender" value={patient.gender || 'Not recorded'} />
                  <DataRow label="Blood group" value={patient.blood_group || 'Not recorded'} />
                  <DataRow label="Height" value={patient.height_cm ? `${fmtNumber(patient.height_cm)} cm` : 'Not recorded'} />
                  <DataRow label="Weight" value={patient.weight_kg ? `${fmtNumber(patient.weight_kg)} kg` : 'Not recorded'} />
                  <DataRow label="Diet" value={humanize(patient.lifestyle?.diet) || 'Not recorded'} />
                  <DataRow label="Exercise" value={patient.lifestyle?.exercise || 'Not recorded'} />
                  <DataRow label="Smoking" value={humanize(patient.lifestyle?.smoking) || 'Not recorded'} />
                </dl>
              </Card>

              <Card pad="lg">
                <PanelTitle icon={ActivitySquare} count={conditions.length}>Conditions</PanelTitle>
                {conditions.length === 0 ? (
                  <EmptyState bare icon={ActivitySquare} title="Nothing recorded" body="Conditions you add show up here." />
                ) : (
                  <ul className="divide-y divide-sand-200">
                    {conditions.map((item) => (
                      <li key={item.condition} className="flex items-start justify-between gap-3 py-3 first:pt-0">
                        <div className="min-w-0">
                          <p className="text-b2 font-semibold text-sand-950">{item.condition}</p>
                          <p className="mt-0.5 text-b3 text-sand-600">
                            {item.diagnosis_date ? `Since ${fmtDate(item.diagnosis_date)}` : 'Date not recorded'}
                          </p>
                        </div>
                        <StatusPill value={item.status} label={humanize(item.status)} size="sm" />
                      </li>
                    ))}
                  </ul>
                )}
              </Card>

              <Card pad="lg">
                <PanelTitle count={`${medicines.length} active`}>Active medicines</PanelTitle>
                {medicines.length === 0 ? (
                  <EmptyState bare icon={Activity} title="Nothing recorded" body="Medicines you add show up here." />
                ) : (
                  <ul className="divide-y divide-sand-200">
                    {medicines.map((medicine, index) => (
                      <li key={`${medicine.name}-${index}`} className="py-3 first:pt-0">
                        <p className="text-b2 font-semibold text-sand-950">{medicine.name}</p>
                        <p className="mt-0.5 text-b3 text-sand-600">
                          {medicine.dosage} · {medicine.frequency}
                        </p>
                        {medicine.prescribed_by && (
                          <p className="mt-0.5 text-b4 text-sand-500">{medicine.prescribed_by}</p>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </Card>

              <Card pad="lg">
                <PanelTitle icon={HeartPulse}>Recent vitals</PanelTitle>
                {!vitals ? (
                  <EmptyState bare icon={HeartPulse} title="No readings yet" body="Readings you log show up here." />
                ) : (
                  <dl className="divide-y divide-sand-200">
                    <DataRow label="Blood pressure" value={vitals.bp || 'Not taken'} sub="mmHg" />
                    <DataRow label="Heart rate" value={vitals.heart_rate ? fmtNumber(vitals.heart_rate) : 'Not taken'} sub="bpm" />
                    <DataRow label="Oxygen" value={vitals.spo2 ? fmtNumber(vitals.spo2) : 'Not taken'} sub="%" />
                    <DataRow label="Temperature" value={vitals.temperature ? fmtNumber(vitals.temperature) : 'Not taken'} sub="F" />
                    <DataRow label="Glucose" value={vitals.glucose ? fmtNumber(vitals.glucose) : 'Not taken'} sub="mg/dL" />
                    <DataRow label="Weight" value={vitals.weight ? fmtNumber(vitals.weight) : 'Not taken'} sub="kg" />
                    <DataRow label="Last recorded" value={vitals.recorded_at ? fmtDateTime(vitals.recorded_at) : 'Not recorded'} />
                  </dl>
                )}
              </Card>

              <Card pad="lg">
                <PanelTitle icon={FlaskConical} count={labs.length}>Lab values</PanelTitle>
                {labs.length === 0 ? (
                  <EmptyState bare icon={FlaskConical} title="No lab values yet" body="Values from your reports are listed here." />
                ) : (
                  <ul className="max-h-72 divide-y divide-sand-200 overflow-y-auto">
                    {labs.map((lab, index) => (
                      <li key={`${lab.test_name}-${index}`} className="flex items-center justify-between gap-3 py-2.5">
                        <div className="min-w-0">
                          <p className="truncate text-b3 font-medium text-sand-900">{lab.test_name}</p>
                          <Mono>{lab.report_type} · {fmtDate(lab.report_date)}</Mono>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="v3-num font-mono3 text-m3 font-medium text-sand-950">
                            {fmtNumber(lab.value)} <span className="text-m4 text-sand-500">{lab.unit}</span>
                          </p>
                          <StatusPill value={lab.status} domain="lab" label={labStatusLabel(lab.status)} size="sm" />
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>

              <div className="flex flex-col gap-5">
                <Card pad="lg">
                  <PanelTitle count={allergies.length}>Allergies</PanelTitle>
                  {allergies.length === 0 ? (
                    <EmptyState bare icon={Activity} title="None recorded" body="Allergies you add are checked against every medicine." />
                  ) : (
                    <ul className="space-y-2.5">
                      {allergies.map((item) => (
                        <li key={item.allergen} className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-b2 font-semibold text-sand-950">{item.allergen}</p>
                            <p className="mt-0.5 text-b3 text-sand-600">{item.reaction || 'Reaction not recorded'}</p>
                          </div>
                          <StatusPill
                            value={item.severity}
                            domain="allergy"
                            label={clinicalTone(item.severity, 'allergy') === 'critical' ? 'Severe' : clinicalTone(item.severity, 'allergy') === 'watch' ? 'Moderate' : 'Mild'}
                            size="sm"
                          />
                        </li>
                      ))}
                    </ul>
                  )}
                </Card>

                <Card pad="lg">
                  <PanelTitle count={family.length}>Family history</PanelTitle>
                  {family.length === 0 ? (
                    <EmptyState bare icon={Users} title="Nothing recorded" body="Family history your care team has noted." />
                  ) : (
                    <ul className="space-y-3">
                      {family.map((item, index) => (
                        <li key={`${item.relation}-${index}`}>
                          <p className="text-b2 font-semibold text-sand-950">
                            {item.relation}
                            {item.age_at_diagnosis ? (
                              <span className="ml-2 text-b3 font-normal text-sand-600">
                                diagnosed at {item.age_at_diagnosis}
                              </span>
                            ) : null}
                          </p>
                          <p className="mt-0.5 text-b3 text-sand-600">{item.condition}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                </Card>
              </div>
            </div>

            <section>
              <SectionHeader
                title="Exports"
                hint="The download button exports your whole record as FHIR R4, the format most clinical systems can read. Useful when you change doctors."
              />
              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="vellum" icon={Download} loading={downloading} onClick={download}>
                  Download FHIR R4 bundle
                </Button>
                <Button to="/v3/patient/timeline" variant="quiet">
                  See the timeline
                </Button>
              </div>
            </section>
          </>
        )}
      </Page>

      <Toast toast={toast} onClose={clear} />
    </AppShell>
  );
};

export default DigitalTwin;
