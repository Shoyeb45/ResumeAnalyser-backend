import logging
from typing import Dict, List, Optional

logger = logging.getLogger(__name__)

class SectionExtractor:
    """Extracts structured sections from resume text"""
    
    def __init__(self, logger: logging.Logger):
        # self.logger = logger
        
        # Section keywords mapping
        self.section_keywords = {
            'summary': ['summary', 'objective', 'profile', 'about'],
            'education': ['education', 'qualification', 'academic', 'degree'],
            'workExperience': ['experience', 'employment', 'work history', 'career'],
            'skills': ['skill', 'competenc', 'technical', 'abilities'],
            'projects': ['project', 'portfolio', 'work'],
            'certifications': ['certification', 'certificate', 'credential'],
            'achievements': ['achievement', 'award', 'honor', 'accomplishment']
        }
    
    def extract_sections(self, text: str) -> Dict[str, List[str]]:
        """
        Extract structured sections from resume text
        
        Args:
            text (str): Resume text to analyze
            
        Returns:
            Dict[str, List[str]]: Extracted sections with content
        """
        try:
            # Initialize sections dictionary
            sections = {section: [] for section in self.section_keywords.keys()}
            
            # Split text into lines and process
            lines = text.split('\n')
            current_section = None
            
            for line in lines:
                line = line.strip()
                if not line:
                    continue
                
                line_lower = line.lower()
                
                # Check if line is a section header
                detected_section = self._detect_section(line_lower)
                if detected_section:
                    current_section = detected_section
                    logger.debug(f"Detected section: {current_section}")
                    continue
                
                # Add content to current section
                if current_section and line:
                    sections[current_section].append(line)
            
            # Log section extraction results
            for section, content in sections.items():
                if content:
                    logger.info(f"Extracted {len(content)} items from {section}")
            
            return sections
            
        except Exception as e:
            logger.error(f"Error extracting sections: {e}")
            return {section: [] for section in self.section_keywords.keys()}
    
    def _detect_section(self, line: str) -> Optional[str]:
        """
        Detect which section a line belongs to based on keywords
        
        Args:
            line (str): Line of text to analyze
            
        Returns:
            Optional[str]: Detected section name or None
        """
        for section, keywords in self.section_keywords.items():
            if any(keyword in line for keyword in keywords):
                return section
        return None
