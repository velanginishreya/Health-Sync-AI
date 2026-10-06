"""
Comprehensive Feature & Database Persistence Test Suite
Tests all input fields, persistence, security boundaries, and enterprise clinical endpoints.
"""

import pytest
from app.models.models import User, UserRole, PatientProfile, MedicalHistory, Allergy, Medication, Vital, Appointment, DoctorPatient, HealthEvent
from app.utils.auth import create_access_token, get_password_hash

@pytest.fixture
def test_users_setup(db):
    # Create test patient user & profile
    patient_user = User(
        first_name="Test",
        last_name="Patient",
        email="testpatient@healthsync.org",
        password_hash=get_password_hash("Patient@123"),
        role=UserRole.PATIENT
    )
    db.add(patient_user)
    db.flush()

    patient_profile = PatientProfile(
        user_id=patient_user.id,
        blood_group="O+",
        height=175.0,
        weight=72.0,
        lifestyle={"diet": "Balanced", "exercise": "Regular"}
    )
    db.add(patient_profile)

    # Create assigned doctor user
    doctor_user = User(
        first_name="Dr. Test",
        last_name="Doctor",
        email="testdoctor@healthsync.org",
        password_hash=get_password_hash("Doctor@123"),
        role=UserRole.DOCTOR
    )
    db.add(doctor_user)
    db.flush()

    # Create doctor-patient assignment
    dp = DoctorPatient(doctor_id=doctor_user.id, patient_id=patient_profile.id, status="ACTIVE")
    db.add(dp)

    # Create admin user
    admin_user = User(
        first_name="Test",
        last_name="Admin",
        email="testadmin@healthsync.org",
        password_hash=get_password_hash("Admin@123"),
        role=UserRole.ADMIN
    )
    db.add(admin_user)
    
    db.commit()

    patient_token = create_access_token({"sub": patient_user.id, "role": patient_user.role.value})
    doctor_token = create_access_token({"sub": doctor_user.id, "role": doctor_user.role.value})
    admin_token = create_access_token({"sub": admin_user.id, "role": admin_user.role.value})

    return {
        "patient": patient_user,
        "patient_profile": patient_profile,
        "doctor": doctor_user,
        "admin": admin_user,
        "patient_headers": {"Authorization": f"Bearer {patient_token}"},
        "doctor_headers": {"Authorization": f"Bearer {doctor_token}"},
        "admin_headers": {"Authorization": f"Bearer {admin_token}"}
    }


