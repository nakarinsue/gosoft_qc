
from sqlalchemy import create_engine, MetaData
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from ...config import settings, PROMOTION

print(f"--- DEBUG: URL RECEIVED IS '{settings.POSTGRES_URL}' ---")
_postgres_engine = create_engine(settings.POSTGRES_URL)
_PostgresSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=_postgres_engine)
_metadata_obj = MetaData(schema=PROMOTION)

class Base(DeclarativeBase):
    """Base Class สำหรับสร้าง Model ของ SQLAlchemy (เวอร์ชัน 2.0)"""
    __abstract__ = True
    metadata = _metadata_obj
class Views(DeclarativeBase):
    """Base Class สำหรับสร้าง Model ของ SQLAlchemy (เวอร์ชัน 2.0)"""
    __abstract__ = True
    metadata = _metadata_obj
def get_postgres_db():
    """Dependency สำหรับ Inject PostgreSQL Session เข้าไปใน API"""
    db = _PostgresSessionLocal()
    try:
        yield db
    finally:
        db.close()

get_db = get_postgres_db

__ALL__ = ['get_postgres_db','get_db','Base']