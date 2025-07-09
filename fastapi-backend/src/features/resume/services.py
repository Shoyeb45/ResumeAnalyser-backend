import logging
from fastapi import HTTPException, BackgroundTasks, status
from features.resume.utils.utils import (
    AIAnalyzer, TextExtractor, NLPAnalyzer, PersonalInfoExtractor,
    SectionExtractor, SkillsAnalyzer, JobMatchCalculator, ResponseFormatter, ResumeDetailsExtractor
)
from features.resume.repository import resume_repository

from typing import Any, Dict, Optional, List, Tuple
from datetime import datetime
# from features.resume.schemas import (
#      NLPAnalysis, ResumeDetails, PersonalInfo
# )
''' Module which handles core business logic of the application
'''

logger = logging.getLogger(__name__)

class ResumeAnalyzer:
    """
    Main Resume Analyzer class that orchestrates all analysis components
    
    This class serves as the main interface for resume analysis functionality
    and can be easily integrated into FastAPI applications.
    """
    
    def __init__(self):
        """Initialize the Resume Analyzer with all required components"""
        # Setup logging
        logger.info("Initializing Resume Analyzer")
        
        # Initialize all components
        self.text_extractor = TextExtractor(logger)
        self.nlp_analyzer = NLPAnalyzer(logger)
        self.personal_info_extractor = PersonalInfoExtractor(self.nlp_analyzer, logger)
        self.section_extractor = SectionExtractor(logger)
        self.skills_analyzer = SkillsAnalyzer(logger)
        self.job_match_calculator = JobMatchCalculator(logger)
        self.ai_analyzer = AIAnalyzer(logger)
        self.resume_details_extractor = ResumeDetailsExtractor(logger)
        self.response_formatter = ResponseFormatter(logger)
        
        logger.info("Resume Analyzer initialized successfully")
    
    
    def analyze_resume(
        self, 
        background_tasks: BackgroundTasks,
        user_id: str,
        file_path: str, 
        file_type: str, 
        target_role: str = "Software Engineer",
        job_description: str = ""
    ) -> Any:
        """
        Perform comprehensive resume analysis
        
        This is the main method that orchestrates the entire analysis process.
        Perfect for FastAPI endpoint integration.
        
        Args:
            file_path (str): Path to the resume file
            file_type (str): Type of file (pdf, docx, txt)
            target_role (str): Target job role for analysis
            job_description (str): Job description for matching (optional)
            
        Returns:
            Dict[str, Any]: Comprehensive analysis results in structured format
        """
        try:
            logger.info(f"Starting resume analysis for {file_type} file: {file_path}")
            
            # Step 1: Extract text from file
            logger.info("Step 1: Extracting text from file")
            resume_text = self.text_extractor.extract_text_from_file(file_path, file_type)
            
            # Step 2: Extract personal information
            logger.info("Step 2: Extracting resume information")
            resume_details = self.resume_details_extractor.get_resume_details(text=resume_text)
            # personal_info = self.personal_info_extractor.extract_personal_info(resume_text)
            
            # Step 3: Perform NLP analysis
            logger.info("Step 3: Performing NLP analysis")
            nlp_analysis = self.nlp_analyzer.analyze_text_with_nlp(resume_text, target_role)
            
            # Step 4: Analyze skills
            logger.info("Step 4: Analyzing skills")
            tech_skills, soft_skills = self.skills_analyzer.detect_skills_by_groups(resume_text)
            
            # Step 5: Match skills with job description
            logger.info("Step 5: Matching skills with job description")
            matched_skills, missing_skills, skill_match_percent = \
                self.skills_analyzer.match_skills_with_job_description(resume_text, job_description)
            
            # Step 6: Calculate job match score
            logger.info("Step 6: Calculating job match score")
            job_match_score = self.job_match_calculator.calculate_cosine_similarity_score(
                resume_text, job_description
            )
            
            # Step 7: Get AI analysis and scoring
            logger.info("Step 7: Getting AI analysis and scoring")
            overall_resume_analysis = self.ai_analyzer.get_llm_analysis(
                resume_text, target_role, job_description, matched_skills, missing_skills
            )
            ats_score = self.ai_analyzer.compute_resume_score(
                resume_text, target_role, job_description
            )
            
            logger.info("Step 8: Getting section wise analysis")
            section_analysis = self.ai_analyzer.get_section_wise_analysis(text=resume_text, target_role=target_role, job_description=job_description)
            
            # Step 8: Format response in proper format
            logger.info("Step 9: Formatting results for better response")
            print(file_path)
            
            # Step 9: Update database in background
            logger.info("Step 10: Updating database in background")
            resume_metadata = {
                "resume_name": file_path.split(".")[0].split("\\")[1],
                "is_primary": True,
            }
            
            resume_details_for_db = resume_details.get("resume_details", resume_details) if resume_details else {}
            
            background_tasks.add_task(
                resume_repository.create_resume,
                user_id,
                resume_metadata,
                resume_details_for_db
            )
            
            
            llm_analysis = {
                "overall_analysis": overall_resume_analysis,
                "section_wise_analysis": section_analysis
            }
            
            resume_analysis = {
                "ats_score": ats_score,
                "job_match_score": job_match_score,
                "skill_match_percent": skill_match_percent,
                "technical_skills": tech_skills,
                "soft_skills": soft_skills,
                "matched_skills": matched_skills,
                "missing_skills": missing_skills,
                "nlp_analysis": nlp_analysis,
                "llm_analysis": llm_analysis
            }
            
            if resume_details:
                resume_details = resume_details["resume_details"]
          
            response = {
                "success": True,
                "message": "Successfully analysed resume and update the resume in database",
                "resume_metadata": resume_metadata, 
                "resume_analysis": resume_analysis
            }

            logger.info("Resume analysis completed successfully")
            return response
            
        except Exception as e:
            logger.error(f"Error in resume analysis: {e}")
            return {
                "success": False,
                "errorCode": 50000,
                "errorMsg": f"Resume analysis failed: {str(e)}",
                "result": None
            }
    
    
    def get_project_enhanced_description(
        self,
        project_name: str,
        tech_stack: str,
        description: Optional[str] = None
    ):
        try:
            logger.info("Sent all project details to llm for generating description")
            response = self.ai_analyzer.generate_project_section_description(project_name, tech_stack, description)
            return {
                "success": True,
                "message": "Succesfully generated description for project section",
                "description": response,
            }
        except Exception as e:
            logger.error(f"Error while generating project description, error message: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detils=f"Error while generating project description, error message: {str(e)}"
            )

        
    def get_experience_enhanced_description(
        self,
        organisation_name: str, 
        position: str, 
        location: str, 
        description: Optional[str] = None
    ):
        try:
            logger.info("Sent all experience details to llm for generating description")
            response = self.ai_analyzer.generate_experience_section_description(organisation_name, position, location, description)
            return {
                "success": True,
                "message": "Succesfully generated description for experience",
                "description": response,
            }
        except Exception as e:
            logger.error(f"Error while generating experience description, error message: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detils=f"Error while generating experience description, error message: {str(e)}"
            )
            
    def get_extracurricular_enhanced_description(
        self,
        organisation_name: str, 
        position: str, 
        location: str, 
        description: Optional[str] = None
    ):
        try:
            logger.info("Sent all extracurricular details to llm for generating description")
            response = self.ai_analyzer.generate_extracurricular_section_description(organisation_name, position, location, description)
            return {
                "success": True,
                "message": "Succesfully generated description for extracurricular",
                "description": response,
            }
        except Exception as e:
            logger.error(f"Error while generating extracurricular description, error message: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detils=f"Error while generating extracurricular description, error message: {str(e)}"
            )
        
    def improve_resume_section(
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
            section_name (str): Name of the section to improve
            target_role (str): Target job role
            job_description (str): Job description (optional)
            
        Returns:
            str: AI-improved section content
        """
        try:
            logger.info(f"Improving {section_name} section")
            return self.ai_analyzer.improve_section_with_ai(
                section_text, section_name, target_role, job_description
            )
        except Exception as e:
            logger.error(f"Error improving section: {e}")
            return f"Error improving section: {str(e)}"
    
    def generate_optimized_resume(
        self, 
        file_path: str, 
        file_type: str, 
        target_role: str,
        job_description: str = ""
    ) -> str:
        """
        Generate a complete AI-optimized resume
        
        Args:
            file_path (str): Path to the original resume file
            file_type (str): Type of file (pdf, docx, txt)
            target_role (str): Target job role
            job_description (str): Job description (optional)
            
        Returns:
            str: AI-generated optimized resume
        """
        try:
            logger.info("Generating AI-optimized resume")
            
            # Extract text and sections
            resume_text = self.text_extractor.extract_text_from_file(file_path, file_type)
            sections = self.section_extractor.extract_sections(resume_text)
            
            # Generate optimized resume
            return self.ai_analyzer.generate_ai_resume(sections, target_role, job_description)
            
        except Exception as e:
            logger.error(f"Error generating optimized resume: {e}")
            return f"Error generating resume: {str(e)}"
    
    def get_health_status(self) -> Dict[str, Any]:
        """
        Get health status of all components
        
        Useful for FastAPI health check endpoints
        
        Returns:
            Dict[str, Any]: Health status of all components
        """
        return {
            "status": "healthy",
            "components": {
                "text_extractor": "ready",
                "nlp_analyzer": "ready" if self.nlp_analyzer.nlp_model else "unavailable",
                "ai_analyzer": "ready" if self.ai_analyzer.groq_client else "unavailable",
                "classifier": "ready" if self.nlp_analyzer.classifier else "unavailable"
            },
            "version": "1.0.0",
            "timestamp": datetime.now().isoformat()
        }
        
    def generate_skill_assessment_questions(self, soft_skills: str, technical_skills: str):
        try:
            questions = self.ai_analyzer.get_mcq_for_skill_assessment(soft_skills=soft_skills, technical_skills=technical_skills)
            
            if questions is None:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Failed to generate MCQ question"
                )
            
            result = {
                "success": True,
                "message": "Succesfully generated 10 questions",
                "questions": questions["questions"]
            }
            return result
        except Exception as e:
            logger.error(f"Failed to generate MCQ question based on skills provided, error : {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to generate MCQ question based on skills provided, error : {str(e)}"
            )


    def analyse_assessment_score(self, skills: List):
        try:
            logger.info("Finding socres based on the input")
            overall_score, skill_scores = self.calculate_scores(skills=skills)
            
            suggestions = self.ai_analyzer.get_career_suggestions_based_on_score(skill_scores=skill_scores, overall_score=overall_score)
            return {
                "status": True,
                "message": "Succesfully analyzed the result and provided career suggestion",
                "overall_score": overall_score,
                "skill_wise_scores": skill_scores,
                "career_suggestions": suggestions
            }
        except Exception as e:
            logger.error(f"Failed to analyse assessment result, error: {str(e)}")
            raise e
        
        
    def calculate_scores(self, skills: List) -> Tuple[float, List]:
        """Method to calculate overall scores and skill wise scores
        <br>
        The score is calculated as : 
        
        (total_correct_question / total_questions) * 100
        
        Args:
        
            skills: List of an object which contains skill, total_question and number of correct question answered.
            
        Returns:
            
            Tuple where first member is overall score and second one is list of an object which contains name of the skill and score of the skill
        """
        skill_scores = []
        total_score = 0
        scored_skills_count = 0

        for item in skills:
            skill = item["skill"]
            total = item["total_questions"]
            correct = item["correct_questions"]

            if total == 0:
                score = None  # No questions answered for this skill
            else:
                score = round((correct / total) * 100, 2)
                total_score += score
                scored_skills_count += 1

            skill_scores.append({
                "skill": skill,
                "score": score
            })

        overall_score = round(total_score / scored_skills_count, 2) if scored_skills_count else 0.0

        return overall_score, skill_scores

    async def get_resume_details(self, background_tasks: BackgroundTasks, user_id: str, file_path: str) -> Dict[str, any]:
        try:
            if file_path is None:
                raise HTTPException(
                    status_code=500,
                    detail="Failed to extract details from resume, resume file not found"
                )
            
            logger.info("Step-1: extract the text from resume")
            text = self.text_extractor.extract_text_from_file(
                file_path=file_path, 
                file_type=file_path.split(".")[-1]
            )
                    
            logger.info("Step 2: Extracting resume information")
            resume_details = self.resume_details_extractor.get_resume_details(text) 
            
            if resume_details:
                resume_details = resume_details["resume_details"]
            
            
            resume_metadata =  {
                "resume_name": file_path.split(".")[0].split("\\")[1],
                "is_primary": True
            }
            
            logger.info(f"Adding background task for saving resume data for user with id {user_id} in database")
            background_tasks.add_task(
                resume_repository.create_resume,
                user_id,
                resume_metadata,
                resume_details
            )
          
            
            result = {
                "success": True,
                "message": "Successfully extracted details from resume and updated the resume in database",
                "resume_metadata": resume_metadata,
                "resume_details": resume_details
            }
            
            return result
        except Exception as e:
            logger.error(f"Error in resume details: {e}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to extract details from resume, {str(e)}"
            )
            

        
    
# Create a single instance and use it 
resume_analyzer = ResumeAnalyzer()