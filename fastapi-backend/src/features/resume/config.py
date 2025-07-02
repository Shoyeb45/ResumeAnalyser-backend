import os

class ResumeAnalyzerConfig:
    """Configuration class for resume analyzer settings"""
    
    # API Configuration
    GROQ_API_KEY = os.getenv("GROQ_API_KEY")
    MODEL = "llama3-8b-8192"
    
    # OCR Configuration
    TESSERACT_PATH = r"C:\\Program Files\\Tesseract-OCR\\tesseract.exe"
    
    # Skills Database
    TECHNICAL_SKILLS = [
        "python", "java", "c++", "sql", "html", "css", "javascript", "machine learning",
        "deep learning", "flask", "django", "pytorch", "tensorflow", "react", "angular",
        "git", "docker", "kubernetes", "linux", "azure", "aws", "data analysis", "nlp",
        "openai", "pandas", "numpy", "matplotlib", "power bi", "tableau", "spark", "hadoop",
        "node.js", "express.js", "mongodb", "postgresql", "mysql", "redis", "elasticsearch",
        "fastapi", "spring boot", "microservices", "devops", "ci/cd", "jenkins", "terraform"
    ]
    
    SOFT_SKILLS = [
        "communication", "teamwork", "leadership", "adaptability", "creativity",
        "problem solving", "time management", "critical thinking", "attention to detail",
        "collaboration", "empathy", "work ethic", "analytical thinking", "innovation",
        "project management", "strategic planning", "decision making", "mentoring"
    ]