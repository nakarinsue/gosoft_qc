from pydantic import BaseModel,EmailStr
from typing import Optional, List
from datetime import  date as date_type
# --- Auth ---
class value(BaseModel):
    ip:str
    allmember:str
class Token(BaseModel):
    access_token: str
    role:str
    config:Optional[value]
class LoginRequest(BaseModel):
    username: str
    password: str

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
    ip_address: Optional[str] = None
    allmember: Optional[str] = None

class UserResponse(BaseModel):
    user_id: int
    username: str
    name: str
    email: Optional[str]
    role: Optional[str]
    is_active: bool
    is_deleted: bool
    ip_address: str
    allmember: str
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
