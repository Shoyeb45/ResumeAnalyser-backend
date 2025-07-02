import logging
from typing import Optional, Dict, List, Any
import uuid
from datetime import datetime

logger = logging.getLogger(__name__)


class ResponseFormatter:
    """Formats resume analysis results into structured JSON response"""
    
    def __init__(self, logger: logging.Logger):
        # logger = logger
        pass
    
    def format_structured_response(
        self,
        text: str,
        target_role: str,
        job_description: str = "",
        personal_info: Optional[Dict] = None,
        nlp_analysis: Optional[Dict] = None,
        sections: Optional[Dict] = None,
        tech_skills: Optional[List[str]] = None,
        soft_skills: Optional[List[str]] = None,
        matched_skills: Optional[List[str]] = None,
        missing_skills: Optional[List[str]] = None,
        resume_score: int = 75,
        job_match_score: float = 0.0,
        skill_match_percent: float = 0.0,
        llm_summary: str = ""
    ) -> Dict[str, Any]:
        """
        Format resume analysis into structured JSON response
        
        Args:
            text (str): Original resume text
            target_role (str): Target job role
            job_description (str): Job description (optional)
            personal_info (Optional[Dict]): Extracted personal information
            nlp_analysis (Optional[Dict]): NLP analysis results
            sections (Optional[Dict]): Extracted resume sections
            tech_skills (Optional[List[str]]): Technical skills found
            soft_skills (Optional[List[str]]): Soft skills found
            matched_skills (Optional[List[str]]): Skills matching job description
            missing_skills (Optional[List[str]]): Skills missing from resume
            resume_score (int): Overall resume score
            job_match_score (float): Job matching score
            skill_match_percent (float): Skill matching percentage
            llm_summary (str): AI-generated summary
            
        Returns:
            Dict[str, Any]: Structured response in API format
        """
        try:
            # Use provided data or defaults
            personal_info = personal_info or {}
            nlp_analysis = nlp_analysis or {}
            sections = sections or {}
            tech_skills = tech_skills or []
            soft_skills = soft_skills or []
            matched_skills = matched_skills or []
            missing_skills = missing_skills or []
            
            # Generate unique IDs for the response
            resume_id = str(uuid.uuid4().int)[:19]
            timestamp = int(datetime.now().timestamp() * 1000)
            
            # Determine overall ranking based on score
            overall_ranking = self._calculate_ranking(resume_score)
            
            # Calculate total issues
            total_issues = self._calculate_total_issues(resume_score, missing_skills)
            
            # Create structured response
            response = {
                "success": True,
                "errorCode": 10000,
                "errorMsg": None,
                "result": {
                    "resumeDiagnose": {
                        "personalInfo": self._format_personal_info(personal_info),
                        "summary": self._format_summary_section(sections.get("summary", [])),
                        "education": self._format_education_section(sections.get("education", []), tech_skills),
                        "workExperience": self._format_work_experience_section(
                            sections.get("workExperience", []), target_role
                        ),
                        "skills": self._format_skills_section(
                            tech_skills, soft_skills, matched_skills, missing_skills
                        ),
                        "projects": self._format_projects_section(sections.get("projects", [])),
                        "certifications": self._format_certifications_section(sections.get("certifications", [])),
                        "achievements": self._format_achievements_section(sections.get("achievements", [])),
                        "overallRanking": overall_ranking,
                        "lastOverallRanking": None,
                        "lastDiagnoseTimestamp": timestamp,
                        "totalIssues": total_issues,
                        "sections": self._get_section_list(),
                        "resumeId": resume_id
                    },
                    "resumeName": f"Resume_Analysis_{target_role.replace(' ', '_')}",
                    "sectionLayout": self._get_section_layout(),
                    "showGuidance": False,
                    "mocking": False,
                    "primary": True,
                    "resumeId": resume_id,
                    "targetJobTitle": target_role,
                    "analysis": {
                        "resumeScore": resume_score,
                        "jobMatchScore": job_match_score,
                        "skillMatchPercent": skill_match_percent,
                        "technicalSkills": tech_skills,
                        "softSkills": soft_skills,
                        "matchedSkills": matched_skills,
                        "missingSkills": missing_skills,
                        "nlpAnalysis": nlp_analysis,
                        "llmSummary": llm_summary
                    }
                }
            }
            
            logger.info("Successfully formatted structured response")
            return response
            
        except Exception as e:
            logger.error(f"Error formatting structured response: {e}")
            return {
                "success": False,
                "errorCode": 50000,
                "errorMsg": str(e),
                "result": None
            }
    
    def _format_personal_info(self, personal_info: Dict) -> Dict[str, Any]:
        """Format personal information section"""
        return {
            "itemId": f"{str(uuid.uuid4())}_personalInfo",
            "diagnoseResultList": [],
            "itemUid": str(uuid.uuid4()),
            "name": personal_info.get("name", "Not Found"),
            "email": personal_info.get("email", "Not Found"),
            "phoneNumber": personal_info.get("phoneNumber", "Not Found"),
            "location": personal_info.get("location", "Not Found"),
            "linkedin": personal_info.get("linkedinLink"),
            "githubUrl": "GitHub" if personal_info.get("githubUrl") else None,
            "personalSite": None,
            "linkedinLink": personal_info.get("linkedinLink"),
            "githubUrlLink": personal_info.get("githubUrl"),
            "personalSiteLink": None
        }
    
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
