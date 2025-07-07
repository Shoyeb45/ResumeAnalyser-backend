# requirements.txt
fastapi==0.104.1
uvicorn[standard]==0.24.0
motor==3.3.2
beanie==1.23.6
pydantic==2.5.0
pydantic-settings==2.1.0
python-multipart==0.0.6
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
pytest==7.4.3
pytest-asyncio==0.21.1
httpx==0.25.2

# .env
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=resume_analyser
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# src/config.py


# src/database.py


# src/dependencies.py


# src/core/security.py
from datetime import datetime, timedelta
from typing import Optional
from jose import jwt
from passlib.context import CryptContext

from src.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Hash a password"""
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)
    return encoded_jwt

# src/features/users/models.py
from beanie import Document
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class User(Document):
    username: str
    email: EmailStr
    hashed_password: str
    full_name: Optional[str] = None
    is_active: bool = True
    created_at: datetime = datetime.utcnow()
    updated_at: datetime = datetime.utcnow()
    
    class Settings:
        collection = "users"
        
    class Config:
        json_schema_extra = {
            "example": {
                "username": "johndoe",
                "email": "john@example.com",
                "full_name": "John Doe"
            }
        }

# src/features/users/schemas.py
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    username: str
    email: EmailStr
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    is_active: Optional[bool] = None

class UserResponse(UserBase):
    id: str
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class UserLogin(BaseModel):
    username: str
    password: str

# src/features/users/repository.py
from typing import Optional, List
from beanie import PydanticObjectId

from src.features.users.models import User
from src.features.users.schemas import UserCreate, UserUpdate

class UserRepository:
    
    @staticmethod
    async def create(user_data: UserCreate, hashed_password: str) -> User:
        """Create a new user"""
        user = User(
            username=user_data.username,
            email=user_data.email,
            full_name=user_data.full_name,
            hashed_password=hashed_password
        )
        await user.insert()
        return user
    
    @staticmethod
    async def get_by_id(user_id: PydanticObjectId) -> Optional[User]:
        """Get user by ID"""
        return await User.get(user_id)
    
    @staticmethod
    async def get_by_username(username: str) -> Optional[User]:
        """Get user by username"""
        return await User.find_one(User.username == username)
    
    @staticmethod
    async def get_by_email(email: str) -> Optional[User]:
        """Get user by email"""
        return await User.find_one(User.email == email)
    
    @staticmethod
    async def update(user_id: PydanticObjectId, user_data: UserUpdate) -> Optional[User]:
        """Update user"""
        user = await User.get(user_id)
        if not user:
            return None
        
        update_data = user_data.dict(exclude_unset=True)
        if update_data:
            update_data['updated_at'] = datetime.utcnow()
            await user.update({"$set": update_data})
        
        return user
    
    @staticmethod
    async def delete(user_id: PydanticObjectId) -> bool:
        """Delete user"""
        user = await User.get(user_id)
        if user:
            await user.delete()
            return True
        return False
    
    @staticmethod
    async def get_all(skip: int = 0, limit: int = 100) -> List[User]:
        """Get all users with pagination"""
        return await User.find_all().skip(skip).limit(limit).to_list()

# src/features/users/service.py
from typing import Optional, List
from fastapi import HTTPException, status
from datetime import timedelta
from beanie import PydanticObjectId

from src.features.users.repository import UserRepository
from src.features.users.schemas import UserCreate, UserUpdate, UserResponse, Token
from src.features.users.models import User
from src.core.security import verify_password, get_password_hash, create_access_token
from src.config import settings

class UserService:
    
    @staticmethod
    async def create_user(user_data: UserCreate) -> UserResponse:
        """Create a new user"""
        # Check if user already exists
        existing_user = await UserRepository.get_by_username(user_data.username)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already registered"
            )
        
        existing_email = await UserRepository.get_by_email(user_data.email)
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Hash password and create user
        hashed_password = get_password_hash(user_data.password)
        user = await UserRepository.create(user_data, hashed_password)
        
        return UserResponse(
            id=str(user.id),
            username=user.username,
            email=user.email,
            full_name=user.full_name,
            is_active=user.is_active,
            created_at=user.created_at,
            updated_at=user.updated_at
        )
    
    @staticmethod
    async def authenticate_user(username: str, password: str) -> Optional[User]:
        """Authenticate user credentials"""
        user = await UserRepository.get_by_username(username)
        if not user or not verify_password(password, user.hashed_password):
            return None
        return user
    
    @staticmethod
    async def login(username: str, password: str) -> Token:
        """Login user and return token"""
        user = await UserService.authenticate_user(username, password)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
        access_token = create_access_token(
            data={"sub": str(user.id)}, expires_delta=access_token_expires
        )
        
        return Token(access_token=access_token, token_type="bearer")
    
    @staticmethod
    async def get_user(user_id: PydanticObjectId) -> UserResponse:
        """Get user by ID"""
        user = await UserRepository.get_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return UserResponse(
            id=str(user.id),
            username=user.username,
            email=user.email,
            full_name=user.full_name,
            is_active=user.is_active,
            created_at=user.created_at,
            updated_at=user.updated_at
        )
    
    @staticmethod
    async def update_user(user_id: PydanticObjectId, user_data: UserUpdate) -> UserResponse:
        """Update user"""
        user = await UserRepository.update(user_id, user_data)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return UserResponse(
            id=str(user.id),
            username=user.username,
            email=user.email,
            full_name=user.full_name,
            is_active=user.is_active,
            created_at=user.created_at,
            updated_at=user.updated_at
        )
    
    @staticmethod
    async def get_users(skip: int = 0, limit: int = 100) -> List[UserResponse]:
        """Get all users"""
        users = await UserRepository.get_all(skip, limit)
        return [
            UserResponse(
                id=str(user.id),
                username=user.username,
                email=user.email,
                full_name=user.full_name,
                is_active=user.is_active,
                created_at=user.created_at,
                updated_at=user.updated_at
            )
            for user in users
        ]

# src/features/users/router.py
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from beanie import PydanticObjectId

from src.features.users.service import UserService
from src.features.users.schemas import UserCreate, UserUpdate, UserResponse, Token, UserLogin
from src.features.users.models import User
from src.dependencies import get_current_user

router = APIRouter(prefix="/users", tags=["users"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_user(user_data: UserCreate):
    """Register a new user"""
    return await UserService.create_user(user_data)

@router.post("/login", response_model=Token)
async def login(user_data: UserLogin):
    """Login user"""
    return await UserService.login(user_data.username, user_data.password)

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information"""
    return UserResponse(
        id=str(current_user.id),
        username=current_user.username,
        email=current_user.email,
        full_name=current_user.full_name,
        is_active=current_user.is_active,
        created_at=current_user.created_at,
        updated_at=current_user.updated_at
    )

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: PydanticObjectId,
    current_user: User = Depends(get_current_user)
):
    """Get user by ID"""
    return await UserService.get_user(user_id)

