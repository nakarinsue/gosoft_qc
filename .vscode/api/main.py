from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# นำเข้า Routers ทั้งหมดที่เราสร้างไว้
from app.api.routers import auth, user, version, promotion
from app.api.routers import entity, defect, transaction, report
# กำหนดรายละเอียดของ API (จะไปแสดงใน Swagger UI)
app = FastAPI(
    title="Promotion Management API",
    description="Enterprise API สำหรับระบบจัดการโปรโมชั่นและข้อบกพร่อง (Defect)",
    version="1.0.0",
    docs_url="/docs",    # URL สำหรับดู API Document
    redoc_url="/redoc"   # URL สำหรับดู API Document อีกรูปแบบ
)

# ---------------------------------------------------------
# การตั้งค่า CORS (Cross-Origin Resource Sharing)
# เพื่ออนุญาตให้ Frontend (React/Vue/Angular) เรียกใช้งาน API ได้
# ---------------------------------------------------------
origins = [
    "http://localhost",
    "http://localhost:3000", # พอร์ตมาตรฐานของ React
    "http://localhost:5173", # พอร์ตมาตรฐานของ Vite
    "http://localhost:8080", # พอร์ตมาตรฐานของ Vue
    # สามารถเพิ่ม URL ของเซิร์ฟเวอร์จริงได้ที่นี่เมื่อนำขึ้น Production
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"], # อนุญาตทุก Method (GET, POST, PUT, DELETE, PATCH)
    allow_headers=["*"], # อนุญาตทุก Header
)

# ---------------------------------------------------------
# ลงทะเบียน Routers เข้าสู่ระบบ
# ---------------------------------------------------------
app.include_router(auth.router)
app.include_router(user.router)
app.include_router(version.router)
# สมมติว่าไฟล์ที่อัปโหลดและจัดการโปรโมชั่นชื่อ promotion.py
app.include_router(promotion.router) 

# --- ลงทะเบียน API ชุดที่ 2 (Entity, Defect, Transaction, Report) ---
app.include_router(entity.router)
app.include_router(defect.router)
app.include_router(transaction.router)
app.include_router(report.router)

# ---------------------------------------------------------
# Root Endpoint (Health Check)
# ไว้สำหรับทดสอบว่า Server รันขึ้นหรือไม่
# ---------------------------------------------------------
@app.get("/", tags=["Health Check"])
def root():
    return {
        "service": "Promotion Management API",
        "status": "Online",
        "message": "Welcome to the API! Please visit /docs for API documentation."
    }