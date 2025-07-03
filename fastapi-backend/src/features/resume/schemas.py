from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from .models import (  # Import your existing models
    Resume, ContactInfo, ProjectDetails, Education, SkillGroup, 
    Achievement, Langauge, Certification, WorkExperience, 
    Publication, Extracurricular
)
from typing import Optional
from fastapi import UploadFile, File

class ResumeAnalysisRequest(BaseModel):
    '''Request model of resume analysis endpoint
    '''
    resume_file: UploadFile = File(...)
    job_description: Optional[str] = None
    job_title: Optional[str] = None
    target_role: Optional[str] = None
    



class PersonalInfo(BaseModel):
    """Combines name with contact info for API responses"""
    contact_info: ContactInfo
    professional_summary: Optional[str] = None

class NLPAnalysis(BaseModel):
    """NLP analysis results"""
    word_count: int
    entities: List[List[str]]  # [[entity, type], ...]
    keywords: List[str]
    role_match_score: float
    role_matched: str

class ResumeAnalysis(BaseModel):
    """Resume analysis results"""
    ats_score: str
    job_match_score: str
    skill_match_percent: str
    technical_skills: List[str]
    soft_skills: List[str]
    matched_skills: List[str]
    missing_skills: List[str]
    nlp_analysis: NLPAnalysis
    llm_analysis: str

class ResumeMetadata(BaseModel):
    """Resume metadata for API responses"""
    resume_name: str
    is_primary: bool
    created_at: str  # ISO datetime string for API
    updated_at: str  # ISO datetime string for API

class ResumeDetails(BaseModel):
    """Complete resume details using your existing models"""
    personal_info: PersonalInfo
    projects: List[ProjectDetails] = Field(default_factory=list)
    education: List[Education] = Field(default_factory=list)
    skills: List[SkillGroup] = Field(default_factory=list)
    achievements: List[Achievement] = Field(default_factory=list)
    langauges: List[Langauge] = Field(default_factory=list)  # Keeping your typo
    certifications: List[Certification] = Field(default_factory=list)
    work_experiences: List[WorkExperience] = Field(default_factory=list)
    publications: List[Publication] = Field(default_factory=list)
    extracurriculars: List[Extracurricular] = Field(default_factory=list)

# Main API Response Schemas

class ResumeResult(BaseModel):
    """Combined resume details and analysis"""
    resume_details: ResumeDetails
    resume_analysis: ResumeAnalysis

class ResumeAnalysisResponse(BaseModel):
    """Main API response for resume analysis"""
    success: bool
    message: str
    resume_metadata: ResumeMetadata
    result: ResumeResult

# Alternative response schemas for different endpoints

class ResumeDetailsResponse(BaseModel):
    """Response for getting just resume details"""
    success: bool
    message: str
    resume_metadata: ResumeMetadata
    resume_details: ResumeDetails

class ResumeAnalysisOnlyResponse(BaseModel):
    """Response for getting just analysis results"""
    success: bool
    message: str
    resume_metadata: ResumeMetadata
    resume_analysis: ResumeAnalysis

class ResumeListItem(BaseModel):
    """Item for resume listing"""
    resume_metadata: ResumeMetadata
    personal_info: PersonalInfo

class ResumeListResponse(BaseModel):
    """Response for listing multiple resumes"""
    success: bool
    message: str
    resumes: List[ResumeListItem]

class ResumeComparisonResponse(BaseModel):
    """Response for comparing multiple resumes"""
    success: bool
    message: str
    resumes: List[ResumeResult]
    comparison_analysis: Optional[Dict[str, Any]] = None

# Utility functions to convert between your models and API response models

def resume_to_api_response(resume: Resume, analysis: ResumeAnalysis) -> ResumeAnalysisResponse:
    """Convert Resume document to API response format"""
    
    # Extract name from contact_info or use a default
    name = "Unknown"
    if resume.contact_info and hasattr(resume.contact_info, 'name'):
        name = resume.contact_info.name

    
    personal_info = PersonalInfo(
        contact_info=resume.contact_info or ContactInfo(),
        professional_summary=resume.professional_summary
    )
    
    resume_details = ResumeDetails(
        personal_info=personal_info,
        projects=resume.projects,
        education=resume.education,
        skills=resume.skills,
        achievements=resume.achievements,
        langauges=resume.langauges,
        certifications=resume.certifications,
        work_experiences=resume.work_experiences,
        publications=resume.publications,
        extracurriculars=resume.extracurriculars
    )
    
    resume_metadata = ResumeMetadata(
        resume_name=resume.resume_name,
        is_primary=resume.is_primary,
        created_at=resume.created_at.isoformat(),
        updated_at=resume.updated_at.isoformat()
    )
    
    return ResumeAnalysisResponse(
        success=True,
        message="Successfully retrieved resume analysis",
        resume_metadata=resume_metadata,
        result=ResumeResult(
            resume_details=resume_details,
            resume_analysis=analysis
        )
    )

def resume_to_details_response(resume: Resume) -> ResumeDetailsResponse:
    """Convert Resume document to details-only response"""
    
    name = "Unknown"
    if resume.contact_info and hasattr(resume.contact_info, 'name'):
        name = resume.contact_info.name
    
    personal_info = PersonalInfo(
        name=name,
        contact_info=resume.contact_info or ContactInfo(),
        professional_summary=resume.professional_summary
    )
    
    resume_details = ResumeDetails(
        personal_info=personal_info,
        projects=resume.projects,
        education=resume.education,
        skills=resume.skills,
        achievements=resume.achievements,
        langauges=resume.langauges,
        certifications=resume.certifications,
        work_experiences=resume.work_experiences,
        publications=resume.publications,
        extracurriculars=resume.extracurriculars
    )
    
    resume_metadata = ResumeMetadata(
        resume_name=resume.resume_name,
        is_primary=resume.is_primary,
        created_at=resume.created_at.isoformat(),
        updated_at=resume.updated_at.isoformat()
    )
    
    return ResumeDetailsResponse(
        success=True,
        message="Successfully retrieved resume details",
        resume_metadata=resume_metadata,
        resume_details=resume_details
    )

# Example usage in your FastAPI endpoints
"""
@app.post("/api/resume/analyze", response_model=ResumeAnalysisResponse)
async def analyze_resume(resume_id: str):
    resume = await Resume.get(resume_id)
    # Your analysis logic here
    analysis = ResumeAnalysis(...)  # Create analysis result
    
    return resume_to_api_response(resume, analysis)

@app.get("/api/resume/{resume_id}", response_model=ResumeDetailsResponse)
async def get_resume(resume_id: str):
    resume = await Resume.get(resume_id)
    return resume_to_details_response(resume)

@app.get("/api/resumes", response_model=ResumeListResponse)
async def list_resumes(user_id: str):
    resumes = await Resume.find(Resume.user_id == user_id).to_list()
    
    resume_items = []
    for resume in resumes:
        personal_info = PersonalInfo(
            name=extract_name_from_resume(resume),  # Your logic to extract name
            contact_info=resume.contact_info or ContactInfo(),
            professional_summary=resume.professional_summary
        )
        
        resume_items.append(ResumeListItem(
            resume_metadata=ResumeMetadata(
                resume_name=resume.resume_name,
                is_primary=resume.is_primary,
                created_at=resume.created_at.isoformat(),
                updated_at=resume.updated_at.isoformat()
            ),
            personal_info=personal_info
        ))
    
    return ResumeListResponse(
        success=True,
        message="Successfully retrieved resumes",
        resumes=resume_items
    )
"""