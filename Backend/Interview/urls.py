from django.urls import path
from .views import InterviewView

urlpatterns = [
    
    path('interview/post/<int:idcand>/<int:idjob>/', InterviewView.post_interview, name='post_interview'),
    path('interview/list/get/<int:id>/', InterviewView.get_interviews, name='get_interviews'),
    path('interview/partner/<int:idcand>/<int:idjob>/', InterviewView.post_partner_interview, name='post_partner_interview'),
    path('interview/client/<int:idcand>/<int:idjob>/', InterviewView.post_client_interview, name='post_client_interview'),

]