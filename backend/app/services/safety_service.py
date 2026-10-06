import re
from typing import Tuple, Optional, Dict, Any

MANDATORY_DISCLAIMER = (
    "This information is for educational and informational purposes and is not a medical diagnosis. "
    "Please consult a qualified healthcare professional for medical decisions."
)

EMERGENCY_KEYWORDS = [
    "chest pain", "shortness of breath", "difficulty breathing", "severe bleeding",
    "stroke", "numbness on one side", "loss of consciousness", "fainted",
    "suicide", "self harm", "unbearable pain", "anaphylaxis"
]

DOSAGE_KEYWORDS = [
    "double my dose", "double my medicine", "stop taking", "skip my dose",
    "increase dose", "increase dosage", "decrease dose", "change dose", "triple dose"
]

DIAGNOSIS_KEYWORDS = [
    "diagnose me", "what disease do i have", "do i have cancer", "do i have covid",
    "tell me what illness i have"
]

class SafetyService:
    
    @classmethod
    def evaluate_user_query(cls, query: str) -> Dict[str, Any]:
        lower_q = query.lower()
        
        # Check emergency
        for kw in EMERGENCY_KEYWORDS:
            if kw in lower_q:
                return {
                    "is_safe": False,
                    "is_emergency": True,
                    "override_response": (
                        "**EMERGENCY WARNING**: The symptoms or situation you described may require immediate medical attention. "
                        "Please call your local emergency services (e.g. 911 / 112) or go to the nearest emergency room immediately. "
                        "Health Sync AI cannot assist with acute medical emergencies."
                    ),
                    "disclaimer": MANDATORY_DISCLAIMER,
                    "urgency": "EMERGENCY"
                }

        # Check dosage modification request
        for kw in DOSAGE_KEYWORDS:
            if kw in lower_q:
                return {
                    "is_safe": False,
                    "is_emergency": False,
                    "override_response": (
                        "**Medication Safety Alert**: You must not change your medication dose, double up on medicines, or discontinue prescribed treatments based on AI recommendations. "
                        "Please contact your prescribing physician or a licensed pharmacist immediately before making any changes to your medication regimen."
                    ),
                    "disclaimer": MANDATORY_DISCLAIMER,
                    "urgency": "HIGH"
                }

        # Check direct diagnosis demand
        for kw in DIAGNOSIS_KEYWORDS:
            if kw in lower_q:
                return {
                    "is_safe": True,
                    "is_emergency": False,
                    "override_response": (
                        "Health Sync AI is a clinical health-information system, not an autonomous diagnostic tool. "
                        "While I can explain recorded test values and health history in your Digital Twin profile, I cannot diagnose medical conditions. "
                        "Please present your health records to a licensed physician for clinical diagnosis."
                    ),
                    "disclaimer": MANDATORY_DISCLAIMER,
                    "urgency": "routine"
                }

        return {
            "is_safe": True,
            "is_emergency": False,
            "override_response": None,
            "disclaimer": MANDATORY_DISCLAIMER,
            "urgency": "routine"
        }

    @classmethod
    def sanitize_ai_response(cls, response_text: str, safety_eval: Dict[str, Any]) -> str:
        """
        Appends mandatory educational disclaimer to AI generated response text.
        """
        if safety_eval.get("override_response"):
            return safety_eval["override_response"]
            
        final_text = response_text.strip()
        if "Disclaimer" not in final_text:
            final_text += f"\n\n---\n*Disclaimer: {MANDATORY_DISCLAIMER}*"
        return final_text
