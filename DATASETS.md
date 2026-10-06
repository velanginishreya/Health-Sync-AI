# Datasets Documentation — Health Sync AI

Health Sync AI relies on synthetic healthcare datasets to protect real patient privacy while demonstrating clinical decision-support and digital twin capabilities.

## Primary Dataset: Synthea Synthetic Data

- **Source**: [Synthea Official Download](https://synthetichealth.github.io/synthea/)
- **Purpose**: Generates realistic synthetic electronic health record (EHR) profiles in CSV and FHIR R4 formats.
- **Used In**: Initial patient profile seeding, active medical conditions, family history, and demographic distribution.
- **Import Script**: `scripts/import_synthea.py`

## Synthetic Lab PDF Generator

- **Source**: Internal ReportLab Generator (`scripts/generate_demo_reports.py`)
- **Purpose**: Generates realistic synthetic laboratory PDF reports (Complete Blood Count, Lipid Panel, Metabolic Panel, HbA1c) labeled explicitly with **SYNTHETIC DEMO DATA - NOT A REAL MEDICAL RECORD**.
- **Used In**: Document processing pipeline, text extraction, OCR, and parameter parser testing.

## Optional External Datasets

### Kaggle IoMT Vital Signs Dataset
- **Source**: [Kaggle IoMT Vital Signs](https://www.kaggle.com/dsv/7736523)
- **Purpose**: High-frequency vital signs time-series for stress-testing Recharts analytics.

### MIMIC-IV v3.1 / MIMIC-IV Demo
- **Source**: [PhysioNet MIMIC-IV](https://physionet.org/content/mimiciv/3.1/)
- **License / Privacy Notice**: MIMIC-IV is a credentialed research dataset requiring a Data Use Agreement (DUA). **PhysioNet explicitly restricts sending credentialed MIMIC records to third-party public LLM APIs.**
- **Policy**: MIMIC-IV is **NOT required** to run Health Sync AI. The repository runs out-of-the-box using built-in synthetic datasets.
