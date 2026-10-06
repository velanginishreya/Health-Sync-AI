-- ========================================================
-- HEALTH SYNC AI — SUPABASE POSTGRESQL & PGVECTOR SCHEMA
-- Copy and paste this script into the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/rfgmeongxaacoecikreo/sql
-- ========================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'PATIENT',
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(50),
    date_of_birth VARCHAR(20),
    gender VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Patient Profiles Table
CREATE TABLE IF NOT EXISTS patient_profiles (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    user_id VARCHAR(36) UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    blood_group VARCHAR(10),
    height FLOAT,
    weight FLOAT,
    emergency_contact VARCHAR(255),
    occupation VARCHAR(100),
    location VARCHAR(100),
    lifestyle JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Medical History Table
CREATE TABLE IF NOT EXISTS medical_history (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    patient_id VARCHAR(36) NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    condition_name VARCHAR(255) NOT NULL,
    diagnosis_date VARCHAR(20),
    status VARCHAR(20) DEFAULT 'ACTIVE',
    description TEXT,
    source VARCHAR(100) DEFAULT 'patient_reported',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Family History Table
CREATE TABLE IF NOT EXISTS family_history (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    patient_id VARCHAR(36) NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    relation VARCHAR(100) NOT NULL,
    condition VARCHAR(255) NOT NULL,
    age_at_diagnosis INT,
    notes TEXT
);

-- 5. Allergies Table
CREATE TABLE IF NOT EXISTS allergies (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    patient_id VARCHAR(36) NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    allergen VARCHAR(255) NOT NULL,
    reaction VARCHAR(255),
    severity VARCHAR(50) DEFAULT 'Moderate',
    notes TEXT
);

-- 6. Medications Table
CREATE TABLE IF NOT EXISTS medications (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    patient_id VARCHAR(36) NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100) NOT NULL,
    frequency VARCHAR(100) NOT NULL,
    route VARCHAR(50) DEFAULT 'Oral',
    start_date VARCHAR(20),
    end_date VARCHAR(20),
    prescribed_by VARCHAR(255),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    notes TEXT
);

-- 7. Vitals Table
CREATE TABLE IF NOT EXISTS vitals (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    patient_id VARCHAR(36) NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    heart_rate FLOAT,
    systolic_bp FLOAT,
    diastolic_bp FLOAT,
    spo2 FLOAT,
    temperature FLOAT,
    weight FLOAT,
    blood_glucose FLOAT,
    respiratory_rate FLOAT,
    source VARCHAR(100) DEFAULT 'manual_entry'
);

-- 8. Lab Reports Table
CREATE TABLE IF NOT EXISTS lab_reports (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    patient_id VARCHAR(36) NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    report_date VARCHAR(20),
    report_type VARCHAR(100) DEFAULT 'General',
    extracted_text TEXT,
    processing_status VARCHAR(50) DEFAULT 'COMPLETED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. Lab Results Table
CREATE TABLE IF NOT EXISTS lab_results (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    report_id VARCHAR(36) NOT NULL REFERENCES lab_reports(id) ON DELETE CASCADE,
    test_name VARCHAR(255) NOT NULL,
    value FLOAT,
    unit VARCHAR(50),
    reference_range VARCHAR(100),
    status VARCHAR(50) DEFAULT 'NORMAL',
    confidence VARCHAR(50) DEFAULT 'HIGH'
);

-- 10. Prescriptions Table
CREATE TABLE IF NOT EXISTS prescriptions (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    patient_id VARCHAR(36) NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    file_path VARCHAR(500) NOT NULL,
    prescription_date VARCHAR(20),
    doctor_name VARCHAR(255),
    extracted_text TEXT,
    processing_status VARCHAR(50) DEFAULT 'COMPLETED'
);

-- 11. Health Events Timeline Table
CREATE TABLE IF NOT EXISTS health_events (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    patient_id VARCHAR(36) NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_date VARCHAR(20) NOT NULL,
    source VARCHAR(100) DEFAULT 'system',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 12. Appointments Table
CREATE TABLE IF NOT EXISTS appointments (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    patient_id VARCHAR(36) NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    doctor_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    appointment_date VARCHAR(20) NOT NULL,
    appointment_time VARCHAR(20) NOT NULL,
    reason VARCHAR(255),
    status VARCHAR(50) DEFAULT 'SCHEDULED',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 13. Doctor Patient Assignments Table
CREATE TABLE IF NOT EXISTS doctor_patient (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    doctor_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    patient_id VARCHAR(36) NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'ACTIVE'
);

-- 14. AI Conversations Table
CREATE TABLE IF NOT EXISTS ai_conversations (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    patient_id VARCHAR(36) NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) DEFAULT 'Health Sync Chat',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 15. AI Messages Table
CREATE TABLE IF NOT EXISTS ai_messages (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    conversation_id VARCHAR(36) NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    context_used JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 16. AI Insights Table
CREATE TABLE IF NOT EXISTS ai_insights (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    patient_id VARCHAR(36) NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    insight_type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    severity VARCHAR(20) DEFAULT 'INFO',
    confidence FLOAT DEFAULT 0.9,
    source VARCHAR(100) DEFAULT 'RiskAnalysisService',
    dismissed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 17. Security Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    user_id VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id VARCHAR(100),
    ip_address VARCHAR(50),
    metadata_json JSONB,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 18. Supabase PgVector Embeddings Table
CREATE TABLE IF NOT EXISTS patient_vector_embeddings (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    patient_id VARCHAR(36) NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    metadata JSONB,
    embedding vector(384),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cosine Similarity Vector Retrieval Function for RAG
CREATE OR REPLACE FUNCTION match_patient_embeddings(
    query_embedding vector(384),
    match_threshold float,
    match_count int,
    target_patient_id text
)
RETURNS TABLE (
    id text,
    content text,
    metadata jsonb,
    similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        patient_vector_embeddings.id,
        patient_vector_embeddings.content,
        patient_vector_embeddings.metadata,
        (1 - (patient_vector_embeddings.embedding <=> query_embedding))::float AS similarity
    FROM patient_vector_embeddings
    WHERE patient_vector_embeddings.patient_id = target_patient_id
      AND (1 - (patient_vector_embeddings.embedding <=> query_embedding)) > match_threshold
    ORDER BY patient_vector_embeddings.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- Indexes for maximum query performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_patient_user_id ON patient_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_vitals_patient ON vitals(patient_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_lab_reports_patient ON lab_reports(patient_id);
CREATE INDEX IF NOT EXISTS idx_health_events_patient ON health_events(patient_id, event_date DESC);
CREATE INDEX IF NOT EXISTS idx_doctor_patient ON doctor_patient(doctor_id, patient_id);
CREATE INDEX IF NOT EXISTS idx_embeddings_patient ON patient_vector_embeddings(patient_id);
