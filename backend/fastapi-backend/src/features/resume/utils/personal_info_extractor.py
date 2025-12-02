import logging
from features.resume.config import ResumeAnalyzerConfig
from typing import Dict, Any, Optional
from transformers import pipeline
import re
from features.resume.utils.utils import NLPAnalyzer
# from features.resume.schemas import ContactInfo
logger = logging.getLogger(__name__)


class PersonalInfoExtractor:
    """Extracts personal information from resume text"""
    
    def __init__(self, nlp_analyzer: NLPAnalyzer, logger: logging.Logger):
        self.nlp_analyzer = nlp_analyzer
        # self.logger = logger
        
        # Regex patterns for personal information
        self.email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        self.phone_pattern = r'[\+]?[1-9]?[0-9]{7,15}'
        self.github_pattern = r'github\.com/[A-Za-z0-9_-]+'
        self.linkedin_pattern = r'linkedin\.com/in/[A-Za-z0-9_-]+'
    
    def extract_personal_info(self, text: str) -> Dict[str, Optional[str]]:
        """
        Extract personal information from resume text
        
        Args:
            text (str): Resume text to analyze
            
        Returns:
            Dict[str, Optional[str]]: Extracted personal information
        """
        try:
            # Initialize result dictionary
            personal_info = {
                "name": "Not Found",
                "email": "Not Found", 
                "mobile": "Not Found",
                "location": "Not Found",
                "social_links": []
            }
            
            # Extract using NLP if available
            if self.nlp_analyzer.nlp_model:
                personal_info.update(self._extract_with_nlp(text))
            
            # Extract using regex patterns
            personal_info.update(self._extract_with_regex(text))
            
            return personal_info
            
        except Exception as e:
            logger.error(f"Error extracting personal info: {e}")
            return {
                "name": "Not Found",
                "email": "Not Found", 
                "mobile": "Not Found",
                "location": "Not Found",
                "social_links": []
            }
    
    def _extract_with_nlp(self, text: str) -> Dict[str, str]:
        """
        Extract personal info using NLP named entity recognition
        
        Args:
            text (str): Resume text
            
        Returns:
            Dict[str, str]: Extracted entities
        """
        info = {}
        doc = self.nlp_analyzer.nlp_model(text)
        
        names = []
        locations = []
        
        for ent in doc.ents:
            # Extract person names (limit to reasonable length)
            if ent.label_ == "PERSON" and len(ent.text.split()) <= 3:
                names.append(ent.text)
            # Extract locations
            elif ent.label_ in ["GPE", "LOC"]:
                locations.append(ent.text)
        
        if names:
            info["name"] = names[0]
        if locations:
            info["location"] = locations[0]
            
        return info
    
    def _extract_with_regex(self, text: str) -> Dict[str, Optional[str]]:
        """
        Extract personal info using regex patterns
        
        Args:
            text (str): Resume text
            
        Returns:
            Dict[str, Optional[str]]: Extracted contact information
        """
        info = {}
        
        # Extract email addresses
        emails = re.findall(self.email_pattern, text)
        if emails:
            info["email"] = emails[0]
        
        # Extract phone numbers
        phones = re.findall(self.phone_pattern, text)
        if phones:
            info["mobile"] = phones[0]
        
        github_urls = re.findall(self.github_pattern, text)
        linkedin_urls = re.findall(self.linkedin_pattern, text)

        social_links = {}
        if github_urls:
            social_links['github'] = f"https://{github_urls[0]}"
        if linkedin_urls:
            social_links['linkedin'] = f"https://{linkedin_urls[0]}"

        info["social_links"] = social_links
            
        return info
