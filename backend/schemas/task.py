from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime, date
from typing import Optional, Literal


class TaskCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    project_id: int
    assigned_to: Optional[int] = None
    due_date: Optional[date] = None
    priority: Literal["Low", "Medium", "High"] = "Medium"
    status: Literal["Todo", "In Progress", "Completed", "Overdue"] = "Todo"


class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    assigned_to: Optional[int] = None
    due_date: Optional[date] = None
    priority: Optional[Literal["Low", "Medium", "High"]] = None
    status: Optional[Literal["Todo", "In Progress", "Completed", "Overdue"]] = None


class TaskResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    project_id: int
    assigned_to: Optional[int]
    due_date: Optional[date]
    priority: str
    status: str
    created_at: datetime
    assignee_name: Optional[str] = None
    project_title: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)