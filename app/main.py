from contextlib import asynccontextmanager
from fastapi import FastAPI
import os
import uvicorn

from app.backend.routers import (
    auth_router, 
    version_router, 
    promotion_router, 
    transaction_router, 
    dashboard_router,
    import_router,
    romotion_export_routre,
    product_api
)
from app.backend.init_data import init_db 


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 System Starting... Checking Database...")
    init_db() 
    print("✅ System Startup Complete.")
    yield
    print("🛑 System Shutting down...")


ENV = os.getenv("APP_ENV", "development")

is_prod = ENV == "production"
docs_path = None if is_prod else "/docs"
redoc_path = None if is_prod else "/redoc"

app = FastAPI(
    title="Promotion Management API",
    description="Promotion Management API Data from MySQL and SSMS",
    version="1.2.0",
    docs_url=docs_path,
    redoc_url=redoc_path,
    lifespan=lifespan,
    root_path=os.getenv("ROOT_PATH", "")
)


@app.get("/health", tags=["System"])
def health_check():
    """API สำหรับตรวจสอบสถานะของ Server (Health Check)"""
    return {"status": "ok", "environment": ENV}

@app.get("/", tags=["System"])
def root():
    """หน้าแรกของ API"""
    return {"message": "System is running", "status": "OK"}

# Include Routers (ลงทะเบียน API เส้นทางย่อย)
app.include_router(auth_router.router)
app.include_router(version_router.router)
app.include_router(promotion_router.router)
app.include_router(transaction_router.router)
app.include_router(import_router.router)
app.include_router(dashboard_router.router)
app.include_router(romotion_export_routre.router)
app.include_router(product_api.router)


def start_server():
    """ฟังก์ชันย่อยสำหรับรัน Uvicorn ตาม Environment"""
    
    if is_prod:
        uvicorn.run("app.main:app", 
            host="0.0.0.0",
            port=8000,
            workers=int(os.getenv("WORKERS", 2)), 
            log_level="warning",
            limit_concurrency=1000,
            timeout_keep_alive=5
        )
    else:
        uvicorn.run("app.main:app",
            host="0.0.0.0",
            port=8001,
            reload=True, 
            log_level="debug"
        )

if __name__ == "__main__":
    start_server()