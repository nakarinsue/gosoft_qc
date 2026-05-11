from pydantic_settings import BaseSettings
import secrets

PROMOTION = 'PROMOTIONS'
MAP_LEN_TO_TYPE = {"10":"3","13":"4","12":"0"}
STORE ='09884'
SYSTEM = STATION = SHIFT = "1"
POST ='POST'
LOCALHOST = 'localhost'
class Settings(BaseSettings):
    # Database


    MYSQL_URL: str = 'stc-mm2c-uat2-mysql-rds-cluster-cluster.cluster-ckyenaczt10p.ap-southeast-1.rds.amazonaws.com'
    MYSQL_USER: str ='scawsadmin'
    MYSQL_PASSWORD: str ='1e29dbb9fcec80471f7f98626a414abf'
    MYSQL_DATABASE: str ='sc_mm2c_db'
   
    SQL_SERVER_URL: str = '117.113.122.109'
    SQL_SERVER_USER: str ='sa'
    SQL_SERVER_PASSWORD: str ='Admin2000'
    SQL_SERVER_DATABASE: str ='POSG2'

    SQLSERVER_URL: str = (
    f"mssql+pyodbc://{SQL_SERVER_USER}:{SQL_SERVER_PASSWORD}@{LOCALHOST}/{PROMOTION}"
    "?driver=ODBC+Driver+17+for+SQL+Server"
    "&TrustServerCertificate=yes"
)    
    # jdbc:postgresql     postgresql+psycopg2://admin:password123@db:5432/promotion_db
    POSTGRES_DB:str = 'PROMOTIONS'
    POSTGRES_URL: str = f"postgresql+psycopg2://{SQL_SERVER_USER}:{SQL_SERVER_PASSWORD}@{LOCALHOST}:5432/{POSTGRES_DB}"


    SECRET_KEY: str =secrets.token_hex(32)
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 300
    DISABLE_AUTH: bool = True
    # MinIO
    MINIO_ENDPOINT: str = "localhost:9000"
    MINIO_ROOT_USER: str = "Administrator"
    MINIO_ROOT_PASSWORD: str = "Admin2000"
    MINIO_BUCKET: str = 'file-promotion'
    MINIO_SECURE: bool = False  # Set True for HTTPS

    class Config:
        env_file = "production.env"
        extra = "ignore"


class amb_config(BaseSettings):
    
    getbarcode_url : str= "https://allmember-api-ext-uat.cpall.co.th/AllMemberRequestBarcode/RequestBarcode"
    issue_api_url: str = "https://point-loyalty-uat.cpall.co.th/transaction/issue"
    deduct_api_url: str = "https://internal-plo-api-uat-alb-915713478.ap-southeast-1.elb.amazonaws.com/transaction/deduct/v2"

    issue_deduct_x_api_key: str ='6owdLRnM9TgDWtF9y4AE7svEFJ6moPDUfDMTowvM'

    getbalance_get_url : str= "https://point-loyalty-uat.cpall.co.th/getbalance"
    getbalance_Authorization: str= 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0aW1lU3RhbXAiOiIxNjY0MTk3MTI1OTgxIiwiY2xpZW50SWQiOiJlODVkMGM5Y2RlOGU2NWQxNzRiMjlmNmRmMmRiYWI1NCIsImNoYW5uZWxJZCI6IkNOMDkifQ.YjBUxxoPw3NMXYzvdnyU_9sTuq0z5v0VZ9lrDl8gPsY'
    inquery_url: str = "http://clouds.online-allmember-staging.net/AllMemberInquiryProfile/InquiryProfile"
    
    class Config:
        env_file = "production.env"
        extra = "ignore"

settings = Settings()
settings_amb = amb_config()


#__All__ =['amd_setting','settings'] 