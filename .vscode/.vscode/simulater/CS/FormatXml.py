from collections import defaultdict
import xmltodict
from enum import Enum
from copy import deepcopy
from datetime import datetime
from icecream import ic
from .Lib._ConStant import Action as TemplateType
from .Lib.GlobalConfig import DataConfig
# ----------------------
# TemplateType Enum
# ----------------------
# class TemplateType(str, Enum):
#     DATAEXCHANGE = "DATAEXCHANGE"
#     CANCEL = "CANCEL"
#     DATAEXCHANGECONFIRM = "DATAEXCHANGECONFIRM"
#     REPRINTSLIP = "REPRINTSLIP"
#     OR = "OR"
#     ORCANCEL = "ORCANCEL"
#     ORCONFIRM = "ORCONFIRM"
#     INQUIRY = "INQUIRY"

# # ----------------------
# # Global DataConfig
# # ----------------------
# class DataConfig:
#     _instance = None

#     def __new__(cls):
#         if cls._instance is None:
#             cls._instance = super(DataConfig, cls).__new__(cls)
#             cls._instance._data = {}        # current data {index: {...}}
#             cls._instance._versions = {}    # versions {index: [history]}
#             cls._instance._current_index = 0
#         return cls._instance

#     # ----------------------
#     # Add new entry (auto index)
#     # ----------------------
#     def add_entry(self, entry: dict):
#         index = self._current_index
#         self._data[index] = deepcopy(entry)
#         self._versions[index] = [deepcopy(entry)]  # initial version
#         self._current_index += 1
#         return index

#     # ----------------------
#     # Update entry (creates new version)
#     # ----------------------
#     def update_entry(self, index: int, new_data: dict):
#         if index not in self._data:
#             raise KeyError(f"Index {index} not found")
#         self._data[index] = deepcopy(new_data)
#         self._versions[index].append(deepcopy(new_data))

#     # ----------------------
#     # Get current data
#     # ----------------------
#     def get_current(self, index: int):
#         return deepcopy(self._data.get(index))

#     # ----------------------
#     # Versioning
#     # ----------------------
#     def get_versions(self, index: int):
#         return deepcopy(self._versions.get(index, []))

#     # ----------------------
#     # Rollback to specific version
#     # ----------------------
#     def rollback(self, index: int, version_number: int):
#         versions = self._versions.get(index)
#         if not versions:
#             raise KeyError(f"No versions for index {index}")
#         if version_number < 0 or version_number >= len(versions):
#             raise IndexError(f"Invalid version_number {version_number}")
#         self._data[index] = deepcopy(versions[version_number])
#         self._versions[index].append(deepcopy(versions[version_number]))

#     # ----------------------
#     # Get all entries
#     # ----------------------
#     def get_all(self):
#         return deepcopy(self._data)

