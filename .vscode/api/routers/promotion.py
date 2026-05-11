from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import List, Optional
from io import BytesIO
from datetime import datetime

# นำเข้าองค์ประกอบต่างๆ ในโปรเจกต์
from app.api.core.database import get_db
from app.api.core.minio_client import upload_to_minio
from app.api.models import MFileMaster, MPromotionHeader, TTransaction
from app.api.schemas.promotion import PromotionResponse, PromotionStatusUpdate
from app.api.crud import crud_promotion

router = APIRouter(prefix="/promotions", tags=["Promotions"])

# ==========================================
# 1. API: อัปโหลดไฟล์และประมวลผลข้อมูล
# ==========================================
@router.post("/upload-file", status_code=status.HTTP_201_CREATED)
async def upload_promotion_file(
    info_id: int = Form(...), 
    sheet_name: str = Form("Sheet1"),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    รับไฟล์ Excel/CSV อัปโหลดเก็บที่ Minio และอ่านข้อมูลลงตาราง m_promotion_header
    """
    current_user_id = 1 # TODO: เปลี่ยนไปดึงจาก JWT Token ในอนาคต
    
    file_content = await file.read()
    
    try:
        # อัปโหลดไป Minio
        minio_path = upload_to_minio(
            BytesIO(file_content), 
            file.filename, 
            file.content_type
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Minio Upload Error: {str(e)}")

    # บันทึกลง MFileMaster
    new_file = MFileMaster(
        v_id=info_id,
        file_name=file.filename,
        sheet=sheet_name,
        status=0, # Processing
        user_create=current_user_id,
        user_update=current_user_id,
        date_create=datetime.utcnow(),
        date_update=datetime.utcnow(),
        description=f"Storage Path: {minio_path}"
    )
    db.add(new_file)
    db.commit()
    db.refresh(new_file)

    # อ่านข้อมูลและบันทึกลง Promotion Header
    try:
        total_rows = crud_promotion.process_and_save_promotion(
            db, file_content, new_file.id, current_user_id
        )
    except Exception as e:
        new_file.status = 9 # Error
        db.commit()
        raise HTTPException(status_code=422, detail=f"Data Processing Error: {str(e)}")

    return {
        "message": "Upload and Data Processing Successful",
        "file_id": new_file.id,
        "total_rows_imported": total_rows,
        "storage_path": minio_path
    }

# ==========================================
# 2. API: ดึงข้อมูลโปรโมชั่นที่ไม่มี Transaction
# ==========================================
@router.get("/no-transaction", response_model=List[PromotionResponse])
def get_promotions_without_transactions(db: Session = Depends(get_db)):
    """
    ค้นหาโปรโมชั่นที่ยังไม่มีการทำรายการ (Transaction) ผูกอยู่เลย
    """
    # ใช้ subquery หรือ outer join เพื่อหา pro_id ที่ไม่มีใน TTransaction
    subq = select(TTransaction.pro_id)
    stmt = select(MPromotionHeader).where(
        MPromotionHeader.id.not_in(subq),
        MPromotionHeader.state != 0
    )
    return db.scalars(stmt).all()

# ==========================================
# 3. API: ดึงข้อมูลโปรโมชั่นทั้งหมด
# ==========================================
@router.get("/", response_model=List[PromotionResponse])
def read_promotions(
    skip: int = 0, 
    limit: int = 100, 
    search: Optional[str] = None,
    pro_status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    ดึงรายการโปรโมชั่นทั้งหมด (รองรับ Filter คำค้นหาและสถานะ)
    """
    promotions = crud_promotion.get_promotions(
        db, skip=skip, limit=limit, search_text=search, status=pro_status
    )
    return promotions

# ==========================================
# 4. API: ดึงรายละเอียดโปรโมชั่นรายตัว
# ==========================================
@router.get("/{pro_id}", response_model=PromotionResponse)
def read_promotion_detail(pro_id: int, db: Session = Depends(get_db)):
    """
    ดึงรายละเอียดของโปรโมชั่นตาม ID ที่ระบุ
    """
    promo = crud_promotion.get_promotion_by_id(db, pro_id=pro_id)
    if not promo:
        raise HTTPException(status_code=404, detail="ไม่พบข้อมูลโปรโมชั่นนี้ หรือถูกลบไปแล้ว")
    return promo

# ==========================================
# 5. API: อัปเดตสถานะโปรโมชั่น
# ==========================================
@router.patch("/{pro_id}/status", response_model=PromotionResponse)
def update_status(
    pro_id: int, 
    status_update: PromotionStatusUpdate, 
    db: Session = Depends(get_db)
):
    """
    เปิด/ปิด หรือเปลี่ยนสถานะโปรโมชั่น
    """
    current_user_id = 1 
    updated_promo = crud_promotion.update_promotion_status(
        db, pro_id=pro_id, status=status_update.pro_status, user_id=current_user_id
    )
    if not updated_promo:
        raise HTTPException(status_code=404, detail="ไม่พบข้อมูลโปรโมชั่น")
    return updated_promo

# ==========================================
# 6. API: ลบโปรโมชั่น (Soft Delete)
# ==========================================
@router.delete("/{pro_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_promotion(pro_id: int, db: Session = Depends(get_db)):
    """
    ลบข้อมูลโปรโมชั่น (เปลี่ยน state เป็น 0)
    """
    current_user_id = 1 
    success = crud_promotion.soft_delete_promotion(db, pro_id=pro_id, user_id=current_user_id)
    if not success:
        raise HTTPException(status_code=404, detail="ไม่พบข้อมูลโปรโมชั่น หรือถูกลบไปแล้ว")
    return