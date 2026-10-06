from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.models.models import Vital, PatientProfile, HealthEvent, EventType
from app.schemas.schemas import VitalCreate, VitalOut
from app.api.patients import get_current_patient_profile
from app.services.risk_analysis import RiskAnalysisService

router = APIRouter(prefix="/patients/me/vitals", tags=["Vitals"])

@router.get("", response_model=List[VitalOut])
def get_vitals(profile: PatientProfile = Depends(get_current_patient_profile), db: Session = Depends(get_db)):
    return db.query(Vital).filter(Vital.patient_id == profile.id).order_by(Vital.recorded_at.desc()).all()

@router.post("", response_model=VitalOut)
def record_vital(
    item: VitalCreate,
    profile: PatientProfile = Depends(get_current_patient_profile),
    db: Session = Depends(get_db)
):
    vital = Vital(patient_id=profile.id, **item.model_dump())
    db.add(vital)
    
    event_title = "Logged Vital Signs"
    if item.systolic_bp and item.diastolic_bp:
        event_title = f"Logged BP: {int(item.systolic_bp)}/{int(item.diastolic_bp)} mmHg"

    event = HealthEvent(
        patient_id=profile.id,
        event_type=EventType.VITAL,
        title=event_title,
        description=f"Heart rate: {item.heart_rate or 'N/A'}, SpO2: {item.spo2 or 'N/A'}%",
        event_date="Today",
        source="manual_entry"
    )
    db.add(event)
    db.commit()
    db.refresh(vital)
    
    # Run background risk trend analysis
    RiskAnalysisService.evaluate_patient_trends(db, profile.id)
    return vital

@router.post("/simulate-stream")
def simulate_vital_stream(
    profile: PatientProfile = Depends(get_current_patient_profile),
    db: Session = Depends(get_db)
):
    import random
    # Dynamically generate realistic simulated IoT vitals stream
    sys_bp = random.choice([122, 134, 138, 142, 148])
    dia_bp = random.choice([78, 84, 88, 92])
    hr = random.choice([70, 74, 78, 82, 86])
    spo2 = random.choice([96, 97, 98, 99])
    glucose = random.choice([98, 115, 135, 145])

    vital = Vital(
        patient_id=profile.id,
        systolic_bp=sys_bp,
        diastolic_bp=dia_bp,
        heart_rate=hr,
        spo2=spo2,
        blood_glucose=glucose,
        source="live_iot_stream"
    )
    db.add(vital)

    event = HealthEvent(
        patient_id=profile.id,
        event_type=EventType.VITAL,
        title=f"Live IoT Stream: BP {sys_bp}/{dia_bp} mmHg",
        description=f"Automated stream: HR {hr} bpm, SpO2 {spo2}%, Glucose {glucose} mg/dL",
        event_date="Just Now",
        source="live_iot_stream"
    )
    db.add(event)
    # Check threshold limits for Real-Time Vital Anomaly Alerts
    anomaly_alerts = []
    if sys_bp >= 145:
        anomaly_alerts.append(f"Elevated Systolic BP ({sys_bp} mmHg)")
    if hr >= 85:
        anomaly_alerts.append(f"Elevated Heart Rate ({hr} bpm)")
    if glucose >= 140:
        anomaly_alerts.append(f"Elevated Glucose ({glucose} mg/dL)")

    if anomaly_alerts:
        alert_event = HealthEvent(
            patient_id=profile.id,
            event_type=EventType.AI_INSIGHT,
            title="Real-Time Physiological Anomaly Alert",
            description="; ".join(anomaly_alerts),
            event_date="Just Now",
            source="vital_threshold_trigger"
        )
        db.add(alert_event)

    db.commit()
    db.refresh(vital)

    # Run Deep Learning Neural Network Risk Evaluation
    dl_assessment = RiskAnalysisService.evaluate_dl_risk(db, profile.id)
    RiskAnalysisService.evaluate_patient_trends(db, profile.id)

    return {
        "vital": VitalOut.model_validate(vital),
        "dl_neural_network_assessment": dl_assessment,
        "vital_anomaly_alerts": anomaly_alerts
    }

@router.get("/trends")
def get_vital_trends(profile: PatientProfile = Depends(get_current_patient_profile), db: Session = Depends(get_db)):

    vitals = db.query(Vital).filter(Vital.patient_id == profile.id).order_by(Vital.recorded_at.asc()).all()
    
    bp_trend = []
    heart_rate_trend = []
    spo2_trend = []
    weight_trend = []
    glucose_trend = []

    for v in vitals:
        date_str = v.recorded_at.strftime("%b %d") if v.recorded_at else "N/A"
        if v.systolic_bp and v.diastolic_bp:
            bp_trend.append({"date": date_str, "systolic": v.systolic_bp, "diastolic": v.diastolic_bp})
        if v.heart_rate:
            heart_rate_trend.append({"date": date_str, "heart_rate": v.heart_rate})
        if v.spo2:
            spo2_trend.append({"date": date_str, "spo2": v.spo2})
        if v.weight:
            weight_trend.append({"date": date_str, "weight": v.weight})
        if v.blood_glucose:
            glucose_trend.append({"date": date_str, "glucose": v.blood_glucose})

    return {
        "bp": bp_trend,
        "heart_rate": heart_rate_trend,
        "spo2": spo2_trend,
        "weight": weight_trend,
        "glucose": glucose_trend
    }
