from typing import Dict, Any, List, Tuple

class RAGService:
    
    @classmethod
    def get_minimum_necessary_context(cls, query: str, full_context: Dict[str, Any]) -> Tuple[Dict[str, Any], List[str]]:
        """
        Filters full Digital Twin context down to minimum necessary context 
        relevant to the user's prompt, enforcing privacy minimization.
        """
        q_lower = query.lower()
        filtered_context = {}
        sources_used = []

        patient = full_context.get("patient", {})
        filtered_context["patient"] = {
            "name": patient.get("name"),
            "age": patient.get("age"),
            "gender": patient.get("gender"),
            "blood_group": patient.get("blood_group")
        }
        sources_used.append("Patient Demographics Profile")

        # Check for lab reports / blood test questions
        if any(w in q_lower for w in ["report", "lab", "blood", "test", "cbc", "lipid", "cholesterol", "hba1c", "glucose", "tsh"]):
            if full_context.get("lab_results"):
                filtered_context["lab_results"] = full_context["lab_results"]
                sources_used.append("Recent Laboratory Parameters")

        # Check for medication / prescription questions
        if any(w in q_lower for w in ["medication", "medicine", "drug", "prescription", "taking", "dose"]):
            if full_context.get("active_medications"):
                filtered_context["active_medications"] = full_context["active_medications"]
                sources_used.append("Active Medications List")

        # Check for vitals questions
        if any(w in q_lower for w in ["bp", "pressure", "vital", "heart rate", "pulse", "spo2", "weight", "temperature"]):
            if full_context.get("recent_vitals"):
                filtered_context["recent_vitals"] = full_context["recent_vitals"]
                sources_used.append("Recent Vitals Trends")

        # Check for allergy questions
        if any(w in q_lower for w in ["allergy", "allergic", "reaction", "penicillin"]):
            if full_context.get("allergies"):
                filtered_context["allergies"] = full_context["allergies"]
                sources_used.append("Allergies Registry")

        # Check for medical history / condition questions
        if any(w in q_lower for w in ["history", "condition", "diagnos", "diabetes", "hypertension", "disease"]):
            if full_context.get("medical_history"):
                filtered_context["medical_history"] = full_context["medical_history"]
                sources_used.append("Recorded Medical History")
            if full_context.get("family_history"):
                filtered_context["family_history"] = full_context["family_history"]
                sources_used.append("Family Medical History")

        # Check for diet / lifestyle
        if any(w in q_lower for w in ["diet", "food", "lifestyle", "exercise", "nutrition"]):
            if patient.get("lifestyle"):
                filtered_context["lifestyle"] = patient["lifestyle"]
                sources_used.append("Lifestyle & Dietary Preferences")
            if full_context.get("allergies"):
                filtered_context["allergies"] = full_context["allergies"]
                sources_used.append("Allergies Registry")

        # Default fallback: include basic active summary if query is broad
        if len(sources_used) <= 1:
            if full_context.get("medical_history"):
                filtered_context["medical_history"] = full_context["medical_history"]
                sources_used.append("Active Conditions")
            if full_context.get("active_medications"):
                filtered_context["active_medications"] = full_context["active_medications"]
                sources_used.append("Active Medications")
            if full_context.get("lab_results"):
                filtered_context["lab_results"] = full_context["lab_results"][:5]
                sources_used.append("Latest Lab Parameters")

        return filtered_context, sources_used
