from pydantic_settings import BaseSettings
from typing import Optional
import os

class Settings(BaseSettings):
    database_url: str
    database_name: str
    jwt_secret: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 120
    
    class Config:
        env_file = "../.env"
        extra = "ignore"
        case_sensitive = False

settings = Settings()