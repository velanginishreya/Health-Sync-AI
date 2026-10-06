"""
Health Sync AI - Clinical RAG Vector Embedding & Model Training Pipeline
This script trains a dense-sparse hybrid vector embedding model on clinical EHR documents,
evaluates cosine similarity metrics, and saves the best model weights to `storage/models/best_rag_model.pkl`.
"""

import os
import sys
import pickle
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import TruncatedSVD
from sklearn.metrics.pairwise import cosine_similarity
from typing import List, Dict, Any

# Ensure project root & backend are in sys.path
script_dir = os.path.dirname(os.path.abspath(__file__))
project_dir = os.path.dirname(script_dir)
backend_dir = os.path.join(project_dir, "backend")
sys.path.insert(0, project_dir)
sys.path.insert(0, backend_dir)

from app.db.database import SessionLocal
from app.models.models import MedicalHistory, LabReport, LabResult, Medication, Vital, HealthEvent

MODEL_DIR = os.path.join(project_dir, "storage", "models")
os.makedirs(MODEL_DIR, exist_ok=True)
BEST_MODEL_PATH = os.path.join(MODEL_DIR, "best_rag_model.pkl")

class ClinicalVectorModelTrainer:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(ngram_range=(1, 2), stop_words='english')
        self.svd = TruncatedSVD(n_components=16, random_state=42)
        self.documents = []
        self.doc_metadata = []

    def load_corpus(self, db_session):
        print("[Model Trainer] Extracting patient records, lab parameters, and medical histories from Database...")

        
        records = db_session.query(MedicalHistory).all()
        meds = db_session.query(Medication).all()
        reports = db_session.query(LabReport).all()
        labs = db_session.query(LabResult).all()
        events = db_session.query(HealthEvent).all()

        for m in records:
            text = f"Condition: {m.condition_name} Status: {m.status} Date: {m.diagnosis_date} Details: {m.description or ''}"
            self.documents.append(text)
            self.doc_metadata.append({"type": "Medical History", "text": text})

        for med in meds:
            text = f"Medication: {med.name} Dosage: {med.dosage} Frequency: {med.frequency} PrescribedBy: {med.prescribed_by or ''}"
            self.documents.append(text)
            self.doc_metadata.append({"type": "Medication", "text": text})

        for r in reports:
            text = f"LabReport: {r.report_type} Date: {r.report_date} Content: {r.extracted_text or ''}"
            self.documents.append(text)
            self.doc_metadata.append({"type": "Lab Report", "text": text})

        for res in labs:
            text = f"LabTest: {res.test_name} Value: {res.value} {res.unit} Range: {res.reference_range} Status: {res.status}"
            self.documents.append(text)
            self.doc_metadata.append({"type": "Lab Result", "text": text})

        for e in events:
            text = f"HealthEvent: {e.title} Type: {e.event_type} Description: {e.description or ''} Date: {e.event_date}"
            self.documents.append(text)
            self.doc_metadata.append({"type": "Timeline Event", "text": text})

        if len(self.documents) < 5:
            # Fallback synthetic clinical dataset
            synthetic_docs = [
                "Complete Blood Count Hemoglobin 13.2 g/dL WBC 7.5 Platelets 250 Status NORMAL",
                "Lipid Panel Total Cholesterol 215 mg/dL Triglycerides 180 mg/dL LDL 137 mg/dL Status HIGH",
                "HbA1c Glucose 6.8 percent Fasting Glucose 138 mg/dL Diabetes Status HIGH",
                "Type 2 Diabetes Mellitus Essential Hypertension Metformin 500mg Lisinopril 10mg",
                "Allergy Penicillin Skin Rash Urticaria Moderate severity",
                "Blood Pressure Reading 138 88 mmHg Systolic Diastolic Heart Rate 74 bpm"
            ]
            for sd in synthetic_docs:
                self.documents.append(sd)
                self.doc_metadata.append({"type": "Clinical Record", "text": sd})

        print(f"[Model Trainer] Loaded {len(self.documents)} clinical document passages into corpus.")

    def train_and_evaluate(self):
        print("[Model Trainer] Fitting TF-IDF Vector Space Model & TruncatedSVD Dense Embeddings...")
        tfidf_matrix = self.vectorizer.fit_transform(self.documents)
        
        # Fit dense SVD embeddings if components <= features
        n_comp = min(16, tfidf_matrix.shape[1] - 1) if tfidf_matrix.shape[1] > 1 else 1
        if n_comp > 0:
            self.svd = TruncatedSVD(n_components=n_comp, random_state=42)
            dense_embeddings = self.svd.fit_transform(tfidf_matrix)
        else:
            dense_embeddings = tfidf_matrix.toarray()

        print(f"[Model Trainer] Dense Embedding Dimensions: {dense_embeddings.shape}")

        # Model Evaluation: Test Query Precision & Cosine Similarity
        test_queries = [
            "What is my latest blood cholesterol?",
            "What medicines am I currently taking?",
            "Show my blood pressure readings",
            "Do I have any recorded allergies?"
        ]

        print("\n[Model Evaluation Results]")
        print("--------------------------------------------------")
        avg_similarity = []
        for q in test_queries:
            q_tfidf = self.vectorizer.transform([q])
            if n_comp > 0:
                q_vec = self.svd.transform(q_tfidf)
                sims = cosine_similarity(q_vec, dense_embeddings)[0]
            else:
                sims = cosine_similarity(q_tfidf, tfidf_matrix)[0]

            top_idx = np.argmax(sims)
            top_score = sims[top_idx]
            avg_similarity.append(top_score)
            print(f"Query: '{q}'")
            print(f"  -> Best Matched Passage: \"{self.documents[top_idx][:65]}...\"")
            print(f"  -> Cosine Similarity Score: {top_score:.4f}")
            print("--------------------------------------------------")

        mean_sim = np.mean(avg_similarity)
        print(f"Model Evaluation Metric: Mean Retrieval Cosine Similarity = {mean_sim:.4f}")

        # Save Best Model Artifacts
        model_payload = {
            "vectorizer": self.vectorizer,
            "svd": self.svd if n_comp > 0 else None,
            "embeddings": dense_embeddings,
            "documents": self.documents,
            "metadata": self.doc_metadata,
            "mean_similarity_score": float(mean_sim)
        }

        with open(BEST_MODEL_PATH, "wb") as f:
            pickle.dump(model_payload, f)

        print(f"\n[Model Saved] Trained model & embedding weights successfully saved to:\n   {BEST_MODEL_PATH}")


def main():
    db = SessionLocal()
    try:
        trainer = ClinicalVectorModelTrainer()
        trainer.load_corpus(db)
        trainer.train_and_evaluate()
    finally:
        db.close()

if __name__ == "__main__":
    main()
