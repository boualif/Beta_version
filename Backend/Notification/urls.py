from django.urls import path
from . import views
from rest_framework import routers
from .views import NotificationView

    

# router = routers.DefaultRouter()
# router.register('api/s', ViewSet, 's')

urlpatterns = [
    path("api/get-notifications/", NotificationView.get_Notifications, name='get-Notifications'),
    path("api/delete-notif/<int:id>/", NotificationView.delete_Notification, name='delete-notif'),
    #path("api/get-notif/<int:id>/", NotificationView.get_notif, name='get-notif'),
    path("api/create-notification/", NotificationView.create_notification, name='create-notification'),
    path('api/notifications/<int:notification_id>/mark-read/', NotificationView.mark_notification_read, name='mark_notification_read'),



    # path("", views.add_, name='add_'),
   # path("modifier_commande/<str:pk>", views.modifier_commande, name='modifier_commande'),
    #path('supprimer_commande/<str:pk>',views.supprimer_commande, name='supprimer_commande'),

]
#urlpatterns = router.urls
