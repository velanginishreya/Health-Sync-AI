# Architecture Documentation — Health Sync AI

Health Sync AI is built on a full-stack, modular architecture designed for clinical decision-support:

```
┌─────────────────────────────────────────────────────────┐
│                 React + Vite Frontend                   │
│   (Patient Dashboard, Digital Twin Map, AI Chat UI,     │
│    Recharts Vitals Trends, Doctor & Admin Portals)      │
└────────────────────────────┬────────────────────────────┘
                             │ REST / JSON API (JWT Auth)
┌────────────────────────────▼────────────────────────────┐
│                    FastAPI Backend                      │
├─────────────────────────────────────────────────────────┤
│ Services:                                               │
│  - DigitalTwinService (Dynamic context graph builder)   │
│  - DocumentProcessor (PDF parsing, OCR, lab parameters) │
│  - RAGService (Minimum necessary context retrieval)     │
│  - LLMProvider (Gemini / OpenAI / Claude / Fallback)    │
│  - SafetyService (Emergency checks & safety layer)      │
│  - RiskAnalysisService (Rule-based trend analytics)     │
│  - AuditService (Security access logging)               │
└────────────────────────────┬────────────────────────────┘
                             │ SQLAlchemy ORM
┌────────────────────────────▼────────────────────────────┐
│         Supabase PostgreSQL / SQLite Database           │
│   (Users, Profiles, Vitals, Medications, Lab Reports,   │
│    Timeline Events, Appointments, Audit Logs)           │
└─────────────────────────────────────────────────────────┘
```

## Key Architectural Principles

1. **Digital Twin Context Builder**:
   Dynamic runtime aggregation of authorized patient context into structured JSON objects rather than static, disconnected database rows.

2. **RAG & Minimum Necessary Context**:
   Retreats from sending raw, full database histories to LLM providers. Selects only context relevant to the user query to enforce privacy and minimize token usage.

3. **Safety Layer First**:
   Interprets queries pre-LLM and post-LLM to intercept emergency symptoms, refuse unauthorized dosage modifications, block diagnostic claims, and inject mandatory disclaimers.

4. **Explainable AI**:
   Exposes the `context_used` metadata on the frontend side panel so users can inspect exact source documents backing every AI response.
