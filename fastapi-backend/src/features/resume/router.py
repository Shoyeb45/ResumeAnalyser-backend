from fastapi import APIRouter, File, UploadFile, BackgroundTasks, HTTPException, Form, Depends, status
from features.resume.schemas import ResumeAnalysisResponse, ResumeDetailsResponse
from features.resume.services import resume_analyzer
from typing import Optional, Annotated
from features.resume.repository import resume_repository
import os, json
from dependency import get_current_user
from typing import List
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
    


# API Endpoint to get questions related to skills
@router.post(
    "/skill-assessment", 
    description="This will give 10 mcq questions based on soft and technical skills provided."
)
def get_mcq_questions(
    technical_skills: str = Form(...),
    soft_skills: str = Form(...),
    user: dict = Depends(get_current_user)
):
    try:
        logger.info("Skill-assessment API called")
        return resume_analyzer.generate_skill_assessment_questions(technical_skills=technical_skills, soft_skills=soft_skills)
    except Exception as e:
        logger.error(f"Failed to generate MCQ question based on skills provided, error : {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate MCQ question based on skills provided, error : {str(e)}"
        )

# API Endpoint to get the score of the assessment 
@router.post(
    "/skill-assessment-score", 
    description="This will give comprehensive analysis of the assessment and also it will suggest some job roles."
)
def get_assessment_score(
    skills: str = Form(...),
    user: dict = Depends(get_current_user)
):
    try:
        '''It will calculate skill assessment score and it will also suggest some job roles depending upon the score
        '''
        
        logger.info("Skill-assessment-score API called")
        skills_list: List = json.loads(skills)

        if skills_list is None:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Some error occurred while converting the skills json string into python object"
            )
            
        return resume_analyzer.analyse_assessment_score(skills_list)
    except json.JSONDecodeError as e:
        logger.error(f"Invalid JSON string provided, error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Invalid JSON string provided, error: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Failed to analyse MCQ question based on provided skill wise scores, error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to analyse MCQ question based on provided skill wise scores, error: {str(e)}"
        )
        
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
    bullet_points: Optional[str] = Form(None),
    user: dict = Depends(get_current_user)
):
    try:
        user_id = user["user_id"]
        logger.info(f"Project endpoint called to get AI generated description point, called by user - {user_id}")
        return resume_analyzer.get_project_enhanced_description(project_name, tech_stack, bullet_points)
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
        
# API Endpoint to get resume score bases on provided resume detail in json format
@router.post(
    "/ats-score",
    description="Get ATS score of resume by sending the json object of the resume"
)
def get_ats_score_of_resume(
    user: dict = Depends(get_current_user),
    resume_json: str = Form(...)
):
    try:
        logger.info(f"ATS score endpoint called with, resume object as:  {resume_json}")
        
        return resume_analyzer.get_ats_score(resume_json)        
    except Exception as e:
        logger.error(f"Failed to provide ats score, error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to provide ats score, error: {str(e)}"
        )
