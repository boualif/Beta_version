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

echo "Moving Frontend files to Django's static directory..."
mkdir -p Backend/staticfiles
cp -r ../Frontend/build/* Backend/staticfiles/.  # Copy Frontend build output to staticfiles

echo "Collecting static files..."
python3 manage.py collectstatic --noinput

echo "Applying database migrations..."
python3 manage.py migrate

echo "Build process complete."
