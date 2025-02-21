from django.urls import path
from . import views
from rest_framework import routers
from .views import ApplicationView

    

# router = routers.DefaultRouter()
# router.register('api/candidates', CandidateViewSet, 'candidates')

urlpatterns = [
   
    path("api/job-application/<int:id>/", ApplicationView.job_application, name="job_application"),
    path('api/get-applications/<int:id>/', ApplicationView.get_applications, name='get-applications'),
    path("api/job-applications/<int:id>/", ApplicationView.get_job_applications, name="get_job_applications"),
    path("api/update-candidate-stage/", ApplicationView.update_candidate_stage, name="update_candidate_stage"),







    # path("", views.add_candidate, name='add_candidate'),
   # path("modifier_commande/<str:pk>", views.modifier_commande, name='modifier_commande'),
    #path('supprimer_commande/<str:pk>',views.supprimer_commande, name='supprimer_commande'),

]
#urlpatterns = router.urls
