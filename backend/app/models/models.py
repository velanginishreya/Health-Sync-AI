import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text, JSON, Enum as SQLEnum
from sqlalchemy.orm import relationship
import enum
from app.db.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class UserRole(str, enum.Enum):
    PATIENT = "PATIENT"
    DOCTOR = "DOCTOR"
    ADMIN = "ADMIN"

class ConditionStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    RESOLVED = "RESOLVED"
    CHRONIC = "CHRONIC"
    UNKNOWN = "UNKNOWN"

class EventType(str, enum.Enum):
    DIAGNOSIS = "DIAGNOSIS"
    LAB_REPORT = "LAB_REPORT"
    MEDICATION = "MEDICATION"
    VITAL = "VITAL"
    APPOINTMENT = "APPOINTMENT"
    PRESCRIPTION = "PRESCRIPTION"
    AI_INSIGHT = "AI_INSIGHT"
    DOCTOR_NOTE = "DOCTOR_NOTE"

class AppointmentStatus(str, enum.Enum):
    SCHEDULED = "SCHEDULED"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"

class InsightSeverity(str, enum.Enum):
    INFO = "INFO"
    LOW = "LOW"
    MODERATE = "MODERATE"
    HIGH = "HIGH"

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(SQLEnum(UserRole), nullable=False, default=UserRole.PATIENT)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    phone = Column(String(50), nullable=True)
    date_of_birth = Column(String(20), nullable=True) # YYYY-MM-DD
    gender = Column(String(20), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    profile = relationship("PatientProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    doctor_assignments = relationship("DoctorPatient", foreign_keys="DoctorPatient.doctor_id", back_populates="doctor")
    audit_logs = relationship("AuditLog", back_populates="user")

class PatientProfile(Base):
    __tablename__ = "patient_profiles"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), unique=True, nullable=False)
    blood_group = Column(String(10), nullable=True)
    height = Column(Float, nullable=True) # in cm
    weight = Column(Float, nullable=True) # in kg
    emergency_contact = Column(String(255), nullable=True)
    occupation = Column(String(100), nullable=True)
    location = Column(String(100), nullable=True)
    lifestyle = Column(JSON, nullable=True) # e.g. {"diet": "vegetarian", "exercise": "3x week", "smoking": "no"}
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="profile")
    medical_histories = relationship("MedicalHistory", back_populates="patient", cascade="all, delete-orphan")
    family_histories = relationship("FamilyHistory", back_populates="patient", cascade="all, delete-orphan")
    allergies = relationship("Allergy", back_populates="patient", cascade="all, delete-orphan")
    medications = relationship("Medication", back_populates="patient", cascade="all, delete-orphan")
    vitals = relationship("Vital", back_populates="patient", cascade="all, delete-orphan")
    lab_reports = relationship("LabReport", back_populates="patient", cascade="all, delete-orphan")
    prescriptions = relationship("Prescription", back_populates="patient", cascade="all, delete-orphan")
    health_events = relationship("HealthEvent", back_populates="patient", cascade="all, delete-orphan")
    appointments = relationship("Appointment", back_populates="patient", cascade="all, delete-orphan")
    doctor_assignments = relationship("DoctorPatient", foreign_keys="DoctorPatient.patient_id", back_populates="patient")
    conversations = relationship("AIConversation", back_populates="patient", cascade="all, delete-orphan")
    insights = relationship("AIInsight", back_populates="patient", cascade="all, delete-orphan")

class MedicalHistory(Base):
    __tablename__ = "medical_history"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    patient_id = Column(String(36), ForeignKey("patient_profiles.id"), nullable=False)
    condition_name = Column(String(255), nullable=False)
    diagnosis_date = Column(String(20), nullable=True)
    status = Column(SQLEnum(ConditionStatus), default=ConditionStatus.ACTIVE)
    description = Column(Text, nullable=True)
    source = Column(String(100), default="patient_reported")
    created_at = Column(DateTime, default=datetime.utcnow)

    patient = relationship("PatientProfile", back_populates="medical_histories")

class FamilyHistory(Base):
    __tablename__ = "family_history"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    patient_id = Column(String(36), ForeignKey("patient_profiles.id"), nullable=False)
    relation = Column(String(100), nullable=False) # e.g. Father, Mother
    condition = Column(String(255), nullable=False)
    age_at_diagnosis = Column(Integer, nullable=True)
    notes = Column(Text, nullable=True)

    patient = relationship("PatientProfile", back_populates="family_histories")

class Allergy(Base):
    __tablename__ = "allergies"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    patient_id = Column(String(36), ForeignKey("patient_profiles.id"), nullable=False)
    allergen = Column(String(255), nullable=False)
    reaction = Column(String(255), nullable=True)
    severity = Column(String(50), default="Moderate") # Mild, Moderate, Severe
    notes = Column(Text, nullable=True)

    patient = relationship("PatientProfile", back_populates="allergies")

class Medication(Base):
    __tablename__ = "medications"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    patient_id = Column(String(36), ForeignKey("patient_profiles.id"), nullable=False)
    name = Column(String(255), nullable=False)
    dosage = Column(String(100), nullable=False)
    frequency = Column(String(100), nullable=False)
    route = Column(String(50), default="Oral")
    start_date = Column(String(20), nullable=True)
    end_date = Column(String(20), nullable=True)
    prescribed_by = Column(String(255), nullable=True)
    status = Column(String(50), default="ACTIVE") # ACTIVE, STOPPED, COMPLETED
    notes = Column(Text, nullable=True)

    patient = relationship("PatientProfile", back_populates="medications")

