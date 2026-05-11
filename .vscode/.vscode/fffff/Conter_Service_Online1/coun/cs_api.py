from flask import Flask, request, jsonify,Response
import mysql.connector
from mysql.connector import Error
from datetime import datetime
import os
import base64
app = Flask(__name__)

DB_HOST = os.getenv("DB_HOST")
DB_PORT = int(os.getenv("DB_PORT", 3306))
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_NAME = os.getenv("DB_NAME")
def connet(users=None,passwords=None):
    if users is None and passwords is None:
        users=DB_USER
        passwords=DB_PASSWORD
    try:
        return   mysql.connector.connect(
            host=DB_HOST,       # เปลี่ยนตาม config ของคุณ
            user=users,            # user ของ MySQL
            password=passwords,    # password
            database=DB_NAME)
    except :
        return None
      
def save_to_mysql(reference_1, reference_2, status, tx_id, amount):
    conn = connet()
    cursor = None
    try:
        if conn is not None :
            cursor = conn.cursor(buffered=True)

        # สร้าง table ถ้าไม่พบ
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS counter_service_log (
                id INT AUTO_INCREMENT PRIMARY KEY,
                reference_1 VARCHAR(255),
                reference_2 VARCHAR(255),
                amount DECIMAL(18,2),
                created_at DATETIME,
                update_at DATETIME,
                tx_id VARCHAR(255) UNIQUE,
                status VARCHAR(50)
            )
        """)

        # ตรวจสอบ reference
            cursor.execute(
            "SELECT id, amount, status FROM counter_service_log WHERE reference_1=%s AND reference_2=%s",
                (reference_1, reference_2)
            )
            result = cursor.fetchone()

            if result:
                record_id, existing_amount, existing_status = result
                print(record_id)
                if int(existing_amount) != int(amount):
                    return {"code":"91097202004","desc":"Not match received","success":"FALSE"}
                elif existing_status == "DataExchangeConfirm" and status == "DataExchange":
                    return {"code":"91097202002","desc":"Already paid","success":"FALSE"}
                elif reference_1.startswith("09884"):
                    return {"code":"91097202099","desc":"System Error","success":"FALSE"}
                else:
                    cursor.execute("""
                        UPDATE counter_service_log
                        SET status=%s, tx_id=%s, update_at=%s
                        WHERE id=%s
                    """, (status, tx_id, datetime.now(), record_id))
                    conn.commit()
                    return {"code":"100","desc":"SUCCESS","success":"TRUE"}

            # ถ้าไม่พบ record
            return {"code":"9NNN001","desc":"Reference code is notfound","success":"FALSE"}
        return {"code":"9NNN099","desc":"Error connecting to MySQL","success":"FALSE"}
    except Error as e:
        print("MySQL Error:", e)
        return {"code":"9NNN099","desc":str(e),"success":"FALSE"}

    finally:
        # ปิด cursor และ connection อย่างปลอดภัย
        if cursor is not None and conn is not None :
            cursor.close()
            conn.close()
def data_to_mysql(reference_1, reference_2, amount):
    try:
        conn = connet()
        if conn is not None :
            cursor = conn.cursor(buffered=True)
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS counter_service_log (
            id INT AUTO_INCREMENT PRIMARY KEY,
            reference_1 VARCHAR(255),
            reference_2 VARCHAR(255),
            amount DECIMAL(18,2),
            created_at DATETIME,
            update_at DATETIME,
            tx_id VARCHAR(255) UNIQUE,
            status VARCHAR(50))
            """)
            sql = """
                INSERT INTO counter_service_log
                (reference_1, reference_2, amount, created_at,update_at)
                VALUES (%s, %s, %s, %s, %s)
            """
            values = (reference_1, reference_2 , amount, datetime.now().strftime("%Y/%m/%d"), datetime.now())
            cursor.execute(
            "SELECT id FROM counter_service_log WHERE reference_1=%s AND reference_2=%s",
                (reference_1, reference_2)
            )
            result = cursor.fetchone()
            if not(result):
                cursor.execute(sql, values)
                conn.commit()
                return {"code":"100","desc":"success","success":"TRUE"}
            return {"code":"101020","desc":"reference match  data in base ","success":"FLASE"}
        return {"code":"102","desc":"connecting to MySQL","success":"FLASE"}
    except Error as e:
        print("Error while connecting to MySQL", e)
        return  {"code":"999","desc":str(e),"success":"FLASE"}
    finally :
        if cursor is not None and conn is not None :
            cursor.close()
            conn.close()
