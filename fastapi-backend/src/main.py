from core.logging import setup_logging
from dotenv import load_dotenv
setup_logging(
    log_level = "INFO",
    log_file = "logs/app.log",
    max_file_size = 8 * 1024 * 1024,    # 8MB per file
    backup_count = 3                    # Keep 3 old log files
)
load_dotenv()

from core.server import create_server

import uvicorn
import logging

import os
from features.resume.router import router as resumes_router

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = create_server()

# Include routers
app.include_router(resumes_router, prefix="/api/v1")

@app.get("/")
async def root():
    return {"message": "Resume Analyser API is running!"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.get('/get-all-users')
async def get_all():
    from features.users.models import User
    users = await User.get("686189be9e09fb7d73dc08b5")
    
    return {
        "users": users
    }
    
def main():
    
    
    
    logger.info(f"Environment variables loaded successfully, test env: {os.getenv('TEST')}")
    uvicorn.run("main:app")
    

if __name__ == "__main__":
    main()