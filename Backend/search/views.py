from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.core.management import call_command
from django.contrib.admin.views.decorators import staff_member_required  # Add this import
from elasticsearch_dsl import Q
from .documents import GlobalSearchDocument
import logging
from django.shortcuts import render


logger = logging.getLogger(__name__)

from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from elasticsearch_dsl import Q
from .documents import GlobalSearchDocument
import logging
from django.shortcuts import render

logger = logging.getLogger(__name__)

@csrf_exempt
@require_http_methods(["GET"])
@require_http_methods(["GET"])
def search_view(request):
    """
    View function for handling global search across multiple models
    """
    query = request.GET.get('q', '')
    model_type = request.GET.get('type', '')
    
    logger.info(f"Search query received: {query}")
    
    if not query:
        return JsonResponse({'results': []})

    try:
        search = GlobalSearchDocument.search()
        
        if model_type:
            search = search.filter('term', model_type=model_type)

        search = search.query(
            'multi_match',
            query=query,
            fields=[
                'name^3',
                'name.edge_ngram^2',
                'email^2',
                'description',
                'job_title^2',
                'company^2'
            ],
            type="best_fields",
            fuzziness='AUTO',
            minimum_should_match="75%"
        )

        try:
            response = search.execute()
            logger.info(f"Search returned {response.hits.total.value} results")
        except Exception as e:
            logger.error(f"Error executing search: {str(e)}", exc_info=True)
            raise

        results = []
        for hit in response:
            try:
                result = {
                    'id': hit.id,
                    'type': hit.model_type,
                    'title': getattr(hit, 'name', None),
                    'subtitle': '',
                    'score': hit.meta.score,
                    'url': None  # Will be set based on type
                }
                
                if hit.model_type == 'candidate':
                    result['subtitle'] = f"{getattr(hit, 'job_title', '')} - {getattr(hit, 'location', '')}"
                    result['url'] = f"/api/get-candidate/{hit.id}/"  # Cette URL est correcte
                
                elif hit.model_type == 'job':
                    description = getattr(hit, 'description', '')
                    result['subtitle'] = f"{getattr(hit, 'location', '')} - {description[:100]}..." if description else ''
                    result['url'] = f"/job/get-job/{hit.id}/"
                    result['company'] = getattr(hit, 'company', '')
                
                elif hit.model_type == 'client':
                    result['subtitle'] = f"{getattr(hit, 'company', '')} - {getattr(hit, 'industry', '')}"
                    result['url'] = f"/{hit.id}/get-client/"
                    result['contact_person'] = getattr(hit, 'contact_person', '')

                # Add status if available
                if hasattr(hit, 'status'):
                    result['status'] = hit.status

                results.append(result)
                
            except Exception as e:
                logger.error(f"Error processing hit: {str(e)}", exc_info=True)
                continue

        return JsonResponse({
            'results': results,
            'total': response.hits.total.value,
            'took': getattr(response, 'took', 0)
        })
    
    except Exception as e:
        logger.error(f"Search error: {str(e)}", exc_info=True)
        return JsonResponse({
            'error': str(e),
            'type': 'search_error'
        }, status=500)
def search_results_view(request):
    """
    View for the search results page
    """
    query = request.GET.get('q', '')
    return render(request, 'search_results.html', {'query': query})


@staff_member_required  # Only staff members can rebuild index
@csrf_exempt
@require_http_methods(["POST"])
def rebuild_index_view(request):
    try:
        # Call the rebuild_search_index management command
        call_command('rebuild_search_index')
        return JsonResponse({
            'status': 'success',
            'message': 'Search index rebuilt successfully'
        })
    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'message': str(e)
        }, status=500)