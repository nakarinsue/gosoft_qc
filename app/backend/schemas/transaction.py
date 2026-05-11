from pydantic import BaseModel
from typing import Optional, List

class DashboardSummary(BaseModel):
    total_versions: int
    active_promotions: int
    total_transactions: int
    recent_defects: int

class MachineInputRequest(BaseModel):
    pro_id: int
    store_code: str
    pos_no: int
    receipt_no: int
    input_value: str

class DefectItem(BaseModel):
    pro_id: int
    entity_code: str

class DefectCreate(BaseModel):
    pro_id: int
    store_code: str
    receipt_no: int
    title: str
    description: Optional[str] = None

class CreateDefectRequest(BaseModel):
    pro_id: int
    is_all_items: bool  # True = สินค้าทุกชนิด, False = สินค้าบางชนิด
    items: List[DefectItem]
    user_id: int

class RemarkUpdate(BaseModel):
    remark: str

class StatusUpdate(BaseModel):
    id: int
    status: int