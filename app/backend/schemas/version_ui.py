from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime

# --- UI Configuration ---
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
    model_config = ConfigDict(from_attributes=True)
    id: int
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

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
    model_config = ConfigDict(from_attributes=True)
    id: int
    sr_no: str
    status: int
    date_create: datetime