# Stage 1: Base slim image with Python and system deps
FROM python:3.10-slim AS base

# Avoid interactive prompts
ENV DEBIAN_FRONTEND=noninteractive

# Set workdir
WORKDIR /app

# System dependencies for FAISS and Python packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libgl1-mesa-glx \
    curl \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Copy only requirements to leverage Docker cache
COPY requirements.txt .

# Upgrade pip and install only required packages
RUN pip install --upgrade pip \
 && pip install --no-cache-dir -r requirements.txt

# Stage 2: Copy application code
COPY . .

CMD ["python", "scraper_flow.py"]