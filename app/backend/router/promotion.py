from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session,joinedload
from sqlalchemy import select,or_,cast,String
from datetime import datetime
from pydantic import BaseModel
from ..database.common.connet_database_postgres import get_db
from ..database.models.views import pma_entity,VwTransaction
from ..database.models.postgres_models import MPromotionBucketEntity,TTransaction, MPromotionHeader, MFileMaster,MInfoImportFile
from ..auth.security   import get_current_user



router = APIRouter(prefix="/promotion", tags=["promotion Control"])
class CouponRemarkRequest(BaseModel):
    id: int
    remark: str
@router.post("/coupon")
async def get_coupon(
    version_id: int = 0,
    skip: int = 0, 
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    ดึงข้อมูลคูปองแบบ Nested JSON จัดกลุ่มตาม File -> Sheet -> Items
    """
    # 1. สร้าง Statement การ Query
    stmt = select(VwTransaction).where(VwTransaction.coupon != '')
    if version_id != 0:
        stmt = stmt.where(VwTransaction.version_id == version_id)
    stmt = stmt.offset(skip).limit(limit)
    flat_data = db.scalars(stmt).all()
    files_dict = {}
    for row in flat_data:
        fname = row.file_name
        sname = row.sheet_name 
        if fname not in files_dict:
            files_dict[fname] = {
                "file_name": fname,
                "MKname": row.mk_name or "",
                "qty": 0, 
                "sheets": {} 
            }
        if sname not in files_dict[fname]["sheets"]:
            files_dict[fname]["sheets"][sname] = {
                "sheet_name": sname,
                "qty": 0,
                "items": []
            }
        start_dt = row.start.strftime("%d/%m/%Y") if row.start else None
        end_dt = row.end.strftime("%d/%m/%Y") if row.end else None
            
        # สร้าง Item โดยอ้างอิงคอลัมน์ที่มีจริงใน VwTransaction
        item = {
            "promotion_code": row.pro_code,
            "promotion_name": row.pro_name,
            "START_DATE": start_dt,
            "END_DATE": end_dt,
            "coupon": row.coupon ,
            "remark": row.description ,
            # ปรับปรุงให้ดึงค่าสถานะที่มีอยู่จริงใน View
            "status_defect": True if row.status_defect == 1 else False,
            "status_transaction": True if row.status_trasation == 1 else False
        }
        
        files_dict[fname]["sheets"][sname]["items"].append(item)
        files_dict[fname]["sheets"][sname]["qty"] += 1
        files_dict[fname]["qty"] += 1 
        
    detail_list = []
    for fname, f_data in files_dict.items():
        f_data["sheets"] = list(f_data["sheets"].values())
        detail_list.append(f_data)
        
    response = [
        {
            "version": str(version_id),
            "SYSTEM": "POS", 
            "detail": detail_list
        }
    ]

    return response

@router.post("/coupon-update")
async def update_coupon(
    req: CouponRemarkRequest,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    ค้นหาข้อมูลด้วย ID 
    - ถ้าพบ: อัปเดต description
    - ถ้าไม่พบ: เพิ่มข้อมูลใหม่ (Insert)
    """
    # 1. ค้นหาข้อมูลจาก Database
    stmt = select(TTransaction).where(TTransaction.id == req.id)
    record = db.scalars(stmt).first()

    # 2. กรณี: พบข้อมูล (Update)
    if record:
        record.description = req.remark
        record.date_update = datetime.utcnow()
        # สมมติว่า current_user มี property ชื่อ user_id
        record.user_update = current_user.user_id 
        
        db.commit()
        return {"message": "อัพเดทข้อมูลสำเร็จ"}

    # 3. กรณี: ไม่พบข้อมูล (Insert)
    else:
        new_record = TTransaction(
            id=req.id,
            types=1,
            title="remark",
            status=5,
            remark="add remark",
            description=req.remark, 
            date_create=datetime.utcnow(),
            date_update=datetime.utcnow(),
            user_create=current_user.user_id,
            user_update=current_user.user_id
        )
        
        db.add(new_record)
        db.commit()
        return {"message": "เพิ่มข้อมูลสำเร็จ"}


@router.post("/transationall")
async def get_transationall(
    version_id: int = 0,
    skip: int = 0, 
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    ดึงข้อมูลคูปองแบบ Nested JSON จัดกลุ่มตาม File -> Sheet -> Items
    """
    # 1. สร้าง Statement การ Query
    stmt = select(VwTransaction)
    if version_id != 0:
        stmt = stmt.where(VwTransaction.version_id == version_id)
    stmt = stmt.offset(skip).limit(limit)
    flat_data = db.scalars(stmt).all()
    files_dict = {}
    for row in flat_data:
        fname = row.file_name
        sname = row.sheet_name 
        if fname not in files_dict:
            files_dict[fname] = {
                "file_name": fname,
                "MKname": row.mk_name or "",
                "sheets": {} 
            }
        if sname not in files_dict[fname]["sheets"]:
            files_dict[fname]["sheets"][sname] = {
                "sheet_name": sname,
                "items": []
            }
        start_dt = row.start.strftime("%d/%m/%Y") if row.start else None
        end_dt = row.end.strftime("%d/%m/%Y") if row.end else None
            
        # สร้าง Item โดยอ้างอิงคอลัมน์ที่มีจริงใน VwTransaction
        item = {
            "promotion_code": row.pro_code,
            "promotion_name": row.pro_name,
            "START_DATE": start_dt,
            "END_DATE": end_dt,
            "coupon": row.coupon ,
            "remark": row.description ,
            # ปรับปรุงให้ดึงค่าสถานะที่มีอยู่จริงใน View
            "status_defect": True if row.status_defect == 1 else False,
            "status_transaction": True if row.status_trasation == 1 else False
        }
        
        files_dict[fname]["sheets"][sname]["items"].append(item)
  
        
    detail_list = []
    for fname, f_data in files_dict.items():
        f_data["sheets"] = list(f_data["sheets"].values())
        detail_list.append(f_data)
        
    response = [
        {
            "version": str(version_id),
            "detail": detail_list
        }
    ]

    return response

@router.get("/inquiry")
def get_full_promotion_info(value: str, db: Session = Depends(get_db)):
    """
    Business Logic: ดึงและจัดรูปแบบข้อมูลโปรโมชั่นตาม Database ใหม่
    """
    # 1. ดึงข้อมูลจาก Repository
    promo = db.query(MPromotionHeader).filter(
            or_(
                cast(MPromotionHeader.pro_code, String).contains(value),
                MPromotionHeader.pro_name.ilike(f"%{value}%")
            )
        ).options(
            joinedload(MPromotionHeader.file_master)
                .joinedload(MFileMaster.info_import)
                .joinedload(MInfoImportFile.version_control),
            joinedload(MPromotionHeader.bucket_entities)
                .joinedload(MPromotionBucketEntity.transaction_ref),
            joinedload(MPromotionHeader.defects),
            joinedload(MPromotionHeader.transactions)
                .joinedload(TTransaction.ejs)

        ).first()
    if not promo:
        return {"error": "Promotion not found", "status": 404}

    # 2. เตรียมข้อมูลความสัมพันธ์ (Relationships)
    file_master = getattr(promo, "file_master", None)
    info_import = getattr(file_master, "info_import", None) if file_master else None
    version_ctrl = getattr(info_import, "version_control", None) if info_import else None
    
    # 3. จัดการข้อมูลสินค้า (Products) แยกตาม Bucket
    buckets_data = {}
    promo_coupon = ""
    entities = getattr(promo, "bucket_entities", [])
    
    for entity in entities:
        b_id = getattr(entity, "bucket", 0)
        if getattr(entity, "coupon", None):
            promo_coupon = entity.coupon
            
        if b_id not in buckets_data:
            buckets_data[b_id] = {
                "ENTITY_TYPE": getattr(entity, "entity_type", ""),
                "BUCKET": b_id,
                "ENTITY": []
            }
        
        buckets_data[b_id]["ENTITY"].append({
            "ENTITY_CODE": getattr(entity, "entity_code", None),
            "ENTITY_NAME": getattr(entity, "entity_name", None),
            'ENTITY_TYPE':getattr(entity, "entity_type", None),
            "MODE": "Include" if (getattr(entity, "mode", "") or "").lower() == "include" else "Exclude",
            'BUCKET':getattr(entity, "bucket", None),
            "TRIGGER_VALUE": getattr(entity, "trigger_value", None),
            "TRIGGER_TYPE": getattr(entity, "trigger_type", None),
            'CONDITION':getattr(entity, "condition", None),
            "CONDITION_NAME": getattr(entity, "condition_name", None),
            'CONDITION_ID':getattr(entity, "condition_id", None),
            "PRICE": getattr(entity, "trigger_value", None), # อ้างอิงตาม Logic เดิม
            "BARCODE": getattr(entity, "barcode", None)
        })

    # 4. จัดรูปแบบผลลัพธ์ (Final Response)
    version_title = getattr(version_ctrl, "title", None) if version_ctrl else None
    version_id = getattr(version_ctrl, "id", None) if version_ctrl else None
    version_no = getattr(version_ctrl, "sr_no", None) if version_ctrl else None
    system_desc = getattr(info_import, "description", None) if info_import else None

    # สรุปประวัติการ Import
    history_item = {
        "ID":version_id,
        "VERSION_ID":version_title ,
        "VERSION_NAME":version_no,
        "RUNNING_NO": getattr(file_master, "id", None),
        "worksheet": getattr(file_master, "file_name", None),
        "sheet": getattr(file_master, "sheet", None),
        "STATUS": getattr(file_master, "status", None),
        "USER_MK": getattr(file_master, "user_mk", None),
        "SYSTEM": system_desc,
        "COUPON": promo_coupon,
        "PRODUCTS_DETAIL": list(buckets_data.values())
    }

    return {
        "master_info": {
            "PRO_CODE": promo.pro_code,
            "PRO_NAME": promo.pro_name,
            "PRO_RECEIPT_NAME": promo.pro_receipt_name,
            "PRO_TYPE": promo.pro_type,
            "PRO_GROUP": promo.pro_group,
            "PRO_STATUS": promo.pro_status,
            "PRO_LEVEL": promo.pro_level,
            "START_DATE": promo.start_date.isoformat() if promo.start_date else None,
            "END_DATE": promo.end_date.isoformat() if promo.end_date else None,
            "REWARD_VALUE": getattr(promo, "reward_value", None),
            "REWARD_TYPE": promo.reward_type,
            "REWARD_MA": promo.reward_ma,
            "REWARD_NAME": promo.reward_name,
            "LIMIT_TRAN": getattr(promo, "limit_tran", ""),
            "LIMIT_DAY": promo.limit_day,
            "LIMIT_ITEM": promo.limit_item,
            "LIMIT_REDEMP": promo.limit_redemp,
            "MEMBER_TIER": promo.member_tier,
            "MEMBER_SEGM": promo.member_segm,
            "MEMBER_REQU": promo.member_requ,
            "NOTES": getattr(promo, "notes", None),
            "FLAGS": {
                "SUN": promo.sun_fg, "MON": promo.mon_fg, "TUE": promo.tue_fg,
                "WED": promo.wed_fg, "THU": promo.thu_fg, "FRI": promo.fri_fg, # Default
                "SAT": promo.sat_fg ,"SPEC": promo.spec_fg,"EXCLUD": promo.exclud_fg
            }
        },
        # "import_history": [history_item] if file_master else [],
        "products": [history_item] if file_master else [], # ตามโครงสร้างเดิมที่ใช้แสดงผล
        "defects": [d for d in getattr(promo, "defects", [])],
        "transactions": [t for t in getattr(promo, "transactions", [])]
    }

@router.get("/entity_error")
def entity_error(db: Session = Depends(get_db)):
    """
    ดึงข้อมูลจาก MPromotionHeader โดยกรองเงื่อนไขจาก pma_entity
    และรองรับการตรวจสอบ Entity Code (ตัด 2 หลักแรก)
    """
    return db.scalars(select(pma_entity).where(pma_entity.export == True)).all()

# @router.post("/date")
# async def get_date():
#     ...
