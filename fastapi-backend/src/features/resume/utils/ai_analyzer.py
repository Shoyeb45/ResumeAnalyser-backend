import logging
from features.resume.config import ResumeAnalyzerConfig
from typing import Dict, Optional, List, Any
from groq import Groq
from features.resume.utils.resume_detail_extractor import ResumeDetailsExtractor
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
                max_tokens=4000,
                temperature=0.7
            )
            
            analysis = response.choices[0].message.content.strip()
            logger.info("Successfully generated LLM analysis")
            
            logger.info("Converting llm analysis to proper format")
            response = ResumeDetailsExtractor.parse_resume_with_json_extraction(response_text=analysis)
            
            return response
            
        except Exception as e:
            logger.error(f"Error getting LLM analysis: {e}")
            return f"Error generating analysis: {str(e)}"
    
    def get_mcq_for_skill_assessment(self, soft_skills: str, technical_skills: str):
        try:
            prompt = self._create_skill_assessment_prompt(technical_skills=technical_skills, soft_skills=soft_skills)
            response = self.chat_with_groq(prompt)
            
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
        try:
            if not self.groq_client:
                return "LLM service not available. Please check API configuration."
            
            
            # Create comprehensive prompt
            prompt = self._create_section_prompt(
                text, target_role, job_description
            )
            
            # Get AI response
            response = self.groq_client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=4000,
                temperature=0.2
            )
            
            analysis = response.choices[0].message.content.strip()
            print("Successfully generated LLM analysis")
            
            return ResumeDetailsExtractor.parse_resume_with_json_extraction(analysis)
            
        except Exception as e:
            print(f"Error getting LLM analysis: {e}")
            return f"Error generating analysis: {str(e)}"
    
    def get_career_suggestions_based_on_score(self, skill_scores: List, overall_score: float):
        try:
            prompt = self._create_career_suggestion_prompt(skill_scores=skill_scores, overall_score=overall_score)
            
            response = self.chat_with_groq(prompt)
            with open("f.txt", "w") as file:
                file.write(response)
                
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
            if not self.groq_client:
                logger.info("Groq client is not initialised")
                return 75  # Default fallback score
            
            # Create scoring prompt
            prompt = self._create_scoring_prompt(text, target_role, job_description)
            
            # Get AI score
            response = self.groq_client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=4000,
                temperature=0.3
            )
            
            score_text = response.choices[0].message.content.strip()
            
            # Parse and validate score
            try:
                # score = int(score_text)
                # score = max(0, min(100, score))  # Ensure score is between 0-100
                # logger.info(f"AI-computed resume score: {score}")
                return ResumeDetailsExtractor.parse_resume_with_json_extraction(score_text)
            except ValueError:
                logger.warning(f"Could not parse AI score: {score_text}")
                return {
                    'ats_score': 0,
                    'format_compliance': 0,
                    'keyword_optimization': 0,
                    'readability': 0    
                }
                
        except Exception as e:
            logger.error(f"Error computing resume score: {e}")
            return {
                'ats_score': 0,
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
                temperature=0.2
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
    
    def chat_with_groq(
        self,
        prompt: str
    ):
        try:
            response = self.groq_client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=4000,
                temperature=0.7
            )
            
            analysis = response.choices[0].message.content.strip()
            return analysis
        except Exception as e:
            raise e
        
    def generate_project_section_description(
        self,
        project_name: str,
        tech_stack: str,
        description: Optional[str] = None
    ):
        try:
            prompt = self._create_project_section_prompt(project_name, tech_stack, description)
            response = self.chat_with_groq(prompt)
            return response
        except Exception as e:
            logger.error(f"Failed to generate project section description, error: {str(e)}")
            raise e
        
    def generate_experience_section_description(
        self,
        organisation_name: str, 
        position: str, 
        location: str, 
        description: Optional[str] = None
    ) -> str:
        try:
            prompt = self._create_experience_section_prompt(organisation_name, position, location, description)
            response = self.chat_with_groq(prompt)
            return response
        except Exception as e:
            logger.error(f"Failed to generate experience section description, error: {str(e)}")
            raise e
   
    def generate_extracurricular_section_description(
        self,
        organisation_name: str, 
        position: str, 
        location: str, 
        description: Optional[str] = None
    ) -> str:
        try:
            prompt = self._create_extracurricular_section_prompt(organisation_name, position, location, description)
            response = self.chat_with_groq(prompt)
            return response
        except Exception as e:
            logger.error(f"Failed to generate experience section description, error: {str(e)}")
            raise e
        
        
    def _create_analysis_prompt(
        self, 
        text: str, 
        target_role: str, 
        job_description: str, 
        matched_skills: str, 
        missing_skills: str
    ) -> str:
        """Create prompt for resume analysis returning only a JSON object"""
        return f"""
    You are a professional resume evaluation expert. Analyze the following resume strictly for the role of: {target_role}.

    Job Description:
    {job_description or "No specific job description provided"}

    Resume Text:
    {text}

    Matched Skills: {matched_skills}
    Missing Skills: {missing_skills}

    INSTRUCTIONS:
    - Return only a valid JSON object.
    - Do NOT include any explanations, comments, or extra text.
    - Output should begin with '{{' and end with '}}' — return only the JSON.

    Your evaluation JSON must contain the following top-level keys:
    1. overall_strengths: list of objects with 'description' and 'weightage'
    2. areas_for_improvement: list of objects with 'description' and 'weightage'
    3. ats_optimization_suggestions: list of objects with 'description' and 'weightage'
    4. job_fit_assessment: object with 'score' and 'notes'
    5. recommendation_score: integer (1–100)
    6. resume_summary
    
    NOTE: Provide the ouptut in json string format *only*. Please give me only JSON and nothing else, no starting or ending lines. Form sentence as you are speaking with user.
    """.strip()
    
    def _create_scoring_prompt(self, text: str, target_role: str, job_description: str) -> str:
        """Create prompt for resume scoring"""
        return f"""
Rate this resume out of 100 for the role: {target_role}
Consider: relevance, clarity, ATS-friendliness, impact, completeness.

Job Description: {job_description if job_description else "General evaluation"}
Resume: {text}

Respond only json object with following keys:
{{
    'ats_score': 'ats score of the resume',
    'format_compliance': 'Formatting score of the resume',
    'keyword_optimization': 'Scoring of the resume based on keywords',
    'readability': 'Readability score of the resume' 
}}

NOTE: Only ouptut in JSON format, don't give anything apart from **JSON object**. 
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
    
    def _create_career_suggestion_prompt(self, skill_scores: List, overall_score: float) -> str:
        return f"""
