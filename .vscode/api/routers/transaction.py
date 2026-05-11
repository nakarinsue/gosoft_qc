from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
from app.api.core.database import get_db
from app.api.models import TTransaction, TTej

router = APIRouter(prefix="/trans", tags=["Transactions & EJ"])

# --- Schemas ---
class TransactionResponse(BaseModel):
    id: int
    pro_id: int
    store_code: str
    receipt_no: int
    business_datetime: datetime
    class Config:
        from_attributes = True

class EJResponse(BaseModel):
    EJ_LINE_NO: int
    EJ_LINE: Optional[str]
    class Config:
        from_attributes = True

# --- Endpoints ---
@router.get("/transactions", response_model=List[TransactionResponse])
def get_transactions(store_code: Optional[str] = None, db: Session = Depends(get_db)):
    """13. ค้นหารายการธุรกรรมทั้งหมด"""
    stmt = select(TTransaction).limit(100)
    if store_code:
        stmt = stmt.where(TTransaction.store_code == store_code)
    return db.scalars(stmt).all()

@router.get("/promotions/{pro_id}/transactions", response_model=List[TransactionResponse])
def get_transactions_by_promo(pro_id: int, db: Session = Depends(get_db)):
    """16. ดูรายการธุรกรรมที่เกิดจากโปรโมชั่น"""
    stmt = select(TTransaction).where(TTransaction.pro_id == pro_id)
    return db.scalars(stmt).all()

@router.get("/transactions/{t_id}/ej", response_model=List[EJResponse])
def get_transaction_ej(t_id: int, db: Session = Depends(get_db)):
    """15. ดึงข้อมูล Electronic Journal (ใบเสร็จ)"""
    stmt = select(TTej).where(TTej.T_id == t_id).order_by(TTej.EJ_LINE_NO)
    return db.scalars(stmt).all()