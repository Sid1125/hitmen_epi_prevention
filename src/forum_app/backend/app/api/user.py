from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
from app.db.database import get_db
from app.models import post as post_models, comment as comment_models, user as user_models
from app.schemas import post as post_schemas, user as user_schemas
from app.auth.auth_handler import decode_access_token
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
from datetime import datetime
from app.utils.permissions import is_admin
from app.models.role import UserRole
from app.utils.security import hash_password, verify_password

router = APIRouter(tags=["Users"])
security = HTTPBearer()


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    """Get current authenticated user"""
    payload = decode_access_token(credentials.credentials)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    username = payload.get("sub")
    if not username:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = db.query(user_models.User).filter(user_models.User.username == username).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    return user


@router.get("/me", response_model=user_schemas.UserProfile)
def get_current_user_profile(current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get current user's profile"""
    # Get user stats
    post_count = db.query(func.count(post_models.Post.id)).filter(post_models.Post.author_id == current_user.id).scalar()
    comment_count = db.query(func.count(comment_models.Comment.id)).filter(
        comment_models.Comment.author_id == current_user.id,
        comment_models.Comment.is_deleted == False
    ).scalar()
    
    return user_schemas.UserProfile(
        id=current_user.id,
        username=current_user.username,
        email=current_user.email,
        role=current_user.role,
        created_at=current_user.created_at,
        is_active=current_user.is_active,
        post_count=post_count,
        comment_count=comment_count
    )


@router.get("/{user_id}", response_model=user_schemas.UserProfilePublic)
def get_user_profile(user_id: int, db: Session = Depends(get_db)):
    """Get public user profile by ID"""
    user = db.query(user_models.User).filter(user_models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get user stats
    post_count = db.query(func.count(post_models.Post.id)).filter(post_models.Post.author_id == user.id).scalar()
    comment_count = db.query(func.count(comment_models.Comment.id)).filter(
        comment_models.Comment.author_id == user.id,
        comment_models.Comment.is_deleted == False
    ).scalar()
    
    return user_schemas.UserProfilePublic(
        id=user.id,
        username=user.username,
        created_at=user.created_at,
        is_active=user.is_active,
        post_count=post_count,
        comment_count=comment_count
    )


@router.get("/username/{username}", response_model=user_schemas.UserProfilePublic)
def get_user_profile_by_username(username: str, db: Session = Depends(get_db)):
    """Get public user profile by username"""
    user = db.query(user_models.User).filter(user_models.User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get user stats
    post_count = db.query(func.count(post_models.Post.id)).filter(post_models.Post.author_id == user.id).scalar()
    comment_count = db.query(func.count(comment_models.Comment.id)).filter(
        comment_models.Comment.author_id == user.id,
        comment_models.Comment.is_deleted == False
    ).scalar()
    
    return user_schemas.UserProfilePublic(
        id=user.id,
        username=user.username,
        created_at=user.created_at,
        is_active=user.is_active,
        post_count=post_count,
        comment_count=comment_count
    )


@router.get("/user/{username}", response_model=user_schemas.UserProfilePublic)
def get_user_profile_by_username_alt(username: str, db: Session = Depends(get_db)):
    """Get public user profile by username - alternative endpoint for cleaner URLs"""
    user = db.query(user_models.User).filter(user_models.User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get user stats
    post_count = db.query(func.count(post_models.Post.id)).filter(post_models.Post.author_id == user.id).scalar()
    comment_count = db.query(func.count(comment_models.Comment.id)).filter(
        comment_models.Comment.author_id == user.id,
        comment_models.Comment.is_deleted == False
    ).scalar()
    
    return user_schemas.UserProfilePublic(
        id=user.id,
        username=user.username,
        created_at=user.created_at,
        is_active=user.is_active,
        post_count=post_count,
        comment_count=comment_count
    )


class RoleUpdate(BaseModel):
    role: UserRole

class PasswordChange(BaseModel):
    current_password: str
    new_password: str

@router.get("/admin/all", response_model=list[user_schemas.UserProfile])
def get_all_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all users - admin only"""
    # Check if current user is admin
    if not is_admin(current_user):
        raise HTTPException(status_code=403, detail="Not authorized to view all users")
    
    users = db.query(user_models.User).offset(skip).limit(limit).all()
    
    user_profiles = []
    for user in users:
        # Get user stats
        post_count = db.query(func.count(post_models.Post.id)).filter(post_models.Post.author_id == user.id).scalar()
        comment_count = db.query(func.count(comment_models.Comment.id)).filter(
            comment_models.Comment.author_id == user.id,
            comment_models.Comment.is_deleted == False
        ).scalar()
        
        user_profile = user_schemas.UserProfile(
            id=user.id,
            username=user.username,
            email=user.email,
            role=user.role,
            created_at=user.created_at,
            is_active=user.is_active,
            post_count=post_count,
            comment_count=comment_count
        )
        user_profiles.append(user_profile)
    
    return user_profiles

@router.put("/{user_id}/role", response_model=user_schemas.UserProfile)
def update_user_role(user_id: int, role_data: RoleUpdate, current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    """Allow admin to update a user role"""
    # Check if current user is admin
    if not is_admin(current_user):
        raise HTTPException(status_code=403, detail="Not authorized to change roles")

    # Find the user to update
    user = db.query(user_models.User).filter(user_models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Update user role
    user.role = role_data.role
    db.commit()
    db.refresh(user)

    return user_schemas.UserProfile(
        id=user.id,
        username=user.username,
        email=user.email,
        role=user.role,
        created_at=user.created_at,
        is_active=user.is_active,
        post_count=db.query(func.count(post_models.Post.id)).filter(post_models.Post.author_id == user.id).scalar(),
        comment_count=db.query(func.count(comment_models.Comment.id)).filter(
            comment_models.Comment.author_id == user.id,
            comment_models.Comment.is_deleted == False
        ).scalar()
    )

@router.get("/me/posts", response_model=list[post_schemas.PostSummary])
def get_current_user_posts(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's posts"""
    query = db.query(
        post_models.Post,
        func.count(comment_models.Comment.id).label('comment_count')
    ).outerjoin(comment_models.Comment, 
        (comment_models.Comment.post_id == post_models.Post.id) & 
        (comment_models.Comment.is_deleted == False)
    ).filter(
        post_models.Post.author_id == current_user.id
    ).group_by(post_models.Post.id)
    
    # Order by creation date (newest first)
    query = query.order_by(post_models.Post.created_at.desc())
    
    results = query.offset(skip).limit(limit).all()
    
    # Convert to PostSummary format
    post_summaries = []
    for post, comment_count in results:
        # Convert tags string back to list
        tags_list = post.tags.split(",") if post.tags else []
        
        post_summary = post_schemas.PostSummary(
            id=post.id,
            title=post.title,
            created_at=post.created_at,
            updated_at=post.updated_at,
            is_pinned=post.is_pinned,
            is_locked=post.is_locked,
            view_count=post.view_count,
            like_count=post.like_count,
            dislike_count=post.dislike_count,
            author=post_schemas.PostAuthor.model_validate(post.author),
            comment_count=comment_count,
            tags=tags_list
        )
        post_summaries.append(post_summary)
    
    return post_summaries


@router.get("/{user_id}/posts", response_model=list[post_schemas.PostSummary])
def get_user_posts(
    user_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get user's posts by user ID"""
    # Verify user exists
    user = db.query(user_models.User).filter(user_models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    query = db.query(
        post_models.Post,
        func.count(comment_models.Comment.id).label('comment_count')
    ).outerjoin(comment_models.Comment, 
        (comment_models.Comment.post_id == post_models.Post.id) & 
        (comment_models.Comment.is_deleted == False)
    ).filter(
        post_models.Post.author_id == user_id
    ).group_by(post_models.Post.id)
    
    # Order by creation date (newest first)
    query = query.order_by(post_models.Post.created_at.desc())
    
    results = query.offset(skip).limit(limit).all()
    
    # Convert to PostSummary format
    post_summaries = []
    for post, comment_count in results:
        # Convert tags string back to list
        tags_list = post.tags.split(",") if post.tags else []
        
        post_summary = post_schemas.PostSummary(
            id=post.id,
            title=post.title,
            created_at=post.created_at,
            updated_at=post.updated_at,
            is_pinned=post.is_pinned,
            is_locked=post.is_locked,
            view_count=post.view_count,
            like_count=post.like_count,
            dislike_count=post.dislike_count,
            author=post_schemas.PostAuthor.model_validate(post.author),
            comment_count=comment_count,
            tags=tags_list
        )
        post_summaries.append(post_summary)
    
    return post_summaries


@router.put("/me/profile", response_model=user_schemas.UserProfile)
def update_current_user_profile(
    profile_update: user_schemas.UserProfileUpdate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update current user's profile"""
    # Check if username is already taken (if being changed)
    if profile_update.username and profile_update.username != current_user.username:
        existing_user = db.query(user_models.User).filter(
            user_models.User.username == profile_update.username,
            user_models.User.id != current_user.id
        ).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Username already taken")
    
    # Check if email is already taken (if being changed)
    if profile_update.email and profile_update.email != current_user.email:
        existing_user = db.query(user_models.User).filter(
            user_models.User.email == profile_update.email,
            user_models.User.id != current_user.id
        ).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already taken")
    
    # Update fields that are provided
    update_data = profile_update.dict(exclude_unset=True)
    
    for field, value in update_data.items():
        if hasattr(current_user, field):
            setattr(current_user, field, value)
    
    db.commit()
    db.refresh(current_user)
    
    # Get updated stats
    post_count = db.query(func.count(post_models.Post.id)).filter(post_models.Post.author_id == current_user.id).scalar()
    comment_count = db.query(func.count(comment_models.Comment.id)).filter(
        comment_models.Comment.author_id == current_user.id,
        comment_models.Comment.is_deleted == False
    ).scalar()
    
    return user_schemas.UserProfile(
        id=current_user.id,
        username=current_user.username,
        email=current_user.email,
        role=current_user.role,
        created_at=current_user.created_at,
        is_active=current_user.is_active,
        post_count=post_count,
        comment_count=comment_count
    )

@router.post("/me/change-password", status_code=status.HTTP_200_OK)
def change_password(
    password_data: PasswordChange,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Change current user's password"""
    # Verify current password
    if not verify_password(password_data.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    
    # Validate new password (you can add more validation here)
    if len(password_data.new_password) < 6:
        raise HTTPException(status_code=400, detail="New password must be at least 6 characters long")
    
    # Hash the new password and update
    new_hashed_password = hash_password(password_data.new_password)
    current_user.hashed_password = new_hashed_password
    
    db.commit()
    
    return {"message": "Password changed successfully"}

@router.delete("/me/account", status_code=status.HTTP_200_OK)
def delete_account(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete current user's account and all associated data"""
    # Delete user's comments (soft delete)
    db.query(comment_models.Comment).filter(
        comment_models.Comment.author_id == current_user.id
    ).update({"is_deleted": True})
    
    # Delete user's posts
    db.query(post_models.Post).filter(
        post_models.Post.author_id == current_user.id
    ).delete()
    
    # Delete the user
    db.delete(current_user)
    db.commit()
    
    return {"message": "Account deleted successfully"}

@router.delete("/admin/{user_id}", status_code=status.HTTP_200_OK)
def admin_delete_user(
    user_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Admin: Delete any user by ID and all associated data"""
    if not is_admin(current_user):
        raise HTTPException(status_code=403, detail="Not authorized")
    user = db.query(user_models.User).filter(user_models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    # Soft delete user's comments
    db.query(comment_models.Comment).filter(
        comment_models.Comment.author_id == user.id
    ).update({"is_deleted": True})
    # Delete user's posts
    db.query(post_models.Post).filter(
        post_models.Post.author_id == user.id
    ).delete()
    # Delete the user
    db.delete(user)
    db.commit()
    return {"message": "User deleted successfully"}
