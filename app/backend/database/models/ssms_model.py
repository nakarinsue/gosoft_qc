from sqlalchemy import Column, Integer,MetaData, String, Boolean, DateTime, Date, Numeric, ForeignKey, Text, func
from sqlalchemy.orm import declarative_base, relationship
from ..common.connet_database_postgres import Base
from .ssms_model  import *
Base = declarative_base()
metadata_obj = MetaData(schema="PROMOTION")

# ==========================================
# 2. Master Data (Users, Products, Payments)
# ==========================================

class MaUser(Base):
    __tablename__ = 'MA_USER'
    __table_args__ = {'schema': 'PRO'}

    USER_ID = Column(Integer, primary_key=True, autoincrement=True)
    USERNAME = Column(String(50), unique=True, nullable=False)
    PASSWORD_HASH = Column(String(255), nullable=False)
    FIRST_NAME = Column(String(100))
    EMAIL = Column(String(100))
    ROLE_CODE = Column(String(50), default='0')
    USER_STATUS = Column(String(1), default='A')
    LAST_LOGIN = Column(DateTime)
    CREATED_DATE = Column(DateTime, default=func.now())
    UPDATED_DATE = Column(DateTime, default=func.now(), onupdate=func.now())

    # Relationships
    payments = relationship("MaPayment", back_populates="user")
    created_versions = relationship("MiVersion", foreign_keys='MiVersion.CREATE_NAME', back_populates="creator")
    updated_versions = relationship("MiVersion", foreign_keys='MiVersion.UPDATE_NAME', back_populates="updater")
    files_created = relationship("MiFileExcel", back_populates="user")
    assigned_tasks = relationship("TdAssign", back_populates="user")
    created_defects = relationship("TdDefect", back_populates="creator")

class MaProduct(Base):
    __tablename__ = 'MA_PRODUCT'
    __table_args__ = {'schema': 'PRO'}

    product_code = Column(String(30), primary_key=True) # Assume code as PK for ORM
    product_price = Column(Numeric(10, 2))
    product_name = Column(String(100))
    product_barcode = Column(String(30))
    updatetime = Column(DateTime, default=func.now(), nullable=False)
    store_code = Column(String(8))

class MaPayment(Base):
    __tablename__ = 'MA_PAYMENT'
    __table_args__ = {'schema': 'PRO'}

    ID = Column(Integer, primary_key=True, autoincrement=True)
    PAYCODE = Column(String(20), nullable=False)
    STATUS = Column(Boolean, default=True, nullable=False)
    TYPE = Column(String(20), default='allwallet', nullable=False)
    CREATE_DATE = Column(Date, default=func.current_date(), nullable=False)
    UPDATE_DATE = Column(Date, default=func.current_date(), onupdate=func.current_date(), nullable=False)
    REMARK = Column(String(200))
    USER_ID = Column(Integer, ForeignKey('PRO.MA_USER.USER_ID'), nullable=False)
    TYPE_TMN = Column(Boolean)

    user = relationship("MaUser", back_populates="payments")

# ==========================================
# 3. File Import & Version Control
# ==========================================

class MiVersion(Base):
    __tablename__ = 'MI_VERSION'
    __table_args__ = {'schema': 'PRO'}

    ID = Column(Integer, primary_key=True, autoincrement=True)
    VERSION_NO = Column(String(50), nullable=False)
    SYSTEM = Column(String(50), default='POS', nullable=False)
    WORKSHEET = Column(Integer, default=0, nullable=False)
    SHEET = Column(Integer, default=0, nullable=False)
    PRODUCT = Column(Integer, default=0, nullable=False)
    PROMOTION = Column(Integer, default=0, nullable=False)
    SKU = Column(Integer, default=0, nullable=False)
    CREATE_DATE = Column(DateTime, default=func.now(), nullable=False)
    CREATE_NAME = Column(Integer, ForeignKey('PRO.MA_USER.USER_ID'), nullable=False)
    UPDATE_DATE = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)
    UPDATE_NAME = Column(Integer, ForeignKey('PRO.MA_USER.USER_ID'), nullable=False)
    DESCRIPTION = Column(String(255))

    creator = relationship("MaUser", foreign_keys=[CREATE_NAME], back_populates="created_versions")
    updater = relationship("MaUser", foreign_keys=[UPDATE_NAME], back_populates="updated_versions")
    excel_files = relationship("MiFileExcel", back_populates="version", cascade="all, delete-orphan")

