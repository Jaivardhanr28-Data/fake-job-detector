import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report
import joblib
import os

# 1. Load dataset
df = pd.read_csv("data/fake_job_postings.csv")

# 2. Fill all NaN values with empty string
df.fillna("", inplace=True)

# 3. Create combined_text column
text_columns = [
    "title", "location", "department", "company_profile",
    "description", "requirements", "benefits", "employment_type",
    "required_experience", "required_education", "industry"
]
df["combined_text"] = df[text_columns].apply(lambda row: " ".join(row), axis=1)

# 4. Define features and target
X = df["combined_text"]
y = df["fraudulent"]

# 5. Print class distribution
print("Class distribution:")
print(y.value_counts())
print(f"\nFake job percentage: {y.mean() * 100:.2f}%\n")

# 6. Train/test split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, stratify=y, random_state=42
)

# 7. Build sklearn Pipeline
pipeline = Pipeline([
    ("tfidf", TfidfVectorizer(
        max_features=15000,
        ngram_range=(1, 2),
        sublinear_tf=True,
        stop_words="english"
    )),
    ("clf", LogisticRegression(
        max_iter=1000,
        class_weight="balanced",
        C=1.0
    ))
])

# 8. Train the pipeline
print("Training model...")
pipeline.fit(X_train, y_train)

# 9. Print classification report
y_pred = pipeline.predict(X_test)
print("\nClassification Report:")
print(classification_report(y_test, y_pred, target_names=["Real", "Fake"]))

# 10. Print top 20 words/bigrams most associated with FAKE jobs
feature_names = np.array(pipeline.named_steps["tfidf"].get_feature_names_out())
coefficients = pipeline.named_steps["clf"].coef_[0]
top_fake_indices = np.argsort(coefficients)[-20:][::-1]

print("Top 20 words/bigrams most associated with FAKE jobs:")
for i, idx in enumerate(top_fake_indices, 1):
    print(f"  {i:2d}. {feature_names[idx]:<30s} (coef: {coefficients[idx]:.4f})")

# 11. Save pipeline
os.makedirs("model", exist_ok=True)
joblib.dump(pipeline, "model/job_classifier.pkl")

# 12. Confirmation
print("\nModel saved successfully to model/job_classifier.pkl")