You are an expert career mentor. You have scores of the candidate based on the skill and also overall score. Now based on the skill and the overall score, you need to suggest career suggestion that which role will fit the candidate based on the scores. 

Skill Scores: {str(skill_scores)}
Overll Score: {overall_score}

Based on the above I need two things:

1. Role Name (like Frontend Engineer or Backend Engineer)
2. Match Percent (based on the scores, give match percent that how much user is match with the given role)

I want ouput format like this:
{{
    "suggestions": [
        {{
            "role_name": "Name of the skill.",
            "match_percent": "Match percent with the provided role." 
        }},
        {{
            "role_name": "Name of the skill.",
            "match_percent": "Match percent with the provided role." 
        }},
        ...
        ...,
        {{
            "role_name": "Name of the skill.",
            "match_percent": "Match percent with the provided role." 
        }}
    ]
    
    NOTE: Only return JSON object and nothing else.
}}
""".strip()
    
    def _create_section_prompt(
        self, 
        text: str, 
        target_role: str, 
        job_description: str
    ) -> str:
        """Create prompt for resume analysis returning only a JSON object"""
        return f"""
    You are a professional resume evaluation expert. Analyze the resume below strictly for the role of: {target_role}.

    Job Description:
    {job_description or "No specific job description provided"}

    Resume Text:
    {text}

    INSTRUCTIONS:
    - Return ONLY a valid JSON object. Do not include any extra explanation, markdown, or text.
    - Output should start with '{{' and end with '}}'.
    - Structure your response exactly as described below.

    EXPECTED JSON FORMAT:
    {{
    "education": 
        {{
        "description": "small description of that section in one or two lines",
        "good": ["point 1", "point 2"],
        "bad": ["point 1", "point 2"],
        "improvements": ["point 1", "point 2"],
        "overall_review": "Excellent"  or "Good" or "Needs Improvement"
        }}
    ,
    "projects": 
        {{
            "description": "small description of that section in one or two lines",
            "good": ["point 1", "point 2"],
            "bad": ["point 1", "point 2"],
            "improvements": ["point 1", "point 2"],
            "overall_review": "Excellent"  or "Good" or "Needs Improvement"
        }}
    ,
    "experience": 
        {{
            "description": "small description of that section in one or two lines",
            "good": ["point 1", "point 2"],
            "bad": ["point 1", "point 2"],
            "improvements": ["point 1", "point 2"],
            "overall_review": "Excellent"  or "Good" or "Needs Improvement"
        }}
    ,
    "skills": 
        {{
            "description": "small description of that section in one or two lines",
            "good": ["point 1", "point 2"],
            "bad": ["point 1", "point 2"],
            "improvements": ["point 1", "point 2"],
            "overall_review": "Excellent"  or "Good" or "Needs Improvement"
        }}
    ,
    "extracurricular": 
        {{
            "description": "small description of that section in one or two lines",
            "good": [...],
            "bad": [...],
            "improvements": [...],
            "overall_review": "Excellent"  or "Good" or "Needs Improvement"
        }}
    
    }}

    IMPORTANT:
    - Use natural, conversational sentences for each point (e.g., "You’ve clearly listed relevant coursework which aligns with the role.")
    - Every section must be present, even if empty arrays are needed.
    - If a section is not found in the resume, set good, bad, improvements to [] and overall_review to "needs_improvement".

    NOTE: RETURN ONLY THE JSON OBJECT AND NOTHING ELSE, NO EXTRA EXPLANATION.
    """.strip()

    def _prepare_sections_summary(self, sections: Dict[str, List[str]]) -> str:
        """Prepare a summary of resume sections for AI processing"""
        sections_text = ""
        for section, content in sections.items():
            if content:
                sections_text += f"{section.title()}: {'; '.join(content[:3])}\n"
        return sections_text



    def _create_skill_assessment_prompt(self, technical_skills: str, soft_skills: str):
        return f"""
