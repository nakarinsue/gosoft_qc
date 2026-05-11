from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from typing import List

from ..database.common.connet_database_postgres import get_db
from ..auth.schemas import Token, UserResponse, UserCreate, UserUpdate
from ..auth.service import UserService
from ..auth.security import create_access_token,get_current_user



router = APIRouter(prefix="/auth", tags=["Authentication"])



@router.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = UserService.authenticate_user(db, form_data.username, form_data.password)
    
    access_token = create_access_token(
        data={"sub": str(user.user_id), 'user_name': str(user.username), "role": user.role}
    )
    return {"access_token": access_token, "config":{'ip':user.ip_address,'allmember':user.allmember} , "role": user.role}



@router.get("/users", response_model=List[UserResponse])
async def get_current_user_all(
    skip: int = 0, 
    limit: int = 100,
    _: dict = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    """API สำหรับดึงข้อมูล User โดยตรวจสอบ Token ของผู้ที่ดึงข้อมูลด้วย"""
    return UserService.get_users(db,skip=skip,limit=limit)


@router.post("/users", response_model=UserResponse)
async def create_user(
    payload: UserCreate, 
    current_user = Depends(get_current_user), # ตรวจสอบสิทธิ์ว่าใครสร้าง
    db: Session = Depends(get_db)
):
    return UserService.create_user(db, payload)



@router.patch("/users/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int, 
    payload: UserUpdate, 
    _: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return UserService.update_user(db, user_id, payload)



@router.delete("/users/{user_id}")
async def delete_user(
    user_id: int, 
    _: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return UserService.delete_user(db, user_id)