#!/bin/bash
set -e

echo "Starting build process..."

# Install backend dependencies
echo "Installing backend dependencies..."
python -m pip install -r requirements.txt

# Create .env file if it doesn't exist (Render uses environment variables)
if [ ! -f .env ]; then
    echo "Creating .env file from environment variables..."
    # These environment variables should be set in Render dashboard
    echo "DB_NAME=$DB_NAME" >> .env
    echo "DB_USER=$DB_USER" >> .env
    echo "DB_PASSWORD=$DB_PASSWORD" >> .env
    echo "DB_HOST=$DB_HOST" >> .env
    echo "DB_PORT=$DB_PORT" >> .env
    echo "SECRET_KEY=$SECRET_KEY" >> .env
    echo "EMAIL_HOST_USER=$EMAIL_HOST_USER" >> .env
    echo "EMAIL_HOST_PASSWORD=$EMAIL_HOST_PASSWORD" >> .env
    echo "OPENAI_API_KEY=$OPENAI_API_KEY" >> .env
fi

# Check if we need to build the frontend
if [ -d "../Frontend" ]; then
    # Build frontend
    echo "Building frontend..."
    cd ../Frontend
    npm install
    npm run build
    
    # Copy frontend build to Django static directory
    echo "Copying frontend build to Django static..."
    mkdir -p ../Backend/static/frontend
    cp -r build/* ../Backend/static/frontend/
    
    cd ../Backend
else
    echo "Frontend directory not found, skipping frontend build"
fi

# Apply database migrations
echo "Applying database migrations..."
python manage.py migrate

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput

# Note: For production, you would use gunicorn or similar instead of runserver
# Render automatically runs the start command specified in the dashboard
# so we don't need to start the server here

echo "Build process complete."