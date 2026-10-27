import math
from typing import Dict, Any, List

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from src.mongodb_service import MongoDBService
from src.prediction_service import CreditLimitPredictionService
from src.financial_trend_service import FinancialTrendService
from src.explainability_service import CreditLimitExplainabilityService
from src.what_if_service import WhatIfSimulationService
from src.audit_service import AuditService

app = FastAPI(title="Credit Limit Recommendation API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Services
mongo_service = MongoDBService()
prediction_service = CreditLimitPredictionService()
trend_service = FinancialTrendService()
explainability_service = CreditLimitExplainabilityService()
what_if_service = WhatIfSimulationService()
audit_service = AuditService()

# Pydantic Models
class DecisionRequest(BaseModel):
    decision: str
    final_credit_limit: float
    reason: str
    officer_id: str

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "credit-limit-recommendation-api"}

@app.get("/customers/{customer_id}")
def get_customer(customer_id: str):
    customer = mongo_service.get_customer(customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    # Internal _id is already excluded by mongo_service.get_customer.
    # Exclude default.payment.next.month if present.
    if "default.payment.next.month" in customer:
        del customer["default.payment.next.month"]
        
    return customer

@app.get("/customers/{customer_id}/prediction")
def get_prediction(customer_id: str):
    customer = mongo_service.get_customer(customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
        
    result = prediction_service.predict(customer)
    return {
        "customer_id": customer_id,
        "predicted_credit_limit": result["predicted_credit_limit"]
    }

@app.get("/customers/{customer_id}/financial-trends")
def get_financial_trends(customer_id: str):
    customer = mongo_service.get_customer(customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
        
    try:
        trends = trend_service.get_financial_trends(customer)
        return trends
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/customers/{customer_id}/explanation")
def get_explanation(customer_id: str):
    customer = mongo_service.get_customer(customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
        
    try:
        explanation_df, base_value = explainability_service.explain(customer)
        
        # Convert DataFrame to JSON serializable structure
        features = []
        for _, row in explanation_df.iterrows():
            features.append({
                "feature": row["feature"],
                "shap_value": float(row["shap_value"]),
                "feature_value": float(row["feature_value"]) if not math.isnan(row["feature_value"]) else None
            })
            
        return {
            "customer_id": customer_id,
            "base_value": round(float(base_value), 2),
            "features": features
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/customers/{customer_id}/simulate")
def simulate_prediction(customer_id: str, overrides: Dict[str, Any]):
    customer = mongo_service.get_customer(customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
        
    try:
        result = what_if_service.simulate(customer, overrides)
        return result
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/customers/{customer_id}/decision")
def save_decision(customer_id: str, request: DecisionRequest):
    customer = mongo_service.get_customer(customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
        
    try:
        # Obtain prediction from backend
        prediction = prediction_service.predict(customer)
        model_prediction = prediction["predicted_credit_limit"]
        
        record = audit_service.save_decision(
            customer_id=customer_id,
            model_prediction=model_prediction,
            decision=request.decision,
            final_credit_limit=request.final_credit_limit,
            reason=request.reason,
            officer_id=request.officer_id
        )
        
        if "_id" in record:
            del record["_id"]
            
        return record
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/customers/{customer_id}/decisions")
def get_customer_decisions(customer_id: str):
    try:
        decisions = audit_service.get_customer_decisions(customer_id)
        return decisions
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/audit/recent")
def get_recent_audit():
    try:
        decisions = audit_service.get_recent_decisions()
        return decisions
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")
