from django.db import models
from Job.models import Job
from django.contrib.postgres.fields import ArrayField
from django.db.models import JSONField
from Recruiter.models import Recruiter
from django.utils import timezone
class AbstractUser(models.Model):
    name = models.TextField(blank=True,null=True)
    email = models.TextField(blank=True, null=True)
    added_at = models.DateTimeField(default=timezone.now,null=True)
    class Meta:
        abstract = True
    



# Create your models here.
class Candidate(AbstractUser):
    job = models.ManyToManyField(Job,through='Application.Application')
    recruiter = models.ForeignKey(Recruiter, on_delete=models.SET_NULL,null=True)
    resume_json_id = models.CharField(max_length=100, blank=True, null=True)
    resume_json_updated_id = models.CharField(max_length=100, blank=True, null=True)
    resume_file_id = models.CharField(max_length=100, blank=True, null=True)
    resume_file_updated_id = models.CharField(max_length=100, blank=True, null=True)
    resume_drive_id = models.CharField(max_length=100, blank=True, null=True)
    job_title = models.CharField(max_length=1000, blank=True, null=True)
    source = models.CharField(max_length=100, blank=True, null=True)
    experience = models.IntegerField(null=True)
    availability = models.CharField(max_length=100, blank=True, null=True)
    mobility = models.CharField(max_length=100, blank=True, null=True)
    status = models.CharField(blank=True, null=True)
    date_last_contacted = models.DateTimeField(null=True)
    contract_location = models.CharField(max_length=100, blank=True, null=True) 
    contract_type = models.CharField(max_length=100, blank=True, null=True)
    salary_expectation = models.FloatField(blank=True, null=True)
    administrative_regularity = models.CharField(max_length=100, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    periode_preavis = models.CharField(max_length=100, null=True, blank=True)
    previous_salary = models.FloatField(blank=True, null=True)
    integration_date = models.DateField(null=True)
    leave_balance = models.FloatField(blank=True, null=True)
    date1 = models.DateField(null=True)
    validated_by1 = models.CharField(max_length=100, blank=True, null=True)
    evaluation1 = models.CharField(max_length=1000, blank=True, null=True)
    user1 = models.ForeignKey(Recruiter, on_delete=models.SET_NULL,null=True, related_name='user1')
    date2 = models.DateField(null=True)
    validated_by2 = models.CharField(max_length=100, blank=True, null=True)
    evaluation2 = models.CharField(max_length=1000, blank=True, null=True)
    user2 = models.ForeignKey(Recruiter, on_delete=models.SET_NULL,null=True, related_name='user2')
    date3 = models.DateField(null=True)
    validated_by3 = models.CharField(max_length=100, blank=True, null=True) 
    evaluation3 = models.CharField(max_length=1000, blank=True, null=True)
    user3 = models.ForeignKey(Recruiter, on_delete=models.SET_NULL,null=True, related_name='user3')
    

    recruiter = models.ForeignKey(Recruiter, on_delete=models.SET_NULL, null=True, related_name='assigned_candidates')
    stage = models.CharField(max_length=50, default='new')  # Pour gérer les différents stages


    #rank = models.IntegerField(null=True)
    #elastic_score = models.FloatField()
    #general_score = models.FloatField()
    #skills_score = models.FloatField()
    #experience_score = models.FloatField()
    #final_score = models.FloatField()
    #match_quality = models.CharField(max_length=50)
    #analysis_details = models.JSONField()
    #type_specific_scores = models.JSONField()
    
    
    class Meta:
        db_table = 'candidate'
        ordering = ['-added_at'] 



class ValidationUpdate(models.Model):
    candidate = models.ForeignKey(Candidate, on_delete=models.CASCADE, related_name='validation_updates')
    validation_type = models.CharField(max_length=20)  # 'valService', 'valTechnic', or 'valDirection'
    user = models.ForeignKey(Recruiter, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    # Validation fields
    date = models.DateField(null=True, blank=True)
    validated_by = models.CharField(max_length=100, null=True, blank=True)
    evaluation = models.TextField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

     # HR Management fields
    contract_location = models.CharField(max_length=100, null=True, blank=True)
    contract_type = models.CharField(max_length=100, null=True, blank=True)
    salary_expectation = models.FloatField(null=True, blank=True)
    previous_salary = models.FloatField(null=True, blank=True)
    integration_date = models.DateField(null=True, blank=True)
    administrative_regularity = models.CharField(max_length=100, null=True, blank=True)
    periode_preavis = models.CharField(max_length=100, null=True, blank=True)

    class Meta:
        db_table = 'validation_updates'
        ordering = ['-created_at']

# In models.py
class HRUpdate(models.Model):
    candidate = models.ForeignKey(Candidate, on_delete=models.CASCADE)
    recruiter = models.ForeignKey(Recruiter, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    
    # HR Management fields
    contract_location = models.CharField(max_length=100, null=True, blank=True)
    contract_type = models.CharField(max_length=100, null=True, blank=True)
    salary_expectation = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    previous_salary = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    integration_date = models.DateField(null=True, blank=True)
    administrative_regularity = models.CharField(max_length=100, null=True, blank=True)
    periode_preavis = models.CharField(max_length=100, null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']

