import oracledb
from .config import DB_USER, DB_PASSWORD, DB_PORT, DB_NAME, DB_HOST_12C
from typing import Tuple, List, Dict, Any

class OracleDBManager:
    """จัดการการเชื่อมต่อฐานข้อมูล Oracle รองรับการสลับ Host"""
    
    def __init__(self, host: str = DB_HOST_12C):
        self.host = host
        self.dsn = f"{self.host}:{DB_PORT}/{DB_NAME}"
        self.conn = None

    def __enter__(self):
        try:
            self.conn = oracledb.connect(user=DB_USER, password=DB_PASSWORD, dsn=self.dsn)
            return self
        except Exception as e:
            print(f"[DB Error] Connection failed on {self.host}: {e}")
            raise

    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.conn:
            self.conn.close()

    def execute_query(self, query: str, params: Dict|None = None) -> Tuple[List[str], List[List[Any]]]:
        if not self.conn:
            raise ConnectionError("Database not connected")
        
        cur = self.conn.cursor()
        try:
            if params:
                cur.execute(query, params)
            else:
                cur.execute(query)
                
            columns = [col[0] for col in cur.description] # type: ignore
            rows = []
            for r in cur.fetchall():
                row_data = [
                    str(v).replace("\n", " ").strip().encode('latin1').decode('tis-620', errors='ignore') 
                    if v is not None else "" for v in r
                ]
                rows.append(row_data)
            return columns, rows # type: ignore
        finally:
            cur.close()