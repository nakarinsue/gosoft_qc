from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_,func
from app.backend.schemas.all_schemas import  APIResponse,QueryRequest,CheckBarcodeRequest,Optional,UpdateBarcodeRequest,APIResponse_to_list
from app.backend.models.mysql._base_on import  Product_and_return_barcode,Product_and_return_barcode_all
from app.backend.database import get_db
from app.backend.models.postgres._base_on import MPromotionBucketEntity, MPromotionHeader, MFileMaster,Minformationimport
router = APIRouter(prefix="/Product", tags=["API for querying products"])



@router.post("/mysql", response_model=APIResponse)
def get_products_from_mysql(request: QueryRequest,):
    """API เส้นที่ 1: ค้นหาข้อมูลจาก MySQL"""
    service=Product_and_return_barcode()
    if not request.item_codes:
        return APIResponse(returnCode="4000", returnMessage="Bad Request: item_codes is empty", result=[])
    try:
        result_data = service.get_all(request)
        return APIResponse(
            returnCode="0000",
            returnMessage="success",
            result=result_data ) # type: ignore
    except Exception as e:
        return APIResponse(returnCode="5000", returnMessage=f"Database Error: {str(e)}", result=[])

@router.post("/mysql-to-list", response_model=APIResponse_to_list)
def get_products_from_mysql_to_list(request: QueryRequest):
    """API เส้นที่ 1: ค้นหาข้อมูลจาก MySQL และคืนค่าเฉพาะรายการที่ 'ไม่พบ' ในฐานข้อมูล"""
    service=Product_and_return_barcode()
    if not request.item_codes:
        return APIResponse(returnCode="4000", returnMessage="Bad Request: item_codes is empty", result=[])
    try:
        requested_codes = set(request.item_codes)
        result_data = service.get_all(request)
        found_codes = set(str(item.get('product_code')) for item in result_data if item.get('product_code') is not None) # type: ignore
        missing_codes = requested_codes - found_codes
        msg = "success" if not missing_codes else "success with missing items"
        
        return {
            "returnCode":"0000",
            "returnMessage":msg,
            "result":missing_codes}
            
    except Exception as e:
        return APIResponse(returnCode="5000", returnMessage=f"Database Error: {str(e)}", result=[])



@router.get("/missing-barcodes")
def get_missing_barcodes(v_id: int = 0, db: Session = Depends(get_db)):
    """
    ดึงค่า entity_code ที่ไม่มี barcode และ entity_type = 'item'
    ถ้า v_id = 0 จะดึงทั้งหมด
    """
    query = db.query(MPromotionBucketEntity, Minformationimport.v_id)\
        .join(MPromotionHeader, MPromotionBucketEntity.pro_id == MPromotionHeader.id)\
        .join(MFileMaster, MPromotionHeader.file_id == MFileMaster.id)\
        .join(Minformationimport, MFileMaster.v_id == Minformationimport.id)\
        .filter(func.upper(MPromotionBucketEntity.entity_type) == "ITEM")\
        .filter(or_(MPromotionBucketEntity.barcode == None, MPromotionBucketEntity.barcode == ""))

    # เงื่อนไข Version ID
    if v_id != 0:
        query = query.filter(Minformationimport.v_id == v_id)

    results = query.all()

    # จัดกลุ่มข้อมูล (Group by entity_code) เพื่อรวม pro_id ไว้ใน Array
    grouped_data = {}
    for bucket, version_id in results:
        code = bucket.entity_code
        if code not in grouped_data:
            grouped_data[code] = {
                "entity_code": code,
                "entity_name": bucket.entity_name,
                "pro_id": [],
                "mode": bucket.mode,
                "barcode": bucket.barcode
            }
        # เพิ่ม pro_id เข้าไปใน list (ป้องกันข้อมูลซ้ำ)
        if bucket.pro_id not in grouped_data[code]["pro_id"]:
            grouped_data[code]["pro_id"].append(bucket.pro_id)

    return {"status": "success", "data": list(grouped_data.values())}


# -----------------------------------------------------------------------------
# จำลองฟังก์ชันเรียก API ตรวจสอบ Barcode ภายนอก (สำหรับใช้งานใน API 2)
# -----------------------------------------------------------------------------
def mock_check_barcode_api(store_code: str, entity_code: str) -> Optional[str]:
    # TODO: ใส่ Logic Request ไปยังระบบ Check Barcode จริง
    # ตัวอย่าง: return "885123456789" ถ้าเจอ หรือ return None ถ้าไม่เจอ
    return None 


