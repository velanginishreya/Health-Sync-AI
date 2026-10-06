# Security & Privacy Architecture — Health Sync AI

Health Sync AI implements strict multi-layered security and data privacy controls:

## 1. Authentication & Session Management
- **Passwords**: Hashed with `bcrypt` (salting + key stretching). Plaintext passwords are never logged or stored.
- **Tokens**: Stateless JSON Web Tokens (JWT) signed using `HS256` with expiration and secret key configuration via environment variables.

## 2. Role-Based Access Control (RBAC) & Data Isolation
- **Patient Isolation**: Patient A cannot access `/patients/me` or `/patients/{id}` belonging to Patient B. Backend dependency verifies `current_user.id == profile.user_id`.
- **Doctor Assignment Constraint**: Doctor A cannot access Patient B's Digital Twin unless an active `DoctorPatient` assignment record exists in the database. Returns `403 Forbidden` on unauthorized attempts.
- **Automated Tests**: Verified by `backend/tests/test_security_isolation.py`.

## 3. AI Safety & Privacy Layer
- **Minimum Necessary Context**: The RAG engine filters out unnecessary history, sending only relevant parameters to LLM providers.
- **Emergency Intercept**: Keywords like chest pain, stroke, or self-harm trigger immediate emergency overrides advising regional emergency numbers (911 / 112).
- **Dosage Alteration Refusal**: Automatic rejection of requests to change medication doses, double up on drugs, or stop prescribed treatments.
- **Non-Diagnostic Policy**: Prevents AI from issuing autonomous medical diagnoses.
- **Mandatory Disclaimer**: Every response appends a standardized educational disclaimer.

## 4. Audit Logging
Every sensitive action (`LOGIN`, `LOGOUT`, `VIEW_PATIENT`, `UPLOAD_REPORT`, `VIEW_REPORT`, `AI_REQUEST`, `PROFILE_UPDATE`, `DOCTOR_DATA_ACCESS`) is logged to the `audit_logs` table with user ID, resource ID, IP address, and timestamp.