class Vital(Base):
    __tablename__ = "vitals"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    patient_id = Column(String(36), ForeignKey("patient_profiles.id"), nullable=False)
    recorded_at = Column(DateTime, default=datetime.utcnow)
    heart_rate = Column(Float, nullable=True)
    systolic_bp = Column(Float, nullable=True)
    diastolic_bp = Column(Float, nullable=True)
    spo2 = Column(Float, nullable=True)
    temperature = Column(Float, nullable=True)
    weight = Column(Float, nullable=True)
    blood_glucose = Column(Float, nullable=True)
    respiratory_rate = Column(Float, nullable=True)
    source = Column(String(100), default="manual_entry")

    patient = relationship("PatientProfile", back_populates="vitals")

class LabReport(Base):
    __tablename__ = "lab_reports"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    patient_id = Column(String(36), ForeignKey("patient_profiles.id"), nullable=False)
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    report_date = Column(String(20), nullable=True)
    report_type = Column(String(100), default="General") # CBC, Lipid, Metabolic, etc.
    extracted_text = Column(Text, nullable=True)
    processing_status = Column(String(50), default="COMPLETED") # PENDING, COMPLETED, FAILED
    created_at = Column(DateTime, default=datetime.utcnow)

    patient = relationship("PatientProfile", back_populates="lab_reports")
    results = relationship("LabResult", back_populates="report", cascade="all, delete-orphan")

class LabResult(Base):
    __tablename__ = "lab_results"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    report_id = Column(String(36), ForeignKey("lab_reports.id"), nullable=False)
    test_name = Column(String(255), nullable=False)
    value = Column(Float, nullable=True)
    unit = Column(String(50), nullable=True)
    reference_range = Column(String(100), nullable=True)
    status = Column(String(50), default="NORMAL") # NORMAL, HIGH, LOW, ABNORMAL
    confidence = Column(String(50), default="HIGH")

    report = relationship("LabReport", back_populates="results")

class Prescription(Base):
    __tablename__ = "prescriptions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    patient_id = Column(String(36), ForeignKey("patient_profiles.id"), nullable=False)
    file_path = Column(String(500), nullable=False)
    prescription_date = Column(String(20), nullable=True)
    doctor_name = Column(String(255), nullable=True)
    extracted_text = Column(Text, nullable=True)
    processing_status = Column(String(50), default="COMPLETED")

    patient = relationship("PatientProfile", back_populates="prescriptions")

class HealthEvent(Base):
    __tablename__ = "health_events"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    patient_id = Column(String(36), ForeignKey("patient_profiles.id"), nullable=False)
    event_type = Column(SQLEnum(EventType), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    event_date = Column(String(20), nullable=False)
    source = Column(String(100), default="system")
    created_at = Column(DateTime, default=datetime.utcnow)

    patient = relationship("PatientProfile", back_populates="health_events")

class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    patient_id = Column(String(36), ForeignKey("patient_profiles.id"), nullable=False)
    doctor_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    appointment_date = Column(String(20), nullable=False)
    appointment_time = Column(String(20), nullable=False)
    reason = Column(String(255), nullable=True)
    status = Column(SQLEnum(AppointmentStatus), default=AppointmentStatus.SCHEDULED)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    patient = relationship("PatientProfile", back_populates="appointments")
    doctor = relationship("User", foreign_keys=[doctor_id])

class DoctorPatient(Base):
    __tablename__ = "doctor_patient"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    doctor_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    patient_id = Column(String(36), ForeignKey("patient_profiles.id"), nullable=False)
    assigned_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String(50), default="ACTIVE")

    doctor = relationship("User", foreign_keys=[doctor_id], back_populates="doctor_assignments")
    patient = relationship("PatientProfile", back_populates="doctor_assignments")

class AIConversation(Base):
    __tablename__ = "ai_conversations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    patient_id = Column(String(36), ForeignKey("patient_profiles.id"), nullable=False)
    title = Column(String(255), default="Health Sync Chat")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    patient = relationship("PatientProfile", back_populates="conversations")
    messages = relationship("AIMessage", back_populates="conversation", cascade="all, delete-orphan")

class AIMessage(Base):
    __tablename__ = "ai_messages"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    conversation_id = Column(String(36), ForeignKey("ai_conversations.id"), nullable=False)
    role = Column(String(20), nullable=False) # user, assistant, system
    content = Column(Text, nullable=False)
    context_used = Column(JSON, nullable=True) # explainability sources used
    created_at = Column(DateTime, default=datetime.utcnow)

    conversation = relationship("AIConversation", back_populates="messages")

class AIInsight(Base):
    __tablename__ = "ai_insights"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    patient_id = Column(String(36), ForeignKey("patient_profiles.id"), nullable=False)
    insight_type = Column(String(100), nullable=False) # BP_TREND, MISSING_MEDS, ABNORMAL_LAB, etc.
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    severity = Column(SQLEnum(InsightSeverity), default=InsightSeverity.INFO)
    confidence = Column(Float, default=0.9)
    source = Column(String(100), default="RiskAnalysisService")
    dismissed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    patient = relationship("PatientProfile", back_populates="insights")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    action = Column(String(100), nullable=False)
    resource_type = Column(String(100), nullable=False)
    resource_id = Column(String(100), nullable=True)
    ip_address = Column(String(50), nullable=True)
    metadata_json = Column(JSON, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="audit_logs")
