from sqlalchemy import select, text
from sqlalchemy.orm import Session
from .connet_database_postgres import _postgres_engine, Base, _PostgresSessionLocal
from ..models.postgres_models import MaUser
from ...auth.security  import get_password_hash
import logging
from ...config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
POSTGRE_SCHEMA = settings.POSTGRES_DB
def get_view_queries():
    """รวบรวมคำสั่ง SQL สำหรับสร้าง View โดยเรียงลำดับตาม Dependency"""
    return [
        # --- Level 1: Base Views (ไม่มีการ join view อื่น) ---
        f"""
        DO $$ 
        DECLARE r RECORD;
        BEGIN
            FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = '{POSTGRE_SCHEMA}' AND tablename LIKE 'vw_%') LOOP
                EXECUTE 'DROP TABLE IF EXISTS "{POSTGRE_SCHEMA}".' || quote_ident(r.tablename) || ' CASCADE';
            END LOOP;
        END $$;
        """,
        f"""
        CREATE OR REPLACE VIEW "{POSTGRE_SCHEMA}".VW_FILE_INFORMATION AS ( 
            SELECT mfm.id, mfm.v_id AS version_id, mfm.file_name, mfm.sheet, mfm.status, mfm.r_row, mfm.w_row, mfm.description, mfm.user_mk, uu."name"   
            FROM "{POSTGRE_SCHEMA}".m_file_master AS mfm 
            JOIN "{POSTGRE_SCHEMA}".u_user AS uu ON uu.user_id = mfm.user_create 
        );
        """,
        f"""
        CREATE OR REPLACE VIEW "{POSTGRE_SCHEMA}".VW_VERSION_INFORMATION AS (
            SELECT miif.id, mvc.id AS version_id, mvc.sr_no, mvc.title, mvc.sub_title, mvc.detail, mvc.sr_link_url, mvc.lp_no, mvc.status, miif.description, uu."name"   
            FROM "{POSTGRE_SCHEMA}".m_version_control AS mvc  
            JOIN "{POSTGRE_SCHEMA}".m_info_import_file AS miif ON mvc.id = miif.v_id  
            JOIN "{POSTGRE_SCHEMA}".u_user AS uu ON uu.user_id = mvc.user_create  
        );
        """,
        f"""
        CREATE OR REPLACE VIEW "{POSTGRE_SCHEMA}".VW_PRMOTION_INFORMATION AS (  
            SELECT MAX(id) AS id, MAX(file_id) AS File_id, MAX(pro_code) AS promotion_code, MAX(pro_name) AS promotion_name, 
            MAX(pro_receipt_name) AS promotion_receipt_name, MAX(pro_type) AS promotion_type, MAX(pro_group) AS promotion_group, 
            MAX(pro_status) AS promotion_status, MAX(pro_level) AS promotion_level, MAX(start_date) AS start_date, MAX(end_date) AS end_date,
            MAX(reward_value) AS reward_value, MAX(reward_type) AS reward_type, MAX(reward_ma) AS reward_ma, MAX(reward_name) AS reward_name, 
            MAX(limit_tran) AS limit_transation, MAX(limit_day) AS limit_day, MAX(limit_item) AS limit_item, MAX(limit_redemp) AS limit_redemp, 
            MAX(member_tier) AS member_tier, MAX(member_segm) AS member_segment, MAX(member_requ) AS member_requ, MAX(notes) AS notes
            FROM "{POSTGRE_SCHEMA}".m_promotion_header GROUP BY pro_code 
        );
        """,

        # --- Level 2: Derived Views (Join กับ View ใน Level 1) ---
        f"""
        CREATE OR REPLACE VIEW "{POSTGRE_SCHEMA}".VW_SUMMARY_FILE_IMPORT AS (  
            SELECT vfi.version_id AS version_no, vvi.version_id, vvi.title, vvi.description, 
            COUNT(DISTINCT vfi.file_name) AS file_name, COUNT(DISTINCT vfi.sheet) AS sheet,
            SUM(vfi.r_row) AS r_row, SUM(vfi.w_row) AS ww_row,
            SUM(vfi.r_row) FILTER (WHERE vfi.status = 4) AS read_row
            FROM "{POSTGRE_SCHEMA}".VW_FILE_INFORMATION AS vfi 
            JOIN "{POSTGRE_SCHEMA}".VW_VERSION_INFORMATION AS vvi ON vfi.version_id = vvi.id 
            GROUP BY vfi.version_id, vvi.version_id, vvi.title, vvi.description
        );
        """,
        f"""
        CREATE OR REPLACE VIEW "{POSTGRE_SCHEMA}".VW_FILE_IMPORT AS (  
            SELECT vvi.version_id AS version_no, vfi.*
            FROM "{POSTGRE_SCHEMA}".VW_FILE_INFORMATION AS vfi 
            JOIN "{POSTGRE_SCHEMA}".VW_VERSION_INFORMATION AS vvi ON vfi.version_id = vvi.id 
        );
        """,
        f"""
        CREATE OR REPLACE VIEW "{POSTGRE_SCHEMA}".VW_DEFECT_INFORMATION AS (  
            SELECT fi.version_id, td.id, h.pro_code AS PROMOTION_CODE, h.pro_name AS PROMOTION_NAME, td.remark, td.title, td.description AS detail, fi.user_mk,
            td.status, uu."name" AS user_upde, uv."name" AS user_create, fi.file_name, fi.sheet, vi.description AS system, mpbe.t_id, mpbe.d_id, 
            mpbe.coupon, mpbe.barcode, mpbe.condition_id, mpbe.mode, dd.name AS other, mpbe.entity_code, mpbe.entity_name, td.pro_id 
            FROM "{POSTGRE_SCHEMA}"."t_Defect" AS td 
            LEFT JOIN "{POSTGRE_SCHEMA}"."t_Defect_item" AS dd ON td.id = dd.df_id 
            JOIN "{POSTGRE_SCHEMA}".m_promotion_header h ON td.pro_id = h.id  
            JOIN "{POSTGRE_SCHEMA}".VW_FILE_INFORMATION fi ON fi.id = h.file_id 
            JOIN "{POSTGRE_SCHEMA}".VW_VERSION_INFORMATION vi ON vi.id = fi.version_id 
            JOIN "{POSTGRE_SCHEMA}".u_user AS uu ON uu.user_id = td.user_create 
            JOIN "{POSTGRE_SCHEMA}".u_user AS uv ON uv.user_id = td.user_update 
            JOIN "{POSTGRE_SCHEMA}".m_promotion_bucket_entity AS mpbe ON td.pro_id = mpbe.pro_id AND td.id = mpbe.d_id 
        );
        """,
        
        # --- Level 3: Advanced Logic Views ---
       f"""
        CREATE OR REPLACE VIEW "{POSTGRE_SCHEMA}".VW_FILE_assign AS (  
            WITH PromotionCounts AS (
                SELECT file_id, COUNT(pro_code) AS pro_code_count, MAX(user_assign) AS user_assign, MAX(date_assign) AS date_assign
                FROM "{POSTGRE_SCHEMA}".m_promotion_header WHERE user_assign IS NULL GROUP BY file_id
            )
            SELECT pc.*, fi.version_id, fi.version_no, fi.file_name, fi.sheet
            FROM "{POSTGRE_SCHEMA}".VW_FILE_IMPORT AS fi
            INNER JOIN PromotionCounts AS pc ON fi.id = pc.file_id
        );
        """,
        f"""
        CREATE OR REPLACE VIEW "{POSTGRE_SCHEMA}".vw_transation AS (  
            SELECT DISTINCT vw_pi.id, vw_fi.version_id, vw_fi.file_name, vw_fi.user_mk AS mk_name, 
            vw_fi.sheet AS sheet_name, vw_pi.pro_code, vw_pi.pro_name, vw_pi.start_date AS start, 
            vw_pi.end_date AS "end", vw_pb.coupon, tt.description, tt.store_code,
            COUNT(DISTINCT td.pro_id) AS status_defect, COUNT(DISTINCT tt.pro_id) AS status_trasation
            FROM "{POSTGRE_SCHEMA}".VW_FILE_INFORMATION AS vw_fi
            JOIN "{POSTGRE_SCHEMA}".m_promotion_header AS vw_pi ON vw_pi.file_id = vw_fi.id 
            JOIN "{POSTGRE_SCHEMA}".m_promotion_bucket_entity AS vw_pb ON vw_pi.id = vw_pb.pro_id 
            LEFT JOIN "{POSTGRE_SCHEMA}"."t_Defect" AS td ON td.pro_id = vw_pi.id  
            LEFT JOIN "{POSTGRE_SCHEMA}"."t_transaction" AS tt ON tt.pro_id = vw_pi.id 
            GROUP BY vw_pi.id, vw_fi.file_name, vw_fi.user_mk, vw_fi.sheet, vw_pi.pro_code, 
            vw_pi.pro_name, vw_pi.start_date, vw_fi.version_id, tt.store_code, vw_pi.end_date, tt.description, vw_pb.coupon
        );
        """,
        f"""
        CREATE OR REPLACE VIEW "{POSTGRE_SCHEMA}".vw_export_file AS (  
            SELECT vfi.pro_code AS "Promotion Code", vfi.pro_name AS "Promotion Name", vfi.start_date AS "Active From",
            vfi.end_date AS "Active To", vfi.limit_tran AS "LIMIT", mpbe.bucket AS "BUCKET", mpbe.trigger_value AS "TRIGGER",
            INITCAP(mpbe."mode") AS "AttachmentMode", mpbe.entity_code AS "Entity Code", mpbe.entity_name AS "Entity Name",
            mpbe.barcode AS "BARCODE", COALESCE('*' || NULLIF (mpbe.barcode,'') || '*', '') AS "BARCODE CODE39",
            REGEXP_REPLACE(vfi.reward_type, '[ /]', '', 'g') AS "Reward Type", vfi.reward_value AS "Reward Value",
            vfi.notes AS "NOTES", mpbe.coupon AS "Coupon ID", cou.coupon AS "COUPON CODE39", vfi.reward_ma AS "Reward MA ID",
            vfi.reward_name AS "Reward MA Name", mfm.sheet AS "SHEET", mfm.file_name AS "WORKSHEET",
            vfi.start_date AS "OPTIMAL_DATE", mfm.v_id AS "verion_id", mfm.id AS "file_id"
            FROM "{POSTGRE_SCHEMA}".m_file_master AS mfm   
            JOIN "{POSTGRE_SCHEMA}".m_promotion_header AS vfi ON vfi.file_id = mfm.id    
            JOIN "{POSTGRE_SCHEMA}".m_promotion_bucket_entity AS mpbe ON vfi.id = mpbe.pro_id  
            LEFT JOIN (
                SELECT pro_id, COALESCE('*' || MAX(coupon) || '*', '') AS coupon
                FROM "{POSTGRE_SCHEMA}".m_promotion_bucket_entity WHERE coupon != '' GROUP BY pro_id  
            ) AS cou ON mpbe.pro_id = cou.pro_id 
        );
        """
    ]
