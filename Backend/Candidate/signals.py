from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import Candidate
from elasticsearch_config import ElasticsearchUtils
from Candidate.search_indexes import index_candidate, index_all_candidates

es_utils = ElasticsearchUtils()

@receiver(post_save, sender=Candidate)
def candidate_saved(sender, instance, created, **kwargs):
    """Index candidate when saved or updated"""
    es_utils.index_candidate(instance)

@receiver(post_delete, sender=Candidate)
def candidate_deleted(sender, instance, **kwargs):
    """Remove candidate from index when deleted"""
    try:
        es_utils.client.delete(
            index='candidates',
            id=str(instance.id),
            ignore=[404]
        )
    except Exception as e:
        print(f"Error deleting candidate from index: {e}")

# Remove any duplicate signal handlers if they exist
@receiver(post_save, sender=Candidate)
def candidate_indexing(sender, instance, **kwargs):
    """Remove this duplicate handler"""
    pass