from sqlalchemy import select, update
from typing import Optional
import pandas as pd
from io import BytesIO
from sqlalchemy.orm import Session
from app.api.models import MFileMaster, MPromotionHeader
from datetime import datetime

def process_and_save_promotion(db: Session, file_content: bytes, file_id: int, user_id: int):
    # 1. อ่านไฟล์ด้วย Pandas (รองรับทั้ง Excel และ CSV)
    df = pd.read_excel(BytesIO(file_content)) # หรือ pd.read_csv
    
    headers_to_save = []
    row_count = 0
    
    for _, row in df.iterrows():
        # สร้าง Object MPromotionHeader ตามข้อมูลในแต่ละแถว
        promo = MPromotionHeader(
            file_id=file_id,
            pro_code=int(row['pro_code']),
            pro_name=str(row['pro_name']),
            pro_receipt_name=str(row.get('pro_receipt_name', row['pro_name'])),
            pro_type=str(row['pro_type']),
            pro_group=str(row['pro_group']),
            pro_status="ACTIVE",
            pro_level=int(row.get('pro_level', 1)),
            start_date=pd.to_datetime(row['start_date']).date(),
            end_date=pd.to_datetime(row['end_date']).date(),
            notes=str(row.get('notes', '-')),
            state=1,
            export=False,
            user_update=user_id,
            date_update=datetime.utcnow()
        )
        headers_to_save.append(promo)
        row_count += 1

    # 2. Bulk Insert เพื่อประสิทธิภาพระดับองค์กร (รวดเร็วกว่า Insert ทีละแถว)
    db.bulk_save_objects(headers_to_save)
    
    # 3. อัปเดตจำนวนแถวใน File Master
    file_master = db.query(MFileMaster).filter(MFileMaster.id == file_id).first()
    if file_master:
        file_master.r_row = row_count
        file_master.status = 1 # สำเร็จ
        
    db.commit()
    return row_count

def get_promotions(
    db: Session, 
    skip: int = 0, 
    limit: int = 100, 
    search_text: Optional[str] = None,
    status: Optional[str] = None
):
    """
    ดึงข้อมูลโปรโมชั่นทั้งหมด (รองรับการค้นหาและกรองสถานะ)
    """
    stmt = select(MPromotionHeader).where(MPromotionHeader.state != 0) # สมมติ state=0 คือถูกลบ
    
    if search_text:
        # ค้นหาจากชื่อโปรโมชั่น หรือ รหัส
        stmt = stmt.where(
            (MPromotionHeader.pro_name.ilike(f"%{search_text}%")) |
            (MPromotionHeader.pro_code.cast(str).ilike(f"%{search_text}%"))
        )
    if status:
        stmt = stmt.where(MPromotionHeader.pro_status == status)
        
    stmt = stmt.offset(skip).limit(limit)
    return db.scalars(stmt).all()

def get_promotion_by_id(db: Session, pro_id: int):
    """
    ดึงข้อมูลโปรโมชั่นรายตัว
    """
    stmt = select(MPromotionHeader).where(MPromotionHeader.id == pro_id, MPromotionHeader.state != 0)
    return db.scalars(stmt).first()

def update_promotion_status(db: Session, pro_id: int, status: str, user_id: int):
    """
    อัปเดตสถานะโปรโมชั่น
    """
    promo = get_promotion_by_id(db, pro_id)
    if promo:
        promo.pro_status = status
        promo.user_update = user_id
        promo.date_update = datetime.utcnow()
        db.commit()
        db.refresh(promo)
    return promo

def soft_delete_promotion(db: Session, pro_id: int, user_id: int):
    """
    Soft Delete (เปลี่ยน state เป็น 0)
    """
    promo = get_promotion_by_id(db, pro_id)
    if promo:
        promo.state = 0 # 0 = ลบ
        promo.pro_status = "DELETED"
        promo.user_update = user_id
        promo.date_update = datetime.utcnow()
        db.commit()
        return True
    return False