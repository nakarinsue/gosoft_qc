from sqlalchemy import Integer, String, Date, Text, DateTime,Boolean
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime, date
from typing import Optional
from ..common.connet_database_postgres import Views as Base
from ...config import settings

POSTGRE_SCHEMA = settings.POSTGRES_DB
# ==========================================
# View: vw_prmotion_information
# ==========================================
class vwfileinformation(Base):
    __tablename__ = "vw_file_information"
    __table_args__ = {"schema": POSTGRE_SCHEMA, "extend_existing": True}

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    version_id: Mapped[Optional[int]] = mapped_column(Integer)
    file_name: Mapped[Optional[str]] = mapped_column(String)
    sheet: Mapped[Optional[str]] = mapped_column(String)
    status: Mapped[Optional[int]] = mapped_column(Integer)
    r_row: Mapped[Optional[int]] = mapped_column(Integer)
    w_row: Mapped[Optional[int]] = mapped_column(Integer)
    description: Mapped[Optional[str]] = mapped_column(String)
    user_mk: Mapped[Optional[str]] = mapped_column(String)
    name: Mapped[Optional[str]] = mapped_column(String)


class vwsummaryfileimport(Base):

    __tablename__ = "vw_summary_file_import"
    __table_args__ = {"schema": POSTGRE_SCHEMA
                      , "extend_existing": True}

    version_no: Mapped[int] = mapped_column(Integer, primary_key=True)
    version_id: Mapped[int] = mapped_column(Integer)
    title: Mapped[Optional[str]] = mapped_column(String)
    description: Mapped[Optional[str]] = mapped_column(String)
    file_name: Mapped[Optional[int]] = mapped_column(Integer) 
    sheet: Mapped[Optional[int]] = mapped_column(Integer)
    r_row: Mapped[Optional[int]] = mapped_column(Integer)
    ww_row: Mapped[Optional[int]] = mapped_column(Integer)
    read_row: Mapped[Optional[int]] = mapped_column(Integer)


class vwfileimport(Base):
    __tablename__ = "vw_file_import"
    __table_args__ = {"schema": POSTGRE_SCHEMA
                      , "extend_existing": True}
    version_no: Mapped[int] = mapped_column(Integer)
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    version_id: Mapped[Optional[int]] = mapped_column(Integer)
    file_name: Mapped[Optional[str]] = mapped_column(String)
    sheet: Mapped[Optional[str]] = mapped_column(String)
    status: Mapped[Optional[int]] = mapped_column(Integer)
    r_row: Mapped[Optional[int]] = mapped_column(Integer)
    w_row: Mapped[Optional[int]] = mapped_column(Integer)
    description: Mapped[Optional[str]] = mapped_column(String)
    user_mk: Mapped[Optional[str]] = mapped_column(String)
    name: Mapped[Optional[str]] = mapped_column(String)

class VwVersionInformation(Base):
    __tablename__ = "vw_version_information"
    __table_args__ = {"schema": POSTGRE_SCHEMA
                      , "extend_existing": True}

    # กำหนด id เป็น Primary Key หลอกเพื่อให้ SQLAlchemy ทำงานได้
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    version_id: Mapped[Optional[int]] = mapped_column(Integer)
    sr_no: Mapped[Optional[str]] = mapped_column(String)
    title: Mapped[Optional[str]] = mapped_column(String)
    sub_title: Mapped[Optional[str]] = mapped_column(String)
    detail: Mapped[Optional[str]] = mapped_column(String)
    sr_link_url: Mapped[Optional[str]] = mapped_column(String)
    lp_no: Mapped[Optional[str]] = mapped_column(String)
    status: Mapped[Optional[int]] = mapped_column(Integer)
    description: Mapped[Optional[str]] = mapped_column(String)
    name: Mapped[Optional[str]] = mapped_column(String)