@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: PydanticObjectId,
    user_data: UserUpdate,
    current_user: User = Depends(get_current_user)
):
    """Update user"""
    return await UserService.update_user(user_id, user_data)

@router.get("/", response_model=List[UserResponse])
async def get_users(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user)
):
    """Get all users"""
    return await UserService.get_users(skip, limit)

# src/features/resume/models.py
from beanie import Document
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from beanie import PydanticObjectId

class Experience(BaseModel):
    company: str
    position: str
    duration: str
    description: Optional[str] = None

class Education(BaseModel):
    institution: str
    degree: str
    year: str
    grade: Optional[str] = None

class Resume(Document):
    user_id: PydanticObjectId
    title: str
    full_name: str
    email: str
    phone: Optional[str] = None
    summary: Optional[str] = None
    skills: List[str] = []
    experience: List[Experience] = []
    education: List[Education] = []
    file_path: Optional[str] = None
    analysis_result: Optional[dict] = None
    created_at: datetime = datetime.utcnow()
    updated_at: datetime = datetime.utcnow()
    
    class Settings:
        collection = "resumes"

# src/features/resume/schemas.py
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from beanie import PydanticObjectId

class ExperienceCreate(BaseModel):
    company: str
    position: str
    duration: str
    description: Optional[str] = None

