from features.users.repository import user_repositroy
from fastapi import APIRouter, Depends, Form
from dependency import get_current_user
from typing import Optional
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix = "/user", tags = ["user"])


@router.get(
    "/",
    description="API endpoint to get user detail"
)
async def get_user_detail(user: dict = Depends(get_current_user)):
    return {
        "success": True,
        "user": {
            "_id": str(user["user"].id),
            **user["user"].model_dump(exclude={"password", "id"}, by_alias=True),
            
        } 
            
    }

# API Endpoint to change user detail
@router.patch(
    "/",
    description="Change or add user details"
)
async def change_user_details(
    user: dict = Depends(get_current_user),
    user_details: Optional[str] = Form(None),
):
    """
        
        ```
    Args:
        user (dict, optional): _description_. Defaults to Depends(get_current_user).
        user_detail (Optional[str], optional): above json in string. Defaults to Form(None).
    Returns:
        _type_: _description_
    """
    return await user_repositroy.change_user_details(user, user_details)



