from django.apps import AppConfig


class CandidateConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'Candidate'

    def ready(self):
        #from Backend.elasticsearch_config import ElasticsearchUtils, CANDIDATE_MAPPING
        from elasticsearch_config import ElasticsearchUtils , CANDIDATE_MAPPING
        
        # Initialize Elasticsearch index
        es_utils = ElasticsearchUtils()
        es_utils.create_index('candidates', CANDIDATE_MAPPING)
        
        # Import signals
        import Candidate.signals
