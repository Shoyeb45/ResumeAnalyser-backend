from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from typing import Optional
import logging

from features.users.models import User
from features.resume.models import Resume
from config import settings

# Beanie models
Models = [Resume, User]

logger = logging.getLogger(__name__)

class DatabaseManager:
    client: Optional[AsyncIOMotorClient] = None
    database = None

db_manager = DatabaseManager()

async def connect_to_mongo():
    """Create database connection"""
    try:
        db_manager.client = AsyncIOMotorClient(settings.database_url)
        db_manager.database = db_manager.client[settings.database_name]
        
        # Initialize Beanie with document models
        await init_beanie(
            database=db_manager.database,
            document_models=Models
        )
        
        # Create indexes
        await create_indexes()
        
        logger.info("Connected to MongoDB")

    except Exception as e:
        logger.error(f"Error connecting to MongoDB: {e}")
        raise

async def close_mongo_connection():
    """Close database connection"""
    if db_manager.client:
        db_manager.client.close()
        logger.info("Disconnected from MongoDB")

async def create_indexes():
    """Create database indexes for performance"""
    try:
        # Create indexes for Resume collection
        await Resume.get_motor_collection().create_index("user_id")
        await Resume.get_motor_collection().create_index("created_at")
        
        logger.info("Database indexes created successfully")
    except Exception as e:
        logger.error(f"Error creating indexes: {e}")

def get_database():
    """Dependency to get database instance"""
    return db_manager.database