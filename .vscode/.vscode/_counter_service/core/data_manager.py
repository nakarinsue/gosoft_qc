import random
import string
import base64
import xml.etree.ElementTree as ET
from typing import List, Dict, Any
from .data_models import TransactionData
class DataManager:
    """Processes payloads, string manipulations, and dynamic XML generations."""
    
    def __init__(self, required_data: TransactionData):
        """Merges inputs and auto-generates 10-digit random values for None types."""
        self.payload = required_data.to_dict()

    def _generate_missing_data(self, data_dict: Dict[str, Any]) -> Dict[str, Any]:
        """Scans for None values and replaces them with numeric random strings."""
        processed = {}
        for key, value in data_dict.items():
            if value is None:
                processed[key] = "".join(random.choices(string.digits, k=10))
            else:
                processed[key] = value
        return processed

    @staticmethod
    def split_by_pipe(text: str) -> List[str]:
        """Splits a string by the pipe character and strips whitespace."""
        if not isinstance(text, str):
            return []
        return [item.strip() for item in text.split("|")]

    @staticmethod
    def remove_substring_range(text: str, start_idx: int, end_idx: int) -> str:
        """Removes a designated index range from the master string."""
        if not isinstance(text, str) or start_idx < 0 or end_idx > len(text):
            return text
        return text[:start_idx] + text[end_idx:]

    @staticmethod
    def decode_base64_text(encoded_text: str) -> str:
        """Decodes standard Base64 string payload."""
        try:
            return base64.b64decode(encoded_text).decode('utf-8')
        except Exception:
            return ""

    @staticmethod
    def dict_to_xml(tag: str, d: Dict[str, Any]) -> ET.Element:
        """Recursively parses a Python Dictionary into an XML Element structure."""
        elem = ET.Element(tag)
        for key, val in d.items():
            child = ET.Element(key)
            if isinstance(val, dict):
                child = DataManager.dict_to_xml(key, val)
            else:
                child.text = str(val) if val is not None else ""
            elem.append(child)
        return elem

    @classmethod
    def generate_exchange_xml(cls, payload_data: dict) -> str:
        """Generates the full HQ_REQUEST XML dynamic structure."""
        root_dict = {
            "SERVICE_BOX": {
                "ADDRESS": {
                    "VENDOR_ID": payload_data.get("VENDOR_ID", ""),
                    "SERVICE_ID": payload_data.get("SERVICE_ID", ""),
                    "METHOD": "DataExchange"
                },
                "DATA": payload_data
            }
        }
        root_element = cls.dict_to_xml("HQ_REQUEST", root_dict)
        return ET.tostring(root_element, encoding="UTF-8", xml_declaration=True).decode("utf-8")

    def get_final_payload(self) -> dict:
        """Retrieves the processed, validation-ready payload."""
        return self.payload