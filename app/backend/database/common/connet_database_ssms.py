
import pyodbc
from ...config import settings

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



get_db_mssql = get_mssql_connection
