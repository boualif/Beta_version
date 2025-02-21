from django.db import models
from django.utils import timezone
from django.contrib.auth.models import AbstractUser


class Matching(AbstractUser):
    """
    A model to represent candidates being matched to job descriptions.
    Inherits from AbstractUser for user-related fields.
    """
    resume_json_id = models.CharField(max_length=100, blank=True, null=True)
    resume_file_id = models.CharField(max_length=100, blank=True, null=True)
    job_title = models.CharField(max_length=1000, blank=True, null=True)
    experience = models.IntegerField(null=True, blank=True)  # Candidate's experience in years
    availability = models.CharField(max_length=50, blank=True, null=True)  # Availability status

    def __str__(self):
        return self.name