class VwExportFile(Base):
    """
    SQLAlchemy Model for the PostgreSQL View: PROMOTION_TEST.vw_export_file
    Note: This is a read-only view.
    """
    __tablename__ = "vw_export_file"
    __table_args__ = {"schema": POSTGRE_SCHEMA
                      , "extend_existing": True}

    promotion_code: Mapped[str] = mapped_column("Promotion Code", String(50), primary_key=True)
    promotion_name: Mapped[Optional[str]] = mapped_column("Promotion Name", String(200))
    active_from: Mapped[Optional[datetime]] = mapped_column("Active From", DateTime)
    active_to: Mapped[Optional[datetime]] = mapped_column("Active To", DateTime)
    limit_tran: Mapped[Optional[int]] = mapped_column("LIMIT", Integer)
    bucket: Mapped[int] = mapped_column("BUCKET", Integer)
    trigger_value: Mapped[Optional[str]] = mapped_column("TRIGGER", String(50))
    attachment_mode: Mapped[Optional[str]] = mapped_column("AttachmentMode", String(50))    
    entity_code: Mapped[str] = mapped_column("Entity Code", String(50), primary_key=True)
    entity_name: Mapped[Optional[str]] = mapped_column("Entity Name", String(200))
    barcode: Mapped[Optional[str]] = mapped_column("BARCODE", String(50))
    barcode_code39: Mapped[Optional[str]] = mapped_column("BARCODE CODE39", String(50))
    reward_type: Mapped[Optional[str]] = mapped_column("Reward Type", String(50))
    reward_value: Mapped[Optional[str]] = mapped_column("Reward Value", String(50))
    notes: Mapped[Optional[str]] = mapped_column("NOTES", Text)
    coupon_id: Mapped[Optional[str]] = mapped_column("Coupon ID", String(50))
    coupon_code39: Mapped[Optional[str]] = mapped_column("COUPON CODE39", String(50))
    reward_ma_id: Mapped[Optional[str]] = mapped_column("Reward MA ID", String(50))
    reward_ma_name: Mapped[Optional[str]] = mapped_column("Reward MA Name", String(200))
    sheet: Mapped[Optional[str]] = mapped_column("SHEET", String(100))
    worksheet: Mapped[Optional[str]] = mapped_column("WORKSHEET", String(200))
    optimal_date: Mapped[Optional[datetime]] = mapped_column("OPTIMAL_DATE", DateTime)
    file_id: Mapped[Optional[datetime]] = mapped_column("file_id", Integer)
    version_id: Mapped[Optional[datetime]] = mapped_column("verion_id", Integer)



class VwPromotionInformation(Base):
    __tablename__ = "vw_prmotion_information"
    __table_args__ = {"schema": POSTGRE_SCHEMA
                      , "extend_existing": True}

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    file_id: Mapped[Optional[int]] = mapped_column(Integer)
    promotion_code: Mapped[Optional[int]] = mapped_column(Integer)
    promotion_name: Mapped[Optional[str]] = mapped_column(String)
    promotion_receipt_name: Mapped[Optional[str]] = mapped_column(String)
    promotion_type: Mapped[Optional[str]] = mapped_column(String)
    promotion_group: Mapped[Optional[str]] = mapped_column(String)
    promotion_status: Mapped[Optional[str]] = mapped_column(String)
    promotion_level: Mapped[Optional[int]] = mapped_column(Integer)
    
    start_date: Mapped[Optional[date]] = mapped_column(Date)
    end_date: Mapped[Optional[date]] = mapped_column(Date)
    
    reward_value: Mapped[Optional[str]] = mapped_column(String)
    reward_type: Mapped[Optional[str]] = mapped_column(String)
    reward_ma: Mapped[Optional[str]] = mapped_column(String)
    reward_name: Mapped[Optional[str]] = mapped_column(String)
    
    limit_transation: Mapped[Optional[int]] = mapped_column(Integer)
    limit_day: Mapped[Optional[int]] = mapped_column(Integer)
    limit_item: Mapped[Optional[int]] = mapped_column(Integer)
    limit_redemp: Mapped[Optional[int]] = mapped_column(Integer)
    
    member_tier: Mapped[Optional[str]] = mapped_column(String)
    member_segment: Mapped[Optional[str]] = mapped_column(String)
    member_requ: Mapped[Optional[str]] = mapped_column(String)
    notes: Mapped[Optional[str]] = mapped_column(Text)


