from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    username: str
    name: str
    email: EmailStr # ตรวจสอบรูปแบบ Email
    role: Optional[str] = "USER"
    is_active: Optional[bool] = True
    allmember: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None
    password: Optional[str] = None # หากส่งมาจะทำการ Hash ใหม่

class UserResponse(UserBase):
    user_id: int
    is_deleted: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True