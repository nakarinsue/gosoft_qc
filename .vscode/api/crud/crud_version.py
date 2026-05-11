from sqlalchemy.orm import Session
from sqlalchemy import select
from app.api.models import MVersionControl # นำเข้า Model ที่คุณสร้างไว้
from app.api.schemas.version import VersionCreate

def get_versions(db: Session, skip: int = 0, limit: int = 100):
    # ใช้ SQLAlchemy 2.0 Syntax
    stmt = select(MVersionControl).offset(skip).limit(limit)
    return db.scalars(stmt).all()

def get_version_by_id(db: Session, v_id: int):
    stmt = select(MVersionControl).where(MVersionControl.id == v_id)
    return db.scalars(stmt).first()

def create_version(db: Session, version: VersionCreate, current_user_id: int):
    db_version = MVersionControl(
        **version.model_dump(),
        user_create=current_user_id,
        user_update=current_user_id
    )
    db.add(db_version)
    db.commit()
    db.refresh(db_version)
    return db_version