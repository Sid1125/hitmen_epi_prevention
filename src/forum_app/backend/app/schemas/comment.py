from pydantic import BaseModel, Field
from typing import Optional, List, Any
from datetime import datetime


class CommentBase(BaseModel):
    content: str = Field(..., min_length=1, max_length=2000)
    like_count: int = 0
    dislike_count: int = 0


class CommentCreate(CommentBase):
    post_id: int
    parent_id: Optional[int] = None


class CommentUpdate(BaseModel):
    content: str = Field(..., min_length=1, max_length=2000)


class CommentAuthor(BaseModel):
    id: int
    username: str
    
    class Config:
        from_attributes = True


class CommentOut(CommentBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    is_deleted: bool
    post_id: int
    author_id: int
    parent_id: Optional[int] = None
    author: CommentAuthor
    replies: List['CommentOut'] = []

    class Config:
        from_attributes = True


# Update forward reference
CommentOut.model_rebuild()
