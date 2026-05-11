import logging
import pyodbc
import pymysql
import psycopg2
import requests
from typing import List, Dict, Any, Tuple

# ---------------------------------------------------------
# 1. Configuration & Setup
# ---------------------------------------------------------
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class DBConfig:
    """เก็บการตั้งค่าสำหรับการเชื่อมต่อฐานข้อมูล"""
    HOST = "localhost"
    USER = "sa"
    PASSWORD = "Admin2000"
    
    # หมายเหตุ: ในการใช้งานจริง ควรแก้ไขชื่อ Database ด้านล่างนี้
    SQLSERVER_HOST = 'localhost'
    SQLSERVER_DB = "POSG2" 
    MYSQL_HOST ='localhost'
    MYSQL_DB = "SourceDB_MySQL"
    POSTGRES_DB = "TargetDB_Postgres"
    API_ENDPOINT = "http://localhost/api/v1/products/search"

# ---------------------------------------------------------
# 2. Data Integration Service
# ---------------------------------------------------------
class ProductDataSyncService:
    def __init__(self):
        self.config = DBConfig()

    def sync_products(self, entity_code: List[str]) -> Dict[str, Any]:
        """
        Main function สำหรับเรียกใช้งานจาก API (Controller)
        """
        if not entity_code:
            return {"status": "success", "message": "store ip 19 No item.", "updated_count": 0}

        aggregated_data: Dict[str, Dict[str, Any]] = {}
        missing_ids = set(entity_code)

        # Step 1: MS SQL Server
        if missing_ids:
            logger.info(f"Step 1: Search entity code  {len(missing_ids)} from SQL Server (SSMS)...")
            sql_data = self._fetch_from_sql_server(list(missing_ids))
            aggregated_data.update(sql_data)
            missing_ids -= set(sql_data.keys())

        # Step 2: MySQL
        # if missing_ids:
        #     logger.info(f"Step 2: Searching {len(missing_ids)} IDs in MySQL...")
        #     mysql_data = self._fetch_from_mysql(list(missing_ids))
        #     aggregated_data.update(mysql_data)
        
        #     missing_ids -= set(mysql_data.keys())

        # Step 3: API
        # if missing_ids:
        #     logger.info(f"Step 3: Searching {len(missing_ids)} IDs via API...")
        #     api_data = self._fetch_from_api(list(missing_ids))
        #     aggregated_data.update(api_data)
        #     missing_ids -= set(api_data.keys())

        # Step 4: Update PostgreSQL
        updated_count = 0
        if aggregated_data:
            logger.info(f"Step 4: Updating {len(aggregated_data)} records in PostgreSQL...")
            updated_count = self._update_postgresql(aggregated_data)
        else:
            logger.info("No data found from any source to update.")

        return {
            "status": "success",
            "total_requested": len(entity_code),
            "updated_count": updated_count,
            "not_found_ids": list(missing_ids)
        }

    # ---------------------------------------------------------
    # Helper Methods (Private)
    # ---------------------------------------------------------
    def _fetch_from_sql_server(self, ids: List[str]) -> Dict[str, Dict[str, Any]]:
        result = {}
        try:
            conn_str = (
                "DRIVER={ODBC Driver 17 for SQL Server};"
                f"SERVER={self.config.HOST};"
                f"DATABASE={self.config.SQLSERVER_DB};"
                f"UID={self.config.USER};"
                f"PWD={self.config.PASSWORD}"
            )
            # placeholders สำหรับ WHERE IN (?, ?, ?)
            placeholders = ','.join('?' * len(ids))
            query = f"SELECT id, product_name, product_price, product_size FROM source_table WHERE id IN ({placeholders})"
            
            with pyodbc.connect(conn_str, timeout=5) as conn:
                with conn.cursor() as cursor:
                    cursor.execute(query, ids)
                    columns = [column[0] for column in cursor.description]
                    for row in cursor.fetchall():
                        data = dict(zip(columns, row))
                        result[str(data['id'])] = data
        except Exception as e:
            logger.error(f"MS SQL Server Error (Skipping): {e}")
        return result

    def _fetch_from_mysql(self, ids: List[str]) -> Dict[str, Dict[str, Any]]:
        result = {}
        try:
            # placeholders สำหรับ WHERE IN (%s, %s, %s)
            placeholders = ','.join(['%s'] * len(ids))
            query = f"SELECT id, product_name, product_price, product_size FROM source_table WHERE id IN ({placeholders})"
            
            with pymysql.connect(
                host=self.config.HOST,
                user=self.config.USER,
                password=self.config.PASSWORD,
                database=self.config.MYSQL_DB,
                connect_timeout=5,
                cursorclass=pymysql.cursors.DictCursor
            ) as conn:
                with conn.cursor() as cursor:
                    cursor.execute(query, ids)
                    for row in cursor.fetchall():
                        result[str(row['id'])] = row
        except Exception as e:
            logger.error(f"MySQL Error (Skipping): {e}")
        return result

    def _fetch_from_api(self, ids: List[str]) -> Dict[str, Dict[str, Any]]:
        result = {}
        try:
            payload = {"ids": ids}
            response = requests.post(self.config.API_ENDPOINT, json=payload, timeout=10)
            response.raise_for_status()
            
            # สมมติว่า API return กลับมาเป็นรูปแบบ [ {"id": "1", "product_name": "...", ...}, ... ]
            api_responses = response.json()
            for item in api_responses:
                if 'id' in item:
                    result[str(item['id'])] = item
        except Exception as e:
            logger.error(f"API Error (Skipping): {e}")
        return result

    def _update_postgresql(self, aggregated_data: Dict[str, Dict[str, Any]]) -> int:
        updated_rows = 0
        try:
            with psycopg2.connect(
                host=self.config.HOST,
                user=self.config.USER,
                password=self.config.PASSWORD,
                dbname=self.config.POSTGRES_DB,
                connect_timeout=5
            ) as conn:
                with conn.cursor() as cursor:
                    # เตรียมข้อมูลสำหรับ Execute Many
                    update_query = """
                        UPDATE m_promotion_bucket_entity 
                        SET product_name = %s, 
                            product_price = %s, 
                            product_size = %s
                        WHERE id = %s
                    """
                    
                    data_tuples = []
                    for item_id, data in aggregated_data.items():
                        data_tuples.append((
                            data.get('product_name'),
                            data.get('product_price'),
                            data.get('product_size'),
                            item_id
                        ))
                    
                    # ใช้ executemany เพื่อประสิทธิภาพระดับองค์กร (อัปเดตทีละหลายแถวพร้อมกัน)
                    cursor.executemany(update_query, data_tuples)
                    conn.commit()
                    updated_rows = cursor.rowcount
                    
        except Exception as e:
            logger.error(f"PostgreSQL Update Error: {e}")
            
        return updated_rows

# ---------------------------------------------------------
# 3. Example Usage (การเรียกใช้งานจาก API Framework)
# ---------------------------------------------------------
# ตัวอย่าง หากนำไปใช้ใน FastAPI หรือ Flask Controller:
#
# @app.post("/sync-promotions")
# def sync_promotions(payload: RequestPayload):
#     service = ProductDataSyncService()
#     result = service.sync_products(target_ids=payload.id_list)
#     return result