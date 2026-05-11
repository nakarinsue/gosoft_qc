import requests
import xml.etree.ElementTree as ET
from typing import Optional

class CounterServiceClient:
    """บริการเชื่อมต่อและเรียกใช้งาน API"""
    
    def __init__(self, endpoint_url: str):
        self.endpoint_url = endpoint_url
        self.headers = {'Content-Type': 'application/xml'}

    def send_request(self, xml_payload: str, timeout: int = 15) -> Optional[str]:
        """ส่งคำขอไปยัง Server และคืนค่าเป็นข้อความ XML"""
        try:
            response = requests.post(
                self.endpoint_url, 
                data=xml_payload, 
                headers=self.headers, 
                timeout=timeout
            )
            response.raise_for_status()
            return response.text
        except requests.exceptions.RequestException as e:
            print(f"[Error] API Request Failed: {e}")
            return None

    def execute_exchange(self, xml_payload: str) -> dict:
        """ส่ง Request และทำหน้าที่แปลง Response XML กลับเป็น Dictionary เบื้องต้น (ถ้าต้องการ)"""
        response_xml = self.send_request(xml_payload)
        # นำ response_xml ไปประมวลผลต่อ (เช่น ผ่าน xmltodict)
        return {"raw_xml": response_xml}