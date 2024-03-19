# Use an official Python runtime based on Debian 10 "buster" as a parent image
FROM python:3.9-slim-buster

# Sets the working directory in the Docker image
WORKDIR /app



RUN pip3 install gunicorn==20.1.0 


# Copies the requirements file into the Docker image
COPY requirements.txt .

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copies the rest of your Flask app source code into the Docker image
COPY . .

# Makes port 5000 available for communication
EXPOSE 5000

# Runs your app when the Docker image is run as a container
# Start the Gunicorn server
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app"]