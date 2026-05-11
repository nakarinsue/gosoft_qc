import requests
import base64
from typing import Optional
from config.constants import AppConfig
from utils.logger import SystemLogger

class CounterServiceClient:
    """Handles external API communication and SOAP envelopment."""
    
    def __init__(self):
        """Prepares API target endpoint and standard headers."""
        self.endpoint_url = AppConfig.API_URL
        self.headers = {'Content-Type': 'text/xml'}

    def _wrap_soap_envelope(self, payload_xml: str) -> str:
        """Wraps the raw XML payload inside a standard SOAP envelope."""
        return f"""<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:por="http://portal.cs/">
        <soapenv:Header/>
        <soapenv:Body>
        <por:CSService>
        <arg0><![CDATA[{payload_xml}]]></arg0>
        </por:CSService>
        </soapenv:Body>
        </soapenv:Envelope>"""

    def send_request(self, xml_payload: str, timeout: int = 30) -> Optional[str]:
        """Executes the POST request and auto-decodes the Base64 <return> response."""
        soap_data = self._wrap_soap_envelope(xml_payload)

        try:
            response = requests.post(
                self.endpoint_url, 
                data=soap_data.encode("utf-8"), 
                headers=self.headers, 
                timeout=timeout
            )
            response.raise_for_status()
            if "<return>" in response.text:
                decode_str = response.text.split("<return>")[-1].split("</return>")[0]
                return base64.b64decode(decode_str).decode('utf-8')
            return response.text
        except Exception as e:
            SystemLogger.error_traceback(e)
            return None