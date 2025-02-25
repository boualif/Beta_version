"""
Django settings for project project.

Generated by 'django-admin startproject' using Django 4.2.14.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/4.2/ref/settings/
"""

from dotenv import load_dotenv
import os
from pathlib import Path

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent
# Media settings
MEDIA_URL = '/media/'  # URL to access media files
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')  # Directory to store media files
# Load environment variables from .env file
load_dotenv()

# Your existing settings...

# Add OpenAI configuration
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
if not OPENAI_API_KEY:
    print("WARNING: OpenAI API key not found in environment variables")
elif not OPENAI_API_KEY.startswith('sk-'):
    print("WARNING: Invalid OpenAI API key format. Key should start with 'sk-'")

# OpenAI configuration
OPENAI_CONFIG = {
    'api_key': OPENAI_API_KEY,
    'model': 'gpt-3.5-turbo',  # default model
    'max_tokens': 2000,
    'temperature': 0.2,
}


from pathlib import Path
import environ
from datetime import timedelta

env = environ.Env()
environ.Env.read_env()
# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/4.2/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-f)l)p86gl$^1y&)wu#zj@hm5pddn*%+a4lgf4_zayuz#i4gls-'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = False

# Elasticsearch configurations
ELASTICSEARCH_HOST = 'http://localhost:9200'  # Update with your Elasticsearch host
ELASTICSEARCH_INDEX = 'candidates'

# Application definition
# Add this new configuration for django-elasticsearch-dsl
ELASTICSEARCH_DSL = {
    'default': {
        'hosts': ELASTICSEARCH_HOST
    },
}
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    #'Candidate',
    'Candidate.apps.CandidateConfig',
    'Client',
    'Recruiter',
    'django_elasticsearch_dsl',
    'Job',
    'Application',
    'Interview',
    'Lead',
    'matching',
    'Activity',
    'NoteCandidate',
    'Notification',
    'search',  # And this
    'Reminder',
    #'search.apps.SearchConfig',
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'django.contrib.sites',  # Required by allauth
    'rest_framework.authtoken',
    'dj_rest_auth',
    'dj_rest_auth.registration',
    'allauth', 
    'allauth.account',
    'allauth.socialaccount',
#'rest_framework_simplejwt'
    #'Candidate.apps.CandidateConfig',

    #'rest_framework_simplejwt.token_blacklist'
    # 'allauth.socialaccount.providers.google',
    # 'allauth.socialaccount.providers.facebook',
    # 'allauth.socialaccount.providers.linkedin_oauth2', 
    

]


# User model settings
AUTH_USER_MODEL = 'Recruiter.Matching'  # Your custom user model

SITE_ID = 1

SOCIAL_AUTH_JSONFIELD_ENABLED = True

SOCIALACCOUNT_PROVIDERS = {
    'google': {
        'SCOPE': ['profile', 'email'],
        'AUTH_PARAMS': {'access_type': 'online'},
        'OAUTH_PKCE_ENABLED': True,
    },
    'facebook': {
        'APP': {

        }
    }
}

ALLOWED_HOSTS = []

SESSION_COOKIE_AGE = 1209600  # 2 weeks
SESSION_SAVE_EVERY_REQUEST = True  # Refresh session on every request
SESSION_EXPIRE_AT_BROWSER_CLOSE = False  # Keep session active even after closing the browser
CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',
]

CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True
CORS_ORIGIN_WHITELIST = [
    'http://localhost',  # Allow requests from localhost
]
CSRF_TRUSTED_ORIGINS = ['http://localhost:3000']  # Add your frontend's URL

# CORS_ORIGIN_WHITELIST = [
#   "http://localhost:3000",
# ]
#CORS_ORIGIN_ALLOW_ALL = True

AUTH_USER_MODEL = 'Recruiter.Recruiter'
ACCOUNT_USER_MODEL_USERNAME_FIELD = None
ACCOUNT_USERNAME_REQUIRED = False
ACCOUNT_AUTHENTICATION_METHOD = 'email'
ACCOUNT_EMAIL_REQUIRED = True


