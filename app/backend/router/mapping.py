from fastapi import APIRouter

router = APIRouter(prefix="/mapping", tags=["mapping data Control"])



@router.post("/promotion")
async def get_mapping_promotion():
    ...
@router.put("/promotion")
async def update_mapping_promotion():
    ...
@router.post("/product")
async def get_mapping_product():
    ...
@router.put("/product")
async def update_mapping_product():
    ...