class EducationCreate(BaseModel):
    institution: str
    degree: str
    year: str
    grade: Optional[str] = None

class ResumeCreate(BaseModel):
    title: str
    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    summary: Optional[str] = None
    skills: List[str] = []
    experience: List[ExperienceCreate] = []
    education: List[EducationCreate] = []

class ResumeUpdate(BaseModel):
    title: Optional[str] = None
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    summary: Optional[str] = None
    skills: Optional[List[str]] = None
    experience: Optional[List[ExperienceCreate]] = None
    education: Optional[List[EducationCreate]] = None

class ResumeResponse(BaseModel):
    id: str
    user_id: str
    title: str
    full_name: str
    email: str
    phone: Optional[str] = None
    summary: Optional[str] = None
    skills: List[str] = []
    experience: List[ExperienceCreate] = []
    education: List[EducationCreate] = []
    file_path: Optional[str] = None
    analysis_result: Optional[dict] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# src/features/resume/repository.py
from typing import Optional, List
from beanie import PydanticObjectId
from datetime import datetime

from src.features.resume.models import Resume
from src.features.resume.schemas import ResumeCreate, ResumeUpdate

class ResumeRepository:
    
    @staticmethod
    async def create(user_id: PydanticObjectId, resume_data: ResumeCreate) -> Resume:
        """Create a new resume"""
        resume = Resume(
            user_id=user_id,
            title=resume_data.title,
            full_name=resume_data.full_name,
            email=resume_data.email,
            phone=resume_data.phone,
            summary=resume_data.summary,
            skills=resume_data.skills,
            experience=resume_data.experience,
            education=resume_data.education
        )
        await resume.insert()
        return resume
    
    @staticmethod
    async def get_by_id(resume_id: PydanticObjectId) -> Optional[Resume]:
        """Get resume by ID"""
        return await Resume.get(resume_id)
    
    @staticmethod
    async def get_by_user_id(user_id: PydanticObjectId, skip: int = 0, limit: int = 100) -> List[Resume]:
        """Get resumes by user ID"""
        return await Resume.find(Resume.user_id == user_id).skip(skip).limit(limit).to_list()
    
    @staticmethod
    async def update(resume_id: PydanticObjectId, resume_data: ResumeUpdate) -> Optional[Resume]:
        """Update resume"""
        resume = await Resume.get(resume_id)
        if not resume:
            return None
        
        update_data = resume_data.dict(exclude_unset=True)
        if update_data:
            update_data['updated_at'] = datetime.utcnow()
            await resume.update({"$set": update_data})
        
        return resume
    
    @staticmethod
    async def delete(resume_id: PydanticObjectId) -> bool:
        """Delete resume"""
        resume = await Resume.get(resume_id)
        if resume:
            await resume.delete()
            return True
        return False
    
    @staticmethod
    async def get_all(skip: int = 0, limit: int = 100) -> List[Resume]:
        """Get all resumes with pagination"""
        return await Resume.find_all().skip(skip).limit(limit).to_list()

# src/features/resume/service.py
from typing import Optional, List
from fastapi import HTTPException, status
from beanie import PydanticObjectId

from src.features.resume.repository import ResumeRepository
from src.features.resume.schemas import ResumeCreate, ResumeUpdate, ResumeResponse
from src.features.resume.models import Resume

