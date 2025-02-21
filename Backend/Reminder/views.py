from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import IsAuthenticated , AllowAny
from django.utils import timezone
from .models import ReminderList, Reminder, ReminderTag ,Phrase
from .serializers import ReminderListSerializer, ReminderSerializer, ReminderTagSerializer , PhraseSerializer ,Phrase, Note
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.csrf import csrf_exempt
from rest_framework.authentication import SessionAuthentication
from datetime import timedelta

class ReminderListView(APIView):

    @api_view(['GET', 'POST'])
    @permission_classes([IsAuthenticated])
    def list_phrases(request, list_id):
        try:
            reminder_list = ReminderList.objects.get(id=list_id, owner=request.user)
        except ReminderList.DoesNotExist:
            return Response({'error': 'Reminder list not found'}, status=status.HTTP_404_NOT_FOUND)

        if request.method == 'GET':
            phrases = reminder_list.phrases.all()
            serializer = PhraseSerializer(phrases, many=True)
            return Response(serializer.data)

        elif request.method == 'POST':
            # Delete all existing phrases before adding new ones
            Phrase.objects.filter(list=reminder_list).delete()

            # Adapt the code to handle both text and checked values.
            phrases_data = request.data.get('phrases', [])
            new_phrases = []

            for phrase_data in phrases_data:
                new_phrase = Phrase(list=reminder_list, text=phrase_data['text'], checked=phrase_data.get('checked', False))
                new_phrases.append(new_phrase)
                Phrase.objects.bulk_create(new_phrases)
                serializer = PhraseSerializer(data=request.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

    @api_view(['GET', 'POST'])
    @permission_classes([IsAuthenticated])
    def list_notes(request, list_id):
        try:
            reminder_list = ReminderList.objects.get(id=list_id, owner=request.user)
        except ReminderList.DoesNotExist:
            return Response({'error': 'Reminder list not found'}, status=status.HTTP_404_NOT_FOUND)

        if request.method == 'GET':
            notes = reminder_list.notes.all()
            return Response([{'text': note.text, 'checked': note.checked} for note in notes])

        elif request.method == 'POST':
            try:
                print("Received data:", request.data)  # Debug print
                notes_data = request.data.get('notes', [])
                if not isinstance(notes_data, list):
                    return Response({'error': 'notes must be a list'}, status=status.HTTP_400_BAD_REQUEST)

                # Delete existing notes
                Note.objects.filter(list=reminder_list).delete()
                
                # Create new notes
                new_notes = []
                for note_data in notes_data:
                    if not isinstance(note_data, dict):
                        return Response({'error': 'Each note must be an object'}, status=status.HTTP_400_BAD_REQUEST)
                    
                    if 'text' not in note_data:
                        return Response({'error': 'Each note must have text'}, status=status.HTTP_400_BAD_REQUEST)
                    
                    new_notes.append(Note(
                        list=reminder_list,
                        text=note_data['text'],
                        checked=note_data.get('checked', False)
                    ))
                
                # Bulk create notes
                Note.objects.bulk_create(new_notes)
                
                return Response({'message': 'Notes updated successfully'}, status=status.HTTP_200_OK)
            except Exception as e:
                print("Error:", str(e))  # Debug print
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
            
    @api_view(['GET'])
    def get_lists(request):
        try:
            reminder_lists = ReminderList.objects.filter(owner=request.user)
            serializer = ReminderListSerializer(reminder_lists, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @api_view(['POST'])
    @authentication_classes([SessionAuthentication])
    @permission_classes([IsAuthenticated])
    def create_list(request):
        try:
            # Add is_smart_list if not provided
            data = request.data.copy()
            if 'is_smart_list' not in data:
                data['is_smart_list'] = False
                
            serializer = ReminderListSerializer(
                data=data,
                context={'request': request}
            )
            
            if serializer.is_valid():
                reminder_list = serializer.save(owner=request.user)
                return Response(
                    serializer.data,
                    status=status.HTTP_201_CREATED
                )
                
            print("Validation errors:", serializer.errors)
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )
            
        except Exception as e:
            import traceback
            print("Error creating list:", str(e))
            print("Traceback:", traceback.format_exc())
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @api_view(['PATCH'])
    def update_list(request, id):
        try:
            reminder_list = ReminderList.objects.get(id=id, owner=request.user)
            serializer = ReminderListSerializer(reminder_list, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except ReminderList.DoesNotExist:
            return Response(
                {'error': 'Reminder list not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @api_view(['DELETE'])
    def delete_list(request, id):
        try:
            reminder_list = ReminderList.objects.get(id=id, owner=request.user)
            reminder_list.delete()
            return Response({'message': 'Reminder list deleted successfully'})
        except ReminderList.DoesNotExist:
            return Response(
                {'error': 'Reminder list not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    @api_view(['GET'])
    @permission_classes([IsAuthenticated])
    def get_reminder_counts(request):
            today = timezone.now().date()
            
            counts = {
                'today': Reminder.objects.filter(
                    user=request.user,
                    due_date__date=today,
                    is_completed=False
                ).count(),
                
                'scheduled': Reminder.objects.filter(
                    user=request.user,
                    due_date__isnull=False,
                    is_completed=False
                ).count(),
                
                'flagged': Reminder.objects.filter(
                    user=request.user,
                    priority='high',
                    is_completed=False
                ).count(),
                
                'completed': Reminder.objects.filter(
                    user=request.user,
                    is_completed=True
                ).count()
            }
            
            return Response(counts)

    @api_view(['GET', 'POST'])
    @permission_classes([IsAuthenticated])
    def reminder_lists(request):
            if request.method == 'GET':
                lists = ReminderList.objects.filter(user=request.user)
                data = [{
                    'id': lst.id,
                    'title': lst.title,
                    'color': lst.color,
                    'icon': lst.icon,
                    'reminder_count': lst.reminders.filter(is_completed=False).count()
                } for lst in lists]
                return Response(data)
                
            elif request.method == 'POST':
                data = {
                    'user': request.user.id,
                    'title': request.data.get('title'),
                    'color': request.data.get('color', "#007AFF"),
                    'icon': request.data.get('icon', "list")
                }
                new_list = ReminderList.objects.create(**data)
                return Response({
                    'id': new_list.id,
                    'title': new_list.title,
                    'color': new_list.color,
                    'icon': new_list.icon,
                    'reminder_count': 0
                })

class ReminderView(APIView):
    

    @api_view(['GET'])
    @permission_classes([IsAuthenticated])
    def get_reminder_counts(request):
        try:
            today = timezone.now()
            today_start = today.replace(hour=0, minute=0, second=0, microsecond=0)
            today_end = today_start + timedelta(days=1)
            
            # Get all reminders for the user
            user_reminders = Reminder.objects.filter(list__owner=request.user)
            
            counts = {
                'today': user_reminders.filter(
                    due_date__range=(today_start, today_end)
                ).count(),
                'scheduled': user_reminders.filter(
                    due_date__gt=today
                ).count(),
                'flagged': user_reminders.filter(
                    is_flagged=True
                ).count(),
                'completed': user_reminders.filter(
                    is_completed=True
                ).count()
            }
            
            return Response(counts, status=status.HTTP_200_OK)
        except Exception as e:
            print(f"Error in get_reminder_counts: {str(e)}")
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @api_view(['POST'])
    @permission_classes([IsAuthenticated])
    def update_flag(request):
        try:
            print("Request data:", request.data)  # Debug print
            reminder_id = request.data.get('reminder_id')
            is_flagged = request.data.get('is_flagged')
            
            print(f"Reminder ID: {reminder_id}, is_flagged: {is_flagged}")  # Debug print
            
            if reminder_id is None:
                return Response(
                    {"error": "reminder_id is required"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            reminder = Reminder.objects.get(
                id=reminder_id,
                list__owner=request.user
            )
            
            reminder.is_flagged = bool(is_flagged)
            reminder.save()
            
            serializer = ReminderSerializer(reminder)
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except Reminder.DoesNotExist:
            return Response(
                {"error": f"Reminder with id {reminder_id} not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            print(f"Error in update_flag: {str(e)}")  # Debug print
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @api_view(['POST'])
    @permission_classes([IsAuthenticated])
    def toggle_complete(request, id):
        try:
            reminder = Reminder.objects.get(id=id, list__owner=request.user)
            reminder.is_completed = not reminder.is_completed
            reminder.save()
            
            serializer = ReminderSerializer(reminder)
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except Reminder.DoesNotExist:
            return Response(
                {'error': 'Reminder not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    @api_view(['GET'])
    def get_reminders(request, list_id=None):
        try:
            if list_id:
                # Ensure the list belongs to the user
                reminders = Reminder.objects.filter(list__owner=request.user, list_id=list_id)
            else:
                reminders = Reminder.objects.filter(list__owner=request.user)
            serializer = ReminderSerializer(reminders, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @api_view(['GET'])
    def get_today_reminders(request):
        try:
            today = timezone.now().date()
            reminders = Reminder.objects.filter(
                list__owner=request.user,
                due_date__date=today,
                is_completed=False
            )
            serializer = ReminderSerializer(reminders, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @api_view(['GET'])
    def get_scheduled_reminders(request):
        try:
            now = timezone.now()
            reminders = Reminder.objects.filter(
                list__owner=request.user,
                due_date__gt=now,
                is_completed=False
            ).order_by('due_date')
            serializer = ReminderSerializer(reminders, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @api_view(['POST'])
    @permission_classes([IsAuthenticated])
    def create_reminder(request):
        try:
            default_list = ReminderList.objects.filter(owner=request.user).first()
            if not default_list:
                default_list = ReminderList.objects.create(
                    owner=request.user,
                    title="Default List",
                    color="#007AFF",
                    icon="list",
                    is_smart_list=False
                )

            reminder_data = {
                'list': default_list.id,
                'title': request.data.get('title'),
                'notes': request.data.get('notes'),
                'due_date': request.data.get('due_date'),
                'priority': request.data.get('priority', 'medium'),
                'is_completed': request.data.get('is_completed', False),
                'is_flagged': request.data.get('is_flagged', False)
            }
            
            serializer = ReminderSerializer(data=reminder_data)
            if serializer.is_valid():
                reminder = serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
                
            print("Serializer errors:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            print("Error:", str(e))
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @api_view(['PATCH'])
    def update_reminder(request, id):
        try:
            reminder = Reminder.objects.get(
                id=id,
                list__owner=request.user
            )
            serializer = ReminderSerializer(reminder, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Reminder.DoesNotExist:
            return Response(
                {'error': 'Reminder not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @api_view(['DELETE'])
    def delete_reminder(request, id):
        try:
            reminder = Reminder.objects.get(
                id=id,
                list__owner=request.user
            )
            reminder.delete()
            return Response({'message': 'Reminder deleted successfully'})
        except Reminder.DoesNotExist:
            return Response(
                {'error': 'Reminder not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @api_view(['POST'])
    def toggle_complete(request, id):
        try:
            reminder = Reminder.objects.get(
                id=id,
                list__owner=request.user
            )
            reminder.is_completed = not reminder.is_completed
            reminder.save()
            serializer = ReminderSerializer(reminder)
            return Response(serializer.data)
        except Reminder.DoesNotExist:
            return Response(
                {'error': 'Reminder not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @api_view(['POST'])
    @permission_classes([IsAuthenticated])
    def update_flag(request):
      try:
          reminder_id = request.data.get('reminder_id')
          is_flagged = request.data.get('is_flagged')

          if reminder_id is None or is_flagged is None:
              return Response(
                  {"error": "reminder_id and is_flagged are required"},
                  status=status.HTTP_400_BAD_REQUEST
              )

          reminder = Reminder.objects.get(
              id=reminder_id,
              list__owner=request.user # here we are quering the right reminder list for the right user
          )

          reminder.is_flagged = bool(is_flagged)
          reminder.save()

          serializer = ReminderSerializer(reminder)
          return Response(serializer.data, status=status.HTTP_200_OK)

      except Reminder.DoesNotExist:
          return Response(
              {"error": f"Reminder with id {reminder_id} not found"},
              status=status.HTTP_404_NOT_FOUND
          )
      except Exception as e:
          print(f"Error in update_flag: {str(e)}")
          import traceback
          print(traceback.format_exc())  # VERY IMPORTANT FOR SERVER-SIDE DEBUGGING
          return Response(
              {"error": str(e)},
              status=status.HTTP_500_INTERNAL_SERVER_ERROR
          )