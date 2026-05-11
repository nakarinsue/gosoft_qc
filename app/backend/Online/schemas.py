from pydantic import BaseModel, ConfigDict, Field
from typing import List, Optional,Literal




class CountergetResponse(BaseModel):
    table: str
    where_vendor_id: Optional[str] = None
    where_vendor_code: Optional[str] = None
    where_service_id:  Optional[str] = None
    select_column: Optional[str] = None
    remark: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)


# --- Schemas สำหรับตารางลูก (CounterColumn) ---
class CounterColumnBase(BaseModel):
    column_name: str

class CounterColumnCreate(CounterColumnBase):
    pass

class TransactionPayload(BaseModel):
    """
    Data model สำหรับจัดเตรียม Payload ในการทำ Transaction
    """
    
    # 1. General Information
    STORE_ID: Optional[str] = Field(default="09884", description="รหัสสาขา")
    VENDOR_ID: Optional[str] = Field(default="0993000134168", description="รหัสผู้ให้บริการ")
    SERVICE_ID: Optional[str] = Field(default="02", description="รหัสบริการ")
    ITEM_NAME: Optional[str] = Field(default="รับบริจาคเงิน", description="ชื่อรายการ")
    ZONE: Optional[str] = Field(default="1", description="โซนพื้นที่")
    EMPLOYEE_ID: Optional[str] = Field(default="0555505", description="รหัสพนักงาน")
    POS_TAX_ID: Optional[str] = Field(default="1537264827382", description="หมายเลขเครื่อง POS / Tax ID")
    PAYMENT_CHANNEL: Optional[str] = Field(default="C05", description="ช่องทางการชำระเงิน")
    REPT_TYPE: Optional[str] = Field(default="H", description="ประเภทรายงาน")

    # 2. Reference Data
    DATA_1: Optional[str] = Field(default="", description="ข้อมูลอ้างอิง 1")
    DATA_2: Optional[str] = Field(default="", description="ข้อมูลอ้างอิง 2")
    DATA_3: Optional[str] = Field(default="", description="ข้อมูลอ้างอิง 3")
    DATA_4: Optional[str] = Field(default="", description="ข้อมูลอ้างอิง 4")
    DATA_5: Optional[str] = Field(default="", description="ข้อมูลอ้างอิง 5")
    DATA_6: Optional[str] = Field(default="", description="ข้อมูลอ้างอิง 6")
    DATA_7: Optional[str] = Field(default="", description="ข้อมูลอ้างอิง 7")
    DATA_9: Optional[str] = Field(default="", description="ข้อมูลอ้างอิง 9")

    # 3. Amount & Calculation
    BILL_AMT: Optional[str] = Field(default="100", description="ยอดเงินรวม")
    VAT_AMT: Optional[str] = Field(default="0", description="ยอดภาษีมูลค่าเพิ่ม")

    # 4. Customer Information
    CUST_NAME: Optional[str] = Field(default="", description="ชื่อลูกค้า")
    CUST_ADDR_1: Optional[str] = Field(default="", description="ที่อยู่ลูกค้า 1")
    CUST_ADDR_2: Optional[str] = Field(default="", description="ที่อยู่ลูกค้า 2")
    CUST_ADDR_3: Optional[str] = Field(default="", description="ที่อยู่ลูกค้า 3")
    CUST_PHONE_NO: Optional[str] = Field(default="", description="เบอร์โทรศัพท์ลูกค้า")
    
action = Literal["DataExchange","Cancel","DataExchangeConfirm","OR","ORCancel","ORConfirm","Reprint"]
class ActionRequest(BaseModel):
    action_name: action = Field(..., example="DataExchange") # type: ignore

class CounterColumnResponse(CounterColumnBase):
    id: int
    table_id: int
    
    model_config = ConfigDict(from_attributes=True)

# --- Schemas สำหรับตารางหลัก (Counter) ---
# class CounterBase(BaseModel):
#     schema: str
#     table: str
#     where_vendor_id: Optional[str] = None
#     where_vendor_code: str
#     where_service_id: str
#     select_column: str
#     remark: str

class CounterUpdate(CountergetResponse):
    # รับค่าคอลัมน์ใหม่มาเป็น List เพื่ออัปเดต
    valuecounter: List[CounterColumnCreate] = []

class CounterResponse(CountergetResponse):
    id: int
    # ส่งข้อมูลตารางลูกกลับไปพร้อมตารางหลัก
    valuecounter: List[CounterColumnResponse] = []
    
    model_config = ConfigDict(from_attributes=True)


class CounterCreate(CountergetResponse):
    # รับรายการของคอลัมน์ที่ต้องการสร้างมาพร้อมกัน
    valuecounter: List[CounterColumnCreate] = []