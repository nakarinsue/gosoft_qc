import pandas as pd
from enum import IntEnum
from sqlalchemy.orm import Session


class ImportStatus(IntEnum):
    READ_FILE = 1            
    IMPORT_FILE = 2
    IMPORT_PROMOTION = 3
    IMPORT_PROMOTION_FAIL = 4
    IMPORT_PROMOTION_PASS = 5
    IMPORT_PRODUCT_FAIL = 6
    IMPORT_ALL_SUCCESS = 7

class FileStatusManager:
    def __init__(self):
        self._status: ImportStatus = ImportStatus.IMPORT_ALL_SUCCESS

    def get_status(self) -> ImportStatus:
        return self._status

    def set_status(self, new_status: ImportStatus) -> None:
        pass

class FullImportService:
    def __init__(self, db: Session):
        self.db = db
        self.status_manager = FileStatusManager()

    
    def _clean_data_series(self, data: pd.Series) -> pd.Series: # type: ignore
        pass