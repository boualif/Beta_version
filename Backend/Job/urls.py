from django.urls import path
from .views import JobView

urlpatterns = [
     path('job/get/<int:id>/', JobView.job_list_client, name='job_list_client'),
    path('job/create/<int:id>/', JobView.job_create,{'operation':'byId'}, name='job_create1'),
    path('job/list/', JobView.job_list, name='job_list'),
    path('job/get-job/<int:id>/', JobView.get_job, name='get_job'),
path('job/<int:pk>/update/', JobView.job_update, name='job_update'),
    path('job/<int:pk>/delete/', JobView.job_delete, name='job_delete'),
    path('job/create2/', JobView.job_create,{'operation':'byClient'}, name='job_create2'),
    #path('api/test-matching/<int:job_id>/', JobView.test_elasticsearch_matching, name='test-matching'),
    path('api/job/test-elasticsearch-matching/<int:job_id>/', JobView.test_elasticsearch_matching, name='test_elasticsearch_matching'),

    #path('api/job/<int:job_id>/match/', JobView.test_elasticsearch_matching, name='test_elasticsearch_matching'),
    path('api/reindex_candidates/', JobView.reindex_candidates, name='reindex_candidates'),
    path('api/index-status/', JobView.get_index_status, name='index-status'),
    path('api/jobs/<int:job_id>/analyze-job-description/', JobView.analyze_tools_and_technologies_internal, name='analyze_job_description'),
    path('api/jobs/<int:job_id>/analyze/', JobView.analyze_job_description, name='analyze_job'),  # Updated this line
    path('api/analyze-candidate/<int:job_id>/', JobView.analyze_candidate_cv_with_job, name='analyze_candidate_cv_with_job'),
    path('api/jobs/<int:job_id>/update_keywords/', JobView.update_job_keywords, name='update_job_keywords'),


    path('api/restricted-job/<int:id>/', JobView.get_restricted_job, name='get_restricted_job'),    

    








]
