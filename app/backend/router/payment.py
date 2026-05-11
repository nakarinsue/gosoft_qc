
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from ..database.common.connet_database_postgres import get_db
from ..auth.security import get_current_user
from ..common import api_gateway
from ..payment import payment_service
import httpx

router = APIRouter(prefix="/payment", tags=["Payment & Rewards"])

# Use PascalCase for classes. Added constraints using Field.
class RewardTransactionRequest(BaseModel):
    member: str
    reward_id: str
    # Removed the default 1000. Made it strictly positive.
    value: int = Field(..., gt=0, description="Amount must be greater than zero")

class PaymentRequestModel(BaseModel):
    name: str
    email: str
    accountNo: str

@router.get("/wallet")
def get_twn_payment(
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_user)
):
    return payment_service.get_barcode_wallet(db, current_user.user_id)

@router.get("/allwallet")
def get_allmember_and_twn_payment(
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_user)
):
    return payment_service.get_barcode_allwallet(db, current_user.user_id)

@router.get("/allmember/{value}")
def get_allmember_payment(
    value: str, 
    current_user = Depends(get_current_user) # Added Auth
):
    return api_gateway.getbarcode(value)

@router.get("/reward/{value}")
def show_reward(
    value: str, 
    current_user = Depends(get_current_user) # Added Auth
):  
    if len(value)!=12:
        data = api_gateway.inquery_profile(value)
        print(data)
        value = data.get('data',{'memberId':value}).get('memberId',value)
        print(value)
    return api_gateway.GetBalance(value)

@router.post("/issue/reward")
def issue_reward(
    req: RewardTransactionRequest, 
    current_user = Depends(get_current_user) # Added Auth
):
    try:
        return api_gateway.plo_transaction_issue_api(req.member, req.reward_id, req.value)
    except Exception as e:
        # Example of handling an external gateway error
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Failed to issue reward: {str(e)}"
        )

@router.post("/deduct/reward")
def deduct_reward(
    req: RewardTransactionRequest, 
    current_user = Depends(get_current_user) # Added Auth
):
    try:
        return api_gateway.plo_transaction_deduct_api(req.member, req.reward_id, req.value)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Failed to deduct reward: {str(e)}"
        )

@router.post("/truemoney")
async def process_truemoney_payment(req: PaymentRequestModel):
    """
    API Endpoint สำหรับสร้างรายการชำระเงินผ่าน TrueMoney
    """
    
    # Step 1: Generate payment token
    # (ในระบบจริง Token นี้ควรได้มาจากการเรียก API สร้าง Token ของ Gateway ก่อนหน้า)
    payment_token = "roZG9I1hk/GYjNt+BYPYbxQtKElbZDs9M5cXuEbE+Z0QTr/yUcl1oG7t0AGoOJlBhzeyBtf5mQi1UqGbjC66E85S4m63CfV/awwNbbLbkxsvfgzn0KSv7JzH3gcs/OIL"

    # Step 2 & 3: Construct transaction request
    transaction_payload = {
        "paymentToken": payment_token,
        "payment": {
            "code": {
                "channelCode": "TRUEMONEY"
            },
            "data": {
                "name": req.name,
                "email": req.email,
                "accountNo": req.accountNo
            }
        }
    }

    # URL ของ Payment Gateway (ตัวอย่างเป็นของ 2C2P Sandbox คุณต้องเปลี่ยนเป็น URL จริง)
    GATEWAY_URL = "https://sandbox-pgw.2c2p.com/payment/4.3/paymentToken" # เปลี่ยนตาม Document ของ Gateway

    # Step 4: Execute payment request
    async with httpx.AsyncClient() as client:
        try:
            # ยิง Request ไปยัง Payment Gateway
            response = await client.post(GATEWAY_URL, json=transaction_payload)
            response.raise_for_status() # เช็คว่า HTTP Status เป็น 200 OK หรือไม่
            
            result_data = response.json()
            response_code = result_data.get("responseCode")
            
            # เช็ค Response Code ตามเงื่อนไข (หมายเหตุ: Code ฝั่ง API จริงมักจะเป็นตัวเลข เช่น "1000", "0000")
            # โค้ดด้านล่างจำลอง Enum จากโค้ด JS ของคุณ
            REDIRECT_CODES = ["transactionAuthenticateRedirect", "transactionAuthenticateFullRedirect", "1000"]
            DEEPLINK_CODES = ["transactionExternalApplication", "1001"]

            if response_code in REDIRECT_CODES:
                # ส่ง URL กลับไปให้หน้าบ้านเปิด WebView
                return {
                    "status": "success",
                    "action": "open_webview",
                    "redirect_url": result_data.get("data")
                }
                
            elif response_code in DEEPLINK_CODES:
                # ส่ง Deep Link กลับไปให้หน้าบ้านเปิดแอปภายนอก (เช่น TrueMoney App)
                return {
                    "status": "success",
                    "action": "open_app",
                    "deeplink_url": result_data.get("data")
                }
                
            else:
                # กรณีอื่นๆ ถือว่า Error หรือถูกปฏิเสธ
                raise HTTPException(
                    status_code=400, 
                    detail=f"Payment failed with code: {response_code}, message: {result_data.get('responseDescription')}"
                )

        except httpx.RequestError as exc:
            # ดักจับ Error กรณี Network มีปัญหา หรือ Gateway ล่ม
            raise HTTPException(status_code=503, detail=f"Failed to connect to Payment Gateway: {str(exc)}")
            
        except Exception as e:
            # ดักจับ Error ทั่วไป
            raise HTTPException(status_code=500, detail=str(e))