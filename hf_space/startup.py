#!/usr/bin/env python3
import os
import sys
import subprocess

def try_migrations():
    if not os.environ.get("DATABASE_URL"):
        print("No DATABASE_URL set, skipping migrations")
        return
    print("DATABASE_URL found, running migrations...")
    try:
        subprocess.run(
            ["alembic", "upgrade", "head"],
            check=True, capture_output=True, text=True
        )
        print("Migrations done")
    except Exception as e:
        print(f"Migrations skipped: {e}")

def start_api():
    os.execv(
        sys.executable,
        [
            sys.executable, "-m", "uvicorn",
            "app.api.main:app",
            "--host", "0.0.0.0",
            "--port", "8000"
        ]
    )

if __name__ == "__main__":
    try_migrations()
    start_api()
