from fastapi import APIRouter, Depends,HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any
from ..database.common.connet_database_postgres import get_db
from . import __service as report_service

router = APIRouter(prefix="/report", tags=["summary report dashboard"])

@router.get("/promotion", response_model=Dict[str, Any])
def promotion(db: Session = Depends(get_db)):
    """
    ข้อมูลสำหรับ กราฟวงกลม/กราฟแท่ง แสดงสัดส่วนโปรโมชั่นตามประเภทและสถานะ
    """
    return report_service.get_promotion_summary(db)

@router.get("/dashboard", response_model=Dict[str, Any])
def dashboard(db: Session = Depends(get_db)):
    """
    ภาพรวม (Overview) สำหรับหน้าหลัก Dashboard (ตัวเลขสรุป Card รวม)
    """
    return report_service.get_dashboard_summary(db)

@router.get("/defect", response_model=Dict[str, Any])
def defect(db: Session = Depends(get_db)):
    """
    ข้อมูลสรุป Defect/Error สำหรับตารางหรือกราฟ 
    """
    return report_service.get_defect_summary(db)

@router.get("/version", response_model=Dict[str, Any])
def version(db: Session = Depends(get_db)):
    """
    ข้อมูลประวัติเวอร์ชั่น สำหรับทำตารางรายการอัพเดท
    """
    return report_service.get_version_summary(db)


@router.get("/file-import/{version}")
def export_file_excel(version:int=0,db: Session = Depends(get_db)):
    try:
        return report_service.get_file_import_in_detail(db,version)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

