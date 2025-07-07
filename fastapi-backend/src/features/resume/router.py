from fastapi import APIRouter, File, UploadFile, BackgroundTasks, HTTPException, Form, Depends, status
from features.resume.schemas import ResumeAnalysisResponse, ResumeDetailsResponse
from features.resume.services import resume_analyzer
from typing import Optional, Annotated
from features.resume.repository import resume_repository
import os
from dependency import get_current_user

import logging

logger = logging.getLogger(__name__)


router = APIRouter(prefix = "/resume", tags = ["resume"])

@router.post(
    "/analyse", 
    description = "API endpoint which will analyse the resume and extract necessary details and keep it in database and give scores"
)
async def analyse_resume(
    background_tasks: BackgroundTasks,
    user: dict = Depends(get_current_user),
    resume_file: UploadFile = File(...),
    job_description: Optional[str] = Form(None),
    job_title: Optional[str] = Form(None),
):
    try:
        # Save the file temporarily
        user_id = user["user_id"]
        os.makedirs("temp", exist_ok=True)
        
        # Construct full path
        temp_path = os.path.join("temp", resume_file.filename)
        
        content = await resume_file.read()
        with open(temp_path, "wb") as buffer:
            buffer.write(content)
            
        logger.info("Successfully saved file in temp directory")
        
        result = resume_analyzer.analyze_resume(
            background_tasks=background_tasks,
            user_id=user_id,
            file_path=temp_path,
            file_type=resume_file.filename.split('.')[-1],
            target_role=job_title,
            job_description=job_description
        )
        
        # clean the file
        os.remove(temp_path)
        logger.info("Deleted resume file successfully")
        return result
    except Exception as e:
        logger.error(f"Failed to analyse resume, error : {str(e)}")
        raise HTTPException(status_code = 500, detail = f"Failed to analyse resume, error : {str(e)}")


# API Endpoint to extract the details of the resume 
@router.post(
    "/",
    description="API to extract all the api response"
)
async def resume_extraction(
    background_tasks: BackgroundTasks,
    user: dict = Depends(get_current_user),
    resume_file: UploadFile = File(...)
):
    try:
        user_id = user["user_id"]
        # Save the file temporarily
        logger.info("Resume builder api called")
        os.makedirs("temp", exist_ok=True)
        
        # Construct full path
        temp_path = os.path.join("temp", resume_file.filename)
        
        content = await resume_file.read()
        with open(temp_path, "wb") as buffer:
            buffer.write(content)
            
        logger.info("Successfully saved file in temp directory")
        
        result = await resume_analyzer.get_resume_details(
            background_tasks=background_tasks,
            user_id=user_id,
            file_path=temp_path
        )
        
        # clean the file
        os.remove(temp_path)
        
        return result
    except Exception as e:
        logger.error(f"Failed to analyse resume, error : {str(e)}")
        raise HTTPException(status_code = 500, detail = f"Failed to analyse resume, error : {str(e)}")
    


# API Endpoint to get all the resumes for particular user
@router.get("/")
async def get_all_resume(
    user: dict = Depends(get_current_user)
):
    try:
        user_id = user["user_id"]
        logger.info(f"Getting all the resume for the user: {user_id}")
        resumes = await resume_repository.get_user_resumes(user_id=user_id)
        
        return resumes
    except Exception as e:
        logger.error(f"Error providing all the resume {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error occured while providing all the resume of the user, error: {str(e)}"
        )



# API endpoint to delete resume
@router.delete(
    "/{resume_id}",
    description="Route which can delete resume with resume id"
)
async def delete_resume(
    resume_id: str,
    user: dict = Depends(get_current_user),
):
    try:
        logger.info(f"Deleting resume with resume id : {resume_id}")
        
        is_deleted = await resume_repository.delete_resume(resume_id)
        
        if not is_deleted:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete resume"
            )
        
        return {
            "status": True,
            "message": f"Resume with id {resume_id}, deleted succesfully"
        }
    except Exception as e:
        logger.error(f"Failed to delete resume(resume id: {resume_id})")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            details=f"Failed to delete resume, with resume id - {resume_id}"
        )
        

# API Endpoint to get project description point suggestion
@router.post(
    "/project",
    description="Get project description for project section"
)
def get_project_description_suggestion(
    project_name: str = Form(...),
    tech_stack: str = Form(...),
    description: Optional[str] = Form(None),
    user: dict = Depends(get_current_user)
):
    try:
        logger.info(project_name)
        user_id = user["user_id"]
        logger.info(f"Project endpoint called to get AI generated description point, called by user - {user_id}")
        return resume_analyzer.get_project_enhanced_description(project_name, tech_stack, description)
    except Exception as e:
        logger.error(f"Failed to generate AI Suggestion for project section, error message: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate AI suggestion for project section, ErrorMessage: {str(e)}"
        )
        
# API Endpoint to get experience description point suggestion
@router.post("/experience")
async def get_experience_description_suggestion(
    organisation_name: str = Form(...),
    position: str = Form(...),
    location: str = Form(...),
    description: Optional[str] = Form(None),
    user: dict = Depends(get_current_user)
):
    try:
        logger.info(f"Experience endpoint called to get AI generated description point, called by user-{user['user_id']}")
        return resume_analyzer.get_experience_enhanced_description(organisation_name, position, location, description)
    except Exception as e:
        logger.error(f"Failed to generate AI Suggestion for experience section, error message: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate AI suggestion for project experience, ErrorMessage: {str(e)}"
        )
        
# API Endpoint to get extracurricular activity description point suggestion
@router.post(
    "/extracurricular",
    description="Get extracurricular description for project section"
)
async def get_extracurricular_description_suggestion(
    organisation_name: str = Form(...),
    position: str = Form(...),
    location: str = Form(...),
    description: Optional[str] = Form(None),
    user: dict = Depends(get_current_user)
):
    try:
        logger.info(f"Extracurricular endpoint called to get AI generated description point, called by user-{user['user_id']}")
        
        return resume_analyzer.get_extracurricular_enhanced_description(organisation_name, position, location, description)
    except Exception as e:
        logger.error(f"Failed to generate AI Suggestion for extracurricular section, error message: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate AI suggestion for extracurricular experience, error message: {str(e)}"
        )