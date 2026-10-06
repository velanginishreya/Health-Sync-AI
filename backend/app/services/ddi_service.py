"""
Drug-Drug Interaction (DDI) & Clinical Contraindication Engine
Checks active patient prescriptions against known clinical interaction matrices.
"""

from typing import List, Dict, Any

class DDIService:
    # Known clinical drug interaction pairings matrix
    INTERACTION_RULES = [
        {
            "pair": {"lisinopril", "spironolactone"},
            "severity": "HIGH",
            "title": "Severe Hyperkalemia Risk",
            "description": "Combining Lisinopril (ACE Inhibitor) with Spironolactone (Potassium-Sparing Diuretic) significantly increases serum potassium levels, creating severe cardiac arrhythmia risks.",
            "recommendation": "Monitor serum potassium and renal function closely."
        },
        {
            "pair": {"warfarin", "aspirin"},
            "severity": "HIGH",
            "title": "Major Hemorrhage Risk",
            "description": "Concurrent use of Warfarin (Anticoagulant) and Aspirin (Antiplatelet) drastically increases the risk of major upper gastrointestinal bleeding.",
            "recommendation": "Avoid combination unless specifically indicated for prosthetic heart valves."
        },
        {
            "pair": {"metformin", "iodine_contrast"},
            "severity": "HIGH",
            "title": "Lactic Acidosis Risk",
            "description": "Intravascular administration of iodinated contrast agents in patients receiving Metformin can lead to acute renal failure and lactic acidosis.",
            "recommendation": "Discontinue Metformin prior to contrast procedures."
        },
        {
            "pair": {"atorvastatin", "amlodipine"},
            "severity": "MODERATE",
            "title": "Increased Statin Exposure",
            "description": "Amlodipine can increase serum concentration of Atorvastatin, elevating the risk of myopathy or rhabdomyolysis.",
            "recommendation": "Limit Atorvastatin dose to 20mg daily when co-administered."
        },
        {
            "pair": {"lisinopril", "ibuprofen"},
            "severity": "MODERATE",
            "title": "Attenuated Antihypertensive & Renal Failure Risk",
            "description": "NSAIDs like Ibuprofen reduce the blood pressure lowering effect of ACE Inhibitors and impair glomerular filtration.",
            "recommendation": "Use Acetaminophen for pain relief as an alternative."
        },
        {
            "pair": {"metformin", "lisinopril"},
            "severity": "MINOR",
            "title": "Enhanced Glycemic Response",
            "description": "ACE Inhibitors may slightly increase insulin sensitivity and lower blood glucose.",
            "recommendation": "Routine glycemic monitoring recommended."
        }
    ]

    @classmethod
    def check_medication_interactions(cls, medication_names: List[str]) -> List[Dict[str, Any]]:
        """
        Takes a list of patient medication names and returns triggered interactions.
        """
        cleaned_names = [m.lower().strip() for m in medication_names if m]
        detected = []

        for rule in cls.INTERACTION_RULES:
            rule_pair = rule["pair"]
            # Check if all items in rule_pair match medication names
            matches = [m for m in cleaned_names if any(p in m for p in rule_pair)]
            # Check if at least 2 distinct pair components are matched
            pair_found = True
            for required_drug in rule_pair:
                if not any(required_drug in m for m in cleaned_names):
                    pair_found = False
                    break
            
            if pair_found:
                detected.append({
                    "severity": rule["severity"],
                    "title": rule["title"],
                    "description": rule["description"],
                    "recommendation": rule["recommendation"],
                    "conflicting_medications": list(rule_pair)
                })

        return detected
