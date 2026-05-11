import base64
import random
import requests
import xmltodict as xd
from datetime import datetime
from typing import Dict, Any, Optional
from fastapi import APIRouter, HTTPException
from .schemas import TransactionPayload, ActionRequest


# ==========================================
# 1. DATA MODEL & STATE MANAGEMENT
# ==========================================
class TransactionContext:
    def __init__(self, **kwargs):
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

        # เก็บ XML และ Raw Response
        self.latest_request_xml = ""
        self.latest_raw_decoded_response = ""

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
                    self.calc_seq_no = str(int(self.resp_tx_id[len(self.resp_tx_id)-5:]) + 1).zfill(5)
            except Exception:
                self.calc_seq_no = hq_resp.get("SEQ_NO", "00001")
                
            self.calc_bill_amt = hq_resp.get("BILL_AMT", self.bill_amt)
            
        except Exception as e:
            print(f"[Core Warning] ไม่สามารถประมวลผล XML State ได้: {e}")

    def get_full_summary(self) -> Dict[str, Any]:
        return {
            "INPUT_VALUES": {
                "STORE_ID": self.store_id, "VENDOR_ID": self.vendor_id, "SERVICE_ID": self.service_id,
                "ITEM_NAME": self.item_name, "ZONE": self.zone, "BILL_AMT": self.bill_amt,
                "DATA_1": self.data_1, "DATA_2": self.data_2, "DATA_3": self.data_3, "DATA_4": self.data_4,
                "DATA_5": self.data_5, "DATA_6": self.data_6, "DATA_7": self.data_7, "DATA_9": self.data_9,
                "CUST_NAME": self.cust_name, "CUST_PHONE_NO": self.cust_phone_no
            },
            "GENERATED_VALUES": {
                "SYS_DATE": self.sys_date, "SYS_TIME": self.sys_time, "COMMON_TRN_ID": self.common_trn_id,
                "CALC_SEQ_NO": self.calc_seq_no, "CALC_BILL_AMT": self.calc_bill_amt
            },
            "REQUEST_XML": self.latest_request_xml,
            "DECODED_RAW_RESPONSE": self.latest_raw_decoded_response,
            "PARSED_DICT_RESPONSE": self.response_data
        }

    def get_compact_summary(self) -> Dict[str, Any]:
        full_data = self.get_full_summary()
        return self._remove_empty_values(full_data)

    def _remove_empty_values(self, data: Any) -> Any:
        if isinstance(data, dict):
            cleaned_dict = {}
            for key, value in data.items():
                cleaned_val = self._remove_empty_values(value)
                if cleaned_val not in (None, "", {}, []):
                    cleaned_dict[key] = cleaned_val
            return cleaned_dict
        elif isinstance(data, list):
            cleaned_list = [self._remove_empty_values(item) for item in data]
            return [item for item in cleaned_list if item not in (None, "", {}, [])]
        else:
            return data

