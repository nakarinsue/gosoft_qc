import requests
import base64
from typing import Optional
from icecream import ic

class APIRequester:
    def __init__(self, url: str, timeout: float = 10.0):
        self.url = url
        self.timeout = timeout

    def send_request(self, xml_data: str) -> Optional[str]:
        """
        ส่ง XML request และ decode response (Base64)
        
        :param xml_data: XML string ที่จะส่ง
        :return: ข้อความ decoded หรือ None หากมี error
        """
        try:
            headers = {'Content-Type': 'text/xml; charset=utf-8'}
            response = requests.post(self.url, headers=headers, data=xml_data.encode("utf-8"), timeout=self.timeout)

            # ตรวจสอบ status code
            if response.status_code != 200:
                ic(f"[ERROR] Status code: {response.status_code}")
                ic(f"[DEBUG] Response text: {response.text}")
                return None

            # แยกค่า <return>...</return>
            start_tag = "<return>"
            end_tag = "</return>"
            if start_tag in response.text and end_tag in response.text:
                raw_return = response.text.split(start_tag)[-1].split(end_tag)[0]
            else:
                ic("[ERROR] <return> tag not found in response")
                return None

            # decode Base64
            decoded_str = base64.b64decode(raw_return).decode('utf-8')
            ic("[INFO] Response decoded successfully")
            return decoded_str
        
        except requests.Timeout:
            ic("[ERROR] Request timed out")
            return None
        except requests.RequestException as e:
            ic(f"[ERROR] Request exception: {e}")
            return None
        except Exception as e:
            ic(f"[ERROR] Unknown exception: {e}")
            return None
