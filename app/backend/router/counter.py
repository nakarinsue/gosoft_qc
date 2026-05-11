from fastapi import APIRouter, HTTPException,Form
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import traceback
from typing import Optional, Dict, Any
from ..Online.services import DataFetchService
from ..Online.excel_exporter import ExcelExporter


router = APIRouter(prefix="/cou", tags=["Counter Service Enterprise API"])

class QueryRequest(BaseModel):
    cs_code: str
    service: str
class CompareQueryRequest(BaseModel):
    query: str
    params: Optional[Dict[str, Any]] = None

@router.post("/json")
def get_config_json(
    cs_code: str = Form(..., description="เลข cs_code Client_id "), 
    service: str = Form(default="00", description="เลข service_id "),
    transation:bool=Form(default=True, description="เลข TX_ID TX_LOG")):
    """ส่งคืนผลลัพธ์ในรูปแบบ JSON โครงสร้างใหม่"""
    try:
        fetched_data = DataFetchService.fetch_all_tables(cs_code, service)
        
        # กรณีไม่พบข้อมูล
        if not fetched_data.get("Infomation"):
            return {
                "status": "failed", 
                "message": "Data not found",
                "Infomation": {},
                "data": []
            }
            
        return {
            "status": "success",
            "Infomation": fetched_data["Infomation"],
            "data": fetched_data["data"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/excel")
def export_config_excel(    
    cs_code: str = Form(..., description="เลข cs_code Client_id "), 
    service: str = Form(default="00", description="เลข service_id "),
    transation:bool=Form(default=True, description="เลข TX_ID TX_LOG")):
    """สร้างและดาวน์โหลดไฟล์ Excel โดยรองรับ Data Structure แบบใหม่"""
    try:
        fetched_data = DataFetchService.fetch_all_tables(cs_code, service)
        
        # 1. ป้องกันกรณีฟังก์ชันดึงข้อมูลคืนค่ามาเป็น list โดยไม่ได้ตั้งใจ
        if isinstance(fetched_data, list):
            raise ValueError("DataFetchService คืนค่าเป็น 'list' แทนที่จะเป็น 'dict'")

        # 2. ป้องกัน Info เป็น None
        info = fetched_data.get("Infomation", {})
        if not info:
            raise HTTPException(status_code=408, detail="No data found to export")
            
        # 3. ใช้ .get() แทนการเข้าถึงด้วย ["..."] เพื่อป้องกัน KeyError หาก Database ส่งค่ามาไม่ครบ
        v_code = str(info.get("VENDOR_CODE",cs_code)).replace("'","")
        v_name = str(info.get("VENDOR_NAME", "NO"))
        srv_id = str(info.get("SERVICE_ID", service)).zfill(2)
        # QCM-COU-Test Case&Result_CS Online_554_SV01_KRU-R1
        filename = f"QCM-COU-Test Case&Result_CS Online_{v_code}_SV{srv_id}_{v_name}-R1.xlsx"
        
        # โยน fetched_data เข้าไปประมวลผลเป็น Excel
        excel_stream = ExcelExporter.generate_excel_bytes(fetched_data)
        
        headers = {'Content-Disposition': f'attachment; filename="{filename}"'}
        return StreamingResponse(
            excel_stream, 
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", 
            headers=headers
        )
        
    except Exception as e:
        # 💡 ตัวช่วยตรวจสอบ: พิมพ์ Error เต็มรูปแบบลง Console ของเซิร์ฟเวอร์เพื่อให้หาบรรทัดที่พังง่ายขึ้น
        print("\n--- 🚨 ERROR TRACEBACK ---")
        traceback.print_exc() 
        print("--------------------------\n")
        
        raise HTTPException(status_code=500, detail=str(e))
    



