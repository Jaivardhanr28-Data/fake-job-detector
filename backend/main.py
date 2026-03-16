# Main API entry point for the Fake Job Detector backend.

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from backend.flags import check_flags
from backend.predictor import predict_job, get_label


class JobInput(BaseModel):
    title: str = ""
    description: str = ""
    company: str = ""
    salary_range: str = ""
    email: str = ""


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "Fake Job Detector API is running"}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/predict")
def predict(job: JobInput):
    combined_text = " ".join([
        job.title, job.description, job.company,
        job.salary_range, job.email
    ])
    probability = predict_job(combined_text)
    label, color = get_label(probability)
    flags = check_flags(job.title, job.description, job.company,
                        job.salary_range, job.email)
    return {
        "label": label,
        "color": color,
        "probability": round(probability, 2),
        "flags": flags,
        "total_flags": len(flags),
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
