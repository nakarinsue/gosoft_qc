from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.config import settings
from app.backend.models.database import get_db
from app.backend.models.postgres._base_on import MaUser

AUTHENTICATE = 'WWW-Authenticate'
BEARER = "Bearer"
AUTO_ERROR = True
PATH_OAUTH ='/auth/login'
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=PATH_OAUTH,auto_error =AUTO_ERROR)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire_minutes = getattr(settings, "ACCESS_TOKEN_EXPIRE_MINUTES", 30000)
        expire = datetime.now(timezone.utc) + timedelta(minutes=expire_minutes)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def get_current_user(
        token: str = Depends(oauth2_scheme), 
        db: Session = Depends(get_db)) -> MaUser:
    
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={AUTHENTICATE: BEARER},
    )
    
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username: str|None = payload.get("sub", None)
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.scalar(select(MaUser).where(MaUser.user_id == int(username)))
    
    if user is None:
        raise credentials_exception
    
    if getattr(user, 'is_deleted', False):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="บัญชีผู้ใช้งานนี้ถูกระงับหรือถูกลบออกจากระบบแล้ว (Inactive user)"
            )
            
    return user

