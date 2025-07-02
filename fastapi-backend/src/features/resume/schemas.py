from pydantic import BaseModel
from typing import Optional
from fastapi import UploadFile, File

class ResumeAnalysisRequest(BaseModel):
    '''Request model of resume analysis endpoint
    '''
    resume_file: UploadFile = File(...)
    job_description: Optional[str] = None
    job_title: Optional[str] = None
    target_role: Optional[str] = None
    
