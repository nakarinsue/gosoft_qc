import random
from datetime import datetime
from typing import Optional, Dict, Any, List
import xmltodict as xd

class TransactionDataManager:
    _instance = None

    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            cls._instance = super(TransactionDataManager, cls).__new__(cls)
        return cls._instance

    def __init__(self, **kwargs):
        # ป้องกันการ reset ค่าเมื่อเรียก class ซ้ำ (Singleton)
        if hasattr(self, '_initialized'):
            return
        
        # --- Core Identifiers ---
        self.store_id = kwargs.get("STORE_ID", "09892")
        self.vendor_id = kwargs.get("VENDOR_ID", "82204")
        self.service_id = kwargs.get("SERVICE_ID", "00")
        self.item_name = kwargs.get("ITEM_NAME", "Test")
        
        # --- Transaction Reference Data (1-9) ---
        self.ref_data = {
            f"DATA_{i}": kwargs.get(f"DATA_{i}") for i in range(1, 10) if i != 8
        }
        
        # --- Amount Configurations ---
        self.amt_min = str(kwargs.get("AMTmin", "1"))
        self.amt_max = str(kwargs.get("AMTmax", "90000"))
        self.bill_amt = str(kwargs.get("BILL_AMT", "50"))
        self.vat_amt = "0"
        
        # --- Customer Information ---
        self.customer = {
            "NAME": kwargs.get("CUST_NAME", ""),
            "ADDR_1": kwargs.get("CUST_ADDR_1", ""),
            "ADDR_2": kwargs.get("CUST_ADDR_2", ""),
            "ADDR_3": kwargs.get("CUST_ADDR_3", ""),
            "PHONE": kwargs.get("CUST_PHONE_NO", "")
        }
        
        # --- System & Fixed Fields ---
        self.zone = "1"
        self.employee_id = "0555505"
        self.pos_tax_id = "1537264827382"
        self.rept_type = "H"
        self.payment_channel = 'C05'
        self.edit_out = kwargs.get("Editout")
        
        # --- Time States ---
        self.time_state = {
            "minutes": 0, "hours": 0,
            "minutes_new": 0, "hours_new": 0
        }
        
        self._initialized = True

    # --- Property Accessors (Modern Getter/Setter) ---
    @property
    def system_timestamp(self) -> Dict[str, str]:
        now = datetime.now()
        return {
            "DATE": now.strftime("%Y/%m/%d"),
            "TIME": now.strftime("%X")
        }

    def set_time(self, minutes: int, hours: int, mode: int = 0):
        if mode == 1:
            self.time_state["minutes"], self.time_state["hours"] = minutes, hours
        else:
            self.time_state["minutes_new"], self.time_state["hours_new"] = minutes, hours

    # --- Data Processing Methods ---
    def generate_transaction_packet(self) -> Dict[str, Any]:
        """สร้างชุดข้อมูลสำหรับส่งต่อหรือแสดงผล (Enterprise Standard)"""
        ts = self.system_timestamp
        
        # Process REF DATA
        processed_ref = {}
        for key, val in self.ref_data.items():
            if isinstance(val, int):
                processed_ref[key] = {
                    "data": ''.join([str(random.randint(0, 9)) for _ in range(val)]),
                    "length": val
                }
            else:
                processed_ref[key] = {"data": val or "", "length": len(str(val or ""))}

        return {
            "VENDOR": {
                "VENDOR_ID": self.vendor_id,
                "SERVICE_ID": self.service_id,
                "ITEM_NAME": self.item_name
            },
            "STORE": {
                "STORE_ID": self.store_id,
                "ZONE": self.zone,
                "REPT_TYPE": self.rept_type,
                "PAYMENT_CHANNEL": self.payment_channel,
                "EMPLOYEE_ID": self.employee_id,
                "POS_TAX_ID": self.pos_tax_id,
                "SYS_DATE": ts["DATE"],
                "SYS_TIME": ts["TIME"]
            },
            "AMOUNT": {
                "VAT_AMT": self.vat_amt,
                "BILL_AMT": self.bill_amt,
                "MIN_AMT": self.amt_min,
                "MAX_AMT": self.amt_max,
                "EDIT_AMT": float(self.bill_amt) + 5,
                "BILL_PONT": f"{float(self.bill_amt) + 0.34:.2f}"
            },
            "CUSTOMER": self.customer,
            "REF": processed_ref
        }

    def process_xml_response(self) -> Optional[Dict[str, Any]]:
        """ประมวลผลข้อมูลจาก XML Response"""
        if not self.edit_out:
            return None
            
        try:
            raw_dict = xd.parse(self.edit_out).get('HQ_RESPONSE', {})
            tx_id = str(raw_dict.get('TX_ID', ''))
            tx_id_list = tx_id.split('|')
            
            # Logic การคำนวณ Transaction
            common_tran_list = [
                str(int(i[3:]) + len(tx_id_list)).zfill(5) 
                for i in tx_id_list if len(i) > 3
            ]
            
            amt_bill = str(raw_dict.get('BILL_AMT', '0'))
            amt_parts = amt_bill.split('|')
            if amt_parts:
                amt_parts[0] = str(float(amt_parts[0]) + 2)

            return {
                "TX_ID": tx_id,
                "COMMONTRAN_N": tx_id_list[0][3:].zfill(5) if tx_id_list else "00000",
                "COMMONTRAN_STR": "|".join(common_tran_list),
                "AMT": "|".join(amt_parts),
                "RAW_RESPONSE": raw_dict
            }
        except Exception as e:
            print(f"Error parsing XML: {e}")
            return None

# --- การนำไปใช้งาน (Usage Example) ---
if __name__ == "__main__":
    # เรียกใช้ครั้งแรกเพื่อตั้งค่า
    data_manager = TransactionDataManager(STORE_ID="BK001", ITEM_NAME="Coffee")
    
    # เรียกใช้ที่ไหนก็ได้ในโปรแกรม (ไม่ต้องส่งตัวแปรข้ามไปมา)
    another_call = TransactionDataManager() 
    print(f"Store ID: {another_call.store_id}") # จะได้ "BK001" เสมอ
    
    # Gen ข้อมูล
    packet = another_call.generate_transaction_packet()
    print(f"Current Date: {packet['STORE']['SYS_DATE']}")