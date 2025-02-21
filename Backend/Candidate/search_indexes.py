# search_indexes.py
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from rest_framework.decorators import api_view  # Add this import
from .models import Candidate
from elasticsearch_config import es_client
import logging

logger = logging.getLogger(__name__)

@receiver(post_save, sender=Candidate)
def index_candidate_on_save(sender, instance, **kwargs):
    doc = {
        'candidate_id': instance.id,
        'name': instance.name,
        'job_title': instance.job_title or "",
    }
    try:
        es_client.index(index='candidates', id=str(instance.id), body=doc, refresh=True)
        logger.info(f"Candidate {instance.id} indexed successfully.")
    except Exception as e:
        logger.error(f"Error indexing candidate {instance.id}: {e}")

@receiver(post_delete, sender=Candidate)
def remove_candidate_from_index(sender, instance, **kwargs):
    try:
        es_client.delete(index='candidates', id=str(instance.id), ignore=[404])
        logger.info(f"Candidate {instance.id} removed from index successfully.")
    except Exception as e:
        logger.error(f"Error removing candidate {instance.id} from index: {e}")

def index_candidate(candidate):
    doc = {
        'candidate_id': candidate.id,
        'job_title': candidate.job_title or "",
        'availability': candidate.availability or "",
        'mobility': candidate.mobility or "",
        'status': candidate.status or ""
    }
    es_client.index(index='candidates', id=str(candidate.id), body=doc, refresh=True)



def index_all_candidates():
    candidates = Candidate.objects.all()
    for candidate in candidates:
        index_candidate(candidate)



