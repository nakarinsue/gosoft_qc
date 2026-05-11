from sqlalchemy import Integer, String, Boolean, DateTime, Date, Text, ForeignKey, Index, UniqueConstraint, PrimaryKeyConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime, date
from typing import Optional, List

# นำเข้า Base จากไฟล์ database หลัก
from app.api.core.database import Base

# ==================================================================
# 1. User Model
# ==================================================================
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
    is_deleted: Mapped[Optional[bool]] = mapped_column(Boolean, default=False)
    
    ip_address: Mapped[Optional[str]] = mapped_column(String(20))
    allmember: Mapped[Optional[str]] = mapped_column(String(25))
    
    created_at: Mapped[Optional[datetime]] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[Optional[datetime]] = mapped_column(DateTime, default=datetime.utcnow)


# ==================================================================
# 2. Version Control Model
# ==================================================================
class MVersionControl(Base):
    __tablename__ = "m_version_control"
    __table_args__ = {"schema": "PROMOTION_TEMP"}

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    sr_no: Mapped[Optional[str]] = mapped_column(String(20))
    title: Mapped[str] = mapped_column(String(100), nullable=False)
    sub_title: Mapped[Optional[str]] = mapped_column(String(255))
    detail: Mapped[Optional[str]] = mapped_column(String(255))
    description: Mapped[Optional[str]] = mapped_column(String(255))
    sr_link_url: Mapped[Optional[str]] = mapped_column(String(1000))
    lp_no: Mapped[Optional[str]] = mapped_column(String(10))
    
    status: Mapped[int] = mapped_column(Integer, nullable=False)
    
    date_create: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    user_create: Mapped[int] = mapped_column(ForeignKey("PROMOTION_TEMP.u_user.user_id"), nullable=False)
    date_update: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    user_update: Mapped[int] = mapped_column(ForeignKey("PROMOTION_TEMP.u_user.user_id"), nullable=False)

    # --- Relationships ---
    info_imports: Mapped[List["MInfoImportFile"]] = relationship("MInfoImportFile", back_populates="version_control", cascade="all, delete-orphan")


# ==================================================================
# 3. Payment Model
# ==================================================================
class PPayment(Base):
    __tablename__ = "p_payment"
    __table_args__ = {"schema": "PROMOTION_TEMP"}

    paycode: Mapped[str] = mapped_column(String(20), primary_key=True)
    stated_payment: Mapped[Optional[bool]] = mapped_column(Boolean)
    types_allwallet: Mapped[Optional[bool]] = mapped_column(Boolean)
    location: Mapped[Optional[str]] = mapped_column(String(100))
    description: Mapped[Optional[str]] = mapped_column(String(255))
    
    date_create: Mapped[Optional[datetime]] = mapped_column(DateTime, default=datetime.utcnow)
    user_create: Mapped[Optional[int]] = mapped_column(Integer)
    date_update: Mapped[Optional[datetime]] = mapped_column(DateTime, default=datetime.utcnow)
    user_update: Mapped[Optional[int]] = mapped_column(ForeignKey("PROMOTION_TEMP.u_user.user_id"))


# ==================================================================
# 4. Info Import File Model
# ==================================================================
class MInfoImportFile(Base):
    __tablename__ = "m_info_import_file"
    __table_args__ = {"schema": "PROMOTION_TEMP"}

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    v_id: Mapped[int] = mapped_column(ForeignKey("PROMOTION_TEMP.m_version_control.id", ondelete="CASCADE"), nullable=False)
    status: Mapped[int] = mapped_column(Integer, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String(255))
    
    date_create: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    user_create: Mapped[int] = mapped_column(ForeignKey("PROMOTION_TEMP.u_user.user_id"), nullable=False)

    # --- Relationships ---
    version_control: Mapped["MVersionControl"] = relationship("MVersionControl", back_populates="info_imports")
    file_masters: Mapped[List["MFileMaster"]] = relationship("MFileMaster", back_populates="info_import", cascade="all, delete-orphan")


