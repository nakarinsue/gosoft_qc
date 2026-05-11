from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Dict, Any
from datetime import datetime
# นำเข้าเพื่อใช้สำหรับ Lock แถวใน Database
from sqlalchemy.sql import select

from ..database.models.postgres_models import PPayment

def get_barcode_wallet(db: Session, user_id: int) -> Dict[str, Any]:
    try:
        target_item = db.query(PPayment).filter(
            PPayment.stated_payment == False,
            PPayment.types_allwallet == False
        ).with_for_update(skip_locked=True).first()

        if not target_item:
            return {
                "status": "error", 
                "message": "ขณะนี้ไม่มี Barcode ว่างในระบบ กรุณาลองใหม่อีกครั้ง"
            }

        target_barcode = target_item.paycode
        target_item.stated_payment = True
        target_item.user_update = user_id
        target_item.date_update = datetime.now()
        db.commit()

        return {
            "paycode": target_barcode,
            "status": "success",
            "type": "wallet",
            "message": "Retrieved successfully with concurrency control"
        }
        
    except Exception as e:
        db.rollback()
        return {"status": "error", "message": f"Database Error: {str(e)}"}

def get_barcode_allwallet(db: Session, user_id: int) -> Dict[str, Any]:
    try:
        target_item = db.query(PPayment).filter(
            PPayment.stated_payment == False,
            PPayment.types_allwallet == True
        ).with_for_update(skip_locked=True).first()

        if not target_item:
            return {
                "status": "error", 
                "message": "ขณะนี้ไม่มี Barcode (AllWallet) ว่างในระบบ"
            }

        target_barcode = target_item.paycode
        target_item.stated_payment = True
        target_item.user_update = user_id
        target_item.date_update = datetime.now()
        
        db.commit()

        return {
            "paycode": target_barcode,
            "status": "success",
            "type": "allwallet",
            "message": "Retrieved successfully with concurrency control"
        }
    except Exception as e:
        db.rollback()
        return {"status": "error", "message": f"Database Error: {str(e)}"}