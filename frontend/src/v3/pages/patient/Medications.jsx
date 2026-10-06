import React, { useMemo, useState } from 'react';
import { AlertTriangle, Pill, Plus, ShieldCheck, StopCircle } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { Page } from '../../components/layout/Container';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { Card, DuskPanel, PanelTitle, RuleGrid } from '../../components/ui/Card';
import { Figure } from '../../components/ui/Figure';
import { StatusPill, Tag } from '../../components/ui/Tag';
import { Input, Label } from '../../components/ui/Field';
import { Dialog } from '../../components/ui/Overlay';
import { EmptyState } from '../../components/ui/EmptyState';
import { PageSkeleton } from '../../components/ui/Skeleton';
import { Toast, useToast } from '../../components/ui/Toast';
import { Caps, Meta } from '../../components/ui/Text';
import { ddiLabel, medicationStatusLabel } from '../../lib/clinical';
import { errorText, get, post, useLoad } from '../../lib/api';

const emptyForm = { name: '', dosage: '', frequency: '', prescribed_by: '' };

export const Medications = () => {
  const { toast, show, clear } = useToast();
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [stopping, setStopping] = useState(null);
  const [stopPending, setStopPending] = useState(false);

  const { data, loading, reload } = useLoad(
    async () => {
      const [medicines, interactions] = await Promise.all([
        get('/api/v1/patients/me/medications'),
        get('/api/v1/patients/me/medications/check-interactions'),
      ]);
      return { medicines, interactions };
    },
    []
  );

  const medicines = data?.medicines || [];
  const interactions = data?.interactions?.interactions_found || [];

  const { active, stopped } = useMemo(() => {
    const activeList = medicines.filter((item) => item.status === 'ACTIVE');
    const stoppedList = medicines.filter((item) => item.status !== 'ACTIVE');
    return { active: activeList, stopped: stoppedList };
  }, [medicines]);

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const addMedicine = async (event) => {
    event.preventDefault();
    setFormError('');
    if (!form.name.trim() || !form.dosage.trim() || !form.frequency.trim()) {
      setFormError('Name, dosage, and how often you take it are all needed for the safety check.');
      return;
    }
    setSaving(true);
    try {
      await post('/api/v1/patients/me/medications', {
        name: form.name.trim(),
        dosage: form.dosage.trim(),
        frequency: form.frequency.trim(),
        prescribed_by: form.prescribed_by.trim() || undefined,
        status: 'ACTIVE',
      });
      setForm(emptyForm);
      await reload({ quiet: true });
      show('Medicine added and checked against your others.', 'good');
    } catch (err) {
      setFormError(errorText(err, 'Could not add that medicine.'));
    } finally {
      setSaving(false);
    }
  };

  const stopMedicine = async () => {
    if (!stopping) return;
    setStopPending(true);
    try {
      await post(`/api/v1/patients/me/medications/${stopping.id}/stop`);
      setStopping(null);
      await reload({ quiet: true });
      show(`${stopping.name} is marked as stopped in your record.`, 'neutral');
    } catch (err) {
      show(errorText(err, 'Could not update that medicine.'), 'critical');
    } finally {
      setStopPending(false);
    }
  };

  return (
    <AppShell role="PATIENT">
      <Page>
        <PageHeader
          title="Medicines"
          description="Everything you take, checked automatically against everything else you take."
        />

        {loading ? (
          <PageSkeleton figures={3} rows={4} />
        ) : (
          <>
            <RuleGrid columns={3}>
              <div className="bg-bone-raised p-4 sm:p-5">
                <Figure label="Taking now" value={active.length} hint={active[0]?.name || 'None recorded'} />
              </div>
              <div className="bg-bone-raised p-4 sm:p-5">
                <Figure label="Stopped" value={stopped.length} hint="kept in the record" />
              </div>
              <div className="bg-bone-raised p-4 sm:p-5">
                <Figure
                  label="Interaction notes"
                  value={interactions.length}
                  tag={
                    interactions.length > 0 ? (
                      <StatusPill value={interactions[0].severity} domain="ddi" label={ddiLabel(interactions[0].severity)} size="sm" />
                    ) : (
                      <StatusPill tone="good" label="Nothing found" size="sm" />
                    )
                  }
                />
              </div>
            </RuleGrid>

            {interactions.length > 0 && (
              <section>
                <div className="grid gap-4 lg:grid-cols-2">
                  {interactions.map((interaction, index) => (
                    <Card key={`${interaction.title}-${index}`} pad="lg" className="h-full">
                      <div className="flex items-start justify-between gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-tile3 bg-sig-watch-50 text-sig-watch-600">
                          <AlertTriangle className="h-4 w-4" strokeWidth={2.1} />
                        </span>
                        <StatusPill
                          value={interaction.severity}
                          domain="ddi"
                          label={ddiLabel(interaction.severity)}
                          size="sm"
                        />
                      </div>
                      <h3 className="mt-4 text-d5 text-sand-950">{interaction.title}</h3>
                      <p className="mt-2 text-b2 leading-relaxed text-sand-600">{interaction.description}</p>
                      <p className="mt-3 rounded-ctl3 border border-sand-200 bg-bone px-3.5 py-3 text-b3 text-sand-800">
                        <span className="font-semibold text-sand-950">What to do: </span>
                        {interaction.recommendation}
                      </p>
                      <div className="mt-3.5 flex flex-wrap items-center gap-2">
                        <Caps>Between</Caps>
                        {interaction.conflicting_medications.map((name) => (
                          <Tag key={name} tone="dusk" case="sentence">
                            {name}
                          </Tag>
                        ))}
                      </div>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            <DuskPanel pad="md">
              <div className="flex items-start gap-3.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-tile3 bg-white/10 text-petrol-200">
                  <ShieldCheck className="h-4 w-4" strokeWidth={2.1} />
                </span>
                <div>
                  <p className="text-b2 font-semibold text-dusk-text">The rule Sync AI follows</p>
                  <p className="mt-1 text-b3 leading-relaxed text-dusk-soft">
                    It can explain what a medicine does and warn about combinations. It cannot change a
                    dose, start or stop a prescription. Those questions are refused and pointed back to
                    your prescriber.
                  </p>
                </div>
              </div>
            </DuskPanel>

            <Card pad="lg">
              <PanelTitle icon={Plus}>Add a medicine</PanelTitle>
              <form onSubmit={addMedicine} className="grid gap-4 sm:grid-cols-2" noValidate>
                <div>
                  <Label htmlFor="med-name" required>
                    Name
                  </Label>
                  <Input
                    id="med-name"
                    placeholder="Metformin HCl"
                    value={form.name}
                    onChange={set('name')}
                  />
                </div>
                <div>
                  <Label htmlFor="med-dosage" required hint="for example 500 mg">
                    Dosage
                  </Label>
                  <Input
                    id="med-dosage"
                    placeholder="500 mg"
                    value={form.dosage}
                    onChange={set('dosage')}
                  />
                </div>
                <div>
                  <Label htmlFor="med-frequency" required hint="for example twice daily">
                    How often
                  </Label>
                  <Input
                    id="med-frequency"
                    placeholder="Twice daily with meals"
                    value={form.frequency}
                    onChange={set('frequency')}
                  />
                </div>
                <div>
                  <Label htmlFor="med-prescriber" hint="optional">
                    Prescribed by
                  </Label>
                  <Input
                    id="med-prescriber"
                    placeholder="Dr. Robert Smith"
                    value={form.prescribed_by}
                    onChange={set('prescribed_by')}
                  />
                </div>

                {formError && (
                  <p role="alert" className="sm:col-span-2 rounded-ctl3 border border-sig-critical-100 bg-sig-critical-50 px-4 py-3 text-b3 text-sig-critical-700">
                    {formError}
                  </p>
                )}

                <div className="flex items-center gap-3 sm:col-span-2">
                  <Button type="submit" loading={saving}>
                    Add and check
                  </Button>
                  <Meta>
                    Checked against {active.length} active {active.length === 1 ? 'medicine' : 'medicines'}.
                  </Meta>
                </div>
              </form>
            </Card>

            <Card pad="lg">
              <PanelTitle icon={Pill} count={`${active.length} active · ${stopped.length} stopped`}>
                Your medicines
              </PanelTitle>

              {medicines.length === 0 ? (
                <EmptyState
                  bare
                  icon={Pill}
                  title="No medicines recorded yet"
                  body="Add what you take and every combination is checked as soon as it is saved."
                />
              ) : (
                <ul className="divide-y divide-sand-200">
                  {[...active, ...stopped].map((medicine) => {
                    const isActive = medicine.status === 'ACTIVE';
                    return (
                      <li key={medicine.id} className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3 py-4 first:pt-0 last:pb-0">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2.5">
                            <h3 className={`text-d5 ${isActive ? 'text-sand-950' : 'text-sand-600'}`}>
                              {medicine.name}
                            </h3>
                            <StatusPill value={medicine.status} label={medicationStatusLabel(medicine.status)} size="sm" />
                          </div>
                          <p className="mt-1.5 text-b2 text-sand-700">
                            {medicine.dosage}
                            <span aria-hidden className="mx-1.5 text-sand-400">·</span>
                            {medicine.frequency}
                            <span aria-hidden className="mx-1.5 text-sand-400">·</span>
                            {medicine.route}
                          </p>
                          {medicine.prescribed_by && (
                            <p className="mt-1 text-b3 text-sand-500">Prescribed by {medicine.prescribed_by}</p>
                          )}
                          {medicine.notes && <p className="mt-1.5 text-b3 italic text-sand-600">{medicine.notes}</p>}
                        </div>

                        {isActive && (
                          <Button
                            variant="quiet"
                            size="sm"
                            icon={StopCircle}
                            onClick={() => setStopping(medicine)}
                            className="text-sand-700"
                          >
                            Mark as stopped
                          </Button>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </Card>
          </>
        )}
      </Page>

      <Dialog
        open={Boolean(stopping)}
        onClose={() => setStopping(null)}
        title={stopping ? `Mark ${stopping.name} as stopped?` : ''}
        description="This updates your record and removes it from the interaction checks. The history stays."
        footer={
          <>
            <Button variant="vellum" onClick={() => setStopping(null)}>
              Keep it active
            </Button>
            <Button variant="critical" loading={stopPending} onClick={stopMedicine}>
              Mark as stopped
            </Button>
          </>
        }
      />

      <Toast toast={toast} onClose={clear} />
    </AppShell>
  );
};

export default Medications;
