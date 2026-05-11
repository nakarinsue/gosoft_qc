
# _getbarcode_url = "https://allmember-api-ext-uat.cpall.co.th/AllMemberRequestBarcode/RequestBarcode"
# _getbarcode_type_number = {"10":"3","13":"4","12":"0"}
# _issue_api_url = "https://point-loyalty-uat.cpall.co.th/transaction/issue"
# _deduct_api_url = "https://internal-plo-api-uat-alb-915713478.ap-southeast-1.elb.amazonaws.com/transaction/deduct/v2"

# _issue_deduct_x_api_key ='6owdLRnM9TgDWtF9y4AE7svEFJ6moPDUfDMTowvM'
# _getbalance_get_url = "https://point-loyalty-uat.cpall.co.th/getbalance"
# _getbalance_Authorization= 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0aW1lU3RhbXAiOiIxNjY0MTk3MTI1OTgxIiwiY2xpZW50SWQiOiJlODVkMGM5Y2RlOGU2NWQxNzRiMjlmNmRmMmRiYWI1NCIsImNoYW5uZWxJZCI6IkNOMDkifQ.YjBUxxoPw3NMXYzvdnyU_9sTuq0z5v0VZ9lrDl8gPsY'
# _inquery_url = "http://clouds.online-allmember-staging.net/AllMemberInquiryProfile/InquiryProfile"
# app\backend\common\api_gateway.py

import requests
import json
from datetime import datetime,timezone,timedelta
from ..config import amb_config,STORE,SYSTEM,STATION,SHIFT
import random
import string



_amb_settings = amb_config()
_getbarcode_url = _amb_settings.getbarcode_url
_getbarcode_type_number = {"10":"3","13":"4","12":"0"}
_issue_api_url = _amb_settings.issue_api_url
_deduct_api_url = _amb_settings.deduct_api_url

_issue_deduct_x_api_key =_amb_settings.issue_deduct_x_api_key
_getbalance_get_url = _amb_settings.getbalance_get_url
_getbalance_Authorization= _amb_settings.getbalance_Authorization
_inquery_url = _amb_settings.inquery_url

def _get_timestamps():
    """
    รวมการสร้าง Timestamp ทุกรูปแบบไว้ในที่เดียว 
    เพื่อให้เรียกใช้งานง่ายและจัดการได้เป็นระบบ
    """
    th_tz = timezone(timedelta(hours=7))
    now = datetime.now(th_tz)
    
    standard = now.strftime("%Y/%m/%d %H:%M:%S")
    
    compact = f"{now.strftime('%Y%m%d')}"
    
    random_suffix = ''.join(random.choices(string.digits, k=12))
    file_name = f"{now.strftime('%Y%m%d')}_{random_suffix}"
    
    iso = now.strftime('%Y-%m-%dT%H:%M:%S')
    iso_string = now.strftime('%Y-%m-%dT%H:%M:%S%z')
    formatted_iso = f"{iso_string[:-2]}:{iso_string[-2:]}"
    return {
        "standard": standard,
        "compact": compact,
        "file_name": file_name,
        "iso": iso,
        "iso_stadard":formatted_iso
    }



def inquery_profile(member: str) -> dict:
    try:

        payload = json.dumps({
        "stationId": "1",
        "storeId": "09884",
        "channelId": "CN01",
        "identifyId": _getbarcode_type_number.get(str(len(member)), '0'),
        "identifyValue": member,
        "requestTime": _get_timestamps().get('standard')
        })
        headers = {
            'Content-Type': 'application/json'
        }
        print(payload)
        response = requests.post(_inquery_url, headers=headers, data=payload, timeout=10, verify=False)
        response.raise_for_status()
        print(response.json())
        return response.json()
    except Exception as e:
        return {"status": "error", "message": f"inquery profile API Error: {str(e)}"}
    



def getbarcode(member: str) -> dict: 
    try:
        payload = json.dumps({
            "sysDatetime": _get_timestamps().get('standard'),
            "identifyId": _getbarcode_type_number.get(str(len(member)), '0'),
            "identifyValue": member
        })
        
        headers = {
            'Content-Type': 'application/json',
            'Authorization': _getbalance_Authorization
        }
        response = requests.post(
            _getbarcode_url, 
            headers=headers, 
            data=payload,
            timeout=10 
        )
        response.raise_for_status()
        print(response.json())

        return response.json()
    except requests.exceptions.HTTPError as http_err:
        print(f"HTTP error occurred: {http_err}")
        return {"status": "error", "message": f"เซิร์ฟเวอร์ตอบกลับด้วยข้อผิดพลาด: {response.status_code}"}
    except Exception as err:
        print(f"Other error occurred: {err}")
        return {"status": "error", "message": "ไม่สามารถเชื่อมต่อกับ Gateway ได้"}

