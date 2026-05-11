from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
from app.api.core.database import get_db
from app.api.models import TDefect

router = APIRouter(prefix="/defects", tags=["Defects & QA"])

# --- Schemas ---
class DefectBase(BaseModel):
    pro_id: int
    types: int
    title: str
    status: int
    description: Optional[str] = None

class DefectResponse(DefectBase):
    id: int
    date_create: datetime
    class Config:
        from_attributes = True

# --- Endpoints ---
@router.get("/", response_model=List[DefectResponse])
def get_all_defects(pro_id: Optional[int] = None, db: Session = Depends(get_db)):
    """9. ค้นหาข้อบกพร่องทั้งหมด"""
    stmt = select(TDefect)
    if pro_id:
        stmt = stmt.where(TDefect.pro_id == pro_id)
    return db.scalars(stmt).all()

@router.post("/", response_model=DefectResponse)
def create_defect(defect: DefectBase, db: Session = Depends(get_db)):
    """10. สร้าง Ticket แจ้ง Defect ใหม่"""
    db_defect = TDefect(**defect.model_dump(), user_create=1, user_update=1)
    db.add(db_defect)
    db.commit()
    db.refresh(db_defect)
    return db_defect

@router.patch("/{defect_id}/status")
def update_defect_status(defect_id: int, status: int, db: Session = Depends(get_db)):
    """12. อัปเดตสถานะการแก้ไข"""
    defect = db.scalars(select(TDefect).where(TDefect.id == defect_id)).first()
    if not defect:
        raise HTTPException(status_code=404, detail="Not found")
    defect.status = status
    defect.date_update = datetime.utcnow()
    db.commit()
    return {"message": "Status updated"}