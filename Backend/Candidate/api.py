from .models import Candidate
from rest_framework import viewsets, permissions
from .serializer import CandidateSerializer


# Lead Viewset


class CandidateViewSet(viewsets.ModelViewSet):
    queryset = Candidate.objects.all()
    permission_classes = [
        permissions.AllowAny,
    ]
    serializer_class = CandidateSerializer
    print('hklhjhlk')