# ==================================================================
# 5. File Master Model
# ==================================================================
class MFileMaster(Base):
    __tablename__ = "m_file_master"
    __table_args__ = (
        UniqueConstraint("v_id", "file_name", "sheet", name="ix_m_file_import"),
        {"schema": "PROMOTION_TEMP"}
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    v_id: Mapped[int] = mapped_column(ForeignKey("PROMOTION_TEMP.m_info_import_file.id", ondelete="CASCADE"), nullable=False)
    
    file_name: Mapped[str] = mapped_column(String(255), nullable=False)
    sheet: Mapped[str] = mapped_column(String(100), nullable=False)
    status: Mapped[int] = mapped_column(Integer, nullable=False)
    
    r_row: Mapped[Optional[int]] = mapped_column(Integer)
    w_row: Mapped[Optional[int]] = mapped_column(Integer)
    e_row: Mapped[Optional[int]] = mapped_column(Integer)
    
    user_mk: Mapped[Optional[str]] = mapped_column(String(100))
    description: Mapped[Optional[str]] = mapped_column(String(255))
    
    date_create: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    user_create: Mapped[int] = mapped_column(ForeignKey("PROMOTION_TEMP.u_user.user_id"), nullable=False)
    date_update: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    user_update: Mapped[int] = mapped_column(ForeignKey("PROMOTION_TEMP.u_user.user_id"), nullable=False)

    # --- Relationships ---
    info_import: Mapped["MInfoImportFile"] = relationship("MInfoImportFile", back_populates="file_masters")
    promotion_headers: Mapped[List["MPromotionHeader"]] = relationship("MPromotionHeader", back_populates="file_master", cascade="all, delete-orphan")


# ==================================================================
# 6. Promotion Header Model
# ==================================================================
class MPromotionHeader(Base):
    __tablename__ = "m_promotion_header"
    __table_args__ = (
        UniqueConstraint("file_id", "pro_code", name="ix_m_promotion_header_uniq"),
        {"schema": "PROMOTION_TEMP"}
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    file_id: Mapped[int] = mapped_column(ForeignKey("PROMOTION_TEMP.m_file_master.id", ondelete="CASCADE"), nullable=False)
    
    pro_code: Mapped[int] = mapped_column(Integer, nullable=False)
    pro_name: Mapped[str] = mapped_column(String(100), nullable=False)
    pro_receipt_name: Mapped[str] = mapped_column(String(100), nullable=False)
    pro_type: Mapped[str] = mapped_column(String(30), nullable=False)
    pro_group: Mapped[str] = mapped_column(String(50), nullable=False)
    pro_status: Mapped[str] = mapped_column(String(30), nullable=False)
    pro_level: Mapped[int] = mapped_column(Integer, nullable=False)
    
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date] = mapped_column(Date, nullable=False)
    update_date: Mapped[Optional[date]] = mapped_column(Date)
    
    reward_value: Mapped[Optional[str]] = mapped_column(String(50))
    reward_type: Mapped[Optional[str]] = mapped_column(String(100))
    reward_ma: Mapped[Optional[str]] = mapped_column(String(50))
    reward_name: Mapped[Optional[str]] = mapped_column(String(100))
    
    limit_tran: Mapped[Optional[int]] = mapped_column(Integer)
    limit_day: Mapped[Optional[int]] = mapped_column(Integer)
    limit_item: Mapped[Optional[int]] = mapped_column(Integer)
    limit_redemp: Mapped[Optional[int]] = mapped_column(Integer)
    
    member_tier: Mapped[Optional[str]] = mapped_column(String(100))
    member_segm: Mapped[Optional[str]] = mapped_column(String(100))
    member_requ: Mapped[Optional[str]] = mapped_column(String(100))
    notes: Mapped[str] = mapped_column(Text, nullable=False)

    indexs: Mapped[Optional[int]] = mapped_column(Integer)
    rec_date: Mapped[Optional[date]] = mapped_column(Date)
    
    sun_fg: Mapped[Optional[bool]] = mapped_column(Boolean)
    mon_fg: Mapped[Optional[bool]] = mapped_column(Boolean)
    tue_fg: Mapped[Optional[bool]] = mapped_column(Boolean)
    wed_fg: Mapped[Optional[bool]] = mapped_column(Boolean)
    thu_fg: Mapped[Optional[bool]] = mapped_column(Boolean)
    sat_fg: Mapped[Optional[bool]] = mapped_column(Boolean)
    spec_fg: Mapped[Optional[bool]] = mapped_column(Boolean) 
    exclud_fg: Mapped[Optional[bool]] = mapped_column(Boolean)
    
    state: Mapped[int] = mapped_column(Integer, nullable=False)
    export: Mapped[bool] = mapped_column(Boolean, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)

    date_update: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    user_update: Mapped[int] = mapped_column(ForeignKey("PROMOTION_TEMP.u_user.user_id"), nullable=False) 
    date_assign: Mapped[Optional[datetime]] = mapped_column(DateTime)
    user_assign: Mapped[Optional[int]] = mapped_column(ForeignKey("PROMOTION_TEMP.u_user.user_id"))
    coupon_mapping: Mapped[Optional[str]] = mapped_column(String(50))

    # --- Relationships ---
    file_master: Mapped["MFileMaster"] = relationship("MFileMaster", back_populates="promotion_headers")
    defects: Mapped[List["TDefect"]] = relationship("TDefect", back_populates="promotion", cascade="all, delete-orphan")
    transactions: Mapped[List["TTransaction"]] = relationship("TTransaction", back_populates="promotion", cascade="all, delete-orphan")
    bucket_entities: Mapped[List["MPromotionBucketEntity"]] = relationship("MPromotionBucketEntity", back_populates="promotion", cascade="all, delete-orphan")


# ==================================================================
# 7. Defect Model
# ==================================================================
class TDefect(Base):
    __tablename__ = "t_Defect"
    __table_args__ = (
        UniqueConstraint("pro_id", name="ix_defect_pro_uniq"),
        {"schema": "PROMOTION_TEMP"}
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    pro_id: Mapped[int] = mapped_column(ForeignKey("PROMOTION_TEMP.m_promotion_header.id", ondelete="CASCADE"), nullable=False)
    
    types: Mapped[int] = mapped_column(Integer, nullable=False)
    title: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[int] = mapped_column(Integer, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String(255))
    remark: Mapped[Optional[str]] = mapped_column(String(255))
    
    date_create: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    user_create: Mapped[int] = mapped_column(ForeignKey("PROMOTION_TEMP.u_user.user_id"), nullable=False)
    date_update: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    user_update: Mapped[int] = mapped_column(ForeignKey("PROMOTION_TEMP.u_user.user_id"), nullable=False)

    # --- Relationships ---
    promotion: Mapped["MPromotionHeader"] = relationship("MPromotionHeader", back_populates="defects")
    bucket_entities: Mapped[List["MPromotionBucketEntity"]] = relationship(
        "MPromotionBucketEntity", 
        back_populates="defect_ref", 
        foreign_keys="[MPromotionBucketEntity.d_id]"
    )


# ==================================================================
# 8. Transaction Model
# ==================================================================
class TTransaction(Base):
    __tablename__ = "t_transaction"
    __table_args__ = (
        UniqueConstraint("receipt_no", "store_code", name="ix_receipt_store_uniq"),
        {"schema": "PROMOTION_TEMP"}
    ) 

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    pro_id: Mapped[int] = mapped_column(ForeignKey("PROMOTION_TEMP.m_promotion_header.id", ondelete="CASCADE"), nullable=False)
    
    types: Mapped[int] = mapped_column(Integer, nullable=False)
    store_code: Mapped[str] = mapped_column(String(10), nullable=False)
    pos_no: Mapped[int] = mapped_column(Integer, nullable=False)
    
    business_datetime: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    system_datetime: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    
    shift_no: Mapped[int] = mapped_column(Integer, nullable=False)
    receipt_no: Mapped[int] = mapped_column(Integer, nullable=False)
    common_tran: Mapped[int] = mapped_column(Integer, nullable=False)

    title: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[int] = mapped_column(Integer, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String(255))
    
    date_create: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    user_create: Mapped[int] = mapped_column(ForeignKey("PROMOTION_TEMP.u_user.user_id"), nullable=False)
    date_update: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    user_update: Mapped[int] = mapped_column(ForeignKey("PROMOTION_TEMP.u_user.user_id"), nullable=False)

    # --- Relationships ---
    promotion: Mapped["MPromotionHeader"] = relationship("MPromotionHeader", back_populates="transactions")
    ejs: Mapped[List["TTej"]] = relationship("TTej", back_populates="transaction", cascade="all, delete-orphan")

    bucket_entities: Mapped[List["MPromotionBucketEntity"]] = relationship(
        "MPromotionBucketEntity", 
        back_populates="transaction_ref", 
        foreign_keys="[MPromotionBucketEntity.t_id]"
    )


# ==================================================================
# 9. Promotion Bucket Entity Model
# ==================================================================
class MPromotionBucketEntity(Base):
    __tablename__ = "m_promotion_bucket_entity"
    __table_args__ = (
        UniqueConstraint("t_id", "pro_id", name="m_promotion_bucket_entity_unique"),
        UniqueConstraint("entity_code", "pro_id", name="m_promotion_bucket_entity_entity_code_unique"),
        UniqueConstraint("d_id", "pro_id", name="m_promotion_bucket_entity_unique_1"),
        {"schema": "PROMOTION_TEMP"}
    )

    pro_id: Mapped[int] = mapped_column(ForeignKey("PROMOTION_TEMP.m_promotion_header.id", ondelete="CASCADE"), primary_key=True)
    entity_code: Mapped[str] = mapped_column(String(26), primary_key=True)
    bucket: Mapped[int] = mapped_column(Integer, primary_key=True)
    coupon: Mapped[str] = mapped_column(String(26), primary_key=True)
    
    entity_name: Mapped[str] = mapped_column(String(200), nullable=False)
    entity_type: Mapped[str] = mapped_column(String(100), nullable=False)
    mode: Mapped[str] = mapped_column(String(50), nullable=False)
    
    trigger_value: Mapped[Optional[str]] = mapped_column(String(10))
    trigger_type: Mapped[Optional[str]] = mapped_column(String(50))
    barcode: Mapped[Optional[str]] = mapped_column(String(50))
    
    condition: Mapped[Optional[str]] = mapped_column(String(300))
    condition_name: Mapped[Optional[str]] = mapped_column(String(300))
    condition_id: Mapped[Optional[str]] = mapped_column(String(300))

    status: Mapped[int] = mapped_column(Integer, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    receipt_id: Mapped[Optional[int]] = mapped_column(Integer)
    
    date_update: Mapped[Optional[datetime]] = mapped_column(DateTime)
    user_update: Mapped[Optional[int]] = mapped_column(ForeignKey("PROMOTION_TEMP.u_user.user_id"))

    # Product Columns
    product_name: Mapped[Optional[str]] = mapped_column(String(100))
    product_package: Mapped[Optional[str]] = mapped_column(String(20))
    product_size: Mapped[Optional[str]] = mapped_column(String(5))
    product_unit: Mapped[Optional[str]] = mapped_column(String(5))
    product_status: Mapped[Optional[str]] = mapped_column(String(1))
    product_type: Mapped[Optional[str]] = mapped_column(String(1))
    product_price: Mapped[Optional[str]] = mapped_column(String(10))
    product_retail: Mapped[Optional[str]] = mapped_column(String(10))
    
    t_id: Mapped[Optional[int]] = mapped_column(ForeignKey("PROMOTION_TEMP.t_transaction.id"))
    d_id: Mapped[Optional[int]] = mapped_column(ForeignKey("PROMOTION_TEMP.t_Defect.id"))

    # --- Relationships ---
    promotion: Mapped["MPromotionHeader"] = relationship("MPromotionHeader", back_populates="bucket_entities")
    transaction_ref: Mapped[Optional["TTransaction"]] = relationship(
        "TTransaction", 
        back_populates="bucket_entities", 
        foreign_keys=[t_id]
    )
    defect_ref: Mapped[Optional["TDefect"]] = relationship(
        "TDefect", 
        back_populates="bucket_entities", 
        foreign_keys=[d_id]
    )


# ==================================================================
# 10. Electronic Journal (EJ) Model
# ==================================================================
class TTej(Base):
    __tablename__ = "t_ej"
    __table_args__ = (
        PrimaryKeyConstraint('T_id', 'STORE_ID', 'POS_NO', 'COMMON_TRN_NO', 'RECEIPT_NO', 'EJ_LINE_NO', name="PK_T_EJ"),
        {"schema": "PROMOTION_TEMP"}
    ) 
    
    T_id: Mapped[int] = mapped_column(ForeignKey("PROMOTION_TEMP.t_transaction.id"), nullable=False)
    STORE_ID: Mapped[str] = mapped_column(String(6), nullable=False)
    POS_NO: Mapped[int] = mapped_column(Integer, nullable=False)
    BUSINESS_DATE: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    COMMON_TRN_NO: Mapped[int] = mapped_column(Integer, nullable=False)
    RECEIPT_NO:  Mapped[int] = mapped_column(Integer, nullable=False)
    
    BUSINESS_UNIT: Mapped[int] = mapped_column(Integer, nullable=False)
    SERVICE_TYPE_NO: Mapped[int] = mapped_column(Integer, nullable=False)
    EJ_TYPE_NO: Mapped[int] = mapped_column(Integer, nullable=False)
    
    SHIFT_NO: Mapped[int] = mapped_column(Integer, nullable=False)
    EJ_LINE_NO:  Mapped[int] = mapped_column(Integer, nullable=False)
    EJ_LINE: Mapped[Optional[str]] = mapped_column(String(500))
    SYSTEM_DATE: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    REMARK: Mapped[Optional[str]] = mapped_column(String(255))

    # --- Relationships ---
    transaction: Mapped["TTransaction"] = relationship("TTransaction", back_populates="ejs")