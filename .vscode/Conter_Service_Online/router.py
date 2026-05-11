from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import traceback
from typing import Optional, Dict, Any
from datetime import datetime 


from .Datainput import DATA,CaseBILL_AMT
from .Respron import Respron
from random import randint
from .Storage import Export,Dataxml
URL = "http://qacspos.counterservice.co.th:80/DCWSCDSONLINE/WSCDSService"

Minutes=00
Hours=3
def setData():
    Data = DATA(DATA_1=10,ITEM_NAME='รับบริจาคเงิน')        # GenData
    # Data.setonlineTx(Minutes=Minutes,Hours=Hours)
    Data.setStore_ID("09884")
    Data.setBAMT(BILL_AMT="100",AMTmax="30000",AMTmin="1")
    Data.setVENDOR_ID("0993000134168")
    Data.setSERVICE_ID("02")
    Data.settime(Minutes,Hours,1)
    DaTa1 = (list(Data.sum()))          
    respron = Respron(DaTa1,URL)   
    return Data,DaTa1,respron
Data,DaTa1,respron = setData()

DaTa1 = []
router = APIRouter(prefix="/coun", tags=["Counter Service Enterprise API"])

class inputreq(BaseModel):
    STORE_ID :str = '09884'
    VENDOR_ID :str='000000000000'
    SERVICE_ID:str = '00'
    ITEM_NAME:str ='ชื่อบริการ'
    DATA_1 : Optional[str] = ""
    DATA_2 : Optional[str] = ""
    DATA_3 : Optional[str] = ""
    DATA_4 : Optional[str] = ""
    DATA_5 : Optional[str] = ""
    DATA_6 : Optional[str] = ""
    DATA_7 : Optional[str] = ""
    DATA_9 : Optional[str] = ""
    AMTmax : Optional[int] = 30000
    AMTmin : Optional[int] = 1
    BILL_AMT: Optional[str] = "50"
    CUST_NAME : Optional[str] = ""
    CUST_ADDR_1 : Optional[str] = ""
    CUST_ADDR_2 : Optional[str] = ""
    CUST_ADDR_3 : Optional[str] = ""
    CUST_PHONE_NO : Optional[str] = ""
    Editout : Optional[str] = str(float(BILL_AMT)+5)
    Minutes : Optional[int]=0
    Hours : Optional[int]=3
    ZONE : Optional[str] = "1"
    EMPLOYEE_ID  : Optional[str]= "0555505"
    POS_TAX_ID  : Optional[str]= "1537264827382"
    VAT_AMT  : Optional[str]="0"
    REPT_TYPE  : Optional[str]= "H"
    PAYMENT_CHANNEL  : Optional[str]= 'C05'
    Date  : Optional[str]= (datetime.now()).strftime("%Y/%m/%d")
    TIME : Optional[str] = (datetime.now()).strftime("%X")
    Numran  : Optional[str]= str(randint(0,100))
    MinutesNEW : Optional[str]="0"
    HoursNEW : Optional[str]="0"
class CompareQueryRequest(BaseModel):
    query: str
    params: Optional[Dict[str, Any]] = None

@router.post("/autorun")
def get_config_json(request: inputreq):
    """ส่งคืนผลลัพธ์ในรูปแบบ JSON โครงสร้างใหม่"""
    DATA(request)
    ...