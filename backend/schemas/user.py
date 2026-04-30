from pydantic import BaseModel, EmailStr, ConfigDict
from datetime import datetime
from typing import Optional


class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None