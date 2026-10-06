import os
import pickle
import numpy as np
from sqlalchemy.orm import Session
from app.models.models import Vital, LabReport, LabResult, AIInsight, InsightSeverity, PatientProfile

DL_MODEL_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "storage", "models", "best_dl_health_model.pkl")

class RiskAnalysisService:
    _dl_model_cache = None

    @classmethod
    def load_dl_model(cls):
        if cls._dl_model_cache is None and os.path.exists(DL_MODEL_PATH):
            try:
                with open(DL_MODEL_PATH, "rb") as f:
                    cls._dl_model_cache = pickle.load(f)
            except Exception:
                pass
        return cls._dl_model_cache

    @classmethod
    def evaluate_dl_risk(cls, db: Session, patient_id: str):
        """
        Executes dynamic inference using the trained Deep Learning (MLP Neural Network) Model
        on the patient's latest vitals & lab parameters.
        """
        dl_data = cls.load_dl_model()
        if not dl_data:
            return None

        model = dl_data.get("model")
        scaler = dl_data.get("scaler")
        if not model or not scaler:
            return None

        latest_vital = db.query(Vital).filter(Vital.patient_id == patient_id).order_by(Vital.recorded_at.desc()).first()
        latest_chol = db.query(LabResult).join(LabReport).filter(
            LabReport.patient_id == patient_id,
            LabResult.test_name.ilike("%cholesterol%")
        ).order_by(LabResult.id.desc()).first()

        sys_bp = latest_vital.systolic_bp if latest_vital and latest_vital.systolic_bp else 125.0
        dia_bp = latest_vital.diastolic_bp if latest_vital and latest_vital.diastolic_bp else 80.0
        hr = latest_vital.heart_rate if latest_vital and latest_vital.heart_rate else 75.0
        spo2 = latest_vital.spo2 if latest_vital and latest_vital.spo2 else 98.0
        glucose = latest_vital.blood_glucose if latest_vital and latest_vital.blood_glucose else 105.0
        chol = latest_chol.value if latest_chol and latest_chol.value else 190.0

        features = np.array([[sys_bp, dia_bp, hr, spo2, glucose, chol]])
        features_scaled = scaler.transform(features)
        
        # Neural Network Prediction & Class Probabilities
        prediction_class = model.predict(features_scaled)[0] # 0=INFO, 1=LOW, 2=MODERATE, 3=HIGH
        probabilities = model.predict_proba(features_scaled)[0]
        confidence = float(np.max(probabilities))

        severity_map = {
            0: InsightSeverity.INFO,
            1: InsightSeverity.LOW,
            2: InsightSeverity.MODERATE,
            3: InsightSeverity.HIGH
        }
        label_map = {
            0: "Normal Baseline (INFO)",
            1: "Mild Baseline Watch (LOW)",
            2: "Moderate Clinical Trend (MODERATE)",
            3: "Elevated Risk Parameter (HIGH)"
        }

        return {
            "severity": severity_map.get(prediction_class, InsightSeverity.INFO),
            "label": label_map.get(prediction_class, "Normal"),
            "confidence": round(confidence * 100, 1),
            "inputs": {
                "systolic_bp": sys_bp,
                "diastolic_bp": dia_bp,
                "spo2": spo2,
                "glucose": glucose,
                "cholesterol": chol
            }
        }

    @classmethod
    def evaluate_patient_trends(cls, db: Session, patient_id: str):
        """
        Runs rule-based + Deep Learning neural network trend analytics over patient context.
        """
        db.query(AIInsight).filter(
            AIInsight.patient_id == patient_id,
            AIInsight.source.in_(["RiskAnalysisService", "DeepLearningNeuralNetwork"])
        ).delete()

        new_insights = []

        # 1. Run Deep Learning Neural Network Inference
        dl_res = cls.evaluate_dl_risk(db, patient_id)
        if dl_res and dl_res["severity"] in [InsightSeverity.MODERATE, InsightSeverity.HIGH]:
            new_insights.append(AIInsight(
                patient_id=patient_id,
                insight_type="DL_NEURAL_NETWORK_RISK",
                title=f"Deep Learning Model Risk Signal ({dl_res['label']})",
                description=f"Neural Network model classified multi-parameter vital & lab vector with {dl_res['confidence']}% confidence. Recommended clinical review.",
                severity=dl_res["severity"],
                confidence=dl_res["confidence"] / 100.0,
                source="DeepLearningNeuralNetwork"
            ))

        # 2. Analyze BP Trend
        vitals = db.query(Vital).filter(
            Vital.patient_id == patient_id
        ).order_by(Vital.recorded_at.desc()).limit(5).all()

        if len(vitals) >= 2:
            elevated_bp_count = sum(1 for v in vitals if v.systolic_bp and v.systolic_bp >= 135)
            if elevated_bp_count >= 2:
                new_insights.append(AIInsight(
                    patient_id=patient_id,
                    insight_type="BP_ELEVATED_TREND",
                    title="Potential Elevated Blood Pressure Trend",
                    description="Multiple recent blood pressure readings show systolic pressure above 135 mmHg. Consider bringing this trend to your doctor's attention.",
                    severity=InsightSeverity.MODERATE,
                    confidence=0.92,
                    source="RiskAnalysisService"
                ))

        # 3. Analyze SpO2 Trend
        low_spo2 = [v for v in vitals if v.spo2 and v.spo2 < 95]
        if low_spo2:
            new_insights.append(AIInsight(
                patient_id=patient_id,
                insight_type="SPO2_LOW",
                title="Oxygen Saturation (SpO2) Watch",
                description=f"A recorded SpO2 reading of {low_spo2[0].spo2}% is lower than normal baseline (>=95%). Monitor for shortness of breath.",
                severity=InsightSeverity.HIGH if low_spo2[0].spo2 < 90 else InsightSeverity.MODERATE,
                confidence=0.95,
                source="RiskAnalysisService"
            ))

        # 4. Analyze Lab Results Trends
        abnormal_labs = db.query(LabResult).join(LabReport).filter(
            LabReport.patient_id == patient_id,
            LabResult.status.in_(["HIGH", "LOW", "ABNORMAL"])
        ).all()

        for item in abnormal_labs:
            severity = InsightSeverity.MODERATE
            if "hba1c" in item.test_name.lower() and item.value and item.value > 6.5:
                severity = InsightSeverity.HIGH
                title = "Elevated HbA1c Parameter"
                desc = f"Your latest HbA1c test value ({item.value}%) is above normal reference range. Recommended to discuss diabetic management with your clinical team."
            elif "hemoglobin" in item.test_name.lower() and item.value and item.value < 11.0:
                severity = InsightSeverity.HIGH
                title = "Low Hemoglobin Parameter"
                desc = f"Recorded hemoglobin ({item.value} g/dL) is lower than reference limits. May indicate anemia, deserving physician review."
            else:
                title = f"Abnormal Test Result: {item.test_name}"
                desc = f"Latest recorded value for {item.test_name} ({item.value} {item.unit or ''}) is flagged as {item.status}."

            new_insights.append(AIInsight(
                patient_id=patient_id,
                insight_type="LAB_ABNORMALITY",
                title=title,
                description=desc,
                severity=severity,
                confidence=0.90,
                source="RiskAnalysisService"
            ))

        for ins in new_insights:
            db.add(ins)
        
        db.commit()
        return new_insights
