# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Three roles, one shared record:
- **Patients** — manage their own health data: vitals, medications, medical history, lab reports, appointments, and a conversational AI assistant. Situation: checking in on their own condition between clinical visits, often on mobile.
- **Doctors** — review the patients assigned to them: vitals trends, clinical notes, DDI (drug-drug interaction) warnings, risk scores. Situation: fast clinical review, desktop-first but must not break on a tablet.
- **Admins** — system oversight: user management, HIPAA-anonymized data export for research/reporting.

## Product Purpose

Health Sync AI is a personalized "digital twin" health platform: it centralizes a patient's medical history, lab reports, prescriptions, vitals, and allergies into one structured record, and layers a safety-aware AI assistant that reasons over that authorized context. Success = each role can trust and act on what they see quickly, without the interface getting in the way of clinical meaning.

## Positioning

Not just a records viewer — it runs real clinical logic over the data: a drug-drug interaction (DDI) safety engine, an ACC/AHA ASCVD 10-year cardiovascular risk engine, a DL-based vitals risk classifier, FHIR R4 export, an organ-systems heatmap, and HIPAA-compliant anonymized exports. The AI assistant has a safety-interception layer that refuses unsafe requests (e.g. dosage changes, emergency triage) rather than answering them directly — this is a deliberate, visible product principle, not a limitation to hide.

## Operating Context

Runs as a local two-process app (FastAPI backend + React/Vite frontend) with JWT auth and 1-click demo logins for each role. Core flows: streaming/reviewing vitals, managing medications (with live DDI checking), uploading and reading lab reports, viewing a health event timeline, booking appointments, and chatting with the AI assistant. Doctors work from an assigned-patient list; admins work from a system-wide, de-identified view.

## Capabilities and Constraints

- Built and currently operated as an academic major-project prototype, using seeded/demo data rather than live patient data — this is a real, working system (backend verified, full test suite passing), not a mockup, but it is not deployed for real clinical use.
- Backend: FastAPI + SQLite. Frontend: React 18 + Vite + Tailwind CSS, `react-router-dom`, `recharts` for charts, `lucide-react` already installed for icons, `axios` for API calls.
- No billing/payments, no real customer accounts, no real clinical certifications — must not be fabricated in copy.

## Brand Commitments

- Name stays **Health Sync AI** (used consistently across app UI, README, and demo/report materials).
- Logomark is being refreshed as part of this redesign (moving off the current pulse-wave icon), but the name and "Personalized Digital Twin" positioning line stay.

## Evidence on Hand

- Real, working demo accounts: patient, doctor, admin — backed by a real seeded SQLite database and a passing backend test suite (auth, DDI interaction detection, vitals thresholds, FHIR export, ASCVD scoring, HIPAA anonymization, doctor/patient access isolation).
- No real testimonials, press, customer logos, or pricing exist — future work must not invent them.
- Academic-project disclosure ("academic major project prototype") is factual and must remain present, but per product decision below, should not dominate the visual hierarchy.

## Product Principles

1. **Safety is visible, not hidden.** The AI assistant's refusals and disclaimers are a trust feature — surface them clearly rather than softening them away.
2. **Clinical credibility over decoration.** Risk scores, confidence percentages, and guideline citations (e.g. "2018 AHA/ACC Guideline") are the product's core value — they must read as precise and legible, never buried under visual flourish.
3. **Role-appropriate density.** Patients need calm, plain-language framing of their own data; doctors need fast, scannable, information-dense views of assigned patients; admins need system-level clarity. Same design system, different information architecture per role.
4. **Honest framing.** This is a real prototype with real logic behind it, not a live clinical product — the design should read as a polished, premium real product (per product decision), while the academic-project disclosure stays present but small and honest, not the visual centerpiece.
5. **Calm reliability.** This is a health monitoring context — motion, color, and emphasis should feel steady and trustworthy, not gamified or attention-grabbing.

## Accessibility & Inclusion

No specific mandated standard confirmed; general good-practice accessibility applies (contrast, keyboard navigation, legible type at data-dense clinical screens), which matters more than usual here given the health-data context and older/less technical potential users (patient role).
