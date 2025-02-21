"""
URL configuration for project project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
# from django.contrib import admin
# from django.urls import path, include

# urlpatterns = [
#     path('admin/', admin.site.urls),
#     path('api-auth/', include('rest_framework.urls'))
# ]
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
#app_name = 'search'

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api-auth/', include('rest_framework.urls')),
    path('', include('Candidate.urls')),
    path('', include('Recruiter.urls')),
    path('', include('Application.urls')),
    path('', include('Client.urls')),
    path('', include('Job.urls')),
    path('', include('Lead.urls')),
    path('', include('NoteCandidate.urls')),
    path('', include('Notification.urls')),
    path('', include('Activity.urls')),
    path('', include('Interview.urls')),
    path('api/', include('Reminder.urls')),  # Ajoutez cette ligne aux urlpatterns existants
    path('auth/', include('dj_rest_auth.urls')),
    path('auth/registration/', include('dj_rest_auth.registration.urls')),
    path('auth/social/', include('allauth.socialaccount.urls')),
    path('accounts/', include('allauth.urls')),
    path('api/', include('Candidate.urls')),
    path('api/', include('matching.urls')), 
    path('api/', include('Job.urls')),
    #path('search/', include('search.urls')),
    path('', include('search.urls')),  # ajoutez cette ligne
    
    
]+ static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)