# ----------------------
# XML Formatter
# ----------------------
class XMLFormatter:
    def __init__(self, funt_data: DataConfig):
        self.funt_data = funt_data
        self.templates = {
            TemplateType.DATAEXCHANGE: self._template_dataexchange,
            TemplateType.CANCEL: self._template_cancel,
            TemplateType.DATAEXCHANGECONFIRM: self._template_dataexchange_confirm,
            TemplateType.REPRINTSLIP: self._template_reprintslip,
            TemplateType.OR: self._template_or,
            TemplateType.ORCANCEL: self._template_or_cancel,
            TemplateType.ORCONFIRM: self._template_or_confirm,
            TemplateType.INQUIRY: self._template_inquiry,
        }

    # ----------------------
    # Safe format with missing keys
    # ----------------------
    def safe_format(self, template_func, data: dict) -> str:
        template = template_func()

        class SafeDict(defaultdict):
            def __missing__(self, key):
                return f"{{MISSING:{key}}}"

        return template.format_map(SafeDict(str, data))

    # ----------------------
    # Flatten dict or XML string
    # ----------------------
    def flatten_dict(self, d) -> dict:
        result = {}
        if isinstance(d, str):
            d = xmltodict.parse(d)

        def _flatten(subdict):
            if isinstance(subdict, dict):
                for k, v in subdict.items():
                    if isinstance(v, (dict, list)):
                        _flatten(v)
                    else:
                        result[k] = v
            elif isinstance(subdict, list):
                for item in subdict:
                    _flatten(item)

        _flatten(d)
        return result

    # ----------------------
    # Build SOAP envelope
    # ----------------------
    def build(self, index: int, template_name: TemplateType, debug=False) -> str | None:
        if template_name not in self.templates:
            return None
        data = self.funt_data.get_current(index)
        if debug:
            inner_xml = self.safe_format(self.templates[template_name], data)
        return f"""<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:por="http://portal.cs/">
  <soapenv:Header/>
  <soapenv:Body>
    <por:CSService>
      <arg0><![CDATA[{inner_xml}]]></arg0>
    </por:CSService>
  </soapenv:Body>
</soapenv:Envelope>"""

    # ----------------------
    # Example templates

 # -----------------------------
    # Template XML
    # -----------------------------
    def _template_dataexchange(self) -> str:
        return  """<?xml version="1.0" encoding="UTF-8"?>
			<HQ_REQUEST>
			<SERVICE_BOX>
			<ADDRESS>
			<VENDOR_ID>{VENDOR_ID}</VENDOR_ID>
			<SERVICE_ID>{SERVICE_ID}</SERVICE_ID>
			<METHOD>DataExchange</METHOD>
			</ADDRESS>
			<DATA>
			<PAYMENT_CHANNEL>{PAYMENT_CHANNEL}</PAYMENT_CHANNEL>
			<VENDOR_ID>{VENDOR_ID}</VENDOR_ID>
			<SERV_ID>{SERVICE_ID}</SERV_ID>
			<SERVICE_ID>{SERVICE_ID}</SERVICE_ID>
			<STORE_ID>{STORE_ID}</STORE_ID>
			<STATION_ID>{MACHINE_ID}</STATION_ID>
			<BUS_DATE>{DATE_BUS}</BUS_DATE>
			<BUS_TIME>{TIME_BUS}</BUS_TIME>
			<SYS_DATE>{DATE_SYS}</SYS_DATE>
			<SYS_TIME>{TIME_SYS}</SYS_TIME>
			<COMMON_TRN_ID>{COMMON_TX_ID}</COMMON_TRN_ID>
			<SEQ_NO>{CLIENT_SERVICE_SEQUENCE}</SEQ_NO>
			<CLIENT_SERV_SEQ>{CLIENT_SEQUENCE_NO}</CLIENT_SERV_SEQ>
			<SHIFT_ID>{SHIFT_ID}</SHIFT_ID>
			<TRANS_TYPE>{TX_TYPE}</TRANS_TYPE>
			<ACCT_NO></ACCT_NO>
			<BILL_AMT>{BILL_AMT}</BILL_AMT>
			<ROUND_BILL_AMT>{BILL_AMT_ROUND}</ROUND_BILL_AMT>
			<VAT_AMT>{BILL_AMT_VAT}</VAT_AMT>
			<REPT_TYPE>{RECEIPT_TYPE}</REPT_TYPE>
			<REPT_NO>{RECEIPT_NO}</REPT_NO>
			<PREV_REF_SEQ></PREV_REF_SEQ>
			<PREV_REF_DATE></PREV_REF_DATE>
			<SERV_CHARGE_NO></SERV_CHARGE_NO>
			<ITEM_NAME>{ITEM_NAME}</ITEM_NAME>
			<ITEM_SELECTION>{ITEM_SELECTIC}</ITEM_SELECTION>
			<EMPLOYEE_ID>{EMPLOYEE_ID}</EMPLOYEE_ID>
			<POS_TAX_ID>{POS_TAX_ID}</POS_TAX_ID>
			<DATA_1>{DATA_1}</DATA_1>
			<DATA_2>{DATA_2}</DATA_2>
			<DATA_3>{DATA_3}</DATA_3>
			<DATA_4>{DATA_4}</DATA_4>
			<DATA_5>{DATA_5}</DATA_5>
			<DATA_6>{DATA_6}</DATA_6>
			<DATA_7>{DATA_7}</DATA_7>
			<DATA_9>{DATA_9}</DATA_9>
			<ZONE>{ZONE}</ZONE>
			<PAYMENT_TYPE>{PAYMENT_TYPE}</PAYMENT_TYPE>
			<CANCEL_ID></CANCEL_ID>
			<CUST_NAME>{CUSTOMER_NAME}</CUST_NAME>
			<CUST_ADDR_1>{CUSTOMER_ADDR_1}</CUST_ADDR_1>
			<CUST_ADDR_2>{CUSTOMER_ADDR_2}</CUST_ADDR_2>
			<CUST_ADDR_3>{CUSTOMER_ADDR_3}</CUST_ADDR_3>
			<CUST_PHONE_NO>{CUSTOMER_TEL_NO}</CUST_PHONE_NO>
			</DATA>
			</SERVICE_BOX>
			</HQ_REQUEST>
			"""
    def _template_cancel(self) -> str:
        return  """<?xml version="1.0" encoding="UTF-8"?>
          <HQ_REQUEST>
            <SERVICE_BOX>
              <ADDRESS>
                <VENDOR_ID>{VENDOR_ID}</VENDOR_ID>
                <SERVICE_ID>{SERVICE_ID}</SERVICE_ID>
                <METHOD>Cancel</METHOD>
              </ADDRESS>
              <DATA>
                <PAYMENT_CHANNEL>{PAYMENT_CHANNEL}</PAYMENT_CHANNEL>
                <VENDOR_ID>{VENDOR_ID_OUT}</VENDOR_ID>
                <SERV_ID>{SERVICE_ID_OUT}</SERV_ID>
                <SERVICE_ID>{SERVICE_ID_OUT}</SERVICE_ID>
                <STORE_ID>{STORE_ID}</STORE_ID>
                <STATION_ID>{MACHINE_ID}</STATION_ID>
                <BUS_DATE>{DATE_BUS}</BUS_DATE>
                <BUS_TIME>{TIME_BUS}</BUS_TIME>
                <TX_ID>{TX_ID}</TX_ID>
                <PAYMENT_TYPE>{PAYMENT_TYPE}</PAYMENT_TYPE>
                <CANCEL_ID></CANCEL_ID>
              </DATA>
            </SERVICE_BOX>
          </HQ_REQUEST>"""
    def _template_dataexchange_confirm(self) -> str:
        return """<?xml version="1.0" encoding="UTF-8"?>
<HQ_REQUEST>
<SERVICE_BOX>
<ADDRESS>
<VENDOR_ID>{VENDOR_ID}</VENDOR_ID>
<SERVICE_ID>{SERVICE_ID}</SERVICE_ID>
<METHOD>DataExchangeConfirm</METHOD>
</ADDRESS>
<DATA>
<PAYMENT_CHANNEL>{PAYMENT_CHANNEL}</PAYMENT_CHANNEL>
<VENDOR_ID>{VENDOR_ID_OUT}</VENDOR_ID>
<SERV_ID>{SERVICE_ID_OUT}</SERV_ID>
<SERVICE_ID>{SERVICE_ID_OUT}</SERVICE_ID>
<STATION_ID>{MACHINE_ID}</STATION_ID>
<STORE_ID>{STORE_ID}</STORE_ID>
<BUS_DATE>{DATE_BUS}</BUS_DATE>
<BUS_TIME>{TIME_BUS}</BUS_TIME>
<SYS_DATE>{DATE_SYS}</SYS_DATE>
<SYS_TIME>{TIME_SYS}</SYS_TIME>
<TX_ID>{TX_ID}</TX_ID>
<SEQ_NO>{SEQ_NO}</SEQ_NO>
<EMPLOYEE_ID>{EMPLOYEE_ID}</EMPLOYEE_ID>
<CLIENT_SERV_SEQ>{CLIENT_SERV_SEQ}</CLIENT_SERV_SEQ>
<SERV_ID>{SERVICE_ID}</SERV_ID>
<BILL_AMT>{BILL_AMT}</BILL_AMT>
<ROUND_BILL_AMT>{ROUND_BILL_AMT}</ROUND_BILL_AMT>
<ACCT_NO></ACCT_NO>
<VAT_AMT>{VAT_AMT}</VAT_AMT>
<DATA_1>{DATA_1_NO}</DATA_1>
<DATA_2>{DATA_2_NO}</DATA_2>
<DATA_3>{DATA_3_NO}</DATA_3>
<DATA_4>{DATA_4_NO}</DATA_4>
<DATA_5>{DATA_5_NO}</DATA_5>
<DATA_6>{DATA_6_NO}</DATA_6>
<DATA_7>{DATA_7_NO}</DATA_7>
<DATA_9>{DATA_9_NO}</DATA_9>
<ZONE>{ZONE}</ZONE>
<PAYMENT_TYPE>001</PAYMENT_TYPE>
<TOT_BILL_TRANS></TOT_BILL_TRANS>
<TOT_BILL_AMT></TOT_BILL_AMT>
<TOT_VENDOR_TRANS></TOT_VENDOR_TRANS>
<TOT_VENDOR_AMT></TOT_VENDOR_AMT>
<TOT_COUNTER_TRANS></TOT_COUNTER_TRANS>
<TOT_COUNTER_AMT></TOT_COUNTER_AMT>
<TOT_CLIENT_TRANS></TOT_CLIENT_TRANS>
<TOT_CLIENT_AMT></TOT_CLIENT_AMT>
<TOT_BILL_TRANS_OR></TOT_BILL_TRANS_OR>
<TOT_BILL_AMT_OR></TOT_BILL_AMT_OR>
<CANCEL_ID></CANCEL_ID>
<CUST_NAME>{CUST_NAME}</CUST_NAME>
<CUST_ADDR_1>{CUST_ADDR_1}</CUST_ADDR_1>
<CUST_ADDR_2>{CUST_ADDR_2}</CUST_ADDR_2>
<CUST_ADDR_3>{CUST_ADDR_3}</CUST_ADDR_3>
<CUST_PHONE_NO>{CUST_PHONE_NO}</CUST_PHONE_NO>
</DATA>
</SERVICE_BOX>
</HQ_REQUEST>"""
    def _template_reprintslip(self) -> str:
        return """<?xml version="1.0" encoding="UTF-8"?>
<HQ_REQUEST>
<SERVICE_BOX>
<ADDRESS>
<VENDOR_ID>{VENDOR_ID}</VENDOR_ID>
<SERVICE_ID>{SERVICE_ID}</SERVICE_ID>
<METHOD>REPRINTSLIP</METHOD>
</ADDRESS>
<DATA>
<PAYMENT_CHANNEL>{PAYMENT_CHANNEL}</PAYMENT_CHANNEL>
<VENDOR_ID>{VENDOR_ID_OUT}</VENDOR_ID>
<SERV_ID>{SERVICE_ID_OUT}</SERV_ID>
<SERVICE_ID>{SERVICE_ID_OUT}</SERVICE_ID>
<STORE_ID>{STORE_ID}</STORE_ID>
<STATION_ID>{MACHINE_ID}</STATION_ID>
<BUS_DATE>{DATE_BUS}</BUS_DATE>
<BUS_TIME>{TIME_BUS}</BUS_TIME>
<COMMON_TRN_ID>{COMMON_TX_ID}</COMMON_TRN_ID>
<SEQ_NO>{SEQ_NO}</SEQ_NO>
<CLIENT_SERV_SEQ>{CLIENT_SERV_SEQ}</CLIENT_SERV_SEQ>
<SHIFT_ID>{SHIFT_ID}</SHIFT_ID>
<TRANS_TYPE>{TX_TYPE}</TRANS_TYPE>
<ACCT_NO></ACCT_NO>
<BILL_AMT>{BILL_AMT}</BILL_AMT>
<ROUND_BILL_AMT>{ROUND_BILL_AMT}</ROUND_BILL_AMT>
<VAT_AMT>{VAT_AMT}</VAT_AMT>
<REPT_TYPE>{REPT_TYPE}</REPT_TYPE>
<TX_ID>{TX_ID}</TX_ID>
<REPT_NO></REPT_NO>
<PREV_REF_SEQ></PREV_REF_SEQ>
<PREV_REF_DATE></PREV_REF_DATE>
<SERV_CHARGE_NO></SERV_CHARGE_NO>
<ITEM_NAME>{ITEM_NAME}</ITEM_NAME>
<ITEM_SELECTION>{ITEM_SELECTIC}</ITEM_SELECTION>
<EMPLOYEE_ID>{EMPLOYEE_ID}</EMPLOYEE_ID>
<POS_TAX_ID>{POS_TAX_ID}</POS_TAX_ID>
<DATA_1>{DATA_1_NO}</DATA_1>
<DATA_2>{DATA_2_NO}</DATA_2>
<DATA_3>{DATA_3_NO}</DATA_3>
<DATA_4>{DATA_4_NO}</DATA_4>
<DATA_5>{DATA_5_NO}</DATA_5>
<DATA_6>{DATA_6_NO}</DATA_6>
<DATA_7>{DATA_7_NO}</DATA_7>
<DATA_9>{DATA_9_NO}</DATA_9>
<ZONE>{ZONE}</ZONE>
<CANCEL_ID></CANCEL_ID>
</DATA>
</SERVICE_BOX>
</HQ_REQUEST>"""
    def _template_or(self) -> str:
        return """<?xml version="1.0" encoding="UTF-8"?>
<HQ_REQUEST>
<SERVICE_BOX>
<ADDRESS>
<VENDOR_ID>{VENDOR_ID}</VENDOR_ID>
<SERVICE_ID>{SERVICE_ID}</SERVICE_ID>
<METHOD>OR</METHOD>
</ADDRESS>
<DATA>
<PAYMENT_CHANNEL>{PAYMENT_CHANNEL}</PAYMENT_CHANNEL>
<VENDOR_ID>{VENDOR_ID_OUT}</VENDOR_ID>
<SERVICE_ID>{SERVICE_ID_OUT}</SERVICE_ID>
<SERV_ID>{SERVICE_ID_OUT}</SERV_ID>
<STORE_ID>{STORE_ID}</STORE_ID>
<STATION_ID>{MACHINE_ID}</STATION_ID>
<BUS_DATE>{DATE_BUS}</BUS_DATE>
<BUS_TIME>{TIME_BUS}</BUS_TIME>
<SYS_DATE>{DATE_SYS}</SYS_DATE>
<SYS_TIME>{TIME_SYS}</SYS_TIME>
<TX_ID>{TX_ID}</TX_ID>
<BILL_AMT>{BILL_AMT}</BILL_AMT>
<ROUND_BILL_AMT>{ROUND_BILL_AMT}</ROUND_BILL_AMT>
<VAT_AMT>{VAT_AMT}</VAT_AMT>
<PAYMENT_TYPE>001</PAYMENT_TYPE>
<CANCEL_ID></CANCEL_ID>
</DATA>
</SERVICE_BOX>
</HQ_REQUEST>"""
    def _template_or_cancel(self) -> str:
        return """<?xml version="1.0" encoding="UTF-8"?>
<HQ_REQUEST>
<SERVICE_BOX>
<ADDRESS>
<VENDOR_ID>{VENDOR_ID}</VENDOR_ID>
<SERVICE_ID>{SERVICE_ID}</SERVICE_ID>
<METHOD>ORCancel</METHOD>
</ADDRESS>
<DATA>
<PAYMENT_CHANNEL>{PAYMENT_CHANNEL}</PAYMENT_CHANNEL>
<VENDOR_ID>{VENDOR_ID_OUT}</VENDOR_ID>
<SERVICE_ID>{SERVICE_ID_OUT}</SERVICE_ID>
<SERV_ID>{SERVICE_ID_OUT}</SERV_ID>
<STORE_ID>{STORE_ID}</STORE_ID>
<STATION_ID>{MACHINE_ID}</STATION_ID>
<BUS_DATE>{DATE_BUS}</BUS_DATE>
<BUS_TIME>{TIME_BUS}</BUS_TIME>
<TX_ID>{TX_ID}</TX_ID>
<PAYMENT_TYPE>001</PAYMENT_TYPE>
<CANCEL_ID></CANCEL_ID>
</DATA>
</SERVICE_BOX>
</HQ_REQUEST>"""
    def _template_or_confirm(self) -> str:
        return """<?xml version="1.0" encoding="UTF-8"?>
<HQ_REQUEST>
<SERVICE_BOX>
<ADDRESS>
<VENDOR_ID>{VENDOR_ID}</VENDOR_ID>
<SERVICE_ID>{SERVICE_ID}</SERVICE_ID>
<METHOD>ORConfirm</METHOD>
</ADDRESS>
<DATA>
<PAYMENT_CHANNEL>{PAYMENT_CHANNEL}</PAYMENT_CHANNEL>
<VENDOR_ID>{VENDOR_ID_OUT}</VENDOR_ID>
<SERVICE_ID>{SERVICE_ID_OUT}</SERVICE_ID>
<SERV_ID>{SERVICE_ID_OUT}</SERV_ID>
<STORE_ID>{STORE_ID}</STORE_ID>
<STATION_ID>{MACHINE_ID}</STATION_ID>
<BUS_DATE>{DATE_BUS}</BUS_DATE>
<BUS_TIME>{TIME_BUS}</BUS_TIME>
<BILL_AMT>{BILL_AMT}</BILL_AMT>
<ROUND_BILL_AMT>{ROUND_BILL_AMT}</ROUND_BILL_AMT>
<VAT_AMT>{VAT_AMT}</VAT_AMT>
<TX_ID>{TX_ID}</TX_ID>
<SEQ_NO>{SEQ_NO}</SEQ_NO>
<CLIENT_SERV_SEQ>{CLIENT_SERV_SEQ}</CLIENT_SERV_SEQ>
<SERV_ID>{SERVICE_ID}</SERV_ID>
<DATA_1>{DATA_1_NO}</DATA_1>
<DATA_2>{DATA_2_NO}</DATA_2>
<DATA_3>{DATA_3_NO}</DATA_3>
<DATA_4>{DATA_4_NO}</DATA_4>
<DATA_5>{DATA_5_NO}</DATA_5>
<DATA_6>{DATA_6_NO}</DATA_6>
<DATA_7>{DATA_7_NO}</DATA_7>
<DATA_9>{DATA_9_NO}</DATA_9>
<ZONE>{ZONE}</ZONE>
<PAYMENT_TYPE>001</PAYMENT_TYPE>
<TOT_BILL_TRANS></TOT_BILL_TRANS>
<TOT_BILL_AMT></TOT_BILL_AMT>
<TOT_VENDOR_TRANS></TOT_VENDOR_TRANS>
<TOT_VENDOR_AMT></TOT_VENDOR_AMT>
<TOT_COUNTER_TRANS></TOT_COUNTER_TRANS>
<TOT_COUNTER_AMT></TOT_COUNTER_AMT>
<TOT_CLIENT_TRANS></TOT_CLIENT_TRANS>
<TOT_CLIENT_AMT></TOT_CLIENT_AMT>
<TOT_BILL_TRANS_OR></TOT_BILL_TRANS_OR>
<TOT_BILL_AMT_OR></TOT_BILL_AMT_OR>
<CANCEL_ID></CANCEL_ID>
</DATA>
</SERVICE_BOX>
</HQ_REQUEST>"""
    def _template_inquiry(self) -> str:
        return """<?xml version="1.0" encoding="UTF-8"?>
<HQ_REQUEST>
<SERVICE_BOX>
<ADDRESS>
<VENDOR_ID>{VENDOR_ID}</VENDOR_ID>
<SERVICE_ID>{SERVICE_ID}</SERVICE_ID>
<METHOD>Inquiry</METHOD>
</ADDRESS>
<DATA>
<PAYMENT_CHANNEL>{PAYMENT_CHANNEL}</PAYMENT_CHANNEL>
<VENDOR_ID>{VENDOR_ID}</VENDOR_ID>
<SERV_ID>{SERVICE_ID}</SERV_ID>
<SERVICE_ID>{SERVICE_ID}</SERVICE_ID>
<STORE_ID>{STORE_ID}</STORE_ID>
<STATION_ID>{MACHINE_ID}</STATION_ID>
<BUS_DATE>{DATE_BUS}</BUS_DATE>
<BUS_TIME>{TIME_BUS}</BUS_TIME>
<SYS_DATE>{DATE_SYS}</SYS_DATE>
<SYS_TIME>{TIME_SYS}</SYS_TIME>
<COMMON_TRN_ID>{COMMON_TX_ID}</COMMON_TRN_ID>
<SEQ_NO>{SEQ_NO}</SEQ_NO>
<CLIENT_SERV_SEQ>{CLIENT_SERV_SEQ}</CLIENT_SERV_SEQ>
<SHIFT_ID>{SHIFT_ID}</SHIFT_ID>
<TRANS_TYPE>{TX_TYPE}</TRANS_TYPE>
<ACCT_NO></ACCT_NO>
<BILL_AMT>{BILL_AMT}</BILL_AMT>
<ROUND_BILL_AMT>{ROUND_BILL_AMT}</ROUND_BILL_AMT>
<VAT_AMT>{VAT_AMT}</VAT_AMT>
<REPT_TYPE>{REPT_TYPE}</REPT_TYPE>
<REPT_NO></REPT_NO>
<PREV_REF_SEQ></PREV_REF_SEQ>
<PREV_REF_DATE></PREV_REF_DATE>
<SERV_CHARGE_NO></SERV_CHARGE_NO>
<ITEM_NAME>{ITEM_NAME}</ITEM_NAME>
<ITEM_SELECTION>{ITEM_SELECTIC}</ITEM_SELECTION>
<EMPLOYEE_ID>{EMPLOYEE_ID}</EMPLOYEE_ID>
<POS_TAX_ID>{POS_TAX_ID}</POS_TAX_ID>
<DATA_1>{DATA_1_NO}</DATA_1>
<DATA_2>{DATA_2_NO}</DATA_2>
<DATA_3>{DATA_3_NO}</DATA_3>
<DATA_4>{DATA_4_NO}</DATA_4>
<DATA_5>{DATA_5_NO}</DATA_5>
<DATA_6>{DATA_6_NO}</DATA_6>
<DATA_7>{DATA_7_NO}</DATA_7>
<DATA_9>{DATA_9_NO}</DATA_9>
<ZONE>{ZONE}</ZONE>
<PAYMENT_TYPE>{PAYMENT_TYPE}</PAYMENT_TYPE>
<CANCEL_ID></CANCEL_ID>
</DATA>
</SERVICE_BOX>
</HQ_REQUEST>"""
