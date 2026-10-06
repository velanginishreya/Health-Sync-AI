from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.database import get_db
from app.models.models import HealthEvent, PatientProfile
from app.schemas.schemas import HealthEventOut
from app.api.patients import get_current_patient_profile

router = APIRouter(prefix="/patients/me/timeline", tags=["Health Timeline"])

@router.get("", response_model=List[HealthEventOut])
def get_timeline(
    event_type: Optional[str] = Query(None),
    profile: PatientProfile = Depends(get_current_patient_profile),
    db: Session = Depends(get_db)
):
    query = db.query(HealthEvent).filter(HealthEvent.patient_id == profile.id)
    if event_type:
        query = query.filter(HealthEvent.event_type == event_type.upper())
    return query.order_by(HealthEvent.created_at.desc()).all()
