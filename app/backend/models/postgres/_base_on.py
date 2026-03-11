from typing import List, Optional
from datetime import datetime, date
from sqlalchemy import (
    Integer, String, Boolean, DateTime, Date, Text, 
    ForeignKey, UniqueConstraint, Index, MetaData, PrimaryKeyConstraint
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.backend.database import Base

metadata_obj = MetaData(schema="PROMOTION")

# 1. User Model
class MaUser(Base):
    __tablename__ = "u_user"
    __table_args__ = (
        Index("ix_m_user_username", "user_id"),
    )

    user_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    email: Mapped[Optional[str]] = mapped_column(String(100), unique=True, nullable=False)
    role: Mapped[Optional[str]] = mapped_column(String(20), default="USER") 
    is_active: Mapped[Optional[bool]] = mapped_column(Boolean, default=True)
    is_deleted: Mapped[Optional[bool]] = mapped_column(Boolean, default=False)
    ip_address: Mapped[Optional[str]] = mapped_column(String(20), default="117.113.122.110") 
    allmember: Mapped[Optional[str]] = mapped_column(String(25), default="") 
    created_at: Mapped[Optional[datetime]] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[Optional[datetime]] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    user_version_control: Mapped[List["MVersionControl"]] = relationship(
        back_populates="creator", cascade="all, delete-orphan", foreign_keys="[MVersionControl.user_create]"
    )
    user_payment: Mapped[List["payment"]] = relationship(
        back_populates="payment_user", cascade="all, delete-orphan", foreign_keys="[payment.user_create]"
    )
    user_file_master: Mapped[List["MFileMaster"]] = relationship(
        back_populates="file_master_user", cascade="all, delete-orphan", foreign_keys="[MFileMaster.user_create]"
    )
    user_bucket_entity: Mapped[List["MPromotionBucketEntity"]] = relationship(
        back_populates="bucket_entity_user", cascade="all, delete-orphan", foreign_keys="[MPromotionBucketEntity.user_update]"
    )
    user_promotion_header: Mapped[List["MPromotionHeader"]] = relationship(
        back_populates="promotion_header_user", cascade="all, delete-orphan", foreign_keys="[MPromotionHeader.user_update]"
    )
    user_file_infomation_master: Mapped[List["Minformationimport"]] = relationship(
        back_populates="file_infomation_master_user", cascade="all, delete-orphan", foreign_keys="[Minformationimport.user_create]" 
    )

# 2. Payment Model
class payment(Base):
    __tablename__ = "p_payment"
    __table_args__ = (UniqueConstraint("paycode", name="unque_paycode_mi_version"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    paycode: Mapped[str] = mapped_column(String(20), nullable=True)
    stated_payment: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    types_allwallet: Mapped[bool] = mapped_column(Boolean, nullable=True, default=True)
    location: Mapped[str] = mapped_column(String(100), nullable=True)
    description: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    date_create: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    user_create: Mapped[int] = mapped_column(ForeignKey("u_user.user_id"), nullable=False)
    date_update: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    user_update: Mapped[int] = mapped_column(ForeignKey("u_user.user_id"), nullable=False)
    
    payment_user: Mapped["MaUser"] = relationship("MaUser", foreign_keys=[user_create], back_populates="user_payment")
    payment_user_two: Mapped["MaUser"] = relationship("MaUser", foreign_keys=[user_update])

# 3. Version Control Model
class MVersionControl(Base):
    __tablename__ = "m_version_control"
    __table_args__ = (UniqueConstraint("sr_no", name="ix_sr_no_mi_version"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    sr_no: Mapped[str] = mapped_column(String(20), default="2026/000001", nullable=True)
    title: Mapped[str] = mapped_column(String(100), nullable=False)
    sub_title: Mapped[str] = mapped_column(String(255), nullable=True)
    detail: Mapped[str] = mapped_column(String(255), nullable=True)
    description: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    sr_link_url: Mapped[Optional[str]] = mapped_column(String(1000), nullable=True)
    lp_no: Mapped[str] = mapped_column(String(10), default="00000", nullable=True)
    status: Mapped[int] = mapped_column(Integer, nullable=False)
    date_create: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    date_update: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    user_create: Mapped[int] = mapped_column(ForeignKey("u_user.user_id"), nullable=False)
    user_update: Mapped[int] = mapped_column(ForeignKey("u_user.user_id"), nullable=False)

    version_control_infomation: Mapped[List["Minformationimport"]] = relationship(
        back_populates="file_infomation_version_control", cascade="all, delete-orphan"
    )
    creator: Mapped["MaUser"] = relationship("MaUser", foreign_keys=[user_create], back_populates="user_version_control")
    updater: Mapped["MaUser"] = relationship("MaUser", foreign_keys=[user_update])

# 4. File Master Model
class MFileMaster(Base):
    __tablename__ = "m_file_master"
    __table_args__ = (UniqueConstraint("v_id", "file_name", "sheet", name="ix_m_file_import"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    v_id: Mapped[int] = mapped_column(ForeignKey("m_info_import_file.id", ondelete="CASCADE"), nullable=False)
    file_name: Mapped[str] = mapped_column(String(255), nullable=False)
    sheet: Mapped[str] = mapped_column(String(100), nullable=False)
    status: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    r_row: Mapped[Optional[int]] = mapped_column(Integer, default=0)
    w_row: Mapped[Optional[int]] = mapped_column(Integer, default=0)
    e_row: Mapped[Optional[int]] = mapped_column(Integer, default=0)
    user_mk: Mapped[Optional[str]] = mapped_column(String(100))
    description: Mapped[Optional[str]] = mapped_column(String(255))
    date_create: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    user_create: Mapped[int] = mapped_column(ForeignKey("u_user.user_id"), nullable=False)
    date_update: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    user_update: Mapped[int] = mapped_column(ForeignKey("u_user.user_id"), nullable=False)

    file_master_file_infomation: Mapped["Minformationimport"] = relationship(back_populates="file_infomation_file_master")
    file_master_user: Mapped["MaUser"] = relationship(back_populates="user_file_master", foreign_keys=[user_create])
    file_master_promotion_header: Mapped[List["MPromotionHeader"]] = relationship(
        back_populates="promotion_header_file_master", cascade="all, delete-orphan"
    )

# 5. Info Import File Model
class Minformationimport(Base):
    __tablename__ = "m_info_import_file"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    v_id: Mapped[int] = mapped_column(ForeignKey("m_version_control.id", ondelete="CASCADE"), nullable=False)
    status: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String(255))
    date_create: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    user_create: Mapped[int] = mapped_column(ForeignKey("u_user.user_id"), nullable=False)

    file_infomation_version_control: Mapped["MVersionControl"] = relationship(back_populates="version_control_infomation")
    file_infomation_master_user: Mapped["MaUser"] = relationship(back_populates="user_file_infomation_master", foreign_keys=[user_create])
    file_infomation_file_master: Mapped["MFileMaster"] = relationship(
        back_populates="file_master_file_infomation", 
        primaryjoin="Minformationimport.id == MFileMaster.v_id",
        viewonly=True
    )

# 6. Promotion Header Model
class MPromotionHeader(Base):
    __tablename__ = "m_promotion_header"
    __table_args__ = (UniqueConstraint("file_id", "pro_code", name="ix_m_promotion_header_uniq"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    file_id: Mapped[int] = mapped_column(ForeignKey("m_file_master.id", ondelete="CASCADE"), nullable=False)
    pro_code: Mapped[int] = mapped_column(Integer, nullable=False)
    pro_name: Mapped[str] = mapped_column(String(100), nullable=False)
    pro_receipt_name: Mapped[str] = mapped_column(String(100), nullable=False)
    pro_type: Mapped[str] = mapped_column(String(30), nullable=False)
    pro_group: Mapped[str] = mapped_column(String(50), nullable=False)
    pro_status: Mapped[str] = mapped_column(String(30), nullable=False)
    pro_level: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date] = mapped_column(Date, nullable=False)
    update_date: Mapped[Optional[date]] = mapped_column(Date)
    reward_value: Mapped[Optional[str]] = mapped_column(String(50))
    reward_type: Mapped[str] = mapped_column(String(100), nullable=True)
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
    rec_date: Mapped[date] = mapped_column(Date, nullable=True)
    sun_fg: Mapped[Optional[bool]] = mapped_column(Boolean, default=False)
    mon_fg: Mapped[Optional[bool]] = mapped_column(Boolean, default=False)
    tue_fg: Mapped[Optional[bool]] = mapped_column(Boolean, default=False)
    wed_fg: Mapped[Optional[bool]] = mapped_column(Boolean, default=False)
    thu_fg: Mapped[Optional[bool]] = mapped_column(Boolean, default=False)
    sat_fg: Mapped[Optional[bool]] = mapped_column(Boolean, default=False)
    spec_fg: Mapped[Optional[bool]] = mapped_column(Boolean, default=False)
    exclud_fg: Mapped[Optional[bool]] = mapped_column(Boolean, default=False)
    state: Mapped[Optional[int]] = mapped_column(Integer, default=1, nullable=False)
    export: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    date_update: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    user_update: Mapped[int] = mapped_column(ForeignKey("u_user.user_id"), nullable=False)
    date_assign: Mapped[datetime] = mapped_column(DateTime, default=None, nullable=True)
    user_assign: Mapped[int] = mapped_column(ForeignKey("u_user.user_id"), default=None, nullable=True)

    promotion_header_file_master: Mapped["MFileMaster"] = relationship(back_populates="file_master_promotion_header")
    promotion_header_user: Mapped["MaUser"] = relationship(back_populates="user_promotion_header", foreign_keys=[user_update])
    promotion_header_bucket_entity: Mapped[List["MPromotionBucketEntity"]] = relationship(
        back_populates="bucket_entity_promotion_header", cascade="all, delete-orphan"
    )
    defects: Mapped[List["TTransaction"]] = relationship(back_populates="promotion", cascade="all, delete-orphan")

# 7. Promotion Bucket Entity Model
class MPromotionBucketEntity(Base):
    __tablename__ = "m_promotion_bucket_entity"

    pro_id: Mapped[int] = mapped_column(ForeignKey("m_promotion_header.id", ondelete="CASCADE"), nullable=False, primary_key=True)
    entity_code: Mapped[str] = mapped_column(String(26), primary_key=True, nullable=False)
    entity_name: Mapped[str] = mapped_column(String(200), nullable=False)
    entity_type: Mapped[str] = mapped_column(String(100), nullable=False)
    mode: Mapped[str] = mapped_column(String(50), default="1", nullable=False)
    bucket: Mapped[int] = mapped_column(Integer, nullable=False, primary_key=True)
    trigger_value: Mapped[Optional[str]] = mapped_column(String(10))
    trigger_type: Mapped[Optional[str]] = mapped_column(String(50))
    barcode: Mapped[Optional[str]] = mapped_column(String(50))
    coupon: Mapped[Optional[str]] = mapped_column(String(26), primary_key=True)
    condition: Mapped[Optional[str]] = mapped_column(String(300))
    condition_name: Mapped[Optional[str]] = mapped_column(String(300))
    condition_id: Mapped[Optional[str]] = mapped_column(String(300))
    status: Mapped[Optional[int]] = mapped_column(Integer, default=1, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    receipt_id: Mapped[Optional[int]] = mapped_column(ForeignKey("t_transaction_item.id"), default=None, nullable=True)
    date_update: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=True)
    user_update: Mapped[int] = mapped_column(ForeignKey("u_user.user_id"), nullable=True)

    bucket_entity_promotion_header: Mapped["MPromotionHeader"] = relationship(back_populates="promotion_header_bucket_entity")
    bucket_entity_user: Mapped["MaUser"] = relationship(back_populates="user_bucket_entity", foreign_keys=[user_update])
    bucket_entity_Transactionitem: Mapped["TTransactionitem"] = relationship(
        back_populates="Transactionitem_bucket_entity", foreign_keys=[receipt_id]
    )

# 8. Transaction Model
class TTransaction(Base):
    __tablename__ = "t_transaction"
    __table_args__ = (UniqueConstraint("receipt_no", "store_code", name="ix_receipt_store_uniq"),) 

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    pro_id: Mapped[int] = mapped_column(ForeignKey("m_promotion_header.id", ondelete="CASCADE"), nullable=False)
    types: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    store_code: Mapped[str] = mapped_column(String(10), nullable=False)
    pos_no: Mapped[int] = mapped_column(Integer, nullable=False)
    business_datetime: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    system_datetime: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    shift_no: Mapped[int] = mapped_column(Integer, nullable=False)
    receipt_no: Mapped[int] = mapped_column(Integer, nullable=False)
    common_tran: Mapped[int] = mapped_column(Integer, nullable=False)
    title: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String(255))
    date_create: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    user_create: Mapped[int] = mapped_column(ForeignKey("u_user.user_id"), nullable=False)
    date_update: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    user_update: Mapped[int] = mapped_column(ForeignKey("u_user.user_id"), nullable=False)

    promotion: Mapped["MPromotionHeader"] = relationship(back_populates="defects")
    items: Mapped[List["TTransactionitem"]] = relationship(back_populates="Transaction")
    ej: Mapped[List["TTej"]] = relationship(back_populates="Transactions")

# 9. Transaction Item Model
class TTransactionitem(Base):
    __tablename__ = "t_transaction_item"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    T_id: Mapped[int] = mapped_column(ForeignKey("t_transaction.id"), nullable=False)
    title: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    types: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String(255))
    date_create: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    user_create: Mapped[int] = mapped_column(ForeignKey("u_user.user_id"), nullable=False)
    date_update: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    user_update: Mapped[int] = mapped_column(ForeignKey("u_user.user_id"), nullable=False)

    Transaction: Mapped["TTransaction"] = relationship(back_populates="items")
    Transactionitem_bucket_entity: Mapped[List["MPromotionBucketEntity"]] = relationship(
        back_populates="bucket_entity_Transactionitem", foreign_keys="[MPromotionBucketEntity.receipt_id]"
    )

# 10. EJ Model
class TTej(Base):
    __tablename__ = "t_ej"
    __table_args__ = (PrimaryKeyConstraint('T_id','STORE_ID','POS_NO','COMMON_TRN_NO','RECEIPT_NO','EJ_LINE_NO' , name="PK_T_EJ"),) 
    
    T_id: Mapped[int] = mapped_column(ForeignKey("t_transaction.id"), nullable=False)
    STORE_ID: Mapped[Optional[str]] = mapped_column(String(6))
    POS_NO: Mapped[int] = mapped_column(Integer, nullable=False)
    BUSINESS_DATE: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    COMMON_TRN_NO: Mapped[int] = mapped_column(Integer, nullable=False)
    RECEIPT_NO: Mapped[int] = mapped_column(Integer, nullable=False)
    BUSINESS_UNIT: Mapped[int] = mapped_column(Integer, nullable=False)
    SERVICE_TYPE_NO: Mapped[int] = mapped_column(Integer, nullable=False)
    EJ_TYPE_NO: Mapped[int] = mapped_column(Integer, nullable=False)
    SHIFT_NO: Mapped[int] = mapped_column(Integer, nullable=False)
    EJ_LINE_NO: Mapped[int] = mapped_column(Integer, nullable=False)
    EJ_LINE: Mapped[Optional[str]] = mapped_column(String(500))
    SYSTEM_DATE: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    REMARK: Mapped[Optional[str]] = mapped_column(String(255))

    Transactions: Mapped["TTransaction"] = relationship(back_populates="ej")