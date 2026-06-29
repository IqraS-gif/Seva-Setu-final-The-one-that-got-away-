from fastapi import APIRouter, Query, HTTPException
from pydantic import BaseModel
from typing import Dict, Any
from app.services.risk_service import predict_ngo_activity

router = APIRouter(
    prefix="/risk",
    tags=["Risk Prediction"]
)

@router.get("/analyze")
async def analyze_location(location: str = Query(..., description="City or Country to analyze")):
    """
    Analyzes a specific location using GDELT data, Open-Meteo, NewsAPI, and Vertex ML.
    """
    if not location:
        raise HTTPException(status_code=400, detail="Location is required")
        
    try:
        report = predict_ngo_activity(location)
        return {"status": "success", "data": report}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
