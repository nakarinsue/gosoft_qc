from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
# นำเข้า Base ที่คุณสร้างไว้ในไฟล์ models ของคุณ (สมมติว่าอยู่ใน app.models)
# หรือถ้ายังไม่มี ให้ประกาศ Base = declarative_base() ที่นี่ได้เลย
from sqlalchemy.orm import declarative_base
# ---------------------------------------------------------
# 1. กำหนด URL สำหรับเชื่อมต่อฐานข้อมูล
# ---------------------------------------------------------
# ตัวอย่างสำหรับ PostgreSQL:
# SQLALCHEMY_DATABASE_URL = "postgresql://username:password@localhost:5432/your_database"
#
# ตัวอย่างสำหรับ Microsoft SQL Server (ใช้ pyodbc):
# SQLALCHEMY_DATABASE_URL = "mssql+pyodbc://sa:password@localhost/your_database?driver=ODBC+Driver+17+for+SQL+Server"

# สมมติ URL ชั่วคราว (ในการทำงานจริงระดับองค์กร ควรดึงค่านี้จากไฟล์ .env)
SQLALCHEMY_DATABASE_URL = "postgresql+psycopg2://sa:Admin2000@localhost:5432/PROMOTION"

# ---------------------------------------------------------
# 2. สร้าง Engine
# ---------------------------------------------------------
# Engine เป็นตัวจัดการ Connection Pool ไปยังฐานข้อมูล
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    # pool_pre_ping=True ช่วยเช็คว่า Connection ยังรอดอยู่ไหมก่อนใช้งาน (ลดปัญหา DB หลุด)
    pool_pre_ping=True 
)

# ---------------------------------------------------------
# 3. สร้าง Session Local
# ---------------------------------------------------------
# ใช้สร้าง instance ของ database session สำหรับแต่ละ Request
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# หากในไฟล์ models ของคุณยังไม่ได้ประกาศ Base ให้เปิดใช้งานบรรทัดนี้
Base = declarative_base()

# ---------------------------------------------------------
# 4. Dependency Function (get_db)
# ---------------------------------------------------------
# ฟังก์ชันนี้จะถูกเรียกใช้โดย FastAPI (ผ่าน Depends) เพื่อเปิดและปิด Session อัตโนมัติ
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()