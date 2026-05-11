from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.backend.database.common.connet_database_postgres import get_db
from typing import List
from app.backend.database.models.postgres_models import MaUser
from app.backend.dummy.all_schemas import  Token, UserResponse, UserCreate, UserUpdate,userassign
from app.backend.auth.security import verify_password, create_access_token, get_current_user, get_password_hash
from datetime import datetime
from fastapi.security import OAuth2PasswordRequestForm
router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)):
    
    user = db.scalar(select(MaUser).where(MaUser.username == form_data.username))
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": str(user.user_id),'user_name':str(user.username), "role": user.role})
    return {"access_token": access_token, "token_type": "bearer","role":user.role}


@router.post("/users", response_model=UserResponse)
async def create_user(
    payload: UserCreate, 
    current_user: MaUser = Depends(get_current_user), 
    db: Session = Depends(get_db)):
    
    hashed_pwd = get_password_hash(payload.password)
    new_user = MaUser(
        username=payload.username,
        password_hash=hashed_pwd,
        name=payload.name,
        email=payload.email,
        role=payload.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@router.get("/users", response_model=List[userassign])
async def get_all_active_users(
    _: MaUser = Depends(get_current_user),
    db: Session = Depends(get_db)):
    """API สำหรับดึงข้อมูล User ทั้งหมดที่มีสถานะ Active และยังไม่ถูกลบ"""
    stmt = select(MaUser).where(
        MaUser.is_active == True, 
        MaUser.is_deleted == False
    )
    result = db.execute(stmt)
    return result.scalars().all()


@router.get("/users-all", response_model=List[UserResponse])
async def get_current_user_All(
    _: MaUser = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    """API สำหรับดึงข้อมูล User โดยตรวจสอบ Token ของผู้ที่ดึงข้อมูลด้วย"""
    stmt = select(MaUser)
    result = db.execute(stmt)
    return result.scalars().all()


@router.patch("/users/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int, 
    payload: UserUpdate, 
    _: MaUser = Depends(get_current_user),
    db: Session = Depends(get_db)):
    
    result = db.execute(select(MaUser).where(MaUser.user_id == user_id))
    user = result.scalars().first()
    
    if not user:
        raise HTTPException(status_code=404, detail="ไม่พบผู้ใช้งาน")

    update_data = payload.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(user, key, value)
    
    user.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(user)
    return user


@router.delete("/users/{user_id}")
async def delete_user(
    user_id: int, 
    _: MaUser = Depends(get_current_user),
    db: Session = Depends(get_db)):
    
    result = db.execute(select(MaUser).where(MaUser.user_id == user_id))
    user = result.scalars().first()
    
    if not user:
        raise HTTPException(status_code=404, detail="ไม่พบผู้ใช้งาน")

    user.is_deleted = True
    user.is_active = False
    user.updated_at = datetime.utcnow()
    
    db.commit()
    return {"message": f"ลบผู้ใช้งาน ID {user_id} สำเร็จ (Soft Delete)"}