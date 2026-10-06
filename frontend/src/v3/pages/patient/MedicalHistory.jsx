import React, { useState } from 'react';
import { Plus, Stethoscope, Trash2, X } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { Page } from '../../components/layout/Container';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button, IconButton } from '../../components/ui/Button';
import { Card, PanelTitle, RuleGrid } from '../../components/ui/Card';
import { Figure } from '../../components/ui/Figure';
import { StatusPill } from '../../components/ui/Tag';
import { Input, Label, Select, Textarea } from '../../components/ui/Field';
import { Dialog } from '../../components/ui/Overlay';
import { EmptyState } from '../../components/ui/EmptyState';
import { PageSkeleton } from '../../components/ui/Skeleton';
import { Toast, useToast } from '../../components/ui/Toast';
import { Caps } from '../../components/ui/Text';
import { clinicalTone } from '../../lib/clinical';
import { fmtDate, humanize } from '../../lib/format';
import { del, errorText, get, post, useLoad } from '../../lib/api';

const CONDITION_STATUS_OPTIONS = ['ACTIVE', 'CHRONIC', 'RESOLVED'];
const SEVERITY_OPTIONS = ['Mild', 'Moderate', 'Severe'];

const severityLabel = (severity) => {
  const tone = clinicalTone(severity, 'allergy');
  if (tone === 'critical') return 'Severe';
  if (tone === 'watch') return 'Moderate';
  return 'Mild';
};