# ==================================================================
# 4. View: VW_DEFECT_INFORMATION
# ==================================================================
class VwDefectInformation(Base):
    __tablename__ = "vw_defect_information"
    __table_args__ = {"schema": POSTGRE_SCHEMA
                      , "extend_existing": True}

    # ใช้ id ของ t_Defect เป็น Primary Key
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    version_id: Mapped[Optional[int]] = mapped_column(Integer)
    promotion_code: Mapped[Optional[int]] = mapped_column(Integer)
    promotion_name: Mapped[Optional[str]] = mapped_column(String)
    remark: Mapped[Optional[str]] = mapped_column(String)
    title: Mapped[Optional[str]] = mapped_column(String)
    detail: Mapped[Optional[str]] = mapped_column(String)
    user_mk: Mapped[Optional[str]] = mapped_column(String)
    status: Mapped[Optional[int]] = mapped_column(Integer)
    user_upde: Mapped[Optional[str]] = mapped_column(String)
    user_create: Mapped[Optional[str]] = mapped_column(String)
    file_name: Mapped[Optional[str]] = mapped_column(String)
    sheet: Mapped[Optional[str]] = mapped_column(String)
    system: Mapped[Optional[str]] = mapped_column(String)

    condition_id: Mapped[Optional[int]] = mapped_column(Integer)
    barcode: Mapped[Optional[str]] = mapped_column(String)
    coupon: Mapped[Optional[str]] = mapped_column(String)
    mode: Mapped[Optional[str]] = mapped_column(String)
    other: Mapped[Optional[int]] = mapped_column(Integer, primary_key=True)
    
    entity_code: Mapped[Optional[str]] = mapped_column(String, primary_key=True)
    entity_name: Mapped[Optional[str]] = mapped_column(String)
    pro_id: Mapped[Optional[int]] = mapped_column(Integer)


# ==================================================================
# 5. View: VW_TRANSATION (อิงตามชื่อ SQL ของคุณ)
# ==================================================================

class VwTransaction(Base):
    __tablename__ = "vw_transation"
    __table_args__ = {"schema": POSTGRE_SCHEMA
                      , "extend_existing": True}

    # ใช้ id (จาก vw_pi.id) เป็น Primary Key หลอก
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    version_id: Mapped[Optional[int]] = mapped_column(Integer)
    file_name: Mapped[Optional[str]] = mapped_column(String)
    mk_name: Mapped[Optional[str]] = mapped_column(String)
    sheet_name: Mapped[Optional[str]] = mapped_column(String)
    pro_code: Mapped[Optional[int]] = mapped_column(Integer)
    pro_name: Mapped[Optional[str]] = mapped_column(String)
    description: Mapped[Optional[str]] = mapped_column(String)
    store_code: Mapped[Optional[str]] = mapped_column(String)
    # สังเกตการตั้งชื่อตรงนี้จะใช้ start และ end ตาม Alias ที่คุณตั้งไว้
    start: Mapped[Optional[date]] = mapped_column(Date)
    end: Mapped[Optional[date]] = mapped_column(Date)
    coupon: Mapped[Optional[str]] = mapped_column(String)
    
    # ผลลัพธ์จากการ COUNT() จะเป็น Integer
    status_defect: Mapped[Optional[int]] = mapped_column(Integer)
    status_trasation: Mapped[Optional[int]] = mapped_column(Integer)


