import logging
from features.resume.config import ResumeAnalyzerConfig
from typing import Tuple, List
from features.resume.schemas import SkillGroup
logger = logging.getLogger(__name__)

class SkillsAnalyzer:
    """Analyzes and matches skills from resume text"""
    
    def __init__(self, logger: logging.Logger):
        # self.logger = logger
        self.technical_skill_groups = ResumeAnalyzerConfig.TECHNICAL_SKILLS
        self.soft_skill_groups = ResumeAnalyzerConfig.SOFT_SKILLS
    
    def detect_skills_by_groups(self, text: str) -> Tuple[List[SkillGroup], List[SkillGroup]]:
        """
        Detect technical and soft skills from resume text, grouped by categories
        
        Args:
            text (str): Resume text to analyze
            
        Returns:
            Tuple[List[SkillGroup], List[SkillGroup]]: Technical skill groups and soft skill groups found
        """
        try:
            text_lower = text.lower()
            
            # Find technical skills by groups
            technical_groups = []
            for group_name, skills_list in self.technical_skill_groups.items():
                found_skills = [
                    skill for skill in skills_list 
                    if skill.lower() in text_lower
                ]
                if found_skills:  # Only add groups that have found skills
                    technical_groups.append(SkillGroup(
                        group_name=group_name,
                        skills=found_skills
                    ))
            
            # Find soft skills by groups
            soft_groups = []
            for group_name, skills_list in self.soft_skill_groups.items():
                found_skills = [
                    skill for skill in skills_list 
                    if skill.lower() in text_lower
                ]
                if found_skills:  # Only add groups that have found skills
                    soft_groups.append(SkillGroup(
                        group_name=group_name,
                        skills=found_skills
                    ))
            
            total_technical = sum(len(group.skills) for group in technical_groups)
            total_soft = sum(len(group.skills) for group in soft_groups)
            
            logger.info(f"Found {total_technical} technical skills in {len(technical_groups)} groups")
            logger.info(f"Found {total_soft} soft skills in {len(soft_groups)} groups")
            
            return technical_groups, soft_groups
            
        except Exception as e:
            logger.error(f"Error detecting grouped skills: {e}")
            return [], []
        
    def detect_skills(self, text: str) -> Tuple[List[str], List[str]]:
        """
        Detect technical and soft skills from resume text
        
        Args:
            text (str): Resume text to analyze
            
        Returns:
            Tuple[List[str], List[str]]: Technical skills and soft skills found
        """
        try:
            text_lower = text.lower()
            
            # Find technical skills
            found_technical = [
                skill for skill in self.technical_skill_groups 
                if skill.lower() in text_lower
            ]
            
            # Find soft skills
            found_soft = [
                skill for skill in self.soft_skill_groups
                if skill.lower() in text_lower
            ]
            
            logger.info(f"Found {len(found_technical)} technical skills and {len(found_soft)} soft skills")
            
            return found_technical, found_soft
            
        except Exception as e:
            logger.error(f"Error detecting skills: {e}")
            return [], []
    
    def match_skills_with_job_description(
        self, 
        resume_text: str, 
        job_description: str
    ) -> Tuple[List[str], List[str], float]:
        """
        Match resume skills with job description requirements
        
        Args:
            resume_text (str): Resume text
            job_description (str): Job description text
            
        Returns:
            Tuple[List[str], List[str], float]: Matched skills, missing skills, match percentage
        """
        try:
            if not job_description:
                return [], [], 0.0
            
            # Extract skills from resume and job description
            resume_tech_skills, _ = self.detect_skills(resume_text)
            jd_tech_skills, _ = self.detect_skills(job_description)
            
            # Find matched and missing skills
            matched_skills = list(set(resume_tech_skills) & set(jd_tech_skills))
            missing_skills = list(set(jd_tech_skills) - set(matched_skills))
            
            # Calculate match percentage
            if jd_tech_skills:
                match_percentage = round(len(matched_skills) / len(jd_tech_skills) * 100, 2)
            else:
                match_percentage = 0.0
            
            logger.info(f"Skill matching: {len(matched_skills)} matched, {len(missing_skills)} missing")
            
            return matched_skills, missing_skills, match_percentage
            
        except Exception as e:
            logger.error(f"Error matching skills: {e}")
            return [], [], 0.0
