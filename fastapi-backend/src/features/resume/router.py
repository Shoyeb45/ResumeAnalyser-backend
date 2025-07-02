from fastapi import APIRouter, File, UploadFile, HTTPException, Form
from features.resume.schemas import ResumeAnalysisRequest
from features.resume.services import resume_analyzer
from typing import Optional
import os

import logging

logger = logging.getLogger(__name__)


router = APIRouter(prefix = "/resume", tags = ["resume"])

@router.post(
    "/analyse", 
    description = "API endpoint which will analyse the resume and extract necessary details and keep it in database and give scores"
)
async def analyse_resume(
    resume_file: UploadFile = File(...),
    job_description: Optional[str] = Form(None),
    job_title: Optional[str] = Form(None),
    target_role: Optional[str] = Form(None)
):
    try:
        # Save the file temporarily
        os.makedirs("temp", exist_ok=True)
        # Construct full path
        temp_path = os.path.join("temp", resume_file.filename)
        
        content = await resume_file.read()
        with open(temp_path, "wb") as buffer:
            buffer.write(content)
            
        logger.info("Successfully saved file in temp directory")
        
        result = resume_analyzer.analyze_resume(
            file_path=temp_path,
            file_type=resume_file.filename.split('.')[-1],
            target_role=target_role,
            job_description=job_description
        )
        
        # clean the file
        os.remove(temp_path)
        
        # if not file_content:
        #     raise HTTPException(
        #         status_code = 400,
        #         detail = "No content in resume."
        #     )
        
        return result
    except Exception as e:
        logger.error(f"Failed to analyse resume, error : {str(e)}")
        raise HTTPException(status_code = 500, detail = f"Failed to analyse resume, error : {str(e)}")

    