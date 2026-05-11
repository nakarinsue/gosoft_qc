from minio import Minio
from datetime import timedelta
import os

# ข้อมูลการเชื่อมต่อ (ควรย้ายไปที่ .env)
MINIO_ENDPOINT = "localhost:9000"
MINIO_ROOT_USER = "Administrator"
MINIO_ROOT_PASSWORD = "Admin2000"
BUCKET_NAME = "file-promotion"

client = Minio(
    MINIO_ENDPOINT,
    access_key=MINIO_ROOT_USER,
    secret_key=MINIO_ROOT_PASSWORD,
    secure=False # เปลี่ยนเป็น True ถ้าใช้ HTTPS
)

# ตรวจสอบว่ามี Bucket หรือไม่ ถ้าไม่มีให้สร้าง
if not client.bucket_exists(BUCKET_NAME):
    client.make_bucket(BUCKET_NAME)

def upload_to_minio(file_data, file_name, content_type):
    # อัปโหลดไฟล์ไปที่ Minio
    client.put_object(
        BUCKET_NAME,
        file_name,
        file_data,
        length=-1,
        part_size=10*1024*1024,
        content_type=content_type
    )
    return f"{BUCKET_NAME}/{file_name}"