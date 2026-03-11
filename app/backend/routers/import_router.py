from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from sqlalchemy import and_
from app.backend.database import get_db
from datetime import datetime
from app.backend.schemas.all_schemas import AssignUpdate,ImportInformation,InfoImportCreate,StatusUpdate,requserassign,AssignUpdateItem,UpdateAssignRequest
from app.backend.services.promotion_import_service import PromotionImportService
from app.backend.services.full_import_service import FullImportService
from app.backend.services.workload_service import WorkloadDistributor,get_workload_data,format_file_master_data
from typing import List,Dict
from app.backend.models.postgres._base_on import Minformationimport,MVersionControl,MPromotionHeader,MFileMaster,MaUser
from app.backend.auth import verify_password, create_access_token, get_current_user, get_password_hash

router = APIRouter(prefix="/import", tags=["import"])

@router.post("/minio")
def import_from_minio(
    info: ImportInformation, 
    db: Session = Depends(get_db)
):
    """
    รับข้อมูล Info เพื่อไปดึงไฟล์จาก Minio แล้วบันทึกลง Database
    """
    service = PromotionImportService(db)
    try:
        # ตัวอย่าง path_file ที่ส่งมา: "s3://my-bucket/uploads/promo_file_v1.xlsx"
        result = service.process_import(info)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.post("/upload-and-import")
async def upload_and_import(
    version: str = Form(..., description="เลข Version เช่น 2024/001"),
    system: str = Form(..., description="ระบบต้นทาง เช่น POS"),
    user_id: int = Form(..., description="User ID ผู้ทำรายการ"),
    file: UploadFile = File(...),
    remark: str = Form(default="", description="หมายเหตุ"),
    db: Session = Depends(get_db)
):
    """
    API เดียวจบ: รับไฟล์ -> ลง MinIO -> อ่าน -> ลง Database Postgres
    """
    try:
        file_content = await file.read()
        
        service = FullImportService(db)
        result = service.run_process(
            file_content=file_content,
            filename=file.filename, # type: ignore
            version=version,
            system=system,
            user_id=user_id,
            remark=remark
        )
        
        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")
    
