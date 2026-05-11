from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.api.schemas.version import VersionCreate, VersionResponse
from app.api.crud import crud_version
from app.api.core.database import get_db

router = APIRouter(prefix="/versions", tags=["Version Control"])

@router.post("/", response_model=VersionResponse)
def create_new_version(version: VersionCreate, db: Session = Depends(get_db)):
    # 3. API: สร้าง Version (สมมติ user_id = 1 ที่ได้จาก Token)
    current_user_id = 1 
    return crud_version.create_version(db=db, version=version, current_user_id=current_user_id)

@router.get("/", response_model=List[VersionResponse])
def read_versions(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    # 4. API: ดึง Version ทั้งหมดแบบมี Pagination
    versions = crud_version.get_versions(db, skip=skip, limit=limit)
    return versions

@router.get("/{v_id}", response_model=VersionResponse)
def read_version(v_id: int, db: Session = Depends(get_db)):
    # 5. API: ดึงรายละเอียด Version ตาม ID
    version = crud_version.get_version_by_id(db, v_id=v_id)
    if version is None:
        raise HTTPException(status_code=404, detail="ไม่พบข้อมูล Version นี้")
    return version