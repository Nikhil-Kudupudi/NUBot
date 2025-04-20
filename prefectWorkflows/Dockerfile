# Start from a lightweight Python image (use the appropriate Python version)
FROM python:3.10-slim

# Set working directory in container
WORKDIR /app

# Install Python dependencies.
# If you have a requirements.txt, copy and install it:
COPY requirements.txt . 
RUN pip install -r requirements.txt

# (Alternatively, directly install Prefect and any needed libraries)
# RUN pip install prefect==3.1.10

# Copy the Prefect flow code and the dataflow module into the image
COPY prefectWorkflows/ /app/prefectWorkflows/


# Ensure Python can find the 'dataflow' module (add /app to PYTHONPATH)
ENV PYTHONPATH="/app:${PYTHONPATH}"

# (Optional) Set a default command (Prefect Cloud will override this when submitting the flow run)
# By default, do nothing or use a generic command. Prefect Cloud's work pool will specify the entrypoint at runtime.
CMD ["python", "-c", "print('Container built for Prefect flow execution')"]
