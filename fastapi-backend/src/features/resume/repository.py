"""
Resume Repository - CRUD Operations related to resume 
Handles all database operations for Resume documents 
"""
import json
from typing import List, Optional, Dict, Any
from datetime import datetime
from fastapi import HTTPException, status
from beanie import PydanticObjectId
from beanie.operators import In, RegEx, Eq, And, Or
from pydantic import ValidationError
from pymongo import DESCENDING, ASCENDING
from pymongo.errors import DuplicateKeyError
import logging
from bson import ObjectId

logger = logging.getLogger(__name__)

from .models import (
    Resume, ContactInfo, ProjectDetails, Education, SkillGroup, 
    Achievement, Language, Certification, WorkExperience, 
    Publication, Extracurricular, create_resume_model,
    ResumeAnalysis, ATSScore, ResumeDetailDescription, OverallAnalysis, 
    SectionDetail, SectionWiseAnalysis, LLMAnalysis
)


class ResumeRepository:
    """Optimized repository for Resume CRUD operations"""
    
    # ============= CREATE OPERATIONS =============
    
    @staticmethod
    async def create_resume_detail_and_analysis(user_id: str, resume_metadata: Dict[str, Any], resume_details: Dict[str, Any], resume_analysis: Dict[str, Any]):
        try:
            
            # first create the resume details in database
            resume = await ResumeRepository.create_resume(user_id, resume_metadata, resume_details)
            resume_id = resume.id
            
            if not resume:
                logger.error(f"Failed to create resume in database for user: {user_id}")
                raise Exception("Failed to create resume in database")
            
            # Then create resume analysis in database
            resume_analysis_in_db = await ResumeRepository.create_resume_analysis(resume_id, user_id, resume_analysis)
            if not resume_analysis_in_db:
                logger.error(f"Failed to create resume analysis in database for user: {user_id}")
                raise Exception("Failed to create resume analysis in database")
            

        except Exception as e:
            logger.error(f"Failed to create resume analysis and resume details in database for user: {user_id}, error: {e}")
            raise e
    
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
    
    async def upsert_resume(
        self,
        user_id: str, 
        resume_metadata: Dict[str, Any], 
        resume_details: Dict[str, Any], 
        resume_id: Optional[str] = None
    ) -> Resume:
        """
        Update existing resume or create new one if it doesn't exist
        
        Args:
            user_id: User ID string
            resume_metadata: Dictionary containing resume metadata
            resume_details: Dictionary containing all resume details
            resume_id: Optional resume ID for update operation
            
        Returns:
            Updated or created Resume document
            
        Raises:
            ValueError: If required fields are missing or invalid
            ValidationError: If data validation fails
            NotFoundError: If resume_id provided but resume doesn't exist
        """
        try:
            logger.info(f"Upserting resume for user: {user_id}, resume_id: {resume_id}")
            
            # Validate user_id format
            try:
                user_object_id = PydanticObjectId(user_id)
            except Exception as e:
                logger.error(f"Invalid user_id format: {user_id}")
                raise ValueError(f"Invalid user_id format: {str(e)}")
            
            existing_resume = None
            
            # Check if resume exists when resume_id is provided
            if resume_id:
                try:
                    resume_object_id = PydanticObjectId(resume_id)
                    existing_resume = await Resume.find_one(
                        {"_id": resume_object_id, "user_id": user_object_id}
                    )
                    
                    if not existing_resume:
                        logger.error(f"Resume not found with id: {resume_id} for user: {user_id}")
                        raise ValueError(f"Resume not found with id: {resume_id}")
                        
                except Exception as e:
                    logger.error(f"Invalid resume_id format: {resume_id}")
                    raise ValueError(f"Invalid resume_id format: {str(e)}")
            
            # Set timestamps
            now = datetime.utcnow()
            
            if existing_resume:
                # UPDATE OPERATION
                logger.info(f"Updating existing resume: {resume_id}")
                
                # Create updated resume model
                updated_resume = create_resume_model(
                    user_id=user_id,
                    resume_details=resume_details,
                    resume_metadata=resume_metadata
                )
                
                # Preserve original creation time and ID
                updated_resume.id = existing_resume.id
                updated_resume.created_at = existing_resume.created_at
                updated_resume.updated_at = now
                
              
                # Replace the existing document
                await updated_resume.replace()
                logger.info(f"Resume updated successfully: {resume_id}")
                return updated_resume
                
            else:
                # CREATE OPERATION
                logger.info(f"Creating new resume for user: {user_id}")
                
                # Handle primary resume logic for new resumes
                if resume_metadata.get('is_primary', False):
                    await ResumeRepository._ensure_single_primary_resume(user_object_id)
                
                # Create new resume model
                resume = create_resume_model(
                    user_id=user_id,
                    resume_details=resume_details,
                    resume_metadata=resume_metadata
                )
                
                # Set timestamps for new resume
                resume.created_at = now
                resume.updated_at = now
                
                # Insert new resume
                await resume.insert()
                logger.info(f"Resume created successfully for user: {user_id}")
                return resume
                
        except ValidationError as e:
            logger.error(f"Validation error while upserting resume: {str(e)}")
            raise
        except ValueError as e:
            logger.error(f"Value error while upserting resume: {str(e)}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error while upserting resume: {str(e)}")
            raise Exception(f"Failed to upsert resume: {str(e)}")


    async def update_resume(self, user_id: str, resume_detail_json: str):
        try:
            resume_details: Dict[str, Any] = json.loads(resume_detail_json)
            resume_metadata = {
                "resume_name": resume_details.get("resume_name", "no_name_provided"),
                "is_primary": resume_details.get("is_primary", False)
            }
            
            updated_resume = await self.upsert_resume(user_id, resume_metadata, resume_details, resume_details.get("_id", None))
            if not updated_resume:
                logger.error("Resume update failed")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to update ther resume due to internal server error"
                )
            
            return {
                "success": True,
                "message": "Resume update/created succesfully",
                "resume": updated_resume
            }
        except json.JSONDecodeError as e:
            logger.error("Invalid json string")
            raise HTTPException(
                status_code=status.HTTP_406_NOT_ACCEPTABLE,
                detail="Invalid json string provided"
            )
        except HTTPException as http_exception:
            raise http_exception
        except Exception as e:
            logger.error(f"Failed to update the resume, error: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Internal Server Error"
            )
        
    @staticmethod
    async def create_resume_analysis(resume_id: str, user_id: str, resume_analysis: Dict[str, Any]) -> ResumeAnalysis:
        """Method to create resume analysis in database

        Args:
            resume_id (str): resume id in string format
            user_id (str): user id in string format
            resume_analysis (Dict[str, Any]): resume analysis object got from LLM

        Returns:
            ResumeAnalysis: Resume analysis document or None if error
        """
        try:
            logger.info(f"Creating ResumeAnalysis for user_id={user_id}, resume_id={resume_id}")

            # Extract and create ATS Score
            ats_data: Dict[str, Any] = resume_analysis.get("ats_score", {})
            ats_score = ATSScore(**ats_data)

            # Extract LLM analysis data
            llm_analysis_raw: Dict[str, Any] = resume_analysis.get("llm_analysis", {})
            overall: Dict[str, Any] = llm_analysis_raw.get("overall_analysis", {})
            section: Dict[str, Any] = llm_analysis_raw.get("section_wise_analysis", {})

            def map_detail_list(detail_list):
                return [ResumeDetailDescription(**item) for item in detail_list] if detail_list else []

            # Create overall analysis
            overall_analysis = OverallAnalysis(
                overall_strengths=map_detail_list(overall.get("overall_strengths")),
                areas_for_improvement=map_detail_list(overall.get("areas_for_improvement")),
                ats_optimization_suggestions=map_detail_list(overall.get("ats_optimization_suggestions")),
                job_fit_assessment=overall.get("job_fit_assessment"),
                recommendation_score=overall.get("recommendation_score"),
                resume_summary=overall.get("resume_summary")
            )

            def map_section(section_data):
                if not section_data:
                    return SectionDetail()
                return SectionDetail(
                    description=section_data.get("description"),
                    good=section_data.get("good", []),
                    bad=section_data.get("bad", []),
                    improvements=section_data.get("improvements", []),
                    overall_review=section_data.get("overall_review")
                )

            # Create section-wise analysis
            section_wise_analysis = SectionWiseAnalysis(
                education=map_section(section.get("education")),
                projects=map_section(section.get("projects")),
                experience=map_section(section.get("experience")),
                skills=map_section(section.get("skills")),
                extracurricular=map_section(section.get("extracurricular"))
            )

            # Create LLM analysis
            llm_analysis = LLMAnalysis(
                overall_analysis=overall_analysis,
                section_wise_analysis=section_wise_analysis
            )

            # Create skills group models
            # tech_skill_model: List[SkillGroup] = []
            # for skill in resume_analysis.get("technical_skills", []):
            #     tech_skill_model.append(SkillGroup(**skill))
                    
            # soft_skill_model: List[SkillGroup] = []
            # for skill in resume_analysis.get("soft_skills", []):
            #     soft_skill_model.append(SkillGroup(**skill))
            
            # Create the main resume analysis document
            resume_doc = ResumeAnalysis(
                user_id=PydanticObjectId(user_id),
                resume_id=PydanticObjectId(resume_id),
                ats_score=ats_score,
                job_match_score=resume_analysis.get("job_match_score"),
                skill_match_percent=resume_analysis.get("skill_match_percent"),
                technical_skills=resume_analysis.get("technical_skills", []),
                soft_skills=resume_analysis.get("soft_skills", []),
                matched_skills=resume_analysis.get("matched_skills", []),
                missing_skills=resume_analysis.get("missing_skills", []),
                job_title=resume_analysis.get("job_title", ""),
                llm_analysis=llm_analysis,
            )

            # Insert the document
            resume_analysis_doc = await resume_doc.insert()
            logger.info("ResumeAnalysis document inserted successfully.")
            return resume_analysis_doc
            
        except Exception as e:
            logger.error(f"Error while adding resume analysis object in database: {e}", exc_info=True)
            return None
    
 # ============= READ OPERATIONS =============
    

    async def get_all_resume_analysis_of_user(self, user_id: str) -> Optional[List[Dict[str, Any]]]:
        try:
            user_id = PydanticObjectId(user_id)

            result = await ResumeAnalysis.find(ResumeAnalysis.user_id == user_id).to_list()
            if not result:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="No resume analysis found for user"
                )
            print(len(result))
            resume_ids = [ra.resume_id for ra in result]

            # Use In operator here
            resumes = await Resume.find(In(Resume.id, resume_ids)).to_list()
            resume_map = {resume.id: resume for resume in resumes}

            final_result: List[Dict[str, Any]] = []

            for analysis in result:
                resume_doc = resume_map.get(analysis.resume_id)
                if not resume_doc:
                    continue

                final_result.append({
                    "resume_metadata": {
                        "resume_name": resume_doc.resume_name,
                        "is_primary": resume_doc.is_primary,
                    },
                    "_id": str(analysis.id),  # <-- Convert ObjectId to string manually
                    **analysis.model_dump(
                        exclude={"id", "user_id", "resume_id"}
                    )
                })

            print(final_result)
            return {
                "success": True,
                "resume_analysis": final_result
            }

        except Exception as e:
            logger.error(f"Failed to get all resume analysis objects from db, error: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=str(e)
            )


    async def get_resume_by_id(self, user_id: str, resume_id: str) -> Any:
        """Get resume by ID"""
        try:
            logger.info("API called for getting resume with resume id")
            resume: Resume = await Resume.get(PydanticObjectId(resume_id))

            if not resume:
                logger.warning("No resume found with give resume id")
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Resume not found with give resume id"
                )
            
            # Check if the current user is the owner of the resume
            if str(resume.user_id) != user_id:
                logger.warning(f"Unauthorized access: attempt to get resume by user_id: {user_id} for resume owned by {resume.user_id}")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Unauthorized request to access the resume"
                )
                
            return {
                "success": True,
                "message": "Succesfully got the resume",
                "resume": resume
            }
            
        except HTTPException as http_excep:
            raise http_excep
        except Exception as e:
            logger.error(f"Failed to get resume with id: {resume_id}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Internal Server Error"
            )
    
    
    async def get_user_resumes(
        self,
        user_id: str
    ) -> List[Resume]:
        """
        Get all resumes for a user with pagination and sorting
        
        Args:
            user_id: User's ObjectId in string
        """
        try:
                
            logger.info(f"Getting all the resume for the user: {user_id}")
            user_id = PydanticObjectId(user_id)
            results =  await Resume.find(Resume.user_id == user_id).to_list()
            
            if not results:
                return {
                    "success": True,
                    "message": "No resume found",
                    "resume": []
                }
            
            return {
                "success": True,
                "message": "Resume found succesfully",
                "resume": results
            }
        except HTTPException as http_exception:
            raise http_exception
        except Exception as e:
            logger.error(f"Failed to get all the resume, error: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Internal server error"
            )
    
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
    
    
    async def get_latest_resume_analysis(self, user: Dict[str, Any]) -> Dict[str, Any] | None:
        try:
            query_filter = {"user_id": ObjectId(user["user_id"])}
       
            def flatten_skills(skills_data):
                skills = []
                for skill_data in skills_data:
                    for skill in skill_data.skills:
                        skills.append(skill)
                return skills
        
            # Find the latest analysis based on updated_at (descending order)
            latest_analysis = await ResumeAnalysis.find_one(
                query_filter,   
                sort=[("updated_at", DESCENDING)]
            )
            
            if not latest_analysis:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="No latest resume analysis found for user"
                )
            resume_id = latest_analysis.resume_id
            
            # find resume and give resume metadata
            resume = await Resume.get(document_id=resume_id) 
            
            if not resume:
                logger.error(f"No resume found for resume analysis for user: {user['user_id']}")
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="No resume found for resume analysis for user"
                )
            
            technical_skills = flatten_skills(latest_analysis.technical_skills)
            soft_skills = flatten_skills(latest_analysis.soft_skills)
            
            return {
                "success": True,
                "message": "Successfully got latest resume analysis",
                "resume_analysis": {
                    "_id": str(latest_analysis.id),
                    "resume_id": str(latest_analysis.resume_id),
                    "created_at": latest_analysis.created_at.isoformat(),
                    "updated_at": latest_analysis.updated_at.isoformat(),
                    "ats_score": latest_analysis.ats_score.model_dump() if latest_analysis.ats_score else None,
                    "techinal_skills": technical_skills,
                    "job_title": latest_analysis.job_title,
                    "soft_skills": soft_skills,
                    "job_match_score": latest_analysis.job_match_score,
                    "skill_match_percent": latest_analysis.skill_match_percent,
                    "llm_analysis": {"overall_analysis": (
                        latest_analysis.llm_analysis.overall_analysis.model_dump()
                        if latest_analysis.llm_analysis and latest_analysis.llm_analysis.overall_analysis
                        else None
                    )},
                    "resume_metadata": {
                        "resume_name": resume.resume_name,
                        "is_primary" : resume.is_primary 
                    }
                }, 
                "user_name": user["user"].name
            }
            
        except HTTPException as http_exception:
            raise http_exception
        except Exception as e:
            logger.error(f"Failed to get latest resume analysis object, error: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Internal server error"
            ) 
  
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
    
    async def get_resume_analysis_by_id(self, resume_analysis_id: str):
        try:
            logger.info("API endpoint called for getting resume analysis")
            result = await ResumeAnalysis.get(PydanticObjectId(resume_analysis_id))
            
            return {
                "success": True,
                "resume_analysis": result
            }
        except Exception as e:
            logger.error(f"Failed to get resume analysis with id: {resume_analysis_id}, error: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Internal server error occured while getting resume analysis by id"
            )
    
    # ============= UPDATE OPERATIONS =============
    
    @staticmethod
    # async def update_resume(
    #     resume_id: PydanticObjectId,
    #     update_data: Dict[str, Any]
    # ) -> Optional[Resume]:
    #     """
    #     Update resume with optimized field updates
        
    #     Args:
    #         resume_id: Resume ID to update
    #         update_data: Fields to update
    #         upsert: Create if doesn't exist
            
    #     Returns:
    #         Updated Resume document
    #     """
    #     # Handle primary resume logic
    #     # if 'is_primary' in update_data and update_data['is_primary']:
    #     #     resume = await Resume.get(resume_id)
    #     #     if resume:
    #     #         await ResumeRepository._ensure_single_primary_resume(resume.user_id, exclude_id=resume_id)
        
    #     # Add updated timestamp
    #     update_data['updated_at'] = datetime.utcnow()
        
    #     # Use atomic update operations
    #     resume = await Resume.get(resume_id)
        
    #     if resume:
    #         # Update existing document
    #         for key, value in update_data.items():
    #             setattr(resume, key, value)
    #         await resume.save()
    #         return resume
    
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
    
    async def delete_resume_analysis(self, resume_analysis_id: str):
        """CRUD function to delete resume analysis object

        Args:
            resume_analysis_id (str): id of resume analysis object that needs to be deleted

        Raises:
            HTTPException: if resume analysis object not found
            HTTPException: Any runtime exceptions occur

        Returns:
            _type_: Dict
        """
        try:            
            resume_analysis = await ResumeAnalysis.get(PydanticObjectId(resume_analysis_id))
            
            if not resume_analysis:
                logger.error("Resume analysis object not found in database")
                raise HTTPException(
                    detail="Resume analysis object not found in database",
                    status_code=status.HTTP_404_NOT_FOUND
                )
            await resume_analysis.delete()
            return {
                "success": True,
                "message": f"Resume analysis object with id {resume_analysis_id} deleted succesfully"
            }
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to delete resume analysis object, error: {str(e)}"
            )
    
    
    async def delete_resume(self, user_id: str, resume_id: str) -> bool:
        """
        Delete resume by ID

        Returns:
            True if deleted, False if not found
        """
        try:
            logger.info(f"Deleting resume with resume_id: {resume_id} for user_id: {user_id}")

            # Fetch the resume document
            resume = await Resume.get(PydanticObjectId(resume_id))
            if not resume:
                logger.warning(f"No resume found with id: {resume_id}")
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="No resume found with given resume ID"
                )

            # Check if the current user is the owner of the resume
            if str(resume.user_id) != user_id:
                logger.warning(f"Unauthorized delete attempt by user_id: {user_id} for resume owned by {resume.user_id}")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Unauthorized access to delete resume; this resume doesn't belong to the user"
                )

            # Delete associated resume analyses
            delete_result = await ResumeAnalysis.find({"resume_id": ObjectId(resume_id)}).delete()
            logger.info(f"Deleted {delete_result} resume_analysis documents associated with resume_id: {resume_id}")

            # Delete the resume itself
            await resume.delete()
            logger.info(f"Successfully deleted resume with id: {resume_id}")

            return True

        except HTTPException as http_exception:
            raise http_exception
        except Exception as e:
            logger.error(f"Failed to delete resume with id: {resume_id}, error: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Internal Server Error"
            )
            
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