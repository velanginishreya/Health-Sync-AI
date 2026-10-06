import os
import csv
from sqlalchemy.orm import Session
from app.db.database import SessionLocal, engine, Base
from app.models.models import User, PatientProfile, MedicalHistory, UserRole
from app.utils.auth import get_password_hash

def import_synthea_csv(data_dir: str = "./data/raw/synthea"):
    if not os.path.exists(data_dir):
        print(f"Synthea data directory {data_dir} does not exist. Skipping optional CSV import.")
        return

    patients_csv = os.path.join(data_dir, "patients.csv")
    if not os.path.exists(patients_csv):
        print("patients.csv not found in Synthea directory.")
        return

    db = SessionLocal()
    try:
        with open(patients_csv, mode='r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            count = 0
            for row in reader:
                if count >= 10: # Limit to 10 for demo import
                    break
                email = f"{row.get('FIRST', 'patient').lower()}_{row.get('LAST', 'synthea').lower()}@synthea.demo"
                existing = db.query(User).filter(User.email == email).first()
                if not existing:
                    user = User(
                        email=email,
                        password_hash=get_password_hash("Patient@123"),
                        role=UserRole.PATIENT,
                        first_name=row.get('FIRST', 'Synthea'),
                        last_name=row.get('LAST', 'Patient'),
                        gender=row.get('GENDER'),
                        date_of_birth=row.get('BIRTHDATE')
                    )
                    db.add(user)
                    db.commit()
                    db.refresh(user)

                    profile = PatientProfile(user_id=user.id, location=row.get('CITY'))
                    db.add(profile)
                    db.commit()
                    count += 1
            print(f"Successfully imported {count} synthetic patients from Synthea CSV.")
    except Exception as e:
        print(f"Error reading Synthea CSV: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    import_synthea_csv()
