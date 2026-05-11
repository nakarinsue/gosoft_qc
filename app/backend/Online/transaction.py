
# ให้บันทึกเป็นไฟล์ models.py หรือวางแทนที่ใน Datainput.py
import xmltodict as xd
from datetime import datetime
from typing import Dict, Any
import random


class TransactionContext:
    def __init__(self, **kwargs):
        # ... (ข้อมูลตัวแปรเดิมทั้งหมด วางไว้เหมือนเดิม) ...
        self.store_id = kwargs.get("STORE_ID", "09884")
        self.vendor_id = kwargs.get("VENDOR_ID", "0993000134168")
        self.service_id = kwargs.get("SERVICE_ID", "02")
        self.item_name = kwargs.get("ITEM_NAME", "รับบริจาคเงิน")
        self.zone = kwargs.get("ZONE", "1")
        self.employee_id = kwargs.get("EMPLOYEE_ID", "0555505")
        self.pos_tax_id = kwargs.get("POS_TAX_ID", "1537264827382")
        self.payment_channel = kwargs.get("PAYMENT_CHANNEL", "C05")
        self.rept_type = kwargs.get("REPT_TYPE", "H")
        
        self.data_1 = kwargs.get("DATA_1", "6104274821")
        self.data_2 = kwargs.get("DATA_2", "")
        self.data_3 = kwargs.get("DATA_3", "")
        self.data_4 = kwargs.get("DATA_4", "")
        self.data_5 = kwargs.get("DATA_5", "")
        self.data_6 = kwargs.get("DATA_6", "")
        self.data_7 = kwargs.get("DATA_7", "")
        self.data_9 = kwargs.get("DATA_9", "")
        
        self.bill_amt = str(kwargs.get("BILL_AMT", "100"))
        self.vat_amt = kwargs.get("VAT_AMT", "0")
        
        self.cust_name = kwargs.get("CUST_NAME", "")
        self.cust_addr_1 = kwargs.get("CUST_ADDR_1", "")
        self.cust_addr_2 = kwargs.get("CUST_ADDR_2", "")
        self.cust_addr_3 = kwargs.get("CUST_ADDR_3", "")
        self.cust_phone_no = kwargs.get("CUST_PHONE_NO", "")
        
        self._refresh_timestamp()
        self.common_trn_id = str(random.randint(1, 100))
        
        # State Variables
        self.response_data: Dict[str, Any] = {}
        self.resp_tx_id = ""
        self.resp_vendor_id = self.vendor_id
        self.resp_serv_id = self.service_id
        self.calc_seq_no = "00000"
        self.calc_bill_amt = self.bill_amt

        # [NEW] เพิ่มตัวแปรสำหรับเก็บ XML และ Raw Response
        self.latest_request_xml = ""
        self.latest_raw_decoded_response = ""

    # ... (ฟังก์ชัน _refresh_timestamp และ process_response เหมือนเดิม) ...
    def _refresh_timestamp(self):
        now = datetime.now()
        self.sys_date = now.strftime("%Y/%m/%d")
        self.sys_time = now.strftime("%X")

    def process_response(self, xml_string: str):
        try:
            parsed = xd.parse(xml_string)
            hq_resp = parsed.get("HQ_RESPONSE", {})
            self.response_data = hq_resp
            
            self.resp_tx_id = hq_resp.get("TX_ID", self.resp_tx_id)
            self.resp_vendor_id = hq_resp.get("VENDOR_ID", self.resp_vendor_id)
            self.resp_serv_id = hq_resp.get("SERV_ID", self.resp_serv_id)
            
            try:
                if self.resp_tx_id and "|" in self.resp_tx_id:
                    tx_parts = self.resp_tx_id.split("|")
                    self.calc_seq_no = str(int(tx_parts[0][3:]) + len(tx_parts)).zfill(5)
                elif self.resp_tx_id:
                    self.calc_seq_no = str(int(self.resp_tx_id.replace("146", "")) + 1).zfill(5)
            except Exception:
                self.calc_seq_no = hq_resp.get("SEQ_NO", "00001")
                
            self.calc_bill_amt = hq_resp.get("BILL_AMT", self.bill_amt)
            
        except Exception as e:
            print(f"[Core Warning] ไม่สามารถประมวลผล XML State ได้: {e}")

    # ==========================================
    # [NEW] ฟังก์ชันรวบรวมข้อมูลตามที่ Request
    # ==========================================
    def get_full_summary(self) -> Dict[str, Any]:
        """รวบรวมข้อมูลทั้งหมดของ Transaction ให้อยู่ใน Dict เดียว"""
        return {
            "INPUT_VALUES": {
                "STORE_ID": self.store_id,
                "VENDOR_ID": self.vendor_id,
                "SERVICE_ID": self.service_id,
                "ITEM_NAME": self.item_name,
                "ZONE": self.zone,
                "BILL_AMT": self.bill_amt,
                "DATA_1": self.data_1,
                "DATA_2": self.data_2,
                "DATA_3": self.data_3,
                "DATA_4": self.data_4,
                "DATA_5": self.data_5,
                "DATA_6": self.data_6,
                "DATA_7": self.data_7,
                "DATA_9": self.data_9,
                "CUST_NAME": self.cust_name,
                "CUST_PHONE_NO": self.cust_phone_no
            },
            "GENERATED_VALUES": {
                "SYS_DATE": self.sys_date,
                "SYS_TIME": self.sys_time,
                "COMMON_TRN_ID": self.common_trn_id,
                "CALC_SEQ_NO": self.calc_seq_no,
                "CALC_BILL_AMT": self.calc_bill_amt
            },
            "REQUEST_XML": self.latest_request_xml,
            "DECODED_RAW_RESPONSE": self.latest_raw_decoded_response,
            "PARSED_DICT_RESPONSE": self.response_data
        }

    def get_compact_summary(self) -> Dict[str, Any]:
        """รวบรวมข้อมูลทั้งหมดแบบกรองค่าว่าง (None, "", {}, []) ออก"""
        full_data = self.get_full_summary()
        return self._remove_empty_values(full_data)

    def _remove_empty_values(self, data: Any) -> Any:
        """ฟังก์ชันช่วยเหลือ (Helper) สำหรับกรองค่าว่างแบบ Recursive"""
        if isinstance(data, dict):
            cleaned_dict = {}
            for key, value in data.items():
                cleaned_val = self._remove_empty_values(value)
                # เช็คว่าค่าไม่ได้เป็น None, string ว่าง, dict/list เปล่า
                if cleaned_val not in (None, "", {}, []):
                    cleaned_dict[key] = cleaned_val
            return cleaned_dict
        elif isinstance(data, list):
            cleaned_list = [self._remove_empty_values(item) for item in data]
            return [item for item in cleaned_list if item not in (None, "", {}, [])]
        else:
            return data