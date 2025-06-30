# Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create non-root user
RUN adduser --disabled-password --gecos '' appuser
RUN chown -R appuser:appuser /app
USER appuser

# Expose port
EXPOSE 8000

# Run the application
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]

# docker-compose.yml
version: '3.8'

services:
  mongodb:
    image: mongo:7.0
    container_name: resume_analyzer_mongo
    restart: unless-stopped
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password123
      MONGO_INITDB_DATABASE: resume_analyser
    volumes:
      - mongodb_data:/data/db
      - ./mongo-init.js:/docker-entrypoint-initdb.d/mongo-init.js:ro
    networks:
      - resume_network

  api:
    build: .
    container_name: resume_analyzer_api
    restart: unless-stopped
    ports:
      - "8000:8000"
    environment:
      MONGODB_URL: mongodb://admin:password123@mongodb:27017/resume_analyser?authSource=admin
      DATABASE_NAME: resume_analyser
      SECRET_KEY: your-super-secret-key-change-in-production
      ALGORITHM: HS256
      ACCESS_TOKEN_EXPIRE_MINUTES: 30
    depends_on:
      - mongodb
    networks:
      - resume_network
    volumes:
      - ./logs:/app/logs

volumes:
  mongodb_data:

networks:
  resume_network:
    driver: bridge

# mongo-init.js
db = db.getSiblingDB('resume_analyser');

db.createUser({
  user: 'api_user',
  pwd: 'api_password',
  roles: [
    {
      role: 'readWrite',
      db: 'resume_analyser'
    }
  ]
});

# src/core/exceptions.py
from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
import logging

logger = logging.getLogger(__name__)

class CustomException(Exception):
    """Base custom exception"""
    def __init__(self, message: str, status_code: int = 400):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)

class DatabaseException(CustomException):
    """Database related exceptions"""
    def __init__(self, message: str = "Database operation failed"):
        super().__init__(message, 500)

class AuthenticationException(CustomException):
    """Authentication related exceptions"""
    def __init__(self, message: str = "Authentication failed"):
        super().__init__(message, 401)

class AuthorizationException(CustomException):
    """Authorization related exceptions"""
    def __init__(self, message: str = "Access denied"):
        super().__init__(message, 403)

class ValidationException(CustomException):
    """Validation related exceptions"""
    def __init__(self, message: str = "Validation failed"):
        super().__init__(message, 422)

async def custom_exception_handler(request: Request, exc: CustomException):
    """Handle custom exceptions"""
    logger.error(f"Custom exception: {exc.message}")
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": True,
            "message": exc.message,
            "status_code": exc.status_code
        }
    )

async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    """Handle HTTP exceptions"""
    logger.error(f"HTTP exception: {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": True,
            "message": exc.detail,
            "status_code": exc.status_code
        }
    )