You are an expert assessment generator.

Based on the following technical and soft skills, generate 10 multiple choice questions that test understanding and practical knowledge of the skills.

Each question should have:
- 1 clear correct answer
- 3 plausible but incorrect distractors
- A good mix of conceptual and scenario-based questions
- Coverage across both technical and soft skills

### Technical Skills: 
-> {technical_skills}

### Soft Skills:
-> {soft_skills}


Return the output in **valid JSON** format as:

{{
  "questions": [
    {{
      "question": "Question text here?",
      "options": [
        "A. Option one",
        "B. Option two",
        "C. Option three",
        "D. Option four"
      ],
      "answer": "A",
      "topic": "Topic of the question, like javascript, react, or soft skills. Give only one skill"
    }},
    ...
    ...
    ...,
    {{
      "question": "Question text here?",
      "options": [
        "A. Option one",
        "B. Option two",
        "C. Option three",
        "D. Option four"
      ],
      "answer": "A",
      "topic": "Topic of the question, like javascript, react, or soft skills. Give only one skill"
    }},
  ]
}}

Do not include any explanations, comments, or markdown. Output **only the pure JSON object**.
""".strip()

    def _create_experience_section_prompt(
        self,
        organisation_name: str, 
        position: str, 
        location: str, 
        description: Optional[str] = None
    ) -> str:
        if not description:
            description = "Description not provided. You must create it from scratch."
        
        return f"""
You are a resume writing assistant. Your task is to generate a strong, professional description for a experience in the experience section.
Organisation Name: {organisation_name}  
Position or Role: {position}
Location: {location}  
Current Description: {description}
INSTRUCTIONS:
- Return only the final improved description text.
- Do not include any extra phrases like "Here is the description:" or quotation marks.
- Write in third person and keep it resume-appropriate.
- Do not include any markdown, labels, or prefixes.
Return ONLY the final description sentence and nothing else.
""".strip()

    def _create_extracurricular_section_prompt(
        self,
        organisation_name: str, 
        position: str, 
        location: str, 
        description: Optional[str] = None
    ) -> str:
        if not description:
            description = "Description not provided. You must create it from scratch."
        
        return f"""
You are a resume writing assistant. Your task is to generate a strong, professional description for a extracurricular in the extracurricular section.
Organisation Name: {organisation_name}  
Position or Role: {position}
Location: {location}  
Current Description: {description}
INSTRUCTIONS:
- Return only the final improved description text.
- Do not include any extra phrases like "Here is the description:" or quotation marks.
- Write in third person and keep it resume-appropriate.
- Do not include any markdown, labels, or prefixes.
Return ONLY the final description sentence and nothing else.
""".strip()

    def _create_project_section_prompt(
        self,
        project_name: str,
        tech_stack: str,
        description: Optional[str] = None
    ):
        if not description:
            description = "Description not provided. You must create it from scratch."

        return f"""
You are a resume writing assistant. Your task is to generate a strong, professional description for a project in the project section.
Project Name: {project_name}  
Technologies Used: {tech_stack}  
Current Description: {description}
INSTRUCTIONS:
- Return only the final improved description text.
- Do not include any extra phrases like "Here is the description:" or quotation marks.
- Write in third person and keep it resume-appropriate.
- Do not include any markdown, labels, or prefixes.
Return ONLY the final description sentence and nothing else.
""".strip()

    def _create_career_suggestion_prompt(self, skill_scores: List, overall_score: float) -> str:
        return f"""
You are an expert career mentor. You have scores of the candidate based on the skill and also overall score. Now based on the skill and the overall score, you need to suggest career suggestion that which role will fit the candidate based on the scores. 

Skill Scores: {str(skill_scores)}
Overll Score: {overall_score}

Based on the above I need two things:

1. Role Name (like Frontend Engineer or Backend Engineer)
2. Match Percent (based on the scores, give match percent that how much user is match with the given role)

I want ouput format like this:
{{
    "suggestions": [
        {{
            "role_name": "Name of the skill.",
            "match_percent": "Match percent with the provided role." 
        }},
        {{
            "role_name": "Name of the skill.",
            "match_percent": "Match percent with the provided role." 
        }},
        ...
        ...,
        {{
            "role_name": "Name of the skill.",
            "match_percent": "Match percent with the provided role." 
        }}
    ]
    
    NOTE: Only return JSON object and nothing else.
}}
""".strip()