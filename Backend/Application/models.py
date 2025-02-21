from django.db import models
from Candidate.models import Candidate
from Job.models import Job

# Create your models here.

class Application(models.Model):
    candidate = models.ForeignKey(Candidate, on_delete=models.SET_NULL,null=True)
    job = models.ForeignKey(Job, on_delete=models.SET_NULL,null=True)
    new = models.DateTimeField(null=True)
    preselected = models.DateTimeField(null=True)
    interviewed = models.DateTimeField(null=True)
    tested = models.DateTimeField(null=True)
    proposed = models.DateTimeField(null=True)
    interview_partner = models.DateTimeField(null=True)  # New section
    interview_client_final = models.DateTimeField(null=True)  # New section
    hired = models.DateTimeField(null=True)
    start = models.DateTimeField(null=True)
    end = models.DateTimeField(null=True)
    
    class Meta:
        db_table = 'application'
