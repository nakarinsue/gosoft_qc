from random import randint
import random
import datetime
import base64
import importlib 
import requests
import xmltodict as xd
import pandas as pd
import time
from datetime import datetime,timedelta 
# import datetime
import oracledb
pd.set_option('display.max_columns', None)
pd.set_option('display.max_rows', None) 
pd.set_option('display.max_colwidth', None)
class data():
    def getdata():
        return "145"
class DATA():

    def __init__(self,STORE_ID ="09892",VENDOR_ID="82204",SERVICE_ID ="00",ITEM_NAME="Test",DATA_1 = None,DATA_2= None,DATA_3= None,DATA_4= None,DATA_5= None,DATA_6= None,DATA_7= None,DATA_9= None,AMTmin ="1",AMTmax = "90000",BILL_AMT = "50",CUST_NAME = "",CUST_ADDR_1 = "",CUST_ADDR_2 = "",CUST_ADDR_3 = "",CUST_PHONE_NO = "",step = 1,Editout = None):
        self.STORE_ID = STORE_ID
        self.VENDOR_ID =VENDOR_ID
        self.SERVICE_ID = SERVICE_ID
        self.ITEM_NAME=ITEM_NAME
        self.DATA_1 = DATA_1
        self.DATA_2 = DATA_2
        self.DATA_3 = DATA_3
        self.DATA_4 = DATA_4
        self.DATA_5 = DATA_5
        self.DATA_6 = DATA_6
        self.DATA_7 = DATA_7
        self.DATA_9 = DATA_9
        self.AMTmax = AMTmax
        self.AMTmin = AMTmin
        self.BILL_AMT =BILL_AMT
        self.CUST_NAME = CUST_NAME
        self.CUST_ADDR_1 = CUST_ADDR_1
        self.CUST_ADDR_2 = CUST_ADDR_2
        self.CUST_ADDR_3 = CUST_ADDR_3
        self.CUST_PHONE_NO = CUST_PHONE_NO
        self.step = step
        self.Editout = Editout
        self.Minutes=0
        self.Hours=0
        self.ZONE = "1"
        self.EMPLOYEE_ID = "0555505"
        self.POS_TAX_ID = "1537264827382"
        self.VAT_AMT ="0"
        self.REPT_TYPE = "H"
        self.PAYMENT_CHANNEL = 'C05'
        self.Date = (datetime.now()).strftime("%Y/%m/%d")
        self.TIME = (datetime.now()).strftime("%X")
        self.Numran = str(randint(0,100))
        self.Minutes="0"
        self.Hours="0"
        self.MinutesNEW="0"
        self.HoursNEW="0"

    def getStore(self):
        ZONE = self.ZONE
        EMPLOYEE_ID = self.EMPLOYEE_ID
        POS_TAX_ID = self.POS_TAX_ID
        VAT_AMT =self.VAT_AMT
        REPT_TYPE = self.REPT_TYPE
        PAYMENT_CHANNEL = self.PAYMENT_CHANNEL
        return[self.STORE_ID,ZONE,EMPLOYEE_ID,POS_TAX_ID,self.VENDOR_ID,self.SERVICE_ID,self.ITEM_NAME,VAT_AMT,REPT_TYPE,PAYMENT_CHANNEL]
    
    def getaddDATA(self):
        return [self.DATA_1,self.DATA_2,self.DATA_3,self.DATA_4,self.DATA_5,self.DATA_6,self.DATA_7,self.DATA_9]
    
    def getBAMT (self): 
        return [self.AMTmax,self.AMTmin,self.BILL_AMT]
    
    def getEditdata(self):
        return self.Editout
    def getUserdata(self):
        return [self.CUST_NAME,self.CUST_ADDR_1,self.CUST_ADDR_2,self.CUST_ADDR_3,self.CUST_PHONE_NO]
    
    def setStore_ID(self,STORE_ID ="09892"):
        self.STORE_ID=STORE_ID
    def setVENDOR_ID(self,VENDOR_ID="82204"):
        self.VENDOR_ID=VENDOR_ID
    def setSERVICE_ID(self,SERVICE_ID ="00"):
        self.SERVICE_ID=SERVICE_ID
    def setITEM_NAME(self,ITEM_NAME="Test"):
        self.ITEM_NAME=ITEM_NAME

    
    def setDATA1(self,DATA_1):
        self.DATA_1=DATA_1
    def setDATA2(self,DATA_2):
        self.DATA_2=DATA_2
    def setDATA3(self,DATA_3):
        self.DATA_3=DATA_3
    def setDATA4(self,DATA_4):
        self.DATA_4=DATA_4
    def setDATA5(self,DATA_5):
        self.DATA_5=DATA_5
    def setDATA6(self,DATA_6):
        self.DATA_6=DATA_6
    def setDATA7(self,DATA_7):
        self.DATA_7=DATA_7
    def setDATA8(self,DATA_9):
        self.DATA_9=DATA_9
    def setSmDATA(self,DATA):
        self.DATA_1=DATA[0]
        self.DATA_2=DATA[1]
        self.DATA_3=DATA[2]
        self.DATA_4=DATA[3]
        self.DATA_5=DATA[4]
        self.DATA_6=DATA[5]
        self.DATA_7=DATA[6]
        self.DATA_9=DATA[7]

    def setEditDATA(self,DATA):
        self.Editout=DATA

    def settime(self,Minutes,Hours,mode=0):
        if mode == 1:      
            self.Minutes=Minutes
            self.Hours=Hours
        else:
            self.MinutesNEW=Minutes
            self.HoursNEW=Hours

    def gettime(self):return [self.Minutes,self.Hours,self.MinutesNEW,self.HoursNEW]

    def setBAMT (self,AMTmin ="1",AMTmax = "90000",BILL_AMT = "50"): 
        self.AMTmax =AMTmax
        self.AMTmin =AMTmin
        self.BILL_AMT =BILL_AMT
    def setBAMTFee (self,BILL_AMT = "50",ZONE =None): 
        self.BILL_AMT =BILL_AMT
        self.ZONE =ZONE
    def setUserdata(self,CUST_NAME = "",CUST_ADDR_1 = "",CUST_ADDR_2 = "",CUST_ADDR_3 = "",CUST_PHONE_NO = ""):
        self.CUST_NAME=CUST_NAME
        self.CUST_ADDR_1=CUST_ADDR_1
        self.CUST_ADDR_2=CUST_ADDR_2
        self.CUST_ADDR_3=CUST_ADDR_3
        self.CUST_PHONE_NO =CUST_PHONE_NO    

    
    def mergeDA(cals):
        a =[]
        a.append(cals.getStore())
        a.append(cals.getaddDATA())
        a.append(cals.getBAMT())
        a.append(cals.getUserdata())
        return a
    def sum(self):
        Temp = [[],[],[],[],[]]
        Temp[0].append(self.STORE_ID)
        Temp[0].append(self.ZONE)
        Temp[0].append(self.EMPLOYEE_ID)
        Temp[0].append(self.POS_TAX_ID)        
        Temp[0].append(self.VENDOR_ID)
        Temp[0].append(self.SERVICE_ID)
        Temp[0].append(self.ITEM_NAME)
        Temp[0].append(self.VAT_AMT)
        Temp[0].append(self.REPT_TYPE)
        Temp[0].append(self.PAYMENT_CHANNEL)

        Temp[1].append(self.DATA_1)
        Temp[1].append(self.DATA_2)
        Temp[1].append(self.DATA_3)
        Temp[1].append(self.DATA_4)
        Temp[1].append(self.DATA_5)
        Temp[1].append(self.DATA_6)
        Temp[1].append(self.DATA_7)
        Temp[1].append(self.DATA_9)
        Temp[2].append(self.AMTmax)
        Temp[2].append(self.AMTmin)
        Temp[2].append(self.BILL_AMT)

        Temp[3].append(self.CUST_NAME) 
        Temp[3].append(self.CUST_ADDR_1)
        Temp[3].append(self.CUST_ADDR_2)
        Temp[3].append(self.CUST_ADDR_3)
        Temp[3].append(self.CUST_PHONE_NO)

        Temp[4].append(self.Date)
        Temp[4].append(self.TIME)
        Temp[4].append(self.Numran)

        for i , x in enumerate (Temp[1]) :
            if type(x) is str:
                Temp[1][i] = x
            elif type(x) is int: 
                Temp[1][i] = ( ''.join([str(random.randint(0,9)) for i in range(int(x))]))
            elif type(x) is list: 
                Temp[1][i] = (x[self.step%len(x)])
            elif x is None : Temp[1][i] = ""
        step = self.step+ 1
        return [Temp,step]

    def Editdata(self):
        DATATOSTA=xd.parse(self.Editout)
        dummyDATA = None
        v= []
        for i in enumerate(Llistout()) :
            if i[0] != 0:
                try :v.append(DATATOSTA[Llistout()[0]][Llistout()[i[0]]])
                except:v.append('')
        SEQ_NO1 = str(str(v[5]).replace(data.getdata(),""))
        TX_ID2 = v[5][:8]
        if len(SEQ_NO1) == 5:
            sumSEQ = CHECK_Length(str(int(SEQ_NO1)+1))
            sumAMT = str(float(v[8])+2)
        elif len(SEQ_NO1) != 5:  
            BILL_AMT0 = self.Editout.split("<BILL_AMT")[-1].split("/BILL_AMT>")[0]   
            SEQ_NO2 = CHECK_Length(str(int(SEQ_NO1[0:5])+2))
            SEQ_NO3 = CHECK_Length(str(int(SEQ_NO1[6:11])+2))
            try:BILL_AMT2 = str(float(BILL_AMT0.split(">")[-1].split("|")[0])+2)
            except:BILL_AMT2=BILL_AMT0
            BILL_AMT3 = BILL_AMT0.split("|")[-1].split("<")[0]
            sumSEQ  = SEQ_NO2+'|'+ SEQ_NO3
            sumAMT  = str(BILL_AMT2)+'|'+ str(BILL_AMT3)

        return [TX_ID2,SEQ_NO1,sumSEQ,dummyDATA,sumAMT,dummyDATA,v]

