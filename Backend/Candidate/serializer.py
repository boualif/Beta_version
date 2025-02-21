from rest_framework import serializers
from .models import Candidate

class CandidateSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Candidate
        fields = ['first_name', 'last_name', 'email' ]

    def create(self, validated_data):
        print('hiii sam')
        candidate = Candidate.objects.create(**validated_data)
        
        
        return candidate