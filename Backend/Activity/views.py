# from django.shortcuts import render, redirect
# from .forms import NoteCandidateForm
# from .models import NoteCandidate
from pymongo import MongoClient
from django.conf import settings
from django.contrib.auth.hashers import make_password
from rest_framework import status
from django.utils.dateparse import parse_date
from .models import Activity
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
from Recruiter.models import Recruiter
from django.core.paginator import Paginator
# Create your views here.


class ActivityView(APIView):    
    


    @api_view(['GET'])
    def get_Activities(request,id=None):
        if(id is None):
            id = request.user.id
        activities = Activity.objects.filter(recruiter_id=id).order_by('-date')[:10]
        page = request.GET.get('page', 1)  
        paginator = Paginator(activities, 10)  # 10 activities per page
        # Get the activities for the requested page
        try:
            activities_page = paginator.page(page)
        except:
            return Response([])  # Return an empty list if the page is out of range
        output = [{
            "description":new_Act.description,
            "date":(    lambda date: (
                                date.strftime("%d-%m-%Y %H:%M %Z") + date.strftime('%z')[:3]
                                if date is not None else None
                            )
                        )(new_Act.date),
            "recruiter": f"{new_Act.recruiter.first_name} {new_Act.recruiter.last_name}",
            "id_candidate": new_Act.candidate_id,
            "id_client": new_Act.client_id,
            "id_job": new_Act.job_id,
            "id_lead": new_Act.lead_id,
        } for new_Act in activities_page]   
        print(output) 
        return Response(output)

