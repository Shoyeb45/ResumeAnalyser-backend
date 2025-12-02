"""
Module which contains all the essential methods which involves communicating with AI and generate something
"""
import logging
from features.resume.config import ResumeAnalyzerConfig
from typing import Dict, Optional, List, Any
from features.resume.utils.ai_config import AIConfig
from features.resume.utils.resume_detail_extractor import ResumeDetailsExtractor
from features.resume.utils.prompt_creator import PromptCreator
logger = logging.getLogger(__name__)

class AIAnalyzer:
    """Handles AI-powered analysis using Groq LLM"""
    
    def __init__(self, logger: logging.Logger):
        self.llm_util = AIConfig()
        self.prompt_creator = PromptCreator()
    
   
    
    def get_llm_analysis(
        self, 
        text: str, 
        target_role: str, 
        job_description: str = ""
    ) -> Dict[str, Any]:
        """
        Get comprehensive LLM analysis of resume
        
        Args:
            text (str): Resume text
            target_role (str): Target job role
            job_description (str): Job description (optional)
            matched_skills (Optional[List[str]]): Skills that match job requirements
            missing_skills (Optional[List[str]]): Skills missing from resume
            
        Returns:
            str: AI-generated analysis and recommendations
        """
        try:

            
            # Create comprehensive prompt
            system_prompt, user_prompt = self.prompt_creator._create_analysis_prompt(
                text, target_role, job_description
            )
            
            
            analysis = self.llm_util.chat_with_openai(system_prompt, user_prompt)
            
            logger.info("Successfully generated LLM analysis")
            
            logger.info("Converting llm analysis to proper format")
            response = ResumeDetailsExtractor.parse_resume_with_json_extraction(response_text=analysis)
            
            return response
            
        except Exception as e:
            logger.error(f"Error getting LLM analysis: {e}")
            return f"Error generating analysis: {str(e)}"
    
    def get_mcq_for_skill_assessment(self, soft_skills: str, technical_skills: str) -> Dict[str, Any] | None:
        """Method to get MCQ questions based on provided soft skills and technical skills 

        Args:
            soft_skills (str): soft skills separated by comma
            technical_skills (str): techincal skills separated by comm 

        Raises:
            e: Exceptions

        Returns:
            Dict[str, Any] | None: _description_
        """
    
        try:
            system_prompt, user_prompt = self.prompt_creator._create_skill_assessment_prompt(technical_skills=technical_skills, soft_skills=soft_skills)
            response = self.llm_util.chat_with_openai(system_prompt, user_prompt)
            
            return ResumeDetailsExtractor.parse_resume_with_json_extraction(response)
        except Exception as e:
            logger.error(f"Failed to generate mcq's from llm, error: {str(e)}")
            raise e
  
    def get_section_wise_analysis(
        self,
        text: str,
        target_role: str,
        job_description: str
    ) -> Dict[str, Any]:
        """_summary_

        Args:
            text (str): extracted resume text
            target_role (str): target role for which user needs to analyze
            job_description (str): Job description of any job posting

        Returns:
            Dict[str, Any]: dictionary with section wise analysis
        """
        try:        
            system_prompt, user_prompt = self.prompt_creator._create_section_prompt(
                text, target_role, job_description
            )
            analysis = self.llm_util.chat_with_openai(system_prompt, user_prompt)
            logger.info("Successfully generated LLM analysis")
            
            return ResumeDetailsExtractor.parse_resume_with_json_extraction(analysis)
            
        except Exception as e:
            logger.info(f"Error getting LLM analysis: {str(e)}")
            raise e
    
    
    def get_resume_details(self, text: str) -> Optional[Dict[str, any]]:
        '''Method to extract the details of the resume in structured manner from reume
        
        Args:
            text: Extracted resume text
        
        Returns:
            dict: Python object with resume details 
        '''
        try:
            logger.info("Sent the text to LLM for getting structured output of the resume")
            
            system_prompt, user_prompt = self.prompt_creator._create_resume_parser_prompt(text)
            analysis = self.llm_util.chat_with_openai(system_prompt, user_prompt)
        
            # extracted_json = self.extract_json_from_response(analysis)
            return ResumeDetailsExtractor.parse_resume_with_json_extraction(analysis)
        except Exception as e:
            logger.error(f"Error getting resume details from llm: {str(e)}")
            return None
        
        
    def get_career_suggestions_based_on_score(self, skill_scores: List, overall_score: float) -> Dict[str, Any]:
        """Method to generate possible job role on the basis of the score and also strength and weakness

        Args:
            skill_scores (List): Skill wise score
            overall_score (float): Overall score

        Raises:
            e: exception

        Returns:
            dict: Dictionary containing all necessary information related to career suggestions
        """
        try:
            system_prompt, user_prompt = self.prompt_creator._create_career_suggestion_prompt(skill_scores=skill_scores, overall_score=overall_score)
            
            response = self.llm_util.chat_with_openai(system_prompt, user_prompt)            
            return ResumeDetailsExtractor.parse_resume_with_json_extraction(response)
        except Exception as e:
            logger.error(f"Failed to generate career suggestions, {str(e)}")
            raise e  


    def compute_resume_score(self, text: str, target_role: str, job_description: str = "") -> int:
        """
        Compute overall resume score using AI
        
        Args:
            text (str): Resume text
            target_role (str): Target job role
            job_description (str): Job description (optional)
            
        Returns:
            int: Resume score (0-100)
        """
        try:
      
            # Create scoring prompt
            system_prompt, user_prompt = self.prompt_creator._create_scoring_prompt(text, target_role, job_description)
            
           
            
            score_text = self.llm_util.chat_with_openai(system_prompt, user_prompt)
            
            return ResumeDetailsExtractor.parse_resume_with_json_extraction(score_text)
        except Exception as e:
            logger.error(f"Error computing resume score: {e}")
            return {
                'ats_score': None,
                'format_compliance': 0,
                'keyword_optimization': 0,
                'readability': 0    
            }
        
    def improve_section_with_ai(
        self, 
        section_text: str, 
        section_name: str, 
        target_role: str, 
        job_description: str = ""
    ) -> str:
        """
        Improve a specific resume section using AI
        
        Args:
            section_text (str): Original section content
            section_name (str): Name of the section
            target_role (str): Target job role
            job_description (str): Job description (optional)
            
        Returns:
            str: AI-improved section content
        """
        try:
         
            # Create improvement prompt
            system_prompt, user_prompt = self.prompt_creator._create_improvement_prompt(
                section_text, section_name, target_role, job_description
            )
           
            
            improved_content = self.llm_util.chat_with_openai(system_prompt, user_prompt)
            logger.info(f"Successfully improved {section_name} section")
            
            return improved_content
            
        except Exception as e:
            logger.error(f"Error improving section: {e}")
            return f"Error improving section: {str(e)}"
    
    def generate_ai_resume(
        self, 
        sections: Dict[str, List[str]], 
        target_role: str, 
        job_description: str = ""
    ) -> str:
        """
        Generate complete AI-optimized resume
        
        Args:
            sections (Dict[str, List[str]]): Extracted resume sections
            target_role (str): Target job role
            job_description (str): Job description (optional)
            
        Returns:
            str: AI-generated complete resume
        """
        try:
    
            # Prepare sections summary
            sections_summary = self._prepare_sections_summary(sections)
            
            # Create generation prompt
            system_prompt, user_prompt = self.prompt_creator._create_generation_prompt(sections_summary, target_role, job_description)
            
       
            
            generated_resume = self.llm_util.chat_with_openai(system_prompt, user_prompt)
            logger.info("Successfully generated AI-optimized resume")
            
            return generated_resume
            
        except Exception as e:
            logger.error(f"Error generating AI resume: {e}")
            return f"Error generating resume: {str(e)}"
    
    
    def generate_project_section_description(
        self,
        project_name: str,
        tech_stack: str,
        bullet_points: Optional[List[str]] = None
    ) -> str:
        """Method for generating suggestion for project section by providing existing points or creating new one

        Args:
            project_name (str): name of the project
            tech_stack (str): Tech stack used in project
            bullet_points (Optional[List[str]], optional): Bullet points that user have given in request. Defaults to None.

        Raises:
            e: exceptions

        Returns:
            str: String containing enhanced bullet points separted with `@`
        """
        try:
            system_prompt, user_prompt = self.prompt_creator._create_project_section_prompt(project_name, tech_stack, bullet_points)
            response = self.llm_util.chat_with_openai(system_prompt, user_prompt)
            return response
        except Exception as e:
            logger.error(f"Failed to generate project section description, error: {str(e)}")
            raise e
        
    def generate_experience_section_description(
        self,
        organisation_name: str, 
        position: str, 
        location: str, 
        bullet_points: Optional[List[str]] = None
    ) -> str:
        """Method for generating suggestion for experience section by providing existing points or creating new one

        Args:
            organisation_name (str): Name of the organisation where the candidate was working
            position (str): Position on which he was working
            location (str): Location of the orgnaisation
            bullet_points (Optional[List[str]], optional): Bullet points that user have given in request. Defaults to None.

        Raises:
            e: exceptions

        Returns:
            str:  String containing enhanced bullet points separted with `@`
        """
        try:
            system_prompt, user_prompt = self.prompt_creator._create_experience_section_prompt(organisation_name, position, location, bullet_points)
            response = self.llm_util.chat_with_openai(system_prompt, user_prompt)
            return response
        except Exception as e:
            logger.error(f"Failed to generate experience section description, error: {str(e)}")
            raise e
   
    def get_ats_score(self, resume_data: Dict[str, Any]) -> Dict[str, Any]:
        """Comprehensive analysis of resume to get ats score

        Args:
            resume_data (Dict[str, Any]): Extracted resume text

        Raises:
            e: exceptions

        Returns:
            Dict[str, Any]: Python dictionary which contains information regarding ats score and some other scores also.
        """
        try:
            system_prompt, user_prompt = self.prompt_creator._create_ats_prompt(resume_data)
            response = self.llm_util.chat_with_openai(system_prompt, user_prompt)
            return ResumeDetailsExtractor.parse_resume_with_json_extraction(response)
        except Exception as e:
            logger.error(f"Failed to get ATS score in ai_analyzer module, error: {str(e)}")
            raise e
            
    def generate_extracurricular_section_description(
        self,
        organisation_name: str, 
        position: str, 
        location: str, 
        bullet_points: Optional[List[str]] = None
    ) -> str:
        """Method for generating suggestion for extracurricular section by providing existing points or creating new one

        Args:
            organisation_name (str): Name of the organisation
            position (str): Position at which he did the activity
            location (str): Location of the extracurricular activity
            bullet_points (Optional[List[str]], optional): Bullet points that user have given in request . Defaults to None.

        Raises:
            e: exceptions

        Returns:
            str: String containing enhanced bullet points separted with `@`
        """
        try:
            system_prompt, user_prompt = self.prompt_creator._create_extracurricular_section_prompt(organisation_name, position, location, bullet_points)
            response = self.llm_util.chat_with_openai(system_prompt, user_prompt)
            return response
        except Exception as e:
            logger.error(f"Failed to generate experience section description, error: {str(e)}")
            raise e
        
    def _prepare_sections_summary(self, sections: Dict[str, List[str]]) -> str:
        """Prepare a summary of resume sections for AI processing"""
        sections_text = ""
        for section, content in sections.items():
            if content:
                sections_text += f"{section.title()}: {'; '.join(content[:3])}\n"
        return sections_text