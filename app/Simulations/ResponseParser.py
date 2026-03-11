
from networkx import display
import xmltodict as xd
import pandas as pd
from typing import Any, Dict
# ตั้งค่า Pandas
pd.set_option('display.max_columns', None)
pd.set_option('display.max_rows', None)
pd.set_option('display.max_colwidth', None)




class ResponseParser:
    FIELDS = ['SUCCESS', 'CODE', 'DESCRIPTOR', 'VENDOR_ID', 'SERV_ID', 'TX_ID', 'PRINTSLIP', 'VAT', 'BILL_AMT', 'FEE', 'FEE_VAT', 'DATA_1', 'DATA_2', 'DATA_3', 'DATA_4', 'DATA_5', 'DATA_6', 'DATA_7', 'DATA_9', 'CUSTOMER_NAME', 'CUSTOMER_ADDR_1', 'CUSTOMER_ADDR_2', 'CUSTOMER_ADDR_3', 'CUSTOMER_TEL_NO', 'ACCT_NO']

    @staticmethod
    def parse_to_dict(xml_response: str) -> Dict[str, Any]:
        """แปลง XML เป็น Dictionary ให้ใช้งานต่อได้ง่าย"""
        if not xml_response: return {}
        try:
            parsed_data = xd.parse(xml_response)
            hq_response = parsed_data.get('HQ_RESPONSE', {})
            return {field: hq_response.get(field, '') for field in ResponseParser.FIELDS}
        except Exception as e:
            print(f"❌ Parse Error: {e}")
            return {}

    @staticmethod
    def display_as_dataframe(response_dict: Dict[str, Any]):
        """แสดงผลเฉพาะ Field ที่มีข้อมูลผ่าน Pandas (ทดแทน Dataframe ตัวเดิม)"""
        filtered_dict = {k: v for k, v in response_dict.items() if v is not None and str(v).strip() != ''}
        df = pd.DataFrame([filtered_dict])
        try:
            display(df)  # type: ignore
        except:
            print(df.to_dict())
