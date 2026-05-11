

import json
import io
import openpyxl
import pandas as pd
import requests
import boto3
from datetime import datetime
from typing import Dict, List, Union
from urllib.parse import urlparse
from botocore.config import Config
from minio import Minio
from enum import IntEnum
from app.backend.database.models.postgres_models import MFileMaster, MPromotionHeader, MPromotionBucketEntity
from app.backend.config import settings as config
from app.backend.schemas.inventory import entity_id
class ImportStatus(IntEnum):
    READ_FILE = 1            
    IMPORT_FILE = 2
    IMPORT_PROMOTION = 3
    IMPORT_PROMOTION_FAIL = 4
    IMPORT_PROMOTION_PASS = 5
    IMPORT_PRODUCT_FAIL = 6
    IMPORT_ALL_SUCCESS = 7
class FileStatusManager:
    """
    คลาสสำหรับจัดการสถานะการทำงานของการ Import ไฟล์และโปรโมชั่น
    โดยจะเก็บสถานะที่ต่ำที่สุด (Error ที่รุนแรงที่สุด) ไว้เสมอระหว่างการทำงาน
    """
    def __init__(self):
        self._status: ImportStatus = ImportStatus.IMPORT_ALL_SUCCESS

    def get_status(self) -> ImportStatus:
        """ดึงค่าสถานะปัจจุบัน"""
        return self._status

    def set_status(self, new_status: ImportStatus) -> None:
        """
        อัปเดตสถานะใหม่ โดยมีเงื่อนไขว่า:
        จะอัปเดตก็ต่อเมื่อสถานะใหม่มีค่าน้อยกว่าสถานะปัจจุบันเท่านั้น 
        (เพื่อป้องกันสถานะ Error ถูกทับด้วยสถานะ Success)
        """
        if self._status.value > new_status.value:
            self._status = new_status

    def reset_status(self) -> None:
        """รีเซ็ตสถานะกลับไปเป็นค่าเริ่มต้น (7) สำหรับเริ่มรอบการทำงานใหม่"""
        self._status = ImportStatus.IMPORT_ALL_SUCCESS

