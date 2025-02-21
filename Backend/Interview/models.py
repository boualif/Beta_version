from django.db import models
from Candidate.models import Candidate
from Job.models import Job

class Interview(models.Model):
    INTERVIEW_TYPES = (
        ('recruiter', 'Recruiter'),
        ('partner', 'Partner'),
        ('client', 'Client'),
    )
    
    candidate = models.ForeignKey(Candidate, on_delete=models.SET_NULL, null=True)
    job = models.ForeignKey(Job, on_delete=models.SET_NULL, null=True)
    notes = models.TextField(blank=True, null=True)
    date = models.DateField(null=True)
    interview_type = models.CharField(max_length=20, choices=INTERVIEW_TYPES, default='recruiter')
    interviewer_name = models.CharField(max_length=255, blank=True, null=True)  # Will store recruiter/partner/client name
    
    class Meta:
        db_table = 'interview'
        