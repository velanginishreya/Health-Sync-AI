import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Health Sync AI"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./health_sync_ai.db")
    
    # JWT Authentication
    JWT_SECRET: str = os.getenv("JWT_SECRET", "health_sync_ai_super_secret_jwt_key_2026_academic")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 # 24 hours
    
    # LLM Settings
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "fallback")
    LLM_MODEL: str = os.getenv("LLM_MODEL", "gemini-1.5-flash")
    LLM_API_KEY: str = os.getenv("LLM_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")
    
    # Storage & Uploads
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "./storage/uploads")
    MAX_FILE_SIZE_MB: int = 10
    
    # Security & System
    DEMO_MODE: bool = os.getenv("DEMO_MODE", "true").lower() == "true"
    RATE_LIMIT_AI_CHAT_PER_HOUR: int = 20

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
