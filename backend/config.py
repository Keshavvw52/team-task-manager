import os
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "your-super-secret-key-change-in-production-min-32-chars")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./taskmanager.db")
CORS_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ORIGINS",
        "http://localhost:5173,"
        "https://team-task-manager-blush-beta.vercel.app,"
        "https://team-task-manager-3ut3ydhnr-keshavvw52s-projects.vercel.app"
    ).split(",")
    if origin.strip()
]

if not SECRET_KEY:
    raise ValueError("SECRET_KEY is not set")
