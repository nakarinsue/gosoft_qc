from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class VersionBase(BaseModel):
    title: str
    sub_title: Optional[str] = None
    detail: Optional[str] = None
    description: Optional[str] = None
    sr_link_url: Optional[str] = None
    lp_no: Optional[str] = None
    status: int

class VersionCreate(VersionBase):
    sr_no: Optional[str] = None

class VersionResponse(VersionBase):
    id: int
    sr_no: Optional[str]
    date_create: datetime
    user_create: int
    date_update: datetime
    user_update: int

    class Config:
        from_attributes = True