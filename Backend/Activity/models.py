
from django.db import models
from Candidate.models import Candidate
from Client.models import Client
from Recruiter.models import Recruiter
from Candidate.models import Candidate
from Job.models import Job
from Lead.models import Lead
from django.utils import timezone

# Create your models here.
class Activity(models.Model):
    
    recruiter = models.ForeignKey(Recruiter, on_delete=models.SET_NULL,null=True)
    date = models.DateTimeField(default=timezone.now, null=True)
    description = models.CharField(max_length=30,blank=True, null=True)
    candidate = models.ForeignKey(Candidate, on_delete=models.SET_NULL,null=True)
    client = models.ForeignKey(Client, on_delete=models.SET_NULL,null=True,related_name="clientfk")
    job = models.ForeignKey(Job, on_delete=models.SET_NULL,null=True)
    lead = models.ForeignKey(Client, on_delete=models.SET_NULL,null=True,related_name="leadfk")


    class Meta:
        db_table = 'activity'
        ordering = ['-date'] 
