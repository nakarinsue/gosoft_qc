from .database import OracleDBManager
from .config import ALL_TABEL_MAPPING,DB_HOST_12C, DB_HOST_19C
from typing import Dict, Any
from icecream import ic

class DataFetchService:
    @staticmethod
    def get_vendor_info(db: OracleDBManager, cs_code: str, service_id: str) -> tuple:
        """ดึงข้อมูล Config ทั้งหมด"""

        query = f"""
            SELECT * FROM ONLSTD.WS_CLIENT_CONFIG 
            WHERE (VENDOR_CODE = :cs_code OR VENDOR_ID = :cs_code) AND SERVICE_ID = :service_id
        """
        cols, rows = db.execute_query(query, {"cs_code": cs_code,"cs_code": cs_code, "service_id": service_id})
        
        if not rows:
            return {}, [], []
        return dict(zip(cols, rows[0])), cols, rows

    @classmethod
    def fetch_all_tables(cls, cs_code: str, service_id: str,Transation=True) -> Dict[str, Any]:
        """ดึงข้อมูลและจัด Format ใหม่ให้อยู่ในรูปแบบที่ API ต้องการ"""
        result = {
            "Infomation": {},
            "data": []
        }
        
        with OracleDBManager() as db:
            vendor_info, config_cols, config_rows = cls.get_vendor_info(db, cs_code, service_id)
            if not vendor_info:
                return result

            result["Infomation"] = {
                "VENDOR_CODE": str(f"'{vendor_info.get("VENDOR_CODE", "")}'"),
                "VENDOR_NAME": str(vendor_info.get("VENDOR_NAME", "")),
                "VENDOR_ID": str(f"'{vendor_info.get("VENDOR_ID", "")}'"),
                "SERVICE_ID": str(vendor_info.get("SERVICE_ID", ""))
            }

            # 2. จัดเตรียม Block: data (List ของ Table)VENDOR_ID
            for mapping in ALL_TABEL_MAPPING:
                table_name = mapping.get('TABEL')
                if not Transation and table_name in ['WS_ONLINE_TX','WS_ONLINE_LOG']:
                    continue
                schema = mapping.get('SCHEMA')
                if table_name == "WS_CLIENT_CONFIG":
                    # นำ Column คู่กับ Row เป็น Dictionary
                    formatted_rows = [dict(zip(config_cols, row)) for row in config_rows]
                    result["data"].append({table_name: formatted_rows})
                    continue
                
                where_clauses = []
                for k, v in mapping.get('RULE_MAP', {}).items():
                    if v.get('STATUS', 'S') == 'A' and vendor_info.get(k):
                        where_clauses.append(f"{v['RESULT']} IN ('{vendor_info[k]}')")
                
                where_sql = " AND ".join(where_clauses)
                if where_sql:
                    query = f"SELECT * FROM {schema}.{table_name} WHERE {where_sql}"
                    ic(query)
                    cols, rows = db.execute_query(query)
                    
                    # แปลง Row ให้เป็น {column_name: value}
                    formatted_rows = [dict(zip(cols, row)) for row in rows]
                    result["data"].append({table_name: formatted_rows})
                

        return result

class DatabaseCompareService:
    @staticmethod
    def compare_query_results(query: str, params: dict |None= None) -> Dict[str, Any]:
        """
        รัน Query เดียวกันบน 12C และ 19C เพื่อเปรียบเทียบข้อมูล
        คำแนะนำ: Query ควรมี ORDER BY เพื่อให้ลำดับแถวตรงกันสำหรับการเปรียบเทียบที่แม่นยำ
        """
        # 1. ดึงข้อมูลจาก 12C
        with OracleDBManager(host=DB_HOST_12C) as db_12c:
            cols_12c, rows_12c = db_12c.execute_query(query, params)
            data_12c = [dict(zip(cols_12c, row)) for row in rows_12c]

        # 2. ดึงข้อมูลจาก 19C
        with OracleDBManager(host=DB_HOST_19C) as db_19c:
            cols_19c, rows_19c = db_19c.execute_query(query, params)
            data_19c = [dict(zip(cols_19c, row)) for row in rows_19c]

        # 3. ตรวจสอบโครงสร้าง Column (เช็คว่า Table/View เปลี่ยนไปหรือไม่)
        if set(cols_12c) != set(cols_19c):
            return {
                "status": "schema_mismatch",
                "message": "โครงสร้างคอลัมน์ของทั้ง 2 Database ไม่เหมือนกัน",
                "columns_12c": cols_12c,
                "columns_19c": cols_19c
            }

        # 4. เปรียบเทียบข้อมูล (Row by Row, Column by Column)
        differences = []
        max_rows = max(len(data_12c), len(data_19c))

        for i in range(max_rows):
            row_12c = data_12c[i] if i < len(data_12c) else None
            row_19c = data_19c[i] if i < len(data_19c) else None

            # กรณีจำนวนข้อมูลไม่เท่ากัน
            if row_12c is None:
                differences.append({"row_index": i + 1, "status": "Missing in 12C", "data_19c": row_19c})
                continue
            if row_19c is None:
                differences.append({"row_index": i + 1, "status": "Missing in 19C", "data_12c": row_12c})
                continue

            # กรณีข้อมูลมีทั้งคู่ ให้เช็คทีละ Column
            mismatched_cols = {}
            for col in cols_12c:
                val_12c = row_12c.get(col)
                val_19c = row_19c.get(col)
                
                if val_12c != val_19c:
                    mismatched_cols[col] = {
                        "value_12C": val_12c,
                        "value_19C": val_19c
                    }

            if mismatched_cols:
                # บันทึกความต่าง พร้อมแนบ Key 2-3 ตัวแรกไปเป็น Reference ให้อ่านง่าย
                reference_keys = {cols_12c[0]: row_12c.get(cols_12c[0])} 
                if len(cols_12c) > 1:
                    reference_keys[cols_12c[1]] = row_12c.get(cols_12c[1])

                differences.append({
                    "row_index": i + 1,
                    "status": "Data Mismatch",
                    "reference": reference_keys,
                    "mismatched_columns": mismatched_cols
                })

        return {
            "status": "success",
            "summary": {
                "total_rows_12c": len(data_12c),
                "total_rows_19c": len(data_19c),
                "total_differences_found": len(differences)
            },
            "differences": differences
        }