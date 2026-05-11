# app\backend\payment\payment_router.py
from fastapi import APIRouter,Depends
from ..database.common.connet_database_postgres import get_db
from pydantic import BaseModel
from sqlalchemy.orm import Session
from ..common import api_gateway

from ..auth.security import get_current_user
from . import payment_service


router = APIRouter(prefix="/payment", tags=["payment all"])
class member_acc(BaseModel):
    member: str
    reward_id: str
    value: int = 1000

@router.get("/wallet")
def twn_payment( db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    return payment_service.get_barcode_wallet(db,current_user.user_id)

@router.get("/allwallet")
def allmember_and_twn_payment( db: Session = Depends(get_db), current_user = Depends(get_current_user)):
     return payment_service.get_barcode_allwallet(db,current_user.user_id)


@router.get("/allmember/{value}")
def allmember_payment(value:str):
    return api_gateway.getbarcode(value)


@router.get("/reward/{value}")
def show_reward(value:str):
    # reward = api_gateway.GetBalance(value)
    # reward['']['']
    return api_gateway.GetBalance(value)

@router.post("/issue/reward")
def issue_reward(req:member_acc):
    return api_gateway.plo_transaction_issue_api(req.member,req.reward_id,req.value)

@router.post("/deduct/reward")
def deduct_reward(req:member_acc):
    return api_gateway.plo_transaction_deduct_api(req.member,req.reward_id,req.value)



