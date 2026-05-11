import logging
from datetime import datetime
from typing import List
import pyodbc
from sqlalchemy import create_engine, select, update, and_,or_
from sqlalchemy.orm import Session, sessionmaker
from app.backend.database.models.postgres_models import MPromotionBucketEntity

# ---------------------------------------------------------
# 1. System Config & Logger Setup
# ---------------------------------------------------------
logging.basicConfig(
    level=logging.DEBUG, # ใช้ DEBUG เพื่อดู Log ละเอียดในระดับ Production/Dev
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("PromotionUpdater")

# ---------------------------------------------------------
# 2. Database Service Class
# ---------------------------------------------------------
class PromotionUpdaterService:
    def __init__(self, pg_engine, ssms_conn_string: str):
        """
        :param pg_engine: SQLAlchemy Engine สำหรับ PostgreSQL
        :param ssms_conn_string: Connection String สำหรับ SSMS (pyodbc)
        """
        self.pg_engine = pg_engine
        self.ssms_conn_string = ssms_conn_string
        self.SessionLocal = sessionmaker(bind=self.pg_engine)

    def _check_ssms_connection(self) -> bool:
        """ ตรวจสอบการเชื่อมต่อกับ SSMS Database """
        try:
            logger.debug("Testing SSMS Connection...")
            conn = pyodbc.connect(self.ssms_conn_string, timeout=5)
            conn.close()
            logger.info("SSMS Connection: ONLINE")
            return True
        except Exception as e:
            logger.error(f"SSMS Connection: OFFLINE. Error: {e}")
            return False

    def update_promotion_data(self, target_pro_ids):
        """ 
        Optimized Main Function: อัพเดทข้อมูลแบบ Bulk เพื่อความรวดเร็วสูงสุด
        """
        if not target_pro_ids:
            logger.warning("No pro_ids provided.")
            return

        raw_ids = []
        for item in target_pro_ids:
            if isinstance(item, (set, list, tuple)):
                raw_ids.extend(list(item))
            else:
                raw_ids.append(item)
        safe_pro_ids = list(set(i for i in raw_ids)) 

        logger.info(f"--- STARTING FAST UPDATE FOR {len(safe_pro_ids)} PRO_IDS ---")
        with self.SessionLocal() as pg_session:
            try:
                # 2. ดึง entity_code ทั้งหมดที่เกี่ยวข้องออกมาทีเดียว (Bulk Select)
                # stmt = select(MPromotionBucketEntity.entity_code).where(
                #     MPromotionBucketEntity.pro_id.in_(safe_pro_ids)
                # ).distinct()
                
                # # ใช้ .all() เพื่อดึงข้อมูลออกมาทั้งหมดในครั้งเดียว
                # entity_codes = [row[0] for row in pg_session.execute(stmt).all()]
                
                # if not entity_codes:
                #     logger.info("No entity_codes found to process.")
                #     return

                # 3. ตรวจสอบการเชื่อมต่อ SSMS
                is_ssms_online = self._check_ssms_connection()
                
                # 4. เรียกใช้ฟังก์ชันอัพเดท (แนะนำให้ปรับภายในฟังก์ชันเหล่านี้เป็น Bulk Update ด้วย)
                if is_ssms_online:
                    # ปรับให้ฟังก์ชันนี้ส่งข้อมูลกลับมาเป็น list of dict เพื่อทำ Bulk Update
                    self._update_from_ssms(pg_session, safe_pro_ids)
                else:
                    self._update_from_fallback(pg_session, safe_pro_ids)

                # 5. ยืนยันรายการทั้งหมด
                pg_session.commit()
                logger.info("--- FAST UPDATE COMMITTED SUCCESSFULLY ---")

            except Exception as e:
                pg_session.rollback()
                logger.critical(f"FAST UPDATE FAILED: {e}", exc_info=True)
                raise

    def _update_from_ssms(self, pg_session: Session, entity_codes: List[str]):
        """ 
        Main Flow: อัปเดตข้อมูลสินค้าจาก SSMS เฉพาะรายการที่ยังขาดข้อมูล (Bulk Update)
        """
        logger.info("Executing Optimized Flow: Fetching data from SSMS...")
        
        # 1. กรองเฉพาะ Entity Code ที่เป็นค่าว่าง (ถ้าต้องการเจาะจงเฉพาะกลุ่ม)
        # หรือถ้าต้องการอัปเดตทั้งหมดตามที่ส่งมา ให้ใช้ entity_codes เดิม
        if not entity_codes:
            return

        chunk_size = 100
        try:
            ssms_conn = pyodbc.connect(self.ssms_conn_string)
            cursor = ssms_conn.cursor()
        except Exception as e:
            logger.error(f"Failed to open SSMS connection: {e}")
            raise e

        try:
            for i in range(0, len(entity_codes), chunk_size):
                chunk = entity_codes[i:i + chunk_size]
                
                # 2. Query ข้อมูลจาก SSMS
                placeholders = ','.join(['?'] * len(chunk))
                sql = f"""
                    SELECT 
                        P.PRODUCT_CODE,
                        MAX(PS.SALE_PRICE) AS PRICE,
                        MAX(P.PRODUCT_NAME) AS NAME,
                        MAX(PS.BARCODE) AS BC
                    FROM POSG2..MS_PRODUCT AS P 
                    JOIN POSG2..MS_PRICE_SALE AS PS ON P.PRODUCT_CODE = PS.PRODUCT_CODE
                    WHERE P.PRODUCT_CODE IN ({placeholders})
                    GROUP BY P.PRODUCT_CODE
                """
                cursor.execute(sql, chunk)
                rows = cursor.fetchall()
                
                if not rows:
                    continue

                # 3. เตรียมข้อมูลสำหรับ Bulk Update
                # เราจะใช้การ Update แบบระบุตัวตนด้วย Mapping
                update_data_list = []
                now = datetime.now()

                for row in rows:
                    p_code, p_price, p_name, p_barcode = row
                    
                    # ค้นหา Record ใน PG ที่มี entity_code นี้ และอยู่ใน pro_id ที่กำหนด
                    # หมายเหตุ: bulk_update_mappings จะเร็วที่สุดเมื่อทำงานผ่าน Primary Key
                    # แต่ในกรณีนี้เราจะใช้การสั่ง Update ปกติที่รวมเป็น Batch
                    
                    update_stmt = update(MPromotionBucketEntity).where(
                        and_(
                            MPromotionBucketEntity.entity_code == p_code,
                            or_(
                                MPromotionBucketEntity.product_name == None,
                                MPromotionBucketEntity.product_name == '',
                                MPromotionBucketEntity.barcode == None,
                                MPromotionBucketEntity.barcode == ''
                            )
                        )
                    ).values(
                        product_name=p_name,
                        product_price=str(p_price) if p_price else None,
                        barcode=p_barcode,
                        date_update=now,
                        product_package="SSMS_BULK"
                    )
                    
                    pg_session.execute(update_stmt)

                logger.debug(f"Chunk {i//chunk_size + 1} processed.")

        finally:
            ssms_conn.close()

    def _update_from_fallback(self, pg_session: Session, entity_codes: List[str]):
        """ Fallback Flow: SSMS ล่ม ดึงข้อมูลจาก m_promotion_bucket_entity (pro_id อื่นๆ) แทน """
        logger.warning("Executing Fallback Flow: Fetching existing data from PostgreSQL...")
        
        # ค้นหา Master Data จำเป็น จาก pro_id อื่นๆ ในระบบ
        fallback_data = {}
        for code in entity_codes:
            # ดึงข้อมูลล่าสุด 1 ตัว ที่มี entity_code ตรงกัน, มี barcode และไม่ใช่ pro_id ที่กำลังอัพเดท
            stmt = select(MPromotionBucketEntity).where(
                and_(
                    MPromotionBucketEntity.entity_code == code,
                    MPromotionBucketEntity.barcode.is_not(None),
                    MPromotionBucketEntity.barcode != ''
                )
            ).order_by(MPromotionBucketEntity.date_update.desc()).limit(1)
            
            ref_entity = pg_session.execute(stmt).scalars().first()
            
            if ref_entity:
                fallback_data[code] = {
                    "product_name": ref_entity.product_name,
                    "product_price": ref_entity.product_price,
                    "barcode": ref_entity.barcode,
                    "ref_pro_id": ref_entity.pro_id
                }

        if not fallback_data:
            logger.info("No fallback data available in PostgreSQL.")
            return

        logger.debug(f"Found {len(fallback_data)} fallback records to apply.")

        # ทำการ Update ลง PostgreSQL
        for code, data in fallback_data.items():
            package_stamp = f"POSTGRES (Ref:{data['ref_pro_id']})" # ระบุที่มาว่ายืมมาจาก pro_id ไหน
            
            update_stmt = update(MPromotionBucketEntity).where(
                MPromotionBucketEntity.entity_code == code
            ).values(
                product_name=data["product_name"],
                product_price=data["product_price"],
                barcode=data["barcode"],
                date_update=datetime.now(),
                product_package=package_stamp
            )
            
            pg_session.execute(update_stmt)
            
        logger.info(f"Fallback update completed for {len(fallback_data)} distinct entity codes.")

