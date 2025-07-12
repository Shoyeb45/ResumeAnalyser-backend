from typing import List, Any, Dict, Optional, Tuple

class PromptCreator:
    def __init__(self):
        pass
    
    def _create_analysis_prompt(
        self, 
        text: str, 
        target_role: str, 
        job_description: str, 
        matched_skills: str, 
        missing_skills: str
    ) -> str:
        """Create prompt for resume analysis returning only a JSON object"""
        system_prompt = """You are an expert resume analyst with 15+ years of experience in talent acquisition and career development.

INSTRUCTIONS:
- Return only a valid JSON object.
- Do NOT include any explanations, comments, or extra text.
- Output should begin with '{' and end with '}' — return only the JSON.

OUTPUT FORMAT (JSON ONLY):
{
  "overall_strengths": [   // list of objects with 'description' and 'weightage'
    {"description": "Specific strength with evidence", "weightage": 85},
    {"description": "Another strength with context", "weightage": 78}
  ],
  "areas_for_improvement": [ // list of objects with 'description' and 'weightage'
    {"description": "Specific improvement area", "weightage": 70},
    {"description": "Another area needing attention", "weightage": 65}
  ],
  "ats_optimization_suggestions": [ // list of objects with 'description' and 'weightage'
    {"description": "Actionable ATS improvement", "weightage": 80},
    {"description": "Another ATS enhancement", "weightage": 75}
  ],
  "job_fit_assessment": {  // object with 'score' and 'notes'
    "score": 82,
    "notes": "Detailed assessment of role alignment and growth potential"
  },
  "recommendation_score": 82,  // integer (1–100)
  "resume_summary": "Compelling 2-3 sentence summary of the candidate's profile and potential"
}

EVALUATION CRITERIA:
1. Role-specific skill alignment and depth
2. Quantifiable achievements and impact metrics
3. Career progression and growth trajectory
4. ATS compatibility and keyword optimization
5. Professional presentation and clarity

Return only the JSON object with no additional text or formatting."""

        user_prompt = f"""Please analyze the following resume for the specified role:

TARGET ROLE: {target_role}

JOB DESCRIPTION: {job_description or "General role analysis"}

MATCHED SKILLS: {matched_skills or "None identified"}

MISSING SKILLS: {missing_skills or "None identified"}

RESUME CONTENT:
{text}

Analyze this resume according to the evaluation criteria and return the analysis in the specified JSON format."""

        return system_prompt, user_prompt
    
    def _create_scoring_prompt(self, text: str, target_role: str, job_description: str) -> str:
        """Create prompt for resume scoring"""

        system_prompt = """You are an expert resume evaluator specializing in ATS scoring and resume assessment.

Your task is to rate resumes out of 100 based on the following criteria:
- Relevance to the target role
- Clarity and readability
- ATS-friendliness
- Impact and achievements
- Completeness

RESPONSE FORMAT:
Respond only with a JSON object containing the following keys:
{
    'ats_score': 'ats score of the resume',
    'format_compliance': 'Formatting score of the resume',
    'keyword_optimization': 'Scoring of the resume based on keywords',
    'readability': 'Readability score of the resume' 
}

NOTE: Only output in JSON format, don't give anything apart from the JSON object."""

        user_prompt = f"""Please rate this resume out of 100 for the following role:

TARGET ROLE: {target_role}

JOB DESCRIPTION: {job_description if job_description else "General evaluation"}

RESUME CONTENT:
{text}

Provide your assessment in the specified JSON format."""

        return system_prompt, user_prompt
    
    def _create_improvement_prompt(
        self, 
        section_text: str, 
        section_name: str, 
        target_role: str, 
        job_description: str
    ) -> str:
        """Create prompt for section improvement"""

        system_prompt = f"""You are an expert resume writer specializing in optimizing resume sections for maximum impact.

Your task is to improve resume sections to make them:
- More impactful and results-oriented
- ATS-friendly with relevant keywords
- Tailored to specific roles
- Professional and compelling

Focus on enhancing the content while maintaining authenticity."""

        user_prompt = f"""Please improve this {section_name} section for the specified role:

TARGET ROLE: {target_role}

JOB DESCRIPTION: {job_description[:300] if job_description else "General improvement"}

ORIGINAL {section_name.upper()} SECTION:
{section_text}

Provide an improved version of this section that is more impactful, ATS-friendly, and relevant to the target role."""

        return system_prompt, user_prompt
    
    def _create_generation_prompt(
        self, 
        sections_summary: str, 
        target_role: str, 
        job_description: str
    ) -> str:
        """Create prompt for complete resume generation"""

        system_prompt = """You are an expert resume writer specializing in creating professional, ATS-optimized resumes.

Your task is to create complete, well-structured resumes that include:
- Professional Summary
- Core Skills
- Work Experience (if available)
- Education
- Projects
- Achievements

Format requirements:
- Use clear sections and bullet points
- Ensure ATS compatibility
- Include relevant keywords
- Maintain professional formatting
- Focus on quantifiable achievements"""

        user_prompt = f"""Please create a professional, ATS-optimized resume for the following role:

TARGET ROLE: {target_role}

JOB REQUIREMENTS: {job_description[:400] if job_description else "General requirements"}

CURRENT RESUME SECTIONS:
{sections_summary}

Generate a complete, well-structured resume based on the provided information."""

        return system_prompt, user_prompt

    def _create_career_suggestion_prompt(self, skill_scores: List, overall_score: float) -> str:
        system_prompt = """You are an expert career mentor with extensive experience in career guidance and skill assessment.

Your task is to provide career suggestions based on skill scores and overall performance. You need to analyze the data and provide:

1. Role suggestions with match percentages
2. Candidate strengths and reasons
3. Improvement areas with specific recommendations
4. Tips for resume enhancement

RESPONSE FORMAT:
{
    "suggestions": [
        {
            "role_name": "Name of the role",
            "match_percent": "Match percent with the provided role" 
        }
    ],
    "strengths": [
        {
            "skill": "Name of the skill where candidate is good",
            "strength_point": "Reason why candidate is strong"
        }
    ],
    "improvement_areas": [
        {
            "skill": "Name of the skill where candidate needs improvement",
            "improvement_point": "What improvement does the candidate need in this skill" 
        }
    ],
    "tips": [
        "tip-1",
        "tip-2",
        "tip-3"
    ]
}

NOTE: Only return JSON object and nothing else."""

        user_prompt = f"""Based on the following skill assessment data, provide career suggestions:

SKILL SCORES: {str(skill_scores)}

OVERALL SCORE: {overall_score}

Analyze this data and provide role suggestions, strengths, improvement areas, and tips in the specified JSON format."""

        return system_prompt, user_prompt
     
    def _create_section_prompt(
        self, 
        text: str, 
        target_role: str, 
        job_description: str
    ) -> str:
        """Create prompt for resume analysis returning only a JSON object"""
        system_prompt = """You are a professional resume evaluation expert specializing in section-by-section analysis.

Your task is to analyze resume sections and provide detailed feedback for each section including:
- Brief description of the section
- Good points
- Areas needing improvement
- Specific improvement suggestions
- Overall review rating

RESPONSE FORMAT:
Return ONLY a valid JSON object with this exact structure:
{
    "education": {
        "description": "small description of that section in one or two lines",
        "good": ["point 1", "point 2"],
        "bad": ["point 1", "point 2"],
        "improvements": ["point 1", "point 2"],
        "overall_review": "Excellent" or "Good" or "Needs Improvement"
    },
    "projects": {
        "description": "small description of that section in one or two lines",
        "good": ["point 1", "point 2"],
        "bad": ["point 1", "point 2"],
        "improvements": ["point 1", "point 2"],
        "overall_review": "Excellent" or "Good" or "Needs Improvement"
    },
    "experience": {
        "description": "small description of that section in one or two lines",
        "good": ["point 1", "point 2"],
        "bad": ["point 1", "point 2"],
        "improvements": ["point 1", "point 2"],
        "overall_review": "Excellent" or "Good" or "Needs Improvement"
    },
    "skills": {
        "description": "small description of that section in one or two lines",
        "good": ["point 1", "point 2"],
        "bad": ["point 1", "point 2"],
        "improvements": ["point 1", "point 2"],
        "overall_review": "Excellent" or "Good" or "Needs Improvement"
    },
    "extracurricular": {
        "description": "small description of that section in one or two lines",
        "good": ["point 1", "point 2"],
        "bad": ["point 1", "point 2"],
        "improvements": ["point 1", "point 2"],
        "overall_review": "Excellent" or "Good" or "Needs Improvement"
    }
}

IMPORTANT:
- Use natural, conversational sentences for each point
- Every section must be present, even if empty arrays are needed
- If a section is not found, set arrays to [] and overall_review to "Needs Improvement"
- Return ONLY the JSON object, no explanations"""

        user_prompt = f"""Please analyze the following resume sections for the specified role:

TARGET ROLE: {target_role}

JOB DESCRIPTION: {job_description or "No specific job description provided"}

RESUME TEXT:
{text}

Provide a detailed section-by-section analysis in the specified JSON format."""

        return system_prompt, user_prompt
    
    def _create_skill_assessment_prompt(self, technical_skills: str, soft_skills: str):
        
        system_prompt = """You are an expert assessment generator specializing in creating comprehensive skill evaluations.

Your task is to generate 10 multiple choice questions that test understanding and practical knowledge of both technical and soft skills.

Requirements for each question:
- 1 clear correct answer
- 3 plausible but incorrect distractors
- Good mix of conceptual and scenario-based questions
- Coverage across both technical and soft skills

RESPONSE FORMAT:
{
  "questions": [
    {
      "question": "Question text here?",
      "options": [
        "A. Option one",
        "B. Option two",
        "C. Option three",
        "D. Option four"
      ],
      "answer": "A",
      "topic": "Topic of the question (single skill name)"
    }
  ]
}

Do not include any explanations, comments, or markdown. Output only the pure JSON object."""

        user_prompt = f"""Generate 10 multiple choice questions based on the following skills:

TECHNICAL SKILLS: {technical_skills}

SOFT SKILLS: {soft_skills}

Create questions that test both theoretical knowledge and practical application of these skills. Return the assessment in the specified JSON format."""

        return system_prompt, user_prompt
  
    def _create_experience_section_prompt(
        self,
        organisation_name: str, 
        position: str, 
        location: str, 
        description: Optional[List[str]] = None
    ) -> Tuple[str, str]:
        if not description:
            description = ["Description not provided. You must create it from scratch."]
        
        if not description:
            description = ["Description not provided. You must create it from scratch."]
        
        system_prompt = f"""You are a resume writing assistant specializing in creating strong professional experience descriptions.

Your task is to generate {len(description)} impactful bullet points for a work experience entry.

Requirements:
- Write in third person and keep it resume-appropriate
- Focus on achievements and quantifiable results
- Use action verbs and professional language
- Do not include any markdown, labels, or prefixes
- Separate points with "@" symbol only
- Do not include '@' at the end
- Do not add spaces before or after '@' symbols

Return ONLY the final improved bullet points in the specified format."""

        user_prompt = f"""Please generate professional experience bullet points for:

ORGANISATION: {organisation_name}
POSITION: {position}
LOCATION: {location}
EXISTING POINTS: {description}

Create {len(description)} enhanced bullet points that highlight achievements and impact."""

        return system_prompt, user_prompt
     
    def _create_extracurricular_section_prompt(
        self,
        organisation_name: str, 
        position: str, 
        location: str, 
        description: Optional[List[str]] = None
    ) -> str:
        if not description:
            description = ["Bullet points not provided. You must create it from scratch."]

        system_prompt = f"""You are a resume writing assistant specializing in presenting extracurricular activities professionally.

Your task is to generate exactly {len(description)} bullet point(s) for an extracurricular activity.

Requirements:
- Write in third person, past tense
- Make it resume-appropriate and impactful
- Keep each point concise and professional
- Separate each bullet point using exactly one "@" symbol
- Do NOT add spaces before or after the "@" symbol
- DO NOT end the output with an "@"
- Do NOT include any introductory or closing text

Return only the final improved bullet points in the specified format."""

        user_prompt = f"""Please generate professional extracurricular activity bullet points for:

ORGANISATION: {organisation_name}
POSITION: {position}
LOCATION: {location}
EXISTING BULLET POINTS: {description}

Create {len(description)} enhanced bullet point(s) that showcase leadership, impact, and skills developed."""

        return system_prompt, user_prompt
   
    def _create_project_section_prompt(
        self,
        project_name: str,
        tech_stack: str,
        bullet_points: Optional[List[str]] = None
    ):
        
        if not bullet_points:
            bullet_points = []
        
        system_prompt = f"""You are a technical resume writer specializing in project portfolio presentation.

Your task is to create {len(bullet_points)} enhanced technical bullet points that demonstrate:
1. Technical proficiency and problem-solving
2. Innovative solutions and methodologies
3. Project impact and user value
4. Collaboration and technical leadership
5. Relevant metrics and outcomes

Requirements:
- Lead with technical achievements and innovations
- Quantify user impact, performance improvements, or scale
- Highlight complex problem-solving and technical decisions
- Show full-stack understanding and integration
- Use "@" separator between points (no spaces around "@")
- Do not end with "@"
- Focus on technical depth and business impact

Return only the enhanced technical descriptions in the specified format."""

        user_prompt = f"""Please enhance the following project information:

PROJECT NAME: {project_name}
TECHNOLOGIES: {tech_stack}
CURRENT POINTS: {str(bullet_points)}

Generate exactly {len(bullet_points)} enhanced technical bullet points that showcase technical expertise and project impact."""

        return system_prompt, user_prompt
    
    def _create_resume_parser_prompt(self, text: str):
        
        system_prompt = """You are an expert resume parser specializing in extracting structured data from resumes.

    Your task is to extract resume information and format it as a JSON object with the following structure:

    {
      "resume_details": {
        "personal_info": {
          "name": "candidate full name",
          "contact_info": {
            "email": "email address",
            "mobile": "phone number",
            "location": "city, state/country",
            "social_links": {
              "linkedin": "linkedin profile url",
              "github": "github profile url",
              "portfolio": "portfolio website url"
            }
          },
          "professional_summary": "professional summary or objective"
        },
        "educations": [
          {
            "institute_name": "university/college name",
            "degree": "degree type",
            "specialisation": "field of study",
            "dates": {
              "start": "start date",
              "end": "end date or 'Present'"
            },
            "location": "institute location",
            "gpa": "GPA/percentage if mentioned",
            "relevant_coursework": ["course1", "course2"]
          }
        ],
        "work_experiences": [
          {
            "company_name": "company name",
            "job_title": "position title",
            "date": {
              "start": "start date",
              "end": "end date or 'Present'"
            },
            "location": "work location",
            "bullet_points": ["responsibility 1", "responsibility 2"]
          }
        ],
        "projects": [
          {
            "title": "project name",
            "project_link": "project url if available",
            "date": {
              "start": "start date",
              "end": "end date"
            },
            "location": "project location if applicable",
            "organization": "associated organization if any",
            "bullet_points": ["key point 1", "key point 2"],
            "technologies_used": ["tech1", "tech2"]
          }
        ],
        "skills": [
          {
            "skill_group": "Programming Languages",
            "skills": ["Python", "Java", "JavaScript"]
          }
        ],
        "achievements": [
          {
            "title": "achievement title",
            "description": "achievement description",
            "date_achieved": "date of achievement or null",
            "organization": "awarding organization or null"
          }
        ],
        "certifications": [
          {
            "certificate_name": "certification name",
            "issuing_organization": "issuing body",
            "date_issued": "issue date or null",
            "expiry_date": "expiry date or null",
            "description": "certification description"
          }
        ],
        "languages": [
          {
            "language": "language name",
            "proficiency": "proficiency level"
          }
        ],
        "publications": [
          {
            "publication_name": "publication title",
            "authors": ["author1", "author2"],
            "publication_date": "publication date",
            "journal_conference": "journal or conference name",
            "description": "brief description"
          }
        ],
        "extracurriculars": [
          {
            "title": "activity title",
            "organization_name": "organization name",
            "role": "role/position held",
            "date": {
              "start": "start date",
              "end": "end date"
            },
            "bullet_points": ["activity detail 1", "activity detail 2"],
            "certificate": "certificate link or null",
            "location": "activity location"
          }
        ]
      }
    }

    PARSING RULES:
    1. Extract information ONLY if explicitly mentioned in the resume
    2. For missing array/list fields (like certifications, achievements, languages, etc.), use EMPTY ARRAYS [] - do NOT create objects with null values
    3. Use empty strings "" for missing string fields
    4. Use null for missing object fields
    5. Preserve original date formats when possible
    6. Group skills logically by category
    7. Include all bullet points as separate array elements
    8. Extract URLs exactly as written

    CRITICAL INSTRUCTIONS:
    - If NO certifications are found, return: "certifications": []
    - If NO achievements are found, return: "achievements": []
    - If NO languages are found, return: "languages": []
    - If NO publications are found, return: "publications": []
    - DO NOT create placeholder objects with null values for missing data
    - Only include actual data that exists in the resume

    CRITICAL: Return ONLY the JSON object. No explanations, no markdown, no additional text."""

        user_prompt = f"""Please extract and structure the following resume data:

    RESUME TEXT:
    {text}

    Parse this resume and return the structured data in the specified JSON format. Remember: use empty arrays [] for missing list data, not objects with null values."""

        return system_prompt, user_prompt
    
    def _create_ats_prompt(self, resume_data: dict) -> str:
        system_prompt = """You are an advanced Applicant Tracking System (ATS) evaluator specializing in resume assessment.

Your task is to evaluate resumes based on 3 key criteria:

1. **Format Compliance** (30%):   
   - Document structure and parseability
   - Section organization and hierarchy
   - Font consistency and readability
   - ATS-friendly formatting practices

2. **Keyword Optimization** (40%):
   - Industry-specific terminology density
   - Technical skill keyword matching
   - Action verb usage and variety
   - Role-relevant language patterns

3. **Readability & Clarity** (30%): 
   - Information clarity and flow
   - Quantified achievement presentation
   - Professional language quality
   - Logical content organization

For each category, provide a score out of 100, followed by an overall ATS Score (weighted).

RESPONSE FORMAT:
{
    "ats_score": "Overall ATS score in float",
    "format_compliance": "Format compliance score in float",
    "keyword_optimization": "Keyword optimization score in float",
    "readability": "Readability score in float"
}

Assume the resume is written in clean and ATS-compatible LaTeX format."""

        # Extract resume data for user prompt
        personal_info = resume_data.get("personal_info", {})
        name = personal_info.get("name", "N/A")
        summary = personal_info.get("professional_summary", "N/A")
        
        # Skills
        skills_flat = []
        for group in resume_data.get("skills", []):
            skills_flat.extend(group.get("skills", []))
        
        # Projects
        project_details = []
        for proj in resume_data.get("projects", []):
            title = proj.get("title", "")
            bullets = proj.get("bullet_points", [])
            tech = proj.get("technologies_used", [])
            project_details.append(f"Title: {title}\nTech: {', '.join(tech)}\nHighlights:\n" +
                                "\n".join([f"  - {b}" for b in bullets]))
        
        # Education
        education_details = []
        for edu in resume_data.get("educations", []):
            edu_line = f"{edu.get('institute_name')} - {edu.get('degree')} ({edu.get('gpa', 'N/A')})"
            education_details.append(edu_line)

        # Achievements
        achievement_details = []
        for ach in resume_data.get("achievements", []):
            achievement_details.append(f"{ach.get('title', '')}: {ach.get('description', '')}")

        # Extracurriculars
        extracurricular_details = []
        for extra in resume_data.get("extracurriculars", []):
            bullet_str = "\n".join([f"  - {bp}" for bp in extra.get("bullet_points", [])])
            extracurricular_details.append(f"{extra.get('title', '')} ({extra.get('role', '')}):\n{bullet_str}")

        # Languages
        languages = [lang.get("language", "") + f" ({lang.get('proficiency', '')})"
                    for lang in resume_data.get("languages", []) if lang.get("language")]

        # Contact Links
        contact_info = personal_info.get("contact_info", {})
        social_links = contact_info.get("social_links", {})
        links = [f"{key}: {val}" for key, val in social_links.items() if val]

        user_prompt = f"""Please evaluate the following resume for ATS compatibility:

**Name**: {name}

**Professional Summary**:
{summary}

**Skills**:
{', '.join(skills_flat) or 'None listed'}

**Programming Languages Spoken**:
{', '.join(languages) or 'Not specified'}

**Social Links**:
{', '.join(links) or 'None'}

**Projects**:
{chr(10).join(project_details) or 'No projects provided'}

**Education**:
{chr(10).join(education_details) or 'No education history provided'}

**Achievements**:
{chr(10).join(achievement_details) or 'No achievements listed'}

**Extracurriculars**:
{chr(10).join(extracurricular_details) or 'None'}

Provide your ATS evaluation in the specified JSON format."""

        return system_prompt, user_prompt