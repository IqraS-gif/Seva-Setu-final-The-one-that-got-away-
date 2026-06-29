FROM python:3.11

# Allow statements and log messages to immediately appear in the Knative logs
ENV PYTHONUNBUFFERED True

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy local code to the container image.
COPY . .

# Run the web service on container startup.
# Using uvicorn with sh -c to expand the $PORT environment variable
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port $PORT"]
