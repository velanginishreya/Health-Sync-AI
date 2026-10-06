/** The three demo accounts. One source, imported by Home and Login (v2 kept two
    copies that drifted). Credentials match scripts/seed_database.py. */
export const DEMO_ACCOUNTS = [
  {
    role: 'PATIENT',
    label: 'Patient',
    name: 'Arjun Kumar',
    blurb: 'See the record the way a patient does: readings, medicines, reports, and the assistant.',
    email: 'patient@healthsync.demo',
    password: 'Patient@123',
  },
  {
    role: 'DOCTOR',
    label: 'Doctor',
    name: 'Dr. Robert Smith',
    blurb: 'See the assigned-patient roster, risk context, and the clinical note flow.',
    email: 'doctor@healthsync.demo',
    password: 'Doctor@123',
  },
  {
    role: 'ADMIN',
    label: 'Admin',
    name: 'Priya Nair',
    blurb: 'See system numbers, the append-only audit trail, and the de-identified export.',
    email: 'admin@healthsync.demo',
    password: 'Admin@123',
  },
];
