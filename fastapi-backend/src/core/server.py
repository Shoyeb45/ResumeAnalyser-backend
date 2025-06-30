from fastapi import FastAPI
import logging
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from database import connect_to_mongo, close_mongo_connection

logger = logging.getLogger(__name__)

def create_server():
    ''' Function to create fastAPI instance, which initialises server '''
    try:
        @asynccontextmanager
        async def lifespan(app: FastAPI):
            # Startup
            await connect_to_mongo()
            logger.info("Application started")
            yield
            # Shutdown
            await close_mongo_connection()
            logger.info("Application stopped")

        app = FastAPI(
            title="Resume Analyser API",
            description="A production-ready FastAPI application with MongoDB",
            version="1.0.0",
            lifespan=lifespan
        )
        
        # Add CORS middleware
        app.add_middleware(
            CORSMiddleware,
            allow_origins=["*"],  # Configure appropriately for production
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )
        
        return app
    except Exception as e:
        print(e)
        
        return None