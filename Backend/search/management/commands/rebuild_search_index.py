from django.core.management.base import BaseCommand
from elasticsearch.helpers import bulk
from Candidate.models import Candidate
from Job.models import Job
from Recruiter.models import Recruiter
from Lead.models import Lead
from Client.models import Client
from ...documents import GlobalSearchDocument
import logging

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Index all models in Elasticsearch'

    def handle(self, *args, **options):
        self.stdout.write('Starting global indexing...')
        
        # Define all models to index
        models = [
            Candidate,
            Job,
            Recruiter,
            Lead,
            Client
        ]

        # Get the document instance and elasticsearch connection
        doc = GlobalSearchDocument()
        client = doc._get_connection()
        index = GlobalSearchDocument._index
        index_name = index._name

        try:
            # Delete existing index
            if client.indices.exists(index=index_name):
                self.stdout.write(f'Deleting existing index {index_name}')
                client.indices.delete(index=index_name)

            # Create new index with mappings and settings
            self.stdout.write(f'Creating new index {index_name}')
            index.create()

            # Index each model
            for model in models:
                model_name = model.__name__.lower()
                self.stdout.write(f'Indexing {model_name}...')
                
                queryset = model.objects.all()
                count = queryset.count()
                
                def generate_actions():
                    for obj in queryset:
                        doc = GlobalSearchDocument()
                        data = doc.prepare(obj)
                        doc_id = GlobalSearchDocument.generate_id(obj)
                        yield {
                            '_index': index_name,
                            '_id': doc_id,
                            '_source': data
                        }

                try:
                    success_count, errors = bulk(
                        client,
                        generate_actions(),
                        chunk_size=100,
                        raise_on_error=False
                    )

                    if errors:
                        self.stdout.write(
                            self.style.WARNING(
                                f'Encountered {len(errors)} errors while indexing {model_name}'
                            )
                        )
                        for error in errors:
                            logger.warning(f'Indexing error for {model_name}: {error}')

                    self.stdout.write(
                        self.style.SUCCESS(
                            f'Successfully indexed {success_count} out of {count} {model_name} documents'
                        )
                    )

                except Exception as e:
                    self.stderr.write(
                        self.style.ERROR(f'Error indexing {model_name}: {str(e)}')
                    )
                    logger.error(f'Error indexing {model_name}', exc_info=True)

        except Exception as e:
            self.stderr.write(self.style.ERROR(f'Global error during indexing: {str(e)}'))
            logger.error('Global indexing error', exc_info=True)
            raise

        self.stdout.write(self.style.SUCCESS('Successfully indexed all models'))