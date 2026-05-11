from typing import List, Dict, Any
from app.backend.database.common.connet_database_ssms import get_db_mssql


def get_product_data(items: List[str]) -> List[Dict[str, Any]]:
    # 1. คัดเฉพาะข้อมูลที่ไม่ใช่ค่าว่าง
    clean_items = [str(x).strip() for x in items if x and str(x).strip() != '']
    
    if not clean_items:
        return []
    print(len(items)) 

    conn = get_db_mssql()
    result_list = []
    
    try:
        cursor = conn.cursor()
        
        # 🌟 [จุดสำคัญ] กำหนดขนาด Chunk ห้ามเกิน 2,100 (ใช้ 1,000 เพื่อความปลอดภัยและรวดเร็ว)
        CHUNK_SIZE = 1000
        
        # หั่น clean_items ออกเป็นก้อนๆ ก้อนละ 1,000 ตัว
        for i in range(0, len(clean_items), CHUNK_SIZE):
            chunk = clean_items[i : i + CHUNK_SIZE]
            
            # สร้าง ? ตามจำนวนข้อมูลใน Chunk นั้น (สูงสุดไม่เกิน 1000 ตัว)
            placeholders = ', '.join(['?'] * len(chunk))
            
            # โครงสร้าง SQL เดิม
            sql_query = f"""
            SELECT PDPRD as PRODUCT_CODE
                ,PDNME as product_name
                ,PDPKF as product_packge
                ,PDPKZ as product_zise
                ,PDVFG as product_unit
                ,PDSUS as product_status
                ,PDORF as product_type
                ,BARCOD as BARCODE
                ,PRPRC as product_Price
                ,RTPRC as product_Retail
            FROM SC_DB.dbo.HO_PDINFF PD JOIN  
            SC_DB.dbo.HO_PDBARF BAR ON PD.PDPRD =BAR.BARPRD JOIN 
            SC_DB.dbo.HO_PDPRCF RC ON RC.PRPRD =BAR.BARPRD JOIN 
            SC_DB.dbo.HO_PDRTLF TL ON RC.PRPRD = TL.RTPRD
                WHERE PDSUS  = 'A' AND
                    BARSTT = 'A' AND 
                    PRSUS  = 'A' AND 
                    RTSUS  = 'A' AND
                    PDPRD IN ( {placeholders})

            """
            cursor.execute(sql_query, chunk)
            
            # ดึงชื่อคอลัมน์และเก็บผลลัพธ์ของรอบนี้มารวมกัน
            columns = [column[0] for column in cursor.description]
            for row in cursor.fetchall():
                result_list.append(dict(zip(columns, row)))
            print(len(result_list)) 

    except Exception as e:
        print(f"❌ Error executing query on chunk: {e}")
        raise
        
    finally:
        cursor.close()
        conn.close()
        
    return result_list

def get_coupon_mapping(items: List[str]) -> List[Dict[str, Any]]:
    # 1. คัดเฉพาะข้อมูลที่ไม่ใช่ค่าว่าง
    clean_items = [str(x).strip() for x in items if x and str(x).strip() != '']
    
    if not clean_items:
        return []
    print(len(items)) 
    conn = get_db_mssql()
    result_list = []
    
    try:
        cursor = conn.cursor()
        
        # 🌟 [จุดสำคัญ] กำหนดขนาด Chunk ห้ามเกิน 2,100 (ใช้ 1,000 เพื่อความปลอดภัยและรวดเร็ว)
        CHUNK_SIZE = 1000
        
        # หั่น clean_items ออกเป็นก้อนๆ ก้อนละ 1,000 ตัว
        for i in range(0, len(clean_items), CHUNK_SIZE):
            chunk = clean_items[i : i + CHUNK_SIZE]
            
            # สร้าง ? ตามจำนวนข้อมูลใน Chunk นั้น (สูงสุดไม่เกิน 1000 ตัว)
            placeholders = ', '.join(['?'] * len(chunk))
            
            # โครงสร้าง SQL เดิม
            sql_query = f"""
            SELECT PDPRD as PRODUCT_CODE
                ,PDNME as product_name
                ,PDPKF as product_packge
                ,PDPKZ as product_zise
                ,PDVFG as product_unit
                ,PDSUS as product_status
                ,PDORF as product_type
                ,BARCOD as BARCODE
                ,PRPRC as product_Price
                ,RTPRC as product_Retail
            FROM SC_DB.dbo.HO_PDINFF PD JOIN  
            SC_DB.dbo.HO_PDBARF BAR ON PD.PDPRD =BAR.BARPRD JOIN 
            SC_DB.dbo.HO_PDPRCF RC ON RC.PRPRD =BAR.BARPRD JOIN 
            SC_DB.dbo.HO_PDRTLF TL ON RC.PRPRD = TL.RTPRD
                WHERE PDSUS  = 'A' AND
                    BARSTT = 'A' AND 
                    PRSUS  = 'A' AND 
                    RTSUS  = 'A' AND
                    PDPRD IN ( {placeholders})

            """
            cursor.execute(sql_query, chunk)
            
            # ดึงชื่อคอลัมน์และเก็บผลลัพธ์ของรอบนี้มารวมกัน
            columns = [column[0] for column in cursor.description]
            for row in cursor.fetchall():
                result_list.append(dict(zip(columns, row)))
            print(len(result_list)) 
    except Exception as e:
        print(f"❌ Error executing query on chunk: {e}")
        raise
        
    finally:
        cursor.close()
        conn.close()
        
    return result_list