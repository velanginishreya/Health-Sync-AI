const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const NONE = 'Not recorded';

export const parseDate = (value) => {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  const s = String(value);
  const d = new Date(s.length === 10 ? `${s}T00:00:00` : s);
  return Number.isNaN(d.getTime()) ? null : d;
};

export const fmtDate = (value) => {
  const d = parseDate(value);
  if (!d) return NONE;
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

export const fmtDateShort = (value) => {
  const d = parseDate(value);
  if (!d) return NONE;
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
};

export const fmtDateTime = (value) => {
  const d = parseDate(value);
  if (!d) return NONE;
  let h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, '0');
  const suffix = h >= 12 ? 'pm' : 'am';
  h = h % 12 || 12;
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}, ${h}:${m} ${suffix}`;
};

export const fmtNumber = (value, fallback = NONE) => {
  if (value === null || value === undefined || value === '') return fallback;
  const n = Number(value);
  if (Number.isNaN(n)) return String(value);
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
};

export const fmtPercent = (value) => (value === null || value === undefined ? NONE : `${fmtNumber(value)}%`);

export const fmtCount = (n, singular, plural) => `${n} ${n === 1 ? singular : plural || `${singular}s`}`;

/** 1450 -> '1.4k'. For axis ticks and tight tiles only, never clinical values. */
export const fmtCompact = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return NONE;
  if (Math.abs(n) < 1000) return String(Math.round(n));
  if (Math.abs(n) < 10000) return `${(n / 1000).toFixed(1)}k`;
  return `${Math.round(n / 1000)}k`;
};

/** 'LAB_REPORT' -> 'Lab report'  |  'HIGH' -> 'High' */
export const humanize = (value) =>
  String(value || '')
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/^\w/, (c) => c.toUpperCase());

export const initials = (name) =>
  String(name || '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('');

/** '138/88' -> { systolic: '138', diastolic: '88' } */
export const bpParts = (bp) => {
  const [systolic, diastolic] = String(bp || '').split('/');
  return { systolic: systolic || NONE, diastolic: diastolic || '' };
};

/** Whole-day distance from today: -1 = yesterday, 0 = today, 2 = in two days. */
export const dayDelta = (value) => {
  const d = parseDate(value);
  if (!d) return null;
  const today = new Date();
  const a = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  const b = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  return Math.round((b - a) / 86400000);
};

/** 'Today' | 'Tomorrow' | 'In 4 days' | '3 days ago' | null */
export const relativeDay = (value) => {
  const delta = dayDelta(value);
  if (delta === null) return null;
  if (delta === 0) return 'Today';
  if (delta === 1) return 'Tomorrow';
  if (delta === -1) return 'Yesterday';
  if (delta > 1) return `In ${delta} days`;
  return `${Math.abs(delta)} days ago`;
};

export const greeting = (date = new Date()) => {
  const h = date.getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

export const todayLine = (date = new Date()) =>
  `${DAYS[date.getDay()]}, ${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;

/** '2026-09-10' -> '2026-09-10' (ISO, for <input type="date"> and sorting). */
export const isoDay = (value = new Date()) => {
  const d = value instanceof Date ? value : parseDate(value);
  if (!d) return '';
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
};
