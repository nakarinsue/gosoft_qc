from datetime import datetime, timedelta
from typing import Optional
from jose import jwt, JWTError
from passlib.context import CryptContext
import os

# ---------------------------------------------------------
# 1. การตั้งค่าตัวแปรสำหรับความปลอดภัย (Configuration)
# ---------------------------------------------------------
# SECRET_KEY ใช้สำหรับเซ็นรับรอง JWT Token (ในระบบ Production ต้องย้ายไปไว้ในไฟล์ .env และห้ามเปิดเผย)
# ตัวอย่างการสร้าง Secret Key แบบสุ่ม: รัน `openssl rand -hex 32` ใน Terminal
SECRET_KEY = os.environ.get("SECRET_KEY", "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7")

# Algorithm ที่ใช้เข้ารหัส Token
ALGORITHM = "HS256"

# อายุของ Token (เช่น กำหนดให้ Login อยู่ได้ 60 นาที)
ACCESS_TOKEN_EXPIRE_MINUTES = 60

# ---------------------------------------------------------
# 2. ตั้งค่า Password Hashing (ใช้ bcrypt)
# ---------------------------------------------------------
# passlib จะช่วยจัดการเรื่องการเข้ารหัสรหัสผ่านแบบ One-way (แปลงกลับไม่ได้)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    ตรวจสอบว่ารหัสผ่านที่ผู้ใช้งานพิมพ์มา (plain_password) 
    ตรงกับรหัสผ่านที่เข้ารหัสไว้ในฐานข้อมูล (hashed_password) หรือไม่
    """
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """
    แปลงรหัสผ่านปกติ (Plain text) ให้กลายเป็นข้อความเข้ารหัส (Hash)
    เพื่อบันทึกลงฐานข้อมูล (ถูกเรียกใช้ตอน Create/Update User)
    """
    return pwd_context.hash(password)

# ---------------------------------------------------------
# 3. การจัดการ JWT Token (JSON Web Token)
# ---------------------------------------------------------
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    สร้าง JWT Token เมื่อผู้ใช้งาน Login สำเร็จ
    โดยเก็บข้อมูลที่จำเป็น (เช่น username, user_id) ไว้ใน Payload
    """
    to_encode = data.copy()
    
    # กำหนดเวลาหมดอายุของ Token
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        
    to_encode.update({"exp": expire})
    
    # ทำการเข้ารหัสและเซ็นรับรอง (Sign) ด้วย SECRET_KEY
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    
    return encoded_jwt

def decode_access_token(token: str) -> Optional[dict]:
    """
    ถอดรหัส JWT Token กลับมาเป็นข้อมูล Payload
    (ไว้ใช้สร้างฟังก์ชัน Get Current User สำหรับดึงข้อมูลคน Login ในอนาคต)
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None