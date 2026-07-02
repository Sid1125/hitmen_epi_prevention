from app.models.role import UserRole
from app.models.user import User
from app.models.post import Post
from app.models.comment import Comment

def can_delete_post(user: User, post: Post) -> bool:
    """
    Check if a user can delete a specific post.
    
    Args:
        user: The user attempting to delete the post
        post: The post to be deleted
        
    Returns:
        bool: True if user can delete the post, False otherwise
    """
    # Alpha operatives (admins) can delete any post
    if user.role == UserRole.ALPHA:
        return True
    
    # Delta operatives (normal users) can only delete their own posts
    if user.role == UserRole.DELTA and post.author_id == user.id:
        return True
    
    return False

def can_edit_post(user: User, post: Post) -> bool:
    """
    Check if a user can edit a specific post.
    
    Args:
        user: The user attempting to edit the post
        post: The post to be edited
        
    Returns:
        bool: True if user can edit the post, False otherwise
    """
    # Only the author can edit their own post (even admins shouldn't edit others' content)
    return post.author_id == user.id

def can_delete_comment(user: User, comment: Comment) -> bool:
    """
    Check if a user can delete a specific comment.
    
    Args:
        user: The user attempting to delete the comment
        comment: The comment to be deleted
        
    Returns:
        bool: True if user can delete the comment, False otherwise
    """
    # Alpha operatives (admins) can delete any comment
    if user.role == UserRole.ALPHA:
        return True
    
    # Delta operatives (normal users) can only delete their own comments
    if user.role == UserRole.DELTA and comment.author_id == user.id:
        return True
    
    return False

def can_edit_comment(user: User, comment: Comment) -> bool:
    """
    Check if a user can edit a specific comment.
    
    Args:
        user: The user attempting to edit the comment
        comment: The comment to be edited
        
    Returns:
        bool: True if user can edit the comment, False otherwise
    """
    # Only the author can edit their own comment (even admins shouldn't edit others' content)
    return comment.author_id == user.id

def is_admin(user: User) -> bool:
    """
    Check if a user is an admin (Alpha operative).
    
    Args:
        user: The user to check
        
    Returns:
        bool: True if user is an admin, False otherwise
    """
    return user.role == UserRole.ALPHA
