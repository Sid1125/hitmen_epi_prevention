from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.user import UserCreate, UserLogin, UserResponse
from app.models.user import User
from app.utils.security import hash_password, verify_password
from app.auth.auth_handler import create_access_token
from app.utils.email import email_service, get_welcome_email_data
import asyncio

router = APIRouter(tags=["Auth"])

@router.post("/register")
async def register(user: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter((User.username == user.username) | (User.email == user.email)).first()
    if existing:
        raise HTTPException(status_code=400, detail="User already exists")
    
    hashed = hash_password(user.password)
    new_user = User(
        username=user.username, 
        email=user.email, 
        hashed_password=hashed,
        role=user.role  # Use the role from the request, defaults to DELTA
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Send welcome email (non-blocking)
    try:
        await email_service.send_welcome_email(new_user)
        print(f"Welcome email sent to {new_user.email}")
    except Exception as e:
        print(f"Failed to send welcome email to {new_user.email}: {str(e)}")
        # Don't fail registration if email fails
    
    # Return user data with email data for frontend
    user_response = UserResponse.model_validate(new_user)
    email_data = get_welcome_email_data(new_user)
    
    return {
        **user_response.dict(),
        "email_data": email_data
    }

@router.get("/email-data/{user_id}")
def get_user_email_data(user_id: int, db: Session = Depends(get_db)):
    """Get email data for a user (for resending welcome email)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return get_welcome_email_data(user)

@router.post("/login")
def login(creds: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == creds.username).first()
    if not user or not verify_password(creds.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"sub": user.username})
    return {"access_token": token, "token_type": "bearer"}
