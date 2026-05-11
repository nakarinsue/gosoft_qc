from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.api.schemas.user import UserCreate, UserUpdate, UserResponse
from app.api.crud import crud_user
from app.api.core.database import get_db

router = APIRouter(prefix="/users", tags=["Users"])

@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_new_user(user: UserCreate, db: Session = Depends(get_db)):
    # API: สร้าง User ใหม่
    # ตรวจสอบว่า Username ซ้ำหรือไม่
    db_user = crud_user.get_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username นี้มีอยู่ในระบบแล้ว")
    
    return crud_user.create_user(db=db, user=user)

@router.get("/", response_model=List[UserResponse])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    # API: ค้นหาและแสดงข้อมูล User ทั้งหมด
    users = crud_user.get_users(db, skip=skip, limit=limit)
    return users

@router.get("/{user_id}", response_model=UserResponse)
def read_user(user_id: int, db: Session = Depends(get_db)):
    # API: ค้นหาข้อมูล User รายบุคคล
    db_user = crud_user.get_user_by_id(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="ไม่พบข้อมูลผู้ใช้งาน")
    return db_user

@router.patch("/{user_id}", response_model=UserResponse)
def update_existing_user(user_id: int, user: UserUpdate, db: Session = Depends(get_db)):
    # API: อัปเดตข้อมูล User
    updated_user = crud_user.update_user(db, user_id=user_id, user_update=user)
    if updated_user is None:
        raise HTTPException(status_code=404, detail="ไม่พบข้อมูลผู้ใช้งานที่จะแก้ไข")
    return updated_user