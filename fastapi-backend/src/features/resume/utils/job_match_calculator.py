import logging
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

logger = logging.getLogger(__name__)

class JobMatchCalculator:
    """Calculates job matching scores using various algorithms"""
    
    def __init__(self, logger: logging.Logger):
        # self.logger = logger
        pass
    
    def calculate_cosine_similarity_score(self, resume_text: str, job_description: str) -> float:
        """
        Calculate similarity score between resume and job description using TF-IDF and cosine similarity
        
        Args:
            resume_text (str): Resume text
            job_description (str): Job description text
            
        Returns:
            float: Similarity score as percentage
        """
        try:
            if not job_description:
                return 0.0
            
            # Create TF-IDF vectors
            vectorizer = TfidfVectorizer(
                stop_words='english',
                max_features=1000,  # Limit features for efficiency
                ngram_range=(1, 2)  # Include bigrams
            )
            
            # Fit and transform documents
            tfidf_matrix = vectorizer.fit_transform([resume_text, job_description])
            
            # Calculate cosine similarity
            similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
            similarity_percentage = round(similarity * 100, 2)
            
            logger.info(f"Calculated cosine similarity score: {similarity_percentage}%")
            
            return similarity_percentage
            
        except Exception as e:
            logger.error(f"Error calculating job match score: {e}")
            return 0.0
