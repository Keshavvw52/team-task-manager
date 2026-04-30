from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from database import Base


class TaskPriority(str, enum.Enum):
    low = "Low"
    medium = "Medium"
    high = "High"


class TaskStatus(str, enum.Enum):
    todo = "Todo"
    in_progress = "In Progress"
    completed = "Completed"
    overdue = "Overdue"


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(String(1000), nullable=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    assigned_to = Column(Integer, ForeignKey("users.id"), nullable=True)
    due_date = Column(Date, nullable=True)
    priority = Column(Enum(TaskPriority), default=TaskPriority.medium, nullable=False)
    status = Column(Enum(TaskStatus), default=TaskStatus.todo, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    project = relationship("Project", back_populates="tasks")
    assignee = relationship("User", back_populates="tasks_assigned")