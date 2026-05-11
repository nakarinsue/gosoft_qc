from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.api.models import MaUser
from app.api.schemas.auth import UserLogin, Token, UserResponse
# สมมติว่ามีฟังก์ชัน get_db สำหรับเชื่อม database และ create_access_token สำหรับทำ JWT
from app.api.core.database import get_db 
from app.api.core.security import create_access_token, verify_password

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=Token)
def login(user_credentials: UserLogin, db: Session = Depends(get_db)):
    # 1. API: Login 
    stmt = select(MaUser).where(MaUser.username == user_credentials.username)
    user = db.scalars(stmt).first()

    if not user or not verify_password(user_credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Username หรือ Password ไม่ถูกต้อง"
        )

    # สร้าง JWT Token
    access_token = create_access_token(data={"sub": user.username, "user_id": user.user_id})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(db: Session = Depends(get_db)):
    # 2. API: ดึงข้อมูล Profile (ต้องรับ Token มาถอดรหัส ในที่นี้ทำโครงสร้างไว้ก่อน)
    pass