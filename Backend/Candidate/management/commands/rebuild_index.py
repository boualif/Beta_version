from django.core.management.base import BaseCommand
from Candidate.models import Candidate
from elasticsearch_config import ElasticsearchUtils, CANDIDATE_MAPPING
from elasticsearch import Elasticsearch

class Command(BaseCommand):
    help = 'Index all candidates into Elasticsearch'

    def handle(self, *args, **kwargs):
        # Initialize Elasticsearch and setup index
        es_client = Elasticsearch(['http://localhost:9200'])
        
        # Delete and recreate index with proper mapping
        if es_client.indices.exists(index='candidates'):
            es_client.indices.delete(index='candidates')
        es_client.indices.create(index='candidates', body=CANDIDATE_MAPPING)
        
        es_utils = ElasticsearchUtils(es_client)

        # Get all candidates
        candidates = Candidate.objects.all()
        total = len(candidates)
        success = 0
        failed = 0

        print(f"Starting reindex of {total} candidates...")

        for candidate in candidates:
            if es_utils.index_candidate(candidate):
                success += 1
            else:
                failed += 1

        print(f"\nReindexing complete:")
        print(f"Total processed: {total}")
        print(f"Successful: {success}")
        print(f"Failed: {failed}")

