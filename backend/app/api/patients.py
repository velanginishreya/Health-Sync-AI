from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.models.models import User, PatientProfile, MedicalHistory, Allergy, HealthEvent, EventType, UserRole
from app.schemas.schemas import PatientProfileOut, PatientProfileUpdate, MedicalHistoryCreate, MedicalHistoryOut, AllergyCreate, AllergyOut
from app.utils.auth import get_current_user, require_role
from app.services.digital_twin import DigitalTwinService

router = APIRouter(prefix="/patients", tags=["Patient Digital Twin"])

def get_current_patient_profile(current_user: User = Depends(require_role([UserRole.PATIENT])), db: Session = Depends(get_db)) -> PatientProfile:
    profile = db.query(PatientProfile).filter(PatientProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Patient profile not found")
    return profile

@router.get("/me", response_model=PatientProfileOut)
def get_my_profile(profile: PatientProfile = Depends(get_current_patient_profile)):
    return profile

@router.put("/me", response_model=PatientProfileOut)
def update_my_profile(
    update_data: PatientProfileUpdate,
    profile: PatientProfile = Depends(get_current_patient_profile),
    db: Session = Depends(get_db)
):
    for key, val in update_data.model_dump(exclude_unset=True).items():
        setattr(profile, key, val)
    db.commit()
    db.refresh(profile)
    return profile

@router.get("/me/digital-twin")
def get_my_digital_twin(
    profile: PatientProfile = Depends(get_current_patient_profile),
    db: Session = Depends(get_db)
):
    return DigitalTwinService.build_patient_context(db, profile.id)

# Medical History
@router.get("/me/medical-history", response_model=List[MedicalHistoryOut])
def get_medical_history(profile: PatientProfile = Depends(get_current_patient_profile), db: Session = Depends(get_db)):
    return db.query(MedicalHistory).filter(MedicalHistory.patient_id == profile.id).all()

@router.post("/me/medical-history", response_model=MedicalHistoryOut)
def add_medical_history(
    item: MedicalHistoryCreate,
    profile: PatientProfile = Depends(get_current_patient_profile),
    db: Session = Depends(get_db)
):
    record = MedicalHistory(patient_id=profile.id, **item.model_dump())
    db.add(record)
    
    # Create health event
    event = HealthEvent(
        patient_id=profile.id,
        event_type=EventType.DIAGNOSIS,
        title=f"Diagnosed: {item.condition_name}",
        description=item.description,
        event_date=item.diagnosis_date or "Today",
        source="patient_reported"
    )
    db.add(event)
    db.commit()
    db.refresh(record)
    return record

@router.delete("/me/medical-history/{item_id}")
def delete_medical_history(item_id: str, profile: PatientProfile = Depends(get_current_patient_profile), db: Session = Depends(get_db)):
    item = db.query(MedicalHistory).filter(MedicalHistory.id == item_id, MedicalHistory.patient_id == profile.id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Medical history record not found")
    db.delete(item)
    db.commit()
    return {"message": "Deleted successfully"}

# Allergies
@router.get("/me/allergies", response_model=List[AllergyOut])
def get_allergies(profile: PatientProfile = Depends(get_current_patient_profile), db: Session = Depends(get_db)):
    return db.query(Allergy).filter(Allergy.patient_id == profile.id).all()

@router.post("/me/allergies", response_model=AllergyOut)
def add_allergy(
    item: AllergyCreate,
    profile: PatientProfile = Depends(get_current_patient_profile),
    db: Session = Depends(get_db)
):
    record = Allergy(patient_id=profile.id, **item.model_dump())
    db.add(record)
    db.commit()
    db.refresh(record)
    return record

@router.delete("/me/allergies/{item_id}")
def delete_allergy(item_id: str, profile: PatientProfile = Depends(get_current_patient_profile), db: Session = Depends(get_db)):
    item = db.query(Allergy).filter(Allergy.id == item_id, Allergy.patient_id == profile.id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Allergy record not found")
    db.delete(item)
    db.commit()
    return {"message": "Deleted successfully"}

@router.get("/me/notifications")
def get_in_app_notifications(profile: PatientProfile = Depends(get_current_patient_profile), db: Session = Depends(get_db)):
    """
    Returns real-time in-app notifications (Appointments, Reports, Medications, DL Risk alerts).
    """
    notifications = []
    
    # 1. Upcoming Appointments
    appts = db.query(HealthEvent).filter(HealthEvent.patient_id == profile.id, HealthEvent.event_type == EventType.APPOINTMENT).all()
    for a in appts:
        notifications.append({
            "id": f"n_appt_{a.id}",
            "title": a.title,
            "message": a.description,
            "type": "APPOINTMENT",
            "date": a.event_date
        })

    # 2. Lab Reports Processed
    reports = db.query(HealthEvent).filter(HealthEvent.patient_id == profile.id, HealthEvent.event_type == EventType.LAB_REPORT).order_by(HealthEvent.created_at.desc()).limit(3).all()
    for r in reports:
        notifications.append({
            "id": f"n_rep_{r.id}",
            "title": "Lab Report Processed via Document AI",
            "message": r.title,
            "type": "LAB_REPORT",
            "date": r.event_date
        })

    # 3. Deep Learning / Risk Alerts
    insights = db.query(HealthEvent).filter(HealthEvent.patient_id == profile.id, HealthEvent.event_type == EventType.AI_INSIGHT).all()
    for i in insights:
        notifications.append({
            "id": f"n_ins_{i.id}",
            "title": "Health Risk Alert",
            "message": i.title,
            "type": "RISK_ALERT",
            "date": i.event_date
        })

    return notifications

@router.get("/me/fhir-export")
def export_patient_fhir_r4(
    profile: PatientProfile = Depends(get_current_patient_profile),
    db: Session = Depends(get_db)
):
    """
    Exports full patient profile and digital twin state as an HL7 FHIR R4 JSON Bundle.
    """
    from app.services.fhir_service import FHIRService
    ctx = DigitalTwinService.build_patient_context(db, profile.id)
    return FHIRService.generate_patient_fhir_bundle(ctx)

@router.get("/me/organ-systems")
def get_patient_organ_systems(
    profile: PatientProfile = Depends(get_current_patient_profile),
    db: Session = Depends(get_db)
):
    """
    Evaluates dynamic health status across 5 physiological organ systems.
    """
    from app.services.clinical_calculators import ClinicalCalculators
    ctx = DigitalTwinService.build_patient_context(db, profile.id)
    return ClinicalCalculators.evaluate_organ_systems(ctx)

@router.get("/me/ascvd-risk")
def get_patient_ascvd_risk(
    profile: PatientProfile = Depends(get_current_patient_profile),
    db: Session = Depends(get_db)
):
    """
    Calculates ACC/AHA 10-Year ASCVD Cardiovascular Risk score.
    """
    from app.services.clinical_calculators import ClinicalCalculators
    ctx = DigitalTwinService.build_patient_context(db, profile.id)
    vitals = ctx.get("vitals", [])
    latest_vital = vitals[-1] if vitals else {}
    sbp = latest_vital.get("blood_pressure_sys", 135.0)
    
    # Calculate patient age
    dob_str = str(ctx.get("date_of_birth", "1980-01-01"))
    try:
        age = 2026 - int(dob_str[:4])
    except Exception:
        age = 52

    # Extract lab values
    reports = ctx.get("lab_reports", [])
    labs = {}
    for r in reports:
        for item in r.get("results", []):
            labs[item.get("parameter_name", "").lower()] = item.get("value")

    tc = labs.get("total_cholesterol", 215.0)
    hdl = labs.get("hdl_cholesterol", 45.0)
    
    meds = [m.get("name", "").lower() for m in ctx.get("medications", [])]
    on_htn = any(h in " ".join(meds) for h in ["lisinopril", "amlodipine", "losartan", "hydrochlorothiazide"])
    has_db = any("diabetes" in cond.get("condition_name", "").lower() for cond in ctx.get("medical_history", []))

    return ClinicalCalculators.calculate_ascvd_10yr_risk(
        age=age,
        gender=ctx.get("gender", "male"),
        systolic_bp=sbp,
        total_cholesterol=tc,
        hdl_cholesterol=hdl,
        on_hypertension_meds=on_htn,
        is_smoker=False,
        has_diabetes=has_db
    )

