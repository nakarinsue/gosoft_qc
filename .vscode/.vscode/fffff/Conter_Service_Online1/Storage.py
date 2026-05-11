# import xmltodict as xd
from datetime import datetime,timedelta 
from Conter_Service_Online.imports import *

from Conter_Service_Online.connect_Database import *
import time
class XML():
   def __init__(self,store):
      self.store = store
   def Exchange(self):
      DataExchange = f"""<?xml version="1.0" encoding="UTF-8"?><HQ_REQUEST><SERVICE_BOX><ADDRESS><VENDOR_ID>{self.store[0][0][4]}</VENDOR_ID><SERVICE_ID>{self.store[0][0][5]}</SERVICE_ID><METHOD>DataExchange</METHOD></ADDRESS><DATA><PAYMENT_CHANNEL>{self.store[0][0][9]}</PAYMENT_CHANNEL><VENDOR_ID>{self.store[0][0][4]}</VENDOR_ID><SERV_ID>{self.store[0][0][5]}</SERV_ID><SERVICE_ID>{self.store[0][0][5]}</SERVICE_ID><STORE_ID>{self.store[0][0][0]}</STORE_ID><STATION_ID>1</STATION_ID><BUS_DATE>{self.store[0][4][0]}</BUS_DATE><BUS_TIME>{self.store[0][4][1]}</BUS_TIME><SYS_DATE>{self.store[0][4][0]}</SYS_DATE><SYS_TIME>{self.store[0][4][1]}</SYS_TIME><COMMON_TRN_ID>{self.store[0][4][2]}</COMMON_TRN_ID><SEQ_NO></SEQ_NO><CLIENT_SERV_SEQ></CLIENT_SERV_SEQ><SHIFT_ID>9</SHIFT_ID><TRANS_TYPE>N</TRANS_TYPE><ACCT_NO></ACCT_NO><BILL_AMT>{self.store[0][2][2]}</BILL_AMT><ROUND_BILL_AMT>{self.store[0][2][2]}</ROUND_BILL_AMT><VAT_AMT>{self.store[0][0][7]}</VAT_AMT><REPT_TYPE>{self.store[0][0][8]}</REPT_TYPE><REPT_NO></REPT_NO><PREV_REF_SEQ></PREV_REF_SEQ><PREV_REF_DATE></PREV_REF_DATE><SERV_CHARGE_NO></SERV_CHARGE_NO><ITEM_NAME>{self.store[0][0][6]}</ITEM_NAME><ITEM_SELECTION>N</ITEM_SELECTION><EMPLOYEE_ID>{self.store[0][0][2]}</EMPLOYEE_ID><POS_TAX_ID>{self.store[0][0][3]}</POS_TAX_ID><DATA_1>{self.store[0][1][0]}</DATA_1><DATA_2>{self.store[0][1][1]}</DATA_2><DATA_3>{self.store[0][1][2]}</DATA_3><DATA_4>{self.store[0][1][3]}</DATA_4><DATA_5>{self.store[0][1][4]}</DATA_5><DATA_6>{self.store[0][1][5]}</DATA_6><DATA_7>{self.store[0][1][6]}</DATA_7><DATA_9>{self.store[0][1][7]}</DATA_9><ZONE>{self.store[0][0][1]}</ZONE><PAYMENT_TYPE>001</PAYMENT_TYPE><CANCEL_ID></CANCEL_ID><CUST_NAME>{self.store[0][3][0]}</CUST_NAME><CUST_ADDR_1>{self.store[0][3][1]}</CUST_ADDR_1><CUST_ADDR_2>{self.store[0][3][2]}</CUST_ADDR_2><CUST_ADDR_3>{self.store[0][3][3]}</CUST_ADDR_3><CUST_PHONE_NO>{self.store[0][3][4]}</CUST_PHONE_NO></DATA></SERVICE_BOX></HQ_REQUEST>"""
      return DataExchange
   def Can(self): 
      Cancel = f"""<?xml version="1.0" encoding="UTF-8"?><HQ_REQUEST><SERVICE_BOX><ADDRESS><VENDOR_ID>{self.store[0][0][4]}</VENDOR_ID><SERVICE_ID>{self.store[0][0][5]}</SERVICE_ID><METHOD>Cancel</METHOD></ADDRESS><DATA><PAYMENT_CHANNEL>{self.store[0][0][9]}</PAYMENT_CHANNEL><VENDOR_ID>{self.store[2][6][3]}</VENDOR_ID><SERV_ID>{self.store[2][6][4]}</SERV_ID><SERVICE_ID>{self.store[2][6][4]}</SERVICE_ID><STORE_ID>{self.store[0][0][0]}</STORE_ID><STATION_ID>1</STATION_ID><BUS_DATE>{self.store[0][4][0]}</BUS_DATE><BUS_TIME>{self.store[0][4][1]}</BUS_TIME><TX_ID>{self.store[2][6][5]}</TX_ID><PAYMENT_TYPE>001</PAYMENT_TYPE><CANCEL_ID></CANCEL_ID></DATA></SERVICE_BOX></HQ_REQUEST>"""
      return Cancel
   def ExchangeConfirm (self):
         DataExchangeConfirm =f"""<?xml version="1.0" encoding="UTF-8"?><HQ_REQUEST><SERVICE_BOX><ADDRESS><VENDOR_ID>{self.store[0][0][4]}</VENDOR_ID><SERVICE_ID>{self.store[0][0][5]}</SERVICE_ID><METHOD>DataExchangeConfirm</METHOD></ADDRESS><DATA><PAYMENT_CHANNEL>{self.store[0][0][9]}</PAYMENT_CHANNEL><VENDOR_ID>{self.store[2][6][3]}</VENDOR_ID><SERV_ID>{self.store[2][6][4]}</SERV_ID><SERVICE_ID>{self.store[2][6][4]}</SERVICE_ID><STATION_ID>1</STATION_ID><STORE_ID>{self.store[0][0][0]}</STORE_ID><BUS_DATE>{self.store[0][4][0]}</BUS_DATE><BUS_TIME>{self.store[0][4][1]}</BUS_TIME><SYS_DATE>{self.store[0][4][0]}</SYS_DATE><SYS_TIME>{self.store[0][4][1]}</SYS_TIME><TX_ID>{self.store[2][6][5]}</TX_ID><SEQ_NO>{self.store[2][1]}</SEQ_NO><EMPLOYEE_ID>{self.store[0][0][2]}</EMPLOYEE_ID><CLIENT_SERV_SEQ>{self.store[2][1]}</CLIENT_SERV_SEQ><SERV_ID>{self.store[0][0][5]}</SERV_ID><BILL_AMT>{self.store[2][6][8]}</BILL_AMT><ROUND_BILL_AMT>{self.store[2][6][8]}</ROUND_BILL_AMT><ACCT_NO></ACCT_NO><VAT_AMT>{self.store[0][0][7]}</VAT_AMT><DATA_1>{self.store[2][6][11]}</DATA_1><DATA_2>{self.store[2][6][12]}</DATA_2><DATA_3>{self.store[2][6][13]}</DATA_3><DATA_4>{self.store[2][6][14]}</DATA_4><DATA_5>{self.store[2][6][15]}</DATA_5><DATA_6>{self.store[2][6][16]}</DATA_6><DATA_7>{self.store[2][6][17]}</DATA_7><DATA_9>{self.store[2][6][18]}</DATA_9><ZONE>{self.store[0][0][1]}</ZONE><PAYMENT_TYPE>001</PAYMENT_TYPE><TOT_BILL_TRANS></TOT_BILL_TRANS><TOT_BILL_AMT></TOT_BILL_AMT><TOT_VENDOR_TRANS></TOT_VENDOR_TRANS><TOT_VENDOR_AMT></TOT_VENDOR_AMT><TOT_COUNTER_TRANS></TOT_COUNTER_TRANS><TOT_COUNTER_AMT></TOT_COUNTER_AMT><TOT_CLIENT_TRANS></TOT_CLIENT_TRANS><TOT_CLIENT_AMT></TOT_CLIENT_AMT><TOT_BILL_TRANS_OR></TOT_BILL_TRANS_OR><TOT_BILL_AMT_OR></TOT_BILL_AMT_OR><CANCEL_ID></CANCEL_ID><CANCEL_ID></CANCEL_ID><CUST_NAME>{self.store[2][6][20]}</CUST_NAME><CUST_ADDR_1>{self.store[2][6][21]}</CUST_ADDR_1><CUST_ADDR_2>{self.store[2][6][22]}</CUST_ADDR_2><CUST_ADDR_3>{self.store[2][6][23]}</CUST_ADDR_3><CUST_PHONE_NO>{self.store[2][6][24]}</CUST_PHONE_NO></DATA></SERVICE_BOX></HQ_REQUEST>"""
         return  DataExchangeConfirm
   def Print(self):
      Reprint =f"""<?xml version="1.0" encoding="UTF-8"?><HQ_REQUEST><SERVICE_BOX><ADDRESS><VENDOR_ID>{self.store[0][0][4]}</VENDOR_ID><SERVICE_ID>{self.store[0][0][5]}</SERVICE_ID><METHOD>REPRINTSLIP</METHOD></ADDRESS><DATA><PAYMENT_CHANNEL>{self.store[0][0][9]}</PAYMENT_CHANNEL><VENDOR_ID>{self.store[2][6][3]}</VENDOR_ID><SERV_ID>{self.store[2][6][4]}</SERV_ID><SERVICE_ID>{self.store[2][6][4]}</SERVICE_ID><STORE_ID>{self.store[0][0][0]}</STORE_ID><STATION_ID>1</STATION_ID><BUS_DATE>{self.store[0][4][0]}</BUS_DATE><BUS_TIME>{self.store[0][4][1]}</BUS_TIME><COMMON_TRN_ID>{self.store[0][4][2]}</COMMON_TRN_ID><SEQ_NO>{self.store[2][1]}</SEQ_NO><CLIENT_SERV_SEQ>{self.store[2][1]}</CLIENT_SERV_SEQ><SHIFT_ID>9</SHIFT_ID><TRANS_TYPE>N</TRANS_TYPE><ACCT_NO></ACCT_NO><BILL_AMT>{self.store[2][6][8]}</BILL_AMT><ROUND_BILL_AMT>{self.store[2][6][8]}</ROUND_BILL_AMT><VAT_AMT>{self.store[0][0][7]}</VAT_AMT><REPT_TYPE>{self.store[0][0][8]}</REPT_TYPE><TX_ID>{self.store[2][0]}</TX_ID><REPT_NO></REPT_NO><PREV_REF_SEQ></PREV_REF_SEQ><PREV_REF_DATE></PREV_REF_DATE><SERV_CHARGE_NO></SERV_CHARGE_NO><ITEM_NAME>{self.store[0][0][6]}</ITEM_NAME><ITEM_SELECTION>N</ITEM_SELECTION><EMPLOYEE_ID>{self.store[0][0][2]}</EMPLOYEE_ID><POS_TAX_ID>{self.store[0][0][3]}</POS_TAX_ID><DATA_1>{self.store[2][6][11]}</DATA_1><DATA_2>{self.store[2][6][12]}</DATA_2><DATA_3>{self.store[2][6][13]}</DATA_3><DATA_4>{self.store[2][6][14]}</DATA_4><DATA_5>{self.store[2][6][15]}</DATA_5><DATA_6>{self.store[2][6][16]}</DATA_6><DATA_7>{self.store[2][6][17]}</DATA_7><DATA_9>{self.store[2][6][18]}</DATA_9><ZONE>{self.store[0][0][1]}</ZONE><CANCEL_ID></CANCEL_ID></DATA></SERVICE_BOX></HQ_REQUEST>"""
      return Reprint
   def Or (self):
      AtionoR = f"""<?xml version="1.0" encoding="UTF-8"?><HQ_REQUEST><SERVICE_BOX><ADDRESS><VENDOR_ID>{self.store[0][0][4]}</VENDOR_ID><SERVICE_ID>{self.store[0][0][5]}</SERVICE_ID><METHOD>OR</METHOD></ADDRESS><DATA><PAYMENT_CHANNEL>{self.store[0][0][9]}</PAYMENT_CHANNEL><VENDOR_ID>{self.store[2][6][3]}</VENDOR_ID><SERVICE_ID>{self.store[2][6][4]}</SERVICE_ID><SERV_ID>{self.store[2][6][4]}</SERV_ID><STORE_ID>{self.store[0][0][0]}</STORE_ID><STATION_ID>1</STATION_ID><BUS_DATE>{self.store[0][4][0]}</BUS_DATE><BUS_TIME>{self.store[0][4][1]}</BUS_TIME><SYS_DATE>{self.store[0][4][0]}</SYS_DATE><SYS_TIME>{self.store[0][4][1]}</SYS_TIME><TX_ID>{self.store[2][6][5]}</TX_ID><BILL_AMT>{self.store[2][6][8]}</BILL_AMT><ROUND_BILL_AMT>{self.store[2][6][8]}</ROUND_BILL_AMT><VAT_AMT>{self.store[0][0][7]}</VAT_AMT><PAYMENT_TYPE>001</PAYMENT_TYPE><CANCEL_ID></CANCEL_ID></DATA></SERVICE_BOX></HQ_REQUEST>"""
      return AtionoR
   def ORCancel(self):
      ORCancel = f"""<?xml version="1.0" encoding="UTF-8"?><HQ_REQUEST><SERVICE_BOX><ADDRESS><VENDOR_ID>{self.store[0][0][4]}</VENDOR_ID><SERVICE_ID>{self.store[0][0][5]}</SERVICE_ID><METHOD>ORCancel</METHOD></ADDRESS><DATA><PAYMENT_CHANNEL>{self.store[0][0][9]}</PAYMENT_CHANNEL><VENDOR_ID>{self.store[2][6][3]}</VENDOR_ID><SERVICE_ID>{self.store[2][6][4]}</SERVICE_ID><SERV_ID>{self.store[2][6][4]}</SERV_ID><STORE_ID>{self.store[0][0][0]}</STORE_ID><STATION_ID>1</STATION_ID><BUS_DATE>{self.store[0][4][0]}</BUS_DATE><BUS_TIME>{self.store[0][4][1]}</BUS_TIME><TX_ID>{self.store[2][6][5]}</TX_ID><PAYMENT_TYPE>001</PAYMENT_TYPE><CANCEL_ID></CANCEL_ID></DATA></SERVICE_BOX></HQ_REQUEST>"""
      return ORCancel
   def ORConfirm(self):
      ORConfirm=f"""<?xml version="1.0" encoding="UTF-8"?><HQ_REQUEST><SERVICE_BOX><ADDRESS><VENDOR_ID>{self.store[0][0][4]}</VENDOR_ID><SERVICE_ID>{self.store[0][0][5]}</SERVICE_ID><METHOD>ORConfirm</METHOD></ADDRESS><DATA><PAYMENT_CHANNEL>{self.store[0][0][9]}</PAYMENT_CHANNEL><VENDOR_ID>{self.store[2][6][3]}</VENDOR_ID><SERVICE_ID>{self.store[2][6][4]}</SERVICE_ID><SERV_ID>{self.store[2][6][4]}</SERV_ID><STATION_ID>1</STATION_ID><STORE_ID>{self.store[0][0][0]}</STORE_ID><STATION_ID>1</STATION_ID><BUS_DATE>{self.store[0][4][0]}</BUS_DATE><BUS_TIME>{self.store[0][4][1]}</BUS_TIME><BILL_AMT>{self.store[2][6][8]}</BILL_AMT><ROUND_BILL_AMT>{self.store[2][6][8]}</ROUND_BILL_AMT><VAT_AMT>{self.store[0][0][7]}</VAT_AMT><TX_ID>{self.store[2][6][5]}</TX_ID><SEQ_NO>{self.store[2][2]}</SEQ_NO><CLIENT_SERV_SEQ>{self.store[2][2]}</CLIENT_SERV_SEQ><SERV_ID>{self.store[2][6][4]}</SERV_ID><DATA_1>{self.store[2][6][11]}</DATA_1><DATA_2>{self.store[2][6][12]}</DATA_2><DATA_3>{self.store[2][6][13]}</DATA_3><DATA_4>{self.store[2][6][14]}</DATA_4><DATA_5>{self.store[2][6][15]}</DATA_5><DATA_6>{self.store[2][6][16]}</DATA_6><DATA_7>{self.store[2][6][17]}</DATA_7><DATA_9>{self.store[2][6][18]}</DATA_9><ZONE>{self.store[0][0][1]}</ZONE><PAYMENT_TYPE>001</PAYMENT_TYPE><TOT_BILL_TRANS></TOT_BILL_TRANS><TOT_BILL_AMT></TOT_BILL_AMT><TOT_VENDOR_TRANS></TOT_VENDOR_TRANS><TOT_VENDOR_AMT></TOT_VENDOR_AMT><TOT_COUNTER_TRANS></TOT_COUNTER_TRANS><TOT_COUNTER_AMT></TOT_COUNTER_AMT><TOT_CLIENT_TRANS></TOT_CLIENT_TRANS><TOT_CLIENT_AMT></TOT_CLIENT_AMT><TOT_BILL_TRANS_OR></TOT_BILL_TRANS_OR><TOT_BILL_AMT_OR></TOT_BILL_AMT_OR><CANCEL_ID></CANCEL_ID></DATA></SERVICE_BOX></HQ_REQUEST>"""
      return ORConfirm
   def AMTConfirm(self):
      DataExchangeAMT =f"""<?xml version="1.0" encoding="UTF-8"?><HQ_REQUEST><SERVICE_BOX><ADDRESS><VENDOR_ID>{self.store[0][0][4]}</VENDOR_ID><SERVICE_ID>{self.store[0][0][5]}</SERVICE_ID><METHOD>DataExchangeConfirm</METHOD></ADDRESS><DATA><PAYMENT_CHANNEL>{self.store[0][0][9]}</PAYMENT_CHANNEL><VENDOR_ID>{self.store[2][6][3]}</VENDOR_ID><SERV_ID>{self.store[2][6][4]}</SERV_ID><SERVICE_ID>{self.store[2][6][4]}</SERVICE_ID><STATION_ID>1</STATION_ID><STORE_ID>{self.store[0][0][0]}</STORE_ID><BUS_DATE>{self.store[0][4][0]}</BUS_DATE><BUS_TIME>{self.store[0][4][1]}</BUS_TIME><SYS_DATE>{self.store[0][4][0]}</SYS_DATE><SYS_TIME>{self.store[0][4][1]}</SYS_TIME><TX_ID>{self.store[2][6][5]}</TX_ID><SEQ_NO>{self.store[2][1]}</SEQ_NO><EMPLOYEE_ID>{self.store[0][0][2]}</EMPLOYEE_ID><CLIENT_SERV_SEQ>{self.store[2][1]}</CLIENT_SERV_SEQ><SERV_ID>{self.store[0][0][5]}</SERV_ID><BILL_AMT>{self.store[2][4]}</BILL_AMT><ROUND_BILL_AMT>{self.store[2][4]}</ROUND_BILL_AMT><ACCT_NO></ACCT_NO><VAT_AMT>{self.store[0][0][7]}</VAT_AMT><DATA_1>{self.store[2][6][11]}</DATA_1><DATA_2>{self.store[2][6][12]}</DATA_2><DATA_3>{self.store[2][6][13]}</DATA_3><DATA_4>{self.store[2][6][14]}</DATA_4><DATA_5>{self.store[2][6][15]}</DATA_5><DATA_6>{self.store[2][6][16]}</DATA_6><DATA_7>{self.store[2][6][17]}</DATA_7><DATA_9>{self.store[2][6][18]}</DATA_9><ZONE>{self.store[0][0][1]}</ZONE><PAYMENT_TYPE>001</PAYMENT_TYPE><TOT_BILL_TRANS></TOT_BILL_TRANS><TOT_BILL_AMT></TOT_BILL_AMT><TOT_VENDOR_TRANS></TOT_VENDOR_TRANS><TOT_VENDOR_AMT></TOT_VENDOR_AMT><TOT_COUNTER_TRANS></TOT_COUNTER_TRANS><TOT_COUNTER_AMT></TOT_COUNTER_AMT><TOT_CLIENT_TRANS></TOT_CLIENT_TRANS><TOT_CLIENT_AMT></TOT_CLIENT_AMT><TOT_BILL_TRANS_OR></TOT_BILL_TRANS_OR><TOT_BILL_AMT_OR></TOT_BILL_AMT_OR><CANCEL_ID></CANCEL_ID><CANCEL_ID></CANCEL_ID><CUST_NAME>{self.store[2][6][20]}</CUST_NAME><CUST_ADDR_1>{self.store[2][6][21]}</CUST_ADDR_1><CUST_ADDR_2>{self.store[2][6][22]}</CUST_ADDR_2><CUST_ADDR_3>{self.store[2][6][23]}</CUST_ADDR_3><CUST_PHONE_NO>{self.store[2][6][24]}</CUST_PHONE_NO></DATA></SERVICE_BOX></HQ_REQUEST>"""
      return DataExchangeAMT
   def StdTkInquiry(self):
      StdTkInqu = f"""<?xml version="1.0" encoding="UTF-8"?><HQ_REQUEST><SERVICE_BOX><ADDRESS><VENDOR_ID>{self.store[0][0][4]}</VENDOR_ID><SERVICE_ID>{self.store[0][0][5]}</SERVICE_ID><METHOD>StdTkInquiry</METHOD></ADDRESS><DATA><PAYMENT_CHANNEL>{self.store[0][0][9]}</PAYMENT_CHANNEL><VENDOR_ID>{self.store[0][0][4]}</VENDOR_ID><SERV_ID>{self.store[0][0][5]}</SERV_ID><SERVICE_ID>{self.store[0][0][5]}</SERVICE_ID><STORE_ID>{self.store[0][0][0]}</STORE_ID><STATION_ID>1</STATION_ID><BUS_DATE>{self.store[0][4][0]}</BUS_DATE><BUS_TIME>{self.store[0][4][1]}</BUS_TIME><SYS_DATE>{self.store[0][4][0]}</SYS_DATE><SYS_TIME>{self.store[0][4][1]}</SYS_TIME><COMMON_TRN_ID>{self.store[0][4][2]}</COMMON_TRN_ID><SEQ_NO></SEQ_NO><CLIENT_SERV_SEQ></CLIENT_SERV_SEQ><SHIFT_ID></SHIFT_ID><TRANS_TYPE></TRANS_TYPE><ACCT_NO></ACCT_NO><BILL_AMT>{self.store[0][2][2]}</BILL_AMT><ROUND_BILL_AMT>{self.store[0][2][2]}</ROUND_BILL_AMT><VAT_AMT>{self.store[0][0][7]}</VAT_AMT><REPT_TYPE>{self.store[0][0][8]}</REPT_TYPE><REPT_NO></REPT_NO><PREV_REF_SEQ></PREV_REF_SEQ><PREV_REF_DATE></PREV_REF_DATE><SERV_CHARGE_NO></SERV_CHARGE_NO><ITEM_NAME>{self.store[0][0][6]}</ITEM_NAME><ITEM_SELECTION></ITEM_SELECTION><EMPLOYEE_ID>{self.store[0][0][2]}</EMPLOYEE_ID><POS_TAX_ID>{self.store[0][0][3]}</POS_TAX_ID><DATA_1>{self.store[0][1][0]}</DATA_1><DATA_2>{self.store[0][1][1]}</DATA_2><DATA_3>{self.store[0][1][2]}</DATA_3><DATA_4>{self.store[0][1][3]}</DATA_4><DATA_5>{self.store[0][1][4]}</DATA_5><DATA_6>{self.store[0][1][5]}</DATA_6><DATA_7>{self.store[0][1][6]}</DATA_7><DATA_9>{self.store[0][1][7]}</DATA_9><ZONE>{self.store[0][0][1]}</ZONE><PAYMENT_TYPE>001</PAYMENT_TYPE><CANCEL_ID></CANCEL_ID><CUST_NAME>{self.store[0][3][0]}</CUST_NAME><CUST_ADDR_1>{self.store[0][3][1]}</CUST_ADDR_1><CUST_ADDR_2>{self.store[0][3][2]}</CUST_ADDR_2><CUST_ADDR_3>{self.store[0][3][3]}</CUST_ADDR_3><CUST_PHONE_NO>{self.store[0][3][4]}</CUST_PHONE_NO></DATA></SERVICE_BOX></HQ_REQUEST>"""
      return StdTkInqu
   def Inquiry(self):
      Inqu = f"""<?xml version="1.0" encoding="UTF-8"?><HQ_REQUEST><SERVICE_BOX><ADDRESS><VENDOR_ID>{self.store[0][0][4]}</VENDOR_ID><SERVICE_ID>{self.store[0][0][5]}</SERVICE_ID><METHOD>Inquiry</METHOD></ADDRESS><DATA><PAYMENT_CHANNEL>{self.store[0][0][9]}</PAYMENT_CHANNEL><VENDOR_ID>{self.store[0][0][4]}</VENDOR_ID><SERV_ID>{self.store[0][0][5]}</SERV_ID><SERVICE_ID>{self.store[0][0][5]}</SERVICE_ID><STORE_ID>{self.store[0][0][0]}</STORE_ID><STATION_ID>1</STATION_ID><BUS_DATE>{self.store[0][4][0]}</BUS_DATE><BUS_TIME>{self.store[0][4][1]}</BUS_TIME><SYS_DATE>{self.store[0][4][0]}</SYS_DATE><SYS_TIME>{self.store[0][4][1]}</SYS_TIME><COMMON_TRN_ID>{self.store[0][4][2]}</COMMON_TRN_ID><SEQ_NO/><CLIENT_SERV_SEQ/><SHIFT_ID></SHIFT_ID><TRANS_TYPE>N</TRANS_TYPE><ACCT_NO/><BILL_AMT>{self.store[0][2][2]}</BILL_AMT><ROUND_BILL_AMT/><VAT_AMT>{self.store[0][0][7]}</VAT_AMT><REPT_TYPE>{self.store[0][0][8]}</REPT_TYPE><REPT_NO/><PREV_REF_SEQ/><PREV_REF_DATE/><SERV_CHARGE_NO/><ITEM_NAME>{self.store[0][0][6]}</ITEM_NAME><ITEM_SELECTION>N</ITEM_SELECTION><EMPLOYEE_ID>{self.store[0][0][2]}</EMPLOYEE_ID><POS_TAX_ID/><DATA_1>{self.store[0][1][0]}</DATA_1><DATA_2>{self.store[0][1][1]}</DATA_2><DATA_3>{self.store[0][1][2]}</DATA_3><DATA_4>{self.store[0][1][3]}</DATA_4><DATA_5>{self.store[0][1][4]}</DATA_5><DATA_6>{self.store[0][1][5]}</DATA_6><DATA_7>{self.store[0][1][6]}</DATA_7><DATA_9>{self.store[0][1][7]}</DATA_9><ZONE>{self.store[0][0][1]}</ZONE><PAYMENT_TYPE>001</PAYMENT_TYPE><CANCEL_ID/></DATA></SERVICE_BOX></HQ_REQUEST>"""
      return Inqu
   