class MiFileExcel(Base):
    __tablename__ = 'MI_FILE_EXCEL'
    __table_args__ = {'schema': 'PRO'}

    ID = Column(Integer, primary_key=True, autoincrement=True)
    VERSION_ID = Column(Integer, ForeignKey('PRO.MI_VERSION.ID', ondelete="CASCADE"), nullable=False)
    RUNNING_NO = Column(Integer, nullable=False)
    WORKSHEET = Column(String(255), nullable=False)
    SHEET = Column(String(255), nullable=False)
    FOLDER_PATH = Column(String(255))
    STATUS = Column(Integer, default=0, nullable=False)
    R_ROW = Column(Integer)
    R_COLUMN = Column(Integer)
    W_ROW = Column(Integer)
    W_COLUMN = Column(Integer)
    USER_CREATE = Column(Integer, ForeignKey('PRO.MA_USER.USER_ID'), nullable=False)
    USER_MK = Column(String(100))
    REMARK = Column(String(255))
    DATE_CREATE = Column(DateTime)

    version = relationship("MiVersion", back_populates="excel_files")
    user = relationship("MaUser", back_populates="files_created")
    promotions = relationship("MpPromotion", back_populates="import_file", cascade="all, delete-orphan")
    assignments = relationship("TdAssign", back_populates="import_file", cascade="all, delete-orphan")

# ==========================================
# 4. Promotions Module
# ==========================================

class MpPromotionCode(Base):
    __tablename__ = 'MP_PROMOTION_CODE'
    __table_args__ = {'schema': 'PRO'}

    PROMOTION_CODE = Column(Integer, primary_key=True)
    TYPE = Column(String(100))
    NAME = Column(String(255))
    VALUE = Column(String(100))
    CODE = Column(String(100))
    PRICE = Column(String(10))

    promotions = relationship("MpPromotion", back_populates="promo_code_ref")

class MpPromotion(Base):
    __tablename__ = 'MP_PROMOTION'
    __table_args__ = {'schema': 'PRO'}

    ID = Column(Integer, primary_key=True, autoincrement=True)
    IMPORT_ID = Column(Integer, ForeignKey('PRO.MI_FILE_EXCEL.ID', ondelete="CASCADE"), nullable=False)
    PRO_CODE = Column(Integer, ForeignKey('PRO.MP_PROMOTION_CODE.PROMOTION_CODE'), nullable=False)
    PRO_NAME = Column(String(100), nullable=False)
    PRO_RECEIPT_NAME = Column(String(100), nullable=False)
    PRO_TYPE = Column(String(50), nullable=False)
    PRO_GROUP = Column(String(50), nullable=False)
    PRO_STATUS = Column(String(50), nullable=False)
    PRO_LEVEL = Column(Integer, default=1, nullable=False)
    START_DATE = Column(Date, nullable=False)
    END_DATE = Column(Date, nullable=False)
    REC_DATE = Column(Date, nullable=False)
    UPDATE_DATE = Column(Date)
    
    # Rewards
    REWARD_VALUE = Column(String(50))
    REWARD_TYPE = Column(String(100), nullable=False)
    REWARD_MA = Column(String(50))
    REWARD_NAME = Column(String(100))
    
    # Limits
    LIMIT_TRAN = Column(Integer)
    LIMIT_DAY = Column(Integer)
    LIMIT_ITEM = Column(Integer)
    LIMIT_REDEMP = Column(Integer)
    
    # Members
    MEMBER_TIER = Column(String(100))
    MEMBER_SEGM = Column(String(100))
    MEMBER_REQU = Column(String(100))
    NOTES = Column(Text, nullable=False)
    
    # Day Flags
    SUN_FG = Column(Boolean, default=True)
    MON_FG = Column(Boolean, default=True)
    TUE_FG = Column(Boolean, default=True)
    WED_FG = Column(Boolean, default=True)
    THU_FG = Column(Boolean, default=True)
    FRI_FG = Column(Boolean, default=True)
    SAT_FG = Column(Boolean, default=True)
    SEPC_FG = Column(Boolean, default=True)
    EXCLUD_FG = Column(Boolean, default=False)
    
    INDEXS = Column(Integer)
    EXPORT = Column(Boolean, default=True, nullable=False)

    import_file = relationship("MiFileExcel", back_populates="promotions")
    promo_code_ref = relationship("MpPromotionCode", back_populates="promotions")
    items = relationship("MpPromotionItem", back_populates="promotion", cascade="all, delete-orphan")
    defects = relationship("TdDefect", back_populates="promotion", cascade="all, delete-orphan")
    receipts = relationship("TsReceipt", back_populates="promotion", cascade="all, delete-orphan")

