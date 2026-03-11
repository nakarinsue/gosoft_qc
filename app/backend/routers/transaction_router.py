from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session,joinedload
from datetime import datetime
import app.backend.models.sql_server.crud as crud
from app.backend.database import get_db,get_db_mysql
from app.backend.auth import get_current_user
from app.backend.models.postgres._base_on import MaUser, TTransaction,TTransactionitem,MPromotionBucketEntity,MPromotionHeader,MFileMaster
from app.backend.schemas.all_schemas import MachineInputRequest, DefectCreate, RemarkUpdate,ItemQueryRequest, ItemResponse,CreateDefectRequest
from typing import List
router = APIRouter(prefix="/transactions", tags=["Transactions & Defects"])

@router.post("/machine-input")
def record_machine_input(data: MachineInputRequest, current_user: MaUser = Depends(get_current_user), db: Session = Depends(get_db)):
    tran = TTransaction(
        pro_id=data.pro_id,
        store_code=data.store_code,
        pos_no=data.pos_no,
        receipt_no=data.receipt_no,
        title=f"INPUT: {data.input_value}",
        description=f"User input value: {data.input_value}",
        business_datetime=datetime.now(),
        system_datetime=datetime.now(),
        shift_no=1,
        common_tran=0,
        types=1, # Type 1 = General Input
        user_create=current_user.user_id,
        user_update=current_user.user_id
    )
    db.add(tran)
    db.commit()
    return {"message": "Recorded", "id": tran.id}

@router.post("/defect")
def add_defect(data: DefectCreate, current_user: MaUser = Depends(get_current_user), db: Session = Depends(get_db)):
    defect = TTransaction(
        pro_id=data.pro_id,
        store_code=data.store_code,
        receipt_no=data.receipt_no,
        title=data.title,
        description=data.description,
        business_datetime=datetime.now(),
        system_datetime=datetime.now(),
        pos_no=0, shift_no=0, common_tran=0,
        types=2, # Type 2 = Defect
        user_create=current_user.user_id,
        user_update=current_user.user_id
    )
    db.add(defect)
    db.commit()
    return {"message": "Defect added", "id": defect.id}



@router.post("/defect-product")
def create_defect_transaction(req: CreateDefectRequest, db: Session = Depends(get_db)):
    now = datetime.utcnow()
    
    # 1. กำหนด Title ตามเงื่อนไข (ทุกชนิด / บางชนิด)
    item_type_text = "สินค้าทุกชนิด" if req.is_all_items else "สินค้าบางชนิด"
    entity_codes_str = ", ".join([item.entity_code for item in req.items])
    
    title_text = f"Promotion code {req.pro_id} ไม่พบ Barcode ของ {item_type_text}"
    desc_text = f"Promotion code {req.pro_id} ไม่พบ Barcode ของ Entity code [{entity_codes_str}] ทำการหา ณ วันที่ {now.strftime('%Y-%m-%d %H:%M:%S')}"

    # 2. สร้าง Transaction หลัก
    new_tx = TTransaction(
        pro_id=req.pro_id,
        types=0,
        store_code="08602",
        pos_no=9,
        shift_no=9,
        receipt_no=0,
        common_tran=0,
        business_datetime=now,
        system_datetime=now,
        title=title_text,
        description=desc_text,
        status=1,
        date_create=now,
        date_update=now,
        user_create=req.user_id,
        user_update=req.user_id
    )
    db.add(new_tx)
    db.flush() # เพื่อให้ได้ new_tx.id นำไปใช้ต่อ

    # 3. วนลูปสร้าง Transaction Item และอัปเดต Bucket Entity
    for item in req.items:
        new_item = TTransactionitem(
            T_id=new_tx.id,
            title=item.entity_code,
            status=1,
            types=1,
            description="",
            date_create=now,
            date_update=now,
            user_create=req.user_id,
            user_update=req.user_id
        )
        db.add(new_item)
        db.flush() # เพื่อให้ได้ new_item.id (receipt_id)

        # อัปเดตตาราง MPromotionBucketEntity
        db.query(MPromotionBucketEntity).filter(
            MPromotionBucketEntity.pro_id == item.pro_id,
            MPromotionBucketEntity.entity_code == item.entity_code
        ).update({
            "receipt_id": new_item.id,
            "status": 2,
            "date_update": now,
            "user_update": req.user_id
        })

    db.commit()
    return {"status": "success", "message": "บันทึก Defect สำเร็จ"}



