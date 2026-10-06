import os
import uuid
import aiofiles
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Request
from sqlalchemy.orm import Session
from typing import List
from app.config import settings
from app.db.database import get_db
from app.models.models import LabReport, LabResult, PatientProfile, HealthEvent, EventType
from app.schemas.schemas import LabReportOut
from app.api.patients import get_current_patient_profile
from app.services.document_processor import DocumentProcessor
from app.services.risk_analysis import RiskAnalysisService
from app.services.audit_service import AuditService

router = APIRouter(prefix="/patients/me/reports", tags=["Lab Reports"])

ALLOWED_EXTENSIONS = {".pdf", ".png", ".jpg", ".jpeg"}

@router.post("/upload", response_model=LabReportOut)
async def upload_report(
    request: Request,
    file: UploadFile = File(...),
    profile: PatientProfile = Depends(get_current_patient_profile),
    db: Session = Depends(get_db)
):
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Invalid file type. Allowed: PDF, PNG, JPG, JPEG")

    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    saved_filename = f"{uuid.uuid4()}{ext}"
    saved_path = os.path.join(settings.UPLOAD_DIR, saved_filename)

    # Read and save file content
    contents = await file.read()
    if len(contents) > settings.MAX_FILE_SIZE_MB * 1024 * 1024:
        raise HTTPException(status_code=413, detail=f"File exceeds maximum size limit of {settings.MAX_FILE_SIZE_MB}MB")

    async with aiofiles.open(saved_path, "wb") as f:
        await f.write(contents)

    # Upload file directly to Supabase Storage Bucket 'data'
    from app.db.supabase_client import supabase_client
    content_mime = "application/pdf" if ext == ".pdf" else "image/jpeg"
    supabase_public_url = supabase_client.upload_file_to_bucket(
        bucket_name="data",
        file_path=f"reports/{saved_filename}",
        file_bytes=contents,
        content_type=content_mime
    )

    # Document Extraction Pipeline
    extracted_text = ""
    report_type = "General Lab Report"
    extracted_results = []

    if ext == ".pdf":
        extracted_text = DocumentProcessor.extract_text_from_pdf(saved_path)
        report_type, extracted_results = DocumentProcessor.parse_lab_report(extracted_text)
    else:
        extracted_text = f"Scanned Report Image ({file.filename})"
        report_type = "Medical Image Report"

    report = LabReport(
        patient_id=profile.id,
        file_name=file.filename,
        file_path=saved_path,
        report_date="Today",
        report_type=report_type,
        extracted_text=extracted_text,
        processing_status="COMPLETED"
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    for item in extracted_results:
        lab_res = LabResult(
            report_id=report.id,
            test_name=item["test_name"],
            value=item["value"],
            unit=item["unit"],
            reference_range=item["reference_range"],
            status=item["status"],
            confidence=item["confidence"]
        )
        db.add(lab_res)

    event = HealthEvent(
        patient_id=profile.id,
        event_type=EventType.LAB_REPORT,
        title=f"Uploaded: {report_type}",
        description=f"Extracted {len(extracted_results)} parameters from {file.filename}",
        event_date="Today",
        source="upload"
    )
    db.add(event)
    db.commit()
    db.refresh(report)

    AuditService.log(db, action="UPLOAD_REPORT", resource_type="LabReport", user_id=profile.user_id, resource_id=report.id)
    RiskAnalysisService.evaluate_patient_trends(db, profile.id)
    return report

@router.get("", response_model=List[LabReportOut])
def get_my_reports(profile: PatientProfile = Depends(get_current_patient_profile), db: Session = Depends(get_db)):
    return db.query(LabReport).filter(LabReport.patient_id == profile.id).order_by(LabReport.created_at.desc()).all()

@router.get("/{report_id}", response_model=LabReportOut)
def get_report_detail(report_id: str, profile: PatientProfile = Depends(get_current_patient_profile), db: Session = Depends(get_db)):
    report = db.query(LabReport).filter(LabReport.id == report_id, LabReport.patient_id == profile.id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Lab report not found")
    AuditService.log(db, action="VIEW_REPORT", resource_type="LabReport", user_id=profile.user_id, resource_id=report.id)
    return report

@router.delete("/{report_id}")
def delete_report(report_id: str, profile: PatientProfile = Depends(get_current_patient_profile), db: Session = Depends(get_db)):
    report = db.query(LabReport).filter(LabReport.id == report_id, LabReport.patient_id == profile.id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Lab report not found")
    
    if os.path.exists(report.file_path):
        try:
            os.remove(report.file_path)
        except Exception:
            pass

    db.delete(report)
    db.commit()
    return {"message": "Report deleted successfully"}

@router.post("/generate-dynamic", response_model=LabReportOut)
def generate_dynamic_lab_report(
    report_type: str = "Complete Blood Count (CBC)",
    profile: PatientProfile = Depends(get_current_patient_profile),
    db: Session = Depends(get_db)
):
    import random
    from scripts.generate_demo_reports import create_synthetic_pdf

    user_name = f"{profile.user.first_name} {profile.user.last_name}" if profile.user else "Patient"
    file_name = f"dynamic_{uuid.uuid4().hex[:8]}_{report_type.replace(' ', '_').lower()}.pdf"

    if "CBC" in report_type or "Blood" in report_type:
        hb_val = round(random.uniform(11.5, 16.5), 1)
        wbc_val = round(random.uniform(4.0, 11.5), 1)
        test_data = [
            ["Hemoglobin", str(hb_val), "g/dL", "13.0 - 17.0", "LOW" if hb_val < 13 else "NORMAL"],
            ["WBC Count", str(wbc_val), "10^3/uL", "4.5 - 11.0", "HIGH" if wbc_val > 11 else "NORMAL"]
        ]
    elif "Lipid" in report_type:
        chol = round(random.uniform(170, 245), 1)
        trig = round(random.uniform(120, 210), 1)
        test_data = [
            ["Total Cholesterol", str(chol), "mg/dL", "< 200", "HIGH" if chol > 200 else "NORMAL"],
            ["Triglycerides", str(trig), "mg/dL", "< 150", "HIGH" if trig > 150 else "NORMAL"]
        ]
    else:
        hba1c = round(random.uniform(5.4, 7.2), 1)
        test_data = [
            ["HbA1c", str(hba1c), "%", "4.0 - 5.6", "HIGH" if hba1c > 5.6 else "NORMAL"]
        ]

    saved_path = create_synthetic_pdf(file_name, report_type, user_name, test_data)
    extracted_text = DocumentProcessor.extract_text_from_pdf(saved_path)
    parsed_type, extracted_results = DocumentProcessor.parse_lab_report(extracted_text)

    # Upload generated PDF to Supabase Storage Bucket 'data'
    try:
        from app.db.supabase_client import supabase_client
        with open(saved_path, "rb") as pdf_file:
            pdf_bytes = pdf_file.read()
        supabase_client.upload_file_to_bucket(
            bucket_name="data",
            file_path=f"generated_reports/{file_name}",
            file_bytes=pdf_bytes,
            content_type="application/pdf"
        )
    except Exception as e:
        print(f"[Supabase Storage Upload Warning] {e}")

    report = LabReport(
        patient_id=profile.id,
        file_name=file_name,
        file_path=saved_path,
        report_date="Today",
        report_type=report_type,
        extracted_text=extracted_text,
        processing_status="COMPLETED"
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    for item in extracted_results:
        lab_res = LabResult(
            report_id=report.id,
            test_name=item["test_name"],
            value=item["value"],
            unit=item["unit"],
            reference_range=item["reference_range"],
            status=item["status"],
            confidence=item["confidence"]
        )
        db.add(lab_res)

    event = HealthEvent(
        patient_id=profile.id,
        event_type=EventType.LAB_REPORT,
        title=f"Dynamically Generated Report: {report_type}",
        description=f"Automated Document Processing extracted {len(extracted_results)} parameters.",
        event_date="Today",
        source="dynamic_generator"
    )
    db.add(event)
    db.commit()
    db.refresh(report)

    RiskAnalysisService.evaluate_patient_trends(db, profile.id)
    return report

