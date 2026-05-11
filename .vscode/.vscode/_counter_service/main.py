from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
import uvicorn
from core.database import OracleDBManager
from utils.logger import SystemLogger

app = FastAPI(title="Counter Service Enterprise API")

class CompareRequest(BaseModel):
    """Model validation for database comparison queries."""
    query: str
    params: Optional[Dict[str, Any]|None] = None

@app.post("/api/v1/db/compare")
def compare_databases(request: CompareRequest):
    """API Endpoint: Evaluates identical SELECT queries across 12C and 19C."""
    try:
        if not request.query.strip().upper().startswith("SELECT"):
            raise HTTPException(status_code=400, detail="Only SELECT queries are allowed for data reconciliation.")
        return OracleDBManager.compare_environments(request.query, request.params) # type: ignore
    except Exception as e:
        SystemLogger.error_traceback(e)
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8005)