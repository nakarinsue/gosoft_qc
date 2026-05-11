from typing import List, Dict, Any
from utils.logger import SystemLogger
from config.constants import AppConfig
from core.api_client import CounterServiceClient
from core.data_manager import DataManager
from icecream import ic
import xml.etree.ElementTree as ET

def _element_to_dict(element: ET.Element) -> Dict[str, Any]:
    """ฟังก์ชันย่อยแบบ Recursive แปลง ElementTree เป็น Dict"""
    result = {}
    for child in element:
        # เรียกใช้ตัวเองซ้ำเพื่อเจาะลึกเข้าไปใน child elements
        child_result = _element_to_dict(child)
        # ถ้าไม่มี child ซ้อนอยู่เลย ให้ดึงค่า text มาใช้
        value = child_result if child_result else child.text
        
        # จัดการกรณีที่มี Tag ซ้ำกัน (เช่น มี <item> หลายอัน) ให้เก็บเป็น List
        if child.tag in result:
            if isinstance(result[child.tag], list):
                result[child.tag].append(value)
            else:
                result[child.tag] = [result[child.tag], value]
        else:
            result[child.tag] = value
            
    return result

def parse_xml_to_dict(xml_str: str) -> Dict[str, Any]:
    """
    ฟังก์ชันหลักสำหรับแปลง XML String เป็น Dictionary
    """
    try:
        root = ET.fromstring(xml_str.strip())
        return {root.tag: _element_to_dict(root)}
    except ET.ParseError as e:
        # โยน Error หรือ Return Dict ว่าง ตาม Flow ที่องค์กรออกแบบไว้
        print(f"เกิดข้อผิดพลาดในการ Parsing XML: {e}")
        return {}
class RequestFlowManager:
    """Manages automation list flows and method chaining state continuity."""
    log_action = [{}]
    log ={}
    
    def __init__(self, api_client: CounterServiceClient):
        """Initializes state memory and registers the API Client interface."""
        self.api = api_client
        self.saved_state: Dict[str, Any] = {}
        self.current_data: Any = None

    def _execute_step(self, action_name: str, payload_dict: Dict[str, Any]) -> Any:
        """Private function to wrap data into XML, send it, and return context."""
        SystemLogger.show(f"Executing Chain Action: {action_name}")
        xml_payload = DataManager.generate_exchange_xml(payload_dict)
        response_xml = self.api.send_request(xml_payload)
        self.log_action.append({"action": action_name, "response": {"dict":parse_xml_to_dict(response_xml),"xml":response_xml}, "request": {"dict":payload_dict,"xml":str(xml_payload)}}) # type: ignore
        return {"action": action_name, "raw_response": response_xml, "sent_payload": payload_dict}

    def exchange(self, payload: Dict[str, Any]) -> 'RequestFlowManager':
        """Executes exchange API and returns Self for chaining."""
        self.current_data = self._execute_step(AppConfig.ACTION_EXCHANGE, payload)
        return self

    def reprint(self) -> 'RequestFlowManager':
        """Executes reprint API reusing the immediate previous payload."""
        payload = self.current_data.get("sent_payload", {})
        self.current_data = self._execute_step(AppConfig.ACTION_REPRINT, payload)
        return self

    def save(self) -> 'RequestFlowManager':
        """Locally caches the current payload for upcoming confirm actions."""
        SystemLogger.show(f"Executing State Cache: {AppConfig.ACTION_SAVE}")
        self.saved_state = self.current_data.get("sent_payload", {})
        return self

    def confirm(self) -> 'RequestFlowManager':
        """Executes confirm API utilizing the previously cached payload."""
        self.current_data = self._execute_step(AppConfig.ACTION_CONFIRM, self.saved_state)
        return self

    def run_pipeline(self, actions: List[str], initial_payload: Dict[str, Any]) -> Any:
        """Loops through a specified string array of actions for automation."""
        current_payload = initial_payload
        for action in actions:
            if action == AppConfig.ACTION_EXCHANGE:
                self.exchange(current_payload)
                current_payload = self.current_data.get("sent_payload", {})
            elif action == AppConfig.ACTION_REPRINT:
                self.reprint()
                current_payload = self.current_data.get("sent_payload", {})
            elif action == AppConfig.ACTION_SAVE:
                self.save()
            elif action == AppConfig.ACTION_CONFIRM:
                self.confirm()
                current_payload = self.current_data.get("sent_payload", {})
        return self.current_data
    def log_history(self):
        return self.log_action