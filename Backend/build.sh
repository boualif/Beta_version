#!/bin/bash
set -e

echo "Starting build process..."

# Install backend dependencies
echo "Installing backend dependencies..."
python3 -m pip install -r requirements.txt

# Build frontend
echo "Building frontend..."
cd ../Frontend  # Navigate to the frontend directory
npm install  # or yarn install
npm run build  # or yarn build

cd ../Backend  # Go back to the backend directory after Frontend has been built


python3 manage.py runserver

echo "Applying database migrations..."
python3 manage.py migrate

echo "Build process complete."
