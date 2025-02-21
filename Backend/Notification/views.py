# from django.shortcuts import render, redirect
# from .forms import notificationicationsCandidateForm
# from .models import notificationicationsCandidate
from pymongo import MongoClient
from django.conf import settings
from django.contrib.auth.hashers import make_password
from rest_framework import status
from django.utils.dateparse import parse_date
from .models import Notification
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
from bson import ObjectId
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework.decorators import api_view, permission_classes

# Create your views here.


class NotificationView(APIView):    
    
    @api_view(['POST'])
    def create_notification(request):
        try:
            recruiter_id = request.data.get('recruiter_id')
            candidate_id = request.data.get('candidate_id')
            job_id = request.data.get('job_id')  # Ajoutez ceci
            content = request.data.get('content')
            
            notification = Notification.objects.create(
                recruiter_id=recruiter_id,
                candidate_id=candidate_id,
                job_id=job_id,  # Et ceci
                content=content,
                type='job_assignment',
                is_confirmed=False,
                date=timezone.now()
            )
            
            return Response({
                'message': 'Notification created',
                'notification_id': notification.id
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
    
    @api_view(['GET'])
    def get_Notifications(request):
        try:
            notifications = Notification.objects.filter(
                recruiter_id=request.user.id,
                is_read=False
            ).order_by('-date')
            
            notifications_data = []
            for notification in notifications:
                notification_data = {
                    'id_notification': notification.id,
                    'recruiter_name': f"{notification.recruiter.first_name} {notification.recruiter.last_name}",
                    'content': notification.content,
                    'date': notification.date.strftime("%d %b, %Y %H:%M"),
                    'type': notification.type,
                    'job_id': notification.job_id if notification.job else None,
                    'candidate_id': notification.candidate_id if notification.candidate else None,
                    'is_read': notification.is_read
                }
                notifications_data.append(notification_data)
            
            return Response(notifications_data)
                
        except Exception as e:
            print(f"Error getting notifications: {str(e)}")  # Debug log
            return Response({
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @api_view(['DELETE'])
    def delete_Notification(request, id):
        try:
            notif = Notification.objects.get(id=id)  # or `pk=id` for primary key lookup
        except Notification.DoesNotExist:
            return Response({'error': 'Note not found'}, status=status.HTTP_404_NOT_FOUND)

        notif.delete()
        return Response({'content': 'Item deleted successfully'}, status=status.HTTP_204_NO_CONTENT)
    


    
        



    @api_view(['POST'])
    def mark_notification_read(request, notification_id):
        try:
            notification = Notification.objects.get(
                id=notification_id,
                recruiter_id=request.user.id
            )
            notification.is_read = True
            notification.save()
            return Response({'status': 'success'})
        except Notification.DoesNotExist:
            return Response(
                {'error': 'Notification not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )    
