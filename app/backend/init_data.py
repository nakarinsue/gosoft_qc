from sqlalchemy import select, text
from sqlalchemy.orm import Session
from app.backend.database import postgres_engine, Base, PostgresSessionLocal
from app.backend.models.postgres._base_on import MaUser
from app.backend.auth import get_password_hash
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_default_admin(db: Session):
    """
    ฟังก์ชันสำหรับตรวจสอบและสร้าง User Admin เริ่มต้น
    """
    try:
        stmt = select(MaUser).where(MaUser.username == "admin")
        admin_user = db.scalar(stmt)
        if admin_user:
            logger.info("✅ Admin user already exists.")
            return
        logger.info("⚠️ Admin user not found. Creating default admin...")
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
        logger.error(f"❌ Error creating default admin: {e}")
        db.rollback()

def init_db():
    """
    ฟังก์ชันหลักที่จะถูกเรียกเมื่อ Start Server
    """
    try:
        with postgres_engine.begin() as conn:
            conn.execute(text('CREATE SCHEMA IF NOT EXISTS "PROMOTION";'))
            logger.info("✅ Schema 'PROMOTION' checked/created.")
        Base.metadata.create_all(bind=postgres_engine)
        logger.info("✅ Tables created successfully.")
        with PostgresSessionLocal() as db:
            create_default_admin(db)
    except Exception as e:
        logger.error(f"❌ Critical Error during DB Initialization: {e}")