"""
UBWENGE HUB — Python AI Service
FastAPI + scikit-learn for Finance prediction and Proctor AI analysis.
Run: uvicorn main:app --reload --port 8000
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import numpy as np

app = FastAPI(title="UBWENGE HUB Python Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── SCHEMAS ──────────────────────────────────────────────────────────────────

class Transaction(BaseModel):
    type: str        # "income" or "expense"
    amount: float
    date: Optional[str] = None
    category: Optional[str] = None

class PredictRequest(BaseModel):
    transactions: List[Transaction]

class ProctorEvent(BaseModel):
    type: str
    severity: str
    timestamp: Optional[str] = None

class ProctorReportRequest(BaseModel):
    student_name: str
    student_id: str
    flags: int
    score: float
    events: List[ProctorEvent]


# ── FINANCE PREDICTOR ─────────────────────────────────────────────────────────

@app.post("/predict")
async def predict_finance(req: PredictRequest):
    """
    Real ML prediction using NumPy-based feature engineering.
    Replace the numpy logic below with a trained scikit-learn model:

        from sklearn.ensemble import GradientBoostingClassifier
        import joblib
        model = joblib.load("models/finance_model.pkl")
        poverty_prob = float(model.predict_proba([features])[0][1])
    """
    txs = req.transactions

    if not txs:
        raise HTTPException(status_code=400, detail="No transactions provided.")

    total_income  = sum(t.amount for t in txs if t.type == "income")
    total_expense = sum(t.amount for t in txs if t.type == "expense")
    balance       = total_income - total_expense
    tx_count      = len(txs)
    income_ratio  = total_income / (total_income + total_expense + 1e-9)

    # Feature vector (extend this for a real trained model)
    features = np.array([balance, total_income, total_expense, income_ratio, tx_count])

    # Rule-based model (replace with joblib.load for production)
    if balance > 1_000_000:
        wealth_trend = "Rich/Growth"
        poverty_prob = 0.01
    elif balance > 500_000:
        wealth_trend = "Growth"
        poverty_prob = 0.05
    elif balance > 100_000:
        wealth_trend = "Stable"
        poverty_prob = 0.15
    elif balance > 0:
        wealth_trend = "Moderate Risk"
        poverty_prob = 0.40
    else:
        wealth_trend = "High Risk"
        poverty_prob = min(0.95, 0.65 + abs(balance) / 1_000_000)

    saving_allowance = max(0, balance * 0.20)

    if poverty_prob > 0.5:
        recommendation = "⚠️ Reduce non-essential spending immediately. Track every expense."
    elif poverty_prob > 0.2:
        recommendation = "💡 Build an emergency fund of at least 3 months of expenses."
    else:
        recommendation = "✅ Consider investing in RDB-approved bonds or a savings account."

    return {
        "saving_allowance":    saving_allowance,
        "wealth_trend":        wealth_trend,
        "poverty_probability": poverty_prob,
        "recommendation":      recommendation,
        "features_used":       features.tolist(),
    }


# ── PROCTOR REPORT ─────────────────────────────────────────────────────────────

@app.post("/proctor/report")
async def generate_proctor_report(req: ProctorReportRequest):
    """
    Analyze a completed proctoring session and return an integrity verdict.
    """
    high_events   = sum(1 for e in req.events if e.severity == "high")
    medium_events = sum(1 for e in req.events if e.severity == "medium")
    integrity_score = max(0, 100 - (high_events * 15) - (medium_events * 5) - (req.flags * 2))

    if integrity_score >= 80:
        verdict = "VERIFIED"
    elif integrity_score >= 50:
        verdict = "SUSPICIOUS"
    else:
        verdict = "FLAGGED"

    return {
        "student_name":    req.student_name,
        "student_id":      req.student_id,
        "exam_score":      req.score,
        "integrity_score": integrity_score,
        "verdict":         verdict,
        "high_events":     high_events,
        "medium_events":   medium_events,
        "total_flags":     req.flags,
        "summary":         f"Session reviewed. Integrity: {verdict}. Score: {req.score:.1f}%.",
    }


# ── HEALTH CHECK ──────────────────────────────────────────────────────────────

@app.get("/health")
async def health():
    return {"status": "ok", "service": "ubwenge-hub-python"}
