from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from sqlalchemy import select, update
from typing import List

from app.backend.database import get_db
from app.backend.auth import get_current_user
from app.backend.models.postgres._base_on import MaUser, MVersionControl, MFileMaster
from app.backend.schemas.all_schemas import VersionCreate, VersionUpdate, VersionResponse,ImportInformation,ImportResponse
from app.backend.services.minio_service import MinioService
from app.backend.services.promotion_import_service import PromotionImportService

router = APIRouter(prefix="/versions", tags=["Version Control"])
minio_service = MinioService()

@router.get("/", response_model=List[VersionResponse])
def get_all_versions(db: Session = Depends(get_db)):
    return db.scalars(select(MVersionControl).order_by(MVersionControl.id.desc())).all()

@router.post("/", response_model=VersionResponse)
def create_version(data: VersionCreate, current_user: MaUser = Depends(get_current_user), db: Session = Depends(get_db)):
    new_version = MVersionControl(
        **data.dict(),
        status=1,
        user_create=current_user.user_id,
        user_update=current_user.user_id
    )
    db.add(new_version)
    db.commit()
    db.refresh(new_version)
    return new_version

@router.put("/{version_id}")
def update_version(version_id: int, data: VersionUpdate, db: Session = Depends(get_db)):
    ver = db.get(MVersionControl, version_id)
    if not ver: raise HTTPException(404, "Version not found")
    
    if data.title: ver.title = data.title
    if data.status: ver.status = data.status
    if data.detail: ver.detail = data.detail
    
    db.commit()
    return {"message": "Updated successfully"}

@router.post("/files/import")
async def import_file_to_version(
    version_id: str = Form(...),
    file: UploadFile = File(...),
    file_type: str= Form(...),
    current_user: MaUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # 1. Upload to MinIO
    file_path = await minio_service.upload_file(file,version_id,file_type)
    
    # 2. Insert into m_file_master
    new_file = MFileMaster(
        v_id=version_id,
        file_name=file.filename,
        sheet="Main",
        status=1,
        user_mk=file_path,
        user_create=current_user.user_id,
        user_update=current_user.user_id
    )
    db.add(new_file)
    db.commit()
    return {"message": "File imported", "path": file_path, "file_id": new_file.id}



@router.post("/upload")
async def upload_document(file: UploadFile, version_id: str, file_type: str):
    minio = MinioService()
    # file_type สามารถระบุเป็น "excel", "image", "zip", "yaml" ได้เลย
    saved_path = await minio.upload_file(file, version_id, file_type)
    return {"status": "success", "path": saved_path}

@router.get("/view-image")
def view_image(path: str):
    minio = MinioService()
    url = minio.get_presigned_url(path)
    return {"image_url": url} # นำ url ไปใส่ใน src ของรูปภาพฝั่ง React

@router.post("/import/execute", response_model=ImportResponse)
def execute_import(info: ImportInformation, db: Session = Depends(get_db)):
    """
    API สำหรับเริ่มกระบวนการ Import โดยรับข้อมูลเป็น JSON Object (ImportInformation)
    """
    try:
        service = PromotionImportService(db)
        service.process_import(info)
        
        return {
            "status": "Success", 
            "message": "Import completed successfully",
            "version_id": info.version_id,
            "processed_sheets": info.sheet
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
                            
@router.get("/export")
def export_file(path: str):
    minio = MinioService()
    # ส่ง Stream Response กลับไป Browser จะเด้งหน้าต่างดาวน์โหลดไฟล์ทันที
    return minio.download_file_stream(path, force_download=True)

