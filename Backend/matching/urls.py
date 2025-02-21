from django.urls import path
from .views import matching_view
from django.conf import settings
from django.http import FileResponse
from . import views
import os
from django.http import FileResponse, HttpResponse
from django.conf.urls.static import static


def serve_cv(request, filename):
    """
    Fonction pour servir les fichiers CV de manière sécurisée
    """
    file_path = os.path.join(settings.MEDIA_ROOT, 'cv', filename)
    if os.path.exists(file_path):
        response = FileResponse(open(file_path, 'rb'))
        # Déterminer le type MIME en fonction de l'extension du fichier
        if filename.endswith('.pdf'):
            response['Content-Type'] = 'application/pdf'
        elif filename.endswith('.docx'):
            response['Content-Type'] = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        else:
            response['Content-Type'] = 'application/octet-stream'
            
        response['Content-Disposition'] = f'inline; filename="{filename}"'
        return response
    return HttpResponse('Fichier non trouvé', status=404)

urlpatterns = [
    # Autres URL déjà existantes
    path('matching/', matching_view, name='matching'),
    path('api/matching/', matching_view, name='matching_view'),
      # Route pour accéder aux fichiers CV
    path('cv/<str:filename>', serve_cv, name='serve_cv'),
  
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)