class vwfileassign(Base):
    __tablename__ = "vw_file_assign"
    __table_args__ = {"schema": POSTGRE_SCHEMA,
                      'extend_existing': True}

    # ใช้ id (จาก vw_pi.id) เป็น Primary Key หลอก
    file_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    pro_code_count: Mapped[int] = mapped_column(Integer)
    user_assign:  Mapped[Optional[int]] = mapped_column(Integer)
    date_assign: Mapped[datetime] = mapped_column(DateTime)
    version_no: Mapped[int] = mapped_column(Integer)
    version_id: Mapped[Optional[int]] = mapped_column(Integer)
    file_name: Mapped[Optional[str]] = mapped_column(String)
    sheet: Mapped[Optional[str]] = mapped_column(String)




 # ==================================================================
# 4. View: VW_DEFECT_INFORMATION
# ==================================================================
class pma_entity(Base):
    __tablename__ = "vw_pma_entity"
    __table_args__ = {"schema": POSTGRE_SCHEMA
                      , "extend_existing": True}

    # ใช้ id ของ t_Defect เป็น Primary Key
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    file_id: Mapped[int] = mapped_column(Integer)
    
    pro_code: Mapped[int] = mapped_column(Integer)
    pro_name: Mapped[str] = mapped_column(String)
    pro_receipt_name: Mapped[str] = mapped_column(String)
    pro_type: Mapped[str] = mapped_column(String)
    pro_group: Mapped[str] = mapped_column(String)
    pro_status: Mapped[str] = mapped_column(String)
    pro_level: Mapped[int] = mapped_column(Integer)
    
    start_date: Mapped[date] = mapped_column(Date)
    end_date: Mapped[date] = mapped_column(Date)
    update_date: Mapped[Optional[date]] = mapped_column(Date)
    
    reward_value: Mapped[Optional[str]] = mapped_column(String)
    reward_type: Mapped[Optional[str]] = mapped_column(String)
    reward_ma: Mapped[Optional[str]] = mapped_column(String)
    reward_name: Mapped[Optional[str]] = mapped_column(String)
    
    limit_tran: Mapped[Optional[int]] = mapped_column(Integer)
    limit_day: Mapped[Optional[int]] = mapped_column(Integer)
    limit_item: Mapped[Optional[int]] = mapped_column(Integer)
    limit_redemp: Mapped[Optional[int]] = mapped_column(Integer)
    
    member_tier: Mapped[Optional[str]] = mapped_column(String)
    member_segm: Mapped[Optional[str]] = mapped_column(String)
    member_requ: Mapped[Optional[str]] = mapped_column(String)
    notes: Mapped[str] = mapped_column(Text)

    indexs: Mapped[Optional[int]] = mapped_column(Integer)
    rec_date: Mapped[Optional[date]] = mapped_column(Date)
    
    sun_fg: Mapped[Optional[bool]] = mapped_column(Boolean)
    mon_fg: Mapped[Optional[bool]] = mapped_column(Boolean)
    tue_fg: Mapped[Optional[bool]] = mapped_column(Boolean)
    wed_fg: Mapped[Optional[bool]] = mapped_column(Boolean)
    thu_fg: Mapped[Optional[bool]] = mapped_column(Boolean)
    sat_fg: Mapped[Optional[bool]] = mapped_column(Boolean)
    fri_fg: Mapped[Optional[bool]] = mapped_column(Boolean)
    spec_fg: Mapped[Optional[bool]] = mapped_column(Boolean) 
    exclud_fg: Mapped[Optional[bool]] = mapped_column(Boolean)
    
    state: Mapped[int] = mapped_column(Integer)
    export: Mapped[bool] = mapped_column(Boolean)
    description: Mapped[Optional[str]] = mapped_column(Text)

    date_update: Mapped[datetime] = mapped_column(DateTime)
    user_update: Mapped[int] = mapped_column(Integer) 
    date_assign: Mapped[Optional[datetime]] = mapped_column(DateTime)
    user_assign: Mapped[Optional[int]] = mapped_column(Integer)
    coupon_mapping: Mapped[Optional[str]] = mapped_column(String)
