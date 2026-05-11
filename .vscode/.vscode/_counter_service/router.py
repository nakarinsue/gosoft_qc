from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
import uvicorn
from core.database import OracleDBManager
from utils.logger import SystemLogger

router = APIRouter(prefix="/cou", tags=["Counter Service Enterprise API"])

class CompareRequest(BaseModel):
    """Model validation for database comparison queries."""
    query: str
    params: Optional[Dict[str, Any]|None] = None

@router.post("/compare")
def compare_databases(request: CompareRequest):
    """API Endpoint: Evaluates identical SELECT queries across 12C and 19C."""
    try:
        if not request.query.strip().upper().startswith("SELECT"):
            raise HTTPException(status_code=400, detail="Only SELECT queries are allowed for data reconciliation.")
        return OracleDBManager.compare_environments(request.query, request.params) # type: ignore
    except Exception as e:
        SystemLogger.error_traceback(e)
        raise HTTPException(status_code=500, detail=str(e))
