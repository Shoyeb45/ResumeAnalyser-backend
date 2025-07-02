import logging
from features.resume.config import ResumeAnalyzerConfig
from typing import Dict, Optional, List
from groq import Groq

logger = logging.getLogger(__name__)

class AIAnalyzer:
    """Handles AI-powered analysis using Groq LLM"""
    
    def __init__(self, logger: logging.Logger):
        self.groq_client = self._initialize_groq_client()
        self.model = ResumeAnalyzerConfig.MODEL
    
    def _initialize_groq_client(self) -> Optional[Groq]:
        """
        Initialize Groq client for AI analysis
        
        Returns:
            Optional[Groq]: Groq client instance or None if initialization fails
        """
        try:
            client = Groq(api_key=ResumeAnalyzerConfig.GROQ_API_KEY)
            logger.info("Groq client initialized successfully")
            return client
        except Exception as e:
            logger.error(f"Error initializing Groq client: {e}")
            return None
    
    def get_llm_analysis(
        self, 
        text: str, 
        target_role: str, 
        job_description: str = "",
        matched_skills: Optional[List[str]] = None,
        missing_skills: Optional[List[str]] = None
    ) -> str:
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
            if not self.groq_client:
                return "LLM service not available. Please check API configuration."
            
            # Prepare skill information
            matched_str = ", ".join(matched_skills or [])
            missing_str = ", ".join(missing_skills or [])
            
            # Create comprehensive prompt
            prompt = self._create_analysis_prompt(
                text, target_role, job_description, matched_str, missing_str
            )
            
            # Get AI response
            response = self.groq_client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=800,
                temperature=0.7
            )
            
            analysis = response.choices[0].message.content.strip()
            logger.info("Successfully generated LLM analysis")
            
            return analysis
            
        except Exception as e:
            logger.error(f"Error getting LLM analysis: {e}")
            return f"Error generating analysis: {str(e)}"
    
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
            if not self.groq_client:
                return 75  # Default fallback score
            
            # Create scoring prompt
            prompt = self._create_scoring_prompt(text, target_role, job_description)
            
            # Get AI score
            response = self.groq_client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=10,
                temperature=0.3
            )
            
            score_text = response.choices[0].message.content.strip()
            
            # Parse and validate score
            try:
                score = int(score_text)
                score = max(0, min(100, score))  # Ensure score is between 0-100
                logger.info(f"AI-computed resume score: {score}")
                return score
            except ValueError:
                logger.warning(f"Could not parse AI score: {score_text}")
                return 75
                
        except Exception as e:
            logger.error(f"Error computing resume score: {e}")
            return 75
    
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
            if not self.groq_client:
                return "AI improvement service not available."
            
            # Create improvement prompt
            prompt = self._create_improvement_prompt(
                section_text, section_name, target_role, job_description
            )
            
            # Get AI response
            response = self.groq_client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=400,
                temperature=0.7
            )
            
            improved_content = response.choices[0].message.content.strip()
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
            if not self.groq_client:
                return "AI resume generation service not available."
            
            # Prepare sections summary
            sections_summary = self._prepare_sections_summary(sections)
            
            # Create generation prompt
            prompt = self._create_generation_prompt(sections_summary, target_role, job_description)
            
            # Get AI response
            response = self.groq_client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=1200,
                temperature=0.7
            )
            
            generated_resume = response.choices[0].message.content.strip()
            logger.info("Successfully generated AI-optimized resume")
            
            return generated_resume
            
        except Exception as e:
            logger.error(f"Error generating AI resume: {e}")
            return f"Error generating resume: {str(e)}"
    
    def _create_analysis_prompt(
        self, 
        text: str, 
        target_role: str, 
        job_description: str, 
        matched_skills: str, 
        missing_skills: str
    ) -> str:
        """Create prompt for resume analysis"""
        return f"""
You are a professional resume evaluation expert. Analyze this resume for the role: {target_role}

Job Description:
{job_description or "No specific job description provided"}

Resume Text:
{text[:3000]}  # Limit text to avoid token limits

Matched Skills: {matched_skills}
Missing Skills: {missing_skills}

Provide a comprehensive evaluation covering:
1. Overall Strengths
2. Areas for Improvement  
3. ATS Optimization Suggestions
4. Job Fit Assessment
5. Recommendation Score (1-100)

Keep response concise and actionable.
""".strip()
    
    def _create_scoring_prompt(self, text: str, target_role: str, job_description: str) -> str:
        """Create prompt for resume scoring"""
        return f"""
Rate this resume out of 100 for the role: {target_role}
Consider: relevance, clarity, ATS-friendliness, impact, completeness.

Job Description: {job_description[:500] if job_description else "General evaluation"}
Resume: {text[:2000]}

Respond with only a number between 0-100.
""".strip()
    
    def _create_improvement_prompt(
        self, 
        section_text: str, 
        section_name: str, 
        target_role: str, 
        job_description: str
    ) -> str:
        """Create prompt for section improvement"""
        return f"""
Improve this {section_name} section for a {target_role} role.
Make it more impactful, ATS-friendly, and relevant.

Job Description: {job_description[:300] if job_description else "General improvement"}

Original {section_name}:
{section_text}

Provide improved version:
""".strip()
    
    def _create_generation_prompt(
        self, 
        sections_summary: str, 
        target_role: str, 
        job_description: str
    ) -> str:
        """Create prompt for complete resume generation"""
        return f"""
Create a professional, ATS-optimized resume for a {target_role} role.

Job Requirements: {job_description[:400] if job_description else "General requirements"}

Current Resume Sections:
{sections_summary}

Generate a complete, well-structured resume with:
- Professional Summary
- Core Skills
- Work Experience (if available)
- Education
- Projects
- Achievements

Format with clear sections and bullet points.
""".strip()
    
    def _prepare_sections_summary(self, sections: Dict[str, List[str]]) -> str:
        """Prepare a summary of resume sections for AI processing"""
        sections_text = ""
        for section, content in sections.items():
            if content:
                sections_text += f"{section.title()}: {'; '.join(content[:3])}\n"
        return sections_text