def Llistout():
   listsd = ['SUCCESS','CODE','DESCRIPTOR','VENDOR_ID','SERV_ID','TX_ID','PRINTSLIP','VAT','BILL_AMT','FEE','FEE_VAT','DATA_1','DATA_2','DATA_3','DATA_4','DATA_5','DATA_6','DATA_7','DATA_9',
    'CUSTOMER_NAME','CUSTOMER_ADDR_1','CUSTOMER_ADDR_2','CUSTOMER_ADDR_3','CUSTOMER_TEL_NO','ACCT_NO','CUSTOMER_TAX_ID','CUSTOMER_BRANCH_CODE','CUSTOMER_RECEIPT_NAME','CUSTOMER_RECEIPT_ADDR'] 
   return listsd

def Dataxml(Action):
      data = f"""<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:por="http://portal.cs/">
      <soapenv:Header/>
      <soapenv:Body>
      <por:CSService>
      <!--Optional:-->
      <arg0><![CDATA[{Action}]]></arg0>
      </por:CSService>
      </soapenv:Body>
      </soapenv:Envelope>"""
      return data

class SelectBase():

   def setdata(self,basedata):
      self.service = basedata[0][0][5]
      self.Vendor = basedata[0][0][4]
      self.TXID = [basedata[2][6][5],basedata[2][6][6]]

   def settime(self,Or_timeout,Time):
      self.Or_timeout = Time       #'18000,3600'
      self.Time = Or_timeout      #'2024-02-22 22:27:14'
   def  NewTime(self,Minutes,Hours):
      self.Newtime = self.Time-timedelta(minutes=float(Minutes+1),hours=float(Hours))
   def  GETTIME(self):return[self.Or_timeout,self.Time ]
   def SwiTime(self,rule=None):
      if rule == 1:
         self.Timer=self.Time.strftime("%d/%m/%Y %X")
      else :
         self.Timer=self.Newtime.strftime("%d/%m/%Y %X")
   def Tabel_CLIENT_CONFIG(self):
      Select = f"SELECT * from (SELECT  dg.VENDOR_ID,dg.SERVICE_ID,dg.SYSTEM_TYPE,dg.MIN_AMT,dg.MAX_AMT,dg.OR_TIMEOUT,dg.SERVICE_CHARGE,dg.VENDOR_NAME,dg.LOG_ID, df.SERVER_RUN FROM ONLSTD.WS_CLIENT_AUTOFIXTX df right join ONLSTD.WS_CLIENT_CONFIG dg on (df.VENDOR_ID =dg.VENDOR_ID and df.SERVICE_ID = dg.SERVICE_ID) order BY dg.EXPIRE_DATE DESC) Where VENDOR_ID ='{self.Vendor}' and SERVICE_ID ='{self.service}' "
      return Select
   def Tabel_CHARGE_STEP(self):
      Select = f"SELECT VENDOR_ID,SERVICE_ID,MIN_AMOUNT,MAX_AMOUNT,SERVICE_CHARGE_CENTRE,SERVICE_CHARGE_PROVINCES FROM ONLSTD.WS_CLIENT_CHARGE_STEP Tbl Where VENDOR_ID ='{self.Vendor}' and SERVICE_ID ='{self.service}'"
      return Select
   def Tabel_Online_log(self):
      Select = f"SELECT * FROM ONLSTD.WS_ONLINE_TX Tbl Where TX_ID in ('{self.TXID[0]}','{self.TXID[1]}') or R_SERVICE_RUNNO in ('{self.TXID[0]}','{self.TXID[1]}')"
      return Select     
   def Select_Or_timeout(self):  #เพิ่ม
      Select = f"SELECT OR_TIMEOUT FROM ONLSTD.WS_CLIENT_CONFIG Tbl Where VENDOR_ID = '{self.Vendor}' and SERVICE_ID ='{self.service}' and EFF_DATE <= TO_DATE(CURRENT_DATE, 'dd/mm/yyy') and  EXPIRE_DATE >= TO_DATE(CURRENT_DATE, 'dd/mm/yyy')"
      return Select  
   def UpDate_Or_timeout(self):  #เพิ่ม
      Select = f"UPDATE ONLSTD.WS_CLIENT_CONFIG Tbl SET OR_TIMEOUT = '{self.Or_timeout}' Where VENDOR_ID = '{self.Vendor}' and SERVICE_ID ='{self.service}' and EFF_DATE <= TO_DATE(CURRENT_DATE, 'dd/mm/yyy') and  EXPIRE_DATE >= TO_DATE(CURRENT_DATE, 'dd/mm/yyy')"
      return Select  
   def UpDate_Or_overday(self):  #เพิ่ม
      Select = f"UPDATE ONLSTD.WS_CLIENT_CONFIG Tbl SET OR_TIMEOUT = '999999999' Where VENDOR_ID = '{self.Vendor}' and SERVICE_ID ='{self.service}' and EFF_DATE <= TO_DATE(CURRENT_DATE, 'dd/mm/yyy') and  EXPIRE_DATE >= TO_DATE(CURRENT_DATE, 'dd/mm/yyy')"
      return Select  
   def UpDate_Online_Tx(self):  #เพิ่ม
      Select = f"UPDATE ONLSTD.WS_ONLINE_TX Tbl SET SYSTEM_DATE_TIME = TO_DATE('{self.Timer}','dd/mm/yyyy HH24:MI:SS') Where TX_ID in ('{self.TXID[0]}','{self.TXID[1]}') or R_SERVICE_RUNNO in ('{self.TXID[0]}','{self.TXID[1]}')"
      return Select  
   def Tabel_Online_Tx(self):
      Select = f"SELECT SYSTEM_DATE_TIME FROM ONLSTD.WS_ONLINE_TX Tbl Where TX_ID in ('{self.TXID[0]}','{self.TXID[1]}') or R_SERVICE_RUNNO in ('{self.TXID[0]}','{self.TXID[1]}')"
      return Select  
   def Tabel_REPRINT_LIMIT(self):
      Select = f"SELECT REPRINT_LIMIT FROM ONLSTD.WS_CLIENT_REPRINT Tbl Where VENDOR_ID = '{self.Vendor}' AND SERVICE_ID = '{self.service}'"
      return Select  
   def Tabel_REPRINT_TIMEOUT(self):
      Select = f"SELECT TIMEOUT FROM ONLSTD.WS_CLIENT_REPRINT Tbl Where VENDOR_ID = '{self.Vendor}' AND SERVICE_ID = '{self.service}'"
      return Select  
class Export() :
   def export(DATA,exec= None):
      DATAT:dict=xd.parse(DATA).get('HQ_RESPONSE')
      vx:list=Llistout()
      v:list = [DATAT.get(k, None) for k in vx]
      if exec is None:
         num = motify(v)
         # ic(num)
         df = pd.DataFrame([Edit(v,num[0])],columns= Edit(Llistout()[0:],num[1]))
         display(df)
      if v[1] == "100": 
         return True
      return False

def motify(ATION):
   Temp = []
   Temp1 = []
   for I , X in enumerate(ATION):
         if X is not None: 
            Temp.append(I)
            Temp1.append(I+1)
   return [Temp,Temp1]
   
def Edit(DATA,STEP):
   Temp =[]
   for i,x in enumerate(DATA):
         for g in STEP:
            if g == i:
               Temp.append(x)
   return Temp

      
      
