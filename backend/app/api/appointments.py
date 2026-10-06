from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.models.models import Appointment, PatientProfile, User, UserRole, HealthEvent, EventType, AppointmentStatus
from app.schemas.schemas import AppointmentCreate, AppointmentOut
from app.utils.auth import get_current_user

router = APIRouter(prefix="/appointments", tags=["Appointments"])

@router.get("", response_model=List[AppointmentOut])
def get_appointments(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role == UserRole.PATIENT:
        profile = db.query(PatientProfile).filter(PatientProfile.user_id == current_user.id).first()
        if not profile:
            return []
        appts = db.query(Appointment).filter(Appointment.patient_id == profile.id).all()
    elif current_user.role == UserRole.DOCTOR:
        appts = db.query(Appointment).filter(Appointment.doctor_id == current_user.id).all()
    else: # Admin
        appts = db.query(Appointment).all()

    res = []
    for a in appts:
        doc = db.query(User).filter(User.id == a.doctor_id).first()
        pat_profile = db.query(PatientProfile).filter(PatientProfile.id == a.patient_id).first()
        pat_user = pat_profile.user if pat_profile else None
        
        out = AppointmentOut.model_validate(a)
        out.doctor_name = f"Dr. {doc.first_name} {doc.last_name}" if doc else "Doctor"
        out.patient_name = f"{pat_user.first_name} {pat_user.last_name}" if pat_user else "Patient"
        res.append(out)
    return res

@router.get("/doctors")
def list_available_doctors(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Directory of active doctors, for any signed-in user.

    Patients need this to book a visit. The admin user-directory endpoint is
    admin-only by design, so this exposes the minimum: id and display name.
    """
    doctors = db.query(User).filter(User.role == UserRole.DOCTOR, User.is_active.is_(True)).all()
    return [{"id": d.id, "name": f"Dr. {d.first_name} {d.last_name}"} for d in doctors]


@router.post("", response_model=AppointmentOut)
def book_appointment(
    item: AppointmentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != UserRole.PATIENT:
        raise HTTPException(status_code=403, detail="Only patients can book appointments")
    
    profile = db.query(PatientProfile).filter(PatientProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Patient profile not found")

    doctor = db.query(User).filter(User.id == item.doctor_id, User.role == UserRole.DOCTOR).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")

    appt = Appointment(
        patient_id=profile.id,
        doctor_id=doctor.id,
        appointment_date=item.appointment_date,
        appointment_time=item.appointment_time,
        reason=item.reason,
        status=AppointmentStatus.SCHEDULED
    )
    db.add(appt)
    
    event = HealthEvent(
        patient_id=profile.id,
        event_type=EventType.APPOINTMENT,
        title=f"Scheduled Appointment with Dr. {doctor.first_name} {doctor.last_name}",
        description=f"Date: {item.appointment_date} at {item.appointment_time}",
        event_date=item.appointment_date,
        source="system"
    )
    db.add(event)
    db.commit()
    db.refresh(appt)

    out = AppointmentOut.model_validate(appt)
    out.doctor_name = f"Dr. {doctor.first_name} {doctor.last_name}"
    out.patient_name = f"{current_user.first_name} {current_user.last_name}"
    return out

@router.put("/{appt_id}", response_model=AppointmentOut)
def update_appointment_status(
    appt_id: str,
    status_val: AppointmentStatus,
    notes: str = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    appt = db.query(Appointment).filter(Appointment.id == appt_id).first()
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")

    if current_user.role == UserRole.PATIENT:
        profile = db.query(PatientProfile).filter(PatientProfile.user_id == current_user.id).first()
        if appt.patient_id != profile.id:
            raise HTTPException(status_code=403, detail="Forbidden")
    elif current_user.role == UserRole.DOCTOR:
        if appt.doctor_id != current_user.id:
            raise HTTPException(status_code=403, detail="Forbidden")

    appt.status = status_val
    if notes:
        appt.notes = notes
    db.commit()
    db.refresh(appt)

    out = AppointmentOut.model_validate(appt)
    return out
