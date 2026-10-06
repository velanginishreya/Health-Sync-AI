from sqlalchemy.orm import Session
from datetime import datetime
from app.models.models import PatientProfile, MedicalHistory, FamilyHistory, Allergy, Medication, Vital, LabReport, LabResult, HealthEvent

class DigitalTwinService:

    @staticmethod
    def calculate_age(dob_str: str) -> int | None:
        if not dob_str:
            return None
        try:
            dob = datetime.strptime(dob_str, "%Y-%m-%d")
            today = datetime.today()
            return today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
        except Exception:
            return None

    @staticmethod
    def get_active_conditions(db: Session, patient_id: str):
        conditions = db.query(MedicalHistory).filter(
            MedicalHistory.patient_id == patient_id
        ).all()
        return [
            {
                "condition": c.condition_name,
                "status": c.status.value if hasattr(c.status, 'value') else str(c.status),
                "diagnosis_date": c.diagnosis_date,
                "description": c.description
            }
            for c in conditions
        ]

    @staticmethod
    def get_allergies(db: Session, patient_id: str):
        allergies = db.query(Allergy).filter(Allergy.patient_id == patient_id).all()
        return [
            {
                "allergen": a.allergen,
                "reaction": a.reaction,
                "severity": a.severity,
                "notes": a.notes
            }
            for a in allergies
        ]

    @staticmethod
    def get_active_medications(db: Session, patient_id: str):
        meds = db.query(Medication).filter(
            Medication.patient_id == patient_id,
            Medication.status == "ACTIVE"
        ).all()
        return [
            {
                "name": m.name,
                "dosage": m.dosage,
                "frequency": m.frequency,
                "route": m.route,
                "prescribed_by": m.prescribed_by
            }
            for m in meds
        ]

    @staticmethod
    def get_recent_vitals(db: Session, patient_id: str, limit: int = 5):
        vitals = db.query(Vital).filter(
            Vital.patient_id == patient_id
        ).order_by(Vital.recorded_at.desc()).limit(limit).all()
        
        return [
            {
                "recorded_at": v.recorded_at.isoformat() if v.recorded_at else None,
                "bp": f"{int(v.systolic_bp)}/{int(v.diastolic_bp)}" if v.systolic_bp and v.diastolic_bp else None,
                "heart_rate": v.heart_rate,
                "spo2": v.spo2,
                "temperature": v.temperature,
                "weight": v.weight,
                "glucose": v.blood_glucose
            }
            for v in vitals
        ]

    @staticmethod
    def get_recent_lab_results(db: Session, patient_id: str, limit: int = 10):
        reports = db.query(LabReport).filter(
            LabReport.patient_id == patient_id
        ).order_by(LabReport.created_at.desc()).limit(3).all()
        
        results = []
        for r in reports:
            for item in r.results:
                results.append({
                    "report_type": r.report_type,
                    "report_date": r.report_date,
                    "test_name": item.test_name,
                    "value": item.value,
                    "unit": item.unit,
                    "reference_range": item.reference_range,
                    "status": item.status,
                    "source": "uploaded_report"
                })
        return results[:limit]

    @classmethod
    def build_patient_context(cls, db: Session, patient_id: str) -> dict:
        profile = db.query(PatientProfile).filter(PatientProfile.id == patient_id).first()
        if not profile:
            return {}

        user = profile.user
        age = cls.calculate_age(user.date_of_birth) if user else None

        family_hist = db.query(FamilyHistory).filter(FamilyHistory.patient_id == patient_id).all()
        events = db.query(HealthEvent).filter(HealthEvent.patient_id == patient_id).order_by(HealthEvent.event_date.desc()).limit(5).all()

        return {
            "patient": {
                "id": profile.id,
                "name": f"{user.first_name} {user.last_name}" if user else "Unknown",
                "age": age,
                "gender": user.gender if user else None,
                "blood_group": profile.blood_group,
                "height_cm": profile.height,
                "weight_kg": profile.weight,
                "lifestyle": profile.lifestyle or {}
            },
            "medical_history": cls.get_active_conditions(db, patient_id),
            "family_history": [
                {"relation": f.relation, "condition": f.condition, "age_at_diagnosis": f.age_at_diagnosis}
                for f in family_hist
            ],
            "allergies": cls.get_allergies(db, patient_id),
            "active_medications": cls.get_active_medications(db, patient_id),
            "recent_vitals": cls.get_recent_vitals(db, patient_id),
            "lab_results": cls.get_recent_lab_results(db, patient_id),
            "recent_events": [
                {"date": e.event_date, "type": e.event_type.value if hasattr(e.event_type, 'value') else str(e.event_type), "title": e.title}
                for e in events
            ]
        }
