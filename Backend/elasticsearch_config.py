from elasticsearch import Elasticsearch
from elasticsearch.exceptions import ConnectionError
from typing import Dict, List, Any
import time
import logging

logger = logging.getLogger(__name__)

class ElasticsearchUtils:
    def __init__(self):
        # Initialize Elasticsearch client
        self.es = Elasticsearch(["http://localhost:9200"])  # Adjust URL as needed
        self._wait_for_elasticsearch()
        
    def _wait_for_elasticsearch(self, timeout: int = 30) -> bool:
        """Wait for Elasticsearch to become available."""
        start_time = time.time()
        while True:
            try:
                if self.es.ping():
                    return True
            except ConnectionError:
                if time.time() - start_time > timeout:
                    return False
                time.sleep(1)
        return False
        
    def create_index(self, index_name: str, mapping: Dict) -> None:
        """Create an Elasticsearch index with the specified mapping."""
        try:
            if not self.es.indices.exists(index=index_name):
                self.es.indices.create(index=index_name, body=mapping)
                print(f"Index {index_name} created successfully")
        except Exception as e:
            print(f"Error creating index: {str(e)}")
    
    def index_candidate(self, candidate_data: Dict) -> None:
        """Index a candidate document."""
        try:
            self.es.index(
                index="candidates",
                id=candidate_data["id"],
                document=candidate_data
            )
        except Exception as e:
            print(f"Error indexing candidate: {str(e)}")
    
    def search_candidates(self, query: Dict) -> List[Dict]:
        """Search for candidates using the specified query."""
        try:
            response = self.es.search(index="candidates", body=query)
            return response["hits"]["hits"]
        except Exception as e:
            print(f"Error searching candidates: {str(e)}")
            return []

# Define the mapping for candidates
CANDIDATE_MAPPING = {
    "mappings": {
        "properties": {
            "id": {"type": "keyword"},
            "name": {"type": "text"},
            "job_title": {"type": "text"},
            "experience": {"type": "integer"},
            "availability": {"type": "keyword"},
            "mobility": {"type": "keyword"},
            "contract_location": {"type": "keyword"},
            "contract_type": {"type": "keyword"},
            "salary_expectation": {"type": "float"},
            "skills": {
                "type": "nested",
                "properties": {
                    "name": {"type": "keyword"},
                    "level": {"type": "keyword"}
                }
            },
            "experience_description": {
            "type": "text",
            "analyzer": "standard"
             },
            "resume_data": {
                "type": "object",
                "enabled": False  # Store but don't index the full resume data
            }
        }
    }
}

# Create a singleton instance
es_utils = ElasticsearchUtils()
es_client = es_utils.es  # This is what was missing - expose the client

# Create the index with mapping
try:
    es_utils.create_index("candidates", CANDIDATE_MAPPING)
except Exception as e:
    print(f"Error setting up Elasticsearch: {str(e)}")
    