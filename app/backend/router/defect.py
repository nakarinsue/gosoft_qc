from fastapi import APIRouter, Depends, HTTPException,  status,Query
from sqlalchemy.orm import Session
from sqlalchemy import select,or_, cast, String,update
from typing import Optional
from datetime import datetime

from ..database.common.connet_database_postgres import get_db
from ..database.models.views import VwDefectInformation

from ..auth.security   import get_current_user
from ..database.models.postgres_models import MFileMaster,MInfoImportFile,MVersionControl,MPromotionBucketEntity, MPromotionHeader, TDefect,TDefectitem
from ..version.all_schemas  import DefectUpdateRequest,DefectCreateRequest

router = APIRouter(prefix="/defect", tags=["defect Control"])
 
def get_promotion_with_defect_details(db: Session, search_value: str):
    """
    Service Function สำหรับค้นหา Promotion ที่มี Defect 
    และดึงข้อมูลที่เกี่ยวข้องแบบ Optimized (ลดจำนวนการ Query)
    """
    if not search_value:
        return None
    stmt = (
        select(MPromotionHeader)
        # 1. ใช้ outerjoin (LEFT JOIN) เพื่อเอา MPromotionHeader ทั้งหมดมาตั้งต้น
        .outerjoin(TDefect, TDefect.pro_id == MPromotionHeader.id) 
        # 2. กรองเอาเฉพาะตัวที่ไม่มีข้อมูลใน TDefect (ค่า pro_id หรือ id ของ TDefect จะเป็น NULL)
        .where(TDefect.pro_id.is_(None))
    )

    # 3. ถ้ามีการส่งค่าค้นหามาด้วย (ค้นหาจาก Code หรือ Name) ให้เพิ่มเงื่อนไขเข้าไป
    if search_value:
        stmt = stmt.where(
            or_(
                cast(MPromotionHeader.pro_code, String).contains(search_value),
                MPromotionHeader.pro_name.ilike(f"%{search_value}%")
            )
        )

    # ดึงข้อมูลทั้งหมดที่ตรงตามเงื่อนไข
    promotion_headers = db.scalars(stmt).all()
    
    if not promotion_headers:
        return [] # คืนค่าเป็น List ว่างแทน None เพื่อให้โครงสร้างข้อมูลสม่ำเสมอ

    result_list = []

    # วนลูปจัดการทีละ Promotion
    for header in promotion_headers:
        related_data = {
            "promotion": header,
            "file_master": None,
            "import_file": None,
            "version_control": None,
            "bucket_entities": []
        }

        if header.file_id:
            related_data["file_master"] = db.scalars(
                select(MFileMaster).where(MFileMaster.id == header.file_id)
            ).first()

        if related_data["file_master"] and related_data["file_master"].v_id:
            related_data["import_file"] = db.scalars(
                select(MInfoImportFile).where(MInfoImportFile.id == related_data["file_master"].v_id)
            ).first()

        if related_data["import_file"] and related_data["import_file"].v_id:
            related_data["version_control"] = db.scalars(
                select(MVersionControl).where(MVersionControl.id == related_data["import_file"].v_id)
            ).first()

        related_data["bucket_entities"] = db.scalars(
            select(MPromotionBucketEntity).where(MPromotionBucketEntity.pro_id == header.id)
        ).all()
        
        # นำข้อมูลที่ประกอบเสร็จแล้วเก็บเข้า List หลัก
        result_list.append(related_data)

    return result_list

