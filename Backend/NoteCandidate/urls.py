from django.urls import path
from . import views
from rest_framework import routers
from .views import NoteCandidateView

    

# router = routers.DefaultRouter()
# router.register('api/candidates', CandidateViewSet, 'candidates')

urlpatterns = [
    path("api/post-note/", NoteCandidateView.post_Note, name='post-Note'),
    path("api/update-note/<int:id>/", NoteCandidateView.update_Note, name='update-note'),
    path("api/delete-note/<int:id>/", NoteCandidateView.delete_Note, name='delete-note'),
 


    # path("", views.add_candidate, name='add_candidate'),
   # path("modifier_commande/<str:pk>", views.modifier_commande, name='modifier_commande'),
    #path('supprimer_commande/<str:pk>',views.supprimer_commande, name='supprimer_commande'),

]
#urlpatterns = router.urls
