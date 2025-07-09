"""
Resume Analysis Response Schema
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Union
from datetime import datetime, date
from features.resume.models import (
    PersonalInfo, 
    Education, 
    WorkExperience, 
    ProjectDetails, 
    SkillGroup, 
    Achievement, 
    Language, 
    Certification, 
    Publication, 
    Extracurricular
)

class BaseResponse(BaseModel):
    """Base response model for all API responses"""
    success: bool
    message: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class ErrorResponse(BaseResponse):
    """Error response model"""
    error_code: Optional[str] = None
    error_details: Optional[Dict[str, Any]] = None

# Resume-specific Response Models
class ResumeMetadata(BaseModel):
    """Resume metadata for response"""
    resume_name: Optional[str] = None
    is_primary: bool
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class DateRange(BaseModel):
    """Date range model for projects and experiences"""
    start: Optional[str] = None
    end: Optional[str] = None

class ProjectDetailsResponse(BaseModel):
    """Project details response model"""
    title: str
    description: Optional[str] = None
    project_link: Optional[str] = None
    date: DateRange = Field(default_factory=DateRange)
    location: Optional[str] = None
    organization: Optional[str] = None
    bullet_points: List[str] = Field(default_factory=list)
    technologies_used: List[str] = Field(default_factory=list)

class EducationResponse(BaseModel):
    """Education response model"""
    institute_name: Optional[str] = None
    degree: Optional[str] = None
    specialisation: Optional[str] = None
    dates: DateRange = Field(default_factory=DateRange)
    location: Optional[str] = None
    gpa: Optional[str] = None
    relevant_coursework: List[str] = Field(default_factory=list)

class WorkExperienceResponse(BaseModel):
    """Work experience response model"""
    company_name: Optional[str] = None
    job_title: Optional[str] = None
    dates: DateRange = Field(default_factory=DateRange)
    location: Optional[str] = None
    bullet_points: List[str] = Field(default_factory=list)

class SkillGroupResponse(BaseModel):
    """Skill group response model"""
    skill_group: str
    skills: List[str]

class AchievementResponse(BaseModel):
    """Achievement response model"""
    title: str
    description: Optional[str] = None
    date_achieved: Optional[date] = None
    organization: Optional[str] = None

class LanguageResponse(BaseModel):
    """Language response model"""
    language: Optional[str] = None
    proficiency: Optional[str] = None

class CertificationResponse(BaseModel):
    """Certification response model"""
    certification_name: Optional[str] = None
    description: Optional[str] = None

class PublicationResponse(BaseModel):
    """Publication response model"""
    publication_name: Optional[str] = None
    authors: List[str] = Field(default_factory=list)
    description: Optional[str] = None

class ExtracurricularResponse(BaseModel):
    """Extracurricular response model"""
    organization_name: Optional[str] = None
    title: Optional[str] = None
    dates: DateRange = Field(default_factory=DateRange)
    bullet_points: List[str] = Field(default_factory=list)

class NLPAnalysis(BaseModel):
    """NLP analysis results"""
    word_count: int
    entities: List[str] = Field(default_factory=list)
    keywords: List[str] = Field(default_factory=list)
    role_match_score: float
    role_matched: str

class TechnicalSkillGroup(BaseModel):
    """Technical skill group for analyzer"""
    group_name: str
    skills: List[str]

class SoftSkillGroup(BaseModel):
    """Soft skill group for analyzer"""
    group_name: str
    skills: List[str]

class ResumeAnalyzer(BaseModel):
    """Resume analyzer results"""
    ats_score: float
    job_match_score: float
    skill_match_percent: float
    technical_skills: List[TechnicalSkillGroup] = Field(default_factory=list)
    soft_skills: List[SoftSkillGroup] = Field(default_factory=list)
    matched_skills: List[str] = Field(default_factory=list)
    missing_skills: List[str] = Field(default_factory=list)
    nlp_analysis: NLPAnalysis
    llm_analysis: str

class ResumeDetails(BaseModel):
    """Complete resume details"""
    personal_info: Optional[PersonalInfo] = None
    educations: List[EducationResponse] = Field(default_factory=list)
    work_experiences: List[WorkExperienceResponse] = Field(default_factory=list)
    projects: List[ProjectDetailsResponse] = Field(default_factory=list)
    skills: List[SkillGroupResponse] = Field(default_factory=list)
    achievements: List[AchievementResponse] = Field(default_factory=list)
    certifications: List[CertificationResponse] = Field(default_factory=list)
    languages: List[LanguageResponse] = Field(default_factory=list)
    publications: List[PublicationResponse] = Field(default_factory=list)
    extracurriculars: List[ExtracurricularResponse] = Field(default_factory=list)

class ResumeAnalysisResult(BaseModel):
    """Resume analysis result containing details and analyzer results"""
    resume_details: Optional[ResumeDetails] = None
    resume_analyzer: Optional[ResumeAnalyzer] = None

class ResumeAnalysisResponse(BaseResponse):
    """Complete resume analysis response"""
    resume_metadata: Optional[ResumeMetadata] = None
    result: Optional[ResumeAnalysisResult] = None

class ResumeDetailsResponse(BaseResponse):
    '''Complete resume details'''
    resume_metadata: Optional[ResumeMetadata] = None
    resume_details: Optional[ResumeDetails] = None
    
# Utility functions for conversion
def convert_date_to_string(date_obj: Optional[date]) -> Optional[str]:
    """Convert date object to string format"""
    if date_obj is None:
        return None
    return date_obj.strftime("%b. %Y") if isinstance(date_obj, date) else str(date_obj)

def create_date_range(start_date: Optional[date], end_date: Optional[date]) -> DateRange:
    """Create DateRange object from start and end dates"""
    return DateRange(
        start=convert_date_to_string(start_date),
        end=convert_date_to_string(end_date)
    )

def convert_education_to_response(education: Education) -> EducationResponse:
    """Convert Education model to EducationResponse"""
    return EducationResponse(
        institute_name=education.institute_name,
        degree=education.degree,
        specialisation=education.specialisation,
        dates=create_date_range(education.start_date, education.end_date),
        location=education.location,
        gpa=str(education.gpa) if education.gpa else None,
        relevant_coursework=education.relevant_coursework
    )

def convert_work_experience_to_response(work_exp: WorkExperience) -> WorkExperienceResponse:
    """Convert WorkExperience model to WorkExperienceResponse"""
    return WorkExperienceResponse(
        company_name=work_exp.company_name,
        job_title=work_exp.job_title,
        dates=create_date_range(work_exp.start_date, work_exp.end_date),
        location=work_exp.location,
        bullet_points=work_exp.bullet_points
    )

def convert_project_to_response(project: ProjectDetails) -> ProjectDetailsResponse:
    """Convert ProjectDetails model to ProjectDetailsResponse"""
    return ProjectDetailsResponse(
        title=project.title,
        description=project.description,
        project_link=project.project_link,
        date=create_date_range(project.start_date, project.end_date),
        location=project.location,
        organization=project.organization,
        bullet_points=project.bullet_points,
        technologies_used=project.technologies_used
    )

def convert_skill_group_to_response(skill_group: SkillGroup) -> SkillGroupResponse:
    """Convert SkillGroup model to SkillGroupResponse"""
    return SkillGroupResponse(
        skill_group=skill_group.group_name,
        skills=skill_group.skills
    )

def convert_achievement_to_response(achievement: Achievement) -> AchievementResponse:
    """Convert Achievement model to AchievementResponse"""
    return AchievementResponse(
        title=achievement.title,
        description=achievement.description,
        date_achieved=achievement.date_achieved,
        organization=achievement.organization
    )

def convert_language_to_response(language: Language) -> LanguageResponse:
    """Convert Langauge model to LanguageResponse"""
    return LanguageResponse(
        language=language.language,
        proficiency=language.proficiency
    )

def convert_certification_to_response(certification: Certification) -> CertificationResponse:
    """Convert Certification model to CertificationResponse"""
    return CertificationResponse(
        certification_name=certification.certification_name,
        description=certification.description
    )

def convert_publication_to_response(publication: Publication) -> PublicationResponse:
    """Convert Publication model to PublicationResponse"""
    return PublicationResponse(
        publication_name=publication.publication_name,
        authors=publication.authors,
        description=publication.description
    )

def convert_extracurricular_to_response(extracurricular: Extracurricular) -> ExtracurricularResponse:
    """Convert Extracurricular model to ExtracurricularResponse"""
    return ExtracurricularResponse(
        organization_name=extracurricular.organization_name,
        title=extracurricular.title,
        dates=create_date_range(extracurricular.start_date, extracurricular.end_date),
        bullet_points=extracurricular.bullet_points
    )

# Additional Response Models for other APIs (Examples)
class ListResponse(BaseResponse):
    """Generic list response for paginated data"""
    data: List[Any]
    total_count: int
    page: int = 1
    page_size: int = 10
    total_pages: int = 1

class CreatedResponse(BaseResponse):
    """Response for create operations"""
    created_id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class UpdatedResponse(BaseResponse):
    """Response for update operations"""
    updated_id: str
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class DeletedResponse(BaseResponse):
    """Response for delete operations"""
    deleted_id: str
    deleted_at: datetime = Field(default_factory=datetime.utcnow)

class ValidationErrorResponse(ErrorResponse):
    """Validation error response"""
    validation_errors: Dict[str, List[str]]

# Example usage function
def create_resume_analysis_response(
    success: bool,
    message: str,
    resume_metadata: ResumeMetadata,
    resume_details: ResumeDetails,
    resume_analyzer: ResumeAnalyzer
) -> ResumeAnalysisResponse:
    """Create a complete resume analysis response"""
    return ResumeAnalysisResponse(
        success=success,
        message=message,
        resume_metadata=resume_metadata,
        result=ResumeAnalysisResult(
            resume_details=resume_details,
            resume_analyzer=resume_analyzer
        )
    )