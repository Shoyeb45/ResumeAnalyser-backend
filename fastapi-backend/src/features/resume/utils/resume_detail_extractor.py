from groq import Groq
from features.resume.config import ResumeAnalyzerConfig
import logging
from typing import Optional, Dict
import re, json

logger = logging.getLogger(__name__)

class ResumeDetailsExtractor:
    def __init__(self, logger:logging.Logger):
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

    @staticmethod
    def extract_json_from_response(response_text):
        """
        Extract JSON string from LLM response that may contain extra text.
        
        Args:
            response_text (str): The raw response from the LLM
            
        Returns:
            str: Clean JSON string, or None if no valid JSON found
        """
        
        logger.info("Extracting json from llm response of resume text")
        if not response_text:
            return None
        
        # Remove common markdown formatting
        text = response_text.strip()
        text = re.sub(r'^```json\s*', '', text, flags=re.MULTILINE)
        text = re.sub(r'^```\s*$', '', text, flags=re.MULTILINE)
        text = text.strip()
        
        # Method 1: Try to find JSON between first { and last }
        first_brace = text.find('{')
        last_brace = text.rfind('}')
        
        if first_brace != -1 and last_brace != -1 and first_brace < last_brace:
            potential_json = text[first_brace:last_brace + 1]
            
            # Validate if it's proper JSON
            try:
                json.loads(potential_json)
                return potential_json
            except json.JSONDecodeError:
                pass
        
        # Method 2: Use regex to find JSON-like structures
        json_patterns = [
            r'\{.*\}',  # Basic { to } matching
            r'\{[\s\S]*\}',  # Multi-line { to } matching
        ]
        
        for pattern in json_patterns:
            matches = re.findall(pattern, text, re.DOTALL)
            for match in matches:
                try:
                    json.loads(match)
                    return match
                except json.JSONDecodeError:
                    continue
        
        # Method 3: Try to clean common prefixes/suffixes
        cleaning_patterns = [
            (r'^.*?(\{.*\}).*?$', r'\1'),  # Extract content between first { and last }
            (r'^[^{]*(\{.*\})[^}]*$', r'\1'),  # Remove text before first { and after last }
            (r'Here\'s the JSON:?\s*(\{.*\})', r'\1'),  # Remove "Here's the JSON:" prefix
            (r'```json\s*(\{.*\})\s*```', r'\1'),  # Remove markdown code blocks
            (r'^.*?JSON.*?:?\s*(\{.*\})', r'\1'),  # Remove any JSON-related prefix
        ]
        
        for pattern, replacement in cleaning_patterns:
            cleaned = re.sub(pattern, replacement, text, flags=re.DOTALL | re.IGNORECASE)
            try:
                json.loads(cleaned)
                return cleaned
            except json.JSONDecodeError:
                continue
        
        # Method 4: Manual brace matching for nested JSON
        brace_count = 0
        start_idx = -1
        
        for i, char in enumerate(text):
            if char == '{':
                if brace_count == 0:
                    start_idx = i
                brace_count += 1
            elif char == '}':
                brace_count -= 1
                if brace_count == 0 and start_idx != -1:
                    potential_json = text[start_idx:i + 1]
                    try:
                        json.loads(potential_json)
                        return potential_json
                    except json.JSONDecodeError:
                        continue
        
        return None

    @staticmethod
    def parse_resume_with_json_extraction(response_text: str):
        """
        Parse resume response and extract clean JSON.
        
        Args:
            groq_response: The response object from Groq API
            
        Returns:
            dict: Parsed JSON data, or None if extraction failed
        """
        try:
            
            # Extract JSON string
            json_string = ResumeDetailsExtractor.extract_json_from_response(response_text)
            
            if json_string:
                # Parse and return as dictionary
                return json.loads(json_string)
            else:
                logger.warning("Could not extract valid JSON from response")
                logger.warning("Raw response: %s", response_text[:200] + "..." if len(response_text) > 200 else response_text)
                return response_text
                
        except Exception as e:
            logger.error(f"Error parsing resume response: {str(e)}")
            return None

    def create_resume_parser_prompt(self, text: str):
        prompt = f"""EXTRACT RESUME DATA TO JSON ONLY.
CRITICAL: Please return ONLY the JSON object. No explanations, no markdown, no additional text. Start with {{ and end with }}.
JSON SCHEMA:
{{
"resume_details": {{
    "personal_info": {{
    "name": "candidate full name",
    "contact_info": {{
        "email": "email address as a string",
        "mobile": "phone number",
        "location": "city, state/country",
        "social_links": {{
            "linkedin": "linkedin profile url",
            "github": "github profile url",
            "portfolio": "portfolio website url"
        }}
    }},
    "professional_summary": "professional summary or objective statement"
    }},
    "educations": [
    {{
        "institute_name": "university/college name",
        "degree": "degree type (B.Tech, B.Sc, M.Sc, etc.)",
        "specialisation": "field of study",
        "dates": {{
            "start": "start date",
            "end": "end date or 'Present'"
        }},
        "location": "institute location",
        "gpa": "GPA/percentage if mentioned",
        "relevant_coursework": ["course1", "course2", "course3"]
    }}
    ],
    "work_experiences": [
    {{
        "company_name": "company name",
        "job_title": "position title",
        "date": {{
        "start": "start date",
        "end": "end date or 'Present'"
        }},
        "location": "work location",
        "bullet_points": ["responsibility/achievement 1", "responsibility/achievement 2"]
    }}
    ],
    "projects": [
    {{
        "title": "project name",
        "project_link": "project url if available: str",
        "date": {{
        "start": "start date",
        "end": "end date"
        }},
        "location": "project location if applicable",
        "organization": "associated organization if any",
        "bullet_points": ["key point 1", "key point 2"],
        "technologies_used": ["tech1", "tech2", "tech3"]
    }}
    ],
    "skills": [
    {{
        "skill_group": "Programming Languages",
        "skills": ["Python", "Java", "JavaScript"]
    }},
    {{
        "skill_group": "Web Technologies", 
        "skills": ["React", "HTML", "CSS"]
    }},
    {{
        "skill_group": "Databases",
        "skills": ["MySQL", "PostgreSQL", "MongoDB"]
    }},
    {{
        "skill_group": "Cloud Platforms",
        "skills": ["AWS", "Azure", "GCP"]
    }},
    {{
        "skill_group": "Tools & Frameworks",
        "skills": ["Git", "Docker", "Kubernetes"]
    }}
    ],
    "achievements": [
    {{
        "title": "achievement title",
        "description": "achievement description",
        "date_achieved": "date of achievement, if not present then none",
        "organization": "awarding organization, if not present then none"
    }}
    ],
    "certifications": [
    {{
        "certificate_name": "certification name",
        "issuing_organization": "issuing body",
        "date_issued": "issue date, if not present then None",
        "expiry_date": "expiry date if applicable, if not present then None",
        "description": "certification description"
    }}
    ],
    "languages": [
    {{
        "language": "language name",
        "proficiency": "proficiency level (Native, Fluent, Intermediate, Basic)"
    }}
    ],
    "publications": [
    {{
        "publication_name": "publication title",
        "authors": ["author1", "author2"],
        "publication_date": "publication date",
        "journal_conference": "journal or conference name",
        "description": "brief description"
    }}
    ],
    "extracurriculars": [
    {{
        "title": "activity title",
        "organization_name": "organization name",
        "role": "role/position held",
        "date": {{  "start": "start date",  "end": "end date"  }},
        "bullet_points": ["activity detail 1", "activity detail 2"],
        "certificate": "Any proof of work or certificate link",
        "location": "Where candidate was part of the acitivity."
    }}
    ]
}}
}}
PARSING RULES:
1. Extract information only if explicitly mentioned in the resume
2. Use empty arrays [] for missing list fields
3. Use empty strings "" for missing string fields
4. Use null for missing object fields
5. Preserve original date formats when possible
6. Group skills logically by category
7. Include all bullet points as separate array elements
8. Extract URLs exactly as written
RESUME TEXT:
{text}
    """.strip()

        return prompt


    def get_resume_details(self, text: str) -> Optional[Dict[str, any]]:
        '''Method to extract the details of the resume in structured manner from reume
        
        Args:
            text: Extracted resume text
        
        Returns:
            dict: Python object with resume details 
        '''
        try:
            logger.info("Sent the text to groq for getting structured output of the resume")
            
            prompt = self.create_resume_parser_prompt(text)
            response = self.groq_client.chat.completions.create(
                model="llama3-8b-8192",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=4000,
                temperature=0.7
            )
            analysis = response.choices[0].message.content.strip()
            # extracted_json = self.extract_json_from_response(analysis)
            return self.parse_resume_with_json_extraction(analysis)
        except Exception as e:
            logger.error(f"Error getting resume details from llm: {str(e)}")
            return None
        