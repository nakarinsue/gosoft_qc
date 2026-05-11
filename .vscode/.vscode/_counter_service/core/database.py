import oracledb
from typing import Tuple, List, Dict, Any
from config.constants import AppConfig
from utils.logger import SystemLogger

class OracleDBManager:
    """Manages Oracle 12C/19C connections, TIS-620 Thai decoding, and comparisons."""
    
    def __init__(self, host: str = AppConfig.DB_HOST_12C):
        """Initializes DSN string pointing to target database environment."""
        self.host = host
        self.dsn = f"{self.host}:{AppConfig.DB_PORT}/{AppConfig.DB_NAME}"
        self.conn = None

    def __enter__(self):
        """Establishes Oracle context manager connection."""
        try:
            self.conn = oracledb.connect(user=AppConfig.DB_USER, password=AppConfig.DB_PASS, dsn=self.dsn)
            return self
        except Exception as e:
            SystemLogger.error_traceback(e)
            raise

    def __exit__(self, exc_type, exc_val, exc_tb):
        """Ensures safe resource closure post context."""
        if self.conn:
            self.conn.close()

    def execute_query(self, query: str, params: Dict|None = None) -> Tuple[List[str], List[List[Any]]]:
        """Runs SELECT query and specifically handles Thai language byte decoding."""
        if not self.conn:
            raise ConnectionError("Database not connected")
        cur = self.conn.cursor()
        try:
            cur.execute(query, params or {})
            columns = [col[0] for col in cur.description] # type: ignore
            rows = []
            for r in cur.fetchall():
                row_data = [
                    str(v).replace("\n", " ").strip().encode('latin1').decode('tis-620', errors='ignore') 
                    if v is not None else "" for v in r
                ]
                rows.append(row_data)
            return columns, rows # type: ignore
        finally:
            cur.close()

    def execute_update(self, query: str, params: Dict|None = None) -> bool:
        """Runs INSERT/UPDATE/DELETE queries and manages transaction commits."""
        if not self.conn:
            raise ConnectionError("Database not connected")
        cur = self.conn.cursor()
        try:
            cur.execute(query, params or {})
            self.conn.commit()
            return True
        except Exception as e:
            SystemLogger.error_traceback(e)
            self.conn.rollback()
            return False
        finally:
            cur.close()

    @staticmethod
    def compare_environments(query: str, params: dict|None = None) -> Dict[str, Any]:
        """Executes same query on 12C and 19C, returning mapped differences."""
        with OracleDBManager(host=AppConfig.DB_HOST_12C) as db_12c:
            cols_12c, rows_12c = db_12c.execute_query(query, params)
            data_12c = [dict(zip(cols_12c, row)) for row in rows_12c]

        with OracleDBManager(host=AppConfig.DB_HOST_19C) as db_19c:
            cols_19c, rows_19c = db_19c.execute_query(query, params)
            data_19c = [dict(zip(cols_19c, row)) for row in rows_19c]

        if set(cols_12c) != set(cols_19c):
            return {"status": "schema_mismatch", "columns_12c": cols_12c, "columns_19c": cols_19c}

        differences = []
        max_rows = max(len(data_12c), len(data_19c))

        for i in range(max_rows):
            row_12c = data_12c[i] if i < len(data_12c) else None
            row_19c = data_19c[i] if i < len(data_19c) else None

            if row_12c is None:
                differences.append({"row_index": i + 1, "status": "Missing in 12C", "data_19c": row_19c})
                continue
            if row_19c is None:
                differences.append({"row_index": i + 1, "status": "Missing in 19C", "data_12c": row_12c})
                continue

            mismatched_cols = {}
            for col in cols_12c:
                if row_12c.get(col) != row_19c.get(col):
                    mismatched_cols[col] = {"12C": row_12c.get(col), "19C": row_19c.get(col)}

            if mismatched_cols:
                ref_key = {cols_12c[0]: row_12c.get(cols_12c[0])}
                differences.append({"row_index": i + 1, "mismatched_columns": mismatched_cols, "reference": ref_key})

        return {"status": "success", "differences": differences, "total_diff": len(differences)}