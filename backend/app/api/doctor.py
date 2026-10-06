from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.models.models import User, UserRole, DoctorPatient, PatientProfile, HealthEvent, EventType
from app.schemas.schemas import PatientProfileOut
from app.utils.auth import require_role
from app.services.digital_twin import DigitalTwinService
from app.services.audit_service import AuditService

router = APIRouter(prefix="/doctor", tags=["Doctor Workspace"])

def get_assigned_patient(doctor_id: str, patient_id: str, db: Session) -> PatientProfile:
    # Check if assignment exists
    assignment = db.query(DoctorPatient).filter(
        DoctorPatient.doctor_id == doctor_id,
        DoctorPatient.patient_id == patient_id,
        DoctorPatient.status == "ACTIVE"
    ).first()

    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access Denied: Patient is not assigned to your clinical care."
        )

    profile = db.query(PatientProfile).filter(PatientProfile.id == patient_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Patient profile not found")
    return profile

@router.get("/patients")
def get_assigned_patients(
    current_user: User = Depends(require_role([UserRole.DOCTOR])),
    db: Session = Depends(get_db)
):
    assignments = db.query(DoctorPatient).filter(
        DoctorPatient.doctor_id == current_user.id,
        DoctorPatient.status == "ACTIVE"
    ).all()

    patients = []
    for a in assignments:
        p = db.query(PatientProfile).filter(PatientProfile.id == a.patient_id).first()
        if p and p.user:
            dt = DigitalTwinService.build_patient_context(db, p.id)
            patients.append({
                "id": p.id,
                "name": f"{p.user.first_name} {p.user.last_name}",
                "email": p.user.email,
                "gender": p.user.gender,
                "blood_group": p.blood_group,
                "age": dt.get("patient", {}).get("age"),
                "active_conditions": dt.get("medical_history", []),
                "active_medications_count": len(dt.get("active_medications", [])),
                "assigned_at": a.assigned_at
            })
    return patients

@router.get("/patients/{patient_id}")
def get_patient_digital_twin(
    patient_id: str,
    request: Request,
    current_user: User = Depends(require_role([UserRole.DOCTOR])),
    db: Session = Depends(get_db)
):
    profile = get_assigned_patient(current_user.id, patient_id, db)
    AuditService.log(
        db,
        action="DOCTOR_DATA_ACCESS",
        resource_type="PatientProfile",
        user_id=current_user.id,
        resource_id=profile.id,
        ip_address=request.client.host if request.client else None
    )
    return DigitalTwinService.build_patient_context(db, profile.id)

@router.post("/patients/{patient_id}/notes")
def add_doctor_note(
    patient_id: str,
    note: str,
    current_user: User = Depends(require_role([UserRole.DOCTOR])),
    db: Session = Depends(get_db)
):
    profile = get_assigned_patient(current_user.id, patient_id, db)
    
    event = HealthEvent(
        patient_id=profile.id,
        event_type=EventType.DOCTOR_NOTE,
        title=f"Clinical Note by Dr. {current_user.first_name} {current_user.last_name}",
        description=note,
        event_date="Today",
        source="doctor"
    )
    db.add(event)
    db.commit()
    return {"message": "Clinical note added successfully"}

@router.get("/patients/{patient_id}/summary")
def get_ai_patient_summary(
    patient_id: str,
    current_user: User = Depends(require_role([UserRole.DOCTOR])),
    db: Session = Depends(get_db)
):
    profile = get_assigned_patient(current_user.id, patient_id, db)
    dt = DigitalTwinService.build_patient_context(db, profile.id)

    meds = ", ".join([m["name"] for m in dt.get("active_medications", [])]) or "None on record"
    conds = ", ".join([c["condition"] for c in dt.get("medical_history", [])]) or "No chronic conditions"
    algs = ", ".join([a["allergen"] for a in dt.get("allergies", [])]) or "No known allergies"
    vitals = dt.get("recent_vitals", [{}])[0] if dt.get("recent_vitals") else {}

    summary = (
        f"### Clinical Decision-Support AI Summary for Dr. {current_user.last_name}\n\n"
        f"**Patient**: {dt.get('patient', {}).get('name')} | Age: {dt.get('patient', {}).get('age')} | Blood Group: {dt.get('patient', {}).get('blood_group')}\n\n"
        f"- **Active Conditions**: {conds}\n"
        f"- **Current Prescribed Regimen**: {meds}\n"
        f"- **Allergies Watch**: {algs}\n"
        f"- **Latest Baseline Vitals**: BP: {vitals.get('bp', 'N/A')}, HR: {vitals.get('heart_rate', 'N/A')} bpm, SpO2: {vitals.get('spo2', 'N/A')}%\n"
        f"- **Recent Lab Highlights**: {len(dt.get('lab_results', []))} test parameters logged in Digital Twin.\n\n"
        f"**Clinical Note**: AI-generated summary — verify against original source lab and prescription records before clinical decision making."
    )

    return {"summary": summary, "disclaimer": "AI-generated summary — verify against source records."}
