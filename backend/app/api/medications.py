from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.models.models import Medication, PatientProfile, HealthEvent, EventType
from app.schemas.schemas import MedicationCreate, MedicationOut
from app.api.patients import get_current_patient_profile

router = APIRouter(prefix="/patients/me/medications", tags=["Medications"])

@router.get("", response_model=List[MedicationOut])
def get_medications(profile: PatientProfile = Depends(get_current_patient_profile), db: Session = Depends(get_db)):
    return db.query(Medication).filter(Medication.patient_id == profile.id).all()

@router.post("", response_model=MedicationOut)
def add_medication(
    item: MedicationCreate,
    profile: PatientProfile = Depends(get_current_patient_profile),
    db: Session = Depends(get_db)
):
    med = Medication(patient_id=profile.id, **item.model_dump())
    db.add(med)
    
    # Create event
    event = HealthEvent(
        patient_id=profile.id,
        event_type=EventType.MEDICATION,
        title=f"Started Medication: {item.name} ({item.dosage})",
        description=f"Frequency: {item.frequency}",
        event_date=item.start_date or "Today",
        source="patient_entry"
    )
    db.add(event)
    db.commit()
    db.refresh(med)
    return med

@router.put("/{med_id}", response_model=MedicationOut)
def update_medication(
    med_id: str,
    item: MedicationCreate,
    profile: PatientProfile = Depends(get_current_patient_profile),
    db: Session = Depends(get_db)
):
    med = db.query(Medication).filter(Medication.id == med_id, Medication.patient_id == profile.id).first()
    if not med:
        raise HTTPException(status_code=404, detail="Medication not found")
    
    for k, v in item.model_dump().items():
        setattr(med, k, v)
    db.commit()
    db.refresh(med)
    return med

@router.post("/{med_id}/stop")
def stop_medication(med_id: str, profile: PatientProfile = Depends(get_current_patient_profile), db: Session = Depends(get_db)):
    med = db.query(Medication).filter(Medication.id == med_id, Medication.patient_id == profile.id).first()
    if not med:
        raise HTTPException(status_code=404, detail="Medication not found")
    med.status = "STOPPED"
    db.commit()
    return {"message": f"Medication {med.name} marked as stopped"}

@router.delete("/{med_id}")
def delete_medication(med_id: str, profile: PatientProfile = Depends(get_current_patient_profile), db: Session = Depends(get_db)):
    med = db.query(Medication).filter(Medication.id == med_id, Medication.patient_id == profile.id).first()
    if not med:
        raise HTTPException(status_code=404, detail="Medication not found")
    db.delete(med)
    db.commit()
    return {"message": "Medication deleted"}

@router.get("/check-interactions")
def check_drug_interactions(
    profile: PatientProfile = Depends(get_current_patient_profile),
    db: Session = Depends(get_db)
):
    """
    Evaluates active patient prescriptions against clinical Drug-Drug Interaction (DDI) rules.
    """
    from app.services.ddi_service import DDIService
    active_meds = db.query(Medication).filter(Medication.patient_id == profile.id, Medication.status == "ACTIVE").all()
    med_names = [m.name for m in active_meds]
    return {
        "active_medications": med_names,
        "interactions_found": DDIService.check_medication_interactions(med_names)
    }
