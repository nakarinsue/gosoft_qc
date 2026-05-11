from fastapi import APIRouter, Depends, HTTPException, Path, Query
from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import  Optional,Set
from datetime import datetime
from pydantic import BaseModel
from ..database.common.connet_database_postgres import get_db
from ..auth.security import get_current_user
from ..database.models.postgres_models import MaUser, MPromotionHeader, MPromotionBucketEntity,MFileMaster
from ..schemas.inventory import EntityStatusUpdate, AssignUserRequest

router = APIRouter(prefix="/promotions", tags=["Promotions"])

@router.get("/search")
def search_promotions(keyword: Optional[str] = None, db: Session = Depends(get_db)):
    query = select(MPromotionHeader)
    if keyword:
        query = query.where(MPromotionHeader.pro_name.contains(keyword))
    return db.scalars(query).all()

@router.get("/my-tasks")
def get_promotions_by_user(current_user: MaUser = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.scalars(
        select(MPromotionHeader).where(MPromotionHeader.user_assign == current_user.user_id)
    ).all()

@router.post("/assign")
def assign_user(req: AssignUserRequest, current_user: MaUser = Depends(get_current_user), db: Session = Depends(get_db)):
    promo = db.get(MPromotionHeader, req.pro_id)
    if not promo: raise HTTPException(404, "Promotion not found")
    
    promo.user_assign = req.user_id
    promo.date_assign = datetime.now()
    db.commit()
    return {"message": f"Assigned user {req.user_id} to promotion {req.pro_id}"}

@router.patch("/entity/{pro_id}/{entity_code}/status")
def update_entity_status(
    pro_id: int, entity_code: str, data: EntityStatusUpdate,
    current_user: MaUser = Depends(get_current_user), db: Session = Depends(get_db)
):
    entity = db.scalar(select(MPromotionBucketEntity).where(
        MPromotionBucketEntity.pro_id == pro_id,
        MPromotionBucketEntity.entity_code == entity_code
    ))
    if not entity: raise HTTPException(404, "Entity not found")
    
    entity.status = data.status
    if data.description: entity.description = data.description
    entity.user_update = current_user.user_id
    db.commit()
    return {"message": "Status updated"}

@router.get("/promotion_by_user_All")
def get_promotion_by_user_all(
    limit: int = Query(100, description="จำนวนข้อมูลสูงสุดที่ต้องการดึง"),
    skip: int = Query(0, description="จำนวนข้อมูลที่ต้องการข้าม (Offset)"),
    current_user: MaUser = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    try:
        stmt = (
            select(
                MPromotionHeader.id,
                MPromotionHeader.pro_code,
                MPromotionHeader.pro_name,
                MPromotionHeader.start_date,
                MPromotionHeader.end_date,
                MFileMaster.file_name,
                MFileMaster.sheet
            )
            .join(MFileMaster, MPromotionHeader.file_id == MFileMaster.id)
            .where(
                MPromotionHeader.user_assign == current_user.user_id,
                MPromotionHeader.state == 1
            )
            .limit(limit)
            .offset(skip)
        )
        
        result = db.execute(stmt).mappings().all()
        return result

    except Exception as e:
        print(f"Error fetching user promotions: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")


# 1. Pydantic Schema สำหรับรับค่า Set ของ ID
class PromotionIdRequest(BaseModel):
    header_ids: Set[int]

# ==========================================
# เส้นที่ 2: ดึงข้อมูลตาม IDs (รับค่าแบบ POST)
# ==========================================
@router.post("/promotions_by_ids")
def get_promotions_by_ids(
    payload: PromotionIdRequest, 
    limit: int = Query(100, description="จำนวนข้อมูลสูงสุดที่ต้องการดึง"),
    skip: int = Query(0, description="จำนวนข้อมูลที่ต้องการข้าม (Offset)"),
    db: Session = Depends(get_db)
):
    try:
        if not payload.header_ids:
            return []

        stmt = (
            select(MPromotionHeader.pro_code,
                   MPromotionHeader.end_date,
                   MPromotionHeader.start_date,
                   MPromotionHeader.pro_name,
                   MPromotionHeader.limit_day,
                   MPromotionHeader.limit_item,
                   MPromotionHeader.reward_name,
                   MPromotionHeader.limit_tran,
                   MPromotionHeader.pro_receipt_name,
                   MPromotionHeader.reward_type,
                   MPromotionHeader.reward_value,
                   MPromotionHeader.notes,
                   MPromotionHeader.reward_ma,

                   MFileMaster.date_create, 
                   MFileMaster.description, 
                   MFileMaster.sheet, 
                   MFileMaster.file_name, 
                   MFileMaster.user_mk, 
                   MFileMaster.user_create, 
                   
                   MPromotionBucketEntity.entity_code,
                   MPromotionBucketEntity.condition_id,
                   MPromotionBucketEntity.barcode,
                   MPromotionBucketEntity.condition_name,
                   MPromotionBucketEntity.coupon,
                   MPromotionBucketEntity.entity_name,
                   MPromotionBucketEntity.entity_type,
                   MPromotionBucketEntity.receipt_id,
                   MPromotionBucketEntity.pro_id,
                   MPromotionBucketEntity.mode,
                   MPromotionBucketEntity.trigger_type,
                   MPromotionBucketEntity.trigger_value,

                   )
            .join(MFileMaster, MPromotionHeader.file_id == MFileMaster.id, isouter=True)
            .join(MPromotionBucketEntity, MPromotionHeader.id == MPromotionBucketEntity.pro_id, isouter=True)
            .where(MPromotionHeader.id.in_(payload.header_ids))
            .limit(limit)
            .offset(skip)
        )
        
        result = db.execute(stmt).all()
        
        formatted_result = [
            {
                "header": row.MPromotionHeader,
                "file": row.MFileMaster,
                "bucket": row.MPromotionBucketEntity
            }
            for row in result
        ]
        return formatted_result

    except Exception as e:
        print(f"Error fetching by IDs: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")


# ==========================================
# เส้นที่ 3: ดึงข้อมูลตาม Pro_code
# ==========================================
@router.get("/promotions_by_procode/{pro_code}")
def get_promotions_by_procode(
    pro_code: str = Path(..., description="รหัสโปรโมชั่นที่ต้องการค้นหา"), 
    limit: int = Query(100, description="จำนวนข้อมูลสูงสุดที่ต้องการดึง"),
    skip: int = Query(0, description="จำนวนข้อมูลที่ต้องการข้าม (Offset)"),
    db: Session = Depends(get_db)
):
    try:
        stmt = (
            select(MPromotionHeader, MFileMaster, MPromotionBucketEntity)
            .join(MFileMaster, MPromotionHeader.file_id == MFileMaster.id, isouter=True)
            .join(MPromotionBucketEntity, MPromotionHeader.id == MPromotionBucketEntity.pro_id, isouter=True)
            .where(MPromotionHeader.pro_code == pro_code)
            .limit(limit)
            .offset(skip)
        )
        
        result = db.execute(stmt).all()
        
        formatted_result = [
            {
                "header": row.MPromotionHeader,
                "file": row.MFileMaster,
                "bucket": row.MPromotionBucketEntity
            }
            for row in result
        ]
        return formatted_result

    except Exception as e:
        print(f"Error fetching by Pro Code: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")