@router.post("/info-import/insert")
def insert_info_import(data: InfoImportCreate, db: Session = Depends(get_db)):
    try:
        new_info = Minformationimport(
            v_id=data.v_id,
            status=data.status,
            description=data.description,
            user_create=data.user_create,
            date_create=datetime.utcnow()
        )
        db.add(new_info)
        db.commit()
        db.refresh(new_info)
        
        # Return id กลับไปหา User ตามคำสั่ง
        return {"id": new_info.id, "message": "Insert successful"}
    except Exception as e:
        db.rollback()
        print(str(e))
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/info-import/update-status")
def update_info_status(data: StatusUpdate, db: Session = Depends(get_db)):
    # ค้นหาข้อมูลตาม id
    info_record = db.query(Minformationimport).filter(Minformationimport.id == data.id).first()
    
    if not info_record:
        raise HTTPException(status_code=404, detail="Record not found")
    
    try:
        # อัพเดทค่า Status
        info_record.status = data.status
        # หมายเหตุ: หากมี column date_update สามารถอัพเดทเพิ่มได้ที่นี่
        db.commit()
        
        return {"message": f"Update status for id {data.id} to {data.status} successful"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/export/show-all")
def export_file_excel(db: Session = Depends(get_db)):
    try:
        info_record = (
            db.query(
                MFileMaster.file_name,
                MFileMaster.sheet,
                MPromotionHeader.start_date,
                MPromotionHeader.end_date
            )
            .distinct()
            .join(MPromotionHeader, MFileMaster.id == MPromotionHeader.file_id)
            .filter(MPromotionHeader.export.is_(True)) # ใช้ .is_(True) ตามมาตรฐาน
            .all()
        )
        if not info_record:
            raise HTTPException(status_code=404, detail="Record not found")
        formatted_data = [
            {
                "file_name": row.file_name,
                "sheet": row.sheet,
                "start_date": row.start_date,
                "end_date": row.end_date
            }
            for row in info_record
        ]
        return {
            "success": True,
            "message": "get data successful",
            "data": formatted_data
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/show/{Version}")
def get_file_info_by_version(Version: int, db: Session = Depends(get_db)):
    """
    API Endpoint สำหรับแสดงข้อมูลไฟล์ตาม Version
    """
    try:
        # 1. เรียกใช้งานฟังก์ชันดึงข้อมูล
        info_record = (
            db.query(
                MFileMaster.id,
                MFileMaster.v_id,
                MFileMaster.file_name,
                MFileMaster.sheet,
                MFileMaster.r_row,
                MFileMaster.w_row,
                MFileMaster.status,
                MFileMaster.description,
                MFileMaster.date_create,
                MaUser.username,
                Minformationimport.description.label("Remark")
            )
            .join(Minformationimport, MFileMaster.v_id == Minformationimport.id)
            .join(MaUser, MFileMaster.user_create == MaUser.user_id)
            .filter(Minformationimport.v_id != Version if Version == 0 else Minformationimport.v_id == Version)
            .distinct() # ใช้ .is_(True) ตามมาตรฐาน
            .all()
        )
        
        # 2. ตรวจสอบผลลัพธ์
        if not info_record:
            return {
            "success": False,
            "message": "get data successful",
            "data":[]
        }
        
        # 3. จัดรูปแบบข้อมูลเตรียมส่งกลับ
        formatted_data = format_file_master_data(info_record)
        
        # 4. คืนค่าตามโครงสร้างเดิมที่คุณต้องการ
        return {
            "success": True,
            "message": "get data successful",
            "data":formatted_data
        }
        
    except HTTPException:
        raise HTTPException(status_code=404, detail="Record not found")
    except Exception as e:
        # ดักจับ Error อื่นๆ ที่ไม่คาดคิดและส่งกลับเป็น 400
        raise HTTPException(status_code=400, detail=str(e))
    



@router.post("/update-user-assign")
def update_user_assign(payload: AssignUpdate, db: Session = Depends(get_db)):
    if not payload:
        raise HTTPException(status_code=400, detail="No data provided")

    try:
        for item in payload.assignments:
            db.query(MPromotionHeader).filter(
                MPromotionHeader.file_id == item.sheet_id,
                MPromotionHeader.user_assign == None,
                MPromotionHeader.start_date == item.START_DATE
            ).update(
                {
                    "user_assign": item.ASSIGNED_TO, 
                    "date_assign": datetime.now()
                },
                synchronize_session=False # ปิด sync เพื่อเพิ่มความเร็วในการทำ Bulk Update
            )

        # เมื่อวนลูปอัปเดตครบทุกรายการแล้ว ค่อยสั่ง Commit ครั้งเดียว
        db.commit()

        return {
            "success": True,
            "message": "บันทึกการแจกจ่ายงานสำเร็จ",
            "updated_count": len(payload.assignments)
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database update failed: {str(e)}")
    
# ---------------------------------------------------------
# API 1: โหลดข้อมูลเริ่มต้น (หน้าจอ Step 1)
# ---------------------------------------------------------
@router.get("/Assign/fil-to-user/{version}")
def assign_file_initial(version: int,db: Session = Depends(get_db)):
    try:
        # ดึงข้อมูลล้วนๆ ยังไม่ต้องคำนวณ Assign
        formatted_data = get_workload_data(db,version)

        return {
            "success": True,
            "message": "no data file import",
            "data": formatted_data,
            "diff": 0,
            "summary": {}
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/update-assign")
def update_promotion_assign(items: List[UpdateAssignRequest], db: Session = Depends(get_db)):
    updated_count = 0
    
    try:
        for item in items:
            promotion = db.query(MPromotionHeader).filter(
                and_(
                    MPromotionHeader.file_id == item.file_id,
                    MPromotionHeader.start_date == item.date,
                    MPromotionHeader.user_assign == None
                )
            ).first()

            if promotion:
                # ทำการอัปเดตค่า
                promotion.user_assign = item.user_id
                promotion.date_assign = datetime.utcnow()
                updated_count += 1
        
        db.commit()
        return {
            "status": "success",
            "message": f"Updated {updated_count} records successfully",
            "details": f"Processed {len(items)} items"
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
# ---------------------------------------------------------

@router.post("/Assign/user")
def assign_users_calc(req: requserassign, db: Session = Depends(get_db)):
    try:
        # 1. ดึงข้อมูลดิบ
        formatted_data = get_workload_data(db)

        # 2. เอาข้อมูลดิบไปเข้า Class คำนวณ
        distributor = WorkloadDistributor(formatted_data)
        flat_list, diff, summary_dict = distributor.distribute_strict_balance(user_ids=req)

        return {
            "success": True,
            "message": "assign users successful",
            "data": flat_list,    # ส่ง List ของตาราง
            "diff": diff,         # ส่งความต่าง (ตัวเลข)
            "summary": summary_dict # ส่งสรุปผลรวม (Dict)
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))