from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
import models  # Import all models to register them

# Import routes
from routes import auth, users, projects, tasks, dashboard

# Create all tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Team Task Manager API",
    description="Full-stack team task manager with role-based access",
    version="1.0.0"
)

# CORS - Allow frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
    "http://localhost:5173",
    "https://your-frontend.vercel.app"
],  # In production: set to your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(projects.router)
app.include_router(tasks.router)
app.include_router(dashboard.router)


@app.get("/")
def root():
    return {"message": "Team Task Manager API", "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "healthy"}