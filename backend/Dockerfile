# =============================================================================
# Yalla Buy - Backend Dockerfile
# =============================================================================

FROM python:3.11-slim

# Set environment variables
# منع كتابة ملفات .pyc وعدم تخزين stdout/stderr
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set work directory
WORKDIR /app

# Install system dependencies
# تثبيت التبعيات النظامية
RUN apt-get update && apt-get install -y \
    postgresql-client \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
# تثبيت تبعيات Python
COPY requirements.txt /app/
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy project
# نسخ المشروع
COPY . /app/

# Create directories for static and media files
# إنشاء مجلدات للملفات الثابتة والوسائط
RUN mkdir -p /app/staticfiles /app/media

# Expose port
EXPOSE 8000

# Default command (overridden in docker-compose)
# الأمر الافتراضي (يتم تجاوزه في docker-compose)
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
