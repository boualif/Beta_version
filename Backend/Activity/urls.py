from django.urls import path
from . import views
from rest_framework import routers
from .views import ActivityView

    

# router = routers.DefaultRouter()
# router.register('api/s', ViewSet, 's')

urlpatterns = [
    path("api/get-activities/<int:id>/", ActivityView.get_Activities, name='get-Activities'),
    path("api/get-activities/", ActivityView.get_Activities, name='my-Activities'),

    # path("", views.add_, name='add_'),
   # path("modifier_commande/<str:pk>", views.modifier_commande, name='modifier_commande'),
    #path('supprimer_commande/<str:pk>',views.supprimer_commande, name='supprimer_commande'),

]
#urlpatterns = router.urls
