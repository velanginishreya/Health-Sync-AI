"""
Health Sync AI - Deep Learning (DL) Clinical Risk Prediction Model
This script trains a Deep Neural Network (Multi-Layer Perceptron / DL Classifier)
to predict patient health trend severity levels (INFO, LOW, MODERATE, HIGH) based on vitals & lab parameters,
computes accuracy/loss metrics, and saves the trained Deep Learning model to `storage/models/best_dl_health_model.pkl`.
"""

import os
import sys
import pickle
import numpy as np
from sklearn.neural_network import MLPClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

# Ensure project root & backend are in sys.path
script_dir = os.path.dirname(os.path.abspath(__file__))
project_dir = os.path.dirname(script_dir)
backend_dir = os.path.join(project_dir, "backend")
sys.path.insert(0, project_dir)
sys.path.insert(0, backend_dir)

MODEL_DIR = os.path.join(project_dir, "storage", "models")
os.makedirs(MODEL_DIR, exist_ok=True)
DL_MODEL_PATH = os.path.join(MODEL_DIR, "best_dl_health_model.pkl")

class ClinicalDeepLearningTrainer:
    def __init__(self):
        # Multi-Layer Perceptron Deep Neural Network architecture (128 -> 64 -> 32 neurons)
        self.model = MLPClassifier(
            hidden_layer_sizes=(128, 64, 32),
            activation='relu',
            solver='adam',
            max_iter=500,
            random_state=42
        )
        self.scaler = StandardScaler()

    def generate_synthetic_training_data(self, num_samples=1000):
        print("[DL Trainer] Generating synthetic clinical dataset (Vitals & Labs)...")
        np.random.seed(42)
        
        # Features: [Systolic_BP, Diastolic_BP, Heart_Rate, SpO2, Blood_Glucose, Total_Cholesterol]
        systolic = np.random.normal(125, 15, num_samples)
        diastolic = np.random.normal(82, 10, num_samples)
        heart_rate = np.random.normal(75, 8, num_samples)
        spo2 = np.random.normal(97, 2, num_samples)
        glucose = np.random.normal(105, 25, num_samples)
        cholesterol = np.random.normal(190, 30, num_samples)

        X = np.column_stack([systolic, diastolic, heart_rate, spo2, glucose, cholesterol])
        y = []

        for row in X:
            sys_bp, dia_bp, hr, sp, gluc, chol = row
            # Risk labeling: 0=INFO (Normal), 1=LOW, 2=MODERATE, 3=HIGH
            if sys_bp > 150 or dia_bp > 95 or sp < 92 or gluc > 180 or chol > 240:
                y.append(3) # HIGH RISK
            elif sys_bp > 135 or dia_bp > 88 or sp < 95 or gluc > 130 or chol > 210:
                y.append(2) # MODERATE RISK
            elif sys_bp > 125 or dia_bp > 82 or gluc > 110:
                y.append(1) # LOW RISK
            else:
                y.append(0) # INFO / NORMAL

        return X, np.array(y)

    def train_and_evaluate(self):
        X, y = self.generate_synthetic_training_data(num_samples=1500)
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

        print("[DL Trainer] Preprocessing and scaling clinical feature vectors...")
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)

        print("[DL Trainer] Training Deep Neural Network (MLP 128-64-32)...")
        self.model.fit(X_train_scaled, y_train)

        # Evaluation
        y_pred = self.model.predict(X_test_scaled)
        acc = accuracy_score(y_test, y_pred)

        print("\n[Deep Learning Model Evaluation Metrics]")
        print("--------------------------------------------------")
        print(f"Deep Learning Model Accuracy: {acc * 100:.2f}%")
        print("Training Iterations Completed:", self.model.n_iter_)
        print("Final Neural Network Loss:", f"{self.model.loss_:.4f}")
        print("--------------------------------------------------")

        # Save Best DL Model
        model_payload = {
            "model": self.model,
            "scaler": self.scaler,
            "accuracy": float(acc),
            "feature_names": ["systolic_bp", "diastolic_bp", "heart_rate", "spo2", "blood_glucose", "total_cholesterol"]
        }

        with open(DL_MODEL_PATH, "wb") as f:
            pickle.dump(model_payload, f)

        print(f"[Model Saved] Deep Learning Risk Model saved to:\n   {DL_MODEL_PATH}")

def main():
    trainer = ClinicalDeepLearningTrainer()
    trainer.train_and_evaluate()

if __name__ == "__main__":
    main()
