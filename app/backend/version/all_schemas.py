from pydantic import BaseModel,Field,EmailStr,field_validator
from typing import Set,Optional, List, Dict, Any,Union,Literal
from datetime import datetime, date as date_type
# --- Auth ---
class Token(BaseModel):
    access_token: str
    token_type: str
    role:str
# Schema สำหรับการ Create (บังคับใส่ข้อมูลที่จำเป็น)
class DefectCreateRequest(BaseModel):
    pro_id: int
    types: List[int]
    title: str
    status: int
    file_id:Optional[int] = None
    mk_user :Optional[str] = None
    description: Optional[str] = None
    remark: Optional[str] = None

class DefectCreateRequests(BaseModel):
    promotion_id: int
    description: Optional[str] = None
    remark: Optional[str] = None
    product_code : List[int]
    types: List[int]
    
class DefectCreateRespone(BaseModel):
    defect_id: int
    description: Optional[str] = None

# Schema สำหรับการ Update (บังคับใส่ id ส่วนฟิลด์อื่นเป็น Optional เพื่ออัปเดตเฉพาะบางค่าได้)
class DefectUpdateRequest(BaseModel):
    id: int
    types: Optional[List[int]] = None
    title: Optional[str] = None
    status: Optional[int] = None
    description: Optional[str] = None
    remark: Optional[str] = None
        
class fiter_export(BaseModel):
    version_id: set[int] = set({0})
    file_id: set[int] = set({0})
class LoginRequest(BaseModel):
    username: str
    password: str
class UIValueBase(BaseModel):
    key: str
    value: Optional[str] = None
    remark: Optional[str] = None
    status: Optional[str] = "active"
    default_value: Optional[str] = None
    type: str = Field(..., description="ประเภทของ input เช่น text, number, boolean, dropdown")
    ui_class: Optional[str] = None
    group_name: Optional[str] = None
    order_index: Optional[int] = 0
    options: Optional[List[Dict[str, Any]]] = None

class UIValueCreate(UIValueBase):
    pass

class UIValueUpdate(BaseModel):
    value: Optional[str] = None
    remark: Optional[str] = None
    status: Optional[str] = None
    ui_class: Optional[str] = None
    order_index: Optional[int] = None
    options: Optional[List[Dict[str, Any]]] = None

class UIValueResponse(UIValueBase):
    id: int
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

   
    class Config:
        from_attributes = True

# --- Version Control ---
class VersionBase(BaseModel):
    title: str
    sub_title: Optional[str] = None
    detail: Optional[str] = None
    sr_link_url: Optional[str] = None
    lp_no: Optional[str] = "00000"

class VersionCreate(VersionBase):
    sr_no: str


class VersionUpdate(BaseModel):
    title: Optional[str] = None
    status: Optional[int] = None
    detail: Optional[str] = None

class VersionResponse(VersionBase):
    id: int
    sr_no: str
    description:Optional[str] = None
    status: int
    date_create: datetime
    user_create: int
    date_update: datetime
    user_update: int

    class Config:
        from_attributes = True

# --- Promotion / Entity ---
class EntityStatusUpdate(BaseModel):
    status: int
    description: Optional[str] = None

class AssignUserRequest(BaseModel):
    pro_id: int
    user_id: int

# --- Transaction / Defect ---
class MachineInputRequest(BaseModel):
    pro_id: int
    store_code: str
    pos_no: int
    receipt_no: int
    input_value: str # ค่าที่รับจากเครื่อง

class DefectCreate(BaseModel):
    pro_id: int
    store_code: str
    receipt_no: int
    title: str
    description: Optional[str] = None

class RemarkUpdate(BaseModel):
    remark: str
class entity_id(BaseModel):
    storeId:str
    product:set[str] 
class Product_code(BaseModel):
    Product_code:str
    Barcode:str
    Name:str
    price:str
    pma:str
    cat_pma:str
    sub_cat_pma:str
    qty:str
    update_date:datetime

# --- Summary ---
class DashboardSummary(BaseModel):
    total_versions: int
    active_promotions: int
    total_transactions: int
    recent_defects: int