def plo_transaction_issue_api(member: str, reward_id: str, value: int = 1000) -> dict:
    request = inquery_profile(member)
    member = request.get('memberId','')
    if member =='':
        return {"status": "error", "message": f"No member"}
    try:
        payload = json.dumps({
            "sys_date_time": _get_timestamps().get('iso_stadard'),
            "system": SYSTEM,
            "company_id": "cpall",
            "channel_id": "CN01",
            "channel_tran_id": f"{STORE}_{STATION}_{SHIFT}_{_get_timestamps().get('file_name')}",
            "channel_sys_date": _get_timestamps().get('iso_stadard'),
            "receipt_no": ''.join(random.choices(string.digits, k=10)),
            "store_id": STORE,
            "station_id": STATION,
            "shift_id": SHIFT,
            "bus_date": _get_timestamps().get('compact'),
            "ref_tran_id": f"TEST-{_get_timestamps().get('compact')}",
            "member_id": member,
            "send_notification": "Y",
            "campaign_id": "2024025340",
            "reward_list": [{"reward_id": reward_id, "reward_qty": str(value)}],
            "remarks": f"LAB_TEST-{_get_timestamps().get('iso')}"
        })
        print(payload)
        headers = {'x-api-key': _issue_deduct_x_api_key, 'Content-Type': 'application/json'}
        response = requests.post(_issue_api_url, headers=headers, data=payload, timeout=15)
        response.raise_for_status()
        print(response.json())

        return response.json()
    except Exception as e:
        return {"status": "error", "message": f"Issue API Error: {str(e)}"}

def plo_transaction_deduct_api(member: str, reward_id: str, value: int = 1000) -> dict:
    request = inquery_profile(member)
    member = request.get('memberId','')
    if member =='':
        return {"status": "error", "message": f"No member"}
    try:
        payload = json.dumps({
            "sys_date_time": _get_timestamps().get('iso_stadard'),
            "company_id": "cpall",
            "system": "amb",
            "receipt_no": ''.join(random.choices(string.digits, k=10)),
            "member_id": member,
            "channel_id": "CN01",
            "channel_tran_id": f"{STORE}_{STATION}_{SHIFT}_{_get_timestamps().get('file_name')}",
            "channel_sys_date": _get_timestamps().get('iso_stadard'),
            "station_id": STATION,
            "shift_id": SHIFT,
            "bus_date": _get_timestamps().get('compact'),
            "store_id": STORE,
            "reward_type": "10",
            "reward_id": reward_id,
            "reward_qty": value,
            "send_notification": "Y",
            "tran_id_lock": "TEST",
            "campaign_id": "10",
            "promotion_list": []
        })
        
        headers = {'x-api-key': _issue_deduct_x_api_key, 'Content-Type': 'application/json'}
        response = requests.post(_deduct_api_url, headers=headers, data=payload, timeout=15)
        response.raise_for_status()
        print(response.json())

        return response.json()
    except Exception as e:
        return {"status": "error", "message": f"Deduct API Error: {str(e)}"}

def GetBalance(member: str) -> dict:
    request = inquery_profile(member)
    member = request.get('memberId','')
    print(member)
    if member =='':
        return {"status": "error", "message": f"No member"}
    try:
        payload = json.dumps({ 
           "sys_date_time": _get_timestamps().get('iso_stadard'),
            "company_id": "cpall",
            "system":"amb",
            "channel_id": "CN01",
            "member_id": member,
        })
        print(payload)
        headers = {'x-api-key': _issue_deduct_x_api_key, 'Content-Type': 'application/json'}

        
        response = requests.post(_getbalance_get_url, headers=headers, data=payload, timeout=10)
        response.raise_for_status()
        print(response.json())

        return response.json()
    except Exception as e:
        return {"status": "error", "message": f"Balance API Error: {str(e)}"}
    

