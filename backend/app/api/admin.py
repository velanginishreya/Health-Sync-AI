from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.models.models import User, UserRole, PatientProfile, LabReport, AIConversation, Appointment, DoctorPatient, AuditLog
from app.schemas.schemas import UserOut, AuditLogOut
from app.utils.auth import require_role

router = APIRouter(prefix="/admin", tags=["Admin Dashboard"])

@router.get("/stats")
def get_system_stats(
    current_user: User = Depends(require_role([UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    total_users = db.query(User).count()
    patients_count = db.query(User).filter(User.role == UserRole.PATIENT).count()
    doctors_count = db.query(User).filter(User.role == UserRole.DOCTOR).count()
    reports_count = db.query(LabReport).count()
    ai_convs_count = db.query(AIConversation).count()
    appointments_count = db.query(Appointment).count()

    return {
        "total_users": total_users,
        "patients_count": patients_count,
        "doctors_count": doctors_count,
        "reports_processed": reports_count,
        "ai_conversations": ai_convs_count,
        "appointments_count": appointments_count
    }

@router.get("/users", response_model=List[UserOut])
def get_all_users(
    current_user: User = Depends(require_role([UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    return db.query(User).order_by(User.created_at.desc()).all()

@router.post("/assign-patient")
def assign_patient_to_doctor(
    doctor_id: str,
    patient_id: str,
    current_user: User = Depends(require_role([UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    doc = db.query(User).filter(User.id == doctor_id, User.role == UserRole.DOCTOR).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Doctor user not found")

    patient = db.query(PatientProfile).filter(PatientProfile.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")

    existing = db.query(DoctorPatient).filter(DoctorPatient.doctor_id == doc.id, DoctorPatient.patient_id == patient.id).first()
    if existing:
        existing.status = "ACTIVE"
    else:
        assignment = DoctorPatient(doctor_id=doc.id, patient_id=patient.id, status="ACTIVE")
        db.add(assignment)

    db.commit()
    return {"message": "Patient successfully assigned to Doctor"}

@router.get("/audit-logs", response_model=List[AuditLogOut])
def get_audit_logs(
    current_user: User = Depends(require_role([UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    return db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(100).all()

@router.get("/export-anonymized")
def export_anonymized_research_dataset(
    current_user: User = Depends(require_role([UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    """
    Exports HIPAA Safe Harbor de-identified patient digital twin dataset for clinical research.
    """
    from app.services.digital_twin import DigitalTwinService
    from app.services.anonymizer import HIPAAAnonymizer

    patients = db.query(PatientProfile).all()
    anonymized_dataset = []
    
    for p in patients:
        ctx = DigitalTwinService.build_patient_context(db, p.id)
        deidentified = HIPAAAnonymizer.deidentify_patient_record(ctx)
        anonymized_dataset.append(deidentified)

    return {
        "dataset_name": "Health Sync AI - Clinical Research De-Identified Extract",
        "total_subjects": len(anonymized_dataset),
        "anonymization_standard": "HIPAA Safe Harbor (18 Identifiers Stripped)",
        "subjects": anonymized_dataset
    }