# Additional locations of static files
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'static'),
]

# Simplified static file serving with Whitenoise
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  # Add this
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.locale.LocaleMiddleware',  # for translation
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'allauth.account.middleware.AccountMiddleware',
    #'django.middleware.csrf.CsrfResponseMiddleware',

]





REST_FRAMEWORK = {
    # Use Django's standard `django.contrib.auth` permissions,
    # or allow read-only access for unauthenticated users.
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
        'rest_framework.permissions.AllowAny',
        #'rest_framework.permissions.AllowAny'#DjangoModelPermissionsOrAnonReadOnly        
    ],
    'DEFAULT_AUTHENTICATION_CLASSES': (
        #'rest_framework_simplejwt.authentication.JWTAuthentication',
        #'rest_framework.authentication.TokenAuthentication',
        'rest_framework.authentication.SessionAuthentication',

    ),
    
}



SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=5),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'ROTATE_REFRESH_TOKENS': False,
    'BLACKLIST_AFTER_ROTATION': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': 'your-secret-key',
    'VERIFYING_KEY': None,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
    'AUTH_TOKEN_CLASSES': ('access',),
    'TOKEN_TYPE_CLAIM': 'token_type',
}

EMAIL_HOST='smtp.gmail.com'
EMAIL_PORT=25
EMAIL_HOST_USER=env('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD=env('EMAIL_HOST_PASSWORD')
EMAIL_USE_TLS=True 


import os

ROOT_URLCONF = 'project.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        "DIRS": [os.path.join(BASE_DIR, 'templates')],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'project.wsgi.application'


# Database
# https://docs.djangoproject.com/en/4.2/ref/settings/#databases
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': env("DB_NAME"),
        'USER': env("DB_USER"),
        'PASSWORD': env("DB_PASSWORD"),
        'HOST': env("DB_HOST"),
        'PORT': env("DB_PORT"),
    }
}

# print("SECRET_KEY:", env("SECRET_KEY"))
print("DB_NAME:", env("DB_NAME"))
print("DB_USER:", env("DB_USER"))
print("DB_PASSWORD:", env("DB_PASSWORD"))
print("DB_HOST:", env("DB_HOST"))
print("DB_PORT:", env("DB_PORT"))




from mongoengine import connect

MONGODB_NAME = 'Resume'  # Replace with your MongoDB database name
MONGODB_URI = 'localhost'
MONGO_PORT = 27017

connect(db=MONGODB_NAME, host=MONGODB_URI, port=MONGO_PORT)

# MONGODB_URI = "mongodb+srv://sa:sa@cluster0.vyi0itk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
# MONGODB_NAME = 'Resume'

FILE_UPLOAD_MAX_MEMORY_SIZE = 10485760  # 10 MB






# Password validation
# https://docs.djangoproject.com/en/4.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

from django.utils.translation import gettext_lazy as _

# Internationalization
# https://docs.djangoproject.com/en/4.2/topics/i18n/
# Add supported languages
LANGUAGES = [
    ('en', _('English')),
    ('fr', _('French')),
]
LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True
USE_L10N = True

USE_TZ = True
# Paths for translation files
LOCALE_PATHS = [
    BASE_DIR / 'locale/',
]


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/4.2/howto/static-files/

STATIC_URL = 'static/'

# Default primary key field type
# https://docs.djangoproject.com/en/4.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.ModelBackend',
    'allauth.account.auth_backends.AuthenticationBackend',
]


# settings.py

DEFAULT_FILE_STORAGE = 'storages.backends.ftp.FTPStorage'
FTP_STORAGE_LOCATION = 'ftp://samia:root@127.0.0.1:21/filezilla'


FTP_STORAGE_PATH = 'filezilla'  # Path on the FTP server where files should be stored
FTP_STORAGE_ACTIVE = False
FTP_STORAGE_SECURE = False

# print("ssssssssssssssssssssssssssssssss")
# import openai
# print(dir(openai))
CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]

CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
    'x-from-notification',  # Add this

]