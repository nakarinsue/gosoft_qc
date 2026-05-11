from pydantic import BaseModel, Field, field_validator, ConfigDict
from typing import Set, Optional, List, Dict, Any, Union
from datetime import datetime, date as date_type

class fiter_export(BaseModel):
    version_id: Set[int] = Field(default_factory=lambda: {0})
    file_id: Set[int] = Field(default_factory=lambda: {0})

class EntityStatusUpdate(BaseModel):
    id: int
    status: int
    description: Optional[str] = None

class AssignUserRequest(BaseModel):
    pro_id: int
    user_id: int

class entity_id(BaseModel):
    storeId: str
    product: Set[str]

class Product_code(BaseModel):
    Product_code: str
    Barcode: str
    Name: str
    price: str
    pma: str
    cat_pma: str
    sub_cat_pma: str
    qty: str
    update_date: datetime

class ImportInformation(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    version: str = Field(..., description="เลขที่ Version (sr_no)")
    system: str = Field(..., description="ชื่อระบบต้นทาง")
    user_name: int = Field(..., description="User ID ของผู้ทำรายการ")
    file_name: str = Field(..., description="ชื่อไฟล์ที่นำเข้า")
    path_file: str = Field(..., description="Path ของไฟล์")
    sheet: Optional[str] = Field(None, description="ชื่อ Sheet")
    remark: Optional[str] = Field(None, description="หมายเหตุ")
    version_id: int = Field(0)

class ImportResponse(BaseModel):
    status: str
    message: str
    version_id: int
    processed_sheets: List[str] = []

class InfoImportCreate(BaseModel):
    v_id: int
    status: int = 0
    description: Optional[str] = None
    user_create: int

class requserassign(BaseModel):
    id: List[int]

class AssignUpdateItem(BaseModel):
    WORKSHEET: str
    SHEET: str
    START_DATE: str
    VALUE: int
    ASSIGNED_TO: Optional[Union[str, int]] = None
    sheet_id: int

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
    model_config = ConfigDict(from_attributes=True)
    item_id: str
    item_name: Optional[str]
    barcode: Optional[str]

class QueryRequest_to_list(BaseModel):
    item_codes: Set[str] = Field(..., description="Set of product codes", example={"5100320", "5100321"}) # type: ignore
    
    @field_validator('item_codes', mode='before')
    @classmethod
    def convert_to_dict(cls, value: Union[str, int, List, Set]) -> Dict[str, str]:
        if isinstance(value, (list, set)):
            return {str(item): str(item) for item in value}
        elif isinstance(value, (str, int)):
            return {str(value): str(value)}
        elif isinstance(value, dict):
            return {str(k): str(v) for k, v in value.items()}
        return value

class QueryRequest(BaseModel):
    item_codes: Set[str] = Field(..., example={"5100320"}) # type: ignore
    store_code: str = '08602'

    @field_validator('item_codes', mode='before')
    @classmethod
    def unify_item_codes(cls, v):
        if isinstance(v, (list, set)):
            return {str(i) for i in v}
        if isinstance(v, (str, int)):
            return {str(v)}
        return v

class APIResponse(BaseModel):
    returnCode: str
    returnMessage: str
    result: List[Dict[str, Any]]

class APIResponse_to_list(BaseModel):
    returnCode: str
    returnMessage: str
    result: List[str]

class ItemCheck(BaseModel):
    pro_id: int
    entity_code: str

class CheckBarcodeRequest(BaseModel):
    store_code: str
    items: List[ItemCheck]

class UpdateBarcodeRequest(BaseModel):
    entity_code: str
    barcode: str
    pro_ids: List[int]