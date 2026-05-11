from Storage import XML,Dataxml,Export
import base64
import requests
from icecream import ic
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
        ic(spondata)
        mystr_encoded = inputRespom(spondata,self.URL)
        Export.export(mystr_encoded)   # type: ignore
        return mystr_encoded      
    def Cancel(self):
        spondata = self.dataxml.Can()
        mystr_encoded = inputRespom(spondata,self.URL)
        Export.export(mystr_encoded)   # type: ignore
        return mystr_encoded  
    def DataExchangeConfirm(self):
        spondata = self.dataxml.ExchangeConfirm()
        mystr_encoded = inputRespom(spondata,self.URL)
        Export.export(mystr_encoded)   # type: ignore
        return mystr_encoded  
    def RePrint(self):
        spondata = self.dataxml.Print()
        mystr_encoded = inputRespom(spondata,self.URL)
        Export.export(mystr_encoded)   # type: ignore
        return mystr_encoded  
    def Or(self):
        spondata = self.dataxml.Or()
        mystr_encoded = inputRespom(spondata,self.URL)
        Export.export(mystr_encoded)   # type: ignore
        return mystr_encoded  
    def OrCancel(self):
        spondata = self.dataxml.ORCancel()
        mystr_encoded = inputRespom(spondata,self.URL)
        Export.export(mystr_encoded)   # type: ignore
        return mystr_encoded  
    def OrConfirm(self):
        spondata = self.dataxml.ORConfirm()
        mystr_encoded = inputRespom(spondata,self.URL)
        Export.export(mystr_encoded)   # type: ignore
        return mystr_encoded  
    def StdTkInquiry(self):
        spondata = self.dataxml.StdTkInquiry()
        mystr_encoded = inputRespom(spondata,self.URL)
        Export.export(mystr_encoded)   # type: ignore
        return mystr_encoded  


def inputRespom(spondata,url):
    response = requests.request("POST",url=url, headers={'Content-Type': 'text/xml'}, data=Dataxml(spondata).encode("utf-8"))
    decode = response.text.split("<return>")[-1].split("</return>")[0]
    # ic(decode)
    # ic(base64.b64decode(decode).decode('utf-8'))
    mystr_encoded = base64.b64decode(decode).decode('utf-8') 
    return mystr_encoded