def data_SELECT_all(users,passwords):
    try:
        conn = connet(users,passwords)
        if conn is not None :
            cursor = conn.cursor(dictionary=True)  # คืนค่าเป็น dict แทน tuple
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS counter_service_log (
            id INT AUTO_INCREMENT PRIMARY KEY,
            reference_1 VARCHAR(255),
            reference_2 VARCHAR(255),
            amount DECIMAL(18,2),
            created_at DATETIME,
            update_at DATETIME,
            tx_id VARCHAR(255) UNIQUE,
            status VARCHAR(50)
            )
        """)
            cursor.execute("SELECT * FROM counter_service_log")
            results = cursor.fetchall()  # ดึงทุกแถว
            return results
    except Error as e:
        return {"code":"999","desc":str(9),"success":"FLASE"}
    finally :
        if cursor is not None and conn is not None :
            cursor.close()
            conn.close()
# ----------------------------
# API
# ----------------------------
@app.route("/setdata", methods=["POST"])
def setdata():
    data = request.get_json()

    response_data =data_to_mysql(
        reference_1 = data.get("reference_1"),
        reference_2 = data.get("reference_2"),
        amount = data.get("amount_received")
    )

    return jsonify(response_data)
@app.route("/getalldata", methods=["GET"])
def GETdata():
    data = request.get_json()
    return jsonify(data_SELECT_all(users=data.get("USER"),passwords=data.get("PASSWORD")))
@app.route("/api/CounterServiceExchange", methods=["POST"])
def cs_service():
    data = request.get_json()

    response_data = {
        "tx_id": data.get("tx_id"),
        "log_id": data.get("log_id"),
        "vendor_id": data.get("vendor_id"),
        "service_id": data.get("service_id"),
        "method": data.get("method"),
        "success": "TRUE",
        "code": "100",
        "desc": "SUCCESS",
        "reference_1": data.get("reference_1"),
        "reference_2": data.get("reference_2"),
        "reference_3": data.get("reference_3"),
        "reference_4": data.get("reference_4"),
        "customer_name": data.get("customer_name"),
        "customer_addr_1": data.get("customer_addr_1"),
        "customer_addr_2": data.get("customer_addr_2"),
        "customer_addr_3": data.get("customer_addr_3") or None,
        "customer_tel_no": None,
        "return1": None,
        "return2": None,
        "return3": "",
        "return4": None,
        "amount_received": data.get("amount_received"),
        "vat_amount": data.get("vat_amount")
    }
    # values = 
    # for key ,value in values.items():
    #     response_data[key] = value
    response_data.update(save_to_mysql(
        reference_1 = data.get("reference_1"),
        reference_2 = data.get("reference_2"),
        status = data.get("method"),   # หรือ status อื่น
        tx_id = data.get("tx_id"),
        amount = data.get("amount_received")
    ))
    return jsonify(response_data)

@app.route("/api/CounterServiceExchangetemp", methods=["POST"])
def cs_service_dummy():
    data = request.get_json()

    response_data = {
        "tx_id": data.get("tx_id"),
        "log_id": data.get("log_id"),
        "vendor_id": data.get("vendor_id"),
        "service_id": data.get("service_id"),
        "method": data.get("method"),
        "success": "TRUE",
        "code": "100",
        "desc": "SUCCESS",
        "reference_1": data.get("reference_1"),
        "reference_2": data.get("reference_2"),
        "reference_3": data.get("reference_3"),
        "reference_4": data.get("reference_4"),
        "customer_name": data.get("customer_name"),
        "customer_addr_1": data.get("customer_addr_1"),
        "customer_addr_2": data.get("customer_addr_2"),
        "customer_addr_3": data.get("customer_addr_3") or None,
        "customer_tel_no": None,
        "return1": None,
        "return2": None,
        "return3": "",
        "return4": None,
        "amount_received": data.get("amount_received"),
        "vat_amount": data.get("vat_amount")
    }

    return jsonify(response_data)


# XML ข้อมูลตัวอย่าง
hq_response_xml = """<?xml version="1.0" encoding="UTF-8"?>
<HQ_RESPONSE>
  <SUCCESS>true</SUCCESS>
  <CODE>100</CODE>
  <DESCRIPTOR>success</DESCRIPTOR>
  <VENDOR_ID>0994000160151|3011450642</VENDOR_ID>
  <SERV_ID>01|CS</SERV_ID>
  <TX_ID>14420298|14420299</TX_ID>
  <PRINTSLIP></PRINTSLIP>
  <VAT></VAT>
  <BILL_AMT>80|10</BILL_AMT>
  <FEE>0</FEE>
  <FEE_VAT>0</FEE_VAT>
  <DATA_1>500221016800003595|0994000160151</DATA_1>
  <DATA_2>080368141060001746|01</DATA_2>
  <DATA_3>1971850115|14420298</DATA_3>
  <DATA_4></DATA_4>
  <DATA_5></DATA_5>
  <DATA_6></DATA_6>
  <DATA_7></DATA_7>
  <CUSTOMER_NAME></CUSTOMER_NAME>
  <CUSTOMER_ADDR_1></CUSTOMER_ADDR_1>
  <CUSTOMER_ADDR_2></CUSTOMER_ADDR_2>
  <CUSTOMER_ADDR_3></CUSTOMER_ADDR_3>
  <CUSTOMER_TEL_NO></CUSTOMER_TEL_NO>
  <ACCT_NO></ACCT_NO>
  <CUSTOMER_TAX_ID></CUSTOMER_TAX_ID>
  <CUSTOMER_BRANCH_CODE></CUSTOMER_BRANCH_CODE>
  <CUSTOMER_RECEIPT_NAME></CUSTOMER_RECEIPT_NAME>
  <CUSTOMER_RECEIPT_ADDR></CUSTOMER_RECEIPT_ADDR>
</HQ_RESPONSE>"""

@app.route("/api/hq_response", methods=["POST"])
def hq_response():
    return Response(hq_response_xml, mimetype="application/xml")

@app.route("/api/soap_response", methods=["POST"])
def soap_response():
    # แปลง XML เป็น Base64
    xml_base64 = base64.b64encode(hq_response_xml.encode("utf-8")).decode("utf-8")
    soap_envelope = f"""<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <ns2:CSServiceResponse xmlns:ns2="http://portal.cs/">
      <return>{xml_base64}</return>
    </ns2:CSServiceResponse>
  </soap:Body>
</soap:Envelope>"""
    return Response(soap_envelope, mimetype="application/xml")



if __name__ == "__main__":
    app.run(host= "0.0.0.0",debug=True)
