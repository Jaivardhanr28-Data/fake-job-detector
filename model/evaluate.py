import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
import joblib

# 1. Load saved model
pipeline = joblib.load("model/job_classifier.pkl")

# 2. Load and preprocess data (identical to train.py)
df = pd.read_csv("data/fake_job_postings.csv")
df.fillna("", inplace=True)

text_columns = [
    "title", "location", "department", "company_profile",
    "description", "requirements", "benefits", "employment_type",
    "required_experience", "required_education", "industry"
]
df["combined_text"] = df[text_columns].apply(lambda row: " ".join(row), axis=1)

X = df["combined_text"]
y = df["fraudulent"]

# 3. Same split to get identical test set
_, X_test, _, y_test = train_test_split(
    X, y, test_size=0.2, stratify=y, random_state=42
)

# Keep corresponding rows from original df for display later
_, df_test = train_test_split(
    df, test_size=0.2, stratify=y, random_state=42
)

# 4. Predictions
y_pred = pipeline.predict(X_test)
y_proba = pipeline.predict_proba(X_test)

# 5a. Overall accuracy
print(f"Overall Accuracy: {accuracy_score(y_test, y_pred) * 100:.2f}%\n")

# 5b. Fake class metrics (label=1)
print("=== Fake Class Metrics ===")
print(f"Precision : {precision_score(y_test, y_pred):.4f}")
print(f"Recall    : {recall_score(y_test, y_pred):.4f}")
print(f"F1-Score  : {f1_score(y_test, y_pred):.4f}")

# 5c. Readable confusion matrix
tn, fp, fn, tp = confusion_matrix(y_test, y_pred).ravel()

print("\n=== Confusion Matrix ===")
print(f"Correctly identified REAL jobs : {tn}")
print(f"Real jobs wrongly flagged FAKE : {fp}  (false alarms)")
print(f"Fake jobs missed by model      : {fn}  (dangerous misses)")
print(f"Correctly caught FAKE jobs     : {tp}")

# 6. 3 fake jobs correctly caught
caught_mask = (y_test.values == 1) & (y_pred == 1)
caught_df = df_test[caught_mask]

print("\n=== Fake Jobs Correctly Caught ===")
for i, (_, row) in enumerate(caught_df.head(3).iterrows()):
    desc_preview = row["description"][:150]
    print(f"\n{i+1}. Title: {row['title']}")
    print(f"   Description: {desc_preview}...")

# 7. 3 fake jobs missed
missed_mask = (y_test.values == 1) & (y_pred == 0)
missed_df = df_test[missed_mask]

print("\n=== Fake Jobs MISSED (Model Weaknesses) ===")
for i, (_, row) in enumerate(missed_df.head(3).iterrows()):
    desc_preview = row["description"][:150]
    print(f"\n{i+1}. Title: {row['title']}")
    print(f"   Description: {desc_preview}...")

print(f"\nTotal missed fake jobs: {missed_df.shape[0]} out of {(y_test == 1).sum()}")
