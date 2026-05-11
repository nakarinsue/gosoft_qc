from datetime import datetime
from random import randint

class TransactionData:
    def __init__(self, store_id="09892", item_name="Test", cust_name="", bill_amt="50"):
        self.store_id = store_id
        self.item_name = item_name
        self.cust_name = cust_name
        self.bill_amt = bill_amt
        self.random_id = str(randint(100000, 999999))
        self.date = datetime.now().strftime("%Y/%m/%d")
        self.time = datetime.now().strftime("%H:%M:%S")
        self.status = "Active"  # Active / Canceled

class POSService:
    def __init__(self, db):
        self.db = db

    def create_transaction(self, tx: TransactionData):
        sql = """
        INSERT INTO MY_TABLE (RANDOM_ID, STORE_ID, ITEM_NAME, CUST_NAME, BILL_AMT, DATE_TX, TIME_TX, STATUS)
        VALUES (:random_id, :store_id, :item_name, :cust_name, :bill_amt, :date_tx, :time_tx, :status)
        """
        params = {
            'random_id': tx.random_id,
            'store_id': tx.store_id,
            'item_name': tx.item_name,
            'cust_name': tx.cust_name,
            'bill_amt': tx.bill_amt,
            'date_tx': tx.date,
            'time_tx': tx.time,
            'status': tx.status
        }
        self.db.execute(sql, params)
        self.log_transaction("CREATE", tx)
        return tx.random_id

    def fetch_all_records(self, table):
        sql = f"SELECT RANDOM_ID, ITEM_NAME, CUST_NAME, BILL_AMT, STATUS FROM {table}"
        rows = self.db.execute_fetch(sql)
        return [TransactionData(store_id="09892", item_name=r[1], cust_name=r[2], bill_amt=r[3]) for r in rows]

    def fetch_record(self, table, random_id):
        sql = f"SELECT RANDOM_ID, ITEM_NAME, CUST_NAME, BILL_AMT, STATUS FROM {table} WHERE RANDOM_ID=:rid"
        rows = self.db.execute_fetch(sql, {'rid': random_id})
        if rows:
            tx = TransactionData(store_id="09892", item_name=rows[0][1], cust_name=rows[0][2], bill_amt=rows[0][3])
            tx.random_id = rows[0][0]
            tx.status = rows[0][4]
            return tx
        return None

    def cancel_record(self, random_id, table):
        sql = f"UPDATE {table} SET STATUS='Canceled' WHERE RANDOM_ID=:rid"
        self.db.execute(sql, {'rid': random_id})
        tx = self.fetch_record(table, random_id)
        self.log_transaction("CANCEL", tx)

    def update_record(self, random_id, table, new_data: TransactionData):
        sql = f"""
        UPDATE {table} SET ITEM_NAME=:item_name, CUST_NAME=:cust_name, BILL_AMT=:bill_amt
        WHERE RANDOM_ID=:rid
        """
        params = {
            'item_name': new_data.item_name,
            'cust_name': new_data.cust_name,
            'bill_amt': new_data.bill_amt,
            'rid': random_id
        }
        self.db.execute(sql, params)
        self.log_transaction("UPDATE", new_data)

    def log_transaction(self, action, tx: TransactionData):
        print(f"[{datetime.now()}] {action} | TX_ID:{tx.random_id} | Item:{tx.item_name} | Cust:{tx.cust_name} | Amt:{tx.bill_amt}")
