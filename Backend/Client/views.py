from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view,permission_classes
from django.http import JsonResponse, HttpResponse
from rest_framework import status
from django.conf import settings
from pymongo import MongoClient
from .models import Client
from Lead.models import Lead
import json
import datetime
from bson import ObjectId
import base64
from rest_framework.permissions import IsAdminUser
from django.db.models import Q
from Activity.models import Activity

class ClientView(APIView):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # MongoDB setup
        self.client = MongoClient(settings.MONGODB_URI)
        self.db = self.client[settings.MONGODB_NAME]
        self.files_collection = self.db.files

    @api_view(['POST'])
    def create_client(request):
        """Create a new client."""
        data = request.data
        company = data.get('company')
        website = data.get('website')
        description = data.get('description')
        industry = data.get('industry')
        status = data.get('status')
        notes = data.get('notes')
        headquarters_phone_number = data.get('headquarters_phone_number')
        engagement_type = data.get('engagement_type')
        key_account_manager = request.user.id
        location = data.get('location')
       # urls = data.get('urls').split(',')
        logo = data.get('image')
        print(data)
        if(logo):
            image = base64.b64decode(logo)
        else:
            with open("images/client.png", 'rb') as file:
                image = file.read()

        new_client = Client(
            company=company,
            website=website,
            description=description,
            industry=industry,
            status=status,
            notes=notes,
            engagement_type=engagement_type,
            key_account_manager_id=key_account_manager,
            headquarters_phone_number=headquarters_phone_number,
            added_at=datetime.datetime.now(),
            image=image,
            address=location,
           # urls=urls
        )
        try:
            new_client.save()
            try:
                activity = Activity(
                    description=f"Added a new client: {new_client.company}",
                    client=new_client,
                    recruiter_id=request.user.id
                )
                activity.save()
                print("Activity log created")
            except Exception as e:
                print(f"Error creating activity log: {str(e)}") 
                
            response_data ={
                "id": new_client.id,
                "added_at": new_client.added_at
            }
        
        except Exception as e:
            return Response({'error': str(e)}, status=500)
        
        # activity = Activity(description=f" added a client", client=new_client)
        # activity.save() 
        return JsonResponse(response_data, status=201)


    

    @api_view(['GET'])
    def list_clients(request):
        print(request.COOKIES)
        """List all clients."""
        if(request.user.is_superuser):
            clients = Client.objects.all()
        else:
            clients = Client.objects.filter(key_account_manager_id=request.user.id)
        client_list = [{
            'id': client.id,
            'company': client.company,
            'website': client.website,
            'description': client.description,
            'industry': client.industry,
            'status': client.status,
            'notes': client.notes,
            'headquarters_phone_number': client.headquarters_phone_number,
            'engagement_type' : client.engagement_type,
            'key_account_manager' : client.key_account_manager.first_name+' '+client.key_account_manager.last_name,
            'added_at': client.added_at,
            'image': base64.b64encode(client.image).decode('utf-8'),
        } for client in clients]
        return JsonResponse(client_list, safe=False)

    @api_view(['PATCH'])
    def update_client(request, id):
        """Update an existing client."""
        client = get_object_or_404(Client, pk=id)
        data = request.data
        print(data)
        
        client.company = data.get('company', client.company)
        client.website = data.get('website', client.website)
        client.description = data.get('description', client.description)
        client.industry = data.get('industry', client.industry)
        client.status = data.get('status', client.status)
        client.address = data.get('location', client.address)
       # client.engagement_type = request.data.get('engagement_type', client.engagement_type)
        client.headquarters_phone_number = data.get('headquarters_phone_number', client.headquarters_phone_number)
        
        # Handle URLs correctly
         # Handle URLs correctly
        #urls = data.get('urls')
        #if urls is not None:
            #if isinstance(urls, str):
                # Split the string into a list of URLs
                #client.urls = [url.strip() for url in urls.split(',') if url.strip()]
            #elif isinstance(urls, list):
                # Directly assign the list of URLs
               # client.urls = urls
           # else:
                # If URLs is not a string or list, keep the existing URLs
               # client.urls = client.urls
        
        
        client.last_modified_by_id = request.user.id
        
        try:
            client.save()
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response({"message": "Client updated successfully"}, status=status.HTTP_200_OK)

    @api_view(['DELETE'])
    @permission_classes([IsAdminUser])
    def delete_client(request, id):
        """Delete a client by ID."""
        client = get_object_or_404(Client, pk=id)
        client.delete()
        return JsonResponse({"message": "Client deleted successfully"})

    @api_view(['POST'])
    def upload_client_file(self, request):
        """Upload a file related to a client."""
        file = request.FILES.get('file')
        client_id = request.data.get('client_id')

        if file and client_id:
            client = get_object_or_404(Client, id=client_id)
            file_id = self.files_collection.insert_one({
                'filename': file.name,
                'content': base64.b64encode(file.read()).decode('utf-8'),
            }).inserted_id
            return JsonResponse({'message': 'File uploaded successfully', 'file_id': str(file_id)})
        return JsonResponse({'message': 'Invalid request'}, status=400)

    @api_view(['GET'])
    def download_client_file(self, request, id):
        """Download a file related to a client."""
        file_data = self.files_collection.find_one({'_id': ObjectId(id)})

        if file_data:
            response = HttpResponse(base64.b64decode(file_data['content']), content_type='application/octet-stream')
            response['Content-Disposition'] = f'attachment; filename="{file_data["filename"]}"'
            return response

        return JsonResponse({'message': 'File not found'}, status=404)
    
    @api_view(['GET' , 'PATCH'])
    def get_client(request, id):
        try:
            client = Client.objects.get(pk=id)
        except Client.DoesNotExist:
            return Response({'error': 'client not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        if request.method == 'GET':
            leads = Lead.objects.filter(client_id=id).order_by('id')
            output = [{
                    "id": lead.id,
                    "first_name": lead.first_name,
                    "last_name": lead.last_name,
                    "email": lead.email,
                    "phone": lead.phone,
                    "linkedin": lead.linkedIn,
                    "notes": lead.notes, # Include notes in response
                    "client_post": lead.client_post  # Très important d'inclure ceci



                } for lead in leads]
            client_data = {
                            'id_Client': id,
                            'company': client.company,
                            'location': client.address,
                            'industry': client.industry,
                            'description': client.description,
                            'key_account_manager': client.key_account_manager.first_name+" "+client.key_account_manager.last_name,
                            'headquarters_phone_number': client.headquarters_phone_number,
                            'website': client.website,
                            #'urls': client.urls,
                            'added_at': (
                            lambda added_at: (
                                added_at.strftime("%d-%m-%Y %H:%M %Z") + added_at.strftime('%z')[:3]
                                if added_at is not None else None
                            )
                            )(client.added_at),
                            'image': base64.b64encode(client.image).decode('utf-8'),
                            'status': client.status,
                            'engagement_type': client.engagement_type,
                            'leads': output,
                        }
            print(client_data)
            return JsonResponse(client_data, safe=False)
        elif request.method == 'PATCH':
            data = request.data
            print('data:', data)
            # Update candidate fields only if they are present in the request data
            # if 'first_name' in data:
            #     recruiter.first_name = data['first_name']
            # if 'last_name' in data:
            #     recruiter.last_name = data['last_name']
            # if 'email' in data:
            #     recruiter.username = data['email']
            # if 'phone' in data:
            #     recruiter.phone = data['phone']
            # if 'address' in data:
            #     recruiter.address = data['address']
            # if 'responsible' in data:
            #     recruiter.responsible = data['responsible']
            # if 'position' in data:
            #     recruiter.position = data['position']
            if 'image' in data:
                client.image = base64.b64decode(data['image'])
            
            client.save()

            
            return Response({'message': 'Data updated successfully'}, status=status.HTTP_200_OK)

    @api_view(['GET'])
    def search_clients(request):
        search_term = request.GET.get("search", "").strip()

        if not search_term:
            return JsonResponse([], safe=False)

        # Search for matching clients (case-insensitive)
        user = request.user
        if(user.is_staff):
            clients = Client.objects.filter(
                Q(company__icontains=search_term)
            ).values("id", "company")
        else:
            clients = clients = Client.objects.filter(key_account_manager_id=request.user.id).filter(
                Q(company__icontains=search_term)
            ).values("id", "company")
        return JsonResponse(list(clients), safe=False)