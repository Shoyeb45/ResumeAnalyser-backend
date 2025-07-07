''' All models related to resume
'''

import logging
from beanie import Document, Link, PydanticObjectId
from pydantic import BaseModel, Field, ValidationError
from typing import List, Optional, Dict, Any
from datetime import datetime, date
from pymongo import IndexModel

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Embedded Models (for nested data within documents)

class ContactInfo(BaseModel):
    email: Optional[str] = None
    mobile: Optional[str] = None
    location: Optional[str] = None
    social_links: Optional[Dict[str, str]] = Field(default_factory=dict)  # {"linkedin": "url", "github": "url"}

class Date(BaseModel):
    start: Optional[str] = None
    end: Optional[str] = None
    
class ProjectDetails(BaseModel):
    title: str
    description: Optional[str] = None
    project_link: Optional[str] = None
    date: Optional[Date] = None
    location: Optional[str] = None
    organization: Optional[str] = None
    bullet_points: List[str] = Field(default_factory=list)
    technologies_used: List[str] = Field(default_factory=list)

class Education(BaseModel):
    institute_name: str
    degree: str  # "B.Tech", "B.Sc", "M.Tech", etc.
    specialisation: Optional[str] = None  # Computer Science, Electronics, etc.
    date: Optional[Date] = None  # Fixed: was 'date' in model but 'dates' in data
    location: Optional[str] = None
    gpa: Optional[str] = None  # Changed from float to str to handle "94%" and "9 CGPA"
    relevant_coursework: List[str] = Field(default_factory=list)

class SkillGroup(BaseModel):
    skill_group: str  # "Programming Languages", "Databases", "Tools", etc.
    skills: List[str]

class Achievement(BaseModel):
    title: str
    description: Optional[str] = None
    date_achieved: Optional[str] = None
    organization: Optional[str] = None

class Language(BaseModel):  # Fixed typo: was 'Langauge'
    language: Optional[str] = None
    proficiency: Optional[str] = None

class Certification(BaseModel):
    certification_name: Optional[str] = None  # Fixed: removed trailing comma
    issuing_organisation: Optional[str] = None  # Fixed: removed trailing comma
    date_issued: Optional[str] = None  # Fixed: removed trailing comma
    expiry_date: Optional[str] = None  # Fixed: removed trailing comma
    description: Optional[str] = None

class WorkExperience(BaseModel):
    ''' WorkExperience Model for the resume'''  # Fixed typo in docstring
    company_name: Optional[str] = None
    date: Optional[Date] = None
    location: Optional[str] = None
    job_title: Optional[str] = None
    bullet_points: List[str] = Field(default_factory=list)
    
class Publication(BaseModel):
    '''Publications Model for the resume'''
    publication_name: Optional[str] = None
    authors: List[str] = Field(default_factory=list)
    description: Optional[str] = None  # Fixed: was str = None
    
class Extracurricular(BaseModel):
    '''Extracurricular Model for the resume'''
    organization_name: Optional[str] = None  # Fixed: was str = None
    date: Optional[Date] = None  # Fixed: removed trailing comma
    role: Optional[str] = None  # Fixed: removed trailing comma
    title: Optional[str] = None  # Fixed: was str = None, removed trailing comma
    bullet_points: List[str] = Field(default_factory=list)
    
class PersonalInfo(BaseModel):
    name: Optional[str] = None
    contact_info: Optional[ContactInfo] = None
    professional_summary: Optional[str] = None
    
