import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "civicfix-default-secret-key-2026")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "civicfix-jwt-secret-key-default-32chars")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=7)
    
    # Database config: supports PostgreSQL and SQLite
    database_url = os.getenv("DATABASE_URL", "sqlite:///civicfix.db")
    # Standardize postgres:// to postgresql:// for SQLAlchemy 1.4+
    if database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql://", 1)
    
    # If using SQLite relative path, make it relative to backend root
    if database_url.startswith("sqlite:///") and not database_url.startswith("sqlite:////"):
        rel_path = database_url.replace("sqlite:///", "")
        if not os.path.isabs(rel_path):
            database_url = f"sqlite:///{os.path.join(BASE_DIR, rel_path)}"
            
    SQLALCHEMY_DATABASE_URI = database_url
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Upload configuration
    UPLOAD_FOLDER = os.path.join(BASE_DIR, os.getenv("UPLOAD_FOLDER", "uploads"))
    MAX_CONTENT_LENGTH = int(os.getenv("MAX_CONTENT_LENGTH", 16 * 1024 * 1024)) # 16 MB
    ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "webp", "gif"}
    
    # Location Defaults
    DEFAULT_LATITUDE = float(os.getenv("DEFAULT_LATITUDE", 12.9716))
    DEFAULT_LONGITUDE = float(os.getenv("DEFAULT_LONGITUDE", 77.5946))
    
    # Duplicate detection defaults
    SIMILARITY_DUPLICATE_THRESHOLD = float(os.getenv("SIMILARITY_DUPLICATE_THRESHOLD", 0.60))
    MAX_DUPLICATE_DISTANCE_METERS = float(os.getenv("MAX_DUPLICATE_DISTANCE_METERS", 350.0))
