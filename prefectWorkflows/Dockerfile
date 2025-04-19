# Use a lightweight Python base image
FROM python:3.10-slim

# Set working directory in container
WORKDIR /opt/prefect/project

# Copy requirements and install them (if you have a requirements.txt or pyproject.toml)
COPY requirements.txt ./ 
RUN pip install -U pip && pip install -r requirements.txt

# Install Prefect (if not already included in requirements)
RUN pip install prefect==2.*

# Copy the Prefect flow code and related modules into the image
COPY . .

# (Optional) If your flow code is a package with setup.py, you could RUN pip install . instead.

# Set the default command (entrypoint) for the container to do nothing by default.
# Prefect will override this when running the flow, so we keep it simple.
CMD ["python", "-c", "print('Prefect flow container ready')"]
