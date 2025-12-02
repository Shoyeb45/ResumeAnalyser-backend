from beanie import Document
from pydantic import EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from bson import ObjectId

class User(Document):
    email: EmailStr
    password: str
    name: str
    isVerified: bool = False

    # extra detauls
    current_profession: Optional[str] = None
    mobile_number: Optional[str] = None
    location: Optional[str] = None
    github: Optional[str] = None
    linkedin: Optional[str] = None
    portfolio: Optional[str] = None
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "User"  # matches collection name used by Express backend

    class Config:
        json_schema_extra = {
            "example": {
                "email": "shoyeb@gmail.com",
                "password": "hashed_password_here",
                "name": "Shoyeb Ansari",
                "isVerified": False
            }
        }