class ResumeService:
    
    @staticmethod
    async def create_resume(user_id: PydanticObjectId, resume_data: ResumeCreate) -> ResumeResponse:
        """Create a new resume"""
        resume = await ResumeRepository.create(user_id, resume_data)
        return ResumeService._to_response(resume)
    
    @staticmethod
    async def get_resume(resume_id: PydanticObjectId, user_id: PydanticObjectId) -> ResumeResponse:
        """Get resume by ID"""
        resume = await ResumeRepository.get_by_id(resume_id)
        if not resume:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Resume not found"
            )
        
        # Check if user owns the resume
        if resume.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to access this resume"
            )
        
        return ResumeService._to_response(resume)
    
    @staticmethod
    async def get_user_resumes(user_id: PydanticObjectId, skip: int = 0, limit: int = 100) -> List[ResumeResponse]:
        """Get user's resumes"""
        resumes = await ResumeRepository.get_by_user_id(user_id, skip, limit)
        return [ResumeService._to_response(resume) for resume in resumes]
    
    @staticmethod
    async def update_resume(resume_id: PydanticObjectId, user_id: PydanticObjectId, resume_data: ResumeUpdate) -> ResumeResponse:
        """Update resume"""
        resume = await ResumeRepository.get_by_id(resume_id)
        if not resume:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Resume not found"
            )
        
        # Check if user owns the resume
        if resume.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to update this resume"
            )
        
        updated_resume = await ResumeRepository.update(resume_id, resume_data)
        return ResumeService._to_response(updated_resume)
    
    @staticmethod
    async def delete_resume(resume_id: PydanticObjectId, user_id: PydanticObjectId) -> bool:
        """Delete resume"""
        resume = await ResumeRepository.get_by_id(resume_id)
        if not resume:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Resume not found"
            )
        
        # Check if user owns the resume
        if resume.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to delete this resume"
            )
        
        return await ResumeRepository.delete(resume_id)
    
    @staticmethod
    def _to_response(resume: Resume) -> ResumeResponse:
        """Convert Resume model to ResumeResponse"""
        return ResumeResponse(
            id=str(resume.id),
            user_id=str(resume.user_id),
            title=resume.title,
            full_name=resume.full_name,
            email=resume.email,
            phone=resume.phone,
            summary=resume.summary,
            skills=resume.skills,
            experience=resume.experience,
            education=resume.education,
            file_path=resume.file_path,
            analysis_result=resume.analysis_result,
            created_at=resume.created_at,
            updated_at=resume.updated_at
        )

# src/features/resume/router.py
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from beanie import PydanticObjectId

from src.features.resume.service import ResumeService
from src.features.resume.schemas import ResumeCreate, ResumeUpdate, ResumeResponse
from src.features.users.models import User
from src.dependencies import get_current_user

router = APIRouter(prefix="/resumes", tags=["resumes"])

@router.post("/", response_model=ResumeResponse, status_code=status.HTTP_201_CREATED)
async def create_resume(
    resume_data: ResumeCreate,
    current_user: User = Depends(get_current_user)
):
    """Create a new resume"""
    return await ResumeService.create_resume(current_user.id, resume_data)

@router.get("/", response_model=List[ResumeResponse])
async def get_user_resumes(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user)
):
    """Get user's resumes"""
    return await ResumeService.get_user_resumes(current_user.id, skip, limit)

@router.get("/{resume_id}", response_model=ResumeResponse)
async def get_resume(
    resume_id: PydanticObjectId,
    current_user: User = Depends(get_current_user)
):
    """Get resume by ID"""
    return await ResumeService.get_resume(resume_id, current_user.id)

@router.put("/{resume_id}", response_model=ResumeResponse)
async def update_resume(
    resume_id: PydanticObjectId,
    resume_data: ResumeUpdate,
    current_user: User = Depends(get_current_user)
):
    """Update resume"""
    return await ResumeService.update_resume(resume_id, current_user.id, resume_data)

@router.delete("/{resume_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_resume(
    resume_id: PydanticObjectId,
    current_user: User = Depends(get_current_user)
):
    """Delete resume"""
    await ResumeService.delete_resume(resume_id, current_user.id)
    return {"message": "Resume deleted successfully"}

# src/main.py


# tests/conftest.py
import pytest
import asyncio
from httpx import AsyncClient
from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient
import os

from src.main import app
from src.features.users.models import User
from src.features.resume.models import Resume

# Test database URL
TEST_MONGODB_URL = os.getenv("TEST_MONGODB_URL", "mongodb://localhost:27017")
TEST_DATABASE_NAME = "test_resume_analyser"

