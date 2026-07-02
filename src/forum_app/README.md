# HITMEN Forum Backend API

A complete forum backend API built with FastAPI, SQLAlchemy, and PostgreSQL for the HITMEN EPI Prevention Mission.

## Features

### 🔐 Authentication
- User registration and login
- JWT token-based authentication
- Secure password hashing with bcrypt

### 📝 Posts
- Create, read, update, delete posts
- Post search functionality
- Tag-based filtering
- View count tracking
- Pin and lock posts
- Pagination support

### 💬 Comments
- Nested comment system
- Create, edit, delete comments
- Soft delete for moderation
- Author information

### 👥 Users
- User profiles
- Post and comment ownership
- Account management

## Tech Stack

- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - SQL toolkit and ORM
- **PostgreSQL** - Database
- **Alembic** - Database migrations
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing
- **Docker** - Containerization

## Project Structure

```
src/forum_app/backend/
├── app/
│   ├── api/
│   │   ├── main.py          # FastAPI app and route registration
│   │   ├── post.py          # Post-related endpoints
│   │   └── comment.py       # Comment-related endpoints
│   ├── auth/
│   │   ├── auth_handler.py  # JWT token handling
│   │   └── routes.py        # Authentication endpoints
│   ├── db/
│   │   └── database.py      # Database configuration
│   ├── models/
│   │   ├── user.py          # User model
│   │   ├── post.py          # Post model
│   │   └── comment.py       # Comment model
│   ├── schemas/
│   │   ├── user.py          # User Pydantic schemas
│   │   ├── post.py          # Post Pydantic schemas
│   │   └── comment.py       # Comment Pydantic schemas
│   └── utils/
│       └── security.py      # Password hashing utilities
├── alembic/                 # Database migrations
├── docker-compose.yml       # Docker services
├── Dockerfile              # Container definition
└── requirements.txt         # Python dependencies
```

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user

### Posts
- `GET /posts` - List posts (with search, pagination, filtering)
- `POST /posts` - Create new post (authenticated)
- `GET /posts/{id}` - Get specific post
- `PUT /posts/{id}` - Update post (owner only)
- `DELETE /posts/{id}` - Delete post (owner only)

### Comments
- `GET /comments/post/{post_id}` - Get comments for a post
- `POST /comments` - Create comment (authenticated)
- `GET /comments/{id}` - Get specific comment
- `PUT /comments/{id}` - Update comment (owner only)
- `DELETE /comments/{id}` - Delete comment (owner only)

### Health
- `GET /` - API status
- `GET /health` - Health check

## Setup Instructions

### 1. Prerequisites
- Docker and Docker Compose
- Python 3.11+ (for local development)

### 2. Environment Variables
Create a `.env` file in the backend directory:

```env
DATABASE_URL=postgresql://forum:secret@db:5432/forumdb
SECRET_KEY=your-super-secret-jwt-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=10080
```

### 3. Run with Docker

```bash
# Navigate to backend directory
cd src/forum_app/backend

# Start services
docker-compose up -d

# Run database migrations
docker-compose exec api alembic upgrade head
```

### 4. Local Development

```bash
# Install dependencies
pip install -r requirements.txt

# Start PostgreSQL (using Docker)
docker-compose up -d db

# Run migrations
alembic upgrade head

# Start development server
uvicorn app.api.main:app --reload
```

## Database Migrations

```bash
# Create new migration
alembic revision --autogenerate -m "Description of changes"

# Apply migrations
alembic upgrade head

# View migration history
alembic history
```

## API Documentation

Once running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Authentication Flow

1. **Register**: `POST /auth/register` with username, email, password
2. **Login**: `POST /auth/login` with username, password
3. **Get Token**: Receive JWT access token
4. **Use Token**: Include in Authorization header: `Bearer <token>`

## Example Usage

### Register User
```bash
curl -X POST "http://localhost:8000/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "hitman1",
    "email": "hitman1@example.com",
    "password": "securepassword"
  }'
```

### Login
```bash
curl -X POST "http://localhost:8000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "hitman1",
    "password": "securepassword"
  }'
```

### Create Post
```bash
curl -X POST "http://localhost:8000/posts" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token>" \
  -d '{
    "title": "New Mark Identified",
    "content": "Found another account spreading inappropriate content...",
    "tags": ["mark", "investigation"]
  }'
```

## Security Features

- **Password Hashing**: bcrypt with salt
- **JWT tokens**: Secure authentication
- **Input Validation**: Pydantic schemas
- **SQL Injection Protection**: SQLAlchemy ORM
- **CORS**: Configurable cross-origin requests
- **Authorization**: Route-level access control

## Production Considerations

1. **Environment Variables**: Set proper SECRET_KEY and DATABASE_URL
2. **CORS**: Configure allowed origins properly
3. **Database**: Use managed PostgreSQL service
4. **SSL**: Enable HTTPS
5. **Rate Limiting**: Add rate limiting middleware
6. **Logging**: Configure proper logging
7. **Monitoring**: Add health checks and metrics

## Contributing

1. Follow the existing code structure
2. Add proper type hints
3. Write tests for new features
4. Update documentation
5. Follow PEP 8 style guidelines

## Troubleshooting

### Common Issues

1. **Database Connection**: Ensure PostgreSQL is running
2. **Migrations**: Run `alembic upgrade head`
3. **Token Errors**: Check JWT secret key configuration
4. **CORS Issues**: Verify allowed origins

### Logs
```bash
# View API logs
docker-compose logs api

# View database logs
docker-compose logs db
```
