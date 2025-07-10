import logging
from typing import Dict, List, Optional

logger = logging.getLogger(__name__)

class SectionExtractor:
    """Extracts structured sections from resume text"""
    
    def __init__(self, logger: logging.Logger):
        # self.logger = logger
        
        # Section keywords mapping
        self.section_keywords = {
            'professional_summary': ['summary', 'objective', 'profile', 'about'],
            'education': ['education', 'qualification', 'academic', 'degree'],
            'experience': ['experience', 'employment', 'work', 'internship', 'job'],
            'skills': ['skills', 'technical skills', 'tools', 'competencies', 'technologies'],
            'projects': ['project', 'portfolio'],
            'certifications': ['certification', 'certificate'],
            'achievements': ['achievement', 'award', 'honor', 'accomplishment'],
            'languages': ['languages', 'language']
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
            
            
            current_section = None
            # Split text into lines and process
            lines = text.split('\n')

            for line in lines:
                line_strip = line.strip()
                if not line_strip:
                    continue

                line_lower = line_strip.lower()

                # Check if line is a section header
                for section, keywords in self.section_keywords.items():
                    if any(keyword in line_lower for keyword in keywords) and len(line_strip) < 100:
                        current_section = section
                        break
                else:
                    # Add content to current section
                    if current_section and line_strip:
                        sections[current_section].append(line_strip)
            
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
