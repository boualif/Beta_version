from django.urls import path
from rest_framework import routers
from .api import CandidateViewSet
from .views import CandidateView

    

# router = routers.DefaultRouter()
# router.register('api/candidates', CandidateViewSet, 'candidates')

urlpatterns = [
    path("api/", CandidateView.post_candidate),
    path("api/get/", CandidateView.get_candidates, name='candidate-list'),
    path("api/get-candidate/<int:id>/", CandidateView.profile, name='get-candidate'),
    path("api/delete-candidate/<int:id>/", CandidateView.delete, name='delete-candidate'),
    path("api/new-cv/", CandidateView.post_cv,{'operation':'update'}, name='new-cv'),
    path("api/update-cv/<int:id>/", CandidateView.update_cv,{'operation':'update_cv'}, name='update-cv'),
    path("api/add-cv/<int:id>/<int:idRec>/", CandidateView.update_cv,{'operation':'add_cv'}, name='add-cv'),
    path("api/getcv/<int:id>/", CandidateView.get_cv, name='view-cv'),
    path("api/confirm-update/<int:id>/", CandidateView.delete_resume,{'operation':'confirm_update'}, name='download-image'),
    path("api/cancel-update/<int:id>/", CandidateView.delete_resume,{'operation':'cancel_update'}, name='download-image'),
    path('assign-candidate/<int:candidate_id>/', CandidateView.assign_candidate, name='assign-candidate'),

    #hr_management
    
    path("api/hrmanagement/<int:id>/", CandidateView.hrManagement,{'operation':'hr'},name='hr-management'),
    path("api/val-service/<int:id>/", CandidateView.hrManagement,{'operation':'valService'},name='val-service'),
    path("api/val-technic/<int:id>/", CandidateView.hrManagement,{'operation':'valTechnic'},name='val-technic'),
    path("api/val-direction/<int:id>/", CandidateView.hrManagement,{'operation':'valDirection'},name='val-direction'),
    
    path("api/download/", CandidateView.download_candidate_image, name='download-image'),
    path("api/cv/", CandidateView.post_cv,{'operation':'add'}, name='upload-cv'),
    path("api/set-password/", CandidateView.set_password, name='set_password'),
    path("authentication/verify_mail", CandidateView.verify_mail ),
    path('candidate-analysis/', CandidateView.candidate_analysis_view, name='candidate-analysis'),
    path('api/analyze-selected-candidates/', CandidateView.analyze_selected_candidates, name='analyze-candidates'),

    #path("auth/social/google/", GoogleLoginView.as_view(), name="google_login"),
    #path("dj-rest-auth/google/login/", GoogleLoginView.as_view(), name="google_login")
    
    #path('api/verify-session/', CandidateView.verify_session, name='verify-session'),

    # path("", views.add_candidate, name='add_candidate'),
   # path("modifier_commande/<str:pk>", views.modifier_commande, name='modifier_commande'),
    #path('supprimer_commande/<str:pk>',views.supprimer_commande, name='supprimer_commande'),

]
#urlpatterns = router.urls
