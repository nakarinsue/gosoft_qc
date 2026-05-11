from sqlalchemy import Integer, String, Boolean, DateTime, Index
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime
from typing import Optional

# นำเข้า Base จากไฟล์ database ที่เราสร้างไว้
from app.api.core.database import Base 

class MaUser(Base):
    __tablename__ = "u_user"
    __table_args__ = (
        Index("ix_m_user_username", "user_id"),
        {"schema": "PROMOTION_TEMP"}
    )

    user_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    email: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    
    role: Mapped[Optional[str]] = mapped_column(String(20), default="USER") 
    is_active: Mapped[Optional[bool]] = mapped_column(Boolean, default=True)
    
    # ใช้สำหรับทำ Soft Delete (ไม่ลบข้อมูลทิ้งจริงๆ แค่เปลี่ยนสถานะ)
    is_deleted: Mapped[Optional[bool]] = mapped_column(Boolean, default=False)
    
    ip_address: Mapped[Optional[str]] = mapped_column(String(20))
    allmember: Mapped[Optional[str]] = mapped_column(String(25))
    
    created_at: Mapped[Optional[datetime]] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[Optional[datetime]] = mapped_column(DateTime, default=datetime.utcnow)