@router.get("/promotion-detail/{pro_code}")
def get_promotion_detail(pro_code: int, db: Session = Depends(get_db)):
    # 1. ดึงข้อมูลหลักจาก MPromotionHeader โดยเชื่อมไปยัง FileMaster และ VersionControl
    promo = db.query(MPromotionHeader).filter(
        MPromotionHeader.pro_code == pro_code
    ).options(
        joinedload(MPromotionHeader.promotion_header_file_master)
        .joinedload(MFileMaster.file_master_file_infomation),
        joinedload(MPromotionHeader.promotion_header_bucket_entity),
        joinedload(MPromotionHeader.defects)
    ).first()

    if not promo:
        raise HTTPException(status_code=404, detail="Promotion not found")

    file_master = promo.promotion_header_file_master
    version_ctrl = file_master.file_master_file_infomation

    # 2. จัดรูปแบบข้อมูล master_info
    master_info = {
        "PRO_CODE": promo.pro_code,
        "PRO_NAME": promo.pro_name,
        "PRO_RECEIPT_NAME": promo.pro_receipt_name,
        "PRO_TYPE": promo.pro_type,
        "PRO_GROUP": promo.pro_group,
        "PRO_STATUS": promo.pro_status,
        "PRO_LEVEL": promo.pro_level,
        "START_DATE": promo.start_date.isoformat(),
        "END_DATE": promo.end_date.isoformat(),
        "REC_DATE": promo.rec_date.isoformat(),
        "UPDATE_DATE": promo.update_date.isoformat() if promo.update_date else None,
        "REWARD_VALUE": promo.reward_value,
        "REWARD_TYPE": promo.reward_type,
        "REWARD_MA": promo.reward_ma,
        "REWARD_NAME": promo.reward_name,
        "LIMIT_TRAN": promo.limit_tran,
        "LIMIT_DAY": promo.limit_day,
        "LIMIT_ITEM": promo.limit_item,
        "LIMIT_REDEMP": promo.limit_redemp,
        "MEMBER_TIER": promo.member_tier,
        "MEMBER_SEGM": promo.member_segm,
        "MEMBER_REQU": promo.member_requ,
        "NOTES": promo.notes,
        "SUN_FG": promo.sun_fg,
        "MON_FG": promo.mon_fg,
        "TUE_FG": promo.tue_fg,
        "WED_FG": promo.wed_fg,
        "THU_FG": promo.thu_fg,
        "FRI_FG": True,  # ตัวอย่างเดิมมี FRI_FG แต่ใน Schema ไม่มี จึงใส่ค่า default หรือต้องอัปเดตตาราง
        "SAT_FG": promo.sat_fg,
        "SEPC_FG": promo.spec_fg,
        "EXCLUD_FG": promo.exclud_fg
    }

    # 3. จัดรูปแบบ import_history
    import_history = [{
        "ID": file_master.id,
        "VERSION_NO": version_ctrl.file_infomation_version_control.sr_no,
        "RUNNING_NO": file_master.id,
        "worksheet": file_master.file_name,
        "sheet": file_master.sheet,
        "STATUS": file_master.status,
        "R_ROW": file_master.r_row,
        "R_COLUMN": 0, # ใน Schema ปัจจุบันไม่มี R_COLUMN
        "W_ROW": file_master.w_row,
        "W_COLUMN": 0, # ใน Schema ปัจจุบันไม่มี W_COLUMN
        "USER_MK": file_master.user_mk,
        "remark": file_master.description,
        "SYSTEM": version_ctrl.description  # ค่าสมมติ
    }]

    # 4. จัดกลุ่มข้อมูล products (MPromotionBucketEntity)
    # จัดกลุ่มตาม BUCKET และ ENTITY_TYPE
    buckets_data = {}
    for entity in promo.promotion_header_bucket_entity:
        b_id = entity.bucket
        if b_id not in buckets_data:
            buckets_data[b_id] = {
                "ENTITY_TYPE": entity.entity_type,
                "BUCKET": b_id,
                "ENTITY": []
            }
        
        buckets_data[b_id]["ENTITY"].append({
            "ENTITY_CODE": entity.entity_code,
            "ENTITY_NAME": entity.entity_name,
            "MODE": "Include" if entity.mode.lower() == "include" else "Exclude",
            "TRIGGER_VALUE": entity.trigger_value,
            "TRIGGER_TYPE": entity.trigger_type,
            "CONDITION": entity.condition,
            "CONDITION_NAME": entity.condition_name,
            "CONDITION_ID": entity.condition_id,
            "PRICE": entity.trigger_value,
            "BARCODE": entity.barcode
        })

    products = [{
        "ID": file_master.id,
        "VERSION_NO": version_ctrl.file_infomation_version_control.id,
        "RUNNING_NO": file_master.id,
        "worksheet": file_master.file_name,
        "sheet": file_master.sheet,
        "STATUS": file_master.status,
        "R_ROW": file_master.r_row,
        "W_ROW": file_master.w_row,
        "USER_MK": file_master.user_mk,
        "remark": file_master.description,
        "SYSTEM": version_ctrl.description,
        "COUPON":entity.coupon, # สามารถดึงจาก entity.coupon ถ้ามี
        "PRODUCTS": list(buckets_data.values())
    }]

    # 5. รวมผลลัพธ์ทั้งหมด
    return {
        "master_info": master_info,
        "Sub-Pro": [],
        "import_history": import_history,
        "products": products,
        "defects": [d.id for d in promo.defects], # ตัวอย่างข้อมูลจาก TTransaction
        "payments": {
            "summary": [],
            "details": [],
            "items": []
        }
    }














@router.patch("/{tran_id}/remark")
def update_remark(tran_id: int, data: RemarkUpdate, db: Session = Depends(get_db)):
    tran = db.get(TTransaction, tran_id)
    if not tran: raise HTTPException(404, "Transaction not found")
    
    tran.description = f"{tran.description} | Remark: {data.remark}"
    db.commit()
    return {"message": "Remark updated"}

@router.post("/search", response_model=List[ItemResponse])
def search_items1(payload: ItemQueryRequest, db: Session = Depends(get_db_mysql)):
    try:
        # ตรวจสอบว่ามีข้อมูลส่งมาหรือไม่
        if not payload.idcode:
            raise HTTPException(status_code=400, detail="idcode list cannot be empty")
            
        results = crud.get_items_by_id_and_store(
            db, 
            idcode=payload.idcode, 
            store_id=payload.store_id
        )
        return results
    except Exception as e:
        # จัดการ error ให้เป็นมาตรฐาน
        raise HTTPException(status_code=500, detail=f"Database Error: {str(e)}")
    
