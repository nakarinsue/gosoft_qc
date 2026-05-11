from dataclasses import dataclass
from typing import Optional, Literal
from datetime import datetime
from faker import Faker

fake = Faker('th_TH')

@dataclass
class TransactionData:
    """โครงสร้างข้อมูลสำหรับการทำรายการ ครอบคลุมฟิลด์ที่ Server ต้องการทั้งหมด"""
    store_id: str = "09892"
    vendor_id: str = "82204"
    service_id: str = "00"
    item_name: str = "ชื่อบริการ"
    bill_amt: float = 50.0
    round_bill_amt:float = 50.0
    vat_amt:int = 0
    station_id: int = 1
    zone: Literal[1, 2] = 1
    shift_no: int=1
    employee: str = '0555505'
    pos_tax_id: str = fake.vat_id().replace('-', '')
    receipt_type: Literal["H"] = 'H'

    code: Optional[str] = ""
    status: Optional[str] = ""
    message: Optional[str] = ""
    tx_id: Optional[str] = ""
    tag_printslip: Optional[str] = ""
    item_selection: Optional[str] = "N"
    seq_no: Optional[str] = ""
    client_serv_no: Optional[str] = ""
    cancel_id: Optional[str] = ""





    # ระบบต้องการ Date/Time เป็น Format เฉพาะ
    bus_date: str = datetime.now().strftime("%d/%m/%Y")
    bus_time: str = datetime.now().strftime("%H:%M:%S")
    common_trn_id: str = "1" # จำเป็นต้อง Generate ตาม Flow ของคุณ
    payment_chanel: Literal['C05'] = 'C05'
    payment_type: Literal['001'] = '001'

    # ข้อมูล DATA_1 ถึง DATA_9
    data_1: Optional[str] = ""
    data_2: Optional[str] = ""
    data_3: Optional[str] = ""
    data_4: Optional[str] = ""
    data_5: Optional[str] = ""
    data_6: Optional[str] = ""
    data_7: Optional[str] = ""
    data_9: Optional[str] = ""

    cust_addr_1: Optional[str] = fake.address()
    cust_addr_2: Optional[str] = ""
    cust_addr_3: Optional[str] = ""
    cust_addr_4: Optional[str] = ""
    cust_name: Optional[str] = fake.name()
    cust_phone_no: Optional[str] = ""
    cust_receipt_addr: Optional[str] = ""
    rept_no: Optional[str] = ""
    rept_ref_seq: Optional[str] = ""
    rept_ref_type: Optional[str] = ""

    service_id_fee: Optional[str] = ""
    client_id_fee: Optional[str] = ""
    fee_data_1: Optional[str] = ""
    fee_data_2: Optional[str] = ""
    fee_data_3: Optional[str] = ""
    fee_amt: Optional[str] = ""
    trans_type: Optional[str] = "N"
    fee_amt_round: Optional[str] = ""


    def to_dict(self) -> dict:
        """แปลงเป็น Dict โดยมี Default Values ครบถ้วนตาม Schema เดิม และแปลง Value ทุกตัวเป็น String"""
        # สร้าง Dictionary ดิบโดยอ้างอิงจาก Attributes ทั้งหมด
        raw_dict = {
            "PAYMENT_CHANNEL": self.payment_chanel,
            "VENDOR_ID": self.vendor_id,
            "SERV_ID": self.service_id,
            "SERVICE_ID": self.service_id,
            "STORE_ID": self.store_id,
            "STATION_ID": self.station_id,
            "BUS_DATE": self.bus_date,
            "BUS_TIME": self.bus_time,
            "SYS_DATE": self.bus_date,
            "SYS_TIME": self.bus_time,
            "COMMON_TRN_ID": self.common_trn_id,
            "SEQ_NO": self.seq_no,
            "CLIENT_SERV_SEQ": self.client_serv_no,
            "SHIFT_ID": self.shift_no,
            "TRANS_TYPE": self.trans_type,
            "ACCT_NO": "",
            "BILL_AMT": self.bill_amt,
            "ROUND_BILL_AMT": self.bill_amt,
            "VAT_AMT": self.vat_amt,
            "REPT_TYPE": self.receipt_type,
            "REPT_NO": self.rept_no,
            "PREV_REF_SEQ": self.rept_ref_seq,
            "PREV_REF_DATE": "",
            "SERV_CHARGE_NO": "",
            "ITEM_NAME": self.item_name,
            "ITEM_SELECTION": self.item_selection,
            "EMPLOYEE_ID": self.employee,
            "POS_TAX_ID": self.pos_tax_id,
            "DATA_1": self.data_1,
            "DATA_2": self.data_2,
            "DATA_3": self.data_3,
            "DATA_4": self.data_4,
            "DATA_5": self.data_5,
            "DATA_6": self.data_6,
            "DATA_7": self.data_7,
            "DATA_9": self.data_9,
            "ZONE": self.zone,
            "PAYMENT_TYPE": self.payment_type,
            "CANCEL_ID": self.cancel_id,
            "CUST_NAME": self.cust_name,
            "CUST_ADDR_1": self.cust_addr_1,
            "CUST_ADDR_2": self.cust_addr_2,
            "CUST_ADDR_3": self.cust_addr_3,
            "CUST_ADDR_4": self.cust_addr_4, # แก้ไขให้ดึงค่าจาก cust_addr_4 อย่างถูกต้อง
            "CUST_PHONE_NO": self.cust_phone_no
        }

        # ใช้ Dict Comprehension ในการแปลงทุก Value เป็น String รวดเดียว
        # หากพบว่าค่าใดเป็น None จะถูกแปลงเป็น String ว่าง ("") เพื่อป้องกันค่า "None" หลุดไปที่ Server
        return {key: ("" if value is None else str(value)) for key, value in raw_dict.items()}