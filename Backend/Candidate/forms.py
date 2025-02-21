from django import forms
from .models import Candidate

class CandidateForm(forms.ModelForm):
    resume_file = forms.FileField()

    class Meta:
        model = Candidate
        fields = ['first_name','last_name', 'email', 'resume_file']
