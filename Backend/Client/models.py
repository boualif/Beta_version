from django.db import models
from django.contrib.postgres.fields import ArrayField
from Recruiter.models import Recruiter

class BaseUser(models.Model):
    """Base model for storing user-related fields."""
    company = models.CharField(max_length=100, null=False, unique=True)
    address = models.TextField(null=True)
    image = models.BinaryField(null=True)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        abstract = True

class Client(BaseUser):
    """Client model with additional specific fields."""
    website = models.CharField(max_length=100, blank=True, null=True)
    description = models.CharField(max_length=100, blank=True, null=True)
    industry = models.CharField(max_length=100, blank=True, null=True)
    status = models.CharField(max_length=50, choices=[('prospect', 'Prospect'), ('partner', 'Partner'), ('lead', 'Lead')], null=True)
    notes = models.CharField(max_length=1000, blank=True, null=True)
    engagement_type = models.CharField(max_length=50, choices=[('talent outsourcing', 'Talent Outsourcing'), ('direct employment', 'Direct Employment')], null=True, blank=True)
    key_account_manager = models.ForeignKey(Recruiter, on_delete=models.SET_NULL, null=True, blank=True, related_name="clients")
    headquarters_phone_number = models.CharField(max_length=50, blank=True, null=True)  # Added field
    urls = ArrayField(models.CharField(max_length=200), blank=True,null=True)
    last_modified_by = models.ForeignKey(Recruiter, null=True, on_delete=models.SET_NULL, related_name="modified_clients")
    
    class Meta:
        db_table = 'client'
        verbose_name = 'Client'
        verbose_name_plural = 'Clients'
        ordering = ['-added_at'] 
