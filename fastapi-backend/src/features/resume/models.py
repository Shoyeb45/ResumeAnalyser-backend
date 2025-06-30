''' All models related to resume
'''


from beanie import Document, Link, PydanticObjectId
from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from datetime import datetime, date
from pymongo import IndexModel

# Embedded Models (for nested data within documents)

class ContactInfo(BaseModel):
    email: Optional[str] = None
    mobile: Optional[str] = None
    location: Optional[str] = None
    social_links: Optional[Dict[str, str]] = Field(default_factory=dict)  # {"linkedin": "url", "github": "url"}

class ProjectDetails(BaseModel):
    title: str
    description: Optional[str] = None
    project_link: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    location: Optional[str] = None
    organization: Optional[str] = None
    bullet_points: List[str] = Field(default_factory=list)
    technologies_used: List[str] = Field(default_factory=list)

class Education(BaseModel):
    institute_name: str
    degree: str  # "B.Tech", "B.Sc", "M.Tech", etc.
    major: Optional[str] = None  # Computer Science, Electronics, etc.
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    location: Optional[str] = None
    gpa: Optional[float] = None
    relevant_coursework: List[str] = Field(default_factory=list)

class SkillGroup(BaseModel):
    group_name: str  # "Programming Languages", "Databases", "Tools", etc.
    skills: List[str]

class Achievement(BaseModel):
    title: str
    description: Optional[str] = None
    date_achieved: Optional[date] = None
    organization: Optional[str] = None


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
    contact_info: Optional[ContactInfo] = None
    professional_summary: Optional[str] = None
    projects: List[ProjectDetails] = Field(default_factory=list)
    education: List[Education] = Field(default_factory=list)
    skills: List[SkillGroup] = Field(default_factory=list)
    achievements: List[Achievement] = Field(default_factory=list)
    
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