from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import List

from ..database.common.connet_database_postgres import get_db
from ..database.models.views import vwfileassign
from ..common.workload_service import WorkloadDistributor

from ..version.all_schemas  import BaseModel


router = APIRouter(prefix="/assign", tags=["assign user file"])
class assignrequre(BaseModel):
    file_id:int
    user_assign:int
class autoassignrequre(BaseModel):
    user_id:List[int]

@router.get("/")
async def get_assign_promotion(
    version_id: int = 0,
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db)):
    stmt_summary = select(vwfileassign)
    if version_id != 0:
        stmt_summary = stmt_summary.where(vwfileassign.version_id == version_id)
    stmt_summary = stmt_summary.offset(skip).limit(limit)
    summaries = db.scalars(stmt_summary).all()  
    return summaries


@router.put("/")
async def update_assign_promotion(value: list[assignrequre],
                                  db: Session = Depends(get_db)):
    return {"id": value, "message": "Insert successful"}



    
@router.post("/auto",response_model=List[assignrequre])
async def auto_assign_promotion(value: autoassignrequre,
                                version_id: int = 0,
                                db: Session = Depends(get_db)):
    stmt_summary = select(vwfileassign)
    leuser = len(value.user_id)-1
    if version_id != 0:
        stmt_summary = stmt_summary.where(vwfileassign.version_id == version_id)
    summaries = db.scalars(stmt_summary).all()  
    distributor = WorkloadDistributor(summaries)
    flat_list, _, _ = distributor.distribute_strict_balance(user_ids=value) # type: ignore
    return flat_list
