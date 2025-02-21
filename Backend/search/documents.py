from django_elasticsearch_dsl import Document, fields
from django_elasticsearch_dsl.registries import registry
from Candidate.models import Candidate
from Job.models import Job
from Recruiter.models import Recruiter
from Lead.models import Lead
from Client.models import Client

@registry.register_document
class GlobalSearchDocument(Document):
    # Common fields for all models
    id = fields.IntegerField()
    model_type = fields.KeywordField()
    name = fields.TextField(
        analyzer='standard',
        fields={
            'raw': fields.KeywordField(),
            'suggest': fields.CompletionField(),
            'edge_ngram': fields.TextField(
                analyzer='edge_ngram_analyzer'
            )
        }
    )
    email = fields.TextField()
    description = fields.TextField()
    location = fields.TextField()  # Added location field
    status = fields.KeywordField() # Added status field
    
    # Specific fields
    job_title = fields.TextField()
    company = fields.TextField()
    
    class Index:
        name = 'global_search'
        settings = {
            'number_of_shards': 1,
            'number_of_replicas': 0,
            'analysis': {
                'analyzer': {
                    'edge_ngram_analyzer': {
                        'type': 'custom',
                        'tokenizer': 'edge_ngram_tokenizer',
                        'filter': ['lowercase']
                    }
                },
                'tokenizer': {
                    'edge_ngram_tokenizer': {
                        'type': 'edge_ngram',
                        'min_gram': 2,
                        'max_gram': 20,
                        'token_chars': ['letter', 'digit']
                    }
                }
            }
        }

    def prepare_model_type(self, instance):
        return instance.__class__.__name__.lower()

    def get_instances_from_related(self, related_instance):
        """Handle all model types"""
        if isinstance(related_instance, (Candidate, Job, Recruiter, Lead, Client)):
            return related_instance
        return None

    class Django:
        model = Candidate  # We need to specify a base model
        related_models = [Job, Recruiter, Lead, Client]

        def get_queryset(self):
            """
            Don't return any queryset for the base model as we'll handle 
            indexing manually for all models
            """
            return Candidate.objects.none()

    def prepare(self, instance):
        """
        Universal prepare method for all model types
        """
        data = {
            'id': instance.id,
            'model_type': self.prepare_model_type(instance)
        }

        # Map common attributes
        if hasattr(instance, 'name'):
            data['name'] = instance.name
        elif hasattr(instance, 'title'):  # For Job model
            data['name'] = instance.title

        if hasattr(instance, 'email'):
            data['email'] = instance.email

        if hasattr(instance, 'description'):
            data['description'] = instance.description

        # Handle specific fields
        if hasattr(instance, 'job_title'):
            data['job_title'] = instance.job_title

        if hasattr(instance, 'company'):
            data['company'] = instance.company

        return data

    @classmethod
    def generate_id(cls, instance):
        """
        Generate a unique ID for each document that includes the model type
        """
        return f"{instance.__class__.__name__.lower()}_{instance.id}"