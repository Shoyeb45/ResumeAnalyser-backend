import pdfplumber, pytesseract
import logging, io
from fastapi import HTTPException
from docx import Document
import numpy as np
import cv2, spacy
from pdf2image import convert_from_path
from features.resume.config import ResumeAnalyzerConfig
from typing import Dict, Any, Optional
from transformers import pipeline
import re

logger = logging.getLogger(__name__)


class NLPAnalyzer:
    """Handles Natural Language Processing tasks for resume analysis"""
    
    def __init__(self, logger: logging.Logger):
        # self.logger = logger
        self.nlp_model = None
        self.classifier = None
        self._initialize_models()
    
    def _initialize_models(self) -> None:
        """Initialize NLP models and classifiers"""
        try:
            # Load spaCy model for NLP processing
            self.nlp_model = spacy.load("en_core_web_sm")
            logger.info("spaCy model loaded successfully")
            
            # Load zero-shot classification model
            self.classifier = pipeline(
                "zero-shot-classification", 
                model="facebook/bart-large-mnli"
            )
            logger.info("Zero-shot classifier loaded successfully")
            
        except Exception as e:
            logger.error(f"Error initializing NLP models: {e}")
            self.nlp_model = None
            self.classifier = None
    
    def analyze_text_with_nlp(self, text: str, target_role: str = "Software Engineer") -> Dict[str, Any]:
        """
        Perform comprehensive NLP analysis on resume text
        
        Args:
            text (str): Resume text to analyze
            target_role (str): Target job role for matching
            
        Returns:
            Dict[str, Any]: Analysis results including entities, keywords, and role matching
        """
        try:
            if not self.nlp_model:
                return self._get_fallback_analysis(text, target_role)
            
            # Process text with spaCy
            doc = self.nlp_model(text)
            
            # Extract named entities
            entities = [
                (ent.text, ent.label_) 
                for ent in doc.ents 
                if len(ent.text.strip()) > 2
            ]
            
            # Extract meaningful keywords from noun chunks
            keywords = list({
                chunk.text.strip().lower() 
                for chunk in doc.noun_chunks 
                if len(chunk.text.strip()) > 3
            })
            
            # Perform role matching if classifier is available
            if self.classifier:
                role_match_result = self.classifier(text, [target_role])
                match_score = round(role_match_result["scores"][0] * 100, 2)
                matched_role = role_match_result["labels"][0]
            else:
                match_score = 75.0  # Default fallback score
                matched_role = target_role
            
            return {
                "word_count": len(doc),
                "entities": entities[:10],  # Limit to top 10 entities
                "keywords": keywords[:15],  # Limit to top 15 keywords
                "role_match_score": match_score,
                "role_matched": matched_role
            }
            
        except Exception as e:
            logger.error(f"Error in NLP analysis: {e}")
            return self._get_fallback_analysis(text, target_role)
    
    def _get_fallback_analysis(self, text: str, target_role: str) -> Dict[str, Any]:
        """
        Provide fallback analysis when NLP models are unavailable
        
        Args:
            text (str): Resume text
            target_role (str): Target job role
            
        Returns:
            Dict[str, Any]: Basic analysis results
        """
        return {
            "word_count": len(text.split()),
            "entities": [],
            "keywords": [],
            "role_match_score": 75.0,
            "role_matched": target_role
        }
