import pandas as pd
from datetime import datetime
import oracledb
from typing import Any,Literal
import json





class DatabaseConnector:
    def __init__(self, ip='10.182.236.52', service_name='ONLPRD'):
        self.dsn = oracledb.makedsn(ip,port=1521, service_name=service_name)
        self.user = 'CS_DEV'
        self.pwd = '1234'

    def execute_query(self, sql_query: str):
        """ใช้ Context Manager (with) เพื่อให้มั่นใจว่า Connection จะถูกปิดเสมอเมื่อใช้งานเสร็จ"""
        try:
            with oracledb.connect(user=self.user, password=self.pwd, dsn=self.dsn) as conn:
                with conn.cursor() as cursor:
                    cursor.execute(sql_query)
                    
                    if sql_query.strip().upper().startswith("SELECT"):
                        result = cursor.fetchall()
                        return result[-1] if len(result) == 1 else result
                    else:
                        conn.commit()
                        print("✅ อัพเดทข้อมูลใน Database สำเร็จ")
                        return True
        except Exception as e:
            print(f"❌ Database Error: {e}")
            return None



class OracleManager(DatabaseConnector):
    """คลาสสำหรับจัดการระบบตรวจสอบฐานข้อมูล (Pre-Check & Post-Check)"""
    
    def get_dataframe(self, query: str, params: dict|None = None) -> pd.DataFrame:
        """Helper Function: ดึงข้อมูลจาก Database และแปลงเป็น Pandas DataFrame ทันที"""
        try:
            with oracledb.connect(user=self.user, password=self.pwd, dsn=self.dsn) as conn:
                # ใช้ pandas read_sql ช่วยให้ทำงานกับข้อมูลแบบตาราง (Excel/JSON) ได้ง่ายขึ้นมาก
                df = pd.read_sql(query, con=conn, params=params) # type: ignore
                return df
        except Exception as e:
            print(f"❌ Database Query Error: {e}")
            return pd.DataFrame()

    # ==========================================
    # Phase 1: Pre-Check (ตรวจสอบ Config 5 ตาราง)
    # ==========================================
    def check_vendor_config(self, vendor_id: str, service_id: str, action: Literal['show', 'export'] = 'show') -> Any:
        """ตรวจสอบ Config 5 ตาราง และเลือก Output เป็น JSON ('show') หรือไฟล์ Excel ('export')"""
        
        # ใช้ Bind Variable (:vendor_id) แทน f-string มาตรฐานระดับ Enterprise
        params = {"vendor_id": vendor_id, "service_id": service_id}
        
        # กำหนด 5 ตารางที่ต้องการตรวจสอบ (ปรับแก้ชื่อตารางที่ 4 และ 5 ได้ตามโครงสร้างจริงของคุณ)
        queries = {
            "Client_Config": "SELECT * FROM ONLSTD.WS_CLIENT_CONFIG WHERE VENDOR_ID = :vendor_id AND SERVICE_ID = :service_id",
            "Charge_Step": "SELECT * FROM ONLSTD.WS_CLIENT_CHARGE_STEP WHERE VENDOR_ID = :vendor_id AND SERVICE_ID = :service_id",
            "Reprint_Limit": "SELECT * FROM ONLSTD.WS_CLIENT_REPRINT WHERE VENDOR_ID = :vendor_id AND SERVICE_ID = :service_id",
            "AutoFix_Tx": "SELECT * FROM ONLSTD.WS_CLIENT_AUTOFIXTX WHERE VENDOR_ID = :vendor_id AND SERVICE_ID = :service_id",
            "Vendor_Master": "SELECT * FROM ONLSTD.WS_VENDOR_MASTER WHERE VENDOR_ID = :vendor_id" # อ้างอิงด้วย vendor_id อย่างเดียว
        }
        
        # Query ข้อมูลทั้งหมดเก็บไว้ในรูปแบบ Dictionary ของ DataFrame
        print(f"🔍 [Pre-Check] กำลังตรวจสอบ Config ของ Vendor: {vendor_id}...")
        results_df = {name: self.get_dataframe(sql, params) for name, sql in queries.items()}
        
        if action == 'show':
            # แปลง DataFrame เป็น JSON Dictionary
            json_result = {name: json.loads(df.to_json(orient='records')) for name, df in results_df.items()}
            print("✅ [Show Mode] สรุปข้อมูลรูปแบบ JSON สำเร็จ")
            return json_result
            
        elif action == 'export':
            # บันทึกแต่ละตารางลงคนละ Sheet ในไฟล์ Excel (.xlsx) เดียวกัน
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            file_name = f"VendorConfig_{vendor_id}_{timestamp}.xlsx"
            
            try:
                # จำเป็นต้องใช้ไลบรารี openpyxl หรือ xlsxwriter (pip install openpyxl)
                with pd.ExcelWriter(file_name, engine='openpyxl') as writer:
                    for name, df in results_df.items():
                        df.to_excel(writer, sheet_name=name, index=False)
                print(f"✅ [Export Mode] สร้างและบันทึกไฟล์ Excel สำเร็จ: {file_name}")
                return file_name
            except Exception as e:
                print(f"❌ Error Exporting Excel: {e}")
                return None

    # ==========================================
    # Phase 2: Post-Check (ค้นหา TX_ID หลังทำรายการ)
    # ==========================================
    def get_transaction_by_tx_id(self, tx_id: str) -> pd.DataFrame:
        """นำ TX_ID ที่ได้จาก Response มาค้นหาใน Database เพื่อยืนยันข้อมูล"""
        if not tx_id:
            print("⚠️ ไม่พบ TX_ID สำหรับใช้ค้นหาข้อมูล")
            return pd.DataFrame()
            
        print(f"🔍 [Post-Check] กำลังค้นหา Transaction: {tx_id} ในระบบ...")
        
        # มีการปรับ SQL เพื่อแสดงค่า STORE_ID และแสดง PAY เมื่อ TS TD มีข้อมูล
        query = """
            SELECT 
                TX_ID, 
                STORE_ID,
                CASE WHEN TS IS NOT NULL AND TD IS NOT NULL THEN PAY ELSE NULL END AS PAY_INFO,
                SYSTEM_DATE_TIME,
                Tbl.*
            FROM ONLSTD.WS_ONLINE_TX Tbl
            WHERE TX_ID = :tx_id OR R_SERVICE_RUNNO = :tx_id
        """
        params = {"tx_id": tx_id}
        
        df = self.get_dataframe(query, params)
        if df.empty:
            print("⚠️ ค้นหาสำเร็จ แต่ยังไม่พบข้อมูล Transaction นี้บันทึกลงใน Database")
        else:
            print("✅ พบข้อมูล Transaction ใน Database แล้ว")
        return df