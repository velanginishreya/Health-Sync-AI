/*
  One vocabulary for clinical state in /v3.

  v2 shipped six divergent mappings of the same strings (a MINOR interaction was
  amber on one page and gray on another; an ABNORMAL lab rendered green because the
  page only checked for HIGH/LOW). Every /v3 surface reads its tone from here, so a
  value means one colour, one icon, one label everywhere in the product.

  Two separate channels, never mixed:
  - clinicalTone()  real clinical state -> sig (good / watch / critical). Reserved.
  - categoryTone()  event and record types -> tint only (petrol / dusk / sand).
                    Categories are never allowed to use a clinical colour.
*/

const CLINICAL = {
  // lab result status
  NORMAL: 'good',
  HIGH: 'watch',
  LOW: 'watch',
  BORDERLINE: 'watch',
  ABNORMAL: 'critical',
  // medication status
  ACTIVE: 'good',
  STOPPED: 'neutral',
  DISCONTINUED: 'neutral',
  COMPLETED: 'neutral',
  PAUSED: 'watch',
  // condition status
  CHRONIC: 'watch',
  RESOLVED: 'good',
  UNKNOWN: 'neutral',
  // appointment status
  SCHEDULED: 'info',
  CANCELLED: 'neutral',
  // DDI severity
  HIGH_RISK: 'critical',
  MODERATE: 'watch',
  MINOR: 'neutral',
  // allergy severity
  SEVERE: 'critical',
  MILD: 'neutral',
  // insight + DL severity
  INFO: 'info',
  LOW_RISK: 'neutral',
  // organ systems
  GUARDED: 'watch',
  // FHIR / generic
  NONE: 'neutral',
};

/** Severity strings that collide across domains are disambiguated by an optional
    domain argument: clinicalTone('HIGH', 'ddi') vs clinicalTone('HIGH', 'lab'). */
const DOMAIN_OVERRIDES = {
  ddi: { HIGH: 'critical', MODERATE: 'watch', MINOR: 'neutral' },
  allergy: { SEVERE: 'critical', MODERATE: 'watch', MILD: 'neutral' },
  insight: { HIGH: 'critical', MODERATE: 'watch', LOW: 'neutral', INFO: 'info' },
  vitals: { MODERATE: 'watch', HIGH: 'critical', INFO: 'info' },
};

export const clinicalTone = (value, domain) => {
  const key = String(value || '').toUpperCase().trim();
  if (domain && DOMAIN_OVERRIDES[domain]?.[key]) return DOMAIN_OVERRIDES[domain][key];
  return CLINICAL[key] || 'neutral';
};

/** Event and record categories: visual tint only, never sig colours. */
const CATEGORY = {
  DIAGNOSIS: 'petrol',
  LAB_REPORT: 'petrol',
  MEDICATION: 'sand',
  VITAL: 'petrol',
  APPOINTMENT: 'dusk',
  PRESCRIPTION: 'sand',
  AI_INSIGHT: 'dusk',
  DOCTOR_NOTE: 'sand',
};

export const categoryTone = (eventType) => CATEGORY[String(eventType || '').toUpperCase()] || 'sand';

/** Plain-language labels for the values we most often print. */
export const toneLabel = {
  good: 'In range',
  watch: 'Watch',
  critical: 'Needs attention',
  info: 'Scheduled',
  neutral: 'On file',
};

/** Compact human labels for lab statuses, so users never read raw enums. */
export const labStatusLabel = (status) => {
  const key = String(status || '').toUpperCase();
  if (key === 'NORMAL') return 'In range';
  if (key === 'HIGH') return 'Above range';
  if (key === 'LOW') return 'Below range';
  if (key === 'ABNORMAL') return 'Review';
  if (key === 'BORDERLINE') return 'Borderline';
  return 'On file';
};

export const medicationStatusLabel = (status) => {
  const key = String(status || '').toUpperCase();
  if (key === 'ACTIVE') return 'Taking now';
  if (key === 'STOPPED') return 'Stopped';
  if (key === 'DISCONTINUED') return 'Stopped';
  if (key === 'COMPLETED') return 'Finished';
  return 'On file';
};

export const appointmentStatusLabel = (status) => {
  const key = String(status || '').toUpperCase();
  if (key === 'SCHEDULED') return 'Scheduled';
  if (key === 'COMPLETED') return 'Completed';
  if (key === 'CANCELLED') return 'Cancelled';
  return 'On file';
};

export const ddiLabel = (severity) => {
  const key = String(severity || '').toUpperCase();
  if (key === 'HIGH') return 'Serious interaction';
  if (key === 'MODERATE') return 'Moderate interaction';
  if (key === 'MINOR') return 'Minor note';
  return 'Interaction';
};

/** One palette for charts, product-wide. Recharts has no theme system. */
export const CHART = {
  petrol: '#0E5F66',
  petrolSoft: '#77B8BB',
  watch: '#A8701A',
  critical: '#B3261E',
  good: '#1E7A4D',
  grid: 'rgba(20, 18, 16, 0.08)',
  gridDusk: 'rgba(255, 255, 255, 0.10)',
  axis: '#8E8674',
  axisDusk: '#8BA0A0',
  band: 'rgba(23, 118, 124, 0.10)',
  bandLine: 'rgba(23, 118, 124, 0.35)',
  surface: '#FFFDF8',
  surfaceDusk: '#0E1B1E',
  ink: '#23201A',
  inkDusk: '#F0EDE3',
};
