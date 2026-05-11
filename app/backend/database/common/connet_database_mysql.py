
import pymysql
from ...config import settings

def _get_mysql_connection():
    """ฟังก์ชันสำหรับสร้าง Connection ดิบไปยัง MySQL"""
    return pymysql.connect(
        host=settings.MYSQL_URL,         # ต้องแก้ไขในไฟล์ config ให้รับเป็น IP/Domain เช่น "127.0.0.1"
        user=settings.MYSQL_USER,
        password=settings.MYSQL_PASSWORD,
        database=settings.MYSQL_DATABASE,
        cursorclass=pymysql.cursors.DictCursor 
    )

get_db_mysql = _get_mysql_connection()