@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest.fixture(scope="session")
async def test_db():
    # Connect to test database
    client = AsyncIOMotorClient(TEST_MONGODB_URL)
    database = client[TEST_DATABASE_NAME]
    
    # Initialize Beanie for testing
    await init_beanie(database=database, document_models=[User, Resume])
    
    yield database
    
    # Cleanup: Drop test database
    await client.drop_database(TEST_DATABASE_NAME)
    client.close()

@pytest.fixture
async def client():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac

@pytest.fixture
async def test_user(test_db):
    # Create a test user
    from src.core.security import get_password_hash
    
    user = User(
        username="testuser",
        email="test@example.com",
        full_name="Test User",
        hashed_password=get_password_hash("testpassword")
    )
    await user.insert()
    yield user
    # Cleanup
    await user.delete()

@pytest.fixture
async def auth_headers(client: AsyncClient, test_user: User):
    # Login and get token
    login_data = {
        "username": "testuser",
        "password": "testpassword"
    }
    response = await client.post("/api/v1/users/login", json=login_data)
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

# tests/features/users/test_users.py
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_register_user(client: AsyncClient):
    user_data = {
        "username": "newuser",
        "email": "newuser@example.com",
        "full_name": "New User",
        "password": "newpassword123"
    }
    
    response = await client.post("/api/v1/users/register", json=user_data)
    
    assert response.status_code == 201
    data = response.json()
    assert data["username"] == "newuser"
    assert data["email"] == "newuser@example.com"
    assert "id" in data
    assert "hashed_password" not in data

@pytest.mark.asyncio
async def test_login_user(client: AsyncClient, test_user):
    login_data = {
        "username": "testuser",
        "password": "testpassword"
    }
    
    response = await client.post("/api/v1/users/login", json=login_data)
    
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

@pytest.mark.asyncio
async def test_get_current_user(client: AsyncClient, auth_headers):
    response = await client.get("/api/v1/users/me", headers=auth_headers)
    
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "testuser"
    assert data["email"] == "test@example.com"

@pytest.mark.asyncio
async def test_login_invalid_credentials(client: AsyncClient):
    login_data = {
        "username": "testuser",
        "password": "wrongpassword"
    }
    
    response = await client.post("/api/v1/users/login", json=login_data)
    
    assert response.status_code == 401

# tests/features/resumes/test_resumes.py
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_create_resume(client: AsyncClient, auth_headers):
    resume_data = {
        "title": "Software Engineer Resume",
        "full_name": "John Doe",
        "email": "john@example.com",
        "phone": "+1234567890",
        "summary": "Experienced software engineer",
        "skills": ["Python", "FastAPI", "MongoDB"],
        "experience": [
            {
                "company": "Tech Corp",
                "position": "Software Engineer",
                "duration": "2020-2023",
                "description": "Developed web applications"
            }
        ],
        "education": [
            {
                "institution": "University of Tech",
                "degree": "Computer Science",
                "year": "2020",
                "grade": "3.8 GPA"
            }
        ]
    }
    
    response = await client.post("/api/v1/resumes/", json=resume_data, headers=auth_headers)
    
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Software Engineer Resume"
    assert data["full_name"] == "John Doe"
    assert len(data["skills"]) == 3
    assert len(data["experience"]) == 1
    assert len(data["education"]) == 1

@pytest.mark.asyncio
async def test_get_user_resumes(client: AsyncClient, auth_headers):
    # First create a resume
    resume_data = {
        "title": "Test Resume",
        "full_name": "Test User",
        "email": "test@example.com",
        "skills": ["Python"]
    }
    
    await client.post("/api/v1/resumes/", json=resume_data, headers=auth_headers)
    
    # Then get user's resumes
    response = await client.get("/api/v1/resumes/", headers=auth_headers)
    
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1

@pytest.mark.asyncio
async def test_unauthorized_access(client: AsyncClient):
    response = await client.get("/api/v1/resumes/")
    assert response.status_code == 401