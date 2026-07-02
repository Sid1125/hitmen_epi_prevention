#!/usr/bin/env python3

import os
import sys
import time
import subprocess
import psycopg2
from psycopg2 import OperationalError

def wait_for_database():
    """Wait for the database to be ready."""
    print("Waiting for database to be ready...")
    
    # Database connection parameters from environment
    db_params = {
        'host': 'db',
        'port': 5432,
        'user': 'forum',
        'password': 'secret',
        'database': 'forumdb'
    }
    
    max_attempts = 30
    attempt = 0
    
    while attempt < max_attempts:
        try:
            conn = psycopg2.connect(**db_params)
            conn.close()
            print("Database is ready!")
            return True
        except OperationalError:
            print(f"Database is not ready yet. Waiting... (attempt {attempt + 1}/{max_attempts})")
            time.sleep(2)
            attempt += 1
    
    print("Failed to connect to database after maximum attempts")
    return False

def run_migrations():
    """Run Alembic migrations."""
    print("Running database migrations...")
    
    try:
        result = subprocess.run(
            ["alembic", "upgrade", "head"],
            check=True,
            capture_output=True,
            text=True
        )
        print("Migrations completed successfully!")
        print(result.stdout)
        return True
    except subprocess.CalledProcessError as e:
        print(f"Migration failed: {e}")
        print(f"Error output: {e.stderr}")
        return False

def seed_admin_user():
    """Seed the admin user."""
    print("Seeding admin user...")
    
    try:
        result = subprocess.run(
            ["python", "seed_admin.py"],
            check=True,
            capture_output=True,
            text=True
        )
        print(result.stdout)
        return True
    except subprocess.CalledProcessError as e:
        print(f"Admin seeding failed: {e}")
        print(f"Error output: {e.stderr}")
        return False

def start_api_server():
    """Start the FastAPI server."""
    print("Starting FastAPI server...")
    
    os.execv(
        sys.executable,
        [
            sys.executable, "-m", "uvicorn",
            "app.api.main:app",
            "--host", "0.0.0.0",
            "--port", "8000",
            "--reload"
        ]
    )

if __name__ == "__main__":
    print("========================================")
    print("🚀 HITMEN Forum API Starting...")
    print("========================================")
    
    # Wait for database
    if not wait_for_database():
        print("❌ Database connection failed!")
        sys.exit(1)
    
    # Run migrations
    if not run_migrations():
        print("❌ Database migrations failed!")
        sys.exit(1)
    
    # Seed admin user
    if not seed_admin_user():
        print("❌ Admin user seeding failed!")
        sys.exit(1)
    
    print("✅ All initialization complete!")
    print("========================================")
    
    # Start the API server
    start_api_server()