class MpPromotionItem(Base):
    __tablename__ = 'MP_PROMOTION_ITEM'
    __table_args__ = {'schema': 'PRO'}

    ID = Column(Integer, primary_key=True, autoincrement=True)
    PRO_ID = Column(Integer, ForeignKey('PRO.MP_PROMOTION.ID', ondelete="CASCADE"), primary_key=True)
    ENTITY_CODE = Column(String(26), primary_key=True)
    ENTITY_NAME = Column(String(200), nullable=False)
    ENTITY_TYPE = Column(String(100), nullable=False)
    MODE = Column(String(50), default='1', nullable=False)
    BUCKET = Column(Integer, nullable=False)
    TRIGGER_VALUE = Column(String(10))
    TRIGGER_TYPE = Column(String(50))
    BARCODE = Column(String(50))
    COUPON = Column(String(26))
    CONDITION = Column(String(300))
    CONDITION_NAME = Column(String(300))
    CONDITION_ID = Column(String(300))
    STATUSED = Column(Boolean, default=False)

    promotion = relationship("MpPromotion", back_populates="items")

# ==========================================
# 5. Tasks & Defects Tracking
# ==========================================

class TdAssign(Base):
    __tablename__ = 'TD_ASSIGN'
    __table_args__ = {'schema': 'PRO'}

    ID = Column(Integer, primary_key=True, autoincrement=True)
    IMPORT_ID = Column(Integer, ForeignKey('PRO.MI_FILE_EXCEL.ID', ondelete="CASCADE"), nullable=False)
    USER_ID = Column(Integer, ForeignKey('PRO.MA_USER.USER_ID'))
    PAGE_TO = Column(Integer)
    PAGE_FROM = Column(Integer)
    DATE = Column(Date)

    import_file = relationship("MiFileExcel", back_populates="assignments")
    user = relationship("MaUser", back_populates="assigned_tasks")

class TdDefect(Base):
    __tablename__ = 'TD_DEFECT'
    __table_args__ = {'schema': 'PRO'}

    ID = Column(Integer, primary_key=True, autoincrement=True)
    PRO_ID = Column(Integer, ForeignKey('PRO.MP_PROMOTION.ID', ondelete="CASCADE"), nullable=False)
    DETAIL = Column(Text, nullable=False)
    STATUS = Column(Integer, default=1, nullable=False)
    USER_MK = Column(String(50), nullable=False)
    QTY = Column(Integer, default=1, nullable=False)
    TYPE = Column(String(300))
    TYPE_OTHER = Column(String(300))
    STATE = Column(Integer, default=1, nullable=False)
    RETRY = Column(Integer, default=0, nullable=False)
    CREATE_DATE = Column(DateTime)
    UPDATE_DATE = Column(DateTime, nullable=False)
    REMARK = Column(String(300))
    USER_CREATE = Column(Integer, ForeignKey('PRO.MA_USER.USER_ID'), default=1, nullable=False)

    promotion = relationship("MpPromotion", back_populates="defects")
    creator = relationship("MaUser", back_populates="created_defects")
    items = relationship("TdDefectItem", back_populates="defect", cascade="all, delete-orphan")

