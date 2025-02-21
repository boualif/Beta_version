from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from django.contrib.auth import authenticate, login, logout
from django.utils import timezone
from .models import Recruiter
from django.contrib.auth.hashers import make_password
from rest_framework_simplejwt.tokens import RefreshToken
from django.http import JsonResponse
import base64
from django.core.mail import send_mail
from django.conf import settings
from pymongo import MongoClient
from .verification import create_html_template
from Candidate.models import Candidate
from Job.models import Job
from django.shortcuts import get_object_or_404  # Add this for get_object_or_404

class RecruiterView(APIView):
    def __init__(self):
        self.client = MongoClient(settings.MONGODB_URI)
        self.db = self.client[settings.MONGODB_NAME]
        self.resumes_collection = self.db.resumes
        self.resumes_file_collection = self.db.Resume_file
    
    

    @api_view(['POST'])
    @permission_classes([IsAdminUser])
    def post_Recruiter(request):
        try:
            with open("images/user.png", 'rb') as file:
                binary_data = file.read()

            # Extracting data from request
            first_name = request.data.get('first_name')
            last_name = request.data.get('last_name')
            email = request.data.get('email')
            address = request.data.get('address')
            phone = request.data.get('phone')
            position = request.data.get('position')
            responsible = request.data.get('responsible')
            password = request.data.get('password')

            # Check required fields
            if not all([first_name, last_name, email, password]):
                return Response(
                    {"error": "Required fields missing"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            try:
                html = create_html_template(password)
                email_subject = 'Activate your account'
                
                new_recruiter = Recruiter.objects.create_user(
                    email=email,
                    password=password,
                    first_name=first_name,
                    last_name=last_name,
                    address=address,
                    phone=phone,
                    position=position,
                    responsible=responsible,
                    image=binary_data
                )

                return JsonResponse({
                    "message": "Recruiter created successfully",
                    "id": new_recruiter.id
                }, status=status.HTTP_201_CREATED)

            except Exception as e:
                return Response(
                    {"error": str(e)}, 
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

        except Exception as e:
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @api_view(['GET'])
    @permission_classes([IsAdminUser])
    def get_Recruiters(request, operation):
        try:
            if operation == 'recruiters':
                recruiters = Recruiter.objects.exclude(id=request.user.id).order_by('id')
                output = []
                
                for recruiter in recruiters:
                    try:
                        # Handle date formatting with None checks
                        start_date = None
                        if recruiter.date_joined:
                            start_date = recruiter.date_joined.strftime("%d-%m-%Y %H:%M %Z") + recruiter.date_joined.strftime('%z')[:3]
                        
                        last_login = None
                        if recruiter.last_login:
                            last_login = recruiter.last_login.strftime("%d-%m-%Y %H:%M %Z") + recruiter.last_login.strftime('%z')[:3]
                        
                        # Handle image with None check
                        image_data = None
                        if recruiter.image:
                            image_data = base64.b64encode(recruiter.image).decode('utf-8')

                        recruiter_data = {
                            "id": recruiter.id,
                            "first_name": recruiter.first_name or "",
                            "last_name": recruiter.last_name or "",
                            "position": recruiter.position or "",
                            "nb_candidates": recruiter.nb_candidates or 0,
                            "responsible": recruiter.responsible or "",
                            "start_date": start_date,
                            "last_login": last_login,
                            "image": image_data
                        }
                        output.append(recruiter_data)
                    except Exception as e:
                        print(f"Error processing recruiter {recruiter.id}: {str(e)}")
                        continue
                        
            elif operation == 'list':
                recruiters = Recruiter.objects.all().order_by('id')
                output = [{
                    "id": recruiter.id,
                    "first_name": recruiter.first_name or "",
                    "last_name": recruiter.last_name or "",
                    "position": recruiter.position or "",
                } for recruiter in recruiters]

            return Response(output, status=status.HTTP_200_OK)
            
        except Exception as e:
            print(f"Error in get_Recruiters: {str(e)}")
            return Response(
                {"error": "Internal server error", "details": str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
    @api_view(['GET'])
    def get_recruiters(request):  # Changed from get_recruiter to get_recruiters
        try:
            recruiters = Recruiter.objects.all().values('id', 'first_name', 'last_name')
            # Ajoutons un print pour déboguer
            print("Recruiters found:", list(recruiters))
            return Response(recruiters, status=status.HTTP_200_OK)
        except Exception as e:
            print("Error fetching recruiters:", str(e))
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    
        


    
    @api_view(['GET', 'PATCH'])
    @permission_classes([IsAdminUser])
    def profile(request, id=None):
        try:
            if id is None:
                id = request.user.id
                
            recruiter = Recruiter.objects.get(pk=id)
            
            if request.method == 'GET':
                # Handle image with None check
                image_data = None
                if recruiter.image:
                    image_data = base64.b64encode(recruiter.image).decode('utf-8')
                    
                recruiter_data = {
                    'first_name': recruiter.first_name,
                    'last_name': recruiter.last_name,
                    'phone': recruiter.phone,
                    'email': recruiter.email,
                    'address': recruiter.address,
                    'position': recruiter.position,
                    'responsible': recruiter.responsible,
                    'image': image_data,
                    'id_Recruiter': recruiter.id
                }
                return JsonResponse(recruiter_data)

            elif request.method == 'PATCH':
                data = request.data
                try:
                    if 'first_name' in data:
                        recruiter.first_name = data['first_name']
                    if 'last_name' in data:
                        recruiter.last_name = data['last_name']
                    if 'password' in data:
                        recruiter.set_password(data['password'])
                    if 'email' in data:
                        email = data['email']
                        if recruiter.email != email:
                            html = create_html_template(data.get('password', ''))
                            email_subject = 'Activate your account'
                            send_mail(
                                email_subject,
                                ' ',
                                settings.EMAIL_HOST_USER,
                                [email],
                                html_message=html
                            )
                        recruiter.email = email
                    if 'phone' in data:
                        recruiter.phone = data['phone']
                    if 'address' in data:
                        recruiter.address = data['address']
                    if 'responsible' in data:
                        recruiter.responsible = data['responsible']
                    if 'position' in data:
                        recruiter.position = data['position']
                        
                    recruiter.save()
                    return Response({'message': 'Data updated successfully'})
                    
                except Exception as e:
                    return Response(
                        {"error": str(e)},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                    )

        except Recruiter.DoesNotExist:
            return Response(
                {'error': 'Recruiter not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @api_view(['PATCH'])
    def updateImg(request, id=None):
        try:
            if id is None:
                id = request.user.id
                
            recruiter = Recruiter.objects.get(pk=id)
            
            if 'image' in request.data:
                recruiter.image = base64.b64decode(request.data['image'])
                recruiter.save()
                
            return Response({'message': 'Image updated successfully'})
            
        except Recruiter.DoesNotExist:
            return Response(
                {'error': 'Recruiter not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @api_view(['GET'])
    def headerRecruiter(request):
        try:
            recruiter = request.user
            image_data = None
            if recruiter.image:
                image_data = base64.b64encode(recruiter.image).decode('utf-8')
                
            recruiter_data = {
                'first_name': recruiter.first_name,
                'last_name': recruiter.last_name,
                'phone': recruiter.phone,
                'email': recruiter.email,
                'address': recruiter.address,
                'position': recruiter.position,
                'responsible': recruiter.responsible,
                'image': image_data
            }
            return JsonResponse(recruiter_data)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @api_view(['DELETE'])
    @permission_classes([IsAdminUser])
    def delete(request, id):
        try:
            recruiter = Recruiter.objects.get(id=id)
            recruiter.delete()
            return Response({'message': 'Recruiter deleted successfully'})
            
        except Recruiter.DoesNotExist:
            return Response(
                {'error': 'Recruiter not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @api_view(['POST'])
    @permission_classes([AllowAny])
    def signin(request):
        try:
            email = request.data.get("email")
            password = request.data.get("password")

            if not all([email, password]):
                return Response(
                    {"error": "Email and password are required"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            recruiter = authenticate(request, email=email, password=password)
            if recruiter is not None:
                login(request, recruiter)
                recruiter.last_login = timezone.now()
                recruiter.save()
                
                refresh = RefreshToken.for_user(recruiter)
                return Response({
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                    'role': recruiter.is_superuser,
                    'username': f"{recruiter.first_name} {recruiter.last_name}"
                })
            else:
                return Response(
                    {"error": "Invalid email or password"},
                    status=status.HTTP_401_UNAUTHORIZED
                )
                
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @api_view(['GET'])
    def Logout(request):
        try:
            logout(request)
            response = JsonResponse({"message": "Logged out successfully"})
            response.delete_cookie('sessionid')
            response.delete_cookie('csrftoken')
            return response
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )