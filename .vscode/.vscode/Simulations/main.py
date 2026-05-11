from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional, Dict, Any
import os
import json
import pandas as pd
from icecream  import ic
# นำเข้าคลาสต่างๆ ที่เราสร้างไว้จากไฟล์หลัก (สมมติว่าชื่อ core_logic.py)
from app.Simulations.TransactionContext import TransactionContext
from app.Simulations.SoapPayloadBuilder import SoapPayloadBuilder
from app.Simulations.SoapApiClient import SoapApiClient
from app.Simulations.ResponseParser import ResponseParser
from app.Simulations.OracleManager import OracleManager
from fastapi.middleware.cors import CORSMiddleware

# สมมติว่าดึงมาจากไฟล์ core_logic.py ของเรา
# from core_logic import TransactionContext, SoapPayloadBuilder, SoapApiClient, ResponseParser, OracleManager

app = FastAPI(title="Enterprise POS Integration API", version="1.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # ในระดับ Production ควรเปลี่ยนเป็น ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# สร้าง Instance การเชื่อมต่อ Database
db_manager = OracleManager(ip='10.182.236.52', service_name='ONLPRD')

# ==========================================
# 1. Pydantic Models (รองรับพารามิเตอร์ครบทุกตัว)
# ==========================================

class ActionRequest(BaseModel):
    """JSON สำหรับยิง Action API รับพารามิเตอร์ครบถ้วน"""
    url: str = "http://testcspos.counterservice.co.th:8001/DCWSCDSONLINE/WSCDSService"
    vendor_id: str = "82204"
    service_id: str = "00"
    store_id: str = "09892"
    item_name: str = "พิมพ์ใบอนุญาตกรมเจ้าท่า"
    
    # กลุ่ม DATA_1 ถึง DATA_9 (ถ้าส่งมาเป็น null จะทำการ Gen เอง)
    data_1: Optional[Any] = None
    data_2: Optional[Any] = None
    data_3: Optional[Any] = None
    data_4: Optional[Any] = None
    data_5: Optional[Any] = None
    data_6: Optional[Any] = None
    data_7: Optional[Any] = None
    data_9: Optional[Any] = None
    
    # กลุ่มเรื่องบิลและจำนวนเงิน
    amt_min: str = "1"
    amt_max: str = "90000"
    bill_amt: str = "50"
    
    # กลุ่มข้อมูลลูกค้า
    cust_name: str = ""
    cust_addr_1: str = ""
    cust_addr_2: str = ""
    cust_addr_3: str = ""
    cust_phone_no: str = ""
    
    # ข้อมูลอ้างอิงสำหรับทำรายการต่อเนื่อง
    ref_data: Optional[Dict[str, Any]] = {} 

class ConfigRequest(BaseModel):
    vendor_id: str
    service_id: str

class TxIdRequest(BaseModel):
    tx_id: str

# ==========================================
# 2. Core Logic & Helper Functions
# ==========================================

def prepare_tx_from_request(req: ActionRequest) -> TransactionContext:
    """แปลง JSON Request เป็น TransactionContext และจัดการเรื่อง Gen Data อัตโนมัติ"""
    tx = TransactionContext()
    
    # Mapping ข้อมูลร้านค้าและบริการ
    tx.store.vendor_id = req.vendor_id
    tx.store.service_id = req.service_id
    tx.store.store_id = req.store_id
    tx.store.item_name = req.item_name
    
    # Mapping ข้อมูลบิล
    tx.bill.amt_min = req.amt_min
    tx.bill.amt_max = req.amt_max
    tx.bill.bill_amt = req.bill_amt
    
    # Mapping ข้อมูลลูกค้า
    tx.customer.name = req.cust_name
    tx.customer.addr_1 = req.cust_addr_1
    tx.customer.addr_2 = req.cust_addr_2
    tx.customer.addr_3 = req.cust_addr_3
    tx.customer.phone_no = req.cust_phone_no

    # เงื่อนไข Gen ค่า: ถ้า User ส่งมาให้ใช้ค่านั้น ถ้าไม่ส่ง (None) ให้ระบบกำหนดค่าตั้งต้นเพื่อ Gen
    tx.data_1 = req.data_1 if req.data_1 is not None else "10180003788"
    tx.data_2 = req.data_2 
    tx.data_3 = req.data_3 if req.data_3 is not None else 10 # เลข 10 หมายถึงสั่งให้ Gen สุ่ม 10 หลัก
    tx.data_4 = req.data_4
    tx.data_5 = req.data_5
    tx.data_6 = req.data_6
    tx.data_7 = req.data_7
    tx.data_9 = req.data_9

    # หากมี ref_data ส่งมาด้วย ให้นำไปโหลดใส่เพื่อเตรียมทำรายการต่อเนื่อง
    if req.ref_data:
        tx.load_reference_from_response(req.ref_data)
        
    tx.prepare_data() # ทำการคำนวณและเตรียม String ให้พร้อมสร้าง XML
    return tx

def process_soap_action(action_type: str, req: ActionRequest) -> Dict[str, Any]:
    tx = prepare_tx_from_request(req)
    api_client = SoapApiClient(endpoint_url=req.url)
    
    builders = {
        "data_exchange": SoapPayloadBuilder.build_data_exchange,
        "cancel": SoapPayloadBuilder.build_cancel,
        "exchange_confirm": SoapPayloadBuilder.build_data_exchange_confirm,
        "print": SoapPayloadBuilder.build_print,
        "or": SoapPayloadBuilder.build_or,
        "or_cancel": SoapPayloadBuilder.build_or_cancel,
        "or_confirm": SoapPayloadBuilder.build_or_confirm,
        "amt_confirm": SoapPayloadBuilder.build_amt_confirm,
        "std_tk_inquiry": SoapPayloadBuilder.build_std_tk_inquiry,
        "inquiry": SoapPayloadBuilder.build_inquiry,
    }
    
    if action_type not in builders:
        raise HTTPException(status_code=400, detail="Action ไม่ถูกต้อง")
        
    xml_payload = builders[action_type](tx)
    ic(xml_payload)
    response_xml = api_client.send_request(xml_payload)
    ic(response_xml)

    if not response_xml:
        raise HTTPException(status_code=500, detail="การเชื่อมต่อ API ปลายทางล้มเหลว")
        
    return ResponseParser.parse_to_dict(response_xml)


# ==========================================
# 3. Standard Action Endpoints (เส้นเดี่ยว)
# ==========================================
@app.post("/api/action/data_exchange", summary="ยิง Action: DataExchange")
def action_data_exchange(req: ActionRequest): return process_soap_action("data_exchange", req)

@app.post("/api/action/cancel", summary="ยิง Action: Cancel")
def action_cancel(req: ActionRequest): return process_soap_action("cancel", req)

@app.post("/api/action/exchange_confirm", summary="ยิง Action: DataExchangeConfirm")
def action_exchange_confirm(req: ActionRequest): return process_soap_action("exchange_confirm", req)

# ==========================================
# 4. WORKFLOW Endpoints (ทำรายการต่อเนื่อง 2 Step อัตโนมัติ)
# ==========================================

@app.post("/api/workflow/exchange_to_cancel", summary="ต่อเนื่องอัตโนมัติ: DataExchange ➡️ Cancel")
def workflow_exchange_to_cancel(req: ActionRequest):
    """ยิง DataExchange หากสำเร็จจะนำ TX_ID ที่ได้ไปยิง Cancel ต่อทันที"""
    # Step 1: ยิง DataExchange
    step1_response = process_soap_action("data_exchange", req)
    
    if step1_response.get("SUCCESS") != "100":
        return {
            "status": "failed_at_exchange", 
            "message": "ไม่สามารถทำรายการ Cancel ต่อได้เนื่องจาก DataExchange ไม่สำเร็จ",
            "step_1_response": step1_response
        }
        
    # Step 2: นำผลลัพธ์ยัดใส่ ref_data แล้วยิง Cancel ต่อ
    req.ref_data = step1_response
    step2_response = process_soap_action("cancel", req)
    
    return {
        "status": "success",
        "step_1_exchange": step1_response,
        "step_2_cancel": step2_response
    }

@app.post("/api/workflow/exchange_to_confirm", summary="ต่อเนื่องอัตโนมัติ: DataExchange ➡️ Confirm")
def workflow_exchange_to_confirm(req: ActionRequest):
    """ยิง DataExchange หากสำเร็จจะนำ TX_ID และยอดเงิน ไปยิง Confirm ต่อทันที"""
    # Step 1: ยิง DataExchange
    step1_response = process_soap_action("data_exchange", req)
    
    if step1_response.get("SUCCESS") != "100":
        return {
            "status": "failed_at_exchange", 
            "step_1_response": step1_response
        }
        
    # Step 2: นำผลลัพธ์ยัดใส่ ref_data แล้วยิง Confirm ต่อ
    req.ref_data = step1_response
    step2_response = process_soap_action("exchange_confirm", req)
    
    return {
        "status": "success",
        "step_1_exchange": step1_response,
        "step_2_confirm": step2_response
    }

# ==========================================
# 5. Database Endpoints
# ==========================================
@app.post("/api/db/export", summary="ตรวจสอบ Config และ Export เป็น Excel")
def export_config(req: ConfigRequest):
    file_path = db_manager.check_vendor_config(vendor_id=req.vendor_id, service_id=req.service_id, action='export')
    if not file_path or not os.path.exists(file_path):
        raise HTTPException(status_code=500, detail="ไม่สามารถสร้างไฟล์ Excel ได้")
    return FileResponse(path=file_path, filename=file_path, media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')

@app.post("/api/db/show", summary="ตรวจสอบ Config และแสดงผลเป็น JSON")
def show_config(req: ConfigRequest):
    data = db_manager.check_vendor_config(vendor_id=req.vendor_id, service_id=req.service_id, action='show')
    if not data: raise HTTPException(status_code=404, detail="ไม่พบข้อมูล Config")
    return {"status": "success", "data": data}

@app.post("/api/db/transaction", summary="ค้นหา Transaction จาก Database ด้วย TX_ID")
def get_transaction(req: TxIdRequest):
    df = db_manager.get_transaction_by_tx_id(tx_id=req.tx_id)
    if df.empty: raise HTTPException(status_code=404, detail=f"ไม่พบข้อมูล TX_ID: {req.tx_id} ในระบบ")
    result_json = df.where(pd.notnull(df)).to_dict(orient='records')
    return {"status": "success", "tx_id": req.tx_id, "data": result_json}


