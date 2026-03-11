from pydantic_settings import BaseSettings
import secrets

PROMOTION = 'PROMOTION'
class Settings(BaseSettings):
    # Database
    POSTGRES_URL: str = "postgresql+psycopg2://sa:Admin2000@localhost:5432/PROMOTION"

    SQLSERVER_URL: str = (
    "mssql+pyodbc://sa:Admin2000@localhost/PROMOTION"
    "?driver=ODBC+Driver+17+for+SQL+Server"
    "&TrustServerCertificate=yes"
)
    MYSQL_URL: str = 'stc-mm2c-uat2-mysql-rds-cluster-cluster.cluster-ckyenaczt10p.ap-southeast-1.rds.amazonaws.com'
    MYSQL_USER: str ='scawsadmin'
    MYSQL_PASSWORD: str ='1e29dbb9fcec80471f7f98626a414abf'
    MYSQL_DATABASE: str ='sc_mm2c_db'

    SQL_SERVER_URL: str = '117.113.122.109'
    SQL_SERVER_USER: str ='sa'
    SQL_SERVER_PASSWORD: str ='Admin2000'
    SQL_SERVER_DATABASE: str ='POSG2'


    SECRET_KEY: str =secrets.token_hex(32)
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 300
    DISABLE_AUTH: bool = True
    # MinIO
    MINIO_ENDPOINT: str = "localhost:9000"
    MINIO_ACCESS_KEY: str = "Administrator"
    MINIO_SECRET_KEY: str = "Admin2000"
    MINIO_BUCKET: str = 'file-promotion'
    MINIO_SECURE: bool = False  # Set True for HTTPS

    class Config:
        env_file = ".env"

settings = Settings()