class TdDefectItem(Base):
    __tablename__ = 'TD_DEFECT_ITEM'
    __table_args__ = {'schema': 'PRO'}

    ID = Column(Integer, primary_key=True, autoincrement=True)
    TDD = Column(Integer, ForeignKey('PRO.TD_DEFECT.ID', ondelete="CASCADE"), nullable=False)
    NAME = Column(String(100))
    VALUE = Column(String(500), nullable=False)
    QTY = Column(Integer, default=1, nullable=False)
    TYPE = Column(String(100), default='IMAGE', nullable=False)
    STATUS = Column(Boolean, default=True, nullable=False)
    REMARK = Column(String(50))

    defect = relationship("TdDefect", back_populates="items")

# ==========================================
# 6. Transactions / Receipts
# ==========================================

class TsReceipt(Base):
    __tablename__ = 'TS_RECEIPT'
    __table_args__ = {'schema': 'PRO'}

    ID = Column(Integer, primary_key=True, autoincrement=True)
    PRO_ID = Column(Integer, ForeignKey('PRO.MP_PROMOTION.ID', ondelete="CASCADE"))
    STORE_CODE = Column(String(10), nullable=False)
    POS_NO = Column(Integer, nullable=False)
    SALES_DATE = Column(DateTime, default=func.now(), nullable=False)
    SHIFT_NO = Column(Integer, nullable=False)
    RECEIPT_NO = Column(Integer, nullable=False)
    COMMON_TRAN = Column(Integer, nullable=False)
    CREATE_DATE = Column(DateTime)

    promotion = relationship("MpPromotion", back_populates="receipts")
    details = relationship("TsReceiptDetail", back_populates="receipt", cascade="all, delete-orphan")
    sales = relationship("TsReceiptSale", back_populates="receipt", cascade="all, delete-orphan")

class TsReceiptDetail(Base):
    __tablename__ = 'TS_RECEIPT_DETAIL'
    __table_args__ = {'schema': 'PRO'}

    TSR_ID = Column(Integer, ForeignKey('PRO.TS_RECEIPT.ID', ondelete="CASCADE"), primary_key=True)
    EJ_LINE_NO = Column(Integer, primary_key=True)
    EJ_LINE = Column(Text)
    UPDATE_DATE = Column(DateTime, default=func.now(), nullable=False)

    receipt = relationship("TsReceipt", back_populates="details")

class TsReceiptSale(Base):
    __tablename__ = 'TS_RECEIPT_SALE'
    __table_args__ = {'schema': 'PRO'}

    ID = Column(Integer, primary_key=True, autoincrement=True)
    TSR_ID = Column(Integer, ForeignKey('PRO.TS_RECEIPT.ID', ondelete="CASCADE"), nullable=False)
    PROMOTION_CODE = Column(Integer, nullable=False)
    QTY = Column(Integer, nullable=False)
    DISCOUNT_AMT = Column(Numeric(18, 3), nullable=False)
    TOTAL_AMT = Column(Numeric(18, 3), nullable=False)
    SUB_TOTAL_AMT = Column(Numeric(18, 3), nullable=False)
    FINAL_TOTAL_AMT = Column(Numeric(18, 3), nullable=False)
    FINAL_SUB_TOTAL_AMT = Column(Numeric(18, 3), nullable=False)
    CREATE_DATE = Column(DateTime, nullable=False)

    receipt = relationship("TsReceipt", back_populates="sales")