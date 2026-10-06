"""
HL7 FHIR R4 Standard Export Service
Generates standard FHIR R4 JSON Bundles containing Patient, Observation,
MedicationStatement, and AllergyIntolerance resources.
"""

from typing import Dict, Any, List
import datetime

class FHIRService:
    @staticmethod
    def generate_patient_fhir_bundle(patient_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Converts internal patient health profile & digital twin state into a standard HL7 FHIR R4 JSON Bundle.
        """
        patient_id = str(patient_data.get("id", "patient-001"))
        patient_name = patient_data.get("name", "Unknown Patient")
        dob = patient_data.get("date_of_birth", "1980-01-01")
        gender = str(patient_data.get("gender", "unknown")).lower()
        blood_group = patient_data.get("blood_group", "O+")
        
        entries = []
        
        # 1. FHIR Patient Resource
        patient_resource = {
            "resourceType": "Patient",
            "id": patient_id,
            "meta": {
                "profile": ["http://hl7.org/fhir/StructureDefinition/Patient"]
            },
            "name": [{
                "use": "official",
                "text": patient_name,
                "family": patient_name.split()[-1] if " " in patient_name else patient_name,
                "given": patient_name.split()[:-1] if " " in patient_name else [patient_name]
            }],
            "gender": gender if gender in ["male", "female", "other", "unknown"] else "unknown",
            "birthDate": str(dob),
            "extension": [
                {
                    "url": "http://hl7.org/fhir/StructureDefinition/patient-bloodGroup",
                    "valueString": blood_group
                }
            ]
        }
        entries.append({"resource": patient_resource})
        
        # 2. FHIR Vitals Observations
        vitals = patient_data.get("vitals", [])
        for v in vitals:
            recorded_at = str(v.get("recorded_at", datetime.datetime.utcnow().isoformat()))
            # Blood Pressure Observation
            if "blood_pressure_sys" in v and "blood_pressure_dia" in v:
                sys_val = v["blood_pressure_sys"]
                dia_val = v["blood_pressure_dia"]
                if sys_val and dia_val:
                    bp_obs = {
                        "resourceType": "Observation",
                        "id": f"obs-bp-{v.get('id', '1')}",
                        "status": "final",
                        "category": [{
                            "coding": [{
                                "system": "http://terminology.hl7.org/CodeSystem/observation-category",
                                "code": "vital-signs",
                                "display": "Vital Signs"
                            }]
                        }],
                        "code": {
                            "coding": [{
                                "system": "http://loinc.org",
                                "code": "85354-9",
                                "display": "Blood pressure panel with all children optional"
                            }],
                            "text": "Blood Pressure"
                        },
                        "subject": {"reference": f"Patient/{patient_id}"},
                        "effectiveDateTime": recorded_at,
                        "component": [
                            {
                                "code": {"coding": [{"system": "http://loinc.org", "code": "8480-6", "display": "Systolic blood pressure"}]},
                                "valueQuantity": {"value": sys_val, "unit": "mmHg", "system": "http://unitsofmeasure.org", "code": "mm[Hg]"}
                            },
                            {
                                "code": {"coding": [{"system": "http://loinc.org", "code": "8462-4", "display": "Diastolic blood pressure"}]},
                                "valueQuantity": {"value": dia_val, "unit": "mmHg", "system": "http://unitsofmeasure.org", "code": "mm[Hg]"}
                            }
                        ]
                    }
                    entries.append({"resource": bp_obs})
            
            # Heart Rate Observation
            if v.get("heart_rate"):
                hr_obs = {
                    "resourceType": "Observation",
                    "id": f"obs-hr-{v.get('id', '1')}",
                    "status": "final",
                    "category": [{"coding": [{"system": "http://terminology.hl7.org/CodeSystem/observation-category", "code": "vital-signs"}]}],
                    "code": {"coding": [{"system": "http://loinc.org", "code": "8867-4", "display": "Heart rate"}]},
                    "subject": {"reference": f"Patient/{patient_id}"},
                    "effectiveDateTime": recorded_at,
                    "valueQuantity": {"value": v["heart_rate"], "unit": "beats/min", "system": "http://unitsofmeasure.org", "code": "/min"}
                }
                entries.append({"resource": hr_obs})

            # SpO2 Observation
            if v.get("spo2"):
                spo2_obs = {
                    "resourceType": "Observation",
                    "id": f"obs-spo2-{v.get('id', '1')}",
                    "status": "final",
                    "category": [{"coding": [{"system": "http://terminology.hl7.org/CodeSystem/observation-category", "code": "vital-signs"}]}],
                    "code": {"coding": [{"system": "http://loinc.org", "code": "2708-6", "display": "Oxygen saturation in Arterial blood by Pulse oximetry"}]},
                    "subject": {"reference": f"Patient/{patient_id}"},
                    "effectiveDateTime": recorded_at,
                    "valueQuantity": {"value": v["spo2"], "unit": "%", "system": "http://unitsofmeasure.org", "code": "%"}
                }
                entries.append({"resource": spo2_obs})
        
        # 3. FHIR MedicationStatement Resources
        medications = patient_data.get("medications", [])
        for m in medications:
            med_res = {
                "resourceType": "MedicationStatement",
                "id": f"med-{m.get('id', '1')}",
                "status": "active",
                "medicationCodeableConcept": {
                    "text": m.get("name", "Unknown Medication")
                },
                "subject": {"reference": f"Patient/{patient_id}"},
                "dosage": [{
                    "text": f"{m.get('dosage', '')} {m.get('frequency', '')}".strip()
                }]
            }
            entries.append({"resource": med_res})

        # 4. FHIR AllergyIntolerance Resources
        allergies = patient_data.get("allergies", [])
        for a in allergies:
            allergy_res = {
                "resourceType": "AllergyIntolerance",
                "id": f"allergy-{a.get('id', '1')}",
                "clinicalStatus": {
                    "coding": [{"system": "http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical", "code": "active"}]
                },
                "verificationStatus": {
                    "coding": [{"system": "http://terminology.hl7.org/CodeSystem/allergyintolerance-verification", "code": "confirmed"}]
                },
                "code": {"text": a.get("allergen", "Unknown Allergen")},
                "subject": {"reference": f"Patient/{patient_id}"},
                "reaction": [{"manifestation": [{"text": a.get("reaction", "Reaction noted")}]}]
            }
            entries.append({"resource": allergy_res})

        bundle = {
            "resourceType": "Bundle",
            "id": f"fhir-bundle-{patient_id}",
            "meta": {
                "lastUpdated": datetime.datetime.utcnow().isoformat() + "Z"
            },
            "type": "collection",
            "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
            "entry": entries
        }
        
        return bundle
