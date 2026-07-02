from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.database import get_db
from app.models import post as models, comment as comment_models
from app.schemas import post as schemas
from app.auth.auth_handler import decode_access_token
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
from app.models.reaction import PostReaction, ReactionType
from app.schemas.post import PostAuthor

router = APIRouter(tags=["Posts"])
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


@router.post("/", response_model=schemas.PostOut, status_code=status.HTTP_201_CREATED)
def create_post(post: schemas.PostCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    # Convert tags list to comma-separated string
    tags_str = ",".join(post.tags) if post.tags else None
    
    db_post = models.Post(
        title=post.title,
        content=post.content,
        tags=tags_str,
        author_id=current_user.id
    )
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    
    # Convert tags back to list for response
    if hasattr(db_post, 'tags') and db_post.tags:
        db_post.tags = db_post.tags.split(",")
    else:
        db_post.tags = []
    
    # Manually construct the response to handle proper serialization
    post_dict = {
        "id": db_post.id,
        "title": db_post.title,
        "content": db_post.content,
        "tags": db_post.tags,
        "like_count": db_post.like_count,
        "dislike_count": db_post.dislike_count,
        "created_at": db_post.created_at,
        "updated_at": db_post.updated_at,
        "is_pinned": db_post.is_pinned,
        "is_locked": db_post.is_locked,
        "view_count": db_post.view_count,
        "author_id": db_post.author_id,
        "author": schemas.PostAuthor.model_validate(db_post.author),
        "comments": []  # New posts don't have comments yet
    }
    
    return schemas.PostOut.model_validate(post_dict)


@router.post("", response_model=schemas.PostOut, status_code=status.HTTP_201_CREATED)
def create_post_no_slash(post: schemas.PostCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    # Call the main create_post logic
    return create_post(post, db, current_user)


@router.get("/", response_model=list[schemas.PostSummary])
def get_posts(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None, min_length=1),
    tag: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(
        models.Post,
        func.count(comment_models.Comment.id).label('comment_count')
    ).outerjoin(comment_models.Comment, 
        (comment_models.Comment.post_id == models.Post.id) & 
        (comment_models.Comment.is_deleted == False)
    ).group_by(models.Post.id)
    
    if search:
        query = query.filter(models.Post.title.contains(search))
    
    if tag:
        query = query.filter(models.Post.tags.contains(tag))
    
    # Order by pinned first, then by creation date
    query = query.order_by(models.Post.is_pinned.desc(), models.Post.created_at.desc())
    
    results = query.offset(skip).limit(limit).all()
    
    # Convert to PostSummary format
    post_summaries = []
    for post, comment_count in results:
        # Convert tags string back to list
        tags_list = post.tags.split(",") if post.tags else []
        
        post_summary = schemas.PostSummary(
            id=post.id,
            title=post.title,
            created_at=post.created_at,
            updated_at=post.updated_at,
            is_pinned=post.is_pinned,
            is_locked=post.is_locked,
            view_count=post.view_count,
            like_count=post.like_count,
            dislike_count=post.dislike_count,
            author=schemas.PostAuthor.model_validate(post.author),
            comment_count=comment_count,
            tags=tags_list
        )
        post_summaries.append(post_summary)
    
    return post_summaries

@router.get("", response_model=list[schemas.PostSummary])
def get_posts_no_slash(skip: int = Query(0, ge=0), limit: int = Query(10, ge=1, le=100), search: Optional[str] = Query(None, min_length=1), tag: Optional[str] = Query(None), db: Session = Depends(get_db)):
    return get_posts(skip, limit, search, tag, db)


@router.get("/{post_id}", response_model=schemas.PostOut)
def get_post(post_id: int, db: Session = Depends(get_db)):
    db_post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # Increment view count
    db_post.view_count += 1
    db.commit()
    
    # Convert tags string back to list for response
    if hasattr(db_post, 'tags') and db_post.tags:
        db_post.tags = db_post.tags.split(",")
    else:
        db_post.tags = []
    
    # Manually construct the response to handle proper serialization
    from app.schemas.comment import CommentOut, CommentAuthor
    
    # Prepare comments with proper author serialization and replies
    def serialize_comment_with_replies_for_post(comment, db: Session):
        """Recursively serialize a comment with its replies for post detail"""
        # Get replies for this comment
        replies = db.query(comment_models.Comment).filter(
            comment_models.Comment.parent_id == comment.id,
            comment_models.Comment.is_deleted == False
        ).order_by(comment_models.Comment.created_at.asc()).all()
        
        # Recursively serialize replies
        replies_data = []
        for reply in replies:
            replies_data.append(serialize_comment_with_replies_for_post(reply, db))
        
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
        
        return CommentOut.model_validate(comment_dict)
    
    comments_data = []
    # Only get top-level comments (no parent) for the post detail
    top_level_comments = [c for c in db_post.comments if not c.is_deleted and c.parent_id is None]
    for comment in top_level_comments:
        comments_data.append(serialize_comment_with_replies_for_post(comment, db))
    
    # Construct the post response
    post_dict = {
        "id": db_post.id,
        "title": db_post.title,
        "content": db_post.content,
        "tags": db_post.tags,
        "like_count": db_post.like_count,
        "dislike_count": db_post.dislike_count,
        "created_at": db_post.created_at,
        "updated_at": db_post.updated_at,
        "is_pinned": db_post.is_pinned,
        "is_locked": db_post.is_locked,
        "view_count": db_post.view_count,
        "author_id": db_post.author_id,
        "author": schemas.PostAuthor.model_validate(db_post.author),
        "comments": comments_data
    }
    
    return schemas.PostOut.model_validate(post_dict)


@router.put("/{post_id}", response_model=schemas.PostOut)
def update_post(post_id: int, post_update: schemas.PostUpdate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    from app.utils.permissions import can_edit_post
    
    db_post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # Check if user has permission to edit this post
    if not can_edit_post(current_user, db_post):
        raise HTTPException(status_code=403, detail="Not authorized to edit this post")
    
    # Update fields that are provided
    update_data = post_update.dict(exclude_unset=True)
    
    if 'tags' in update_data and update_data['tags'] is not None:
        update_data['tags'] = ",".join(update_data['tags'])
    
    for field, value in update_data.items():
        setattr(db_post, field, value)
    
    db.commit()
    db.refresh(db_post)
    
    # Convert tags back to list for response
    if hasattr(db_post, 'tags') and db_post.tags:
        db_post.tags = db_post.tags.split(",")
    else:
        db_post.tags = []
    
    # Manually construct the response to handle proper serialization
    from app.schemas.comment import CommentOut, CommentAuthor
    
    # Prepare comments with proper author serialization and replies
    def serialize_comment_with_replies_for_post_update(comment, db: Session):
        """Recursively serialize a comment with its replies for post update"""
        # Get replies for this comment
        replies = db.query(comment_models.Comment).filter(
            comment_models.Comment.parent_id == comment.id,
            comment_models.Comment.is_deleted == False
        ).order_by(comment_models.Comment.created_at.asc()).all()
        
        # Recursively serialize replies
        replies_data = []
        for reply in replies:
            replies_data.append(serialize_comment_with_replies_for_post_update(reply, db))
        
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
        
        return CommentOut.model_validate(comment_dict)
    
    comments_data = []
    # Only get top-level comments (no parent) for the post update
    top_level_comments = [c for c in db_post.comments if not c.is_deleted and c.parent_id is None]
    for comment in top_level_comments:
        comments_data.append(serialize_comment_with_replies_for_post_update(comment, db))
    
    # Construct the post response
    post_dict = {
        "id": db_post.id,
        "title": db_post.title,
        "content": db_post.content,
        "tags": db_post.tags,
        "like_count": db_post.like_count,
        "dislike_count": db_post.dislike_count,
        "created_at": db_post.created_at,
        "updated_at": db_post.updated_at,
        "is_pinned": db_post.is_pinned,
        "is_locked": db_post.is_locked,
        "view_count": db_post.view_count,
        "author_id": db_post.author_id,
        "author": schemas.PostAuthor.model_validate(db_post.author),
        "comments": comments_data
    }
    
    return schemas.PostOut.model_validate(post_dict)


@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_post(post_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    from app.utils.permissions import can_delete_post
    
    db_post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # Check if user has permission to delete this post (role-based)
    if not can_delete_post(current_user, db_post):
        raise HTTPException(status_code=403, detail="Not authorized to delete this post")
    
    db.delete(db_post)
    db.commit()
    return None

@router.post("/{post_id}/like", status_code=200)
def like_post(post_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    db_post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found")
    reaction = db.query(PostReaction).filter_by(user_id=current_user.id, post_id=post_id).first()
    if reaction:
        if reaction.reaction == ReactionType.like:
            # Already liked, toggle off
            db.delete(reaction)
            db_post.like_count = max(0, db_post.like_count - 1)
        else:
            # Switch from dislike to like
            reaction.reaction = ReactionType.like
            db_post.like_count += 1
            db_post.dislike_count = max(0, db_post.dislike_count - 1)
    else:
        # New like
        new_reaction = PostReaction(user_id=current_user.id, post_id=post_id, reaction=ReactionType.like)
        db.add(new_reaction)
        db_post.like_count += 1
    db.commit()
    return {"like_count": db_post.like_count}

@router.post("/{post_id}/dislike", status_code=200)
def dislike_post(post_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    db_post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found")
    reaction = db.query(PostReaction).filter_by(user_id=current_user.id, post_id=post_id).first()
    if reaction:
        if reaction.reaction == ReactionType.dislike:
            # Already disliked, toggle off
            db.delete(reaction)
            db_post.dislike_count = max(0, db_post.dislike_count - 1)
        else:
            # Switch from like to dislike
            reaction.reaction = ReactionType.dislike
            db_post.dislike_count += 1
            db_post.like_count = max(0, db_post.like_count - 1)
    else:
        # New dislike
        new_reaction = PostReaction(user_id=current_user.id, post_id=post_id, reaction=ReactionType.dislike)
        db.add(new_reaction)
        db_post.dislike_count += 1
    db.commit()
    return {"dislike_count": db_post.dislike_count}
