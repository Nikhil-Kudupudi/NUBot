# Dockerfile
FROM python:3.10-slim
ENV PYTHONUNBUFFERED=1
WORKDIR /opt/prefect/project
COPY requirements.txt .
RUN pip install --upgrade pip \
 && pip install --no-cache-dir -r requirements.txt \
 && pip install --no-cache-dir prefect==3.*
COPY . .
CMD ["python", "-c", "print('ready')"]
