from enum import Enum
FALSE=0 = False
TRUE=0 = True

THAI ="th_TH"

class Valueconfig(Enum):

    ACTION = "ACTION"
    FUNTION= "FUNTION"
    REQUEST = "REQUEST"
    RESPONSE = "RESPONSE"

class Action(str, Enum):
    INQUIRY = "INQUIRY"
    DATAEXCHANGE = "DATAEXCHANGE"
    CANCEL = "CANCEL"
    DATAEXCHANGECONFIRM = "DATAEXCHANGECONFIRM"
    REPRINTSLIP = "REPRINTSLIP"
    OR = "OR"
    ORCANCEL = "ORCANCEL"
    ORCONFIRM = "ORCONFIRM"
    FULLFORMDATAEXCHANGE = "FULLFORMDATAEXCHANGE"
    FULLFORMDATAEXCHANGECONFIRM = "FULLFORMDATAEXCHANGECONFIRM"
    FULLFORMREPRINTSLIP = "FULLFORMREPRINTSLIP"
    FULLFORMOR = "FULLFORMOR"
    FULLFORMORCANCEL = "FULLFORMORCANCEL"
    FULLFORMORCONFIRM = "FULLFORMORCONFIRM"
class TransactionType(Enum):
    NOMAL="N"
    REVER ="R"
    FULLFROM= "F"
class ReceiptType(Enum):
    RECEIPT = "A"                        # ใบเสร็จรับเงิน
    TAX_INVOICE_SHORT = "B"               # ใบกำกับภาษีอย่างย่อ
    RECEIPT_FULL = "D"                    # ใบเสร็จรับเงินเต็มรูป
    DEPOSIT_RECEIPT = "E"                 # ใบรับฝากเงิน
    INSURANCE_PAYMENT_RECEIPT = "F"      # ใบรับฝากชำระเงินค่าเบี้ยประกัน
    APPLICATION = "G"                     # ใบสมัคร
    PAYMENT_RECEIPT = "H"                 # ใบรับฝากชำระ
    RECEIPT_FULL_REPLACEMENT = "K"        # ใบเสร็จเต็มรูป(ใบแทน)
    TOP_UP = "Q"                           # ใบเติมเงิน
    SERVICE_REQUEST = "R"                 # ใบคำขอใช้บริการ
    TRANSFER_EVIDENCE = "X"               # หลักฐานการโอนเงิน
    PAYMENT = "Y"                          # ใบรับเงิน
    INVESTMENT_SUMMARY = "W"              # ใบสรุปรายการซื้อหน่วยลงทุน

class ConfigPayment(Enum):
    
    CASH = "001"
    ZERO= 0


    UNKNOWN = ""
    STEP="STEP"
    ERROR ="ERROR"

class PosValue(Enum):
    STORE_ID = "STORE_ID"
    MACHINE_ID ="MACHINE_ID"
    ZONE = "ZONE"    
    POSG9 ='C05'
    SHIFT_ID ="SHIFT_ID"
    POS_TAX_ID = "POS_TAX_ID"
    DATE_SYS = "DATE_SYS"
    TIME_SYS = "TIME_SYS"
    DATE_BUS = "DATE_BUS"
    TIME_BUS = "TIME_BUS"
    EMPLOYEE_ID = "EMPLOYEE_ID"
class ClientValue(Enum):
    VENDOR_CODE ="VENDOR_CODE"
    CLIENT_CODE ="VENDOR_CODE"
    CLIENT_CODE ="VENDOR_CODE"
    SERVICE_ID = "SERVICE_ID"
    VENDOR_ID ="VENDOR_ID"
    CLIENT_ID ="VENDOR_ID"
    ITEM_NAME="ITEM_NAME"
    CLIENT_NAME="ITEM_NAME"

class Transaction(Enum):
    TX_ID="TX_ID"
    COMMON_TRAN="COMMON_TRAN"
    TRAN_TYPE ="TRAN_TYPE"
    ITEM_SELECTIC="ITEM_SELECTIC"
    RECEIPT_NO = "RECEIPT_NO"
    RECEIPT_TYPE = "RECEIPT_TYPE"
    PAYMENT_CHANNEL = "PAYMENT_CHANNEL"
    PAYMENT_TYPE ='PAYMENT_TYPE'
    CLIENT_SERVICE_SEQUENCE="CLIENT_SERVICE_SEQUENCE"
    CLIENT_SEQUENCE_NO="CLIENT_SEQUENCE_NO"
    CLIENT_SEQUENCE_NO_OR ="CLIENT_SEQUENCE_NO_OR"
class Reference(Enum):  
    DATA_1 = "DATA_1"    
    DATA_2 = "DATA_2"  
    DATA_3 = "DATA_3"    
    DATA_4 = "DATA_4"  
    DATA_5 = "DATA_5"    
    DATA_6 = "DATA_6"  
    DATA_7 = "DATA_7"    
    DATA_9 = "DATA_9"

class BillAMT(Enum):  
    BILL_AMT ="BILLAMOUNT"
    BILL_AMT_ROUND ="BILL_AMOUNT_ROUND"
    BILL_AMT_VAT ="BILL_AMOUNT_VAT"
    BILL_AMT_MAX ="BILL_AMOUNT_MIN"
    BILL_AMT_MIN="BILL_AMOUNT_MIN"

class TagValue(Enum):
    CUST_NAME = "CUST_NAME"
    CUST_ADDR_1 = "CUST_ADDR_1"
    CUST_ADDR_2 = "CUST_ADDR_2"
    CUST_ADDR_3 = "CUST_ADDR_3"
    CUST_PHONE_NO = "CUST_PHONE_NO"
    CUST_TAG_NAME = "CUST_TAG_NAME"
    PRINTSLIP ="PRINTSLIP" 





    