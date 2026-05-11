

import os
import uvicorn
from uvicorn.config import LOGGING_CONFIG

# --- 1. เตรียมโฟลเดอร์และตั้งค่าการเก็บ Log (Enterprise Standard) ---
LOG_DIR = "logs"
os.makedirs(LOG_DIR, exist_ok=True)
LOG_FILE = os.path.join(LOG_DIR, "app.log")

# ดึง Config เริ่มต้นของ Uvicorn มาแก้ไข
log_config = LOGGING_CONFIG.copy()

# เพิ่ม File Handler (แบบ Rotating ป้องกันไฟล์ใหญ่เกินไป)
log_config["handlers"]["file"] = {
    "class": "logging.handlers.RotatingFileHandler",
    "filename": LOG_FILE,
    "maxBytes": 1024 * 1024 * 10,  # ขนาดไฟล์สูงสุด 10 MB ต่อไฟล์
    "backupCount": 5,              # เก็บไฟล์ย้อนหลังสูงสุด 5 ไฟล์
    "formatter": "default",        # ใช้รูปแบบข้อความเดียวกับหน้าจอ
}

# กำหนดให้ Uvicorn บันทึก Log ลงทั้งหน้าจอ (default/access) และลงไฟล์ (file)
log_config["loggers"]["uvicorn"]["handlers"] = ["default", "file"]
log_config["loggers"]["uvicorn.error"]["handlers"] = ["default", "file"]
log_config["loggers"]["uvicorn.access"]["handlers"] = ["access", "file"]

# --- 2. ส่วนการตั้งค่า Environment ของแอปพลิเคชัน ---
ENV = os.getenv("APP_ENV", "development")
is_prod = ENV == "production"



def start_server():
    """ฟังก์ชันย่อยสำหรับรัน Uvicorn ตาม Environment พร้อมระบบบันทึก Log ไฟล์"""
    
    if is_prod:
        uvicorn.run("app.backend.main_api:app", 
            host="0.0.0.0",
            port=int(os.getenv("APIPORT", 8000)),
            workers=int(os.getenv("WORKERS", 12)), 
            reload=False, 
            log_level="warning",
            log_config=log_config,  # <--- เรียกใช้งาน Log Config ที่นี่
            limit_concurrency=1000,
            timeout_keep_alive=5
        )
    else:
        uvicorn.run("app.backend.main_api:app",
            host="0.0.0.0",            
            port=8001,
            reload=True, 
            log_level="debug",
            log_config=log_config   # <--- เรียกใช้งาน Log Config ที่นี่
        )

if __name__ == "__main__":
    start_server()