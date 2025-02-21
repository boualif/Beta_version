from django.urls import path
from . import views

app_name = 'search'

urlpatterns = [
    path('api/search/', views.search_view, name='search_api'),
    path('search/results/', views.search_view, name='search_results'),
    
    path('api/rebuild-index/', views.rebuild_index_view, name='rebuild_index'),  # Add this new URL

    

]