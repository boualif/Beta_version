from django.db import models
from Client.models import Client
from Recruiter.models import Recruiter

class Job(models.Model):

    MISSION_TIME_CHOICES = [
        ('<6 months', '< 6 months'),
        ('>6 months 1 year<', '> 6 months 1 year<'),
        ('1 year<', '1 year<'),
        ('2year<', '2 year<'),
        ('2 year<3 years>', '2 year<3 years>')
    ]

    client = models.ForeignKey(Client, null=True, on_delete=models.SET_NULL)
    recruiter = models.ForeignKey(Recruiter, null=True, on_delete=models.SET_NULL,related_name="jobs")
    title = models.CharField(max_length=255, null=False)
    description = models.TextField(null=True)
    company = models.CharField(max_length=100, null=True)
    budget = models.FloatField(null=True,blank=True)
    opening_date = models.DateField(blank=True,null=True)
    deadline_date = models.DateField(blank=True, null=True)
    location = models.CharField(max_length=100, null=True)
    contact_person = models.CharField(max_length=100, null=True)
    contact_person_phone = models.CharField(max_length=100, null=True)
    contact_person_email = models.CharField(max_length=100, null=True)
    nb_positions = models.IntegerField(null=True)
    added_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=50, choices=[('open', 'Open'), ('close', 'Closed')], null=True, blank=True)
    contract_start_date = models.DateField(blank=True,null=True)
    contract_end_date = models.DateField(blank=True,null=True)
    last_modified_by = models.ForeignKey(Recruiter, null=True, on_delete=models.SET_NULL, related_name="modified_jobs")
    required_skills = models.JSONField(null=True, blank=True)
    competence_phare = models.CharField(max_length=255, null=True, blank=True, help_text="Core competency required for the job")
    job_type_etiquette = models.CharField(max_length=50, null=True, blank=True, help_text="Job type classification (Technical/Functional/Technico-functional)")
    # New fields for analysis results
    job_type_etiquette = models.CharField(max_length=50, null=True, blank=True)
    analysis_date = models.DateTimeField(null=True, blank=True)
    
    technologies_core = models.JSONField(null=True, blank=True)
    outils_phares = models.JSONField(null=True, blank=True)
    competences_autres = models.JSONField(null=True, blank=True)
    responsabilites_principales = models.JSONField(null=True, blank=True)

    mission_time = models.CharField(
        max_length=50,
        choices=MISSION_TIME_CHOICES,
        null=True,
        blank=True
    )

    class Meta:
        db_table = 'job'
        ordering = ['-added_at']

    def __str__(self):
        return self.title