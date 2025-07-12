from fastapi import Depends, HTTPException, status, Request 
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from motor.motor_asyncio import AsyncIOMotorDatabase
from jose import jwt, JWTError
from typing import Optional, Dict
import logging
from database import get_database
from config import settings
from features.users.models import User


logger = logging.getLogger(__name__)

async def get_db() -> AsyncIOMotorDatabase:
    """Get database dependency"""
    return get_database()

def decode_access_token(token: str):
    '''
    Decode token and get the payload of JWT token
    '''
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[settings.algorithm])
        return payload
    except JWTError:
        return None
    
async def get_current_user(
    request: Request,
) -> Dict[str, any]:
    """
    Dependency to get user id of authenticated user
    
    Args:
        request: Request object of the HTTP reqeust 
    
    Returns:
        dict: Dictionary with user id 
    """

    try:
        logger.info("Authenticating user..")
    
        token = request.cookies.get("token")
        
        if not token:
            logger.error("Token not found, token is None")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, 
                detail="User authentication failed, token not found."
            )
        
        logger.info("Token retrieved successfully.")
        payload = decode_access_token(token)
        if payload is None:
            logger.error("Failed to decode token, payload is None")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User authentication failed, invalid token"
            )
        
        user_id: str = payload.get("userId")
        
        if user_id is None:
            logger.error("Failed to extract user id, user id is None")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User authentication failed, invalid token data"
            )
         
        # find the user in database
        user = await User.get(document_id=user_id)   
        if user is None:
            logger.error("User not found in database, failed to authenticate.")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User authentication failed, user not found in database"
            )
            
        logger.info(f"Token verified, got user id: {user_id}")
            
        return {
            "user_id": user_id,
            "user": user
        }
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error while authenticating user"
        )
    
