# API Specification — Health Sync AI

Base URL: `/api/v1`

## 1. Authentication (`/auth`)
- `POST /auth/register`: Register patient/doctor account.
- `POST /auth/login`: Return JWT token, user role, user ID.
- `GET /auth/me`: Get authenticated user profile.
- `POST /auth/logout`: Log out user.

## 2. Patient Digital Twin (`/patients/me`)
- `GET /patients/me`: Get profile metadata.
- `PUT /patients/me`: Update height, weight, lifestyle.
- `GET /patients/me/digital-twin`: Assembles full structured Digital Twin JSON context.
- `GET /patients/me/medical-history`: List medical conditions.
- `POST /patients/me/medical-history`: Add new medical condition.
- `GET /patients/me/allergies`: List allergies.
- `POST /patients/me/allergies`: Add allergy.

## 3. Medications (`/patients/me/medications`)
- `GET /patients/me/medications`: List active/past prescribed medications.
- `POST /patients/me/medications`: Add new medication.
- `POST /patients/me/medications/{id}/stop`: Mark medication as stopped.

## 4. Vitals & Analytics (`/patients/me/vitals`)
- `GET /patients/me/vitals`: List recent vitals.
- `POST /patients/me/vitals`: Log new vital reading (BP, HR, SpO2, Glucose).
- `GET /patients/me/vitals/trends`: Formatted time-series data for Recharts.

## 5. Lab Reports (`/patients/me/reports`)
- `POST /patients/me/reports/upload`: Upload PDF report, extract text & structured test parameters.
- `GET /patients/me/reports`: List uploaded lab reports.
- `GET /patients/me/reports/{id}`: Detailed report view with extracted test parameters.

## 6. AI Health Assistant (`/ai`)
- `POST /ai/chat`: Send message, retrieve RAG context, evaluate safety, return response + explainable `context_used`.
- `GET /ai/conversations`: List user AI conversations.
- `GET /ai/conversations/{id}`: Get conversation message stream.

## 7. Doctor Workspace (`/doctor`)
- `GET /doctor/patients`: List assigned patients.
- `GET /doctor/patients/{id}`: Inspect assigned patient Digital Twin (Returns 403 Forbidden if unassigned).
- `GET /doctor/patients/{id}/summary`: Generate AI patient summary for doctors.
- `POST /doctor/patients/{id}/notes`: Add clinical note.

## 8. Admin Workspace (`/admin`)
- `GET /admin/stats`: Get system overview metrics.
- `GET /admin/users`: List all users.
- `POST /admin/assign-patient`: Assign patient to doctor.
- `GET /admin/audit-logs`: Inspect security audit logs.