def CHECK_Length(data):
    Temp = None
    Num = 5
    for i in range(Num):
        if Temp is None:Temp = data
        if Temp is not None : 
            if len(Temp) != Num:Temp = "0"+Temp
            if len(Temp) == Num:return Temp
def CaseBILL_AMT(AMT,MIN ,MAX):
    Allbill =[]
    Allbill.append("")
    Allbill.append(MIN)
    Allbill.append(MAX)
    Allbill.append(str(float(MIN)-1))
    Allbill.append(str(float(MAX)+1))
    Allbill.append(str(float(AMT)+0.34))
    Allbill.append(str(float(AMT)+0.50))
    return Allbill
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
   listsd = ['HQ_RESPONSE','SUCCESS','CODE','DESCRIPTOR','VENDOR_ID','SERV_ID','TX_ID','PRINTSLIP','VAT','BILL_AMT','FEE','FEE_VAT','DATA_1','DATA_2','DATA_3','DATA_4','DATA_5','DATA_6','DATA_7','DATA_9',
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
      # if exec is None : 
      #    print( DATA.split("<TX_ID>")[-1].split("</TX_ID>")[0])
      DATATOSTA=xd.parse(DATA)
      v= []
      for i ,x in enumerate(Llistout()) :
         if i <= 5:
               if i != 0 : v.append(DATATOSTA[Llistout()[0]][x])
      # if exec is None: 
      #    print("Status",v[0] ," : ", v[1]," : ",v[2])
      v=[]
      for i ,x in enumerate(Llistout()) :
         if i != 0:
               try : v.append(DATATOSTA[Llistout()[0]][Llistout()[i]])
               except: v.append(None)
      if exec is None:
         num = motify(v)
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

      
class Respron():
    def __init__(self,Data=None,URL=None):
        self.Data = Data
        self.URL = URL
        if URL is not None:
            self.URL = URL
        self.dataxml = XML(self.Data)
    def setdata(self,aata):
        self.Data = aata
    def DataExchange(self):
        spondata = self.dataxml.Exchange()
        mystr_encoded = inputRespom(spondata,self.URL)
        Export.export(mystr_encoded)  
        return mystr_encoded      
    def Cancel(self):
        spondata = self.dataxml.Can()
        mystr_encoded = inputRespom(spondata,self.URL)
        Export.export(mystr_encoded)  
        return mystr_encoded  
    def DataExchangeConfirm(self):
        spondata = self.dataxml.ExchangeConfirm()
        mystr_encoded = inputRespom(spondata,self.URL)
        Export.export(mystr_encoded)  
        return mystr_encoded  
    def RePrint(self):
        spondata = self.dataxml.Print()
        mystr_encoded = inputRespom(spondata,self.URL)
        Export.export(mystr_encoded)  
        return mystr_encoded  
    def Or(self):
        spondata = self.dataxml.Or()
        mystr_encoded = inputRespom(spondata,self.URL)
        Export.export(mystr_encoded)  
        return mystr_encoded  
    def OrCancel(self):
        spondata = self.dataxml.ORCancel()
        mystr_encoded = inputRespom(spondata,self.URL)
        Export.export(mystr_encoded)  
        return mystr_encoded  
    def OrConfirm(self):
        spondata = self.dataxml.ORConfirm()
        mystr_encoded = inputRespom(spondata,self.URL)
        Export.export(mystr_encoded)  
        return mystr_encoded  
    def StdTkInquiry(self):
        spondata = self.dataxml.StdTkInquiry()
        mystr_encoded = inputRespom(spondata,self.URL)
        Export.export(mystr_encoded)  
        return mystr_encoded  


def inputRespom(spondata,url):
    response = requests.request("POST",url=url, headers={'Content-Type': 'text/xml'}, data=Dataxml(spondata).encode("utf-8"))
    decode = response.text.split("<return>")[-1].split("</return>")[0]
    mystr_encoded = base64.b64decode(decode).decode('utf-8') 
    return mystr_encoded    
class Databas():
    def __init__(self,IP = '10.182.236.52',service_name='ONLPRD'):
        self.IP = IP
        self.service_name = service_name
        self.host = '1521'
        self.user = 'CS_DEV'
        self.pwd = '1234'
        self.Text='0'

    def connet(self):
        dsn_tns = oracledb.makedsn(self.IP, '1521', service_name=self.service_name) 
        conn = oracledb.connect(user=r'CS_DEV', password='1234', dsn=dsn_tns) 
        c = conn.cursor()
        return c , conn
    
def connet_and_return(Text):
    base=Databas()
    # print(Text)
    cursor , con = base.connet()
    cursor.execute(Text)
    try:
        res = cursor.fetchall()
        con.commit()
        if len(res)==1:
            return res[-1]
        else:
            return print("ไม่พบข้อมูลใน Baseหรือ มี มากกว่า 1 ค่า ("+res+")")
    except:print('ทำการอัพเดทข้อมูล')
    con.commit()