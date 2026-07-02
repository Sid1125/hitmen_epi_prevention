# Admin Panel Documentation

## Overview
The HITMEN forum includes a comprehensive admin control panel accessible at `http://localhost:8080/admin` for users with Alpha clearance (admin role).

## Admin Credentials
- **Username:** admin
- **Email:** siddharthsinha1125@gmail.com  
- **Password:** hitmen@007
- **Role:** Alpha (admin)

## Admin Features

### User Management
- **View All Users:** Complete roster of all registered operatives
- **Search & Filter:** Search by username/email and filter by clearance level
- **Role Management:** Promote users to Alpha clearance or demote to Delta clearance
- **User Statistics:** View post count, comment count, and join date for each user

### Access Control
- **Alpha Clearance Required:** Only admin users can access the admin panel
- **Authentication Gate:** Non-authenticated users are prompted to login
- **Security Validation:** Backend validates admin role before showing sensitive data

### Dashboard Features
- **User Statistics:** Total operatives, Alpha clearance count, Delta clearance count
- **Search Functionality:** Real-time search through usernames and emails
- **Role Filtering:** Filter users by clearance level (All/Alpha/Delta)
- **Responsive Design:** Works on desktop and mobile devices

## API Endpoints

### Admin Endpoints
- `GET /api/users/admin/all` - Get all users (admin only)
- `PUT /api/users/{user_id}/role` - Update user role (admin only)

### User Endpoints  
- `GET /api/users/me` - Get current user profile
- `POST /api/auth/login` - User authentication
- `POST /api/auth/register` - User registration

## Security Features
- **JWT Authentication:** All admin actions require valid authentication tokens
- **Role-based Access Control:** Backend validates admin role for all admin operations
- **Input Validation:** All user inputs are validated and sanitized
- **Error Handling:** Comprehensive error handling with user-friendly messages

## Usage Instructions

1. **Access Admin Panel:**
   - Navigate to `http://localhost:8080/admin`
   - Login with admin credentials if not already authenticated

2. **Manage User Roles:**
   - Use the search bar to find specific users
   - Filter by clearance level using the dropdown
   - Click "PROMOTE TO ALPHA" to grant admin privileges
   - Click "DEMOTE TO DELTA" to revoke admin privileges

3. **Monitor Activity:**
   - View user statistics in the dashboard
   - Check post and comment counts for each user
   - Monitor user registration dates and activity status

## Technical Implementation

### Frontend
- **React/TypeScript:** Modern component-based architecture
- **Responsive Design:** Mobile-friendly interface with Tailwind CSS
- **State Management:** React hooks for local state management
- **API Integration:** RESTful API calls with error handling

### Backend
- **FastAPI:** High-performance Python web framework
- **PostgreSQL:** Robust database with enum types for roles
- **SQLAlchemy:** ORM for database operations
- **JWT Authentication:** Secure token-based authentication
- **Role-based Permissions:** Function-level access control

### Database Schema
```sql
-- Users table with role enum
CREATE TYPE userrole AS ENUM ('alpha', 'delta');

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    role userrole DEFAULT 'delta' NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);
```

## Troubleshooting

### Common Issues
1. **Access Denied:** Ensure you're logged in with admin credentials
2. **API Errors:** Check that the backend service is running
3. **Role Update Failures:** Verify user exists and you have admin privileges

### Development Setup
- Backend runs on `http://localhost:8000`
- Frontend runs on `http://localhost:8080` 
- Database accessible via Docker container
- API documentation at `http://localhost:8000/docs`
