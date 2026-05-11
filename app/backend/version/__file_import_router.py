from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from sqlalchemy import select
from datetime import datetime
from ..promotion.full_import_service import FullImportService

from ..database.common.connet_database_postgres import get_db
from ..auth.security   import get_current_user
from ..database.models.postgres_models import  MInfoImportFile
from .all_schemas  import InfoImportCreate,ImportInformation,ImportResponse
from ..common.minio_service import MinioService
from ..promotion.promotion_import_service import PromotionImportService

router = APIRouter(prefix="/fileinput", tags=["import file Control"])
minio_service = MinioService()

@router.post("/insert")
async def insert_info_import(data: InfoImportCreate, db: Session = Depends(get_db)):
    try:
        new_info = MInfoImportFile(
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

@router.post("/upload_data", response_model=ImportResponse)
def execute_import(info: ImportInformation, db: Session = Depends(get_db)):
    """
    API สำหรับเริ่มกระบวนการ Import โดยรับข้อมูลเป็น JSON Object (ImportInformation)
    """
    try:
        service = PromotionImportService(db)
        service.process_import(info) # type: ignore
        
        return {
            "status": "Success", 
            "message": "Import completed successfully",
            "version_id": info.version_id,
            "processed_sheets": info.sheet
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
   

@router.post("/upload_file")
async def upload_and_import(
    version_id: int = Form(..., description="เลข Version id "),
    # system: Literal['POS','DELIVERY'] = Form(..., description="ระบบต้นทาง เช่น POS"),
    user_id: int = Form(..., description="User ID ผู้ทำรายการ"),
    file: UploadFile = File(...),
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
            version=version_id,
            user_id=user_id        )
        
        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")
    

@router.get("/view-image")
def view_image(path: str):
    minio = MinioService()
    url = minio.get_presigned_url(path)
    return {"image_url": url} # นำ url ไปใส่ใน src ของรูปภาพฝั่ง React

                         
@router.get("/exportfileexcel")
def export_file(path: str):
    minio = MinioService()
    # ส่ง Stream Response กลับไป Browser จะเด้งหน้าต่างดาวน์โหลดไฟล์ทันที
    return minio.download_file_stream(path, force_download=True)

