import oracledb

class Databas():
    def __init__(self,IP = '10.182.236.52',service_name='ONLPRD'):
        self.IP = IP
        self.service_name = service_name
        self.host = '1521'
        self.user = 'CS_DEV'
        self.pwd = '1234'
        self.Text='0'

    def connet(self):
        dsn_tns = oracledb.makedsn(self.IP, '1521', service_name=self.service_name)  # type: ignore
        conn = oracledb.connect(user=r'CS_DEV', password='1234', dsn=dsn_tns) 
        c = conn.cursor()
        return c , conn
    
def connet_and_return(Text):
    base=Databas()
    # print(Text)
    cursor , con = base.connet()
    cursor.execute(Text)
    try:
        res = cursor.fetchall()
        con.commit()
        if len(res)==1:
            return res[-1]
        else:
            return print("ไม่พบข้อมูลใน Baseหรือ มี มากกว่า 1 ค่า ("+res+")") # type: ignore
    except:print('ทำการอัพเดทข้อมูล')
    con.commit()



class Database_oracel:
    def __init__(
        self,
        ip: str = "127.0.0.1",
        service_name: str = "ONLPRD",
        user: str = "CS_support",
        password: str = "1234",
        port: int = 1521,
    ):
        self.ip = ip
        self.service_name = service_name
        self.user = user
        self.password = password
        self.port = port

    def run(self, sql: str, fetch: bool = True):
        """
        run() จะทำหน้าที่:
        - connect
        - execute SQL
        - fetch หรือ commit
        - close connection
        """
        dsn_tns = oracledb.makedsn(self.ip, self.port, service_name=self.service_name)
        conn = oracledb.connect(user=self.user, password=self.password, dsn=dsn_tns)
        cur = conn.cursor()

        try:
            cur.execute(sql)
            if fetch:
                result = cur.fetchall()
                return result
            else:
                conn.commit()
                return True
        finally:
            cur.close()
            conn.close()

    # ---------------- Query Templates ----------------
    def client_config(self, vendor: str, service: str):
        sql = f"""
        SELECT * FROM (
            SELECT dg.VENDOR_ID, dg.SERVICE_ID, dg.SYSTEM_TYPE, dg.MIN_AMT,
                   dg.MAX_AMT, dg.OR_TIMEOUT, dg.SERVICE_CHARGE, dg.VENDOR_NAME,
                   dg.LOG_ID, df.SERVER_RUN
            FROM ONLSTD.WS_CLIENT_AUTOFIXTX df
            RIGHT JOIN ONLSTD.WS_CLIENT_CONFIG dg
                   ON df.VENDOR_ID = dg.VENDOR_ID
                  AND df.SERVICE_ID = dg.SERVICE_ID
            ORDER BY dg.EXPIRE_DATE DESC
        )
        WHERE VENDOR_ID = '{vendor}' AND SERVICE_ID = '{service}'
        """
        return self.run(sql)

    def charge_step(self, vendor: str, service: str):
        sql = f"""
        SELECT VENDOR_ID, SERVICE_ID, MIN_AMOUNT, MAX_AMOUNT,
               SERVICE_CHARGE_CENTRE, SERVICE_CHARGE_PROVINCES
        FROM ONLSTD.WS_CLIENT_CHARGE_STEP
        WHERE VENDOR_ID = '{vendor}' AND SERVICE_ID = '{service}'
        """
        return self.run(sql)

    def update_or_timeout(self, vendor: str, service: str, timeout: int):
        sql = f"""
        UPDATE ONLSTD.WS_CLIENT_CONFIG
        SET OR_TIMEOUT = '{timeout}'
        WHERE VENDOR_ID = '{vendor}'
          AND SERVICE_ID = '{service}'
          AND EFF_DATE <= CURRENT_DATE
          AND EXPIRE_DATE >= CURRENT_DATE
        """
        return self.run(sql, fetch=False)

    def online_tx(self, *txids: str):
        """
        ดึงข้อมูลจาก ONLSTD.WS_ONLINE_TX โดยรองรับ TX_ID หรือ R_SERVICE_RUNNO 
        หลายค่า (txid กี่ตัวก็ได้)

        Args:
            *txids: รายการ txid ที่ต้องการค้นหา

        Returns:
            Query result จาก self.run()
        """
        if not txids:
            return []  # ไม่มีค่าให้ค้นหา → return ค่าว่าง

        # สร้าง placeholder สำหรับ parameter binding
        placeholders = ", ".join([f":p{i}" for i in range(len(txids))])

        sql = f"""
            SELECT *
            FROM ONLSTD.WS_ONLINE_TX
            WHERE TX_ID IN ({placeholders})
            OR R_SERVICE_RUNNO IN ({placeholders})
        """

        # mapping parameter {p0: 'xxx', p1: 'yyy', ...}
        params = {f"p{i}": v for i, v in enumerate(txids)}

        return self.run(sql, params) # type: ignore


# ---------------- Example Usage ----------------
if __name__ == "__main__":
    db = Database_oracel(user="CS_DEV", password="1234")

    # SELECT ตัวอย่าง
    rows = db.client_config("0994000160151", "01")
    print("client_config:", rows)

    # UPDATE ตัวอย่าง
    ok = db.update_or_timeout("0994000160151", "01", 120)
    print("update_or_timeout:", ok)

    # SELECT อีกอัน
    logs = db.online_tx("12345", "67890")
    print("online_tx:", logs)