export const MedicalHistory = () => {
  const { toast, show, clear } = useToast();
  const [conditionOpen, setConditionOpen] = useState(false);
  const [allergyOpen, setAllergyOpen] = useState(false);
  const [condition, setCondition] = useState({ condition_name: '', diagnosis_date: '', status: 'ACTIVE', description: '' });
  const [allergy, setAllergy] = useState({ allergen: '', reaction: '', severity: 'Moderate', notes: '' });
  const [conditionError, setConditionError] = useState('');
  const [allergyError, setAllergyError] = useState('');
  const [pending, setPending] = useState(false);
  const [removing, setRemoving] = useState(null);
  const [removePending, setRemovePending] = useState(false);

  const { data, loading, reload } = useLoad(
    async () => {
      const [conditions, allergies] = await Promise.all([
        get('/api/v1/patients/me/medical-history'),
        get('/api/v1/patients/me/allergies'),
      ]);
      return { conditions, allergies };
    },
    []
  );

  const conditions = data?.conditions || [];
  const allergies = data?.allergies || [];

  const addCondition = async (event) => {
    event.preventDefault();
    setConditionError('');
    if (!condition.condition_name.trim()) {
      setConditionError('Give the condition a name.');
      return;
    }
    setPending(true);
    try {
      await post('/api/v1/patients/me/medical-history', {
        condition_name: condition.condition_name.trim(),
        diagnosis_date: condition.diagnosis_date || undefined,
        status: condition.status,
        description: condition.description.trim() || undefined,
      });
      setCondition({ condition_name: '', diagnosis_date: '', status: 'ACTIVE', description: '' });
      setConditionOpen(false);
      await reload({ quiet: true });
      show('Condition added to your history.', 'good');
    } catch (err) {
      setConditionError(errorText(err, 'Could not save that condition.'));
    } finally {
      setPending(false);
    }
  };

  const addAllergy = async (event) => {
    event.preventDefault();
    setAllergyError('');
    if (!allergy.allergen.trim()) {
      setAllergyError('Give the allergen a name.');
      return;
    }
    setPending(true);
    try {
      await post('/api/v1/patients/me/allergies', {
        allergen: allergy.allergen.trim(),
        reaction: allergy.reaction.trim() || undefined,
        severity: allergy.severity,
        notes: allergy.notes.trim() || undefined,
      });
      setAllergy({ allergen: '', reaction: '', severity: 'Moderate', notes: '' });
      setAllergyOpen(false);
      await reload({ quiet: true });
      show('Allergy added to your record.', 'good');
    } catch (err) {
      setAllergyError(errorText(err, 'Could not save that allergy.'));
    } finally {
      setPending(false);
    }
  };

  const remove = async () => {
    if (!removing) return;
    setRemovePending(true);
    try {
      await del(`/api/v1/patients/me/${removing.kind === 'condition' ? 'medical-history' : 'allergies'}/${removing.id}`);
      setRemoving(null);
      await reload({ quiet: true });
      show('Removed from your record.', 'neutral');
    } catch (err) {
      show(errorText(err, 'Could not remove that entry.'), 'critical');
    } finally {
      setRemovePending(false);
    }
  };

  return (
    <AppShell role="PATIENT">
      <Page>
        <PageHeader
          title="Medical history"
          description="The conditions and allergies your care team should always know about. New medicines are checked against them."
        />

        {loading ? (
          <PageSkeleton figures={2} rows={5} />
        ) : (
          <>
            <RuleGrid columns={2}>
              <div className="bg-bone-raised p-4 sm:p-5">
                <Figure label="Conditions on file" value={conditions.length} hint={conditions[0]?.condition_name || 'None recorded'} />
              </div>
              <div className="bg-bone-raised p-4 sm:p-5">
                <Figure label="Allergies on file" value={allergies.length} hint={allergies[0]?.allergen || 'None recorded'} />
              </div>
            </RuleGrid>

            <div className="grid gap-5 lg:grid-cols-2">
              <Card pad="lg">
                <PanelTitle
                  icon={Stethoscope}
                  count={conditions.length}
                  action={
                    <Button
                      variant="quiet"
                      size="sm"
                      icon={conditionOpen ? X : Plus}
                      onClick={() => setConditionOpen((open) => !open)}
                    >
                      {conditionOpen ? 'Close' : 'Add condition'}
                    </Button>
                  }
                >
                  Conditions
                </PanelTitle>

                {conditionOpen && (
                  <form onSubmit={addCondition} className="mb-5 space-y-4 rounded-ctl3 border border-petrol-200 bg-petrol-50/50 p-4" noValidate>
                    <Caps className="text-petrol-800">New condition</Caps>
                    <div>
                      <Label htmlFor="condition-name" required>
                        Condition
                      </Label>
                      <Input
                        id="condition-name"
                        placeholder="Type 2 Diabetes Mellitus"
                        value={condition.condition_name}
                        error={conditionError}
                        onChange={(event) => setCondition((prev) => ({ ...prev, condition_name: event.target.value }))}
                      />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label htmlFor="condition-date" hint="optional">
                          Diagnosed on
                        </Label>
                        <Input
                          id="condition-date"
                          type="date"
                          value={condition.diagnosis_date}
                          onChange={(event) => setCondition((prev) => ({ ...prev, diagnosis_date: event.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="condition-status">Status</Label>
                        <Select
                          id="condition-status"
                          value={condition.status}
                          onChange={(event) => setCondition((prev) => ({ ...prev, status: event.target.value }))}
                        >
                          {CONDITION_STATUS_OPTIONS.map((option) => (
                            <option key={option} value={option}>
                              {humanize(option)}
                            </option>
                          ))}
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="condition-notes" hint="optional">
                        Notes
                      </Label>
                      <Textarea
                        id="condition-notes"
                        rows={2}
                        placeholder="Managed with oral medication, reviewed twice a year."
                        value={condition.description}
                        onChange={(event) => setCondition((prev) => ({ ...prev, description: event.target.value }))}
                      />
                    </div>
                    <Button type="submit" loading={pending}>
                      Save condition
                    </Button>
                  </form>
                )}

                {conditions.length === 0 ? (
                  <EmptyState
                    bare
                    icon={Stethoscope}
                    title="No conditions recorded"
                    body="Anything you add here becomes context for every other number in the record."
                  />
                ) : (
                  <ul className="divide-y divide-sand-200">
                    {conditions.map((item) => (
                      <li key={item.id} className="flex items-start justify-between gap-4 py-3.5 first:pt-0 last:pb-0">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2.5">
                            <h3 className="text-d5 text-sand-950">{item.condition_name}</h3>
                            <StatusPill value={item.status} label={humanize(item.status)} size="sm" />
                          </div>
                          <p className="mt-1 text-b3 text-sand-600">
                            {item.diagnosis_date ? `Diagnosed ${fmtDate(item.diagnosis_date)}` : 'Diagnosis date not recorded'}
                          </p>
                          {item.description && <p className="mt-1 text-b3 leading-relaxed text-sand-600">{item.description}</p>}
                        </div>
                        <IconButton
                          label={`Remove ${item.condition_name}`}
                          icon={Trash2}
                          variant="quiet"
                          size="sm"
                          onClick={() => setRemoving({ kind: 'condition', id: item.id, name: item.condition_name })}
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </Card>

              <Card pad="lg">
                <PanelTitle
                  count={allergies.length}
                  action={
                    <Button
                      variant="quiet"
                      size="sm"
                      icon={allergyOpen ? X : Plus}
                      onClick={() => setAllergyOpen((open) => !open)}
                    >
                      {allergyOpen ? 'Close' : 'Add allergy'}
                    </Button>
                  }
                >
                  Allergies
                </PanelTitle>

                {allergyOpen && (
                  <form onSubmit={addAllergy} className="mb-5 space-y-4 rounded-ctl3 border border-petrol-200 bg-petrol-50/50 p-4" noValidate>
                    <Caps className="text-petrol-800">New allergy</Caps>
                    <div>
                      <Label htmlFor="allergy-name" required>
                        Allergen
                      </Label>
                      <Input
                        id="allergy-name"
                        placeholder="Penicillin"
                        value={allergy.allergen}
                        error={allergyError}
                        onChange={(event) => setAllergy((prev) => ({ ...prev, allergen: event.target.value }))}
                      />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label htmlFor="allergy-reaction" hint="optional">
                          Reaction
                        </Label>
                        <Input
                          id="allergy-reaction"
                          placeholder="Skin rash"
                          value={allergy.reaction}
                          onChange={(event) => setAllergy((prev) => ({ ...prev, reaction: event.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="allergy-severity">Severity</Label>
                        <Select
                          id="allergy-severity"
                          value={allergy.severity}
                          onChange={(event) => setAllergy((prev) => ({ ...prev, severity: event.target.value }))}
                        >
                          {SEVERITY_OPTIONS.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </Select>
                      </div>
                    </div>
                    <Button type="submit" loading={pending}>
                      Save allergy
                    </Button>
                  </form>
                )}

                {allergies.length === 0 ? (
                  <EmptyState
                    bare
                    icon={Stethoscope}
                    title="No allergies recorded"
                    body="Recording them here is what lets the interaction checks stay honest."
                  />
                ) : (
                  <ul className="divide-y divide-sand-200">
                    {allergies.map((item) => (
                      <li key={item.id} className="flex items-start justify-between gap-4 py-3.5 first:pt-0 last:pb-0">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2.5">
                            <h3 className="text-d5 text-sand-950">{item.allergen}</h3>
                            <StatusPill value={item.severity} domain="allergy" label={severityLabel(item.severity)} size="sm" />
                          </div>
                          <p className="mt-1 text-b3 text-sand-600">
                            {item.reaction ? `Reaction: ${item.reaction}` : 'Reaction not recorded'}
                          </p>
                          {item.notes && <p className="mt-1 text-b3 leading-relaxed text-sand-600">{item.notes}</p>}
                        </div>
                        <IconButton
                          label={`Remove ${item.allergen}`}
                          icon={Trash2}
                          variant="quiet"
                          size="sm"
                          onClick={() => setRemoving({ kind: 'allergy', id: item.id, name: item.allergen })}
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </div>

            <div className="rounded-card3 border border-sand-200 bg-bone-sunken/70 px-5 py-4">
              <p className="text-b3 leading-relaxed text-sand-700">
                <span className="font-semibold text-sand-950">Why this matters. </span>
                Conditions and allergies are the context behind every other number in your record.
                They are what the interaction checks read before they tell you a combination is safe.
              </p>
            </div>
          </>
        )}
      </Page>

      <Dialog
        open={Boolean(removing)}
        onClose={() => setRemoving(null)}
        title={removing ? `Remove ${removing.name}?` : ''}
        description={
          removing?.kind === 'condition'
            ? 'It will be removed from your history and from what your doctor sees.'
            : 'It will be removed from your allergies and from the interaction checks.'
        }
        footer={
          <>
            <Button variant="vellum" onClick={() => setRemoving(null)}>
              Keep it
            </Button>
            <Button variant="critical" loading={removePending} onClick={remove}>
              Remove
            </Button>
          </>
        }
      />

      <Toast toast={toast} onClose={clear} />
    </AppShell>
  );
};

export default MedicalHistory;
