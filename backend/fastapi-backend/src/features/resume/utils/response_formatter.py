import logging
from typing import Optional, Dict, List, Any
import uuid
from datetime import datetime
from features.resume.schemas import (
    ResumeMetadata, ResumeAnalysisResponse, ResumeDetails, ResumeAnalyzer, ResumeAnalysisResult,
    ResumeDetailsResponse
)
logger = logging.getLogger(__name__)

class ResponseFormatter:
    """Formats resume analysis results into structured JSON response"""
    
    def __init__(self, logger: logging.Logger):
        # logger = logger
        pass
    
    def format_analyse_api_response(self, resume_metadata: Dict[str, any], resume_details: Dict[str, any], resume_analyzer: Dict[str, any]) -> ResumeAnalysisResponse:
        '''
        '''
        
        resume_analyzer = ResumeAnalyzer(**resume_analyzer)
        resume_metadata = ResumeMetadata(**resume_metadata)
        resume_details = ResumeDetails(**resume_details)
        
        return self._format_resume_analysis_response(
            success=True,
            message="Successfully analysed resume and update the resume in database",
            resume_metadata=resume_metadata,
            resume_details=resume_details,
            resume_analyzer=resume_analyzer
        )
        
    def format_resume_detail_api_response(self, resume_metadata: Dict[str, any], resume_details: Dict[str, any]) -> ResumeDetailsResponse:
        '''
        '''

        resume_metadata = ResumeMetadata(**resume_metadata)
        resume_details = ResumeDetails(**resume_details)
        
        return ResumeDetailsResponse(
            success=True,
            message="Successfully analysed resume and update the resume in database",
            resume_metadata=resume_metadata,
            resume_details=resume_details,
        )

    def save_resume_to_database(user_id: str, resume_details: Dict[str, any]):
        try:
            pass
        except Exception as e:
            logger.error(f"Error saving resume to database, {str(e)}")

    def _format_resume_analysis_response(
        self,
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
    def _format_summary_section(self, summary_content: List[str]) -> Dict[str, Any]:
        """Format summary section"""
        summary_text = " ".join(summary_content[:3]) if summary_content else "Professional summary not found in resume."
        
        return {
            "itemId": f"{str(uuid.uuid4())}_summary",
            "diagnoseResultList": [],
            "itemUid": str(uuid.uuid4()),
            "summary": summary_text
        }
    
    def _format_education_section(self, education_content: List[str], tech_skills: List[str]) -> Dict[str, Any]:
        """Format education section"""
        education_details = []
        
        if education_content:
            education_details.append({
                "itemId": f"{str(uuid.uuid4())}_education_0",
                "diagnoseResultList": [],
                "itemUid": str(uuid.uuid4()),
                "organization": "Education details extracted from resume",
                "accreditation": " ".join(education_content[:2]),
                "location": None,
                "dates": {
                    "startDate": "",
                    "completionDate": "",
                    "isCurrent": False
                },
                "awards": None,
                "gpa": None,
                "courses": tech_skills[:5] if tech_skills else [],
                "achievements": []
            })
        
        return {
            "itemId": f"{str(uuid.uuid4())}_education",
            "diagnoseResultList": [],
            "itemUid": str(uuid.uuid4()),
            "educationDetails": education_details
        }
    
    def _format_work_experience_section(self, work_content: List[str], target_role: str) -> Dict[str, Any]:
        """Format work experience section"""
        work_details = []
        
        if work_content:
            work_details.append({
                "itemId": f"{str(uuid.uuid4())}_workExperience_0",
                "diagnoseResultList": [],
                "itemUid": str(uuid.uuid4()),
                "organization": "Work Experience",
                "position": target_role,
                "description": " ".join(work_content[:3]),
                "dates": {
                    "startDate": "",
                    "completionDate": "",
                    "isCurrent": False
                },
                "location": None
            })
        
        return {
            "itemId": f"{str(uuid.uuid4())}_workExperience",
            "diagnoseResultList": [],
            "itemUid": str(uuid.uuid4()),
            "workExperienceDetails": work_details
        }
    
    def _format_skills_section(
        self, 
        tech_skills: List[str], 
        soft_skills: List[str], 
        matched_skills: List[str], 
        missing_skills: List[str]
    ) -> Dict[str, Any]:
        """Format skills section"""
        return {
            "itemId": f"{str(uuid.uuid4())}_skills",
            "diagnoseResultList": [],
            "itemUid": str(uuid.uuid4()),
            "skills": {
                "Technical Skills": tech_skills[:10],
                "Soft Skills": soft_skills[:5],
                "Matched Skills": matched_skills,
                "Missing Skills": missing_skills
            }
        }
    
    def _format_projects_section(self, projects_content: List[str]) -> Dict[str, Any]:
        """Format projects section"""
        project_details = []
        
        for i, project in enumerate(projects_content[:3]):
            project_details.append({
                "itemId": f"{str(uuid.uuid4())}_projects_{i}",
                "diagnoseResultList": [],
                "itemUid": str(uuid.uuid4()),
                "name": f"Project {i + 1}",
                "contents": [project.strip()],
                "dates": {
                    "startDate": "",
                    "completionDate": "",
                    "isCurrent": False
                },
                "organization": None,
                "location": None,
                "projectLink": None,
                "projectLinkText": None
            })
        
        return {
            "itemId": f"{str(uuid.uuid4())}_projects",
            "diagnoseResultList": [],
            "itemUid": str(uuid.uuid4()),
            "projectDetails": project_details
        }
    
    def _format_certifications_section(self, certifications_content: List[str]) -> Dict[str, Any]:
        """Format certifications section"""
        certification_details = []
        
        for i, cert in enumerate(certifications_content[:3]):
            certification_details.append({
                "itemId": f"{str(uuid.uuid4())}_certifications_{i}",
                "diagnoseResultList": [],
                "itemUid": str(uuid.uuid4()),
                "name": cert.strip(),
                "organization": "Certification Authority",
                "dates": {
                    "startDate": "",
                    "completionDate": "",
                    "isCurrent": False
                }
            })
        
        return {
            "itemId": f"{str(uuid.uuid4())}_certifications",
            "diagnoseResultList": [],
            "itemUid": str(uuid.uuid4()),
            "certificationDetails": certification_details
        }
    
    def _format_achievements_section(self, achievements_content: List[str]) -> Dict[str, Any]:
        """Format achievements section"""
        achievement_details = []
        
        for i, achievement in enumerate(achievements_content[:3]):
            achievement_details.append({
                "itemId": f"{str(uuid.uuid4())}_achievements_{i}",
                "diagnoseResultList": [],
                "itemUid": str(uuid.uuid4()),
                "name": None,
                "description": achievement.strip()
            })
        
        return {
            "itemId": f"{str(uuid.uuid4())}_achievements",
            "diagnoseResultList": [],
            "itemUid": str(uuid.uuid4()),
            "achievementDetails": achievement_details
        }
    
    def _calculate_ranking(self, score: int) -> str:
        """Calculate overall ranking based on score"""
        if score >= 80:
            return "A"
        elif score >= 60:
            return "B"
        else:
            return "C"
    
    def _calculate_total_issues(self, score: int, missing_skills: List[str]) -> Dict[str, int]:
        """Calculate total issues based on score and missing skills"""
        return {
            "Urgent": 1 if score < 60 else 0,
            "Optional": 1 if len(missing_skills) > 5 else 0,
            "Critical": 1 if score < 40 else 0
        }
    
    def _get_section_list(self) -> List[Dict[str, str]]:
        """Get list of resume sections"""
        return [
            {"type": "personalInfo", "name": "Personal Info"},
            {"type": "summary", "name": "Summary"},
            {"type": "workExperience", "name": "Work Experience"},
            {"type": "education", "name": "Education"},
            {"type": "skills", "name": "Skills"},
            {"type": "projects", "name": "Projects"},
            {"type": "achievements", "name": "Achievements"}
        ]
    
    def _get_section_layout(self) -> List[Dict[str, Any]]:
        """Get section layout configuration"""
        return [
            {"section": 1, "name": "Personal Info"},
            {"section": 2, "name": "Summary"},
            {"section": 3, "name": "Work Experience"},
            {"section": 4, "name": "Education"},
            {"section": 5, "name": "Skills"},
            {"section": 6, "name": "Projects"},
            {"section": 7, "name": "Achievements"}
        ]
