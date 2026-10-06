def test_register_and_login_patient(client):
    reg_resp = client.post("/api/v1/auth/register", json={
        "email": "testpatient@healthsync.demo",
        "password": "Password123",
        "first_name": "Test",
        "last_name": "Patient",
        "role": "PATIENT"
    })
    assert reg_resp.status_code == 200
    data = reg_resp.json()
    assert data["email"] == "testpatient@healthsync.demo"

    # Login
    login_resp = client.post("/api/v1/auth/login", json={
        "email": "testpatient@healthsync.demo",
        "password": "Password123"
    })
    assert login_resp.status_code == 200
    token_data = login_resp.json()
    assert "access_token" in token_data
    assert token_data["role"] == "PATIENT"

def test_invalid_login(client):
    resp = client.post("/api/v1/auth/login", json={
        "email": "nonexistent@demo.com",
        "password": "WrongPassword"
    })
    assert resp.status_code == 401
