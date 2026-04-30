from sqlalchemy import Column, Integer, String, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from database import Base


class UserRole(str, enum.Enum):
    admin = "admin"
    member = "member"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.member, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    projects_created = relationship("Project", back_populates="creator")
    project_memberships = relationship("ProjectMember", back_populates="user", cascade="all, delete-orphan")
    tasks_assigned = relationship("Task", back_populates="assignee", cascade="all, delete-orphan")