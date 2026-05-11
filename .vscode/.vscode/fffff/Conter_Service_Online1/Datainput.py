from Conter_Service_Online.imports import *
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
        print(self.Editout)
        dummyDATA = None
        list_to_dict:dict =DATATOSTA.get('HQ_RESPONSE')
        # print(DATATOSTA)
        for key,value in  list_to_dict.items():
          if value is not None :
            r,l  =split_by_pipe(value)
            list_to_dict[key]= [r, l] if l is not None else r

        v:list = [list_to_dict.get(value, '') for _, value in enumerate(Llistout())]
        SEQ_NO2,SEQ_NO3 = split_by_pipe(str(v[5]))
        list_to_dict['SEQUENCE_NO'] = SEQ_NO2
        list_to_dict['SEQUENCE_NO_FEE'] = SEQ_NO3
        list_to_dict['TX_ID_VALUE'] = [SEQ_NO2,SEQ_NO3]
        TX_ID2 = v[5][:8]
        sumSEQ = SEQ_NO2
        # print(v)
        print(list_to_dict)
        sumAMT = str(float(list_to_dict['BILL_AMT'][0])+2)

        
        if SEQ_NO3:
            BILL_AMT0 =list_to_dict.get('BILL_AMT')
            # print(BILL_AMT0)
            try:BILL_AMT2 = str(float(BILL_AMT0.split(">")[-1].split("|")[0])+2)
            except:BILL_AMT2=BILL_AMT0
            BILL_AMT3 = BILL_AMT0.split("|")[-1].split("<")[0]
            sumSEQ  = SEQ_NO2+'|'+ SEQ_NO3
            sumAMT  = str(BILL_AMT2)+'|'+ str(BILL_AMT3)
            print([TX_ID2,'',sumSEQ,dummyDATA,sumAMT,dummyDATA,v])
        return [TX_ID2,'',sumSEQ,dummyDATA,sumAMT,dummyDATA,v]
    
def split_by_CHANGE(value: str) -> tuple[str, str]:
    if "|" not in value:
        return str(int(value)+1)[2:-1], None ,(value, None)
    left, right = value.split("|", 1) 
    return str(int(left)+2)[2:-1],str(int(right)+2)[2:-1],(left, right)
def split_by_pipe(value: str) -> tuple[str, str]:
    if "|" not in value:
        return value, None
    left, right = value.split("|", 1) 
    return left, right
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