def test_patient_profile_update_persistence(client, test_users_setup, db):
    headers = test_users_setup["patient_headers"]
    profile_id = test_users_setup["patient_profile"].id

    update_payload = {
        "height": 180.0,
        "weight": 78.5,
        "lifestyle": {"diet": "Strict Keto", "exercise": "4x Weekly Cardio"}
    }

    response = client.put("/api/v1/patients/me", json=update_payload, headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["height"] == 180.0
    assert data["weight"] == 78.5

    # Verify persistence directly in database session
    db_profile = db.query(PatientProfile).filter(PatientProfile.id == profile_id).first()
    assert db_profile.height == 180.0
    assert db_profile.weight == 78.5


def test_medical_history_crud_persistence(client, test_users_setup, db):
    headers = test_users_setup["patient_headers"]

    payload = {
        "condition_name": "Essential Hypertension",
        "diagnosis_date": "2024-01-10",
        "status": "CHRONIC",
        "notes": "Controlled with medication"
    }

    # 1. Create
    res = client.post("/api/v1/patients/me/medical-history", json=payload, headers=headers)
    assert res.status_code == 200
    item_id = res.json()["id"]

    # Verify DB insertion
    record = db.query(MedicalHistory).filter(MedicalHistory.id == item_id).first()
    assert record is not None
    assert record.condition_name == "Essential Hypertension"

    # 2. Delete
    del_res = client.delete(f"/api/v1/patients/me/medical-history/{item_id}", headers=headers)
    assert del_res.status_code == 200

    # Verify DB deletion
    deleted_record = db.query(MedicalHistory).filter(MedicalHistory.id == item_id).first()
    assert deleted_record is None


def test_allergies_crud_persistence(client, test_users_setup, db):
    headers = test_users_setup["patient_headers"]

    payload = {
        "allergen": "Penicillin",
        "severity": "HIGH",
        "reaction": "Anaphylactic Hives"
    }

    res = client.post("/api/v1/patients/me/allergies", json=payload, headers=headers)
    assert res.status_code == 200
    allergy_id = res.json()["id"]

    db_allergy = db.query(Allergy).filter(Allergy.id == allergy_id).first()
    assert db_allergy is not None
    assert db_allergy.allergen == "Penicillin"


def test_medications_ddi_and_persistence(client, test_users_setup, db):
    headers = test_users_setup["patient_headers"]

    med1 = {"name": "Lisinopril", "dosage": "10mg", "frequency": "Daily", "prescribed_by": "Dr. Smith", "status": "ACTIVE"}
    med2 = {"name": "Spironolactone", "dosage": "25mg", "frequency": "Daily", "prescribed_by": "Dr. Smith", "status": "ACTIVE"}

    res1 = client.post("/api/v1/patients/me/medications", json=med1, headers=headers)
    res2 = client.post("/api/v1/patients/me/medications", json=med2, headers=headers)
    assert res1.status_code == 200
    assert res2.status_code == 200

    # Check DDI interaction check endpoint
    ddi_res = client.get("/api/v1/patients/me/medications/check-interactions", headers=headers)
    assert ddi_res.status_code == 200
    interactions = ddi_res.json()["interactions_found"]
    assert len(interactions) > 0
    assert interactions[0]["severity"] == "HIGH"
    assert "Hyperkalemia" in interactions[0]["title"]


def test_vitals_streaming_and_threshold_alerts(client, test_users_setup, db):
    headers = test_users_setup["patient_headers"]

    stream_res = client.post("/api/v1/patients/me/vitals/simulate-stream", headers=headers)
    assert stream_res.status_code == 200
    data = stream_res.json()
    assert "vital" in data
    assert "dl_neural_network_assessment" in data


def test_fhir_organ_systems_ascvd_endpoints(client, test_users_setup):
    headers = test_users_setup["patient_headers"]

    # 1. FHIR Export
    fhir_res = client.get("/api/v1/patients/me/fhir-export", headers=headers)
    assert fhir_res.status_code == 200
    fhir_data = fhir_res.json()
    assert fhir_data["resourceType"] == "Bundle"
    assert len(fhir_data["entry"]) >= 1

    # 2. Organ Systems
    organ_res = client.get("/api/v1/patients/me/organ-systems", headers=headers)
    assert organ_res.status_code == 200
    organ_data = organ_res.json()
    assert "cardiovascular" in organ_data
    assert "endocrine_metabolic" in organ_data

    # 3. ASCVD Risk Score
    ascvd_res = client.get("/api/v1/patients/me/ascvd-risk", headers=headers)
    assert ascvd_res.status_code == 200
    ascvd_data = ascvd_res.json()
    assert "ascvd_10yr_risk_percent" in ascvd_data


def test_doctor_clinical_notes_persistence(client, test_users_setup, db):
    doc_headers = test_users_setup["doctor_headers"]
    patient_id = test_users_setup["patient_profile"].id

    note_text = "Patient presenting with controlled hypertension. Maintain Lisinopril 10mg."

    res = client.post(f"/api/v1/doctor/patients/{patient_id}/notes?note={note_text}", headers=doc_headers)
    assert res.status_code == 200
    assert "added successfully" in res.json()["message"]

    # Verify HealthEvent in DB
    event = db.query(HealthEvent).filter(
        HealthEvent.patient_id == patient_id,
        HealthEvent.source == "doctor"
    ).first()
    assert event is not None
    assert "controlled hypertension" in event.description


def test_hipaa_anonymized_export(client, test_users_setup):
    admin_headers = test_users_setup["admin_headers"]

    res = client.get("/api/v1/admin/export-anonymized", headers=admin_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["total_subjects"] >= 1
    subject = data["subjects"][0]
    assert "name" in subject and "ANON-SUBJECT" in subject["name"]
    assert "date_of_birth" not in subject
    assert "age_group" in subject
