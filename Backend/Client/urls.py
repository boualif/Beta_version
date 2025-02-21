from django.urls import path
from .views import ClientView

urlpatterns = [
    path('client/create/', ClientView.create_client, name='create_client'),
    path('list/', ClientView.list_clients, name='list_clients'),
    path('<int:id>/get-client/', ClientView.get_client, name='get_client'),
    path('<int:id>/client/update/', ClientView.update_client, name='update_client'),
    path('<int:id>/client/delete/', ClientView.delete_client, name='delete_client'),
    path('upload/', ClientView.upload_client_file, name='upload_client_file'),
    path('download/<str:id>/', ClientView.download_client_file, name='download_client_file'),
    path('api/clients/', ClientView.search_clients, name='search_client'),
]
