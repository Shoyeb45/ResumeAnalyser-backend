import  pytesseract
import logging
from docx import Document
from pdf2image import convert_from_path
from features.resume.config import ResumeAnalyzerConfig
from transformers import pipeline


logger = logging.getLogger(__name__)

class TextExtractor:
    """Handles text extraction from various file formats"""
    
    def __init__(self, logger: logging.Logger):
        # self.logger = logger
        self._setup_tesseract()
    
    def _setup_tesseract(self) -> None:
        """Configure Tesseract OCR path"""
        pytesseract.pytesseract.tesseract_cmd = ResumeAnalyzerConfig.TESSERACT_PATH
    
    def extract_text_from_file(self, file_path: str, file_type: str) -> str:
        """
        Extract text from different file types
        
        Args:
            file_path (str): Path to the file
            file_type (str): Type of file (pdf, docx, txt)
            
        Returns:
            str: Extracted text content
            
        Raises:
            ValueError: If file type is not supported
            Exception: If text extraction fails
        """
        try:
            file_type_lower = file_type.lower()
            
            if file_type_lower == 'pdf':
                return self._extract_from_pdf(file_path)
            elif file_type_lower in ['docx', 'doc']:
                return self._extract_from_docx(file_path)
            elif file_type_lower == 'txt':
                return self._extract_from_txt(file_path)
            else:
                raise ValueError(f"Unsupported file type: {file_type}")
                
        except Exception as e:
            logger.error(f"Error extracting text from {file_type} file: {e}")
            raise
    
    def _extract_from_pdf(self, pdf_path: str) -> str:
        """
        Extract text from PDF using OCR
        
        Args:
            pdf_path (str): Path to PDF file
            
        Returns:
            str: Extracted text from all pages
        """
        try:
            images = convert_from_path(pdf_path)
            extracted_text = ""
            
            for page_num, img in enumerate(images, 1):
                logger.info(f"Processing PDF page {page_num}")
                page_text = pytesseract.image_to_string(img)
                extracted_text += page_text + "\n"
                
            return extracted_text.strip()
            
        except Exception as e:
            logger.error(f"Error extracting text from PDF: {e}")
            raise
    
    def _extract_from_docx(self, docx_path: str) -> str:
        """
        Extract text from DOCX file
        
        Args:
            docx_path (str): Path to DOCX file
            
        Returns:
            str: Extracted text from document
        """
        try:
            doc = Document(docx_path)
            extracted_text = ""
            
            for paragraph in doc.paragraphs:
                if paragraph.text.strip():  # Skip empty paragraphs
                    extracted_text += paragraph.text + "\n"
                    
            return extracted_text.strip()
            
        except Exception as e:
            logger.error(f"Error extracting text from DOCX: {e}")
            raise
    
    def _extract_from_txt(self, txt_path: str) -> str:
        """
        Extract text from TXT file
        
        Args:
            txt_path (str): Path to TXT file
            
        Returns:
            str: File content as string
        """
        try:
            with open(txt_path, 'r', encoding='utf-8') as file:
                return file.read()
                
        except Exception as e:
            logger.error(f"Error reading TXT file: {e}")
            raise
