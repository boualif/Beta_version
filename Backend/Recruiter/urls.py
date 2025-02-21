from django.urls import path
from . import views
from rest_framework import routers
from .views import RecruiterView

    

# router = routers.DefaultRouter()
# router.register('api/candidates', CandidateViewSet, 'candidates')

urlpatterns = [
    path("api/post-recruiter/", RecruiterView.post_Recruiter),
    path("api/get-recruiters/",RecruiterView.get_Recruiters,{'operation':'recruiters'}),
    path("api/get-recruiters-list/", RecruiterView.get_Recruiters,{'operation':'list'}),
    path("api/get-profile/", RecruiterView.profile, name='get-profile'),
    path("api/get-recruiter/<int:id>/", RecruiterView.profile, name='get-recruiter'),
    path("api/get-Header/", RecruiterView.headerRecruiter, name='get-recruiter'),
    path("api/update-img/", RecruiterView.updateImg, name='update-img'),
    path("api/update-img/<int:id>/", RecruiterView.updateImg, name='update-img2'),
    path("api/delete-recruiter/<int:id>/", RecruiterView.delete, name='delete-recruiter'),
    path("api/signin/", RecruiterView.signin),
    path("api/logout/", RecruiterView.Logout),
    path("api/recruiters/", RecruiterView.get_recruiters, name="get_recruiters"),  # Changed to get_recruiters
    
 


    # path("", views.add_candidate, name='add_candidate'),
   # path("modifier_commande/<str:pk>", views.modifier_commande, name='modifier_commande'),
    #path('supprimer_commande/<str:pk>',views.supprimer_commande, name='supprimer_commande'),

]
#urlpatterns = router.urls
