import json
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, PlainTextResponse
from app.api import post, comment, user
from app.auth import routes as auth_routes

# Create FastAPI app
app = FastAPI(
    title="HITMEN Forum API",
    description="Forum API for the HITMEN EPI Prevention Mission",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_routes.router, prefix="/api/auth")
app.include_router(post.router, prefix="/api/posts")
app.include_router(comment.router, prefix="/api/comments")
app.include_router(user.router, prefix="/api/users")

MARKS_FILE = "/data/ig_marks.json"
BAN_LIST_FILE = "/data/ban_list.txt"

@app.get("/ig_marks.json")
def get_marks():
    if os.path.exists(MARKS_FILE):
        with open(MARKS_FILE) as f:
            data = json.load(f)
        return JSONResponse(content=data)
    return JSONResponse(content=[])

@app.get("/ban_list.txt")
def get_ban_list():
    if os.path.exists(BAN_LIST_FILE):
        with open(BAN_LIST_FILE) as f:
            data = f.read()
        return PlainTextResponse(content=data)
    return PlainTextResponse(content="")

@app.get("/")
def root():
    return {"message": "HITMEN Forum API", "status": "operational"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
