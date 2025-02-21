from django.db import models
from Client.models import Client
from Recruiter.models import Recruiter
from django.contrib.postgres.fields import ArrayField

class AbstractUser(models.Model):
    first_name = models.CharField(max_length=100, null=True)
    last_name = models.CharField(max_length=100, null=True)
    email = models.EmailField(null=True)
    phone = models.CharField(max_length=100, null=True)
    added_at = models.DateTimeField(auto_now_add=True, null=True)


    class Meta:
        abstract = True
        ordering = ['-added_at']

class Lead(AbstractUser):
    linkedIn = models.CharField(max_length=100, null=True)
    notes = models.TextField(null=True, blank=True)
    client_post = models.CharField(max_length=200, null=True, blank=True)
    client = models.ForeignKey(Client, on_delete=models.CASCADE, null=True)
    recruiter = models.ForeignKey(Recruiter, on_delete=models.SET_NULL, null=True, related_name='leads')
    last_modified_by = models.ForeignKey(Recruiter, on_delete=models.SET_NULL, null=True, related_name='modified_leads')

    class Meta:
        db_table = 'lead'
        ordering = ['-added_at']  # Inherit ordering from parent but specify it explicitly