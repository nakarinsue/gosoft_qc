import xml.etree.ElementTree as ET
from typing import Dict, Any

class XMLGenerator:
    """คลาสสำหรับแปลงโครงสร้าง Dictionary ให้กลายเป็น XML Request แบบ Dynamic"""
    
    @staticmethod
    def dict_to_xml(tag: str, d: Dict[str, Any]) -> ET.Element:
        """ฟังก์ชัน Recursive ในการสร้าง XML Node จาก Dict"""
        elem = ET.Element(tag)
        for key, val in d.items():
            child = ET.Element(key)
            if isinstance(val, dict):
                child = XMLGenerator.dict_to_xml(key, val)
            else:
                child.text = str(val) if val is not None else ""
            elem.append(child)
        return elem

    @classmethod
    def generate_exchange_xml(cls, payload_data: dict) -> str:
        """สร้าง Payload สำหรับ DataExchange"""
        # โครงสร้างเบื้องต้น ที่สามารถเพิ่ม/ลด Key ได้ตามต้องการ
        root_dict = {
            "SERVICE_BOX": {
                "ADDRESS": {
                    "VENDOR_ID": payload_data.get("VENDOR_ID", ""),
                    "SERVICE_ID": payload_data.get("SERVICE_ID", ""),
                    "METHOD": "DataExchange"
                },
                "DATA": payload_data  # โยนข้อมูลทั้งหมดเข้าไปใน Tag DATA
            }
        }
        
        root_element = cls.dict_to_xml("HQ_REQUEST", root_dict)
        xml_str = ET.tostring(root_element, encoding="UTF-8", xml_declaration=True)
        return xml_str.decode("utf-8")