from django.db import models
from django.contrib.postgres.fields import ArrayField
from Recruiter.models import Recruiter
from Candidate.models import Candidate
from django.utils import timezone
from Job.models import Job  # Add this import

class Notification(models.Model):
    date = models.DateTimeField(default=timezone.now, null=True)
    content = models.CharField(max_length=20, blank=True, null=True)
    recruiter = models.ForeignKey(Recruiter, on_delete=models.SET_NULL, null=True)
    candidate = models.ForeignKey(Candidate, on_delete=models.SET_NULL, null=True)
    is_confirmed = models.BooleanField(default=False)
    # Add these new fields
    job = models.ForeignKey(Job, on_delete=models.SET_NULL, null=True)  
    type = models.CharField(max_length=50, default='job_assignment')  # or resume_update
    is_read = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'notification'
        ordering = ['-date']