class FullImportService:
    _URL = "https://sdl-master-api-uat.cpall.co.th/api/products/internal"
    _KEY= '4K2kmEfGTYZHVXFNqdKTAX3MES5NYvWV'
    

    def __init__(self, db): # db: Session
        self.db = db
        self.minio_client = Minio(
            config.MINIO_ENDPOINT,
            access_key=config.MINIO_ROOT_USER,
            secret_key=config.MINIO_ROOT_PASSWORD,
            secure=config.MINIO_SECURE
        )
        self.bucket_name = "file-promotion"
        self.batch_size = 500

    @staticmethod
    def _get_file_stream(file_path: str) -> Union[str, io.BytesIO]:
        """ฟังก์ชันดึงข้อมูลไฟล์รองรับ Local และ MinIO"""
        if file_path.startswith("s3://"):
            parsed_url = urlparse(file_path)
            bucket_name = parsed_url.netloc
            object_key = parsed_url.path.lstrip('/')
            
            s3 = boto3.client('s3', 
                              endpoint_url=f"http://{config.MINIO_ENDPOINT}", 
                              aws_access_key_id=config.MINIO_ROOT_USER, 
                              aws_secret_access_key=config.MINIO_ROOT_PASSWORD,
                              config=Config(signature_version='s3v4'))
                              
            obj = s3.get_object(Bucket=bucket_name, Key=object_key)
            file_stream = io.BytesIO(obj['Body'].read())
            file_stream.seek(0)
            return file_stream
        
        return file_path

    @staticmethod
    def get_sheet_visibility(file_path: str) -> Dict[str, List[str]]:
        file_stream = FullImportService._get_file_stream(file_path)
        wb = openpyxl.load_workbook(file_stream, data_only=True)
        
        visible_sheets = []
        hidden_sheets = []
        
        for sheet in wb.worksheets:
            if sheet.sheet_state == 'visible':
                visible_sheets.append(sheet.title)
            else:
                hidden_sheets.append(sheet.title)
                
        wb.close()
        return {"visible": visible_sheets, "hidden": hidden_sheets}
    
    @staticmethod
    def read_only_visible_sheets(file_path: str) -> Dict[str, pd.DataFrame]:
        sheet_info = FullImportService.get_sheet_visibility(file_path)
        visible_sheet_names = sheet_info["visible"]
        file_stream = FullImportService._get_file_stream(file_path)
        data_frames = pd.read_excel(file_stream, sheet_name=visible_sheet_names)
        return data_frames
    def _product(self, product) -> Dict[str, str]: # product: entity_id
        if not product.product:
            return {}

        payload = json.dumps({
            "storeId": product.storeId,
            "productCode": list(product.product),
            "checkInventory": True,
            "checkPeriodTime": True,
            "ContentLanguage": "th"
        })
        headers = {
            'x-api-key': self._KEY,
            'device_type': '3',
            'api-version': '7',
            'Content-Type': 'application/json'
        }

        try:
            response = requests.request("POST", self._URL, headers=headers, data=payload)
            return FullImportService._map_response_to_barcode_dict(response.text)
        except Exception as e:
            print(f"Error calling product API: {e}")
            return {}
    @staticmethod
    def _map_response_to_barcode_dict(json_payload: str) -> Dict[str, str]:
        """
        Parse JSON string and map ALL products directly to a Dictionary for O(1) retrieval.
        """
        barcode_map = {}
        try:
            data = json.loads(json_payload)
            if data.get("returnCode") == "0000" and data.get("result"):
                # วนลูปเก็บข้อมูลทุกชิ้นที่ API ส่งกลับมา
                for item in data["result"]:
                    p_code = item.get("product_code", "")
                    b_code = item.get("product_barcode", "")
                    if p_code and b_code:
                        barcode_map[p_code] = b_code
        except json.JSONDecodeError:
            print("Error: Invalid JSON format")
        except Exception as e:
            print(f"Error mapping data: {e}")
            
        return barcode_map
    
    def run_process(self, file_content: bytes, filename: str, version: int|str, user_id: int, system : str = "",**kwargs):
        """Main Flow การทำงาน"""
        try:
            # --- STEP 1: Upload to MinIO ---
            if not self.minio_client.bucket_exists(self.bucket_name):
                self.minio_client.make_bucket(self.bucket_name)
            
            timestamp_folder = datetime.now().strftime("%Y%m%d/%H")
            object_name = f"{timestamp_folder}/{filename}"
            
            self.minio_client.put_object(
                self.bucket_name, object_name, io.BytesIO(file_content), len(file_content),
                content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            )
            s3_path = f"s3://{self.bucket_name}/{object_name}"

            # --- STEP 2: Read Excel ---
            storage_options = {
                "key": config.MINIO_ROOT_USER,
                "secret": config.MINIO_ROOT_PASSWORD,
                "client_kwargs": {"endpoint_url": f"http://{config.MINIO_ENDPOINT}"}
            }
            sheet_info = FullImportService.get_sheet_visibility(s3_path)
            visible_sheet_names: List[str|None] = sheet_info["visible"] # type: ignore
            excel_data = pd.read_excel(s3_path, storage_options=storage_options, sheet_name=None, dtype=str)

            # --- STEP 3: Process Sheets ---
            processed_sheets = []
            for sheet_name, df in excel_data.items():
                self._process_sheet(df, 
                                    sheet_name, 
                                    filename, 
                                    int(version), 
                                    user_id, 
                                    visible_sheet_names)
                processed_sheets.append(sheet_name)

            return {
                "status": "Success",
                "message": "Imported and processed completely",
                "minio_path": s3_path,
                "processed_sheets": processed_sheets
            }

        except Exception as e:
            self.db.rollback()
            print(f"❌ Process Failed: {e}")
            raise e

    # ==========================================
    # --- Logic Process Methods ---
    # ==========================================
    def _check_error_show_description(self, remark: str = "", df: pd.DataFrame = pd.DataFrame(), sheet_name: str | None = None, sheet_hide: List[str | None] = []) -> str:
        if "promotion_code" not in df.columns:
            remark += "sheet No Column promotion_code,"
        elif sheet_name and sheet_name not in sheet_hide:
            remark += "Hidden sheet,"            
        return remark
    
    def _process_sheet(self, df: pd.DataFrame, 
                       sheet_name: str, 
                       filename: str, 
                       version: int,
                       user_id: int, 
                       sheet_hide: List[str|None] = [None]):
        total_rows = df.shape[0]
        total_cols = df.shape[1]
        success_item_count = 0
        status = FileStatusManager()
        # สมมติว่า entity_id ถูก import มาแล้ว
        product_code = entity_id(storeId='11104', product=set()) 
        error_item_count = 0
        
        # 1. Standardize Column Names
        df.columns = (
            df.columns.astype(str)
            .str.strip()
            .str.lower()
            .str.replace(r'[^\w\s]', '', regex=True)
            .str.replace(r'\s+', '_', regex=True)
        )
        print( df.columns)
        df = df.astype(str)
        for col in df.columns:
            df[col] = self._clean_data_series(df[col])
        print( df.columns)

        remark = self._check_error_show_description(df=df, 
                                                    sheet_name=sheet_name, 
                                                    sheet_hide=sheet_hide)
        status.set_status(ImportStatus.IMPORT_PRODUCT_FAIL)
        file_master = MFileMaster(
            v_id=version,  file_name=filename, sheet=sheet_name, status=status.get_status().value, 
            r_row=total_rows, w_row=0, e_row=0, user_mk="", description=f"{remark}",
            date_create=datetime.now(), user_create=user_id, date_update=datetime.now(), user_update=user_id
        )
        self.db.add(file_master)
        self.db.commit()
        file_master_id = file_master.id
        data_entity:List =[]
        if "promotion_code" not in df.columns or sheet_name not in sheet_hide:
            return

        unique_promos = df['promotion_code'].unique()
        for ind, p_code in enumerate(unique_promos):
            if not p_code: continue

            status.set_status(ImportStatus.IMPORT_PROMOTION_PASS) # type: ignore
            promo_df = df[df['promotion_code'] == p_code]
            if promo_df.empty: continue
            
            first_row = promo_df.to_dict('records')[0]
            first_row['index'] = ind + 1

            try:
                
                with self.db.begin_nested():
                    header = self._create_promotion_header(first_row, file_master_id, user_id)
                    self.db.add(header)
                    self.db.flush()
                    header_id = header.id
                status.set_status(ImportStatus.IMPORT_PROMOTION_FAIL) # type: ignore
                promo_list = promo_df.to_dict('records')
                for item_row in promo_list:
                    try:
                        with self.db.begin_nested():
                            bucket = self._create_promotion_item(item_row, header_id, user_id)
                            self.db.add(bucket)
                            self.db.flush()
                            bucket_code = bucket.entity_code
                            data_entity.append(bucket_code)
                            product_code.product.add(bucket_code)
                        success_item_count += 1
                    except Exception as e:
                        status.set_status(ImportStatus.IMPORT_FILE)                         # type: ignore
                        error_item_count += 1
                        remark = f"Error : insert product code fail ( {p_code}) -> {error_item_count} row: {e}"
                        print(remark)

                self.db.commit() 
            
            except Exception as e:
                self.db.rollback()
                remark = f"Error : insert promotion code fail ( {p_code}) -> {error_item_count} row: {e}"
                print(remark)
        try:
            target_pro_ids:List[str] = [i for i in set(data_entity)] # <--- ปรับเปลี่ยนให้ตรงกับตัวแปรจริงใน API ของคุณ
            from app.backend.promotion.promotion_updater_service import PromotionUpdaterService
            PG_ENGINE = self.db.get_bind() # ดึง Engine มาจาก Session `self.db` ของ FastAPI/SQLAlchemy ที่มีอยู่แล้ว
            SSMS_CONN_STR = (
                    "DRIVER={ODBC Driver 17 for SQL Server};"
                    "SERVER=117.113.122.109;"
                    "DATABASE=POSG2;"
                    "UID=sa;"
                    "PWD=Admin2000"
                )
            # 4. สร้าง Instance และเรียกใช้งาน
            updater_service = PromotionUpdaterService(
                pg_engine=PG_ENGINE, 
                ssms_conn_string=SSMS_CONN_STR
            )
            
            # 5. สั่งรันอัปเดต (ระบบจะจัดการ Chunking, Fallback, และ Commit/Rollback ให้เองตามที่เขียนไว้)
            updater_service.update_promotion_data(target_pro_ids=target_pro_ids)
            
            # หากต้องการให้ Log ในระดับ API ทราบด้วย สามารถ Print หรือใช้ Logger ของ API ได้
            print(f"Successfully triggered barcode mapping via PromotionUpdaterService for pro_ids: {target_pro_ids}")

        except Exception as e:
            # ไม่ต้อง self.db.rollback() แล้ว เพราะ Service จัดการ Rollback ตัวเองเรียบร้อย
            print(f"Error in Finalize Status (PromotionUpdaterService): {e}")
            # หากจำเป็น สามารถ raise Exception กลับไปให้ Global Exception Handler ของ API จัดการต่อได้
            # raise e        
        try:
            fm_update = self.db.query(MFileMaster).filter(MFileMaster.id == file_master_id).first()
            if fm_update:
                fm_update.w_row = success_item_count
                fm_update.e_row = error_item_count
                fm_update.description = remark
                fm_update.status = status.get_status()
                self.db.commit()
        except Exception as e:
            self.db.rollback()


    def _create_promotion_header(self, row: dict, file_id: int, user_id: int):
        """สร้าง Object สำหรับ MPromotionHeader"""
        p_code_raw = row.get('promotion_code', '0')
        print(row.values())
        return MPromotionHeader(
            file_id=file_id,
            pro_code=int(float(p_code_raw)) if p_code_raw and p_code_raw.strip() != '' else 0,
            pro_name=str(row.get('promotion_name', ''))[:100],
            pro_receipt_name=str(row.get('receipt_promotion_name', ''))[:100],
            pro_type=str(row.get('promotion_type', ''))[:30],
            pro_group=str(row.get('group_name', ''))[:50],
            pro_status=str(row.get('promotion_status', '1'))[:30],
            pro_level=self._safe_int(row.get('levelid', 1)),
            start_date=self._parse_date(row.get('active_from')),
            end_date=self._parse_date(row.get('active_to')),
            update_date=self._parse_date(row.get('updated_date')),
            rec_date=datetime.now().date(),
            reward_value=str(row.get('reward_value', ''))[:50],
            reward_type=str(row.get('reward_type', ''))[:100],
            reward_ma=str(row.get('reward_ma_id', ''))[:50],
            reward_name=str(row.get('reward_ma_name', ''))[:100],
            limit_tran=self._safe_int(row.get('redemption_limit_per_transaction')),
            limit_day=self._safe_int(row.get('redemption_limit_per_day')),
            limit_item=self._safe_int(row.get('limit_number_of_items_to')),
            limit_redemp=self._safe_int(row.get('maximum_redemption_limit')),
            member_tier=str(row.get('member_segments_tiers', ''))[:100],
            member_segm=str(row.get('member_segmentation', ''))[:100],
            member_requ=str(row.get('all_members_card_required', ''))[:100],
            notes=str(row.get('notes', '')),
            indexs=self._safe_int(row.get('index', 0)),
            description="Imported from Excel",
            state=1,
            export=True,
            date_update=datetime.now(),
            user_update=user_id
        )

    def _create_promotion_item(self, row: dict, header_id: int, user_id: int):
        """สร้าง Object สำหรับ MPromotionBucketEntity (เทียบเท่า MP_PROMOTION_ITEM)"""
        return MPromotionBucketEntity(
            pro_id=header_id,
            entity_code=str(row.get('entity_code', ''))[:26],
            entity_name=str(row.get('entity_name', ''))[:200],
            entity_type=str(row.get('entity_type', ''))[:100],
            mode=str(row.get('attachmentmode', '1'))[:50],
            bucket=self._safe_int(row.get('bucketid', 1)),
            trigger_value=str(row.get('trigger_value', '0'))[:10],
            trigger_type=str(row.get('trigger_type', ''))[:50],
            barcode=str(row.get('barcode', ''))[:50],
            coupon=str(row.get('coupon_id', ''))[:26],
            condition=str(row.get('condition_ma_name', ''))[:300],
            condition_name=str(row.get('condition_name', ''))[:300],
            condition_id=str(row.get('condition_ma_id', ''))[:300],
            status=1,
            receipt_id=None,
            date_update=datetime.now(),
            user_update=user_id
        )

    # --- Utilities Helper จากโค้ดเก่า ---
    def _clean_data_series(self, data: pd.Series) -> pd.Series:
        def _clean_value(val):
            if pd.isna(val) or str(val).lower() == 'nan' or str(val).strip() == '':
                return ''
            s_val = str(val).strip()
            if s_val.endswith('.0'):
                return s_val[:-2]
            return s_val
        return data.map(_clean_value)

    def _safe_int(self, val):
        try:
            if pd.isna(val) or str(val).strip() == '': return 0
            return int(float(val))
        except: return 0

    def _parse_date(self, date_params):
        if pd.isna(date_params) or date_params == '': return None
        if isinstance(date_params, datetime): return date_params.date()
        s = str(date_params).strip()
        fmts = ["%d/%m/%Y", "%d/%m/%Y %H:%M:%S", "%Y-%m-%d", "%Y-%m-%d %H:%M:%S"]
        for fmt in fmts:
            try: return datetime.strptime(s, fmt).date()
            except: continue
        try:
            dt = pd.to_datetime(s, dayfirst=True, errors='coerce')
            return dt.date() if not pd.isna(dt) else None
        except: return None

