def create_default_admin(db: Session):
    """
    ฟังก์ชันสำหรับตรวจสอบและสร้าง User Admin เริ่มต้น
    """
    try:
        stmt = select(MaUser).where(MaUser.username == "admin")
        admin_user = db.scalar(stmt)
        if admin_user:
            logger.info("Admin user already exists.")
            return
        logger.info("Admin user not found. Creating default admin...")
        new_admin = MaUser(
            username="admin",
            name="System Administrator",
            email="admin@gosoft.co.th",
            password_hash=get_password_hash("admin"), 
            role="admin", 
            is_active=True,
            is_deleted=False,
            ip_address='',
            allmember=''
        )

        db.add(new_admin)
        db.commit()
        db.refresh(new_admin)
        logger.info(f"✅ Default admin created successfully. ID: {new_admin.user_id}")
    except Exception as e:
        logger.error(f"Error creating default admin: {e}")
        db.rollback()

def init_db():
    """
    ฟังก์ชันหลักที่จะถูกเรียกเมื่อ Start Server
    """
    try:
        # 1. เตรียม Schema หลัก
        with _postgres_engine.begin() as conn:
            actual_schema = settings.POSTGRES_DB
            conn.execute(text(f'CREATE SCHEMA IF NOT EXISTS "{actual_schema}";'))
            logger.info(f"✅ Schema '{actual_schema}' prepared.")

        # 2. สร้าง Tables (ดัก Error รายตารางถ้าเป็นไปได้ หรือดักรวมและข้าม)
        try:
            views_to_remove = [
                table_name for table_name in Base.metadata.tables 
                if table_name.lower().startswith("vw_")
            ]

            for view_name in views_to_remove:
                del Base.metadata.tables[view_name]
                logger.info(f"🔍 Excluded '{view_name}' from table creation (Identified as View).")
            # ----------------------------------------------------------------------

            # 2. สร้างเฉพาะตารางจริงที่เหลืออยู่ (Tables ที่ไม่ใช่ vw_)
            Base.metadata.create_all(bind=_postgres_engine)
            logger.info("✅ Core tables created successfully.")
        except Exception as table_err:
            logger.error(f"⚠️ Table Creation Error (Some tables might be missing): {table_err}")
            # ข้ามไปทำส่วนอื่นต่อ

        # 3. สร้าง Default Admin
        try:
            with _PostgresSessionLocal() as db:
                create_default_admin(db)
                logger.info("✅ Default admin check completed.")
        except Exception as admin_err:
            logger.error(f"⚠️ Admin Creation Error (Skipped): {admin_err}")

        # 4. สร้าง Views (ดัก Error และข้ามรายตัวตามที่ตกลงกันไว้)
        with _postgres_engine.connect() as conn:
            for query in get_view_queries():
                try:
                    conn.execute(text(query))
                    conn.commit()
                except Exception as view_err:
                    logger.warning(f"⚠️ View Error (Skipped): {view_err}")
                    conn.rollback()
                    continue
            logger.info("✅ View initialization process completed.")

    except Exception as e:
        # ดัก Error ร้ายแรงที่สุดที่ทำให้รัน Logic ด้านบนไม่ได้เลย
        logger.error(f"❌ Critical Failure in init_db: {e}")
        raise e
