from typing import Dict, Any
from app.models.user import User

def get_welcome_email_data(user: User) -> Dict[str, Any]:
    """Prepare welcome email data for frontend EmailJS sending"""
    return {
        "to_email": user.email,
        "to_name": user.username,
        "username": user.username,
        "username_upper": user.username.upper(),
        "email": user.email,
"role": user.role.upper(),
    "clearance": user.role.upper(),
        "created_at": user.created_at.strftime("%Y-%m-%d %H:%M UTC"),
        "subject": "🕶️ HITMEN: Operative Registration Confirmed - Clearance Granted"
    }

class EmailService:
    def prepare_welcome_email_data(self, user: User) -> Dict[str, Any]:
        """Prepare welcome email data for EmailJS"""
        return get_welcome_email_data(user)
    
    async def send_welcome_email(self, user: User, temp_password: str = None):
        """Return email data for frontend to send via EmailJS"""
        try:
            # Just return True - email will be sent from frontend
            print(f"Welcome email data prepared for {user.email}")
            return True
        except Exception as e:
            print(f"Failed to prepare welcome email data for {user.email}: {str(e)}")
            return False

# Create global email service instance
email_service = EmailService()
