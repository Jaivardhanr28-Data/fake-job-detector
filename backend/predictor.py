# Loads the trained ML pipeline and provides prediction utilities
# for classifying job postings as real or fraudulent.

import joblib
import os
import numpy as np

MODEL_PATH = "model/job_classifier.pkl"


def load_model():
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError("Model not found. Run model/train.py first.")
    return joblib.load(MODEL_PATH)


pipeline = load_model()


def predict_job(combined_text):
    proba = pipeline.predict_proba([combined_text])
    return float(proba[0][1])


def get_label(probability):
    if probability > 0.6:
        return ("SUSPICIOUS", "red")
    elif probability >= 0.35:
        return ("UNCERTAIN", "yellow")
    else:
        return ("LOOKS LEGIT", "green")
