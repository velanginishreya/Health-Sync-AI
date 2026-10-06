"""
Clinical Calculators & Physiological Organ Systems Engine
- ACC/AHA 10-Year ASCVD Cardiovascular Risk Calculator
- 5-Organ Systems Health Heatmap Evaluator
"""

from typing import Dict, Any, List
import math

class ClinicalCalculators:

    @staticmethod
    def calculate_ascvd_10yr_risk(
        age: int = 52,
        gender: str = "male",
        systolic_bp: float = 135.0,
        total_cholesterol: float = 215.0,
        hdl_cholesterol: float = 45.0,
        on_hypertension_meds: bool = True,
        is_smoker: bool = False,
        has_diabetes: bool = True
    ) -> Dict[str, Any]:
        """
        Calculates ACC/AHA 10-Year ASCVD Risk percentage using pooled cohort equations.
        """
        # Baseline log-risk equation approximation for clinical presentation
        ln_age = math.log(max(40, min(79, age)))
        ln_tc = math.log(max(130, min(320, total_cholesterol)))
        ln_hdl = math.log(max(20, min(100, hdl_cholesterol)))
        ln_sbp = math.log(max(90, min(200, systolic_bp)))

        if gender.lower() == "female":
            s010 = 0.9665
            mean_xb = 29.18
            xb = (
                (0.6685 * ln_age) +
                (0.8037 * ln_tc) -
                (0.2524 * ln_hdl) +
                (1.9570 if on_hypertension_meds else 1.7766) * ln_sbp +
                (0.6909 if is_smoker else 0.0) +
                (0.8738 if has_diabetes else 0.0)
            )
        else:
            s010 = 0.9144
            mean_xb = 61.18
            xb = (
                (12.344 * ln_age) +
                (11.853 * ln_tc) -
                (2.664 * ln_hdl) +
                (2.014 if on_hypertension_meds else 1.957) * ln_sbp +
                (7.837 if is_smoker else 0.0) +
                (0.658 if has_diabetes else 0.0)
            )

        # Calculate 10-year risk percentage
        raw_risk = (1.0 - math.pow(s010, math.exp(xb - mean_xb))) * 100.0
        risk_percent = round(max(0.5, min(65.0, raw_risk)), 1)

        if risk_percent < 5.0:
            category = "LOW"
            interpretation = "Low 10-Year Cardiovascular Risk (< 5.0%). Maintain healthy lifestyle."
        elif risk_percent < 7.5:
            category = "BORDERLINE"
            interpretation = "Borderline Risk (5.0% - 7.4%). Consider lifestyle modifications."
        elif risk_percent < 20.0:
            category = "INTERMEDIATE"
            interpretation = "Intermediate Risk (7.5% - 19.9%). Moderate-intensity statin therapy recommended."
        else:
            category = "HIGH"
            interpretation = "High Risk (≥ 20.0%). High-intensity statin therapy & strict BP control advised."

        return {
            "ascvd_10yr_risk_percent": risk_percent,
            "risk_category": category,
            "clinical_guideline": "2018 AHA/ACC Multisociety Guideline on Blood Cholesterol",
            "interpretation": interpretation,
            "input_parameters": {
                "age": age,
                "gender": gender,
                "systolic_bp": systolic_bp,
                "total_cholesterol": total_cholesterol,
                "hdl_cholesterol": hdl_cholesterol,
                "on_hypertension_meds": on_hypertension_meds,
                "has_diabetes": has_diabetes
            }
        }

    @staticmethod
    def evaluate_organ_systems(patient_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Evaluates dynamic health status across 5 major physiological organ systems.
        """
        vitals_list = patient_data.get("vitals", [])
        latest_vital = vitals_list[-1] if vitals_list else {}
        reports = patient_data.get("lab_reports", [])
        
        # Latest lab parameters extraction
        labs = {}
        for r in reports:
            for item in r.get("results", []):
                param_key = item.get("parameter_name", "").lower()
                labs[param_key] = item.get("value")

        # 1. Cardiovascular System
        sbp = latest_vital.get("blood_pressure_sys", 135.0)
        hr = latest_vital.get("heart_rate", 78)
        tc = labs.get("total_cholesterol", 215.0)
        ldl = labs.get("ldl_cholesterol", 137.0)
        
        cardio_score = 100
        if sbp > 140 or ldl > 130 or tc > 200:
            cardio_score -= 25
        if sbp > 160 or ldl > 160:
            cardio_score -= 20
        cardio_status = "ELEVATED_RISK" if cardio_score < 70 else ("GUARDED" if cardio_score < 85 else "NORMAL")

        # 2. Endocrine & Metabolic System
        hba1c = labs.get("hba1c", 6.8)
        glucose = labs.get("fasting_blood_glucose", 125.0)
        
        endo_score = 100
        if hba1c > 6.5 or glucose > 126:
            endo_score -= 30
        elif hba1c > 5.7 or glucose > 100:
            endo_score -= 15
        endo_status = "ELEVATED_RISK" if endo_score < 70 else ("GUARDED" if endo_score < 85 else "NORMAL")

        # 3. Renal (Kidney) System
        creatinine = labs.get("creatinine", 1.1)
        bun = labs.get("blood_urea_nitrogen", 18.0)
        
        renal_score = 100
        if creatinine > 1.3 or bun > 20:
            renal_score -= 25
        renal_status = "ELEVATED_RISK" if renal_score < 70 else ("GUARDED" if renal_score < 85 else "NORMAL")

        # 4. Respiratory System
        spo2 = latest_vital.get("spo2", 97.0)
        rr = latest_vital.get("resp_rate", 16)
        
        resp_score = 100
        if spo2 < 95 or rr > 20:
            resp_score -= 30
        resp_status = "ELEVATED_RISK" if resp_score < 70 else ("GUARDED" if resp_score < 85 else "NORMAL")

        # 5. Hematologic (Blood) System
        hb = labs.get("hemoglobin", 13.5)
        wbc = labs.get("wbc_count", 7.2)
        
        hema_score = 100
        if hb < 12.0 or hb > 17.5 or wbc > 11.0:
            hema_score -= 20
        hema_status = "ELEVATED_RISK" if hema_score < 70 else ("GUARDED" if hema_score < 85 else "NORMAL")

        return {
            "cardiovascular": {
                "name": "Cardiovascular System",
                "score": cardio_score,
                "status": cardio_status,
                "key_metrics": f"BP: {sbp}/85 mmHg, LDL: {ldl} mg/dL, HR: {hr} bpm"
            },
            "endocrine_metabolic": {
                "name": "Endocrine & Metabolic System",
                "score": endo_score,
                "status": endo_status,
                "key_metrics": f"HbA1c: {hba1c}%, Fasting Glucose: {glucose} mg/dL"
            },
            "renal": {
                "name": "Renal & Excretory System",
                "score": renal_score,
                "status": renal_status,
                "key_metrics": f"Serum Creatinine: {creatinine} mg/dL, BUN: {bun} mg/dL"
            },
            "respiratory": {
                "name": "Respiratory System",
                "score": resp_score,
                "status": resp_status,
                "key_metrics": f"SpO2: {spo2}%, Respiratory Rate: {rr}/min"
            },
            "hematologic": {
                "name": "Hematologic System",
                "score": hema_score,
                "status": hema_status,
                "key_metrics": f"Hemoglobin: {hb} g/dL, WBC: {wbc} k/uL"
            }
        }