# ==========================================
# 2. API CLIENT (SOAP WRAPPER)
# ==========================================
class CounterServiceAPI:
    def __init__(self, url: str):
        self.url = url
        self.headers = {'Content-Type': 'text/xml'}

    def _send_request(self, xml_payload: str, ctx: TransactionContext) -> Optional[str]:
        ctx.latest_request_xml = xml_payload 
        soap_env = f"""<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:por="http://portal.cs/">
    <soapenv:Header/><soapenv:Body><por:CSService><arg0><![CDATA[{xml_payload}]]></arg0></por:CSService></soapenv:Body>
</soapenv:Envelope>"""
        try:
            response = requests.post(self.url, headers=self.headers, data=soap_env.encode("utf-8"), timeout=30)
            if "<return>" in response.text:
                decode = response.text.split("<return>")[-1].split("</return>")[0]
                xml_resp = base64.b64decode(decode).decode('utf-8')
                ctx.latest_raw_decoded_response = xml_resp
                ctx.process_response(xml_resp)
                
                # แสดง Log บน Console ของ Server
                if ctx.response_data:
                    print(f"[API SUCCESS] Action Executed. Code: {ctx.response_data.get('CODE')}")
                return xml_resp
            else:
                raise ValueError("Response ไม่มี Tag <return>")
        except Exception as e:
            raise Exception(f"API Error: {e}")

    def data_exchange(self, ctx: TransactionContext) -> Optional[str]:
        ctx._refresh_timestamp()
        payload = f"""<?xml version="1.0" encoding="UTF-8"?><HQ_REQUEST><SERVICE_BOX><ADDRESS><VENDOR_ID>{ctx.vendor_id}</VENDOR_ID><SERVICE_ID>{ctx.service_id}</SERVICE_ID><METHOD>DataExchange</METHOD></ADDRESS><DATA><PAYMENT_CHANNEL>{ctx.payment_channel}</PAYMENT_CHANNEL><VENDOR_ID>{ctx.vendor_id}</VENDOR_ID><SERV_ID>{ctx.service_id}</SERV_ID><SERVICE_ID>{ctx.service_id}</SERVICE_ID><STORE_ID>{ctx.store_id}</STORE_ID><STATION_ID>1</STATION_ID><BUS_DATE>{ctx.sys_date}</BUS_DATE><BUS_TIME>{ctx.sys_time}</BUS_TIME><SYS_DATE>{ctx.sys_date}</SYS_DATE><SYS_TIME>{ctx.sys_time}</SYS_TIME><COMMON_TRN_ID>{ctx.common_trn_id}</COMMON_TRN_ID><SEQ_NO></SEQ_NO><CLIENT_SERV_SEQ></CLIENT_SERV_SEQ><SHIFT_ID>9</SHIFT_ID><TRANS_TYPE>N</TRANS_TYPE><ACCT_NO></ACCT_NO><BILL_AMT>{ctx.bill_amt}</BILL_AMT><ROUND_BILL_AMT>{ctx.bill_amt}</ROUND_BILL_AMT><VAT_AMT>{ctx.vat_amt}</VAT_AMT><REPT_TYPE>{ctx.rept_type}</REPT_TYPE><REPT_NO></REPT_NO><PREV_REF_SEQ></PREV_REF_SEQ><PREV_REF_DATE></PREV_REF_DATE><SERV_CHARGE_NO></SERV_CHARGE_NO><ITEM_NAME>{ctx.item_name}</ITEM_NAME><ITEM_SELECTION>N</ITEM_SELECTION><EMPLOYEE_ID>{ctx.employee_id}</EMPLOYEE_ID><POS_TAX_ID>{ctx.pos_tax_id}</POS_TAX_ID><DATA_1>{ctx.data_1}</DATA_1><ZONE>{ctx.zone}</ZONE><PAYMENT_TYPE>001</PAYMENT_TYPE><CANCEL_ID></CANCEL_ID></DATA></SERVICE_BOX></HQ_REQUEST>"""
        return self._send_request(payload, ctx)

    def cancel(self, ctx: TransactionContext) -> Optional[str]:
        payload = f"""<?xml version="1.0" encoding="UTF-8"?><HQ_REQUEST><SERVICE_BOX><ADDRESS><VENDOR_ID>{ctx.vendor_id}</VENDOR_ID><SERVICE_ID>{ctx.service_id}</SERVICE_ID><METHOD>Cancel</METHOD></ADDRESS><DATA><PAYMENT_CHANNEL>{ctx.payment_channel}</PAYMENT_CHANNEL><VENDOR_ID>{ctx.resp_vendor_id}</VENDOR_ID><SERV_ID>{ctx.resp_serv_id}</SERV_ID><SERVICE_ID>{ctx.resp_serv_id}</SERVICE_ID><STORE_ID>{ctx.store_id}</STORE_ID><STATION_ID>1</STATION_ID><BUS_DATE>{ctx.sys_date}</BUS_DATE><BUS_TIME>{ctx.sys_time}</BUS_TIME><TX_ID>{ctx.resp_tx_id}</TX_ID><PAYMENT_TYPE>001</PAYMENT_TYPE><CANCEL_ID></CANCEL_ID></DATA></SERVICE_BOX></HQ_REQUEST>"""
        return self._send_request(payload, ctx)

    def data_exchange_confirm(self, ctx: TransactionContext) -> Optional[str]:
        r_amt = ctx.response_data.get('BILL_AMT', ctx.bill_amt)
        payload = f"""<?xml version="1.0" encoding="UTF-8"?><HQ_REQUEST><SERVICE_BOX><ADDRESS><VENDOR_ID>{ctx.vendor_id}</VENDOR_ID><SERVICE_ID>{ctx.service_id}</SERVICE_ID><METHOD>DataExchangeConfirm</METHOD></ADDRESS><DATA><PAYMENT_CHANNEL>{ctx.payment_channel}</PAYMENT_CHANNEL><VENDOR_ID>{ctx.resp_vendor_id}</VENDOR_ID><SERV_ID>{ctx.resp_serv_id}</SERV_ID><SERVICE_ID>{ctx.resp_serv_id}</SERVICE_ID><STATION_ID>1</STATION_ID><STORE_ID>{ctx.store_id}</STORE_ID><BUS_DATE>{ctx.sys_date}</BUS_DATE><BUS_TIME>{ctx.sys_time}</BUS_TIME><SYS_DATE>{ctx.sys_date}</SYS_DATE><SYS_TIME>{ctx.sys_time}</SYS_TIME><TX_ID>{ctx.resp_tx_id}</TX_ID><SEQ_NO>{ctx.calc_seq_no}</SEQ_NO><EMPLOYEE_ID>{ctx.employee_id}</EMPLOYEE_ID><CLIENT_SERV_SEQ>{ctx.calc_seq_no}</CLIENT_SERV_SEQ><SERV_ID>{ctx.resp_serv_id}</SERV_ID><BILL_AMT>{r_amt}</BILL_AMT><ROUND_BILL_AMT>{r_amt}</ROUND_BILL_AMT><VAT_AMT>{ctx.vat_amt}</VAT_AMT><DATA_1>{ctx.response_data.get('DATA_1', ctx.data_1)}</DATA_1><ZONE>{ctx.zone}</ZONE><PAYMENT_TYPE>001</PAYMENT_TYPE><TOT_BILL_TRANS></TOT_BILL_TRANS><TOT_BILL_AMT></TOT_BILL_AMT><TOT_VENDOR_TRANS></TOT_VENDOR_TRANS><TOT_VENDOR_AMT></TOT_VENDOR_AMT><TOT_COUNTER_TRANS></TOT_COUNTER_TRANS><TOT_COUNTER_AMT></TOT_COUNTER_AMT><TOT_CLIENT_TRANS></TOT_CLIENT_TRANS><TOT_CLIENT_AMT></TOT_CLIENT_AMT><TOT_BILL_TRANS_OR></TOT_BILL_TRANS_OR><TOT_BILL_AMT_OR></TOT_BILL_AMT_OR><CANCEL_ID></CANCEL_ID></DATA></SERVICE_BOX></HQ_REQUEST>"""
        return self._send_request(payload, ctx)

    def online_receipt(self, ctx: TransactionContext) -> Optional[str]:
        r_amt = ctx.response_data.get('BILL_AMT', ctx.bill_amt)
        payload = f"""<?xml version="1.0" encoding="UTF-8"?><HQ_REQUEST><SERVICE_BOX><ADDRESS><VENDOR_ID>{ctx.vendor_id}</VENDOR_ID><SERVICE_ID>{ctx.service_id}</SERVICE_ID><METHOD>OR</METHOD></ADDRESS><DATA><PAYMENT_CHANNEL>{ctx.payment_channel}</PAYMENT_CHANNEL><VENDOR_ID>{ctx.resp_vendor_id}</VENDOR_ID><SERVICE_ID>{ctx.resp_serv_id}</SERVICE_ID><SERV_ID>{ctx.resp_serv_id}</SERV_ID><STORE_ID>{ctx.store_id}</STORE_ID><STATION_ID>1</STATION_ID><BUS_DATE>{ctx.sys_date}</BUS_DATE><BUS_TIME>{ctx.sys_time}</BUS_TIME><SYS_DATE>{ctx.sys_date}</SYS_DATE><SYS_TIME>{ctx.sys_time}</SYS_TIME><TX_ID>{ctx.resp_tx_id}</TX_ID><BILL_AMT>{r_amt}</BILL_AMT><ROUND_BILL_AMT>{r_amt}</ROUND_BILL_AMT><VAT_AMT>{ctx.vat_amt}</VAT_AMT><PAYMENT_TYPE>001</PAYMENT_TYPE><CANCEL_ID></CANCEL_ID></DATA></SERVICE_BOX></HQ_REQUEST>"""
        return self._send_request(payload, ctx)

    def or_cancel(self, ctx: TransactionContext) -> Optional[str]:
        payload = f"""<?xml version="1.0" encoding="UTF-8"?><HQ_REQUEST><SERVICE_BOX><ADDRESS><VENDOR_ID>{ctx.vendor_id}</VENDOR_ID><SERVICE_ID>{ctx.service_id}</SERVICE_ID><METHOD>ORCancel</METHOD></ADDRESS><DATA><PAYMENT_CHANNEL>{ctx.payment_channel}</PAYMENT_CHANNEL><VENDOR_ID>{ctx.resp_vendor_id}</VENDOR_ID><SERVICE_ID>{ctx.resp_serv_id}</SERVICE_ID><SERV_ID>{ctx.resp_serv_id}</SERV_ID><STORE_ID>{ctx.store_id}</STORE_ID><STATION_ID>1</STATION_ID><BUS_DATE>{ctx.sys_date}</BUS_DATE><BUS_TIME>{ctx.sys_time}</BUS_TIME><TX_ID>{ctx.resp_tx_id}</TX_ID><PAYMENT_TYPE>001</PAYMENT_TYPE><CANCEL_ID></CANCEL_ID></DATA></SERVICE_BOX></HQ_REQUEST>"""
        return self._send_request(payload, ctx)

    def or_confirm(self, ctx: TransactionContext) -> Optional[str]:
        r_amt = ctx.response_data.get('BILL_AMT', ctx.bill_amt)
        payload = f"""<?xml version="1.0" encoding="UTF-8"?><HQ_REQUEST><SERVICE_BOX><ADDRESS><VENDOR_ID>{ctx.vendor_id}</VENDOR_ID><SERVICE_ID>{ctx.service_id}</SERVICE_ID><METHOD>ORConfirm</METHOD></ADDRESS><DATA><PAYMENT_CHANNEL>{ctx.payment_channel}</PAYMENT_CHANNEL><VENDOR_ID>{ctx.resp_vendor_id}</VENDOR_ID><SERVICE_ID>{ctx.resp_serv_id}</SERVICE_ID><SERV_ID>{ctx.resp_serv_id}</SERV_ID><STATION_ID>1</STATION_ID><STORE_ID>{ctx.store_id}</STORE_ID><BUS_DATE>{ctx.sys_date}</BUS_DATE><BUS_TIME>{ctx.sys_time}</BUS_TIME><BILL_AMT>{r_amt}</BILL_AMT><ROUND_BILL_AMT>{r_amt}</ROUND_BILL_AMT><VAT_AMT>{ctx.vat_amt}</VAT_AMT><TX_ID>{ctx.resp_tx_id}</TX_ID><SEQ_NO>{ctx.calc_seq_no}</SEQ_NO><CLIENT_SERV_SEQ>{ctx.calc_seq_no}</CLIENT_SERV_SEQ><SERV_ID>{ctx.resp_serv_id}</SERV_ID><DATA_1>{ctx.response_data.get('DATA_1', ctx.data_1)}</DATA_1><ZONE>{ctx.zone}</ZONE><PAYMENT_TYPE>001</PAYMENT_TYPE><TOT_BILL_TRANS></TOT_BILL_TRANS><TOT_BILL_AMT></TOT_BILL_AMT><TOT_VENDOR_TRANS></TOT_VENDOR_TRANS><TOT_VENDOR_AMT></TOT_VENDOR_AMT><TOT_COUNTER_TRANS></TOT_COUNTER_TRANS><TOT_COUNTER_AMT></TOT_COUNTER_AMT><TOT_CLIENT_TRANS></TOT_CLIENT_TRANS><TOT_CLIENT_AMT></TOT_CLIENT_AMT><TOT_BILL_TRANS_OR></TOT_BILL_TRANS_OR><TOT_BILL_AMT_OR></TOT_BILL_AMT_OR><CANCEL_ID></CANCEL_ID></DATA></SERVICE_BOX></HQ_REQUEST>"""
        return self._send_request(payload, ctx)

    def reprint(self, ctx: TransactionContext) -> Optional[str]:
        payload = f"""<?xml version="1.0" encoding="UTF-8"?><HQ_REQUEST><SERVICE_BOX><ADDRESS><VENDOR_ID>{ctx.vendor_id}</VENDOR_ID><SERVICE_ID>{ctx.service_id}</SERVICE_ID><METHOD>Reprint</METHOD></ADDRESS><DATA><PAYMENT_CHANNEL>{ctx.payment_channel}</PAYMENT_CHANNEL><VENDOR_ID>{ctx.resp_vendor_id}</VENDOR_ID><SERVICE_ID>{ctx.resp_serv_id}</SERVICE_ID><SERV_ID>{ctx.resp_serv_id}</SERV_ID><STORE_ID>{ctx.store_id}</STORE_ID><STATION_ID>1</STATION_ID><BUS_DATE>{ctx.sys_date}</BUS_DATE><BUS_TIME>{ctx.sys_time}</BUS_TIME><TX_ID>{ctx.resp_tx_id}</TX_ID><PAYMENT_TYPE>001</PAYMENT_TYPE></DATA></SERVICE_BOX></HQ_REQUEST>"""
        return self._send_request(payload, ctx)

