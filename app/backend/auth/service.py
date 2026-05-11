from sqlalchemy.orm import Session
from sqlalchemy import select
from fastapi import HTTPException, status
from datetime import datetime, timezone
from typing import List

# สมมติฐานว่ามีการ import models และ schemas มาแล้ว
from ..database.models.postgres_models import MaUser
from .security import verify_password, get_password_hash

class UserService:
    
    @staticmethod
    def authenticate_user(db: Session, username: str, password: str) -> MaUser:
        user = db.scalar(select(MaUser).where(MaUser.username == username))
        if not user or not verify_password(password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        return user

    @staticmethod
    def create_user(db: Session, payload) -> MaUser:
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

    @staticmethod
    def get_active_users(db: Session) -> List[MaUser]:
        stmt = select(MaUser).where(
            MaUser.is_active == True, 
            MaUser.is_deleted == False
        )
        result = db.execute(stmt)
        return result.scalars().all() # type: ignore

    @staticmethod
    def get_users(db: Session, skip: int = 0, limit: int = 100):
        stmt = select(MaUser).where(MaUser.is_deleted == False).offset(skip).limit(limit)
        return db.scalars(stmt).all()   
       
       
       
        # stmt = select(MaUser)
        # result = db.execute(stmt)
        # return result.scalars().all() # type: ignore

    @staticmethod
    def update_user(db: Session, user_id: int, payload) -> MaUser:
        result = db.execute(select(MaUser).where(MaUser.user_id == user_id))
        user = result.scalars().first()
        
        if not user:
            raise HTTPException(status_code=404, detail="ไม่พบผู้ใช้งาน")

        # อัปเดต Pydantic V2 เป็น model_dump
        update_data = payload.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(user, key, value)
        
        # อัปเดตใช้ timezone ที่ถูกต้องตามมาตรฐานใหม่
        user.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def delete_user(db: Session, user_id: int):
        result = db.execute(select(MaUser).where(MaUser.user_id == user_id))
        user = result.scalars().first()
        
        if not user:
            raise HTTPException(status_code=404, detail="ไม่พบผู้ใช้งาน")

        user.is_deleted = True
        user.is_active = False
        user.updated_at = datetime.now(timezone.utc)
        
        db.commit()
        return {"message": f"ลบผู้ใช้งาน ID {user_id} สำเร็จ (Soft Delete)"}