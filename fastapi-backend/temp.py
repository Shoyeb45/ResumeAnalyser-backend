import json
import re

def extract_json_from_response(response_text):
    """
    Extract JSON string from LLM response that may contain extra text.
    
    Args:
        response_text (str): The raw response from the LLM
        
    Returns:
        str: Clean JSON string, or None if no valid JSON found
    """
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

def parse_resume_with_json_extraction(groq_response):
    """
    Parse resume response and extract clean JSON.
    
    Args:
        groq_response: The response object from Groq API
        
    Returns:
        dict: Parsed JSON data, or None if extraction failed
    """
    try:
        # Get the response text
        response_text = groq_response.choices[0].message.content
        
        # Extract JSON string
        json_string = extract_json_from_response(response_text)
        
        if json_string:
            # Parse and return as dictionary
            return json.loads(json_string)
        else:
            print("Warning: Could not extract valid JSON from response")
            print("Raw response:", response_text[:200] + "..." if len(response_text) > 200 else response_text)
            return None
            
    except Exception as e:
        print(f"Error parsing resume response: {str(e)}")
        return None

import os
from groq import Groq
from dotenv import load_dotenv
load_dotenv()

def _initialize_groq_client():
    """
    Initialize Groq client for AI analysis
    
    Returns:
        Optional[Groq]: Groq client instance or None if initialization fails
    """
    try:
        client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        print("Groq client initialized successfully")
        return client
    except Exception as e:
        print(f"Error initializing Groq client: {e}")
        return None
    
groq_client = _initialize_groq_client()

def create_resume_parser_prompt(text):
    prompt = f"""EXTRACT RESUME DATA TO JSON ONLY.

JSON SCHEMA:
{{
  "resume_details": {{
    "personal_info": {{
      "name": "candidate full name",
      "contact_info": {{
        "email": "email address",
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
        "description": "brief project description",
        "project_link": "project url if available",
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
        "date_achieved": "date of achievement",
        "organisation": "awarding organization"
      }}
    ],
    "certifications": [
      {{
        "certificate_name": "certification name",
        "issuing_organization": "issuing body",
        "date_issued": "issue date",
        "expiry_date": "expiry date if applicable",
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
        "date": {{
          "start": "start date",
          "end": "end date"
        }},
        "bullet_points": ["activity detail 1", "activity detail 2"]
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

CRITICAL: Please return ONLY the JSON object. No explanations, no markdown, no additional text. Start with {{ and end with }}."""

    return prompt
  
text = """
�
Shoyeb Ansari
&, +91 9327156940 & shoyebff45@gmail.com 9 Bangalore, Karnataka @ shoyeb.vercel.app in shoyebansari45
� Shoyeb45 � </> Codeforces: Shoyeb45 </> Leetcode : Shoyeb45

Learning new things and applying them in real life is completely different things. Just eager to apply my skills in some handful projects and
use them in real life to get better understanding of my skills and learn something new.

Projects

AVL Tree Visualizer: JavaFX
+ Developed an interactive AVL tree visualization tool in JavaFX, showcasing insertion, deletion, searching, and various tree traver-
sals with animations. Implemented self-balancing rotations (LL, LR, RR, RL)
� Tech Stack: Java 17, JavaFX 22, OOP, Data Structures & Algorithms.
Github Repo Link

Solantix: Solana Indexing Platform

+ Developed a full-stack NFT and token indexing platform on the Solana blockchain, integrating real-time webhook listeners and
PostgreSQL support, enabling 1000+ blockchain events per hour to be processed and queried via a responsive Next.js dashboard.

+ Implemented modular backend architecture using Node.js and Express, optimizing API latency by 30% through caching and
batch processing, while ensuring secure user-level data isolation with dynamic PostgreSQL connection pools.

Github Repo Link| Live Website

EasyPay: Digital Payment App
+ Developed a payment application with user authentication (sign-up/sign-in) and peer-to-peer transactions using Express.js and
MongoDB with transaction support.
+ Designed an admin-controlled virtual credit system to simulate money transfer between users securely.
Github Repo Link| Live Website

Education
Indian Institute of Technology, Guwahati Oct. 2023 to 2027
* Online Bsc(Hons) in DS and Al - 9 CGPA
Jawahar Navodaya Vidyalaya, Dumra Apr. 2021 to 2022
+ HSC CBSE Board - 94%
Jawahar Navodaya Vidyalaya, Dumra Apr. 2019 to 2020

� SSC CBSE Board - 94 %

Technologies and Skills

Languages: Python, Django, HTML, CSS, Javascript, Typescript, Java, SQL, Express, React

Software and tools: Git-Version Control, Excel, Windows, Linux, Basic AWS deployments

Achievements

President of the college Tech Club, leading a thrival community of coders and developers to foster innovation and technical skill de-
velopment.

Second Runner-Up in the Rajasthan Police Hackathon, a prestigious national-level competition. Our team was victorious out of 1665
teams

Solved 950+ problems across LeetCode and Codeforces, achieving a peak rating of 1758 on LeetCode and Pupil rank (1255) on Code-
forces, showcasing strong algorithmic-thinking skills.
"""

prompt = create_resume_parser_prompt(text)


response = groq_client.chat.completions.create(
                model="llama3-8b-8192",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=4000,
                temperature=0.7
            )
analysis = response.choices[0].message.content.strip()
with open("out1.json", "w") as file:
    file.write(extract_json_from_response(analysis))