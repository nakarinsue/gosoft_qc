enterprise_api_project/
│
├── docs/                           # 📍 เอกสารโปรเจคทั้งหมด (Blueprints & Specs)
│   ├── architecture_diagram.png    # แผนภาพการทำงานร่วมกับ React/Electron
│   ├── api_specs.md                # เอกสารคู่มือ API
│   ├── database_dictionary.md      # โครงสร้าง Data (ความหมายของตารางและคอลัมน์)
│   └── workflows.md                # อธิบายการทำงานของฟังก์ชันหลักๆ
│
├── app/                            # 📍 Source Code หลักของระบบ
│   ├── __init__.py
│   ├── main.py                     # [จุดเริ่มต้น] รันเซิร์ฟเวอร์, รวม API Routes
│   │
│   ├── core/                       # ⚙️ แกนกลางระบบ (Configuration)
│   │   ├── config.py               # จัดการตัวแปร Environment (.env) ทั้งหมด
│   │   ├── logger.py               # ระบบ Funtion Log กลาง (พิมพ์ลง Console & บันทึกลงไฟล์)
│   │   └── exceptions.py           # ตัวจัดการ Error กลางก่อนส่งกลับให้ UI
│   │
│   ├── api/                        # 🌐 ส่วนรับส่งข้อมูลกับ UI (Controllers)
│   │   └── v1/
│   │       ├── files_router.py     # API สำหรับ Upload/Export ไฟล์ Excel/CSV
│   │       ├── data_router.py      # API สำหรับจัดการข้อมูล Database
│   │       └── external_router.py  # API สำหรับให้ระบบอื่นเรียกใช้ หรือเราไปเรียก API ต่อ
│   │
│   ├── schemas/                    # 📝 รูปแบบข้อมูลเข้า-ออก (Type Hinting & Validation)
│   │   ├── request_schemas.py      # Format ข้อมูลที่รับมาจาก UI (React/Electron)
│   │   └── response_schemas.py     # Format ข้อมูลที่จะส่งกลับไป (รวมถึง Format การ Export)
│   │
│   ├── models/                     # 🗄️ โครงสร้าง Data (ORM Models)
│   │   ├── postgres_models.py      # ตารางใน PostgreSQL
│   │   ├── sqlserver_models.py     # ตารางใน SQL Server
│   │   └── mysql_models.py         # ตารางใน MySQL
│   │
│   ├── repositories/               # 🔍 ส่วนติดต่อ Database (เขียน Query & Run Manual)
│   │   ├── postgres_repo.py        # คำสั่ง Query/Insert สำหรับ PostgreSQL
│   │   ├── sqlserver_repo.py       # คำสั่ง Query สำหรับ SQL Server
│   │   ├── mysql_repo.py           # คำสั่ง Query สำหรับ MySQL
│   │   └── oracle_repo.py          # คำสั่ง Query สำหรับ Oracle
│   │
│   ├── services/                   # 🧠 ลอจิกการคำนวณ (Business Logic & Classes)
│   │   ├── store_data_processor.py # คลาสประมวลผลข้อมูลหลัก (ใช้ pandas ผสานข้อมูล)
│   │   ├── s3_storage_service.py   # คลาสจัดการไฟล์อัพโหลดลง S3 (LocalStack)
│   │   ├── export_service.py       # คลาสสร้างไฟล์ Excel, จัด Format, จัด Type
│   │   └── external_api_service.py # คลาสสำหรับยิง HTTP Request เรียก API ต่อ
│   │
│   ├── database/                   # 🔌 การเชื่อมต่อ
│   │   └── connection.py           # สร้าง Engine/Session เชื่อมต่อ DB ทุกค่าย
│   │
│   └── utils/                      # 🛠️ ฟังก์ชันช่วยเหลือย่อยๆ (Helper Functions)
│       ├── file_helpers.py         # ตัวจัดการชื่อไฟล์, ตรวจสอบนามสกุล
│       └── date_formatters.py      # ตัวแปลง Format วันที่
│
├── tests/                          # 🧪 ระบบ Automated Testing
│   ├── __init__.py
│   ├── conftest.py                 # ตั้งค่า Environment สำหรับรัน Test
│   ├── mocks/                      # 📍 ข้อมูลจำลอง (Mockup Data)
│   │   ├── sample_export_data.json # ไฟล์ข้อมูลจำลองสำหรับเทส Export
│   │   └── mock_external_api.json  # ข้อมูลจำลองเมื่อเรียก API ภายนอกไม่ได้
│   ├── test_api/                   # เทส Endpoints
│   └── test_services/              # เทสลอจิกการทำงานของ Class ต่างๆ
│
├── logs/                           # 📍 โฟลเดอร์เก็บไฟล์ Log ประจำวัน (สร้างอัตโนมัติ)
│   └── app-2026-02-21.log
│
├── scripts/                        # 📜 สคริปต์สำหรับ Run Manual นอกระบบ API
│   ├── manual_data_sync.py         # สคริปต์สั่งดึงข้อมูลข้าม DB แบบ Manual
│   └── db_migrations.sh            # สคริปต์อัปเดตโครงสร้าง Database
│
├── docker-compose.yml              # 🐳 รวม Service: API, PostgreSQL, MySQL, LocalStack(S3)
├── Dockerfile                      # 🐳 สคริปต์แพ็กเกจ Python API
├── requirements.txt                # 📦 รายชื่อไลบรารี (FastAPI, pandas, sqlalchemy, etc.)
├── .env                            # 🔑 ตัวแปรความลับ (ไม่นำขึ้น Git)
└── .gitignore                      # กำหนดไฟล์ที่ไม่ต้องนำขึ้น Git (เช่น /logs, .env, /__pycache__)