# -----------------------------------------------------------------------------
# API 2: นำข้อมูลไปเช็ค Barcode ภายนอก และอัปเดตลงตาราง
# -----------------------------------------------------------------------------
@router.post("/check-barcodes")
def check_and_update_barcodes(req: CheckBarcodeRequest, db: Session = Depends(get_db)):
    """
    รับค่า item[pro_id, entity_code], store_code ไปยิง API เช็ค Barcode
    ถ้าเจอ ให้อัปเดตตาราง, ถ้าไม่เจอ ให้เก็บไว้สรุปผล
    """
    updated_items = []
    not_found_items = []

    for item in req.items:
        # เรียก API ภายนอก (ตัวอย่าง)
        found_barcode = mock_check_barcode_api(req.store_code, item.entity_code)
        
        if found_barcode:
            # ค้นหาและอัปเดตข้อมูล
            bucket_record = db.query(MPromotionBucketEntity).filter(
                MPromotionBucketEntity.pro_id == item.pro_id,
                MPromotionBucketEntity.entity_code == item.entity_code
            ).first()
            
            if bucket_record:
                bucket_record.barcode = found_barcode
                updated_items.append({"entity_code": item.entity_code, "pro_id": item.pro_id, "barcode": found_barcode})
        else:
            not_found_items.append({"entity_code": item.entity_code, "pro_id": item.pro_id})

    # บันทึกการอัปเดตลง Database
    db.commit()

    return {
        "status": "success",
        "summary": {
            "total_checked": len(req.items),
            "barcode_found_and_updated": len(updated_items),
            "barcode_not_found": len(not_found_items)
        },
        "not_found_list": not_found_items,
        "updated_list": updated_items
    }


# -----------------------------------------------------------------------------
# API 3: อัปเดต Barcode โดยตรง (ส่ง entity_code, barcode, pro_id[])
# -----------------------------------------------------------------------------
@router.put("/update-barcode")
def update_barcode_manual(req: UpdateBarcodeRequest, db: Session = Depends(get_db)):
    """
    อัปเดตค่า Barcode ตาม entity_code และรายการ pro_id ที่ส่งมา
    """
    records_to_update = db.query(MPromotionBucketEntity).filter(
        MPromotionBucketEntity.entity_code == req.entity_code,
        MPromotionBucketEntity.pro_id.in_(req.pro_ids)
    ).all()

    if not records_to_update:
        raise HTTPException(status_code=404, detail="No matching records found to update.")

    updated_count = 0
    for record in records_to_update:
        record.barcode = req.barcode
        updated_count += 1

    db.commit()

    return {
        "status": "success",
        "message": f"Updated barcode '{req.barcode}' for entity '{req.entity_code}'",
        "updated_rows": updated_count
    }


# -----------------------------------------------------------------------------
# API 4: Get Summary (สรุปผลข้อมูลตาม Version ID)
# -----------------------------------------------------------------------------
@router.get("/summary")
def get_bucket_summary(v_id: int = 0, db: Session = Depends(get_db)):
    """
    แสดงผลสรุป: จำนวน product code ที่ไม่ซ้ำ, จำนวนที่มี/ไม่มี Barcode 
    และจำนวนของ entity_type อื่นๆ
    """
    query = db.query(MPromotionBucketEntity)\
        .join(MPromotionHeader, MPromotionBucketEntity.pro_id == MPromotionHeader.id)\
        .join(MFileMaster, MPromotionHeader.file_id == MFileMaster.id)

    if v_id != 0:
        query = query.filter(MFileMaster.v_id == v_id)

    all_buckets = query.all()

    unique_products = {}
    entity_type_counts = {}

    for bucket in all_buckets:
        # 1. นับจำนวนแยกตาม entity_type (A:0, B:0, C:0 ...)
        e_type = bucket.entity_type if bucket.entity_type else "Empty"
        entity_type_counts[e_type] = entity_type_counts.get(e_type, 0) + 1

        # 2. แยกคิดเฉพาะ item เพื่อหา Product Code ที่ไม่ซ้ำ และเช็ค Barcode
        if e_type.lower() == "item":
            if bucket.entity_code not in unique_products:
                # บันทึกสถานะว่ามี barcode หรือไม่ (True/False)
                has_barcode = bool(bucket.barcode and bucket.barcode.strip() != "")
                unique_products[bucket.entity_code] = has_barcode

    # คำนวณสรุปผล
    sum_product_code = len(unique_products)
    product_has_barcode = sum(1 for has_bc in unique_products.values() if has_bc)
    product_no_barcode = sum_product_code - product_has_barcode
    detail_not_barcode = [code for code, has_bc in unique_products.items() if not has_bc]

    return {
        "status": "success",
        "data": {
            "version_id": v_id,
            "sum_product_code": sum_product_code,
            "product_code_count": product_has_barcode, # จำนวนที่มี Barcode
            "not_product_code": product_no_barcode,    # จำนวนที่ไม่มี Barcode
            "entity_type": entity_type_counts,         # แยกประเภทอื่นๆ (A:0, b:0, ...)
            "detail_not_barcode": detail_not_barcode   # รายการที่ไม่เจอ Barcode
        }
    }