from typing import Dict, Any
import logging
from fastapi import HTTPException, status
import json
from datetime import datetime
from beanie import PydanticObjectId
from features.resume.models import Resume

logger = logging.getLogger(__name__)
from features.users.models import User
class UserRepository:
    def __init__(self):
        pass
    
    
    # update methods

    async def change_user_details(self, user: Dict[str, Any], user_details: str):
        """_summary_
        User detail: 
        ```
        '{
            "name": "Name of the user can be none",
            "current_profession": "current profession or can be none",
            "mobile_number": "Mobile Number or can be None",
            "location": "location or can be None",
            "github": "github url or can be None",
            "linkedin": "Linkedin url or can be None",
            "portfolio": "Portfolio url or can be None",            
        }'
        
        Raises:
            HTTPException: _description_
        """
        try:
            logger.info("User detail update endpoint called")
            
            # convert user details into python object
            user_data = json.loads(user_details)
            
            # Get the user document
            user_doc: User = user["user"]
            # user_doc = await User.find_one(User.email == user["email"])
            
            # Update only the fields that are provided and not None
            update_fields = {}
            allowed_fields = ["name", "current_profession", "mobile_number", "location", "github", "linkedin", "portfolio"]
            
            for field in allowed_fields:
                if field in user_data and user_data[field] is not None:
                    update_fields[field] = user_data[field]
            
            # Always update the updatedAt field
            update_fields["updatedAt"] = datetime.utcnow()
            
            # Perform the update
            if update_fields:
                await user_doc.update({"$set": update_fields})
                logger.info(f"User details updated successfully for user with user-id: {user['user_id']}")
            else:
                logger.info("No valid fields to update")
            
            return {
                "success": True,
                "message": "User details updated successfully"
            }
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse json, error: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_406_NOT_ACCEPTABLE,
                detail="Provided detail about user is not json string, invalid json format"
            )
        except Exception as e:
            logger.error(f"Some exception occurred while updating user details, error: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Interal server error occured while updating user details"
            ) 
    # name, current_profession, mobile_number,
    #   location, github, linkedin, portfolio
    
    
    async def get_user_detail(self, user: Dict[str, Any]): 
        try:
            logger.info("User info api called")
            user_id = PydanticObjectId(user["user_id"])
            
            resumes = await Resume.find(Resume.user_id == user_id).to_list()
            
            total_resumes = 0
            best_score = None
            
            if resumes:
                ats_scores = [resume.ats_score for resume in resumes if resume.ats_score is not None]
                best_score = max(ats_scores) if ats_scores else 0.0
                total_resumes = len(resumes)
                logger.info(f"User {user_id} has {total_resumes} resumes with best ATS score: {best_score}")
                
            return {
                "success": True,
                "user": {
                    "_id": str(user['user'].id),
                    **user["user"].model_dump(exclude={"password", "id"}, by_alias=True), 
                },
                "total_resumes": total_resumes,
                "best_score": best_score
            } 
        except Exception as e:
            logger.error(f"Failed to get user details, error: {str(e)}")
            raise HTTPException(
                detail=str(e),
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
user_repositroy = UserRepository()