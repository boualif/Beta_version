#!/bin/bash
set -e

echo "Starting backend build process..."

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
    echo "MONGODB_NAME=$MONGODB_NAME" >> .env
    echo "MONGODB_URI=$MONGODB_URI" >> .env
    echo "MONGODB_PORT=$MONGODB_PORT" >> .env
    echo "DEBUG=False" >> .env
    echo "ELASTICSEARCH_HOST=$ELASTICSEARCH_HOST" >> .env
    echo "ELASTICSEARCH_INDEX=$ELASTICSEARCH_INDEX" >> .env
fi

# Apply database migrations with timeout
echo "Applying database migrations..."
python manage.py migrate --noinput || {
    echo "ERROR: Database migration failed!"
    echo "Please check your database configuration and connection."
    exit 1
}

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Backend build process complete."