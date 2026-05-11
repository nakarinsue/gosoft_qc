import pandas as pd # type: ignore
from sqlalchemy.orm import Session
from datetime import datetime
from app.backend.config import settings as config  # สมมติว่ามี config เก็บค่า Minio
from app.backend.database.models.postgres_models  import (
    MVersionControl, MFileMaster, MPromotionHeader, 
    MPromotionBucketEntity
)

from typing import Optional
from app.backend.schemas.inventory import  ImportInformation
class PromotionImportService:
    def __init__(self, db: Session):
        self.db = db



    def read_excel_from_minio(self, path_file: str):
        """
        อ่านไฟล์ Excel จาก Minio โดยใช้ pandas storage_options
        path_file: s3://bucket_name/path/to/file.xlsx
        """
        storage_options = {
            "key": config.MINIO_ROOT_USER,          # Access Key
            "secret": config.MINIO_ROOT_PASSWORD,   # Secret Key
            "client_kwargs": {
                "endpoint_url": f'http://{config.MINIO_ENDPOINT}', # เช่น http://localhost:9000
                "verify": config.MINIO_SECURE  # True/False
            }
        }
        
        try:
            # อ่านข้อมูลทั้งหมดทุก Sheet (sheet_name=None)
            excel_data = pd.read_excel(
                path_file, 
                storage_options=storage_options, 
                sheet_name=None, 
                dtype=str
            )
            print(f"Successfully read file from Minio: {path_file}")
            return excel_data
        except Exception as e:
            print(f"Error reading from Minio: {e}")
            # Fallback: ลองอ่านแบบ Local File หาก Minio ล้มเหลว (เผื่อกรณี Test)
            return pd.read_excel(path_file, sheet_name=None, dtype=str)

    def process_import(self, params: ImportInformation):
        try:
            # 1. อ่านไฟล์จาก Minio
            excel_data = self.read_excel_from_minio(params.path_file)
            
            # 2. จัดการ Version Control
            version_obj = self._get_or_create_version(params)
            
            processed_sheets = []

            # 3. วนลูปประมวลผลแต่ละ Sheet
            for sheet_name, df in excel_data.items():
                # ถ้า User ระบุ Sheet มา และชื่อไม่ตรง ให้ข้าม
                if params.sheet and sheet_name != params.sheet:
                    continue

                # Clean Header Columns
                df.columns = df.columns.str.strip().str.lower().str.replace(r'[^\w\s]', '', regex=True).str.replace(r'\s+', '_', regex=True)
                print(df.columns)
                if "promotion_code" not in df.columns:
                    print(f"Skipping sheet {sheet_name}: 'promotion_code' column not found.")
                    continue

                # ทำความสะอาดข้อมูลเบื้องต้น
                df = self._clean_dataframe(df)

                # บันทึกข้อมูลไฟล์ลง MFileMaster
                file_obj = self._create_file_master(version_obj.id, params, sheet_name, len(df))
                
                # Import ข้อมูลโปรโมชั่น
                self._import_promotions(df, file_obj.id, params.user_name)
                
                # อัพเดทสถานะไฟล์เป็น Success (1)
                file_obj.status = 1
                processed_sheets.append(sheet_name)
            
            # Commit Transaction เมื่อทำทุกอย่างเสร็จสิ้น
            self.db.commit()
            return {"status": "Success", "version_id": version_obj.id, "sheets": processed_sheets}

        except Exception as e:
            self.db.rollback()
            print(f"Import Failed: {e}")
            raise e

    # ---------------- Helper Methods ----------------

    def _get_or_create_version(self, params: ImportInformation) -> MVersionControl:
        version = self.db.query(MVersionControl).filter_by(sr_no=params.version).first()
        if not version:
            version = MVersionControl(
                sr_no=params.version,
                title=params.system,
                status=1,
                user_create=params.user_name,
                user_update=params.user_name,
                date_create=datetime.utcnow(),
                date_update=datetime.utcnow()
            )
            self.db.add(version)
            self.db.flush() # flush เพื่อให้ได้ ID
        return version

    def _create_file_master(self, version_id: int, params: ImportInformation, sheet_name: str, row_count: int) -> MFileMaster:
        file_master = MFileMaster(
            v_id=version_id,
            file_name=params.file_name,
            sheet=sheet_name,
            status=0, # 0 = Processing
            r_row=row_count,
            description=params.remark,
            user_create=params.user_name,
            user_update=params.user_name,
            date_create=datetime.utcnow(),
            date_update=datetime.utcnow()
        )
        self.db.add(file_master)
        self.db.flush()
        return file_master

    def _import_promotions(self, df: pd.DataFrame, file_id: int, user_id: int):
        unique_promos = df['promotion_code'].unique()
        
        for pro_code in unique_promos:
            if not pro_code: continue
            
            promo_rows = df[df['promotion_code'] == pro_code]
            first_row = promo_rows.iloc[0]

            # 1. Insert Header
            header = MPromotionHeader(
                file_id=file_id,
                pro_code=int(pro_code),
                pro_name=str(first_row.get('promotion_name', '')),
                pro_receipt_name=str(first_row.get('receipt_promotion_name', '')),
                pro_type=str(first_row.get('promotion_type', '')),
                pro_group=str(first_row.get('group_name', '')),
                pro_status=str(first_row.get('promotion_status', '1')),
                start_date=self._parse_date(first_row.get('active_from')),
                end_date=self._parse_date(first_row.get('active_to')),
                rec_date=datetime.now().date(),
                reward_type=str(first_row.get('reward_type', '')),
                reward_value=str(first_row.get('reward_value', '')),
                notes=str(first_row.get('notes', '')),
                user_update=user_id,
                description="Imported from Minio"
            )
            self.db.add(header)
            self.db.flush() # เอา Header ID ไปใช้กับ Bucket

            # 2. Insert Items (Bucket Entities)
            for _, row in promo_rows.iterrows():
                bucket_item = MPromotionBucketEntity(
                    pro_id=header.id,
                    entity_code=str(row.get('entity_code', '')),
                    entity_name=str(row.get('entity_name', '')),
                    entity_type=str(row.get('entity_type', '')),
                    bucket=self._safe_int(row.get('bucketid', 1)),
                    trigger_value=str(row.get('trigger_value', '')),
                    trigger_type=str(row.get('trigger_type', '')),
                    barcode=str(row.get('barcode', '')),
                    coupon=str(row.get('coupon_id', '')),
                    condition_name=str(row.get('condition_name', '')),
                    condition_id=str(row.get('condition_ma_id', '')),
                    receipt_id=user_id, # หรือค่าที่เหมาะสม
                    user_update=user_id,
                    description="Item imported"
                )
                self.db.add(bucket_item)

    # ---------------- Utility Methods ----------------
    
    def _clean_dataframe(self, df: pd.DataFrame) -> pd.DataFrame:
        # แปลงทุกอย่างเป็น String ก่อนเพื่อกัน Error
        df = df.astype(str)
        for col in df.columns:
            # เปลี่ยน nan/None เป็น empty string
            df[col] = df[col].replace(['nan', 'None', 'NaN'], '')
            # ตัด .0 ทิ้งกรณีตัวเลข
            if df[col].dtype == 'object':
                 df[col] = df[col].apply(lambda x: x.split('.')[0] if x.replace('.','',1).isdigit() and x.endswith('.0') else x)
        return df

    def _parse_date(self, date_val):
        if pd.isna(date_val) or str(date_val).strip() == '': return datetime.now().date()
        try:
            return pd.to_datetime(date_val).date()
        except:
            return datetime.now().date()

    def _safe_int(self, val):
        try: return int(float(val))
        except: return 0