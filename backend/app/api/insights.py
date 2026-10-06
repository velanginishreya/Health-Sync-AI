from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.models.models import AIInsight, PatientProfile
from app.schemas.schemas import AIInsightOut
from app.api.patients import get_current_patient_profile
from app.services.risk_analysis import RiskAnalysisService

router = APIRouter(prefix="/patients/me/insights", tags=["AI Insights & Risk Analysis"])

@router.get("", response_model=List[AIInsightOut])
def get_insights(profile: PatientProfile = Depends(get_current_patient_profile), db: Session = Depends(get_db)):
    # Refresh trend evaluation
    RiskAnalysisService.evaluate_patient_trends(db, profile.id)
    return db.query(AIInsight).filter(
        AIInsight.patient_id == profile.id,
        AIInsight.dismissed == False
    ).order_by(AIInsight.created_at.desc()).all()

@router.post("/{insight_id}/dismiss")
def dismiss_insight(insight_id: str, profile: PatientProfile = Depends(get_current_patient_profile), db: Session = Depends(get_db)):
    ins = db.query(AIInsight).filter(AIInsight.id == insight_id, AIInsight.patient_id == profile.id).first()
    if not ins:
        raise HTTPException(status_code=404, detail="Insight not found")
    ins.dismissed = True
    db.commit()
    return {"message": "Insight dismissed"}
