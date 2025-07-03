import os

class ResumeAnalyzerConfig:
    """Configuration class for resume analyzer settings"""
    
    # API Configuration
    GROQ_API_KEY = os.getenv("GROQ_API_KEY")
    MODEL = "llama3-8b-8192"
    
    # OCR Configuration
    TESSERACT_PATH = r"C:\\Program Files\\Tesseract-OCR\\tesseract.exe"
    
    # Skills Database
    TECHNICAL_SKILLS = {
        "Programming Languages": [
            "python", "java", "javascript", "typescript", "c++", "c#", "go", "rust", 
            "php", "ruby", "swift", "kotlin", "scala", "r", "matlab", "perl"
        ],
        "Web Technologies": [
            "html", "css", "react", "angular", "vue.js", "node.js", "express.js",
            "django", "flask", "spring boot", "laravel", "asp.net", "bootstrap"
        ],
        "Databases": [
            "mysql", "postgresql", "mongodb", "redis", "sqlite", "oracle", 
            "sql server", "cassandra", "elasticsearch", "neo4j"
        ],
        "Cloud Platforms": [
            "aws", "azure", "google cloud", "gcp", "heroku", "digitalocean",
            "kubernetes", "docker", "terraform", "ansible"
        ],
        "Data Science & Analytics": [
            "pandas", "numpy", "scikit-learn", "tensorflow", "pytorch", "keras",
            "tableau", "power bi", "jupyter", "spark", "hadoop"
        ],
        "Development Tools": [
            "git", "github", "gitlab", "jira", "confluence", "jenkins", "ci/cd",
            "visual studio", "intellij", "eclipse", "postman", "swagger"
        ],
        "Testing": [
            "junit", "pytest", "selenium", "cypress", "jest", "mocha", 
            "unit testing", "integration testing", "automation testing"
        ],
        "Mobile Development": [
            "android", "ios", "react native", "flutter", "xamarin", "cordova"
        ]
    }
    
    SOFT_SKILLS = {
        "Communication": [
            "communication", "presentation", "public speaking", "writing",
            "documentation", "storytelling", "active listening"
        ],
        "Leadership": [
            "leadership", "team management", "mentoring", "coaching",
            "delegation", "decision making", "strategic thinking"
        ],
        "Collaboration": [
            "teamwork", "collaboration", "cross-functional", "stakeholder management",
            "conflict resolution", "negotiation", "interpersonal skills"
        ],
        "Problem Solving": [
            "problem solving", "analytical thinking", "critical thinking",
            "troubleshooting", "debugging", "innovation", "creativity"
        ],
        "Project Management": [
            "project management", "agile", "scrum", "kanban", "waterfall",
            "planning", "organization", "time management", "prioritization"
        ],
        "Adaptability": [
            "adaptability", "flexibility", "learning agility", "resilience",
            "change management", "continuous learning"
        ]
    }