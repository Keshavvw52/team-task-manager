from pydantic import BaseModel, EmailStr, Field
from typing import Literal


class SignupRequest(BaseModel):
    name: str
    email: EmailStr
    password: str = Field(..., min_length=6)
    role: Literal["admin", "member"] = "member"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
