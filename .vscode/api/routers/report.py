from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text # ใช้ raw sql สำหรับ query views หากยังไม่ได้สร้าง model ให้ views
from app.api.core.database import get_db

router = APIRouter(prefix="/reports", tags=["Dashboard & Reports"])

@router.get("/dashboard/promotions")
def get_promotions_summary(db: Session = Depends(get_db)):
    """18. สรุปข้อมูลโปรโมชั่นจาก vw_prmotion_information"""
    # จำลองการดึงข้อมูลจาก View
    result = db.execute(text('SELECT * FROM "PROMOTION_TEMP".vw_prmotion_information LIMIT 100'))
    return [dict(row._mapping) for row in result]

@router.get("/dashboard/defects")
def get_defects_summary(db: Session = Depends(get_db)):
    """19. สรุปข้อมูล Defect จาก vw_defect_information"""
    result = db.execute(text('SELECT * FROM "PROMOTION_TEMP".vw_defect_information LIMIT 100'))
    return [dict(row._mapping) for row in result]

@router.get("/master/payments")
def get_payments(db: Session = Depends(get_db)):
    """20. ดึงรายการประเภทการชำระเงิน"""
    result = db.execute(text('SELECT * FROM "PROMOTION_TEMP".p_payment'))
    return [dict(row._mapping) for row in result]