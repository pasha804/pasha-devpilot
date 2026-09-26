# syntax=docker/dockerfile:1
FROM python:3.11-slim

LABEL maintainer="Pasha Dev <devpilot@pasha.dev>"
LABEL description="Pasha DevPilot — AI Software Engineering Platform powered by IBM Bob"

# Prevent .pyc files and enable unbuffered logging
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

# Install OS-level deps needed for git and nodejs test operations inside sandbox
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    nodejs \
    npm \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies (layer-cached unless requirements change)
COPY apps/api/requirements.txt ./requirements.txt
RUN pip install --upgrade pip && pip install -r requirements.txt

# Copy application source
COPY apps ./apps
COPY packages ./packages

# Copy the built-in demo sandbox repository
COPY demo-repo ./demo-repo

# Create repos directory for cloned repositories
RUN mkdir -p repos

# Create a non-root user for security
RUN addgroup --system devpilot && adduser --system --ingroup devpilot devpilot
RUN chown -R devpilot:devpilot /app
USER devpilot

# Expose FastAPI port
EXPOSE 8000

# Start the API server (PORT env var dynamically assigned by Railway)
CMD ["sh", "-c", "python -m uvicorn apps.api.main:app --host 0.0.0.0 --port ${PORT:-8000}"]

