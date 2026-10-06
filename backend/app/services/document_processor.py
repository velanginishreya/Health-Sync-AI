import fitz # PyMuPDF
import re
import os
import pdfplumber
from typing import List, Dict, Any, Tuple

class DocumentProcessor:
    
    @staticmethod
    def extract_text_from_pdf(file_path: str) -> str:
        text = ""
        try:
            doc = fitz.open(file_path)
            for page in doc:
                text += page.get_text() + "\n"
            doc.close()
        except Exception:
            # Fallback to pdfplumber
            try:
                with pdfplumber.open(file_path) as pdf:
                    for page in pdf.pages:
                        extracted = page.extract_text()
                        if extracted:
                            text += extracted + "\n"
            except Exception:
                text = ""
        return text

    @classmethod
    def parse_lab_report(cls, text: str) -> Tuple[str, List[Dict[str, Any]]]:
        """
        Parses text extracted from a lab report to identify report type and test parameters.
        Returns (report_type, results_list)
        """
        lower_text = text.lower()
        report_type = "General Lab Report"
        
        if "complete blood count" in lower_text or "cbc" in lower_text or "hemoglobin" in lower_text:
            report_type = "Complete Blood Count (CBC)"
        elif "lipid" in lower_text or "cholesterol" in lower_text or "triglycerides" in lower_text:
            report_type = "Lipid Panel"
        elif "metabolic" in lower_text or "creatinine" in lower_text or "glucose" in lower_text:
            report_type = "Basic Metabolic Panel"
        elif "thyroid" in lower_text or "tsh" in lower_text:
            report_type = "Thyroid Function Test"
        elif "hba1c" in lower_text or "glycated" in lower_text:
            report_type = "HbA1c Report"

        results = []
        
        # Regular expression patterns for common test parameters
        # Example pattern: TestName Value Unit RefRange
        patterns = [
            # Hemoglobin 13.2 g/dL 13-17
            (r'Hemoglobin\s*[:\-]?\s*(\d+\.?\d*)\s*([a-zA-Z/]+)?\s*\(?(\d+\-?\d*\.?\d*)?\)?', "Hemoglobin", "g/dL", "13.0 - 17.0"),
            (r'WBC\s*Count|White Blood Cell\s*[:\-]?\s*(\d+\.?\d*)\s*([a-zA-Z/0-9^]+)?\s*\(?(\d+\-?\d*\.?\d*)?\)?', "WBC Count", "10^3/uL", "4.5 - 11.0"),
            (r'Platelets?\s*[:\-]?\s*(\d+\.?\d*)\s*([a-zA-Z/0-9^]+)?\s*\(?(\d+\-?\d*\.?\d*)?\)?', "Platelet Count", "10^3/uL", "150 - 450"),
            (r'Total Cholesterol\s*[:\-]?\s*(\d+\.?\d*)\s*([a-zA-Z/]+)?\s*\(?(\d+\-?\d*\.?\d*)?\)?', "Total Cholesterol", "mg/dL", "< 200"),
            (r'Triglycerides?\s*[:\-]?\s*(\d+\.?\d*)\s*([a-zA-Z/]+)?\s*\(?(\d+\-?\d*\.?\d*)?\)?', "Triglycerides", "mg/dL", "< 150"),
            (r'HDL\s*Cholesterol|HDL\s*[:\-]?\s*(\d+\.?\d*)\s*([a-zA-Z/]+)?\s*\(?(\d+\-?\d*\.?\d*)?\)?', "HDL Cholesterol", "mg/dL", "> 40"),
            (r'LDL\s*Cholesterol|LDL\s*[:\-]?\s*(\d+\.?\d*)\s*([a-zA-Z/]+)?\s*\(?(\d+\-?\d*\.?\d*)?\)?', "LDL Cholesterol", "mg/dL", "< 100"),
            (r'Fast(?:ing)? Blood Sugar|Fasting Glucose|Blood Glucose\s*[:\-]?\s*(\d+\.?\d*)\s*([a-zA-Z/]+)?\s*\(?(\d+\-?\d*\.?\d*)?\)?', "Fasting Blood Glucose", "mg/dL", "70 - 99"),
            (r'HbA1c\s*[:\-]?\s*(\d+\.?\d*)\s*(%)?\s*\(?(\d+\-?\d*\.?\d*)?\)?', "HbA1c", "%", "4.0 - 5.6"),
            (r'TSH\s*[:\-]?\s*(\d+\.?\d*)\s*([a-zA-Z/]+)?\s*\(?(\d+\-?\d*\.?\d*)?\)?', "TSH", "uIU/mL", "0.4 - 4.0"),
            (r'Creatinine\s*[:\-]?\s*(\d+\.?\d*)\s*([a-zA-Z/]+)?\s*\(?(\d+\-?\d*\.?\d*)?\)?', "Creatinine", "mg/dL", "0.7 - 1.3"),
        ]

        for pattern, test_name, default_unit, default_ref in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                try:
                    val = float(match.group(1))
                    unit = match.group(2) if match.group(2) else default_unit
                    ref_range = match.group(3) if len(match.groups()) >= 3 and match.group(3) else default_ref
                    
                    status = cls._evaluate_status(test_name, val)

                    results.append({
                        "test_name": test_name,
                        "value": val,
                        "unit": unit,
                        "reference_range": ref_range,
                        "status": status,
                        "confidence": "HIGH"
                    })
                except (ValueError, IndexError):
                    pass

        # Generic line scanner if standard regexes didn't capture everything
        if not results:
            lines = text.split("\n")
            for line in lines:
                parts = line.strip().split()
                if len(parts) >= 2:
                    name = parts[0]
                    for p in parts[1:]:
                        try:
                            val = float(p)
                            results.append({
                                "test_name": name,
                                "value": val,
                                "unit": "unit",
                                "reference_range": "See Lab Ref",
                                "status": "NORMAL",
                                "confidence": "MODERATE"
                            })
                            break
                        except ValueError:
                            continue

        return report_type, results

    @staticmethod
    def _evaluate_status(test_name: str, val: float) -> str:
        test_name = test_name.lower()
        if "hemoglobin" in test_name:
            if val < 13.0: return "LOW"
            if val > 17.0: return "HIGH"
        elif "cholesterol" in test_name:
            if val > 200.0: return "HIGH"
        elif "glucose" in test_name:
            if val > 100.0: return "HIGH"
            if val < 70.0: return "LOW"
        elif "hba1c" in test_name:
            if val > 5.7: return "HIGH"
        elif "triglyceride" in test_name:
            if val > 150.0: return "HIGH"
        return "NORMAL"

    @classmethod
    def parse_prescription(cls, text: str) -> List[Dict[str, Any]]:
        """
        Extracts prescription details: doctor, date, medicine, dosage, frequency, duration.
        """
        lines = [l.strip() for l in text.split("\n") if l.strip()]
        medicines = []

        # Common medicine regex pattern e.g. "Metformin 500mg twice daily for 30 days"
        med_pattern = r'([A-Za-z0-9\s]+)\s+(\d+\s*mg|\d+\s*g|\d+\s*ml)\s+([A-Za-z0-9\s]+)'
        
        for line in lines:
            match = re.search(med_pattern, line, re.IGNORECASE)
            if match:
                medicines.append({
                    "medicine": match.group(1).strip(),
                    "dosage": match.group(2).strip(),
                    "frequency": match.group(3).strip(),
                    "duration": "As directed"
                })

        return medicines
