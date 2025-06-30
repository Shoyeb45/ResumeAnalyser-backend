from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from motor.motor_asyncio import AsyncIOMotorDatabase
from jose import jwt, JWTError
from typing import Optional

from src.database import get_database
from src.config import settings
from src.features.users.models import User

security = HTTPBearer()

async def get_db() -> AsyncIOMotorDatabase:
    """Get database dependency"""
    return get_database()

# async def get_current_user(
#     credentials: HTTPAuthorizationCredentials = Depends(security),
#     db: AsyncIOMotorDatabase = Depends(get_db)
# ) -> User:
#     """Get current authenticated user"""
#     credentials_exception = HTTPException(
#         status_code=status.HTTP_401_UNAUTHORIZED,
#         detail="Could not validate credentials",
#         headers={"WWW-Authenticate": "Bearer"},
#     )
    
#     try:
#         payload = jwt.decode(
#             credentials.credentials, 
#             settings.secret_key, 
#             algorithms=[settings.algorithm]
#         )
#         user_id: str = payload.get("sub")
#         if user_id is None:
#             raise credentials_exception
#     except JWTError:
#         raise credentials_exception
    
#     user = await User.get(user_id)
#     if user is None:
#         raise credentials_exception
    
#     return user