@router.get("/showall") # แนะนำให้เปลี่ยนจาก POST เป็น GET สำหรับการดึงข้อมูลครับ
async def get_defect(
    skip: int = 0, 
    limit: int = 100,
    version_id: int = 0, 
    # current_user: MaUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # 1. Query ข้อมูล
    stmt = select(VwDefectInformation)
    
    if version_id != 0:
        # ⚠️ แก้ไขบั๊กตรงนี้: เปลี่ยนจาก vwsummaryfileimport เป็น VwDefectInformation
        stmt = stmt.where(VwDefectInformation.version_id == version_id)
        
    # ⚠️ จัดเรียงเอา id ล่าสุดขึ้นก่อน เพื่อให้ตอน Grouping ได้ "ค่าล่าสุด" เสมอ
    stmt = stmt.order_by(VwDefectInformation.id.desc())
    stmt = stmt.offset(skip).limit(limit)
    
    raw_data = db.scalars(stmt).all()  

    grouped_data = {}
    
    for row in raw_data:
        # ✅ แก้ไข 1: ใช้จุด (.) แทนวงเล็บเหลี่ยม
        group_key = row.pro_id 
        
        if group_key not in grouped_data:
            grouped_data[group_key] = {
                "pro_id": row.pro_id,                           # ✅ ใช้ .pro_id
                "promotion_code": row.promotion_code,           # ✅ ใช้ .promotion_code
                "promotion_name": row.promotion_name,           # ✅ ใช้ .promotion_name
                "POS": getattr(row, "system", "POS") or "POS", 
                "file_name": row.file_name,                     # ✅ ใช้ .file_name
                "sheet": row.sheet,                             # ✅ ใช้ .sheet
                "detail": row.detail,                           # ✅ ใช้ .detail
                "remark": row.remark,                           # ✅ ใช้ .remark
                "user_create": row.user_create,                 # ✅ ใช้ .user_create
                "user_upde": row.user_upde,                     # ✅ ใช้ .user_upde
                "user_mk": row.user_mk,                         # ✅ ใช้ .user_mk
                "status": row.status,
                "id": row.id,                                   # ✅ ใช้ .id
                "title": row.title,                               # ✅ ใช้ .status
                "entity": [] ,                               # ✅ ใช้ .status
                "types": [] 
            }

        # เช็คว่ามี Entity นี้อยู่แล้วหรือยัง
        is_duplicate = any(e["entity_code"] == row.entity_code for e in grouped_data[group_key]["entity"])
        if not is_duplicate:
            entity_item = {
                "entity_code": row.entity_code,                 # ✅ ใช้ .entity_code
                "entity_name": row.entity_name,                 # ✅ ใช้ .entity_code
                "condition_id": row.condition_id,                 # ✅ ใช้ .entity_code
                "barcode": row.barcode,                 # ✅ ใช้ .entity_code
                "coupon": row.coupon,                 # ✅ ใช้ .entity_code
                "mode": row.mode  
                                                    # ✅ ใช้ .entity_name
            }
            grouped_data[group_key]["entity"].append(entity_item)
        if row.other:
            is_duplicate = any(row.other in e for e in grouped_data[group_key]["types"])
            if not is_duplicate:
                grouped_data[group_key]["types"].append(row.other)
    # 4. แปลง Dictionary กลับเป็น List เพื่อส่งเป็น JSON Response
    return list(grouped_data.values())


@router.get("/inquiry")
def check_promotion_defect(
    value: Optional[str] = Query(None, description="ค้นหาด้วยรหัส หรือ ชื่อโปรโมชั่น"), 
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    API สำหรับดึงโครงสร้าง Version -> Item 
    โดยกรองเฉพาะ Promotion ที่มี code/name ตรงกับที่ค้นหา และต้องมี Defect
    """
    # 1. ตรวจสอบ Input
    if not value:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="กรุณาระบุรหัสหรือชื่อโปรโมชัน (value) เพื่อค้นหา"
        )

    result = get_promotion_with_defect_details(db=db, search_value=value)
    if not result:
        # คืนค่า 404 แทนการปล่อยให้พัง หรือคืนค่าเงียบๆ
        return  {'detail':"ไม่พบโปรโมชันที่ระบุ หรือ โปรโมชันนี้ไม่มี Defect ที่สร้างโดยผู้ใช้"}
    return {
        "message": "พบข้อมูลโปรโมชันที่มี Defect",
        "data": result }
    # file_master = [getattr(i, "file_master", None) for i in promo]
    # info_import = [getattr(i, "info_import", None)for i in file_master] if file_master else []
    # version_ctrl = [getattr(i, "version_control", None)for i in info_import] if info_import else []
    

    # for i in version_ctrl:
    #     i['info_import']= info_import[]
    # # 3. จัดการข้อมูลสินค้า (Products) แยกตาม Bucket
    # buckets_data = {}
    # promo_coupon = ""
    # entities = getattr(promo, "bucket_entities", [])
    
    # for entity in entities:
    #     b_id = getattr(entity, "bucket", 0)
    #     if getattr(entity, "coupon", None):
    #         promo_coupon = entity.coupon
            
    #     if b_id not in buckets_data:
    #         buckets_data[b_id] = {
    #             "ENTITY_TYPE": getattr(entity, "entity_type", ""),
    #             "BUCKET": b_id,
    #             "ENTITY": []
    #         }
        
    #     buckets_data[b_id]["ENTITY"].append({
    #         "ENTITY_CODE": getattr(entity, "entity_code", None),
    #         "ENTITY_NAME": getattr(entity, "entity_name", None),
    #         'ENTITY_TYPE':getattr(entity, "entity_type", None),
    #         "MODE": "Include" if (getattr(entity, "mode", "") or "").lower() == "include" else "Exclude",
    #         'BUCKET':getattr(entity, "bucket", None),
    #         "TRIGGER_VALUE": getattr(entity, "trigger_value", None),
    #         "TRIGGER_TYPE": getattr(entity, "trigger_type", None),
    #         'CONDITION':getattr(entity, "condition", None),
    #         "CONDITION_NAME": getattr(entity, "condition_name", None),
    #         'CONDITION_ID':getattr(entity, "condition_id", None),
    #         "PRICE": getattr(entity, "trigger_value", None), # อ้างอิงตาม Logic เดิม
    #         "BARCODE": getattr(entity, "barcode", None)
    #     })

    # # 4. จัดรูปแบบผลลัพธ์ (Final Response)
    # version_title = getattr(version_ctrl, "title", None) if version_ctrl else None
    # version_id = getattr(version_ctrl, "id", None) if version_ctrl else None
    # version_no = getattr(version_ctrl, "sr_no", None) if version_ctrl else None
    # system_desc = getattr(info_import, "description", None) if info_import else None

    # # สรุปประวัติการ Import
    # history_item = {
    #     "ID":version_id,
    #     "VERSION_ID":version_title ,
    #     "VERSION_NAME":version_no,
    #     "RUNNING_NO": getattr(file_master, "id", None),
    #     "worksheet": getattr(file_master, "file_name", None),
    #     "sheet": getattr(file_master, "sheet", None),
    #     "STATUS": getattr(file_master, "status", None),
    #     "USER_MK": getattr(file_master, "user_mk", None),
    #     "SYSTEM": system_desc,
    #     "COUPON": promo_coupon,
    #     "PRODUCTS_DETAIL": list(buckets_data.values())
    # }
    # data = [{
    #         "PRO_CODE": i.pro_code,
    #         "PRO_NAME": i.pro_name,
    #         "PRO_RECEIPT_NAME": i.pro_receipt_name,
    #         "PRO_TYPE": i.pro_type,
    #         "PRO_GROUP": i.pro_group,
    #         "PRO_STATUS": i.pro_status,
    #         "PRO_LEVEL": i.pro_level,
    #         "START_DATE": i.start_date.isoformat() if i.start_date else None,
    #         "END_DATE": i.end_date.isoformat() if i.end_date else None,
    #         "REWARD_VALUE": getattr(i, "reward_value", None),
    #         "REWARD_TYPE": i.reward_type,
    #         "REWARD_MA": i.reward_ma,
    #         "REWARD_NAME": i.reward_name,
    #         "LIMIT_TRAN": getattr(i, "limit_tran", ""),
    #         "LIMIT_DAY": i.limit_day,
    #         "LIMIT_ITEM": i.limit_item,
    #         "LIMIT_REDEMP": i.limit_redemp,
    #         "MEMBER_TIER": i.member_tier,
    #         "MEMBER_SEGM": i.member_segm,
    #         "MEMBER_REQU": i.member_requ,
    #         "NOTES": getattr(i, "notes", None),
    #         "FLAGS": {
    #             "SUN": i.sun_fg, "MON": i.mon_fg, "TUE": i.tue_fg,
    #             "WED": i.wed_fg, "THU": i.thu_fg, "FRI": i.fri_fg, # Default
    #             "SAT": i.sat_fg ,"SPEC": i.spec_fg,"EXCLUD": i.exclud_fg
    #         }
    #     } for i in promo]

    # return {"version":version_ctrl,
    #     "master_info": ,
    #     # "import_history": [history_item] if file_master else [],
    #     "products": [history_item] if file_master else [], # ตามโครงสร้างเดิมที่ใช้แสดงผล
    #     "defects": [d for d in getattr(promo, "defects", [])],
    #     "transactions": [t for t in getattr(promo, "transactions", [])]
    # }

    # check_defect = (
    #     select(MPromotionHeader,t)
    #     .join(
    #         TDefect, 
    #         and_(
    #             TDefect.pro_id == MPromotionHeader.id, 
    #             TDefect.user_create.isnot(None) # 📍 แก้ไขการเช็ค Null
    #         )
    #     )
    #     .join(MFileMaster, MFileMaster.id == MPromotionHeader.file_id)
    #     .join(MInfoImportFile, MInfoImportFile.id == MFileMaster.v_id)
    #     .join(MVersionControl, MVersionControl.id == MInfoImportFile.v_id)
    #     # 📍 จำเป็นต้องมีการ Join VwDefectInformation ตรงนี้ก่อนเรียกใช้ใน Where
    #     # .join(VwDefectInformation, VwDefectInformation.??? == ???) 
    #     .where(
    #         or_(
    #             cast(MPromotionHeader.pro_code, String).contains(value),
    #             MPromotionHeader.pro_name.contains(value)
    #         )
    #     )
    # )
    # defect = db.scalars(check_defect).all()
    # if defect:
    #     return {"message": "value มี Defect", "defect_id": 1}
    # query = select(MPromotionHeader)

    # if value:
    #     query = query.where(
    #         or_(
    #             cast(MPromotionHeader.pro_code, String).contains(value),
    #             MPromotionHeader.pro_name.contains(value)
    #         )
    #     ) 
    # query = query.limit(10)
    # db.scalars(query).all()
    return defect

@router.post("/create")
async def create_defect(
    req: DefectCreateRequest,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # ตรวจสอบ Unique Constraint: 1 pro_id มี Defect ได้ตัวเดียว
    existing_defect = db.scalar(select(TDefect).where(TDefect.pro_id == req.pro_id))
    if existing_defect:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=f"Promotion ID {req.pro_id} นี้มีข้อมูล Defect อยู่แล้ว"
        )
    try:
        # 1. เตรียมข้อมูล TDefect
        new_defect = TDefect(
            pro_id=req.pro_id,
            types=0,
            title=req.title,
            status=1,
            description=req.description,
            remark=req.remark,
            user_create=current_user.user_id,
            user_update=current_user.user_id,
            date_create=datetime.utcnow(),
            date_update=datetime.utcnow()
        )
        db.add(new_defect)
        db.flush() # flush เพื่อดึง new_defect.id มาใช้ โดยยังไม่ commit
        stmt = (
            update(MPromotionBucketEntity)
            .where(MPromotionBucketEntity.pro_id == req.pro_id)
            .values(d_id=new_defect.id)
        )
        db.execute(stmt)
        stmt = (
            update(MFileMaster)
            .where(MFileMaster.id == req.file_id)
            .values(user_mk=req.mk_user)
        )
        db.execute(stmt)
        for i in req.types:
            defect_item = TDefectitem(
                df_id=new_defect.id,
                name=i,
                type_item=1,
                description=''
            )
            db.add(defect_item)
        db.flush() 
        db.commit()
        db.refresh(new_defect)
        
        return {"message": "เพิ่มข้อมูล Defect สำเร็จ", "defect_id": new_defect.id}

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail=f"บันทึกข้อมูลไม่สำเร็จ [{e}]"
        )
    

@router.put("/update")
async def update_defect(
    req: DefectUpdateRequest,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        # 1. ค้นหาข้อมูล Defect หลัก
        defect = db.scalar(select(TDefect).where(TDefect.id == req.id))

        if not defect:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail="ไม่พบข้อมูล Defect ที่ต้องการแก้ไข"
            )
        if req.title is not None:
            defect.title = req.title
        if req.status is not None:
            defect.status = req.status
        if req.description is not None:
            defect.description = req.description
        if req.remark is not None:
            defect.remark = req.remark
        if req.types is not None:
            existing_items = db.scalars(
                select(TDefectitem).where(TDefectitem.df_id == req.id)
            ).all()
            existing_items_dict = {
                int(item.name): item 
                for item in existing_items 
                if item.type_item == 1
            }
            existing_set = set(existing_items_dict.keys())
            incoming_set = set(req.types)
            items_to_delete = existing_set - incoming_set
            for item_name in items_to_delete:
                db.delete(existing_items_dict[item_name])
            items_to_add = incoming_set - existing_set
            for item_name in items_to_add:
                new_item = TDefectitem(
                    df_id=req.id,
                    name=item_name,
                    type_item=1, # กำหนดค่า default ตามที่คุณเคยใช้
                    description=''
                )
                db.add(new_item)
        defect.user_update = current_user.user_id
        defect.date_update = datetime.utcnow()
        db.commit()
        db.refresh(defect)
        
        return {"message": "อัปเดตข้อมูล Defect สำเร็จ", "defect_id": defect.id}

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"เกิดข้อผิดพลาดในการอัปเดตข้อมูล: {str(e)}"
        )
