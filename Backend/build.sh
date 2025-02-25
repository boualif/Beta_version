#!/bin/bash
set -e

echo "Starting build process..."

# Set Python version (optional but recommended)
echo "Setting python version to 3.9"
pyenv install 3.9
pyenv local 3.9

# Install backend dependencies
echo "Installing backend dependencies..."
python -m pip install -r requirements.txt

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

echo "Build process complete."