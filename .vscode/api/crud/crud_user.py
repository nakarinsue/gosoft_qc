from sqlalchemy.orm import Session
from sqlalchemy import select, update
from datetime import datetime
from app.api.models import MaUser
from app.api.schemas.user import UserCreate, UserUpdate
# นำเข้าฟังก์ชันเข้ารหัส (สมมติว่าสร้างไว้ใน core)
from app.api.core.security import get_password_hash 

def get_user_by_id(db: Session, user_id: int):
    stmt = select(MaUser).where(MaUser.user_id == user_id, MaUser.is_deleted == False)
    return db.scalars(stmt).first()

def get_user_by_username(db: Session, username: str):
    stmt = select(MaUser).where(MaUser.username == username, MaUser.is_deleted == False)
    return db.scalars(stmt).first()

def get_users(db: Session, skip: int = 0, limit: int = 100):
    stmt = select(MaUser).where(MaUser.is_deleted == False).offset(skip).limit(limit)
    return db.scalars(stmt).all()

def create_user(db: Session, user: UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = MaUser(
        username=user.username,
        name=user.name,
        email=user.email,
        password_hash=hashed_password,
        role=user.role,
        is_active=user.is_active,
        allmember=user.allmember
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, user_id: int, user_update: UserUpdate):
    db_user = get_user_by_id(db, user_id)
    if not db_user:
        return None

    update_data = user_update.model_dump(exclude_unset=True)
    
    # หากมีการส่ง password มาใหมให้ทำการ Hash ก่อนอัปเดต
    if "password" in update_data:
        update_data["password_hash"] = get_password_hash(update_data.pop("password"))
        
    update_data["updated_at"] = datetime.utcnow()

    for key, value in update_data.items():
        setattr(db_user, key, value)

    db.commit()
    db.refresh(db_user)
    return db_user