async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle validation exceptions"""
    logger.error(f"Validation exception: {exc.errors()}")
    return JSONResponse(
        status_code=422,
        content={
            "error": True,
            "message": "Validation failed",
            "details": exc.errors(),
            "status_code": 422
        }
    )

# src/core/logging.py

# src/core/middleware.py
import time
import uuid
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
import logging

logger = logging.getLogger(__name__)

class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Log all requests and responses"""
    
    async def dispatch(self, request: Request, call_next):
        # Generate request ID
        request_id = str(uuid.uuid4())
        request.state.request_id = request_id
        
        # Log request
        start_time = time.time()
        logger.info(
            f"Request started - ID: {request_id}, "
            f"Method: {request.method}, Path: {request.url.path}"
        )
        
        # Process request
        response = await call_next(request)
        
        # Log response
        process_time = time.time() - start_time
        logger.info(
            f"Request completed - ID: {request_id}, "
            f"Status: {response.status_code}, "
            f"Time: {process_time:.4f}s"
        )
        
        # Add request ID to response headers
        response.headers["X-Request-ID"] = request_id
        
        return response

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Add security headers to responses"""
    
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        
        # Add security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        
        return response

# src/core/utils.py
from typing import Any, Dict, Optional
from datetime import datetime
import hashlib
import secrets
import re

def generate_unique_id(prefix: str = "") -> str:
    """Generate a unique ID with optional prefix"""
    timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
    random_part = secrets.token_hex(4)
    return f"{prefix}{timestamp}{random_part}" if prefix else f"{timestamp}{random_part}"

def hash_string(text: str, algorithm: str = "sha256") -> str:
    """Hash a string using specified algorithm"""
    hash_obj = hashlib.new(algorithm)
    hash_obj.update(text.encode('utf-8'))
    return hash_obj.hexdigest()

def validate_email(email: str) -> bool:
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def sanitize_filename(filename: str) -> str:
    """Sanitize filename for safe storage"""
    # Remove potentially dangerous characters
    sanitized = re.sub(r'[<>:"/\\|?*]', '', filename)
    # Replace spaces with underscores
    sanitized = sanitized.replace(' ', '_')
    # Limit length
    if len(sanitized) > 255:
        name, ext = sanitized.rsplit('.', 1) if '.' in sanitized else (sanitized, '')
        sanitized = name[:255-len(ext)-1] + '.' + ext if ext else name[:255]
    
    return sanitized

def create_response_model(
    success: bool = True,
    message: str = "Operation successful",
    data: Optional[Any] = None,
    errors: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """Create standardized API response"""
    response = {
        "success": success,
        "message": message,
        "timestamp": datetime.utcnow().isoformat()
    }
    
    if data is not None:
        response["data"] = data
    
    if errors is not None:
        response["errors"] = errors
    
    return response

# src/core/pagination.py
from typing import Generic, TypeVar, List, Optional
from pydantic import BaseModel
from math import ceil

T = TypeVar('T')

class PaginationParams(BaseModel):
    page: int = 1
    size: int = 10
    
    @property
    def skip(self) -> int:
        return (self.page - 1) * self.size
    
    @property
    def limit(self) -> int:
        return self.size

class PaginatedResponse(BaseModel, Generic[T]):
    items: List[T]
    total: int
    page: int
    size: int
    pages: int
    has_next: bool
    has_prev: bool
    
    @classmethod
    def create(
        cls,
        items: List[T],
        total: int,
        pagination: PaginationParams
    ) -> "PaginatedResponse[T]":
        pages = ceil(total / pagination.size) if pagination.size > 0 else 0
        
        return cls(
            items=items,
            total=total,
            page=pagination.page,
            size=pagination.size,
            pages=pages,
            has_next=pagination.page < pages,
            has_prev=pagination.page > 1
        )

# .env.example
# Database Configuration
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=resume_analyser

# Security Configuration
SECRET_KEY=your-super-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Application Configuration
APP_NAME=Resume Analyser API
APP_VERSION=1.0.0
DEBUG=False

# Logging Configuration
LOG_LEVEL=INFO
LOG_FILE=logs/app.log

# File Upload Configuration
MAX_FILE_SIZE=10485760  # 10MB
ALLOWED_FILE_TYPES=pdf,doc,docx

# Email Configuration (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-email-password

# Redis Configuration (optional, for caching)
REDIS_URL=redis://localhost:6379/0

# Makefile
.PHONY: install dev test clean lint format docker-build docker-run

# Installation
install:
	pip install -r requirements.txt

# Development
dev:
	uvicorn src.main:app --reload --host 0.0.0.0 --port 8000

# Testing
test:
	pytest -v

test-coverage:
	pytest --cov=src --cov-report=html --cov-report=term

# Code Quality
lint:
	flake8 src/ tests/
	mypy src/

format:
	black src/ tests/
	isort src/ tests/

# Docker
docker-build:
	docker-compose build

docker-run:
	docker-compose up -d

docker-stop:
	docker-compose down

docker-logs:
	docker-compose logs -f api

# Database
db-init:
	python -c "from src.database import create_indexes; import asyncio; asyncio.run(create_indexes())"

# Clean
clean:
	find . -type f -name "*.pyc" -delete
	find . -type d -name "__pycache__" -delete
	find . -type d -name "*.egg-info" -exec rm -rf {} +
	rm -rf .coverage htmlcov/ .pytest_cache/

# README.md
# Resume Analyser API

A production-ready FastAPI application with MongoDB for resume analysis and management.

## Features

- **User Authentication & Authorization**: JWT-based authentication
- **Resume Management**: CRUD operations for resumes
- **Production-Ready Architecture**: Modular, scalable, and maintainable
- **Database Integration**: MongoDB with Beanie ODM
- **Comprehensive Testing**: Unit and integration tests
- **Docker Support**: Containerized deployment
- **API Documentation**: Automatic OpenAPI/Swagger documentation

## Project Structure

```
resume_analyser/
├── src/
│   ├── main.py              # FastAPI app with lifespan management
│   ├── config.py            # Application settings
│   ├── database.py          # MongoDB connection and initialization
│   ├── dependencies.py      # Dependency injection
│   ├── core/                # Core utilities and shared components
│   │   ├── exceptions.py    # Custom exception handling
│   │   ├── logging.py       # Logging configuration
│   │   ├── middleware.py    # Custom middleware
│   │   ├── pagination.py    # Pagination utilities
│   │   ├── security.py      # Authentication and security
│   │   └── utils.py         # Common utility functions
│   └── features/            # Feature-based modules
│       ├── users/           # User management
│       │   ├── router.py    # API endpoints
│       │   ├── schemas.py   # Pydantic models
│       │   ├── models.py    # Database models
│       │   ├── service.py   # Business logic
│       │   └── repository.py # Database operations
│       └── resume/          # Resume management
│           ├── router.py
│           ├── schemas.py
│           ├── models.py
│           ├── service.py
│           └── repository.py
├── tests/                   # Test suite
├── logs/                    # Application logs
├── docker-compose.yml       # Docker configuration
├── Dockerfile              # Container definition
├── requirements.txt        # Python dependencies
├── .env.example           # Environment variables template
└── Makefile              # Development commands
```

## Quick Start

### 1. Clone and Setup

```bash
git clone <repository>
cd resume_analyser
cp .env.example .env
# Edit .env with your configuration
```

### 2. Install Dependencies

```bash
make install
# or
pip install -r requirements.txt
```

### 3. Start MongoDB

```bash
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:7.0

# Or use docker-compose
make docker-run
```

### 4. Run the Application

```bash
make dev
# or
uvicorn src.main:app --reload
```

The API will be available at `http://localhost:8000`

## API Documentation

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## Key Endpoints

### Authentication
- `POST /api/v1/users/register` - Register new user
- `POST /api/v1/users/login` - Login user
- `GET /api/v1/users/me` - Get current user

### Resume Management
- `POST /api/v1/resumes/` - Create resume
- `GET /api/v1/resumes/` - Get user's resumes
- `GET /api/v1/resumes/{id}` - Get specific resume
- `PUT /api/v1/resumes/{id}` - Update resume
- `DELETE /api/v1/resumes/{id}` - Delete resume

## Testing

```bash
# Run all tests
make test

# Run with coverage
make test-coverage

# Run specific test file
pytest tests/features/users/test_users.py -v
```

## Production Deployment

### Using Docker Compose

```bash
make docker-build
make docker-run
```

### Manual Deployment

1. Set up production environment variables
2. Configure MongoDB with proper authentication
3. Set up reverse proxy (nginx)
4. Configure SSL/TLS certificates
5. Set up monitoring and logging

## Development

### Code Quality

```bash
# Format code
make format

# Lint code
make lint
```

### Database Operations

```bash
# Initialize database indexes
make db-init
```

## Architecture Principles

### 1. **Separation of Concerns**
- **Models**: Database schema definition
- **Schemas**: API request/response validation
- **Repository**: Database operations
- **Service**: Business logic
- **Router**: API endpoints

### 2. **Dependency Injection**
- Database connections
- Authentication
- Feature-specific dependencies

### 3. **Error Handling**
- Custom exceptions
- Centralized error handlers
- Proper HTTP status codes

### 4. **Security**
- JWT authentication
- Password hashing
- Input validation
- Security headers

### 5. **Testing**
- Unit tests for services
- Integration tests for APIs
- Test fixtures and mocks

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URL` | MongoDB connection string | `mongodb://localhost:27017` |
| `DATABASE_NAME` | Database name | `resume_analyser` |
| `SECRET_KEY` | JWT secret key | Required |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token expiration | `30` |
| `LOG_LEVEL` | Logging level | `INFO` |

## Contributing

1. Follow the established architecture patterns
2. Write tests for new features
3. Use proper error handling
4. Follow PEP 8 style guidelines
5. Update documentation

## License

This project is licensed under the MIT License.