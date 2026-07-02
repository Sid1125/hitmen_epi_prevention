FROM python:3.11

WORKDIR /code

# Install PostgreSQL client for pg_isready
RUN apt-get update && apt-get install -y postgresql-client dos2unix && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["python", "startup.py"]
