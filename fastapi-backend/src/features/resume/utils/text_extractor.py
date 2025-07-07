import  pytesseract
import logging
from docx import Document
from pdf2image import convert_from_path
from features.resume.config import ResumeAnalyzerConfig
from transformers import pipeline
import fitz
from PIL import Image
import PyPDF2, io, cv2
import numpy as np
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
    
    def preprocess_image(self, pil_img: Image.Image) -> Image.Image:
        """Improve OCR quality with thresholding"""
        cv_img = np.array(pil_img)
        if len(cv_img.shape) == 3:
            gray = cv2.cvtColor(cv_img, cv2.COLOR_RGB2GRAY)
        else:
            gray = cv_img
        _, thresh = cv2.threshold(gray, 150, 255, cv2.THRESH_BINARY)
        return Image.fromarray(thresh)
    
    def _extract_from_pdf(self, pdf_path: str) -> str:
        """
        Extract text from PDF using OCR
        
        Args:
            pdf_path (str): Path to PDF file
            
        Returns:
            str: Extracted text from all pages
        """
        try:
            
            with open(pdf_path, "rb") as file:
                file_content = file.read()
                
            # Method 1: Try PyMuPDF
            try:
                logger.info("Trying PyMuPDF text extraction...")
                doc = fitz.open(stream=file_content, filetype="pdf")
                text = ""
                for page in doc:
                    page_text = page.get_text("text")
                    text += page_text + "\\"
                doc.close()
                if len(text.strip()) > 50:
                    with open("out.txt", "w") as file:
                        file.write(text.strip())
                    logger.info("PyMuPDF extraction successful")
                    return text.strip()
            except Exception as e:
                logger.warning(f"PyMuPDF failed: {e}")

            # Method 2: Try PyPDF2
            try:
                logger.info("Trying PyPDF2 text extraction...")
                pdf_reader = PyPDF2.PdfReader(io.BytesIO(file_content))
                text = ""
                for page in pdf_reader.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
                if len(text.strip()) > 50:
                    logger.info("PyPDF2 extraction successful")
                    with open("out.txt", "w") as file:
                        file.write(text.strip())
                    return text.strip()
            except Exception as e:
                logger.warning(f"PyPDF2 failed: {e}")

            # Method 3: OCR fallback
            try:
                logger.info("Trying OCR extraction...")
                doc = fitz.open(stream=file_content, filetype="pdf")
                text = ""
                for page in doc:
                    # Render page to image at higher resolution
                    pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))  # 2x scale for better OCR
                    img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)

                    # Preprocess image for better OCR
                    clean_img = self.preprocess_image(img)

                    # Extract text using OCR
                    ocr_text = pytesseract.image_to_string(clean_img, lang="eng")
                    text += ocr_text + "\n"
                doc.close()

                if len(text.strip()) > 50:
                    logger.info("OCR extraction successful")
                    with open("out.txt", "w") as file:
                        file.write(text.strip())
                        
                    return text.strip()
            except Exception as e:
                logger.warning(f"OCR failed: {e}")

            logger.error("All PDF extraction methods failed")
            return "Could not extract sufficient text from the PDF file."

        except Exception as e:
            logger.error(f"Fatal error in PDF extraction: {e}")
            return f"Error extracting text: {str(e)}"
    
   
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
