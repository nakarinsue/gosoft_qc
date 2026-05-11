import oracledb
from typing import Optional

class OracleDBManager:
    """จัดการการเชื่อมต่อฐานข้อมูล Oracle ด้วย Context Manager"""
    def __init__(self, host: str = '10.182.236.52', port: int = 1521, 
                 service_name: str = 'ONLPRD', user: str = 'CS_DEV', pwd: str = '1234'):
        self.dsn = oracledb.makedsn(host, port, service_name=service_name)
        self.user = user
        self.pwd = pwd
        self.conn = None

    def __enter__(self):
        """เรียกใช้งานเมื่อเปิด Context (with OracleDBManager(...) as db:)"""
        try:
            self.conn = oracledb.connect(user=self.user, password=self.pwd, dsn=self.dsn)
            return self.conn
        except oracledb.Error as e:
            print(f"[Database Error] Connection failed: {e}")
            raise

    def __exit__(self, exc_type, exc_val, exc_tb):
        """ปิด Connection อัตโนมัติเมื่อสิ้นสุดการทำงาน"""
        if self.conn:
            self.conn.close()