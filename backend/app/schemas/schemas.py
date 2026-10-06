from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Any, Dict
from datetime import datetime
from app.models.models import UserRole, ConditionStatus, EventType, AppointmentStatus, InsightSeverity

# Auth Schemas
class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    first_name: str
    last_name: str
    role: UserRole = UserRole.PATIENT
    phone: Optional[str] = None
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    user_id: str
    name: str

class UserOut(BaseModel):
    id: str
    email: EmailStr
    role: UserRole
    first_name: str
    last_name: str
    phone: Optional[str] = None
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Patient Profile Schemas
class PatientProfileBase(BaseModel):
    blood_group: Optional[str] = None
    height: Optional[float] = None
    weight: Optional[float] = None
    emergency_contact: Optional[str] = None
    occupation: Optional[str] = None
    location: Optional[str] = None
    lifestyle: Optional[Dict[str, Any]] = None

class PatientProfileUpdate(PatientProfileBase):
    pass

class PatientProfileOut(PatientProfileBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime
    user: UserOut

    class Config:
        from_attributes = True

# Medical History Schemas
class MedicalHistoryCreate(BaseModel):
    condition_name: str
    diagnosis_date: Optional[str] = None
    status: ConditionStatus = ConditionStatus.ACTIVE
    description: Optional[str] = None
    source: Optional[str] = "patient_reported"

class MedicalHistoryOut(MedicalHistoryCreate):
    id: str
    patient_id: str
    created_at: datetime

    class Config:
        from_attributes = True

# Family History Schemas
class FamilyHistoryCreate(BaseModel):
    relation: str
    condition: str
    age_at_diagnosis: Optional[int] = None
    notes: Optional[str] = None

class FamilyHistoryOut(FamilyHistoryCreate):
    id: str
    patient_id: str

    class Config:
        from_attributes = True

# Allergy Schemas
class AllergyCreate(BaseModel):
    allergen: str
    reaction: Optional[str] = None
    severity: Optional[str] = "Moderate"
    notes: Optional[str] = None

class AllergyOut(AllergyCreate):
    id: str
    patient_id: str

    class Config:
        from_attributes = True

# Medication Schemas
class MedicationCreate(BaseModel):
    name: str
    dosage: str
    frequency: str
    route: Optional[str] = "Oral"
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    prescribed_by: Optional[str] = None
    status: Optional[str] = "ACTIVE"
    notes: Optional[str] = None

class MedicationOut(MedicationCreate):
    id: str
    patient_id: str

    class Config:
        from_attributes = True

# Vitals Schemas
class VitalCreate(BaseModel):
    heart_rate: Optional[float] = None
    systolic_bp: Optional[float] = None
    diastolic_bp: Optional[float] = None
    spo2: Optional[float] = None
    temperature: Optional[float] = None
    weight: Optional[float] = None
    blood_glucose: Optional[float] = None
    respiratory_rate: Optional[float] = None
    source: Optional[str] = "manual_entry"

class VitalOut(VitalCreate):
    id: str
    patient_id: str
    recorded_at: datetime

    class Config:
        from_attributes = True

# Lab Results & Reports Schemas
class LabResultOut(BaseModel):
    id: str
    report_id: str
    test_name: str
    value: Optional[float] = None
    unit: Optional[str] = None
    reference_range: Optional[str] = None
    status: str
    confidence: str

    class Config:
        from_attributes = True

class LabReportOut(BaseModel):
    id: str
    patient_id: str
    file_name: str
    file_path: str
    report_date: Optional[str] = None
    report_type: str
    extracted_text: Optional[str] = None
    processing_status: str
    created_at: datetime
    results: List[LabResultOut] = []

    class Config:
        from_attributes = True

# Health Events Schemas
class HealthEventOut(BaseModel):
    id: str
    patient_id: str
    event_type: EventType
    title: str
    description: Optional[str] = None
    event_date: str
    source: str
    created_at: datetime

    class Config:
        from_attributes = True

# Appointments Schemas
class AppointmentCreate(BaseModel):
    doctor_id: str
    appointment_date: str
    appointment_time: str
    reason: Optional[str] = None

class AppointmentOut(BaseModel):
    id: str
    patient_id: str
    doctor_id: str
    appointment_date: str
    appointment_time: str
    reason: Optional[str] = None
    status: AppointmentStatus
    notes: Optional[str] = None
    created_at: datetime
    doctor_name: Optional[str] = None
    patient_name: Optional[str] = None

    class Config:
        from_attributes = True

# AI Chat Schemas
class AIChatRequest(BaseModel):
    conversation_id: Optional[str] = None
    message: str

class AIChatResponse(BaseModel):
    conversation_id: str
    message: str
    context_used: List[str] = []
    disclaimer: str
    urgency: str = "routine"

class AIInsightOut(BaseModel):
    id: str
    patient_id: str
    insight_type: str
    title: str
    description: str
    severity: InsightSeverity
    confidence: float
    source: str
    dismissed: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Audit Log Schema
class AuditLogOut(BaseModel):
    id: str
    user_id: Optional[str] = None
    action: str
    resource_type: str
    resource_id: Optional[str] = None
    ip_address: Optional[str] = None
    timestamp: datetime
    metadata_json: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True
