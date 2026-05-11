from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from sqlalchemy import select
from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import JWTError, jwt

# สมมติฐานว่ามีการ import dependencies และ models มาแล้ว
from ..config import settings
from ..database.common.connet_database_postgres import get_db
from ..database.models.postgres_models import MaUser

# ==========================================
# 1. CONSTANTS & CONFIGURATIONS
# ==========================================
AUTHENTICATE = 'WWW-Authenticate'
BEARER = "Bearer"
AUTO_ERROR = False
PATH_OAUTH = '/auth/login'

# ตั้งค่าระบบ Hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ตั้งค่า OAuth2 สำหรับ Swagger UI และ Dependency
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=PATH_OAUTH, auto_error=AUTO_ERROR)


# ==========================================
# 2. SECURITY FUNCTIONS
# ==========================================
def verify_password(plain_password: str, hashed_password: str) -> bool:
    """ตรวจสอบความถูกต้องของรหัสผ่าน"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """เข้ารหัสผ่านก่อนบันทึกลง Database"""
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """สร้าง JWT Access Token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        # ใช้ค่าจาก settings หรือค่าเริ่มต้นที่ 30000 นาที
        expire_minutes = getattr(settings, "ACCESS_TOKEN_EXPIRE_MINUTES", 30000)
        expire = datetime.now(timezone.utc) + timedelta(minutes=expire_minutes)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


# ==========================================
# 3. DEPENDENCIES
# ==========================================
def get_current_user(
    token: str = Depends(oauth2_scheme), 
    db: Session = Depends(get_db)
) -> MaUser:
    """Dependency สำหรับตรวจสอบ Token และดึงข้อมูล User ปัจจุบัน"""
    
    if not token:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="validate credentials not Login"
        )
    
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={AUTHENTICATE: BEARER},
    )
    
    try:
        # ถอดรหัส JWT Token
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        # ในตอนสร้าง Token ใช้ 'sub' เป็น string ของ user_id
        user_id_str: str | None = payload.get("sub", None)
        if user_id_str is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    # ค้นหา User จาก Database
    user = db.scalar(select(MaUser).where(MaUser.user_id == int(user_id_str)))
    
    if user is None:
        raise credentials_exception
    
    # ตรวจสอบสถานะว่าถูกลบหรือระงับการใช้งานหรือไม่
    if getattr(user, 'is_deleted', False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="บัญชีผู้ใช้งานนี้ถูกระงับหรือถูกลบออกจากระบบแล้ว (Inactive user)"
        )
            
    return user