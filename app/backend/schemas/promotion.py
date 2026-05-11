from pydantic import BaseModel, Field, field_validator
from typing import Set, Optional, List, Union, Dict, Any
from datetime import datetime, date as date_type

class ImportInformation(BaseModel):
    version: str = Field(..., description="เลขที่ Version (sr_no)")
    system: str = Field(..., description="ชื่อระบบต้นทาง")
    user_name: int
    file_name: str
    path_file: str
    sheet: Optional[str] = None
    version_id: int = 0

class QueryRequest(BaseModel):
    item_codes: Set[str] = Field(..., example=["5100321"]) # type: ignore
    store_code: str = '08602'

    @field_validator('item_codes', mode='before')
    @classmethod
    def validate_item_codes(cls, v):
        if isinstance(v, (list, set)):
            return {str(i) for i in v}
        if isinstance(v, (str, int)):
            return {str(v)}
        return v