class Resume(Document):
    """Main Resume document containing all resume data"""
    # Reference to user
    user_id: PydanticObjectId
    
    # Resume metadata
    resume_name: str  # User-defined name for the resume
    is_primary: bool = False  # Mark one resume as primary
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Resume sections
    personal_info: Optional[PersonalInfo] = None
    projects: List[ProjectDetails] = Field(default_factory=list)
    education: List[Education] = Field(default_factory=list)
    skills: List[SkillGroup] = Field(default_factory=list)
    achievements: List[Achievement] = Field(default_factory=list)
    languages: List[Language] = Field(default_factory=list)  # Fixed typo: was 'langauges'
    certifications: List[Certification] = Field(default_factory=list)
    work_experiences: List[WorkExperience] = Field(default_factory=list)
    publications: List[Publication] = Field(default_factory=list)           
    extracurriculars: List[Extracurricular] = Field(default_factory=list)
    
    # Additional useful fields
    keywords: List[str] = Field(default_factory=list)  # For search optimization
    last_analyzed: Optional[datetime] = None
    analysis_score: Optional[float] = None  # Overall resume score
    
    class Settings:
        name = "resumes"
        indexes = [
            IndexModel("user_id"),
            IndexModel([("user_id", 1), ("is_primary", 1)]),
            IndexModel("created_at"),
            IndexModel("keywords"),  # For text search
            IndexModel("analysis_score"),
        ]


