#!/usr/bin/env python3

import sys
import os
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
from app.models.user import User
from app.models.role import UserRole
from app.utils.security import hash_password

def create_admin_user():
    """Create the admin user with alpha clearance if it doesn't exist."""
    
    # Database URL from environment or default
    database_url = os.getenv("DATABASE_URL", "postgresql://forum:secret@db:5432/forumdb")
    
    try:
        # Create engine and session
        engine = create_engine(database_url)
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        db = SessionLocal()
        
        # Admin user credentials
        admin_username = "admin"
        admin_email = "siddharthsinha1125@gmail.com"
        admin_password = "hitmen@007"
        
        # Check if admin user already exists
        existing_admin = db.query(User).filter(
            (User.username == admin_username) | (User.email == admin_email)
        ).first()
        
        if existing_admin:
            print(f"🔐 Admin user already exists: {existing_admin.username} ({existing_admin.email})")
            print(f"🎖️  Current role: {existing_admin.role}")
            
            # Update role to alpha if it's not already
            if existing_admin.role != UserRole.ALPHA:
                existing_admin.role = UserRole.ALPHA
                db.commit()
                print(f"✅ Updated {existing_admin.username} role to ALPHA")
            else:
                print(f"✅ Admin already has ALPHA clearance")
            
            db.close()
            return True
        
        # Create admin user
        hashed_password = hash_password(admin_password)
        admin_user = User(
            username=admin_username,
            email=admin_email,
            hashed_password=hashed_password,
            role=UserRole.ALPHA,
            is_active=True
        )
        
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        
        print("🚀 HITMEN Forum Admin User Created:")
        print(f"   👤 Username: {admin_user.username}")
        print(f"   📧 Email: {admin_user.email}")
        print(f"   🎖️  Clearance: {admin_user.role.upper()}")
        print(f"   🆔 User ID: {admin_user.id}")
        print(f"   📅 Created: {admin_user.created_at}")
        print("   🔑 Password: [REDACTED - Use your configured password]")
        
        db.close()
        return True
        
    except Exception as e:
        print(f"❌ Error creating admin user: {e}")
        return False

if __name__ == "__main__":
    print("========================================")
    print("🎯 HITMEN Admin User Seeding...")
    print("========================================")
    
    success = create_admin_user()
    
    if success:
        print("✅ Admin seeding completed successfully!")
    else:
        print("❌ Admin seeding failed!")
        sys.exit(1)
    
    print("========================================")
