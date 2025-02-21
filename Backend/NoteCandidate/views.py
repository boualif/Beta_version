# from django.shortcuts import render, redirect
# from .forms import NoteCandidateForm
# from .models import NoteCandidate
from pymongo import MongoClient
from django.conf import settings
from django.contrib.auth.hashers import make_password
from rest_framework import status
from django.utils.dateparse import parse_date
from .models import NoteCandidate
from django.shortcuts import render
from rest_framework.views import APIView
from . models import *
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.conf import settings
import datetime
from django.http import JsonResponse
import datetime
from django.utils import timezone
# Create your views here.


class NoteCandidateView(APIView):    
    
    @api_view(['POST'])
    def post_Note(request):
        try:
            content = request.data.get('content')
            candidate_id = request.data.get('candidate')

            # Validate input
            if not content or not candidate_id:
                return JsonResponse({
                    'error': 'Missing required fields'
                }, status=400)

            # Get candidate
            try:
                candidate = Candidate.objects.get(id=candidate_id)
            except Candidate.DoesNotExist:
                return JsonResponse({
                    'error': 'Candidate not found'
                }, status=404)

            # Create note
            new_Note = NoteCandidate.objects.create(
                content=content,
                recruiter=request.user,
                candidate=candidate
            )

            # Format response
            response_data = {
                "id": new_Note.id,
                "content": new_Note.content,
                "added_at": new_Note.added_at.strftime("%d-%m-%Y %H:%M"),
                "recruiter": f"{request.user.first_name} {request.user.last_name}"
            }

            return JsonResponse(response_data, status=201)

        except Exception as e:
            print(f"Error creating note: {str(e)}")
            return JsonResponse({
                'error': f'Failed to create note: {str(e)}'
            }, status=500)

    @api_view(['PATCH'])
    def update_Note(request, id):
        return Response('test')
    
    @api_view(['DELETE'])
    def delete_Note(request, id):
        try:
            note = NoteCandidate.objects.get(id=id)  # or `pk=id` for primary key lookup
        except NoteCandidate.DoesNotExist:
            return Response({'error': 'Note not found'}, status=status.HTTP_404_NOT_FOUND)

        note.delete()
        return Response({'content': 'Item deleted successfully'}, status=status.HTTP_204_NO_CONTENT)

