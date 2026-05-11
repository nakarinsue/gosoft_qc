import os
from typing import List, Dict, Any

# แนะนำให้ใช้ Environment Variables สำหรับข้อมูลสำคัญ
DB_USER = os.getenv("DB_USER", "CS_SUPPORT")
DB_PASSWORD = os.getenv("DB_PASSWORD", "1234")
DB_HOST_12C = os.getenv("DB_HOST", "csonldbqa01.counterservice.co.th")
DB_HOST_19C = os.getenv("DB_HOST", "csonldbuat-scan.counterservice.co.th")
DB_PORT = os.getenv("DB_PORT", "1521")
DB_NAME = os.getenv("DB_NAME", "ONLPRD")


ALL_TABEL_MAPPING: List[Dict[str, Any]] = [
    {
        "SCHEMA": "ONLSTD",
        "TABEL": "WS_CLIENT_CONFIG",
        "COLUMN": [
            'VENDOR_CODE', 'VENDOR_ID', 'SERVICE_ID', 'LOG_ID', 'SYSTEM_TYPE',
            'MIN_AMT', 'MAX_AMT', 'OR_TIMEOUT', 'TX_TABLE', 'LOG_TABLE',
            'VENDOR_NAME', 'SHORT_VENDOR_NAME', 'EFF_DATE', 'EXPIRE_DATE',
            'CHK_AMT_BEFORE', 'CHK_AMT_AFTER', 'FULL_FORM_TYPE', 'USERID',
            'PASSWD', 'SERVICE_CHARGE', 'SRV_OPEN_TIME', 'SRV_CLOSE_TIME',
            'PARTIAL_AMT', 'CHK_RETURN_TX', 'CHK_PRINT_SLIP', 'DISCOUNT_CHARGE',
            'CHK_REF_MATCH', 'SWITCH_OFFLINE', 'CHK_DUP_AFTER', 'CHK_SPECIAL_REF',
            'CHK_RETURN_SERVICE', 'CHK_PRODUCT_REF', 'CHK_COUPON'
        ],
        "RULE_MAP": {
            "VENDOR_CODE": {"RESULT": "VENDOR_CODE", "STATUS": "A"},
            "VENDOR_ID": {"RESULT": "VENDOR_ID", "STATUS": "A"},
            "SERVICE_ID": {"RESULT": "SERVICE_ID", "STATUS": "A"}
        }
    },
    {
        "SCHEMA": "ONLSTD",
        "TABEL": "WS_CLIENT_CHARGE",
        "RULE_MAP": {
            "VENDOR_CODE": {"RESULT": "VENDOR_CODE", "STATUS": "S"},
            "VENDOR_ID": {"RESULT": "VENDOR_ID", "STATUS": "A"},
            "SERVICE_ID": {"RESULT": "SERVICE_ID", "STATUS": "A"}
        }
    },
    {
        "SCHEMA": "ONLSTD",
        "TABEL": "WS_CLIENT_CHARGE_STEP",
        "RULE_MAP": {
            "VENDOR_CODE": {"RESULT": "VENDOR_CODE", "STATUS": "S"},
            "VENDOR_ID": {"RESULT": "VENDOR_ID", "STATUS": "A"},
            "SERVICE_ID": {"RESULT": "SERVICE_ID", "STATUS": "A"}
        }
    },
    {
        "SCHEMA": "ONLSTD",
        "TABEL": "WS_CLIENT_AUTOFIXTX",
        "RULE_MAP": {
            "VENDOR_CODE": {"RESULT": "VENDOR_CODE", "STATUS": "S"},
            "VENDOR_ID": {"RESULT": "VENDOR_ID", "STATUS": "A"},
            "SERVICE_ID": {"RESULT": "SERVICE_ID", "STATUS": "A"}
        }
    },
    {
        "SCHEMA": "ONLSTD",
        "TABEL": "WS_CLIENT_AUTOFIXTX_CANCEL",
        "RULE_MAP": {
            "VENDOR_CODE": {"RESULT": "VENDOR_CODE", "STATUS": "S"},
            "VENDOR_ID": {"RESULT": "VENDOR_ID", "STATUS": "A"},
            "SERVICE_ID": {"RESULT": "SERVICE_ID", "STATUS": "A"}
        }
    },
    {
        "SCHEMA": "ONLSTD",
        "TABEL": "WS_SERVICE_LOOKUP",
        "RULE_MAP": {
            "VENDOR_CODE": {"RESULT": "VENDOR_CODE", "STATUS": "S"},
            "VENDOR_ID": {"RESULT": "VENDOR_ID", "STATUS": "A"},
            "SERVICE_ID": {"RESULT": "SERV_ID", "STATUS": "A"}
        }
    },
    {
        "SCHEMA": "ONLSTD",
        "TABEL": "WS_STD_SERVICE_LOOKUP",
        "RULE_MAP": {
            "VENDOR_CODE": {"RESULT": "VENDOR_CODE", "STATUS": "S"},
            "VENDOR_ID": {"RESULT": "VENDOR_ID", "STATUS": "A"},
            "SERVICE_ID": {"RESULT": "SERV_ID", "STATUS": "A"}
        }
    },
    {
        "SCHEMA": "ONLSTD",
        "TABEL": "WS_STD_SERVICE_LOOKUP_LIBERTY",
        "RULE_MAP": {
            "VENDOR_CODE": {"RESULT": "VENDOR_CODE", "STATUS": "S"},
            "VENDOR_ID": {"RESULT": "VENDOR_ID", "STATUS": "A"},
            "SERVICE_ID": {"RESULT": "SERV_ID", "STATUS": "A"}
        }
    },
    {
        "SCHEMA": "ONLSTD",
        "TABEL": "MST_MAPPING_ERROR_CODE",
        "RULE_MAP": {
            "VENDOR_CODE": {"RESULT": "CLIENT_CODE", "STATUS": "S"},
            "VENDOR_ID": {"RESULT": "VENDOR_ID", "STATUS": "A"},
            "SERVICE_ID": {"RESULT": "SERVICE_ID", "STATUS": "A"}
        }
    },
    {
        "SCHEMA": "ONLSTD",
        "TABEL": "WS_STD_ERROR_CODE",
        "RULE_MAP": {
            "VENDOR_CODE": {"RESULT": "CLIENT_CODE", "STATUS": "A"},
            "VENDOR_ID": {"RESULT": "VENDOR_ID", "STATUS": "S"},
            "SERVICE_ID": {"RESULT": "SERVICE_ID", "STATUS": "S"}
        }
    },
    {
        "SCHEMA": "ONLSTD",
        "TABEL": "WS_CLIENT_REPRINT",
        "RULE_MAP": {
            "VENDOR_CODE": {"RESULT": "VENDOR_CODE", "STATUS": "S"},
            "VENDOR_ID": {"RESULT": "VENDOR_ID", "STATUS": "A"},
            "SERVICE_ID": {"RESULT": "SERVICE_ID", "STATUS": "A"}
        }
    },
    {
        "SCHEMA": "ONLSTD",
        "TABEL": "WS_CLIENT_REF",
        "RULE_MAP": {
            "VENDOR_CODE": {"RESULT": "VENDOR_CODE", "STATUS": "S"},
            "VENDOR_ID": {"RESULT": "VENDOR_ID", "STATUS": "A"},
            "SERVICE_ID": {"RESULT": "SERVICE_ID", "STATUS": "A"}
        }
    },
    {
        "SCHEMA": "ONLSTD",
        "TABEL": "WS_CLIENT_REF_LIBERTY",
        "RULE_MAP": {
            "VENDOR_CODE": {"RESULT": "VENDOR_CODE", "STATUS": "S"},
            "VENDOR_ID": {"RESULT": "VENDOR_ID", "STATUS": "A"},
            "SERVICE_ID": {"RESULT": "SERVICE_ID", "STATUS": "A"}
        }
    },
    {
        "SCHEMA": "ONLSTD",
        "TABEL": "WS_CLIENT_RETURN",
        "RULE_MAP": {
            "VENDOR_CODE": {"RESULT": "VENDOR_CODE", "STATUS": "S"},
            "VENDOR_ID": {"RESULT": "VENDOR_ID", "STATUS": "A"},
            "SERVICE_ID": {"RESULT": "SERVICE_ID", "STATUS": "A"}
        }
    },
    {
        "SCHEMA": "ONLSTD",
        "TABEL": "WS_CLIENT_LEN_EXTEN",
        "RULE_MAP": {
            "VENDOR_CODE": {"RESULT": "VENDOR_CODE", "STATUS": "S"},
            "VENDOR_ID": {"RESULT": "VENDOR_ID", "STATUS": "A"},
            "SERVICE_ID": {"RESULT": "SERVICE_ID", "STATUS": "A"}
        }
    },
    {
        "SCHEMA": "ONLSTD",
        "TABEL": "WS_CLIENT_PREFIX",
        "RULE_MAP": {
            "VENDOR_CODE": {"RESULT": "VENDOR_CODE", "STATUS": "S"},
            "VENDOR_ID": {"RESULT": "VENDOR_ID", "STATUS": "A"},
            "SERVICE_ID": {"RESULT": "SERVICE_ID", "STATUS": "A"}
        }
    },
    {
        "SCHEMA": "ONLSTD",
        "TABEL": "WS_CLIENT_GRP",
        "RULE_MAP": {
            "VENDOR_CODE": {"RESULT": "VENDOR_CODE", "STATUS": "S"},
            "VENDOR_ID": {"RESULT": "VENDOR_ID", "STATUS": "A"},
            "SERVICE_ID": {"RESULT": "SERVICE_ID", "STATUS": "A"}
        }
    },
    {
        "SCHEMA": "ONLSTD",
        "TABEL": "WS_CLIENT_GRP_LIBERTY ",
        "RULE_MAP": {
            "VENDOR_CODE": {"RESULT": "VENDOR_CODE", "STATUS": "S"},
            "VENDOR_ID": {"RESULT": "VENDOR_ID", "STATUS": "A"},
            "SERVICE_ID": {"RESULT": "SERVICE_ID", "STATUS": "A"}
        }
    },
    {
        "SCHEMA": "ONLSTD",
        "TABEL": "WS_ONLINE_TX",
        "RULE_MAP": {
            "VENDOR_CODE": {"RESULT": "CLIENT_CODE", "STATUS": "A"},
            "VENDOR_ID": {"RESULT": "VENDOR_ID", "STATUS": "S"},
            "SERVICE_ID": {"RESULT": "SERVICE_CODE", "STATUS": "A"}
        }
    },
    {
        "SCHEMA": "ONLSTD",
        "TABEL": "WS_ONLINE_LOG",
        "RULE_MAP": {
            "VENDOR_CODE": {"RESULT": "CLIENT_CODE", "STATUS": "A"},
            "VENDOR_ID": {"RESULT": "VENDOR_ID", "STATUS": "S"},
            "SERVICE_ID": {"RESULT": "SERVICE_CODE", "STATUS": "A"}
        }
    },
    
]

