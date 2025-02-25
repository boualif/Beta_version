#!/bin/bash
set -e  # Exit immediately if a command exits with a non-zero status.

echo "Starting build process..."

echo "Installing dependencies..."
python3 -m pip install -r requirements.txt

echo "Collecting static files..."
python3 manage.py collectstatic --noinput

echo "Applying database migrations..."
python3 manage.py migrate

echo "Build process complete."
