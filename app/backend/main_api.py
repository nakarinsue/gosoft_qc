import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .database.common.init_database import init_db

# --------------------------------------------------------------------------- #
# 1. Lifespan & Configurations
# --------------------------------------------------------------------------- #
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 System Starting... Checking Database...")
    try:
        init_db() 
        print("✅ System Startup Complete.")
    except Exception as e:
        print(f"⚠️ [WARNING] Database Initialization Error: {e}")
    yield
    print("🛑 System Shutting down...")

# --------------------------------------------------------------------------- #
# 2. Application Setup (Modular Functions)
# --------------------------------------------------------------------------- #
def setup_middlewares(app: FastAPI):
    """ตั้งค่า Middlewares เช่น CORS สำหรับรองรับการเชื่อมต่อจาก Frontend"""
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # ⚠️ แนะนำให้เปลี่ยนเป็น Domain ของ Frontend จริงในโหมด Production
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

def register_routers(app: FastAPI):
    """
    ลงทะเบียน API เส้นทางย่อยทั้งหมด พร้อมระบบ Fault Tolerance 
    หาก Router ไหนเกิด Error ระบบจะตัดทิ้ง แจ้งเตือน และรันเส้นอื่นต่อ
    """
    def safe_include(router_obj, name: str):
        """ฟังก์ชันช่วยเหลือสำหรับเพิ่ม Router อย่างปลอดภัย"""
        if router_obj is None:
            return
        try:
            # รองรับทั้งกรณีที่ตัวแปรเป็น APIRouter แล้ว หรือมี .router ซ้อนอยู่ด้านใน
            target_router = router_obj.router if hasattr(router_obj, "router") else router_obj
            app.include_router(target_router)
            print(f"✅ Router Loaded: {name}")
        except Exception as e:
            print(f"❌ [SKIP] Error including router '{name}': {e}")

    print("--- Starting Router Registration ---")
    
    from .router import auth, file_imports, version,assign,defect,mapping,option,payment,promotion,counter
    data= [auth, file_imports, version,assign,defect,mapping,option,payment,promotion,counter]
    for i in data:
        try:  
            safe_include(i, str(i.__name__))
        except Exception as e: print(f"❌ [IMPORT ERROR] file : {i} : {e}")
    print("----------------------------------")

def register_exception_handlers(app: FastAPI):
    """จัดการ Error ระดับ Global เพื่อให้ Response ออกมาเป็นมาตรฐานเดียวกัน"""
    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        return JSONResponse(
            status_code=500,
            content={
                "error": "Internal Server Error", 
                "message": str(exc) if app.debug else "เกิดข้อผิดพลาดบางอย่างในระบบ"
            },
        )

# --------------------------------------------------------------------------- #
# 3. App Factory (Enterprise Standard Pattern)
# --------------------------------------------------------------------------- #
def create_app() -> FastAPI:
    """ฟังก์ชันหลักสำหรับสร้างและประกอบร่าง FastAPI Application"""
    ENV = os.getenv("APP_ENV", "development")
    is_prod = ENV == "production"
    
    _app = FastAPI(
        debug=not is_prod,
        title="Promotion Management API",
        description="Promotion Management API Data from MySQL and SSMS",
        version="1.2.0",
        docs_url="/docs" if is_prod else "/docs",
        redoc_url="/redoc" if is_prod else "/redoc",
        lifespan=lifespan    )

    # เรียกใช้งานฟังก์ชันย่อยเพื่อประกอบร่าง App
    setup_middlewares(_app)
    register_routers(_app)
    register_exception_handlers(_app)

    return _app

# สร้าง Instance ของ Application
app = create_app()