class ImportInformation(BaseModel):
    """
    Model สำหรับรับข้อมูลการ Import ไฟล์
    ใช้ส่งเข้าฟังก์ชัน PromotionImportService.process_import
    """
    version: str = Field(..., description="เลขที่ Version (sr_no) เช่น 2024/00001")
    system: str = Field(..., description="ชื่อระบบต้นทาง (System Title) เช่น POS, DELIVERY")
    user_name: int = Field(..., description="User ID ของผู้ทำรายการ (user_create/update)")
    
    # ข้อมูลไฟล์
    file_name: str = Field(..., description="ชื่อไฟล์ที่นำเข้า")
    path_file: str = Field(..., description="Path ของไฟล์ (กรณีอ่านจาก S3 หรือ Local Path)")
    sheet: Optional[str] = Field(None, description="ชื่อ Sheet ที่ต้องการ Import (ถ้าไม่ระบุจะทำทุก Sheet)")
    
    # ข้อมูลเสริม
    remark: Optional[str] = Field(None, description="หมายเหตุ หรือ Description ของการ Import")
    version_id: int = Field(0, description="ID ของ Version ใน Database (ถ้ามีอยู่แล้ว)")

    class Config:
        from_attributes = True

class ImportResponse(BaseModel):
    status: str
    message: str
    version_id: int
    processed_sheets: list[str] = []    
class getdataImport(BaseModel):
    version_id: int
    message: str
    version_id: int
    processed_sheets: list[str] = []    
class InfoImportCreate(BaseModel):
    version_id: int
    status: int = 0
    description: Optional[Literal['POS','DELIVERY']] = 'POS'

class StatusUpdate(BaseModel):
    id: int
    status: int
class requserassign(BaseModel):
    id: list[int]
class userassign(BaseModel):
    username: str
    user_id: int
    class Config:
        from_attributes = True

class UserCreate(BaseModel):
    username: str
    password: str
    name: str
    email: EmailStr
    role: Optional[str] = "USER"

class UserUpdate(BaseModel):
    name: Optional[str] = None
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None
    is_deleted: Optional[bool] = None

class UserResponse(BaseModel):
    user_id: int
    username: str
    name: str
    email: Optional[str]
    role: Optional[str]
    is_active: bool
    
    class Config:
        from_attributes = True

    
class AssignUpdateItem(BaseModel):
    WORKSHEET: str
    SHEET: str
    START_DATE: str
    VALUE: int
    ASSIGNED_TO: Optional[str|int] = None
    sheet_id :int
class AssignUpdate(BaseModel):
    version: int
    assignments: List[AssignUpdateItem]
class UpdateAssignRequest(BaseModel):
    file_id: int
    date: date_type
    user_id: int


class ItemQueryRequest(BaseModel):
    idcode: List[str]
    store_id: str

class ItemResponse(BaseModel):
    item_id: str
    item_name: Optional[str]
    barcode: Optional[str]

    class Config:
        from_attributes = True

class QueryRequest_to_list(BaseModel):
    item_codes: Set[str] = Field(..., description="Set of product codes to query", example={"5100320", "5100321"}) # type: ignore
    
    @field_validator('item_codes', mode='before')
    @classmethod
    def convert_to_dict(cls, value: Union[str, int, List, Set]) -> Dict[str, str]:
        """
        ฟังก์ชันนี้จะทำงานอัตโนมัติเมื่อมีการส่ง Request เข้ามา 
        เพื่อแปลงค่า input ทุกรูปแบบให้อยู่ในฟอร์แมต {key: value}
        """
        if isinstance(value, (list, set)):
            return {str(item): str(item) for item in value}
        
        elif isinstance(value, (str, int)):
            return {str(value): str(value)}
        
        elif isinstance(value, dict):
            return {str(k): str(v) for k, v in value.items()}
            
        return value
class QueryRequest(BaseModel):
    item_codes: Set[str] = Field(..., description="Set of product codes to query", example={"5100320", "5100321"}) # type: ignore
    store_code :str = '08602'
class APIResponse(BaseModel):
    returnCode: str
    returnMessage: str
    result: List[Dict[str, Any]]
class APIResponse_to_list(BaseModel):
    returnCode: str
    returnMessage: str
    result: List[str]



# Schema สำหรับ API 2
class ItemCheck(BaseModel):
    pro_id: int
    entity_code: str

class CheckBarcodeRequest(BaseModel):
    store_code: str
    items: List[ItemCheck]

# Schema สำหรับ API 3
class UpdateBarcodeRequest(BaseModel):
    entity_code: str
    barcode: str
    pro_ids: List[int]

class DefectItem(BaseModel):
    pro_id: int
    entity_code: str

class CreateDefectRequest(BaseModel):
    pro_id: int
    is_all_items: bool  # True = สินค้าทุกชนิด, False = สินค้าบางชนิด
    items: List[DefectItem]
    user_id: int