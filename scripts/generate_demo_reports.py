import os
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

OUTPUT_DIR = "./storage/uploads"
os.makedirs(OUTPUT_DIR, exist_ok=True)

def create_synthetic_pdf(filename: str, report_title: str, patient_name: str, test_data: list):
    filepath = os.path.join(OUTPUT_DIR, filename)
    doc = SimpleDocTemplate(filepath, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontSize=18,
        textColor=colors.HexColor('#0F172A'),
        spaceAfter=6
    )
    banner_style = ParagraphStyle(
        'Banner',
        parent=styles['Normal'],
        fontSize=10,
        textColor=colors.HexColor('#DC2626'),
        spaceAfter=12
    )
    text_style = ParagraphStyle(
        'BodyTextCustom',
        parent=styles['Normal'],
        fontSize=10,
        textColor=colors.HexColor('#334155')
    )

    elements = []

    # Banner
    elements.append(Paragraph("<b>SYNTHETIC DEMO DATA — NOT A REAL MEDICAL RECORD</b>", banner_style))
    elements.append(Paragraph(f"<b>METROPOLIS DIAGNOSTICS & RESEARCH</b>", title_style))
    elements.append(Paragraph(f"<b>Lab Report Type:</b> {report_title}", styles['Heading2']))
    elements.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#CBD5E1'), spaceAfter=10))

    elements.append(Paragraph(f"<b>Patient Name:</b> {patient_name} &nbsp;&nbsp;&nbsp;&nbsp; <b>Age/Gender:</b> 45 / Male", text_style))
    elements.append(Paragraph(f"<b>Referred By:</b> Dr. Robert Smith, M.D. &nbsp;&nbsp;&nbsp;&nbsp; <b>Date:</b> Sep 10, 2026", text_style))
    elements.append(Spacer(1, 15))

    # Table
    table_data = [["Test Name", "Observed Value", "Unit", "Reference Range", "Status"]]
    for row in test_data:
        table_data.append(row)

    t = Table(table_data, colWidths=[180, 90, 80, 110, 80])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#F1F5F9')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor('#0F172A')),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
        ('ALIGN', (1, 1), (-1, -1), 'CENTER'),
    ]))
    elements.append(t)
    elements.append(Spacer(1, 20))
    elements.append(Paragraph("<i>End of Laboratory Diagnostic Summary Report.</i>", text_style))

    doc.build(elements)
    print(f"Generated synthetic lab report: {filepath}")
    return filepath

if __name__ == "__main__":
    create_synthetic_pdf(
        "arjun_kumar_cbc.pdf",
        "Complete Blood Count (CBC)",
        "Arjun Kumar",
        [
            ["Hemoglobin", "13.2", "g/dL", "13.0 - 17.0", "NORMAL"],
            ["WBC Count", "7.5", "10^3/uL", "4.5 - 11.0", "NORMAL"],
            ["Platelet Count", "250", "10^3/uL", "150 - 450", "NORMAL"],
        ]
    )
    create_synthetic_pdf(
        "arjun_kumar_lipid.pdf",
        "Lipid Panel",
        "Arjun Kumar",
        [
            ["Total Cholesterol", "215.0", "mg/dL", "< 200", "HIGH"],
            ["Triglycerides", "180.0", "mg/dL", "< 150", "HIGH"],
            ["HDL Cholesterol", "42.0", "mg/dL", "> 40", "NORMAL"],
            ["LDL Cholesterol", "137.0", "mg/dL", "< 100", "HIGH"],
        ]
    )
    create_synthetic_pdf(
        "arjun_kumar_hba1c.pdf",
        "HbA1c & Diabetic Profile",
        "Arjun Kumar",
        [
            ["HbA1c", "6.8", "%", "4.0 - 5.6", "HIGH"],
            ["Fasting Blood Glucose", "138.0", "mg/dL", "70 - 99", "HIGH"],
        ]
    )
