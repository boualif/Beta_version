# management/commands/manage_candidate_index.py
from django.core.management.base import BaseCommand
from elasticsearch_config import ElasticsearchUtils, CANDIDATE_MAPPING
from ...models import Candidate
import logging

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Manage the Elasticsearch candidate index'

    def add_arguments(self, parser):
        parser.add_argument(
            '--action',
            choices=['create', 'reindex', 'delete'],
            default='reindex',
            help='Action to perform on the index'
        )

    def handle(self, *args, **options):
        es_utils = ElasticsearchUtils()
        action = options['action']

        try:
            if action == 'create':
                self._create_index(es_utils)
            elif action == 'reindex':
                self._reindex_all(es_utils)
            elif action == 'delete':
                self._delete_index(es_utils)

        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error: {str(e)}"))
            logger.error(f"Error in manage_candidate_index command: {str(e)}")

    def _create_index(self, es_utils):
        created = es_utils.create_index('candidates', CANDIDATE_MAPPING)
        if created:
            self.stdout.write(self.style.SUCCESS("Successfully created index"))
        else:
            self.stdout.write(self.style.WARNING("Index already exists"))

    def _reindex_all(self, es_utils):
        candidates = Candidate.objects.all()
        total = candidates.count()
        success = 0
        failed = 0

        self.stdout.write(f"Starting reindex of {total} candidates...")

        for candidate in candidates:
            try:
                if es_utils.index_candidate(candidate):
                    success += 1
                else:
                    failed += 1
            except Exception as e:
                failed += 1
                logger.error(f"Error indexing candidate {candidate.id}: {str(e)}")

        self.stdout.write(self.style.SUCCESS(
            f"Reindexing complete:\n"
            f"Total processed: {total}\n"
            f"Successful: {success}\n"
            f"Failed: {failed}"
        ))

    def _delete_index(self, es_utils):
        try:
            es_utils.client.indices.delete(index='candidates')
            self.stdout.write(self.style.SUCCESS("Successfully deleted index"))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error deleting index: {str(e)}"))