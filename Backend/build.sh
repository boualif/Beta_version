#!/bin/bash
set -e

echo "Starting build process..."

# Install backend dependencies
echo "Installing backend dependencies..."
python3 -m pip install -r requirements.txt

# Build frontend
echo "Building frontend..."
cd ../Frontend  # Navigate to the frontend directory
npm install #or yarn install, depending on what you use
npm run build #or yarn build, depending on what you use

echo "Collecting static files..."
cd ../Backend # go back to the backend directory after Frontend has been built

echo "Copying static files individually..."
python3 manage.py collectstatic --noinput

echo "Applying database migrations..."
python3 manage.py migrate

echo "Build process complete."