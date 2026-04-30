import os
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "your-super-secret-key-change-in-production-min-32-chars")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./taskmanager.db")

if not SECRET_KEY:
    raise ValueError("SECRET_KEY is not set")