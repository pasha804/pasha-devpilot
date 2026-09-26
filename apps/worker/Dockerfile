# syntax=docker/dockerfile:1
FROM python:3.11-slim

LABEL maintainer="Pasha Dev <devpilot@pasha.dev>"
LABEL description="Pasha DevPilot — Background Worker Daemon"

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

# Install git for repo operations
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY apps/api/requirements.txt ./requirements.txt
RUN pip install --upgrade pip && pip install -r requirements.txt

# Copy application source
COPY apps ./apps
COPY packages ./packages
COPY demo-repo ./demo-repo

RUN mkdir -p repos

# Run as non-root user
RUN addgroup --system devpilot && adduser --system --ingroup devpilot devpilot
RUN chown -R devpilot:devpilot /app
USER devpilot

CMD ["python", "-m", "apps.worker.worker"]