def create_resume_model(resume_metadata: Dict[str, Any], user_id: str, resume_details: Dict[str, Any]) -> Optional[Resume]:
    """
    Create a Resume model from provided metadata and details.
    
    Args:
        resume_metadata: Dictionary containing resume metadata
        user_id: User ID string
        resume_details: Dictionary containing all resume details
        
    Returns:
        Resume object if successful, None if failed
        
    Raises:
        ValueError: If required fields are missing or invalid
        ValidationError: If data validation fails
    """
    try:
        logger.info(f"Creating resume model for user: {user_id}")
        
        # Validate required fields
        if not resume_metadata:
            raise ValueError("resume_metadata cannot be empty")
        if not user_id:
            raise ValueError("user_id cannot be empty")
        if not resume_details:
            raise ValueError("resume_details cannot be empty")
            
        # Validate user_id format
        try:
            user_object_id = PydanticObjectId(user_id)
        except Exception as e:
            logger.error(f"Invalid user_id format: {user_id}")
            raise ValueError(f"Invalid user_id format: {str(e)}")
        
        # Extract and validate resume metadata
        resume_name = resume_metadata.get("resume_name")
        if not resume_name:
            raise ValueError("resume_name is required in resume_metadata")
        
        is_primary = resume_metadata.get("is_primary", False)
        
        # Process personal info
        personal_info = None
        if "personal_info" in resume_details:
            try:
                personal_info_data = resume_details["personal_info"]
                contact_info = None
                
                if "contact_info" in personal_info_data:
                    contact_info = ContactInfo(**personal_info_data["contact_info"])
                
                personal_info = PersonalInfo(
                    name=personal_info_data.get("name"),
                    contact_info=contact_info,
                    professional_summary=personal_info_data.get("professional_summary")
                )
                logger.info("Personal info processed successfully")
            except Exception as e:
                logger.error(f"Error processing personal info: {str(e)}")
                raise ValidationError(f"Error processing personal info: {str(e)}")
        
        # Process education
        education_models = []
        if "educations" in resume_details:
            try:
                for idx, education_data in enumerate(resume_details["educations"]):
                    # Handle date field mismatch (dates vs date)
                    if "dates" in education_data and "date" not in education_data:
                        education_data["date"] = education_data.pop("dates")
                    
                    education_models.append(Education(**education_data))
                logger.info(f"Processed {len(education_models)} education records")
            except Exception as e:
                logger.error(f"Error processing education: {str(e)}")
                raise ValidationError(f"Error processing education: {str(e)}")
        
        # Process work experiences
        work_experience_models = []
        if "work_experiences" in resume_details:
            try:
                for work_exp_data in resume_details["work_experiences"]:
                    work_experience_models.append(WorkExperience(**work_exp_data))
                logger.info(f"Processed {len(work_experience_models)} work experience records")
            except Exception as e:
                logger.error(f"Error processing work experiences: {str(e)}")
                raise ValidationError(f"Error processing work experiences: {str(e)}")
        
        # Process projects
        project_models = []
        if "projects" in resume_details:
            try:
                for project_data in resume_details["projects"]:
                    project_models.append(ProjectDetails(**project_data))
                logger.info(f"Processed {len(project_models)} project records")
            except Exception as e:
                logger.error(f"Error processing projects: {str(e)}")
                raise ValidationError(f"Error processing projects: {str(e)}")
        
        # Process skills
        skill_models = []
        if "skills" in resume_details:
            try:
                for skill_data in resume_details["skills"]:
                    skill_models.append(SkillGroup(**skill_data))
                logger.info(f"Processed {len(skill_models)} skill groups")
            except Exception as e:
                logger.error(f"Error processing skills: {str(e)}")
                raise ValidationError(f"Error processing skills: {str(e)}")
        
        # Process achievements
        achievement_models = []
        if "achievements" in resume_details:
            try:
                for achievement_data in resume_details["achievements"]:
                    achievement_models.append(Achievement(**achievement_data))
                logger.info(f"Processed {len(achievement_models)} achievement records")
            except Exception as e:
                logger.error(f"Error processing achievements: {str(e)}")
                raise ValidationError(f"Error processing achievements: {str(e)}")
        
        # Process certifications
        certification_models = []
        if "certifications" in resume_details:
            try:
                for cert_data in resume_details["certifications"]:
                    certification_models.append(Certification(**cert_data))
                logger.info(f"Processed {len(certification_models)} certification records")
            except Exception as e:
                logger.error(f"Error processing certifications: {str(e)}")
                raise ValidationError(f"Error processing certifications: {str(e)}")
        
        # Process languages
        language_models = []
        if "languages" in resume_details:
            try:
                for lang_data in resume_details["languages"]:
                    language_models.append(Language(**lang_data))
                logger.info(f"Processed {len(language_models)} language records")
            except Exception as e:
                logger.error(f"Error processing languages: {str(e)}")
                raise ValidationError(f"Error processing languages: {str(e)}")
        
        # Process publications
        publication_models = []
        if "publications" in resume_details:
            try:
                for pub_data in resume_details["publications"]:
                    publication_models.append(Publication(**pub_data))
                logger.info(f"Processed {len(publication_models)} publication records")
            except Exception as e:
                logger.error(f"Error processing publications: {str(e)}")
                raise ValidationError(f"Error processing publications: {str(e)}")
        
        # Process extracurriculars
        extracurricular_models = []
        if "extracurriculars" in resume_details:
            try:
                for extra_data in resume_details["extracurriculars"]:
                    extracurricular_models.append(Extracurricular(**extra_data))
                logger.info(f"Processed {len(extracurricular_models)} extracurricular records")
            except Exception as e:
                logger.error(f"Error processing extracurriculars: {str(e)}")
                raise ValidationError(f"Error processing extracurriculars: {str(e)}")
        
        # Create the resume object
        resume = Resume(
            user_id=user_object_id,
            resume_name=resume_name,
            is_primary=is_primary,
            personal_info=personal_info,
            projects=project_models,
            education=education_models,
            skills=skill_models,
            achievements=achievement_models,
            languages=language_models,
            certifications=certification_models,
            work_experiences=work_experience_models,
            publications=publication_models,
            extracurriculars=extracurricular_models
        )
        
        logger.info(f"Resume model created successfully for user: {user_id}")
        return resume
        
    except ValidationError as e:
        logger.error(f"Validation error while creating resume: {str(e)}")
        raise
    except ValueError as e:
        logger.error(f"Value error while creating resume: {str(e)}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error while creating resume: {str(e)}")
        raise Exception(f"Failed to create resume model: {str(e)}")


# Example usage function with error handling
def safe_create_resume(resume_metadata: Dict[str, Any], user_id: str, resume_details: Dict[str, Any]) -> Optional[Resume]:
    """
    Safe wrapper for creating resume model with comprehensive error handling.
    
    Returns:
        Resume object if successful, None if failed
    """
    try:
        return create_resume_model(resume_metadata, user_id, resume_details)
    except (ValueError, ValidationError) as e:
        logger.error(f"Failed to create resume: {str(e)}")
        return None
    except Exception as e:
        logger.error(f"Unexpected error creating resume: {str(e)}")
        return None