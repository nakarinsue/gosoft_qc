from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_,func
from app.backend.dummy.services._product import get_product_data
from app.backend.database.common.connet_database_postgres import get_db
from app.backend.database.models.postgres_models import MPromotionBucketEntity, MPromotionHeader, MFileMaster,Minformationimport

from app.backend.schemas.inventory import APIResponse, QueryRequest, CheckBarcodeRequest, UpdateBarcodeRequest, APIResponse_to_list

router = APIRouter(prefix="/Product", tags=["API for querying products"])
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

@router.post("/check-barcodes")
def check_and_update_barcodes(req: CheckBarcodeRequest, db: Session = Depends(get_db)):
    updated_items = []
    not_found_items = []
    
    # 🌟 [จุดสำคัญ] เปลี่ยนรูปแบบการดึงค่า ให้กลายเป็น List ของ String แท้ๆ 
    # ผลลัพธ์จะเป็น: ['P001', 'P002', 'P003']
    entity_list = [str(i.entity_code).strip() for i in req.items]
    print(f"🔍 Entity Codes to search: {entity_list}")

    # ส่ง List ที่สะอาดแล้วไปให้ Database
    found_barcode_data = get_product_data(entity_list)
    
    # สร้าง Dictionary Mapping เพื่อลดภาระการวนลูป
    barcode_mapping = { 
        item.get('PRODUCT_CODE'): item
        for item in found_barcode_data if item.get('BARCODE')
    }

    for req_item in req.items:
        entity_code = str(req_item.entity_code).strip()
        new_barcode = barcode_mapping.get(entity_code)

        if new_barcode:
            bucket_record = db.query(MPromotionBucketEntity).filter(
                MPromotionBucketEntity.entity_code == entity_code,
                MPromotionBucketEntity.barcode == '' 
            ).first()

            if bucket_record:
                bucket_record.barcode = new_barcode.get('BARCODE')
                bucket_record.product_name =  new_barcode.get('product_name')
                bucket_record.product_package =  new_barcode.get('product_packge')
                bucket_record.product_price =  new_barcode.get('product_Price')
                bucket_record.product_unit =  new_barcode.get('product_unit')
                bucket_record.product_retail =  new_barcode.get('product_Retail')
                bucket_record.product_status =  new_barcode.get('product_status')
                bucket_record.product_type =  new_barcode.get('product_type')
                bucket_record.product_size =  new_barcode.get('product_zise')
                updated_items.append({"entity_code": entity_code, "barcode": new_barcode})
            else:
                not_found_items.append({"entity_code": entity_code, "reason": "Not found in bucket"})
        else:
            not_found_items.append({"entity_code": entity_code, "reason": "Barcode not found in MS_PRODUCT"})

    if updated_items:
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