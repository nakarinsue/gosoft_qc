from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime

class UIValueBase(BaseModel):
    key: str
    value: Optional[str] = None
    type: str = Field(..., description="text, number, boolean, dropdown")
    ui_class: Optional[str] = "default-theme" # รองรับการเปลี่ยน Theme
    order_index: int = 0
    options: Optional[List[Dict[str, Any]]] = None

class VersionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    sr_no: str
    title: str
    status: int
    date_create: datetime