from django.shortcuts import render, get_object_or_404, redirect
from .models import Lead
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from django.http import JsonResponse
from rest_framework import status

class LeadView(APIView):
    @api_view(['POST'])
    def lead_create(request):
        if request.method == 'POST':
            data = request.data
            client_id = data.get('client_id')
            lead = Lead(
                first_name=data.get('first_name'),
                last_name=data.get('last_name'),
                email=data.get('email'),
                phone=data.get('phone'),
                linkedIn=data.get('linkedIn'),
                notes=data.get('notes'),
                client_post=data.get('client_post'),
                client_id=client_id,
                recruiter_id=request.user.id
            )
            
            try:
                lead.save()  # Django va automatiquement définir added_at grâce à auto_now_add=True
                lead.refresh_from_db()  # Recharger pour avoir la date exacte
                
                response_data = {
                    "id": lead.id,
                    "first_name": lead.first_name,
                    "last_name": lead.last_name,
                    "email": lead.email,
                    "phone": lead.phone,
                    "linkedin": lead.linkedIn,
                    "notes": lead.notes,
                    "client_post": lead.client_post,
                    "added_at": lead.added_at.isoformat()  # Retourner la date exacte de création
                }
                print("Date de création réelle:", lead.added_at)  # Debug log
                return JsonResponse(response_data, status=201)
            except Exception as e:
                return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @api_view(['PATCH'])
    def lead_update(request, pk):
        lead = get_object_or_404(Lead, pk=pk)
        if request.method == 'PATCH':
            data = request.data
            print(data)
            
            lead.first_name = data.get('first_name')
            lead.last_name = data.get('last_name')
            lead.email = data.get('email')
            lead.phone = data.get('phone')
            lead.linkedIn = data.get('linkedIn')
            lead.notes = data.get('notes')
            lead.client_post = data.get('client_post')

            lead.last_modified_by_id = request.user.id
            try:
                lead.save()
                # Return the updated lead data
                response_data = {
                    'id': lead.id,
                    'first_name': lead.first_name,
                    'last_name': lead.last_name,
                    'email': lead.email,
                    'phone': lead.phone,
                    'linkedin': lead.linkedIn,
                    'notes': lead.notes,
                    'client_post': lead.client_post,  # Add this
                    'added_at': lead.added_at.isoformat() if lead.added_at else None  # ISO format for consistent parsing
                }
                return Response(response_data, status=status.HTTP_200_OK)
            except Exception as e:
                return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

        

    @api_view(['DELETE'])
    @permission_classes([IsAdminUser])
    def lead_delete(request, pk):
        try:
            lead = get_object_or_404(Lead, pk=pk)
        except Lead.DoesNotExist:
            return Response({'error': 'Lead not found'}, status=status.HTTP_404_NOT_FOUND)
        if request.method == 'DELETE':
            lead.delete()
        return Response({'content': 'Lead deleted successfully'}, status=status.HTTP_200_OK)