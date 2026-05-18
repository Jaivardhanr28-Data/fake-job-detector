# 🔍 Fake Job Posting Detector

> ML pipeline detecting fraudulent job postings in real-time | Deployed as a Chrome extension for LinkedIn & Naukri

---

## 📊 Model Performance

| Metric | Score |
|--------|-------|
| Accuracy | 98% |
| F1 Score (Fake class) | 0.82 |
| Training Records | 17,880 |
| Algorithm | Random Forest Classifier |

---

## 🏗️ Architecture
Job Posting (LinkedIn / Naukri)
↓
Chrome Extension (content.js)
↓
FastAPI Backend (/predict endpoint)
↓
NLP Preprocessing + Feature Engineering
↓
Random Forest Classifier
↓
Result: REAL ✅ or FAKE ⚠️

---

## 🛠️ Tech Stack

- **ML & Data:** Python, Scikit-learn, Pandas, NumPy
- **Backend:** FastAPI, Uvicorn
- **Extension:** JavaScript, Chrome Extensions API
- **Model Storage:** Joblib

---

## 📁 Project Structure
fake-job-detector/
├── backend/
│   ├── main.py          # FastAPI app + /predict endpoint
│   ├── predictor.py     # ML inference pipeline
│   └── flags.py         # Rule-based flag logic
├── model/
│   ├── train.py         # Model training script
│   ├── evaluate.py      # Evaluation metrics
│   └── job_classifier.pkl  # Trained Random Forest model
├── extension/
│   ├── content.js       # DOM extraction from LinkedIn/Naukri
│   ├── popup.html       # Extension UI
│   ├── popup.js         # Extension logic
│   └── manifest.json    # Chrome extension config
├── data/                # Training dataset
└── requirements.txt

---

## 🚀 How It Works

1. User visits a job posting on LinkedIn or Naukri
2. Chrome extension extracts: job title, company, description
3. Data is sent to FastAPI backend
4. ML model + rule-based flags analyze the posting
5. Result displayed instantly in the extension popup

---

## 📦 Setup & Run

```bash
# Clone the repo
git clone https://github.com/Jaivardhanr28-Data/fake-job-detector.git
cd fake-job-detector

# Install dependencies
pip install -r requirements.txt

# Start the backend
uvicorn backend.main:app --reload

# Load the extension
# Go to chrome://extensions → Enable Developer Mode → Load Unpacked → select /extension folder
```

---

## 📈 Dataset

- **Source:** Kaggle — Real/Fake Job Posting Prediction
- **Size:** 17,880 job postings
- **Features used:** title, company profile, description, requirements, location, employment type

---

## 👤 Author

**Jaivardhan Ranawat**  
B.Tech IT @ Manipal University Jaipur '25  
[LinkedIn](https://linkedin.com/in/jaivardhan-ranawat) | [GitHub](https://github.com/Jaivardhanr28-Data)
