from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime

class PromotionBase(BaseModel):
    pro_code: int
    pro_name: str
    pro_receipt_name: str
    pro_type: str
    pro_group: str
    pro_status: str
    pro_level: int
    start_date: date
    end_date: date
    reward_value: Optional[str] = None
    limit_tran: Optional[int] = None

# Schema สำหรับการอัปเดตสถานะ
class PromotionStatusUpdate(BaseModel):
    pro_status: str # เช่น 'ACTIVE', 'INACTIVE', 'SUSPENDED'
    state: Optional[int] = None 

# Schema สำหรับส่งข้อมูลกลับ (Response)
class PromotionResponse(PromotionBase):
    id: int
    file_id: int
    state: int
    date_update: datetime
    user_update: int

    class Config:
        from_attributes = True