from pydantic import BaseModel, Field
from typing import Optional, List, Any
from datetime import datetime
from .comment import CommentOut


class PostBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    content: str = Field(..., min_length=1)
    tags: Optional[List[str]] = []
    like_count: int = 0
    dislike_count: int = 0


class PostCreate(PostBase):
    pass


class PostUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    content: Optional[str] = Field(None, min_length=1)
    tags: Optional[List[str]] = None
    is_pinned: Optional[bool] = None
    is_locked: Optional[bool] = None


class PostAuthor(BaseModel):
    id: int
    username: str
    
    class Config:
        from_attributes = True


class PostOut(PostBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    is_pinned: bool = False
    is_locked: bool = False
    view_count: int = 0
    author_id: int
    author: PostAuthor
    comments: List[CommentOut] = []

    class Config:
        from_attributes = True


class PostSummary(BaseModel):
    """Lighter version for listing posts"""
    id: int
    title: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    is_pinned: bool = False
    is_locked: bool = False
    view_count: int = 0
    author: PostAuthor
    comment_count: int = 0
    tags: Optional[List[str]] = []
    like_count: int = 0
    dislike_count: int = 0

    class Config:
        from_attributes = True
