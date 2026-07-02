from sqlalchemy import Column, Integer, ForeignKey, UniqueConstraint, Enum
from sqlalchemy.orm import relationship
from app.db.database import Base
import enum

class ReactionType(str, enum.Enum):
    like = "like"
    dislike = "dislike"

class PostReaction(Base):
    __tablename__ = "post_reactions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    post_id = Column(Integer, ForeignKey("posts.id"), nullable=False)
    reaction = Column(Enum(ReactionType), nullable=False)
    __table_args__ = (UniqueConstraint("user_id", "post_id", name="unique_user_post"),)

class CommentReaction(Base):
    __tablename__ = "comment_reactions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    comment_id = Column(Integer, ForeignKey("comments.id"), nullable=False)
    reaction = Column(Enum(ReactionType), nullable=False)
    __table_args__ = (UniqueConstraint("user_id", "comment_id", name="unique_user_comment"),) 