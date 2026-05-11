from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import Optional

from ..database.common.connet_database_postgres import get_db
from ..database.models.views import vwsummaryfileimport
from ..version.all_schemas  import BaseModel


router = APIRouter(prefix="/option", tags=["option other Control"])

class SummaryFileImportResponse(BaseModel):
    version_id: int
    title: Optional[str] = None
    description: Optional[str] = None
    file_name: int
    sheet: int
    sheet_count_4: int
    r_row: int
    ww_row: int
    read_row: int
    pro_code: int
    entity_include: int
    entity_exclude: int
    promotion_test: int
    promotion_test1: int

    class Config:
        from_attributes = True
@router.post("/notprocess")
async def update_not_test():
    ...

@router.post("/deshbord", response_model=dict)
def get_summary_file_imports(skip: int = 0, 
                            limit: int = 100,
                            db: Session = Depends(get_db)):
    """
    เรียกดูข้อมูลสรุปรายละเอียดการ Import ไฟล์ และสถานะโปรโมชั่นราย Version
    """
    try:
        # เรียกข้อมูลโดยตรงจาก View ที่เราสร้างไว้ใน Database
        stmt = select(vwsummaryfileimport).order_by(vwsummaryfileimport.version_id.desc()).offset(skip).limit(limit)

        raw_data = db.scalars(stmt).all()  

        # แปลงข้อมูลเป็น List ของ Dictionary เพื่อให้ Pydantic จัดการต่อ
        
        
        return {'version_summary' :raw_data,
                'transation':'',
                'report':''}
    except Exception as e:
        # จัดการ Error ระดับองค์กร พร้อม Log รายละเอียด
        raise HTTPException(
            status_code=500, 
            detail=f"Internal Server Error: เกิดข้อผิดพลาดในการดึงข้อมูลรายงาน ({str(e)})"
        )

