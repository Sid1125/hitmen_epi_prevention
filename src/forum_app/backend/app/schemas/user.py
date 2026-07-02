from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from app.models.role import UserRole

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    role: Optional[UserRole] = UserRole.DELTA

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    role: UserRole

    class Config:
        from_attributes = True

class UserProfile(BaseModel):
    """Full user profile with private information (for the user themselves)"""
    id: int
    username: str
    email: EmailStr
    role: UserRole
    created_at: datetime
    is_active: bool
    post_count: int
    comment_count: int

    class Config:
        from_attributes = True

class UserProfilePublic(BaseModel):
    """Public user profile (for viewing other users)"""
    id: int
    username: str
    created_at: datetime
    is_active: bool
    post_count: int
    comment_count: int

    class Config:
        from_attributes = True

class UserProfileUpdate(BaseModel):
    """Schema for updating user profile"""
    username: Optional[str] = None
    email: Optional[EmailStr] = None

    class Config:
        from_attributes = True