# ==========================================
# 3. ROUTER / FACADE MANAGER
# ==========================================
class CounterServiceRouter:
    def __init__(self, api_url: str):
        self.api = CounterServiceAPI(api_url)
        self.ctx = TransactionContext() 

    def set_transaction_data(self, data_payload: Dict[str, Any]) -> Dict[str, Any]:
        try:
            self.ctx = TransactionContext(**data_payload)
            return {
                "status": "success",
                "message": "Transaction data initialized successfully",
                "current_state": self.ctx.get_compact_summary()
            }
        except Exception as e:
            return {"status": "error", "message": str(e), "current_state": None}

    def execute_action(self, action_name: str) -> Dict[str, Any]:
        if not self.ctx:
            return {"status": "error", "message": "Context not set. Call 'set_transaction_data' first."}

        action_map = {
            "DataExchange": self.api.data_exchange,
            "Cancel": self.api.cancel,
            "DataExchangeConfirm": self.api.data_exchange_confirm,
            "OR": self.api.online_receipt,
            "ORCancel": self.api.or_cancel,
            "ORConfirm": self.api.or_confirm,
            "Reprint": self.api.reprint
        }

        target_function = action_map.get(action_name)
        if not target_function:
            return {"status": "error", "message": f"Invalid action: '{action_name}'."}

        try:
            target_function(self.ctx)
            resp_data = self.ctx.response_data
            is_success = str(resp_data.get("SUCCESS", "")).lower() == "true"
            
            return {
                "status": "success" if is_success else "failed",
                "action_executed": action_name,
                "response_code": resp_data.get("CODE", "UNKNOWN"),
                "response_desc": resp_data.get("DESCRIPTOR", "No description provided"),
                "data": self.ctx.get_compact_summary()
            }
        except Exception as e:
            return {
                "status": "error", "action_executed": action_name,
                "message": str(e), "data": self.ctx.get_compact_summary()
            }

# ==========================================
# 4. FASTAPI APPLICATION SETUP
# ==========================================
URL = "http://qacspos.counterservice.co.th:80/DCWSCDSONLINE/WSCDSService"
router_instance = CounterServiceRouter(URL)
router = APIRouter(prefix="/counter", tags=["Counter Service Microservice API"])


@router.post("/set")
def set_transaction_data(payload:TransactionPayload):
    try:
        data_dict = payload.model_dump(exclude_unset=True)
        result = router_instance.set_transaction_data(data_dict)
        if result["status"] == "error":
            raise HTTPException(status_code=400, detail=result["message"])
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/action")
def execute_transaction_action(request: ActionRequest):
    try:
        result = router_instance.execute_action(request.action_name)
        if result["status"] == "error":
            raise HTTPException(status_code=400, detail=result["message"])
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

