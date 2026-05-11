from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import List, Optional
from pydantic import BaseModel
from app.api.core.database import get_db
from app.api.models import MPromotionBucketEntity

router = APIRouter(prefix="/entities", tags=["Bucket Entities & Coupons"])

# --- Schemas ---
class EntityBase(BaseModel):
    entity_code: str
    bucket: int
    coupon: str
    entity_name: str
    entity_type: str
    mode: str
    product_name: Optional[str] = None
    product_price: Optional[str] = None

class EntityResponse(EntityBase):
    pro_id: int
    class Config:
        from_attributes = True

# --- Endpoints ---
@router.get("/promotions/{pro_id}/entities", response_model=List[EntityResponse])
def get_entities_by_promotion(pro_id: int, db: Session = Depends(get_db)):
    """5. ดึงรายการสินค้า/เงื่อนไข/คูปอง ที่ผูกกับโปรโมชั่น"""
    stmt = select(MPromotionBucketEntity).where(MPromotionBucketEntity.pro_id == pro_id)
    return db.scalars(stmt).all()

@router.post("/promotions/{pro_id}/entities", response_model=EntityResponse)
def add_entity_to_promotion(pro_id: int, entity: EntityBase, db: Session = Depends(get_db)):
    """6. เพิ่มเงื่อนไขหรือสินค้าใหม่เข้าไปในโปรโมชั่น"""
    db_entity = MPromotionBucketEntity(**entity.model_dump(), pro_id=pro_id, status=1)
    db.add(db_entity)
    db.commit()
    db.refresh(db_entity)
    return db_entity

@router.delete("/entities/{pro_id}/{entity_code}")
def delete_entity(pro_id: int, entity_code: str, db: Session = Depends(get_db)):
    """8. ลบเงื่อนไข/สินค้า ออกจากโปรโมชั่น"""
    stmt = select(MPromotionBucketEntity).where(
        MPromotionBucketEntity.pro_id == pro_id,
        MPromotionBucketEntity.entity_code == entity_code
    )
    entity = db.scalars(stmt).first()
    if not entity:
        raise HTTPException(status_code=404, detail="Not Found")
    db.delete(entity)
    db.commit()
    return {"message": "Deleted successfully"}