import os
import sys
from datetime import datetime, timedelta

# Ensure project and backend directories are in sys.path
script_dir = os.path.dirname(os.path.abspath(__file__))
project_dir = os.path.dirname(script_dir)
backend_dir = os.path.join(project_dir, "backend")
sys.path.insert(0, project_dir)
sys.path.insert(0, backend_dir)



from app.db.database import engine, Base, SessionLocal
from app.models.models import (
    User, UserRole, PatientProfile, MedicalHistory, FamilyHistory, Allergy,
    Medication, Vital, LabReport, LabResult, HealthEvent, EventType,
    Appointment, AppointmentStatus, DoctorPatient, AIConversation, AIMessage, AIInsight, InsightSeverity
)
from app.utils.auth import get_password_hash
from scripts.generate_demo_reports import create_synthetic_pdf

def seed_database():
    print("Re-creating database tables...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        print("Seeding Demo Users...")
        # 1. Demo Patient: Arjun Kumar
        patient_user = User(
            email="patient@healthsync.demo",
            password_hash=get_password_hash("Patient@123"),
            role=UserRole.PATIENT,
            first_name="Arjun",
            last_name="Kumar",
            phone="+1-555-0198",
            date_of_birth="1981-05-14",
            gender="Male"
        )
        db.add(patient_user)

        # Alias account arjun@healthsync.demo
        arjun_user = User(
            email="arjun@healthsync.demo",
            password_hash=get_password_hash("Patient@123"),
            role=UserRole.PATIENT,
            first_name="Arjun",
            last_name="Kumar",
            phone="+1-555-0199",
            date_of_birth="1981-05-14",
            gender="Male"
        )
        db.add(arjun_user)

        # 2. Demo Doctor: Dr. Robert Smith
        doctor_user = User(
            email="doctor@healthsync.demo",
            password_hash=get_password_hash("Doctor@123"),
            role=UserRole.DOCTOR,
            first_name="Robert",
            last_name="Smith",
            phone="+1-555-0200",
            date_of_birth="1975-08-20",
            gender="Male"
        )
        db.add(doctor_user)

        # 3. Demo Admin: System Admin
        admin_user = User(
            email="admin@healthsync.demo",
            password_hash=get_password_hash("Admin@123"),
            role=UserRole.ADMIN,
            first_name="System",
            last_name="Admin",
            phone="+1-555-0000",
            date_of_birth="1985-01-01",
            gender="Other"
        )
        db.add(admin_user)
        db.commit()

        # 4. Patient Profile for Arjun Kumar
        patient_profile = PatientProfile(
            user_id=patient_user.id,
            blood_group="O+",
            height=175.0,
            weight=78.0,
            emergency_contact="Priya Kumar (+1-555-0199)",
            occupation="Software Engineer",
            location="San Jose, CA",
            lifestyle={"diet": "vegetarian", "exercise": "2x weekly", "smoking": "non-smoker"}
        )
        db.add(patient_profile)

        # Profile for arjun_user
        arjun_profile = PatientProfile(
            user_id=arjun_user.id,
            blood_group="O+",
            height=175.0,
            weight=78.0,
            emergency_contact="Priya Kumar (+1-555-0199)",
            occupation="Software Engineer",
            location="San Jose, CA",
            lifestyle={"diet": "vegetarian", "exercise": "2x weekly", "smoking": "non-smoker"}
        )
        db.add(arjun_profile)
        db.commit()

        # 5. Doctor-Patient Assignments
        db.add(DoctorPatient(doctor_id=doctor_user.id, patient_id=patient_profile.id, status="ACTIVE"))
        db.add(DoctorPatient(doctor_id=doctor_user.id, patient_id=arjun_profile.id, status="ACTIVE"))
        db.commit()

        # Helper to populate patient data
        for p in [patient_profile, arjun_profile]:
            # Medical History
            db.add(MedicalHistory(
                patient_id=p.id,
                condition_name="Type 2 Diabetes Mellitus",
                diagnosis_date="2022-03-15",
                status="ACTIVE",
                description="Physician diagnosed. Managed with oral antihyperglycemic medication.",
                source="physician_recorded"
            ))
            db.add(MedicalHistory(
                patient_id=p.id,
                condition_name="Essential Hypertension",
                diagnosis_date="2023-01-10",
                status="ACTIVE",
                description="Elevated baseline blood pressure monitored by primary doctor.",
                source="physician_recorded"
            ))

            # Family History
            db.add(FamilyHistory(patient_id=p.id, relation="Father", condition="Type 2 Diabetes", age_at_diagnosis=50))
            db.add(FamilyHistory(patient_id=p.id, relation="Grandfather", condition="Coronary Artery Disease", age_at_diagnosis=62))

            # Allergies
            db.add(Allergy(patient_id=p.id, allergen="Penicillin", reaction="Skin Rash / Urticaria", severity="Moderate", notes="Avoid beta-lactam antibiotics."))

            # Active Medications
            db.add(Medication(
                patient_id=p.id,
                name="Metformin HCl",
                dosage="500 mg",
                frequency="Twice daily with meals",
                route="Oral",
                start_date="2022-03-20",
                prescribed_by="Dr. Robert Smith",
                status="ACTIVE"
            ))
            db.add(Medication(
                patient_id=p.id,
                name="Lisinopril",
                dosage="10 mg",
                frequency="Once daily in the morning",
                route="Oral",
                start_date="2023-01-15",
                prescribed_by="Dr. Robert Smith",
                status="ACTIVE"
            ))

            # Vitals History (Time-series)
            now = datetime.utcnow()
            vitals_data = [
                (now - timedelta(days=20), 138, 88, 74, 98.0, 98.6, 78.5, 138.0),
                (now - timedelta(days=15), 140, 90, 76, 98.0, 98.4, 78.2, 142.0),
                (now - timedelta(days=10), 136, 86, 72, 99.0, 98.6, 78.0, 135.0),
                (now - timedelta(days=5), 139, 89, 75, 98.0, 98.6, 78.1, 140.0),
                (now - timedelta(days=1), 138, 88, 74, 98.0, 98.6, 78.0, 136.0),
            ]
            for recorded_at, sys_bp, dia_bp, hr, spo2, temp, wt, gluc in vitals_data:
                db.add(Vital(
                    patient_id=p.id,
                    recorded_at=recorded_at,
                    systolic_bp=sys_bp,
                    diastolic_bp=dia_bp,
                    heart_rate=hr,
                    spo2=spo2,
                    temperature=temp,
                    weight=wt,
                    blood_glucose=gluc,
                    source="manual_entry"
                ))

            # Synthetic Reports
            cbc_path = create_synthetic_pdf(f"{p.id}_cbc.pdf", "Complete Blood Count (CBC)", "Arjun Kumar", [
                ["Hemoglobin", "13.2", "g/dL", "13.0 - 17.0", "NORMAL"],
                ["WBC Count", "7.5", "10^3/uL", "4.5 - 11.0", "NORMAL"],
                ["Platelet Count", "250", "10^3/uL", "150 - 450", "NORMAL"],
            ])
            rep1 = LabReport(
                patient_id=p.id,
                file_name="Arjun_Kumar_CBC.pdf",
                file_path=cbc_path,
                report_date="2026-09-01",
                report_type="Complete Blood Count (CBC)",
                extracted_text="Complete Blood Count Hemoglobin 13.2 g/dL WBC 7.5 Platelets 250",
                processing_status="COMPLETED"
            )
            db.add(rep1)
            db.commit()

            db.add(LabResult(report_id=rep1.id, test_name="Hemoglobin", value=13.2, unit="g/dL", reference_range="13.0 - 17.0", status="NORMAL"))
            db.add(LabResult(report_id=rep1.id, test_name="WBC Count", value=7.5, unit="10^3/uL", reference_range="4.5 - 11.0", status="NORMAL"))

            lipid_path = create_synthetic_pdf(f"{p.id}_lipid.pdf", "Lipid Panel", "Arjun Kumar", [
                ["Total Cholesterol", "215.0", "mg/dL", "< 200", "HIGH"],
                ["Triglycerides", "180.0", "mg/dL", "< 150", "HIGH"],
                ["HDL Cholesterol", "42.0", "mg/dL", "> 40", "NORMAL"],
                ["LDL Cholesterol", "137.0", "mg/dL", "< 100", "HIGH"],
            ])
            rep2 = LabReport(
                patient_id=p.id,
                file_name="Arjun_Kumar_Lipid_Panel.pdf",
                file_path=lipid_path,
                report_date="2026-09-10",
                report_type="Lipid Panel",
                extracted_text="Total Cholesterol 215 mg/dL Triglycerides 180 mg/dL HDL 42 mg/dL LDL 137 mg/dL",
                processing_status="COMPLETED"
            )
            db.add(rep2)
            db.commit()

            db.add(LabResult(report_id=rep2.id, test_name="Total Cholesterol", value=215.0, unit="mg/dL", reference_range="< 200", status="HIGH"))
            db.add(LabResult(report_id=rep2.id, test_name="Triglycerides", value=180.0, unit="mg/dL", reference_range="< 150", status="HIGH"))
            db.add(LabResult(report_id=rep2.id, test_name="LDL Cholesterol", value=137.0, unit="mg/dL", reference_range="< 100", status="HIGH"))

            # Appointments
            db.add(Appointment(
                patient_id=p.id,
                doctor_id=doctor_user.id,
                appointment_date="2026-09-15",
                appointment_time="10:00 AM",
                reason="Routine Diabetes & Blood Pressure Clinical Follow-up",
                status=AppointmentStatus.SCHEDULED,
                notes="Review recent Lipid Panel and HbA1c parameters."
            ))

            # Health Events Timeline
            events = [
                (EventType.APPOINTMENT, "Scheduled Doctor Appointment", "Clinical follow-up with Dr. Robert Smith", "2026-09-15"),
                (EventType.LAB_REPORT, "Uploaded Lab Report: Lipid Panel", "Parameters extracted: Cholesterol 215 mg/dL (HIGH)", "2026-09-10"),
                (EventType.VITAL, "Logged Blood Pressure: 138/88 mmHg", "Routine vitals recorded in Digital Twin profile", "2026-09-08"),
                (EventType.MEDICATION, "Active Prescription Confirmed: Metformin 500mg", "Twice daily with meals", "2026-09-01"),
                (EventType.LAB_REPORT, "Uploaded Lab Report: Complete Blood Count", "Parameters normal. Hemoglobin: 13.2 g/dL", "2026-09-01")
            ]
            for ev_type, title, desc, ev_date in events:
                db.add(HealthEvent(patient_id=p.id, event_type=ev_type, title=title, description=desc, event_date=ev_date))

            # AI Insights
            db.add(AIInsight(
                patient_id=p.id,
                insight_type="BP_ELEVATED_TREND",
                title="Potential Elevated Blood Pressure Trend",
                description="Your recent blood pressure readings (138/88, 140/90) appear higher than baseline. Consider discussing this trend with Dr. Smith.",
                severity=InsightSeverity.MODERATE,
                confidence=0.92,
                source="RiskAnalysisService"
            ))
            db.add(AIInsight(
                patient_id=p.id,
                insight_type="LIPID_ABNORMALITY",
                title="Elevated Total Cholesterol Parameter",
                description="Latest Lipid Panel indicates Total Cholesterol of 215 mg/dL (Reference < 200 mg/dL). Recommended to review dietary intake.",
                severity=InsightSeverity.MODERATE,
                confidence=0.95,
                source="RiskAnalysisService"
            ))

        db.commit()
        print("Database Seeding Completed Successfully!")
        print("\n--- DEMO ACCOUNTS CREATED ---")
        print("Patient Account 1 : patient@healthsync.demo / Patient@123")
        print("Patient Account 2 : arjun@healthsync.demo / Patient@123")
        print("Doctor Account    : doctor@healthsync.demo / Doctor@123")
        print("Admin Account     : admin@healthsync.demo / Admin@123")
        print("-----------------------------\n")

    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
