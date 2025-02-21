from django.urls import path
from .views import LeadView

urlpatterns = [
    path('lead/new/', LeadView.lead_create, name='lead_create'),
    path('lead/<int:pk>/edit/', LeadView.lead_update, name='lead_update'),
    path('lead/<int:pk>/delete/', LeadView.lead_delete, name='lead_delete'),
]
