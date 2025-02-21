from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.http import JsonResponse
from rest_framework import status
from .models import Interview
from Job.models import Job
from Application.models import Application
from datetime import datetime
import traceback

class InterviewView(APIView):
    @api_view(['POST'])
    def post_interview(request, idcand, idjob):
        try:
            data = request.data

            # Validate incoming data
            if 'notes' not in data or 'date' not in data or 'recruiter' not in data:
                return Response({'error': 'Missing required fields'}, status=status.HTTP_400_BAD_REQUEST)

            # Parse and save the interview
            interview = Interview()
            interview.notes = data['notes']
            interview.date = datetime.strptime(data['date'], '%Y/%m/%d')
            interview.candidate_id = idcand
            interview.job_id = idjob
            interview.interviewer_name = data['recruiter']
            interview.interview_type = 'recruiter'
            interview.save()

            return Response({'message': 'Interview added successfully'}, status=status.HTTP_200_OK)

        except Exception as e:
            error_details = traceback.format_exc()
            print(f"Error in post_interview: {error_details}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @api_view(['POST'])
    def post_partner_interview(request, idcand, idjob):
        try:
            data = request.data

            # Validate incoming data
            if 'notes' not in data or 'date' not in data or 'partner_name' not in data:
                return Response({'error': 'Missing required fields'}, status=status.HTTP_400_BAD_REQUEST)

            # Parse and save the interview
            interview = Interview()
            interview.notes = data['notes']
            interview.date = datetime.strptime(data['date'], '%Y/%m/%d')
            interview.candidate_id = idcand
            interview.job_id = idjob
            interview.interviewer_name = data['partner_name']
            interview.interview_type = 'partner'
            interview.save()

            # Update application state
            application = Application.objects.get(candidate_id=idcand, job_id=idjob)
            application.interview_partner = datetime.now()
            application.save()

            return Response({'message': 'Partner interview added successfully'}, status=status.HTTP_200_OK)

        except Exception as e:
            error_details = traceback.format_exc()
            print(f"Error in post_partner_interview: {error_details}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @api_view(['POST'])
    def post_client_interview(request, idcand, idjob):
        try:
            data = request.data

            # Validate incoming data
            if 'notes' not in data or 'date' not in data or 'client_name' not in data:
                return Response({'error': 'Missing required fields'}, status=status.HTTP_400_BAD_REQUEST)

            # Parse and save the interview
            interview = Interview()
            interview.notes = data['notes']
            interview.date = datetime.strptime(data['date'], '%Y/%m/%d')
            interview.candidate_id = idcand
            interview.job_id = idjob
            interview.interviewer_name = data['client_name']
            interview.interview_type = 'client'
            interview.save()

            # Update application state
            application = Application.objects.get(candidate_id=idcand, job_id=idjob)
            application.interview_client_final = datetime.now()
            application.save()

            return Response({'message': 'Client interview added successfully'}, status=status.HTTP_200_OK)

        except Exception as e:
            error_details = traceback.format_exc()
            print(f"Error in post_client_interview: {error_details}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @api_view(['GET'])
    def get_interviews(request, id):
        try:
            interviews = Interview.objects.filter(candidate_id=id)
            interviewList = [
                {
                    'idInterview': interview.id,
                    'dateInterview': interview.date,
                    'notesInterview': interview.notes,
                    'job': Job.objects.get(id=interview.job_id).title,
                    'idJob': interview.job_id,
                    'interviewer_name': interview.interviewer_name,
                    'interview_type': interview.interview_type
                }
                for interview in interviews
            ]
            return JsonResponse(interviewList, status=200, safe=False)

        except Exception as e:
            error_details = traceback.format_exc()
            print(f"Error in get_interviews: {error_details}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)