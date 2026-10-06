from app.models.models import User, UserRole, PatientProfile, DoctorPatient
from app.utils.auth import get_password_hash

def test_unassigned_doctor_access_forbidden(client, db):
    # Create doctor
    doc = User(
        email="unassigned_doc@demo.com",
        password_hash=get_password_hash("Doctor123"),
        role=UserRole.DOCTOR,
        first_name="Unassigned",
        last_name="Doctor"
    )
    db.add(doc)

    # Create patient
    pat = User(
        email="isolated_patient@demo.com",
        password_hash=get_password_hash("Patient123"),
        role=UserRole.PATIENT,
        first_name="Isolated",
        last_name="Patient"
    )
    db.add(pat)
    db.commit()

    profile = PatientProfile(user_id=pat.id)
    db.add(profile)
    db.commit()

    # Login as Doctor
    login_resp = client.post("/api/v1/auth/login", json={
        "email": "unassigned_doc@demo.com",
        "password": "Doctor123"
    })
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Doctor attempts to view patient not assigned to them
    resp = client.get(f"/api/v1/doctor/patients/{profile.id}", headers=headers)
    assert resp.status_code == 403
    assert "Access Denied" in resp.json()["detail"]

def test_assigned_doctor_access_allowed(client, db):
    # Create doctor
    doc = User(
        email="assigned_doc@demo.com",
        password_hash=get_password_hash("Doctor123"),
        role=UserRole.DOCTOR,
        first_name="Assigned",
        last_name="Doctor"
    )
    db.add(doc)

    # Create patient
    pat = User(
        email="assigned_patient@demo.com",
        password_hash=get_password_hash("Patient123"),
        role=UserRole.PATIENT,
        first_name="Assigned",
        last_name="Patient"
    )
    db.add(pat)
    db.commit()

    profile = PatientProfile(user_id=pat.id)
    db.add(profile)
    db.commit()

    # Assign patient to doctor
    assignment = DoctorPatient(doctor_id=doc.id, patient_id=profile.id, status="ACTIVE")
    db.add(assignment)
    db.commit()

    # Login as Doctor
    login_resp = client.post("/api/v1/auth/login", json={
        "email": "assigned_doc@demo.com",
        "password": "Doctor123"
    })
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Doctor accesses assigned patient
    resp = client.get(f"/api/v1/doctor/patients/{profile.id}", headers=headers)
    assert resp.status_code == 200
    assert "patient" in resp.json()
