from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Application
from django.utils import timezone
from Candidate.models import Candidate
from django.db.models import F, Max, Q, Case, When, DateField, CharField,Value, Func
from django.http import JsonResponse
from datetime import datetime
from django.shortcuts import get_object_or_404
from pymongo import MongoClient
from django.conf import settings
from bson import ObjectId
from Notification.views import Notification
# Create your views here.
class ApplicationView(APIView):
    
    @api_view(['PATCH'])
    def update_candidate_stage(request, job_id):
        try:
            data = request.data
            updates = data.get('candidates', [])

            if not updates:
                return Response({'error': 'No candidates to update'}, status=400)

            updated_candidates = []

            for update in updates:
                candidate_id = update.get('id_candidate')
                new_stage = update.get('new_stage')

                if not candidate_id or not new_stage:
                    print(f"Invalid data for candidate: {update}")  # Debug log
                    continue

                try:
                    # Fetch or create the application
                    application, created = Application.objects.get_or_create(
                        job_id=job_id,
                        candidate_id=candidate_id
                    )

                    # Update the stage
                    setattr(application, new_stage, timezone.now())
                    application.save()
                    print(f"Application updated: {application}")  # Debug log

                    updated_candidates.append({
                        'candidate_id': application.candidate.id,
                        'stage': new_stage,
                        'date_updated': timezone.now().isoformat()
                    })

                except Exception as e:
                    print(f"Error processing candidate {candidate_id}: {e}")  # Debug log
                    continue

            if not updated_candidates:
                return Response({'error': 'No valid candidates were updated.'}, status=400)

            return Response({
                'status': 'success',
                'message': 'Applications updated successfully',
                'updates': updated_candidates
            }, status=200)
        except Exception as e:
            print(f"Error in PATCH update_candidate_stage: {e}")
            return Response({'error': str(e)}, status=500)

    @api_view(['GET', 'PATCH'])
    def job_application(request, id):
        """
        Handles GET and PATCH requests for job applications.
        - GET: Retrieves all candidates and their stages for the specified job ID.
        - PATCH: Updates the stages of candidates for the specified job ID.
        """
        if request.method == 'GET':
            try:
                applications = Application.objects.filter(job_id=id)
                if not applications.exists():
                    return Response({'status': 'error', 'message': 'No applications found.'}, status=404)

                output = []
                for app in applications:
                    candidate = app.candidate
                    last_stage = None
                    last_date = None

                    for stage in ['new', 'preselected', 'interviewed', 'tested', 'proposed', 'interview_partner', 'interview_client_final', 'hired', 'start', 'end']:
                        date = getattr(app, stage, None)
                        if date:
                            last_stage = stage
                            last_date = date

                    output.append({
                        'candidate_id': candidate.id,
                        'name': candidate.name,
                        'jobTitle': candidate.job_title,
                        'email': candidate.email,
                        'stage': last_stage,
                        'date_updated': last_date.isoformat() if last_date else None
                    })

                return Response({'status': 'success', 'applications': output}, status=200)
            except Exception as e:
                return Response({'status': 'error', 'message': str(e)}, status=500)

        elif request.method == 'PATCH':
            try:
                data = request.data
                updates = data.get('candidates', [])
                if not updates:
                    return Response({'error': 'No candidates to update'}, status=400)

                updated_candidates = []

                for update in updates:
                    candidate_id = update.get('id_candidate')
                    new_stage = update.get('new_stage')

                    if not candidate_id or not new_stage:
                        print(f"Invalid data for candidate: {update}")  # Log invalid data
                        continue

                    try:
                        # Ensure Application exists
                        application, created = Application.objects.get_or_create(
                            job_id=id,
                            candidate_id=candidate_id,
                            defaults={'new': timezone.now()}  # Default to "new" stage if missing
                        )

                        # Update the stage
                        setattr(application, new_stage, timezone.now())
                        application.save()
                        print(f"Application updated: {application}")  # Debug log

                        updated_candidates.append({
                            'candidate_id': application.candidate.id,
                            'stage': new_stage,
                            'date_updated': timezone.now().isoformat()
                        })

                    except Exception as e:
                        print(f"Error processing candidate {candidate_id}: {e}")  # Log exception
                        continue

                if not updated_candidates:
                    return Response({'error': 'No valid candidates were updated.'}, status=400)

                return Response({
                    'status': 'success',
                    'message': 'Applications updated successfully',
                    'updates': updated_candidates
                }, status=200)
            except Exception as e:
                print(f"Error in PATCH job_application: {str(e)}")
                return Response({'error': str(e)}, status=500)


    # Add a simple endpoint to check if a card save is possible
    @api_view(['GET'])
    def check_save_status(request, job_id):
        return Response({'canSave': True}, status=200)
        



    @api_view(['GET'])
    def get_applications(request, id):
        applications = Application.objects.filter(candidate_id=id).order_by('-id')
        if not applications.exists():
            return Response({'error': 'No applications found for this candidate.'}, status=404)
        output = [{
                        "id_application": app.id,
                        "New": (
                                    lambda new: (
                                        new.strftime("%d %b, %Y")
                                        if new is not None else None
                                    )
                                )(app.new),
                        "Preselected":  (
                                    lambda preselected: (
                                        preselected.strftime("%d %b, %Y")
                                        if preselected is not None else None
                                    )
                                )(app.preselected),
                        "Interviewed": (
                                    lambda interviewed: (
                                        interviewed.strftime("%d %b, %Y")
                                        if interviewed is not None else None
                                    )
                                )(app.interviewed),
                        "Tested": (
                                    lambda tested: (
                                        tested.strftime("%d %b, %Y")
                                        if tested is not None else None
                                    )
                                )(app.tested),
                        "Proposed": (
                                    lambda proposed: (
                                        proposed.strftime("%d %b, %Y")
                                        if proposed is not None else None
                                    )
                                )(app.proposed),
                        "Interview Partner": (
                                    lambda interview_partner: (
                                        interview_partner.strftime("%d %b, %Y")
                                        if interview_partner is not None else None
                                    )
                                )(app.interview_partner),
                        "Interview Client Final": (
                                    lambda interview_client_final: (
                                        interview_client_final.strftime("%d %b, %Y")
                                        if interview_client_final is not None else None
                                    )
                                )(app.interview_client_final),
                        "Hired": (
                                    lambda hired: (
                                        hired.strftime("%d %b, %Y")
                                        if hired is not None else None
                                    )
                                )(app.hired),
                        "Start date": (
                                    lambda start: (
                                        start.strftime("%d %b, %Y")
                                        if start is not None else None
                                    )
                                )(app.start),
                        "End date": (
                                    lambda end: (
                                        end.strftime("%b %d, %Y")
                                        if end is not None else None
                                    )
                                )(app.end),
                        "job":app.job.title,
                        "jobId":app.job_id
                    } for app in applications]
        print(output)
        return Response(output)
    
    @api_view(['GET'])
    def get_job_applications(request, id):
        print(f"GET /api/get-job-applications/{id}/")
        print(f"User ID: {request.user.id}")
        try:
            print(f"Fetching job applications for job_id: {id}")  # Debug log
            
            # First check if this user has been assigned this job via notification
            notification_exists = Notification.objects.filter(
                recruiter_id=request.user.id,  # Current user
                job_id=id,
                type='job_assignment'  # Only job assignments
            ).exists()

            if not notification_exists:
                print(f"User {request.user.id} not authorized to view job {id} applications")
                return Response({
                    'error': 'Not authorized to view these applications'
                }, status=403)

            # If authorized, get applications
            applications = Application.objects.filter(job_id=id)

            # Get all assigned candidates for this user
            assigned_candidates = Notification.objects.filter(
                recruiter_id=request.user.id,
                job_id=id,
                type='job_assignment'
            ).values_list('candidate_id', flat=True)

            output = []
            for app in applications:
                # Only include candidates that were assigned to this user
                if app.candidate.id in assigned_candidates:
                    stages = ['new', 'preselected', 'interviewed', 'tested', 'proposed', 
                            'interview_partner', 'interview_client_final', 'hired', 'start', 'end']
                    last_stage = 'new'  # Default to "new" stage
                    last_date = None

                    for stage in stages:
                        date = getattr(app, stage, None)
                        if date:
                            last_stage = stage
                            last_date = date

                    candidate = app.candidate
                    output.append({
                        'id_candidate': candidate.id,
                        'name': candidate.name,
                        'jobTitle': candidate.job_title,
                        'email': candidate.email,
                        'stage': last_stage,
                        'date_updated': last_date.isoformat() if last_date else None,
                        'assigned_via': 'job_assignment'
                    })

            print(f"Found {len(output)} assigned applications")  # Debug log
            return Response({
                'status': 'success',
                'applications': output
            }, status=200)

        except Exception as e:
            print(f"Error in get_job_applications: {e}")  # Debug log
            return Response({'error': str(e)}, status=500)



    @api_view(['PATCH'])
    def update_candidate_stage(request):
        try:
            candidate_id = request.data.get('candidate_id')
            new_stage = request.data.get('new_stage')

            # Debug logs
            print(f"Received candidate_id: {candidate_id}, new_stage: {new_stage}")

            # Validate input
            if not candidate_id or not new_stage:
                return Response({'error': 'Invalid candidate ID or stage.'}, status=400)

            # Fetch the application
            application = Application.objects.get(candidate_id=candidate_id)

            # Set the new stage
            setattr(application, new_stage, timezone.now())
            application.save()

            return Response({'message': 'Stage updated successfully.'}, status=200)

        except Application.DoesNotExist:
            print(f"Candidate with ID {candidate_id} not found.")
            return Response({'error': 'Candidate not found.'}, status=404)

        except Exception as e:
            print(f"Error updating candidate stage: {e}")  # Log the error
            return Response({'error': str(e)}, status=500)
