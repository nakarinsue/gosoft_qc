

import base64
import requests
import pandas as pd

# ตั้งค่า Pandas
pd.set_option('display.max_columns', None)
pd.set_option('display.max_rows', None)
pd.set_option('display.max_colwidth', None)



class SoapApiClient:
    def __init__(self, endpoint_url: str):
        self.endpoint_url = endpoint_url

    def _wrap_soap_envelope(self, action_payload: str) -> str:
        return f"""<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:por="http://portal.cs/">
        <soapenv:Header/>
        <soapenv:Body><por:CSService><arg0><![CDATA[{action_payload}]]></arg0></por:CSService></soapenv:Body>
        </soapenv:Envelope>"""

    def send_request(self, xml_payload: str) -> str:
        """ส่งข้อมูลและถอดรหัส Base64 Return ให้พร้อมใช้งาน"""
        soap_data = self._wrap_soap_envelope(xml_payload)
        headers = {'Content-Type': 'text/xml'}
        
        try:
            response = requests.post(self.endpoint_url, headers=headers, data=soap_data.encode("utf-8"))
            response.raise_for_status()
            
            # Extract CDATA and Decode Base64
            encoded_val = response.text.split("<return>")[-1].split("</return>")[0]
            decoded_xml = base64.b64decode(encoded_val).decode('utf-8')
            return decoded_xml
            
        except requests.exceptions.RequestException as e:
            print(f"❌ API Connection Error: {e}")
            return ""
