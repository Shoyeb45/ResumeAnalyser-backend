"""
Resume Repository - CRUD Operations related to resume 
Handles all database operations for Resume documents 
"""

from typing import List, Optional, Dict, Any
from datetime import datetime
from beanie import PydanticObjectId
from beanie.operators import In, RegEx, Eq, And, Or
from pymongo import DESCENDING, ASCENDING
from pymongo.errors import DuplicateKeyError
import logging

logger = logging.getLogger(__name__)

from .models import (
    Resume, ContactInfo, ProjectDetails, Education, SkillGroup, 
    Achievement, Language, Certification, WorkExperience, 
    Publication, Extracurricular, create_resume_model
)


class ResumeRepository:
    """Optimized repository for Resume CRUD operations"""
    
    # ============= CREATE OPERATIONS =============
    
    @staticmethod
    async def create_resume(user_id: str, resume_metadata: Dict[str, Any], resume_details: Dict[str, Any]) -> Resume:
        """
        Create a new resume with optimized field handling
        
        Args:
            resume_data: Dictionary containing resume data
            
        Returns:
            Created Resume document
            
        Raises:
            ValueError: If user already has a primary resume when creating another primary
        """
        # Handle primary resume logic
        # if resume_details.get('is_primary', False):
        #     await ResumeRepository._ensure_single_primary_resume(resume_details['user_id'])
        
        # Set timestamps
        now = datetime.utcnow()
        resume_details.update({
            'created_at': now,
            'updated_at': now
        })
        
        resume = create_resume_model(
            user_id=user_id,
            resume_details=resume_details,
            resume_metadata=resume_metadata
        )
        await resume.insert()
        logger.info("Resume added in database")
        return resume
    
    @staticmethod
    async def bulk_create_resumes(resumes_data: List[Dict[str, Any]]) -> List[Resume]:
        """
        Bulk create multiple resumes with validation
        
        Args:
            resumes_data: List of resume data dictionaries
            
        Returns:
            List of created Resume documents
        """
        now = datetime.utcnow()
        resumes = []
        
        for resume_data in resumes_data:
            resume_data.update({
                'created_at': now,
                'updated_at': now
            })
            resumes.append(Resume(**resume_data))
        
        # Handle primary resume conflicts before bulk insert
        primary_resumes = [r for r in resumes if r.is_primary]
        if primary_resumes:
            user_ids = {r.user_id for r in primary_resumes}
            for user_id in user_ids:
                await ResumeRepository._ensure_single_primary_resume(user_id)
        
        await Resume.insert_many(resumes)
        return resumes
    
    # ============= READ OPERATIONS =============
    
    @staticmethod
    async def get_resume_by_id(resume_id: PydanticObjectId) -> Optional[Resume]:
        """Get resume by ID with optimized query"""
        return await Resume.get(resume_id)
    
    @staticmethod
    async def get_user_resumes(
        user_id: str
        # limit: int = 50,
        # offset: int = 0,
        # sort_by: str = "updated_at",
        # sort_order: int = DESCENDING
    ) -> List[Resume]:
        """
        Get all resumes for a user with pagination and sorting
        
        Args:
            user_id: User's ObjectId
            limit: Maximum number of resumes to return
            offset: Number of resumes to skip
            sort_by: Field to sort by
            sort_order: Sort order (ASCENDING or DESCENDING)
        """
        user_id = PydanticObjectId(user_id)
        return await Resume.find(
            Resume.user_id == user_id
        ).to_list()
        # return await Resume.find(
        #     Resume.user_id == user_id
        # ).sort([(sort_by, sort_order)]).skip(offset).limit(limit).to_list()
    
    @staticmethod
    async def get_primary_resume(user_id: PydanticObjectId) -> Optional[Resume]:
        """Get user's primary resume"""
        return await Resume.find_one(
            And(Resume.user_id == user_id, Resume.is_primary == True)
        )
    
    @staticmethod
    async def search_resumes(
        user_id: Optional[PydanticObjectId] = None,
        keywords: Optional[List[str]] = None,
        min_score: Optional[float] = None,
        skills: Optional[List[str]] = None,
        companies: Optional[List[str]] = None,
        limit: int = 50,
        offset: int = 0
    ) -> List[Resume]:
        """
        Advanced search with multiple filters
        
        Args:
            user_id: Filter by user ID (optional)
            keywords: Search in keywords field
            min_score: Minimum analysis score
            skills: Filter by skills
            companies: Filter by company names in work experience
            limit: Maximum results
            offset: Results to skip
        """
        filters = []
        
        if user_id:
            filters.append(Resume.user_id == user_id)
        
        if keywords:
            # Use regex for flexible keyword matching
            keyword_filters = [RegEx(Resume.keywords, keyword, "i") for keyword in keywords]
            filters.append(Or(*keyword_filters))
        
        if min_score is not None:
            filters.append(Resume.analysis_score >= min_score)
        
        if skills:
            # Search in skills array (nested field search)
            filters.append(In("skills.skills", skills))
        
        if companies:
            # Search in work experience company names
            filters.append(In("work_experiences.company_name", companies))
        
        query = And(*filters) if filters else {}
        
        return await Resume.find(query).sort([
            ("analysis_score", DESCENDING),
            ("updated_at", DESCENDING)
        ]).skip(offset).limit(limit).to_list()
    
    @staticmethod
    async def get_resume_analytics(user_id: PydanticObjectId) -> Dict[str, Any]:
        """
        Get analytics data for user's resumes
        
        Returns:
            Dictionary with analytics information
        """
        pipeline = [
            {"$match": {"user_id": user_id}},
            {"$group": {
                "_id": None,
                "total_resumes": {"$sum": 1},
                "avg_score": {"$avg": "$analysis_score"},
                "max_score": {"$max": "$analysis_score"},
                "min_score": {"$min": "$analysis_score"},
                "last_updated": {"$max": "$updated_at"},
                "total_projects": {"$sum": {"$size": "$projects"}},
                "total_work_experiences": {"$sum": {"$size": "$work_experiences"}},
                "total_certifications": {"$sum": {"$size": "$certifications"}}
            }}
        ]
        
        result = await Resume.aggregate(pipeline).to_list()
        return result[0] if result else {}
    
    # ============= UPDATE OPERATIONS =============
    
    @staticmethod
    async def update_resume(
        resume_id: PydanticObjectId,
        update_data: Dict[str, Any],
        upsert: bool = False
    ) -> Optional[Resume]:
        """
        Update resume with optimized field updates
        
        Args:
            resume_id: Resume ID to update
            update_data: Fields to update
            upsert: Create if doesn't exist
            
        Returns:
            Updated Resume document
        """
        # Handle primary resume logic
        if 'is_primary' in update_data and update_data['is_primary']:
            resume = await Resume.get(resume_id)
            if resume:
                await ResumeRepository._ensure_single_primary_resume(resume.user_id, exclude_id=resume_id)
        
        # Add updated timestamp
        update_data['updated_at'] = datetime.utcnow()
        
        # Use atomic update operations
        resume = await Resume.get(resume_id)
        if not resume and not upsert:
            return None
        
        if resume:
            # Update existing document
            for key, value in update_data.items():
                setattr(resume, key, value)
            await resume.save()
            return resume
        elif upsert:
            # Create new document
            return await ResumeRepository.create_resume(update_data)
    
    @staticmethod
    async def update_resume_section(
        resume_id: PydanticObjectId,
        section: str,
        section_data: Any
    ) -> Optional[Resume]:
        """
        Update specific resume section efficiently
        
        Args:
            resume_id: Resume ID
            section: Section name (e.g., 'contact_info', 'projects')
            section_data: New section data
        """
        update_data = {
            section: section_data,
            'updated_at': datetime.utcnow()
        }
        
        return await ResumeRepository.update_resume(resume_id, update_data)
    
    @staticmethod
    async def add_to_array_field(
        resume_id: PydanticObjectId,
        field_name: str,
        item: Any
    ) -> Optional[Resume]:
        """
        Add item to array field (projects, education, etc.)
        
        Args:
            resume_id: Resume ID
            field_name: Array field name
            item: Item to add
        """
        resume = await Resume.get(resume_id)
        if not resume:
            return None
        
        array_field = getattr(resume, field_name, [])
        array_field.append(item)
        setattr(resume, field_name, array_field)
        resume.updated_at = datetime.utcnow()
        
        await resume.save()
        return resume
    
    @staticmethod
    async def update_analysis_score(
        resume_id: PydanticObjectId,
        score: float,
        analyzed_at: Optional[datetime] = None
    ) -> Optional[Resume]:
        """Update resume analysis score and timestamp"""
        update_data = {
            'analysis_score': score,
            'last_analyzed': analyzed_at or datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
        
        return await ResumeRepository.update_resume(resume_id, update_data)
    
    @staticmethod
    async def bulk_update_scores(
        score_updates: List[Dict[str, Any]]
    ) -> int:
        """
        Bulk update analysis scores for multiple resumes
        
        Args:
            score_updates: List of {'resume_id': ObjectId, 'score': float}
            
        Returns:
            Number of updated documents
        """
        updated_count = 0
        for update in score_updates:
            result = await ResumeRepository.update_analysis_score(
                update['resume_id'], 
                update['score']
            )
            if result:
                updated_count += 1
        
        return updated_count
    
    # ============= DELETE OPERATIONS =============
    
    @staticmethod
    async def delete_resume(resume_id: str) -> bool:
        """
        Delete resume by ID
        
        Returns:
            True if deleted, False if not found
        """
        
        resume = await Resume.get(PydanticObjectId(resume_id))
        if not resume:
            return False
        
        await resume.delete()
        return True
    
    @staticmethod
    async def delete_user_resumes(user_id: PydanticObjectId) -> int:
        """
        Delete all resumes for a user
        
        Returns:
            Number of deleted resumes
        """
        result = await Resume.find(Resume.user_id == user_id).delete()
        return result.deleted_count
    
    @staticmethod
    async def soft_delete_resume(resume_id: PydanticObjectId) -> Optional[Resume]:
        """
        Soft delete by adding deleted flag (if you want to implement soft deletes)
        """
        update_data = {
            'is_deleted': True,
            'deleted_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
        
        return await ResumeRepository.update_resume(resume_id, update_data)
    
    # ============= UTILITY METHODS =============
    
    @staticmethod
    async def _ensure_single_primary_resume(
        user_id: PydanticObjectId,
        exclude_id: Optional[PydanticObjectId] = None
    ):
        """Ensure user has only one primary resume"""
        query = Resume.user_id == user_id
        if exclude_id:
            query = And(query, Resume.id != exclude_id)
        
        # Set all other resumes as non-primary
        await Resume.find(query).update({"$set": {"is_primary": False, "updated_at": datetime.utcnow()}})
    
    @staticmethod
    async def count_user_resumes(user_id: PydanticObjectId) -> int:
        """Count total resumes for a user"""
        return await Resume.find(Resume.user_id == user_id).count()
    
    @staticmethod
    async def get_recent_resumes(limit: int = 10) -> List[Resume]:
        """Get recently updated resumes across all users"""
        return await Resume.find().sort([("updated_at", DESCENDING)]).limit(limit).to_list()
    
    @staticmethod
    async def get_top_scored_resumes(limit: int = 10) -> List[Resume]:
        """Get highest scored resumes"""
        return await Resume.find(
            Resume.analysis_score != None
        ).sort([("analysis_score", DESCENDING)]).limit(limit).to_list()
    
    @staticmethod
    async def exists(resume_id: PydanticObjectId) -> bool:
        """Check if resume exists"""
        count = await Resume.find(Resume.id == resume_id).count()
        return count > 0
    
    @staticmethod
    async def get_resumes_by_skill(skill: str, limit: int = 50) -> List[Resume]:
        """Find resumes containing specific skill"""
        return await Resume.find(
            RegEx("skills.skills", skill, "i")
        ).limit(limit).to_list()
    
    @staticmethod
    async def get_resumes_by_company(company: str, limit: int = 50) -> List[Resume]:
        """Find resumes with work experience at specific company"""
        return await Resume.find(
            RegEx("work_experiences.company_name", company, "i")
        ).limit(limit).to_list()
        
        
resume_repository = ResumeRepository()