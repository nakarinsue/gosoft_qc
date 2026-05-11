from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str

class LoginRequest(BaseModel):
    username: str
    password: str

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
    model_config = ConfigDict(from_attributes=True)
    
    user_id: int
    username: str
    name: str
    email: Optional[str]
    role: Optional[str]
    is_active: bool

class userassign(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    username: str
    user_id: int