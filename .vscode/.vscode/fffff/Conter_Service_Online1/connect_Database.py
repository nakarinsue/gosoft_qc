import oracledb
import json
from icecream import ic
# ic.disable()  # ปิด
# ic.enable()
import json
class ConfigConnectDatabase:
    HOST: str = "csonldbqa01.counterservice.co.th"
    PORT: str = "1521"
    SERVICE_NAME: str = "ONLPRD"
    USER: str = "CS_SUPPORT"
    PASSWORD: str = "1234"

# oracledb.init_oracle_client() 
class Database(ConfigConnectDatabase):
    def __init__(self):
        self.host = self.HOST
        self.port = self.PORT
        self.service_name = self.SERVICE_NAME
        self.user = self.USER
        self.password = self.PASSWORD
        self.connection = None
        self.charset = "utf-8"  # default
        self.conn = None
        self.cursor = None

    def is_connected(self):
        return self.connection is not None

    def get_dsn(self) -> str:
        return f"{self.host}:{self.port}/{self.service_name}"
    # dsn = oracledb.makedsn("HOST", 1521, service_name="SERVICE_NAME")

    def connect(self):
        try:
            dsn = self.get_dsn()
            self.connection = oracledb.connect(
                user=self.user,
                password=self.password,
                dsn=dsn
                # encoding="UTF-8", 
                # nencoding="UTF-8"
            )
            
            # ตรวจสอบ charset ของ DB
            with self.connection.cursor() as cursor:
                cursor.execute("SELECT value FROM nls_database_parameters WHERE parameter='NLS_CHARACTERSET'")
                self.charset = cursor.fetchone()[0]
                print(f"📝 Database charset detected: {self.charset}")

        except Exception as e:
            print(f"❌ Error connecting to Oracle: {e}")
            self.connection = None

    def disconnect(self):
        """ปิดการเชื่อมต่อ"""
        if self.connection:
            self.connection.close()
            print("🔌 Disconnected from Oracle Database")
            self.connection = None

    def _decode_str(self, value: str) -> str:
        """แปลง string จาก DB charset เป็น Python str"""
        if not isinstance(value, str):
            return value
        try:
            if self.charset.upper() in ("WE8ISO8859P1", "WE8MSWIN1252"):
                return value.encode('latin1').decode('tis-620',errors='ignore')
            # ถ้าเป็น UTF-8 หรืออื่น ๆ
            return value
        except Exception:
            return value

    def execute_query(self, query: str, params: tuple = None):
        """Query และคืนค่า list ของ dict"""
        if not self.connection:
            raise Exception("Database not connected. Call connect() first.")

        with self.connection.cursor() as cursor:
            cursor.execute(query, params or [])
            columns = [col[0] for col in cursor.description]
            result = [
                {col: self._decode_str(val) for col, val in zip(columns, row)}
                for row in cursor.fetchall()
            ]
            return result

    def execute_query_json(self, query: str, params: tuple = None) -> str:
        """Query และคืนค่าเป็น JSON string"""
        result = self.execute_query(query, params)
        return json.dumps(result, default=str, ensure_ascii=False)

    def execute_non_query(self, query: str, params: tuple = None) -> str:
        """Execute INSERT/UPDATE/DELETE และคืนค่า status"""
        if not self.connection:
            raise Exception("Database not connected. Call connect() first.")
        try:
            with self.connection.cursor() as cursor:
                cursor.execute(query, params or [])
                self.connection.commit()
            result = {"status": "success", "message": "Query executed successfully"}
        except Exception as e:
            result = {"status": "error", "message": str(e)}
        return json.dumps(result, ensure_ascii=False)