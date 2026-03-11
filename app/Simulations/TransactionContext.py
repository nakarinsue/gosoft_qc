

import random
import pandas as pd
from datetime import datetime
from dataclasses import dataclass, field
from typing import Any, Dict
# ตั้งค่า Pandas
pd.set_option('display.max_columns', None)
pd.set_option('display.max_rows', None)
pd.set_option('display.max_colwidth', None)

@dataclass
class StoreConfig:
    store_id: str = "09892"
    zone: str = "1"
    employee_id: str = "0555505"
    pos_tax_id: str = "1537264827382"
    vendor_id: str = "82204"
    service_id: str = "00"
    item_name: str = "Test"
    vat_amt: str = "0"
    rept_type: str = "H"
    payment_channel: str = "C05"

@dataclass
class CustomerInfo:
    name: str = ""
    addr_1: str = ""
    addr_2: str = ""
    addr_3: str = ""
    phone_no: str = ""

@dataclass
class BillInfo:
    amt_min: str = "1"
    amt_max: str = "90000"
    bill_amt: str = "50"

@dataclass
class TransactionContext:
    """Class เก็บ Context ของการทำ Transaction ทั้งหมด แทนการใช้ Array ซ้อน Array"""
    store: StoreConfig = field(default_factory=StoreConfig)
    customer: CustomerInfo = field(default_factory=CustomerInfo)
    bill: BillInfo = field(default_factory=BillInfo)
    
    # ข้อมูล Data 1-9 (รองรับ str, int, list)
    data_1: Any = None
    data_2: Any = None
    data_3: Any = None
    data_4: Any = None
    data_5: Any = None
    data_6: Any = None
    data_7: Any = None
    data_9: Any = None
    
    step: int = 1
    bus_date: str = field(default_factory=lambda: datetime.now().strftime("%Y/%m/%d"))
    bus_time: str = field(default_factory=lambda: datetime.now().strftime("%X"))
    common_trn_id: str = field(default_factory=lambda: str(random.randint(0, 100)))

    # ข้อมูลที่ดึงกลับมาจาก Response ก่อนหน้า (ใช้ทำ Cancel / Confirm)
    ref_data: Dict[str, str] = field(default_factory=dict)

    def prepare_data(self):
        """แปลงค่า int (Gen เลขสุ่ม) และ list (วนลูปตาม step) ให้เป็น String พร้อมใช้งาน"""
        data_fields = ['data_1', 'data_2', 'data_3', 'data_4', 'data_5', 'data_6', 'data_7', 'data_9']
        for attr in data_fields:
            val = getattr(self, attr)
            if isinstance(val, int):
                setattr(self, attr, ''.join([str(random.randint(0, 9)) for _ in range(val)]))
            elif isinstance(val, list):
                setattr(self, attr, str(val[self.step % len(val)]))
            elif val is None:
                setattr(self, attr, "")
            else:
                setattr(self, attr, str(val))
        self.step += 1

    def load_reference_from_response(self, response_dict: Dict[str, Any]):
        """
        ดึงและคำนวณค่าจาก Response ก่อนหน้า เพื่อใช้ประกอบ Payload ของ Action ถัดไป
        ครอบคลุม Logic การทำ Substring และการบวกค่า SUM_SEQ, SUM_AMT จากโค้ดต้นฉบับ
        """
        tx_id_full = str(response_dict.get('TX_ID', ''))
        bill_amt_full = str(response_dict.get('BILL_AMT', '0'))
        
        # 1. จัดการ SEQ_NO และ TX_ID (อ้างอิง: ตัด "145" ออกตาม logic เดิม)
        seq_no1 = tx_id_full.replace("145", "")
        tx_id2 = tx_id_full[:8] if len(tx_id_full) >= 8 else tx_id_full
        
        sum_seq = ""
        sum_amt = ""
        
        # 2. คำนวณ SUM_SEQ และ SUM_AMT
        # ใช้ .zfill(5) แทนฟังก์ชัน CHECK_Length เดิม เพื่อเติมเลข 0 ด้านหน้าให้ครบ 5 หลัก
        if len(seq_no1) == 5:
            # กรณี Single Transaction
            try:
                sum_seq = str(int(seq_no1) + 1).zfill(5)
                sum_amt = str(float(bill_amt_full) + 2)
            except ValueError:
                sum_seq = seq_no1
                sum_amt = bill_amt_full
                
        elif len(seq_no1) > 5:
            # กรณี Multiple Transaction (มีการใช้เครื่องหมาย | คั่น)
            try:
                # โค้ดเดิม: ดึงตำแหน่ง [0:5] และ [6:11] มาบวก 2
                seq_no2 = str(int(seq_no1[0:5]) + 2).zfill(5)
                seq_no3 = str(int(seq_no1[6:11]) + 2).zfill(5) if len(seq_no1) >= 11 else ""
                sum_seq = f"{seq_no2}|{seq_no3}" if seq_no3 else seq_no2
                
                # จัดการ BILL_AMT ที่มี | คั่น
                if "|" in bill_amt_full:
                    parts = bill_amt_full.split("|")
                    amt1 = str(float(parts[0]) + 2)
                    amt2 = parts[1] 
                    sum_amt = f"{amt1}|{amt2}"
                else:
                    sum_amt = str(float(bill_amt_full) + 2)
            except Exception:
                # ป้องกัน Error กรณี Parsing ไม่สำเร็จ ให้ใช้ค่าตั้งต้น
                sum_seq = seq_no1
                sum_amt = bill_amt_full

        # 3. จัดเก็บลง Dictionary เพื่อให้ SoapPayloadBuilder เรียกใช้ได้ง่าย
        self.ref_data = {
            'VENDOR_ID': str(response_dict.get('VENDOR_ID', '')),
            'SERV_ID': str(response_dict.get('SERV_ID', '')),
            'TX_ID': tx_id2,
            'SEQ_NO': seq_no1,
            'SUM_SEQ': sum_seq,      # ค่าที่ถูกบวก +1 หรือ +2 แล้ว
            'BILL_AMT': bill_amt_full,
            'SUM_AMT': sum_amt,      # ค่าที่ถูกบวก +2 แล้ว
            
            # เก็บข้อมูล DATA 1-9
            'DATA_1': str(response_dict.get('DATA_1', '')),
            'DATA_2': str(response_dict.get('DATA_2', '')),
            'DATA_3': str(response_dict.get('DATA_3', '')),
            'DATA_4': str(response_dict.get('DATA_4', '')),
            'DATA_5': str(response_dict.get('DATA_5', '')),
            'DATA_6': str(response_dict.get('DATA_6', '')),
            'DATA_7': str(response_dict.get('DATA_7', '')),
            'DATA_9': str(response_dict.get('DATA_9', '')),
            
            # เก็บข้อมูลลูกค้า (แมปจาก XML Response ที่คุณตั้งไว้ใน Llistout)
            'CUST_NAME': str(response_dict.get('CUSTOMER_NAME', '')),
            'CUST_ADDR_1': str(response_dict.get('CUSTOMER_ADDR_1', '')),
            'CUST_ADDR_2': str(response_dict.get('CUSTOMER_ADDR_2', '')),
            'CUST_ADDR_3': str(response_dict.get('CUSTOMER_ADDR_3', '')),
            'CUST_PHONE_NO': str(response_dict.get('CUSTOMER_TEL_NO', ''))
        }
