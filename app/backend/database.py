# from sqlalchemy import create_engine,MetaData
# from sqlalchemy.orm import sessionmaker, DeclarativeBase
# from app.config import settings,PROMOTION
# import pymysql
# import pyodbc
# from sqlalchemy.ext.declarative import declarative_base
# 'mysql+pymysql://root:mysecretpassword@127.0.0.1:3306/mydatabase'

# engine = create_engine(settings.POSTGRES_URL)
# SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
# metadata_obj = MetaData(schema=PROMOTION)



# Base = declarative_base()
# class Base(DeclarativeBase):
#     __abstract__ = True
#     metadata = metadata_obj
# def get_db():
#     db = SessionLocal()
#     try:
#         yield db
#     finally:
#         db.close()
# class Base_mysql(sessionmaker):
#     engine = create_engine(settings.MYSQL_URL, pool_recycle=3600, pool_pre_ping=True)
#     autocommit=False
#     autoflush=False
#     bind=engine
#     try:
#         yield self
#     finally:
#         db.close()
#     def connection():
#         """ฟังก์ชันสำหรับสร้าง Connection ไปยัง MySQL"""
#         return pymysql.connect(
#             host=settings.MYSQL_URL,
#             user=settings.MYSQL_USER,
#             password=settings.MYSQL_PASSWORD,
#             database=settings.MYSQL_DATABASE,
#             cursorclass=pymysql.cursors.DictCursor 
#         )

# def get_mssql_connection():
#     """ฟังก์ชันสำหรับสร้าง Connection ไปยัง SQL Server (SSMS)"""
#     conn_str = (
#         "DRIVER={ODBC Driver 17 for SQL Server};"
#         f"SERVER={settings.SQLSERVER_URL};"
#         f"DATABASE={settings.SQL_SERVER_DATABASE};"
#         f"UID={settings.SQL_SERVER_URL};"
#         f"PWD={settings.SQL_SERVER_PASSWORD}"
#     )
#     return pyodbc.connect(conn_str)


from sqlalchemy import create_engine, MetaData
from sqlalchemy.orm import sessionmaker, DeclarativeBase
import pymysql
import pyodbc
from app.config import settings, PROMOTION


postgres_engine = create_engine(settings.POSTGRES_URL)
PostgresSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=postgres_engine)
metadata_obj = MetaData(schema=PROMOTION)

class Base(DeclarativeBase):
    """Base Class สำหรับสร้าง Model ของ SQLAlchemy (เวอร์ชัน 2.0)"""
    __abstract__ = True
    metadata = metadata_obj

def get_postgres_db():
    """Dependency สำหรับ Inject PostgreSQL Session เข้าไปใน API"""
    db = PostgresSessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_mysql_connection():
    """ฟังก์ชันสำหรับสร้าง Connection ดิบไปยัง MySQL"""
    return pymysql.connect(
        host=settings.MYSQL_URL,         # ต้องแก้ไขในไฟล์ config ให้รับเป็น IP/Domain เช่น "127.0.0.1"
        user=settings.MYSQL_USER,
        password=settings.MYSQL_PASSWORD,
        database=settings.MYSQL_DATABASE,
        cursorclass=pymysql.cursors.DictCursor 
    )

def get_mssql_connection():
    """ฟังก์ชันสำหรับสร้าง Connection ไปยัง SQL Server (SSMS)"""
    conn_str = (
        "DRIVER={ODBC Driver 17 for SQL Server};"
        f"SERVER={settings.SQL_SERVER_URL};"     # เปลี่ยนให้เป็นตัวแปรเก็บ Host (เช่น "192.168.1.100")
        f"DATABASE={settings.SQL_SERVER_DATABASE};"
        f"UID={settings.SQL_SERVER_USER};"       # แก้ไขจาก URL เป็นตัวแปรที่เก็บ Username
        f"PWD={settings.SQL_SERVER_PASSWORD}"
    )
    return pyodbc.connect(conn_str)


get_db = get_postgres_db
get_db_mysql = get_mysql_connection
get_db_mssql = get_mssql_connection

__ALL__ = ['get_postgres_db','get_mssql_connection','get_mysql_connection','get_db','get_db_mysql','get_db_mssql']