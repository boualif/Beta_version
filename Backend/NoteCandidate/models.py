from django.db import models
from django.contrib.postgres.fields import ArrayField
from Recruiter.models import Recruiter
from Candidate.models import Candidate
from django.utils import timezone

class NoteCandidate(models.Model):
    added_at = models.DateTimeField(default=timezone.now,null=True)
    content = models.TextField(null=True)
    recruiter = models.CharField(max_length=100, blank=True, null=True)
    candidate = models.ForeignKey(Candidate, on_delete=models.SET_NULL,null=True)
    class Meta:
        db_table = 'note_candidate'