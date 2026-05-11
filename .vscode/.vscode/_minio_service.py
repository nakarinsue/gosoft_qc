import boto3
import mimetypes
from botocore.exceptions import NoCredentialsError, ClientError
from fastapi import UploadFile, HTTPException
from fastapi.responses import StreamingResponse
from datetime import datetime
from app.backend.config import settings

class MinioService:
    def __init__(self):
        self.s3_client = boto3.client(
            's3',
            endpoint_url=f"http{'s' if settings.MINIO_SECURE else ''}://{settings.MINIO_ENDPOINT}",
            aws_access_key_id=settings.MINIO_ROOT_USER,
            aws_secret_access_key=settings.MINIO_ROOT_PASSWORD
        )
        self.bucket_name = settings.MINIO_BUCKET
        self._ensure_bucket_exists()

    def _ensure_bucket_exists(self):
        """ ตรวจสอบว่ามี Bucket หรือไม่ ถ้าไม่มีให้สร้างใหม่ """
        try:
            self.s3_client.head_bucket(Bucket=self.bucket_name)
        except ClientError:
            try:
                self.s3_client.create_bucket(Bucket=self.bucket_name)
            except Exception as e:
                print(f"Could not create bucket: {e}")

    async def upload_file(self, file: UploadFile, version_id: str, file_type: str) -> str:
        """ 
        อัปโหลดไฟล์ลง MinIO โดยจัดโครงสร้างตาม version_id และ file_type
        รองรับไฟล์ Excel, Image, Zip, Yaml
        """
        try:
            # 1. จัดเตรียมชื่อไฟล์และ Path
            timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
            
            safe_filename = file.filename.replace('/', '_') # type: ignore
            v_id = str(version_id).strip('/')
            f_type = str(file_type).strip('/')
            
            # สร้าง Path มาตรฐาน: versions/{version_id}/{file_type}/{timestamp}_{filename}
            file_path = f"versions/{v_id}/{f_type}/{timestamp}_{safe_filename}"
            content_type, _ = mimetypes.guess_type(file.filename) # type: ignore
            if not content_type:
                content_type = file.content_type or 'application/octet-stream'

            extra_args = {
                'ContentType': content_type,
                'ContentDisposition': 'inline' # แนะนำ Browser ให้แสดงผลแทนการโหลดถ้าเป็นไปได้
            }

            self.s3_client.upload_fileobj(
                file.file, 
                self.bucket_name, 
                file_path,
                ExtraArgs=extra_args
            )
            
            return file_path
            
        except NoCredentialsError:
            raise HTTPException(status_code=500, detail="MinIO Credentials missing")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"File upload failed: {str(e)}")

    def get_presigned_url(self, file_path: str, expires_in: int = 3600) -> str:
        """ 
        สร้าง Temporary URL (ลิงก์ชั่วคราว) สำหรับนำไปให้ Frontend ใช้แสดงรูปภาพ <img src="..."> 
        """
        try:
            url = self.s3_client.generate_presigned_url(
                'get_object',
                Params={'Bucket': self.bucket_name, 'Key': file_path},
                ExpiresIn=expires_in
            )
            return url
        except ClientError as e:
            raise HTTPException(status_code=500, detail=f"Could not generate URL: {str(e)}")

    def download_file_stream(self, file_path: str, force_download: bool = True, custom_filename: str|None = None) -> StreamingResponse:
        """ 
        ดาวน์โหลดไฟล์ออกมาแบบ Stream (เหมาะสำหรับ Export ไฟล์ Excel, Zip, Yaml)
        ไม่กิน Memory ของ Server เครื่องหลัก 
        """
        try:
            response = self.s3_client.get_object(Bucket=self.bucket_name, Key=file_path)

            def iterfile():
                for chunk in response['Body'].iter_chunks(chunk_size=1024 * 1024):  # 1MB chunks
                    yield chunk
            content_type = response.get('ContentType', 'application/octet-stream')
            headers = {}
            
            if force_download:
                dl_filename = custom_filename if custom_filename else file_path.split('/')[-1]
                headers['Content-Disposition'] = f'attachment; filename="{dl_filename}"'

            return StreamingResponse(iterfile(), media_type=content_type, headers=headers)
            
        except self.s3_client.exceptions.NoSuchKey:
            raise HTTPException(status_code=404, detail="File not found in storage")
        except ClientError as e:
            raise HTTPException(status_code=500, detail=f"Storage client error: {str(e)}")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error downloading file: {str(e)}")