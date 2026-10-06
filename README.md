# Health Sync AI 🏥🤖

> **AI-Powered Personalized Digital Twin for Patient Health Management**  
> *Project Type: Academic B.Tech Major Project Prototype*  
> *Domain: Healthcare + Generative AI + Digital Twin + RAG + Clinical Decision Support*

---

## 🌟 Overview

Traditional healthcare applications store patient data in disconnected silos—medical history in one app, lab report PDFs on disk, vital trends on wearables, and prescriptions in papers. Generic AI health assistants provide generic responses because they lack structured access to a patient's complete health history.

**Health Sync AI** solves this problem by dynamically constructing a structured **Patient Digital Twin** (medical conditions, active medications, allergies, vital trends, laboratory parameters, lifestyle data, and chronological health events). An AI Health Assistant uses this authorized context to provide personalized, explainable, and safety-aware health information.

> ⚠️ **Important Safety Requirement**: Health Sync AI is an academic clinical decision-support prototype. It **does NOT diagnose diseases, replace medical doctors, alter dosages, or prescribe medications**.

---

## 🚀 Key Features

1. **Patient Digital Twin Context Builder**: Dynamic aggregation of authorized patient context into structured JSON graphs.
2. **Document Intelligence & OCR**: PDF parsing and structured parameter extraction for lab reports (CBC, Lipid Panel, Metabolic Panel, Thyroid) and prescriptions using PyMuPDF, pdfplumber, and pytesseract.
3. **Retrieval-Augmented Generation (RAG)**: Minimum necessary context retrieval engine enforcing data privacy and context trimming.
4. **Explainable AI (USP)**: Real-time side panel showing exact **"Context Used"** data sources backing every AI response.
5. **AI Safety Layer & Intercepts**: Pre-LLM and post-LLM filters detecting emergency symptoms, refusing dosage modification requests, blocking direct diagnostic claims, and injecting mandatory disclaimers.
6. **Vitals Analytics & Recharts**: Interactive longitudinal trend charts for Blood Pressure, Heart Rate, SpO2, and Blood Glucose.
7. **Role-Based Access Control (RBAC)**: Strict data isolation ensuring Patient A cannot access Patient B (`403 Forbidden`) and Doctors can only access assigned patients.
8. **Doctor Workspace**: AI-generated patient summaries for clinical decision support, Digital Twin inspection, and clinical notes.
9. **Admin & Audit Logging**: System statistics, patient-doctor care assignment tool, and security audit log tracking.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Recharts, Axios, React Router v6
- **Backend**: Python 3.11+, FastAPI, SQLAlchemy, Pydantic v2, PyJWT, Passlib / Bcrypt
- **Database**: Supabase PostgreSQL / SQLite zero-config local default
- **Document AI**: PyMuPDF (`fitz`), pdfplumber, ReportLab
- **AI & RAG**: Abstract `LLMProvider` (Gemini, OpenAI, Claude, and Fallback Engine)

---

## 🔑 Demo Accounts (1-Click Quick Login)

The system comes pre-seeded with synthetic demo data including **Arjun Kumar** (45yo male with Type 2 Diabetes, Hypertension, elevated BP trends, and PDF lab reports):

| Role | Email | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **Patient (Arjun Kumar)** | `patient@healthsync.demo` | `Patient@123` | Digital Twin, Upload Reports, AI Assistant, Vitals, Medications |
| **Patient (Alias)** | `arjun@healthsync.demo` | `Patient@123` | Digital Twin, Upload Reports, AI Assistant, Vitals, Medications |
| **Doctor (Dr. Robert Smith)** | `doctor@healthsync.demo` | `Doctor@123` | View assigned patients, AI Clinical Summaries, Notes |
| **Admin (System Admin)** | `admin@healthsync.demo` | `Admin@123` | System metrics, Assign care, Security Audit Logs |

---

## 💻 Quick Start Guide

### 1. Backend Setup

```bash
# Navigate to repository root
cd major

# Install dependencies
pip install -r backend/requirements.txt

# Seed synthetic database & demo lab PDF reports
python scripts/seed_database.py

# Start FastAPI backend server
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload --app-dir backend
```

Backend Swagger API Docs will be live at `http://127.0.0.1:8000/docs`.

### 2. Frontend Setup

In a new terminal window:

```bash
cd major/frontend

# Install npm packages
npm install

# Start Vite React dev server
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 🧪 Running Automated Tests

Run backend pytest suite verifying Auth, Data Isolation, Digital Twin Context, and AI Safety Intercepts:

```bash
pytest backend/tests
```

All 8 test suites pass out-of-the-box.

---

## 📁 Repository Structure

```
health-sync-ai/
├── backend/
│   ├── app/
│   │   ├── api/          # REST API Routers (Auth, Patients, Reports, Vitals, AI, Doctor, Admin)
│   │   ├── db/           # SQLAlchemy & Supabase Database setup
│   │   ├── models/       # Declarative ORM entities
│   │   ├── schemas/      # Pydantic v2 validation models
│   │   ├── services/     # DigitalTwinService, DocumentProcessor, SafetyService, RAGService, RiskAnalysis
│   │   └── utils/        # Auth & JWT utilities
│   ├── tests/            # Pytest test suite
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/   # Navbar, Sidebar, DemoBanner
│   │   ├── contexts/     # AuthContext
│   │   ├── pages/        # Patient, Doctor, Admin, and Public pages
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
├── scripts/
│   ├── seed_database.py       # Main database seeder
│   ├── generate_demo_reports.py# Synthetic PDF report generator
│   └── import_synthea.py      # Synthea CSV importer
├── docs/                 # Architecture, API, and Security documentation
├── DATASETS.md           # Dataset licenses & privacy policies
├── .env.example
└── README.md
```

---

## 📄 License & Disclaimer

Academic Major Project. Licensed under MIT.  
*Disclaimer: Health Sync AI is designed for informational and educational purposes only. It is not an autonomous diagnostic system and does not replace professional medical evaluation.*
