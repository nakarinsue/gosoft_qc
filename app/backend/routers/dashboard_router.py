from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, select
from app.backend.database import get_db
from app.backend.models.postgres._base_on import MVersionControl, MPromotionHeader, TTransaction,MaUser,MPromotionBucketEntity,MFileMaster,Minformationimport
from app.backend.schemas.all_schemas import DashboardSummary
from app.backend.auth import verify_password, create_access_token, get_current_user, get_password_hash
from datetime import date
router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/summary", response_model=DashboardSummary)
def get_summary(db: Session = Depends(get_db)):
    return {
        "total_versions": db.query(func.count(MVersionControl.id)).scalar(),
        "active_promotions": db.query(func.count(MPromotionHeader.id)).filter(MPromotionHeader.state == 1).scalar(),
        "total_transactions": db.query(func.count(TTransaction.id)).scalar(),
        "recent_defects": db.query(func.count(TTransaction.id)).filter(TTransaction.types == 2).scalar()
    }


@router.get("/show-promotion/{version}")
def get_promotion1(
    format: int, 
    version: int,
    db: Session = Depends(get_db),
    current_user: MaUser = Depends(get_current_user)
):
    print(format,version,current_user.user_id)
    # 1. ใช้ Syntax ใหม่ของ SQLAlchemy 2.0 (แยก Query ให้อ่านง่าย)
    stmt = (
        select(MPromotionHeader)
        .distinct()
        .join(MFileMaster, MPromotionHeader.file_id == MFileMaster.id)
        # .join(MPromotionBucketEntity, MPromotionHeader.id == MPromotionBucketEntity.pro_id)
        .where(MPromotionHeader.user_assign == current_user.user_id)
    )

    # 2. จัดการเงื่อนไข Version
    if version == 0:
        stmt = stmt.where(MFileMaster.v_id != 0)
    else:
        stmt = stmt.where(MFileMaster.v_id == version)

    # 3. ประมวลผลและดึงข้อมูล
    result = db.execute(stmt).all()

    formatted_data = []
    
    for header in result:
        print(header)
        formatted_data.append({
            # ตัวอย่างการดึงค่า: ปรับชื่อฟิลด์ .id, .bucket ให้ตรงกับ Model จริงของคุณ
            "header_id": header.reward_name, 
            "pro_name": header.pro_code,
            "bucket_code": header.pro_name,
            "entity_code": header.pro_receipt_name
        })

    return {
        "success": True,
        "message": "ดึงข้อมูลทดสอบสำเร็จ",
        "data": formatted_data,
    }



@router.get("/testpro/{format}/{version}/{limit}")
def get_promotion(
    format: int, 
    version: int,
    limit:int = 10,
    db: Session = Depends(get_db),
    current_user: MaUser = Depends(get_current_user)
):
    subquery = (
        select(MPromotionHeader.id)
        .join(MFileMaster, MPromotionHeader.file_id == MFileMaster.id)
        .join(Minformationimport, MFileMaster.v_id == Minformationimport.id)
        .where(MPromotionHeader.user_assign == current_user.user_id)
        .where(Minformationimport.v_id != version if version == 0 else Minformationimport.v_id == version)
        .limit(limit)
        .offset(0)
    ).scalar_subquery()

    stmt = (
        select(MPromotionHeader, MPromotionBucketEntity)
        .join(MPromotionBucketEntity, MPromotionHeader.id == MPromotionBucketEntity.pro_id)
        .where(MPromotionHeader.id.in_(subquery))
    )

    result = db.execute(stmt).all()
    promotions_map = {}

    for header, bucket in result:
        pro_id = header.id
        if pro_id not in promotions_map:
            def format_date(d):
                return d.strftime("%d/%m/%Y") if isinstance(d, date) else ""
            promotions_map[pro_id] = {
                "promotion": {
                    "code": str(getattr(header, 'pro_code', '')),
                    "name": getattr(header, 'pro_name', ''),
                    "coupon": getattr(bucket, 'coupon', ''), # ดึงคูปองจาก bucket แรก
                    "start_date": format_date(getattr(header, 'start_date', None)),
                    "end_date": format_date(getattr(header, 'end_date', None)),
                    "type": getattr(header, 'pro_type', ''),
                    "trigger": {
                        "value": getattr(bucket, 'trigger_value', ''),
                        "types": getattr(bucket, 'trigger_type', '')
                    },
                    "limit": {
                        "transation": getattr(header, 'limit_tran', 0) or 0,
                        "day": getattr(header, 'limit_day', 0) or 0,
                        "item": getattr(header, 'limit_item', 0) or 0
                    },
                    "reward": {
                        "value": str(getattr(header, 'reward_value', '')),
                        "types": getattr(header, 'reward_type', '')
                    },
                    "note": getattr(header, 'notes', '')
                },
                "buckets_map": {} # สร้าง Map ชั่วคราวสำหรับจัดกลุ่ม Bucket
            }
        b_id = getattr(bucket, 'bucket', 0)
        
        if b_id not in promotions_map[pro_id]["buckets_map"]:
            promotions_map[pro_id]["buckets_map"][b_id] = []
        barcode_val = getattr(bucket, 'barcode', '')
        mode_val = getattr(bucket, 'mode', '')
        mode_str = "Include" if mode_val == '1' else mode_val # แปลง 1 เป็น Include
        status_val = "PENDING" if getattr(bucket, 'statused', False) == False else "PASS"
        promotions_map[pro_id]["buckets_map"][b_id].append({
            "code": getattr(bucket, 'entity_code', ''),
            "name": getattr(bucket, 'entity_name', ''),
            "type": getattr(bucket, 'entity_type', 'Item'),
            "mode": mode_str,
            "barcode": {
                "value": barcode_val,
                "display": f"*{barcode_val}*" if barcode_val else ""
            },
            "status": status_val
        })

    final_data = []
    for pro_id, pro_data in promotions_map.items():
        entities_list = [
            {"bucket": b_id, "item": items} 
            for b_id, items in pro_data["buckets_map"].items()
        ]
        
        final_data.append({
            "promotion": pro_data["promotion"],
            "entities": entities_list
        })

    return {
        "success": True,
        "message": "ดึงข้อมูลทดสอบสำเร็จ",
        "data": final_data 
    }