from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models import comment as models, post as post_models
from app.schemas import comment as schemas
from app.auth.auth_handler import decode_access_token
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.models.reaction import CommentReaction, ReactionType
from app.schemas.user import UserResponse

router = APIRouter(tags=["Comments"])
security = HTTPBearer()


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    """Get current authenticated user"""
    payload = decode_access_token(credentials.credentials)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    username = payload.get("sub")
    if not username:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    from app.models.user import User
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    return user


def prepare_comment_for_serialization(comment):
    # Do NOT assign Pydantic model to comment.author!
    if hasattr(comment, 'replies') and comment.replies:
        for reply in comment.replies:
            prepare_comment_for_serialization(reply)
    return comment


@router.post("/", response_model=schemas.CommentOut, status_code=status.HTTP_201_CREATED)
def create_comment(comment: schemas.CommentCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    # Verify post exists
    post = db.query(post_models.Post).filter(post_models.Post.id == comment.post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # Verify parent comment exists if provided
    if comment.parent_id:
        parent = db.query(models.Comment).filter(models.Comment.id == comment.parent_id).first()
        if not parent:
            raise HTTPException(status_code=404, detail="Parent comment not found")
    
    db_comment = models.Comment(
        content=comment.content,
        post_id=comment.post_id,
        author_id=current_user.id,
        parent_id=comment.parent_id
    )
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    
    # Manually construct the response with proper serialization
    from app.schemas.comment import CommentAuthor
    
    comment_dict = {
        "id": db_comment.id,
        "content": db_comment.content,
        "created_at": db_comment.created_at,
        "updated_at": db_comment.updated_at,
        "is_deleted": db_comment.is_deleted,
        "post_id": db_comment.post_id,
        "author_id": db_comment.author_id,
        "parent_id": db_comment.parent_id,
        "like_count": db_comment.like_count,
        "dislike_count": db_comment.dislike_count,
        "author": CommentAuthor.model_validate(db_comment.author),
        "replies": []
    }
    
    return schemas.CommentOut.model_validate(comment_dict)


def serialize_comment_with_replies(comment, db: Session):
    """Recursively serialize a comment with its replies"""
    from app.schemas.comment import CommentAuthor
    
    # Get replies for this comment
    replies = db.query(models.Comment).filter(
        models.Comment.parent_id == comment.id,
        models.Comment.is_deleted == False
    ).order_by(models.Comment.created_at.asc()).all()
    
    # Recursively serialize replies
    replies_data = []
    for reply in replies:
        replies_data.append(serialize_comment_with_replies(reply, db))
    
    comment_dict = {
        "id": comment.id,
        "content": comment.content,
        "created_at": comment.created_at,
        "updated_at": comment.updated_at,
        "is_deleted": comment.is_deleted,
        "post_id": comment.post_id,
        "author_id": comment.author_id,
        "parent_id": comment.parent_id,
        "like_count": comment.like_count,
        "dislike_count": comment.dislike_count,
        "author": CommentAuthor.model_validate(comment.author),
        "replies": replies_data
    }
    
    return schemas.CommentOut.model_validate(comment_dict)


@router.get("/post/{post_id}", response_model=list[schemas.CommentOut])
def get_comments_by_post(post_id: int, db: Session = Depends(get_db)):
    # Verify post exists
    post = db.query(post_models.Post).filter(post_models.Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    # Get top-level comments (no parent)
    comments = db.query(models.Comment).filter(
        models.Comment.post_id == post_id,
        models.Comment.parent_id.is_(None),
        models.Comment.is_deleted == False
    ).order_by(models.Comment.created_at.asc()).all()
    
    # Serialize comments with their replies recursively
    comments_data = []
    for comment in comments:
        comments_data.append(serialize_comment_with_replies(comment, db))
    
    return comments_data


@router.get("/{comment_id}", response_model=schemas.CommentOut)
def get_comment(comment_id: int, db: Session = Depends(get_db)):
    comment = db.query(models.Comment).filter(
        models.Comment.id == comment_id,
        models.Comment.is_deleted == False
    ).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    # Manually construct the response with proper serialization
    from app.schemas.comment import CommentAuthor
    
    comment_dict = {
        "id": comment.id,
        "content": comment.content,
        "created_at": comment.created_at,
        "updated_at": comment.updated_at,
        "is_deleted": comment.is_deleted,
        "post_id": comment.post_id,
        "author_id": comment.author_id,
        "parent_id": comment.parent_id,
        "like_count": comment.like_count,
        "dislike_count": comment.dislike_count,
        "author": CommentAuthor.model_validate(comment.author),
        "replies": []
    }
    
    return schemas.CommentOut.model_validate(comment_dict)


@router.put("/{comment_id}", response_model=schemas.CommentOut)
def update_comment(comment_id: int, comment_update: schemas.CommentUpdate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    from app.utils.permissions import can_edit_comment
    
    comment = db.query(models.Comment).filter(models.Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    # Check if user has permission to edit this comment
    if not can_edit_comment(current_user, comment):
        raise HTTPException(status_code=403, detail="Not authorized to edit this comment")
    
    comment.content = comment_update.content
    db.commit()
    db.refresh(comment)
    return comment


@router.delete("/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_comment(comment_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    from app.utils.permissions import can_delete_comment
    
    comment = db.query(models.Comment).filter(models.Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    # Check if user has permission to delete this comment (role-based)
    if not can_delete_comment(current_user, comment):
        raise HTTPException(status_code=403, detail="Not authorized to delete this comment")
    
    # Soft delete
    comment.is_deleted = True
    comment.content = "[Comment deleted]"
    db.commit()
    return None

@router.post("/{comment_id}/like", status_code=200)
def like_comment(comment_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    db_comment = db.query(models.Comment).filter(models.Comment.id == comment_id).first()
    if not db_comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    reaction = db.query(CommentReaction).filter_by(user_id=current_user.id, comment_id=comment_id).first()
    if reaction:
        if reaction.reaction == ReactionType.like:
            db.delete(reaction)
            db_comment.like_count = max(0, getattr(db_comment, 'like_count', 0) - 1)
        else:
            reaction.reaction = ReactionType.like
            db_comment.like_count = getattr(db_comment, 'like_count', 0) + 1
            db_comment.dislike_count = max(0, getattr(db_comment, 'dislike_count', 0) - 1)
    else:
        new_reaction = CommentReaction(user_id=current_user.id, comment_id=comment_id, reaction=ReactionType.like)
        db.add(new_reaction)
        db_comment.like_count = getattr(db_comment, 'like_count', 0) + 1
    db.commit()
    return {"like_count": getattr(db_comment, 'like_count', 0)}

@router.post("/{comment_id}/dislike", status_code=200)
def dislike_comment(comment_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    db_comment = db.query(models.Comment).filter(models.Comment.id == comment_id).first()
    if not db_comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    reaction = db.query(CommentReaction).filter_by(user_id=current_user.id, comment_id=comment_id).first()
    if reaction:
        if reaction.reaction == ReactionType.dislike:
            db.delete(reaction)
            db_comment.dislike_count = max(0, getattr(db_comment, 'dislike_count', 0) - 1)
        else:
            reaction.reaction = ReactionType.dislike
            db_comment.dislike_count = getattr(db_comment, 'dislike_count', 0) + 1
            db_comment.like_count = max(0, getattr(db_comment, 'like_count', 0) - 1)
    else:
        new_reaction = CommentReaction(user_id=current_user.id, comment_id=comment_id, reaction=ReactionType.dislike)
        db.add(new_reaction)
        db_comment.dislike_count = getattr(db_comment, 'dislike_count', 0) + 1
    db.commit()
    return {"dislike_count": getattr(db_comment, 'dislike_count', 0)}
