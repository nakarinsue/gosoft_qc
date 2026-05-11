import oracledb

class Database():
    def __init__(self, IP='10.182.236.52', service_name='ONLPRD'):
        self.IP = IP
        self.service_name = service_name
        self.user = 'CS_DEV'
        self.pwd = '1234'
        self.port = 1521

    def connect(self):
        dsn = oracledb.makedsn(self.IP, self.port, service_name=self.service_name)
        conn = oracledb.connect(user=self.user, password=self.pwd, dsn=dsn)
        cursor = conn.cursor()
        return cursor, conn

    def execute_fetch(self, query, params=None):
        cursor, conn = self.connect()
        cursor.execute(query, params or {})
        try:
            result = cursor.fetchall()
            conn.commit()
            return result
        except:
            conn.commit()
            return None

    def execute(self, query, params=None):
        cursor, conn = self.connect()
        cursor.execute(query, params or {})
        conn.commit()
        cursor.close()
        conn.close()
