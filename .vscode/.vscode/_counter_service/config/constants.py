import os

class AppConfig:
    """Configuration constants for the application."""
    API_URL = "http://qacspos.counterservice.co.th:80/DCWSCDSONLINE/WSCDSService"
    # API_URL = os.getenv("API_URL", "http://testcspos.counterservice.co.th:8001/DCWSCDSONLINE/WSCDSService")
    DB_HOST_12C = os.getenv("DB_HOST_12C", "csonldbqa01.counterservice.co.th")
    DB_HOST_19C = os.getenv("DB_HOST_19C", "csonldbuat-scan.counterservice.co.th")
    DB_USER = os.getenv("DB_USER", "CS_SUPPORT")
    DB_PASS = os.getenv("DB_PASS", "1234")
    DB_PORT = os.getenv("DB_PORT", "1521")
    DB_NAME = os.getenv("DB_NAME", "ONLPRD")
    
    ACTION_EXCHANGE = "exchange"
    ACTION_REPRINT = "reprint"
    ACTION_SAVE = "save"
    ACTION_CONFIRM = "confirm"
    
    SHEET_TXN = "Transaction"
    SHEET_LOG = "Log"
    SHEET_HISTORY = "History"
    SHEET_TEMPLATE = "Template_Copy"