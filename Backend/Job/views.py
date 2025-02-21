from django.shortcuts import render, get_object_or_404, redirect
from django.http import HttpResponse
from django.test import RequestFactory
import openai
from rest_framework.decorators import api_view,permission_classes
from rest_framework.views import APIView
from django.views.decorators.http import require_POST
from .models import Job
from django import forms
from Client.models import Client
from Client.models import Recruiter
from rest_framework import status
from rest_framework.response import Response
from django.http import JsonResponse
from django.core.paginator import Paginator
import base64
from rest_framework.permissions import IsAdminUser
from Candidate.models import Candidate
from openai import OpenAI
from dotenv import load_dotenv
import os
from rest_framework.permissions import AllowAny,IsAuthenticated
import json
from elasticsearch_config import Elasticsearch
from .job_matching_utils import (
    prepare_candidate_info,
)
from elasticsearch_config import es_utils
from django.conf import settings
from pymongo import MongoClient
from bson import ObjectId
from django.urls import reverse
from rest_framework.test import APIRequestFactory
from typing import Dict
from django.http import HttpRequest
from rest_framework.request import Request
from django.utils import timezone
from Candidate.views import CandidateView
import logging
from Activity.models import Activity
from Notification.models import Notification
# Configure logger
#logger = logging.getLogger(__name__)
#logging.basicConfig(level=logging.DEBUG)
es_client = Elasticsearch(hosts=["http://localhost:9200"])

load_dotenv()

# Initialize OpenAI client
client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))



def serialize_es_response(es_response):
    """Helper function to serialize Elasticsearch response"""
    if isinstance(es_response, dict):
        return {k: serialize_es_response(v) for k, v in es_response.items()}
    elif isinstance(es_response, list):
        return [serialize_es_response(item) for item in es_response]
    elif hasattr(es_response, 'to_dict'):
        return es_response.to_dict()
    else:
        return es_response
class JobView(APIView):

    
    # class Meta:
    #     model = Job
    #     fields = [
    #         'job_title', 'status', 'location', 'budget', 'contact_person',
    #         'contact_person_phone', 'contact_person_email', 'number_of_openings',
    #         'number_of_proposed_candidates', 'selected_candidates',
    #         'contract_start_date', 'contract_end_date', 'job_description'
    #     ]
    
    # Add this to your views.py

    @api_view(['GET'])
    @permission_classes([IsAuthenticated])
    def get_restricted_job(request, id):
        try:
            print(f"GET /api/get-job-applications/{id}/")
            print(f"User ID: {request.user.id}")
            print(f"Request headers: {request.headers}")
            
            # Get notifications for this job and user
            notifications = Notification.objects.filter(
                recruiter_id=request.user.id,
                job_id=id,
                type='job_assignment'
            )
            
            print(f"Found notifications: {notifications.count()}")

            if not notifications.exists():
                print(f"No job assignment notifications found for user {request.user.id} and job {id}")
                return Response({
                    'error': 'Not authorized to view these applications'
                }, status=403)

            # Get the job data
            job = Job.objects.get(id=id)
            
            # Return the job details in restricted format
            restricted_data = {
                'id': job.id,
                'title': job.title,
                'status': job.status,
                'location': job.location,
                'description': job.description,
                'competence_phare': job.competence_phare,
                'job_type_etiquette': job.job_type_etiquette,
                'nb_positions': job.nb_positions,
                'opening_date': job.opening_date,
                'deadline_date': job.deadline_date, # Add this line

                'contract_start_date': job.contract_start_date,
                'contract_end_date': job.contract_end_date,
                'budget': job.budget,
                'client': job.client.company if job.client else job.company,
                'ownerRH': f"{job.recruiter.first_name} {job.recruiter.last_name}"
            }
            
            print(f"Successfully loaded restricted job data:", restricted_data)
            return Response(restricted_data)
                    
        except Job.DoesNotExist:
            print(f"Job {id} not found")
            return Response(
                {'error': 'Job not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
    #Analyse AI pour les tools extraxted from job title et competence phare
    @staticmethod
    def normalize_score(score_str):
        """Convert percentage string to number"""
        try:
            return float(score_str.strip('%'))
        except (ValueError, AttributeError):
            return 0.0
    
    @staticmethod
    def calculate_final_score(analysis, elastic_score, job_type):
        """
        Calculate final score with validation and logging
        """
        #logger.info(f"Calculating score for job type: {job_type}")
        #logger.info(f"Input scores - Skills: {analysis.get('skills_score')}, Experience: {analysis.get('job_title_and_experience_score')}, Elastic: {elastic_score}")
        
        try:
            if job_type.lower() == "technique":
                # Technical Position Scoring
                technical_skills = JobView.normalize_score(analysis.get('skills_score', '0%'))
                experience_match = JobView.normalize_score(analysis.get('job_title_and_experience_score', '0%'))
                
                # Log intermediate calculations
                #logger.debug(f"Technical skills (70%): {technical_skills} * 0.7 = {technical_skills * 0.7}")
                #logger.debug(f"Experience match (30%): {experience_match} * 0.3 = {experience_match * 0.3}")
                
                weighted_technical = technical_skills * 0.2
                weighted_experience = experience_match * 0.8
                base_score = weighted_technical + weighted_experience
                
                elastic_normalized = min((elastic_score / 30) * 100, 100)
                final_score = (base_score * 0.85) + (elastic_normalized * 0.15)
                
                #logger.debug(f"Final technical score calculation: ({base_score} * 0.85) + ({elastic_normalized} * 0.15) = {final_score}")

            elif job_type.lower() == "fonctionnel":
                # Similar logging for functional scoring
                functional_skills = JobView.normalize_score(analysis.get('skills_score', '0%'))
                experience_match = JobView.normalize_score(analysis.get('job_title_and_experience_score', '0%'))
                
                #logger.debug(f"Functional skills (60%): {functional_skills} * 0.6 = {functional_skills * 0.6}")
                #logger.debug(f"Experience match (40%): {experience_match} * 0.4 = {experience_match * 0.4}")
                
                weighted_functional = functional_skills * 0.2
                weighted_experience = experience_match * 0.8
                base_score = weighted_functional + weighted_experience
                
                elastic_normalized = min((elastic_score / 30) * 100, 100)
                final_score = (base_score * 0.9) + (elastic_normalized * 0.1)
                
                #logger.debug(f"Final functional score: ({base_score} * 0.9) + ({elastic_normalized} * 0.1) = {final_score}")

            else:  # Technico-fonctionnel
                # Similar logging for technico-functional scoring
                skills_score = JobView.normalize_score(analysis.get('skills_score', '0%'))
                experience_match = JobView.normalize_score(analysis.get('job_title_and_experience_score', '0%'))
                
                #logger.debug(f"Combined skills (70%): {skills_score} * 0.7 = {skills_score * 0.7}")
                #logger.debug(f"Experience match (30%): {experience_match} * 0.3 = {experience_match * 0.3}")
                
                weighted_skills = skills_score * 0.2
                weighted_experience = experience_match * 0.8
                base_score = weighted_skills + weighted_experience
                
                elastic_normalized = min((elastic_score / 30) * 100, 100)
                final_score = (base_score * 0.88) + (elastic_normalized * 0.12)
                
                #logger.debug(f"Final technico-functional score: ({base_score} * 0.88) + ({elastic_normalized} * 0.12) = {final_score}")

            return round(final_score, 2)
            
        except Exception as e:
            #logger.error(f"Error in score calculation: {str(e)}")
            #logger.error(f"Analysis data: {analysis}")
            raise

    @staticmethod
    def determine_match_quality(score, job_type):
        """
        Determine match quality with specific thresholds for each job type
        """
        if job_type.lower() == "technique":
            if score >= 80:
                return "Strong Match"
            elif score >= 65:
                return "Good Match"
            elif score >= 50:
                return "Potential Match"
            else:
                return "Weak Match"
                
        elif job_type.lower() == "fonctionnel":
            if score >= 75:
                return "Strong Match"
            elif score >= 60:
                return "Good Match"
            elif score >= 45:
                return "Potential Match"
            else:
                return "Weak Match"
                
        else:  # Technico-fonctionnel
            if score >= 85:
                return "Strong Match"
            elif score >= 70:
                return "Good Match"
            elif score >= 55:
                return "Potential Match"
            else:
                return "Weak Match"
    

    @staticmethod
    def validate_analysis(analysis):
        """Validate analysis response structure"""
        required_fields = {
            "general_score": str,
            "skills_score": str,
            "job_title_and_experience_score": str,
            "skills_gaps": list,
            "job_title_and_experience_gaps": list,
            "skills_match": list,
            "job_title_and_experience_match": list,
            "candidate_name": str,
            "general_strengths": list,
            "general_weaknesses": list
        }
        
        for field, field_type in required_fields.items():
            if field not in analysis:
                return False
            if not isinstance(analysis[field], field_type):
                return False
        
        return True
    
    @api_view(['GET'])
    @permission_classes([AllowAny])
    def analyze_tools_and_technologies_internal(request, job_id):
        """
        Analyze and extract tools and technologies from a job description
        """
        try:
            # Get the job from database
            job = get_object_or_404(Job, id=job_id)
            
            # Extract job information
            job_title = job.title
            job_description = job.description
            competence_phare = job.competence_phare
            
            # First, get the full job analysis if not already done
            try:
                job_analysis_response = JobView.analyze_job_description(request, job_id)
                job_analysis = job_analysis_response.data
                job_type = job_analysis["type_analyse"]["type_de_poste"]
                
                # Update job type etiquette if not already set
                if not job.job_type_etiquette:
                    job.job_type_etiquette = job_type
                    job.save()
                    
            except Exception as e:
                print(f"Error in job analysis: {str(e)}")
                job_type = job.job_type_etiquette or "Non déterminé"
            
            # Call the tools analysis
            tools = JobView.analyze_tools_and_technologies(job_title, job_description, competence_phare)
            
            # Return the results
            return Response({
                "job_id": job_id,
                "job_title": job_title,
                "job_type": job_type,
                "tools_and_technologies": tools
            })
            
        except Job.DoesNotExist:
            return Response({"error": "Job not found"}, status=404)
        except Exception as e:
            return Response({"error": str(e)}, status=500)

    @staticmethod
    def analyze_tools_and_technologies(job_title, job_description, competence_phare):
        """
        Helper function to analyze and extract tools and technologies using GPT-3.5 Turbo
        """
        try:
            if not os.getenv("OPENAI_API_KEY"):
                print("OpenAI API key is not set!")
                raise Exception("OpenAI API key is not configured")

            context = f"""
            Job Title: {job_title}
            Job Description: {job_description or "No description provided."}
            Key Skill (Competence Phare): {competence_phare or "No specific competence provided."}
            """
            
            prompt = f"""
            Based on the provided job information, analyze and identify exactly 10 most relevant technical tools, technologies, platforms, or software that would be required or beneficial for this specific role.

            Job Information:
            {context}

            Please consider:
            - Examine the job title, description, and key skills carefully
            - Identify specific tools, not general categories
            - Include version numbers or specific products where applicable
            - Focus on tools mentioned in the description
            - Add relevant industry-standard tools if fewer than 10 are mentioned

            Return ONLY a JSON response in this exact format:
            {{"Outils": ["Specific Tool 1", "Specific Tool 2", ...]}}

            Important:
            - Return exactly 10 specific tools
            - Include proper version numbers where relevant
            - List specific product names, not generic categories
            - Prioritize tools mentioned in the job details
            """

            print(f"Analyzing job: {job_title}")

            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a technical job analyzer. Return only valid JSON with exactly 10 specific tools based on the job information provided."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=1500,
                temperature=0.3,
                top_p=0.9,
                presence_penalty=0.1,
                frequency_penalty=0.1,
            )

            print("OpenAI API Response received")
            analysis_text = response.choices[0].message.content.strip()
            print(f"Raw API response: {analysis_text}")
            
            try:
                analysis = json.loads(analysis_text)
                tools = analysis.get("Outils", [])
                if not tools:
                    print("No tools found in analysis")
                    raise ValueError("No tools found in analysis")
                
                # Ensure exactly 10 tools with generic defaults
                if len(tools) < 10:
                    tools.extend([f"Industry Tool {i}" for i in range(len(tools) + 1, 11)])
                return tools[:10]
                    
            except json.JSONDecodeError as e:
                print(f"JSON parsing error: {e}")
                print(f"Failed to parse: {analysis_text}")
                return ["Error analyzing tools", "Please check job description"]
                    
        except Exception as e:
            print(f"Analysis error: {str(e)}")
            return ["Error in analysis", str(e)[:50]]
    

    #INDEXATION FOR THE QUERY ELASTICSEARCH
    @api_view(['GET', 'POST'])
    @permission_classes([AllowAny])
    def reindex_candidates(request):
        """
        Reindex all candidates
        """
        es_client = Elasticsearch(hosts=["http://localhost:9200"])
        
        try:
            # Delete existing index if it exists
            if es_client.indices.exists(index="candidates"):
                es_client.indices.delete(index="candidates")
            
            # Create new index with improved mapping
            mapping = {
                        "settings": {
                            "analysis": {
                                "analyzer": {
                                    "job_title_analyzer": {
                                        "type": "custom",
                                        "tokenizer": "standard",
                                        "filter": [
                                            "lowercase",
                                            "asciifolding",
                                            "word_delimiter_graph"
                                        ]
                                    }
                                }
                            }
                        },
                        "mappings": {
                            "properties": {
                                "candidate_id": {"type": "keyword"},
                                "name": {
                                    "type": "text",
                                    "fields": {"keyword": {"type": "keyword"}}
                                },
                                "job_title": {
                                    "type": "text",
                                    "analyzer": "job_title_analyzer",
                                    "fields": {
                                        "keyword": {"type": "keyword"},
                                        "raw": {"type": "keyword"}
                                    }
                                },
                                "detailed_experience": {
                                        "type": "nested",
                                        "properties": {
                                            "Title": {"type": "text"},
                                            "Period": {"type": "text"},
                                            "Description": {"type": "text"}
                                        }
                                    },
                            
                                "skills": {
                                    "type": "text",
                                    "analyzer": "job_title_analyzer"
                                },
                                "experience": {"type": "integer"},
                                "availability": {"type": "keyword"},
                                "mobility": {"type": "keyword"},
                                "status": {"type": "keyword"},
                                "technical_skills": {
                                    "type": "nested",
                                    "properties": {
                                        "name": {
                                            "type": "text",
                                            "analyzer": "job_title_analyzer",
                                            "fields": {
                                                "keyword": {"type": "keyword"},
                                                "raw": {"type": "keyword"}
                                            }
                                        },
                                        "level": {
                                            "type": "keyword"
                                        }
                                    }
                                },
                                "functional_skills": {
                                    "type": "nested",
                                    "properties": {
                                        "name": {
                                            "type": "text",
                                            "analyzer": "job_title_analyzer",
                                            "fields": {
                                                "keyword": {"type": "keyword"}
                                            }
                                        },
                                        "tools": {
                                            "type": "text",
                                            "analyzer": "job_title_analyzer",
                                            "fields": {
                                                "keyword": {"type": "keyword"}
                                            }
                                        },
                                        "domain": {
                                            "type": "keyword"
                                        }
                                    }
                                },
                                "contract_location": {
                                    "type": "keyword"
                                }
                            }
                        }
                    }
            
            # Create the index
            es_client.indices.create(index="candidates", body=mapping)
            
            # Get all candidates
            candidates = Candidate.objects.all()
            indexed_count = 0
            failed_candidates = []
            
            for candidate in candidates:
                try:
                    # Get full candidate info
                    candidate_info = prepare_candidate_info(candidate)
                    
                    # Prepare document
                    doc = {
                        "candidate_id": candidate.id,
                        "name": candidate.name,
                        "job_title": candidate.job_title or "Not Specified",
                        "skills": candidate_info.get("hard_skills", []) + candidate_info.get("soft_skills", []),
                        "experience": max(candidate.experience or 0, 0),
                        "experience_description": " ".join([
                                f"{exp.get('Title', '')} - {exp.get('Period', '')}: {exp.get('Description', '')}"
                                for exp in candidate_info.get("CandidateInfo", {}).get("Experience", [])
                            ]),   
                        "availability": candidate.availability,
                        "mobility": candidate.contract_location,
                        "status": candidate.status,
                        "detailed_experience" : candidate_info.get("CandidateInfo", {}).get("Experience", []),
                        
                    }
                    
                    # Index document
                    es_client.index(index="candidates", id=str(candidate.id), body=doc)
                    indexed_count += 1
                    print(f"Successfully indexed: {candidate.name}")
                    
                except Exception as e:
                    error_msg = str(e)
                    print(f"Failed to index {candidate.name}: {error_msg}")
                    failed_candidates.append({
                        "id": candidate.id,
                        "name": candidate.name,
                        "error": error_msg
                    })
            
            # Refresh index
            es_client.indices.refresh(index="candidates")
            
            return Response({
                "status": "success",
                "indexed_count": indexed_count,
                "total_candidates": candidates.count(),
                "failed_candidates": failed_candidates,
                "message": "Reindexing completed"
            })
            
        except Exception as e:
            return Response({
                "status": "error",
                "error": str(e),
                "error_type": type(e).__name__
            }, status=500)

    @api_view(['GET', 'POST'])
    @permission_classes([AllowAny])
    def get_index_status(request):
        """
        Get the current status of the Elasticsearch index
        """
        es_client = Elasticsearch(hosts=["http://localhost:9200"])
        
        try:
            # Check if index exists
            index_exists = es_client.indices.exists(index="candidates")
            
            if not index_exists:
                return Response({
                    "status": "not_found",
                    "message": "Candidates index does not exist",
                    "total_candidates_in_db": Candidate.objects.count()
                })

            # Get index stats
            stats = es_client.indices.stats(index="candidates")
            mapping = es_client.indices.get_mapping(index="candidates")
            
            # Get a sample of indexed documents
            sample_docs = es_client.search(
                index="candidates",
                body={"query": {"match_all": {}}, "size": 5}
            )

            return Response({
                "status": "success",
                "index_exists": True,
                "total_docs": stats["_all"]["total"]["docs"]["count"],
                "total_size_bytes": stats["_all"]["total"]["store"]["size_in_bytes"],
                "mapping": mapping,
                "sample_documents": [hit["_source"] for hit in sample_docs["hits"]["hits"]],
                "total_candidates_in_db": Candidate.objects.count()
            })

        except Exception as e:
            print(f"Status check error: {str(e)}")  # Debug print
            return Response({
                "status": "error",
                "error": str(e),
                "error_type": type(e).__name__
            }, status=500)
    
    @api_view(['PATCH'])
    @permission_classes([AllowAny])  # Adjust permission based on your requirements
    def update_job_keywords(request, job_id):
        """
        Update the keywords (technical skills, tools, etc.) for a specific job.
        """
        try:
            # Get the job from database
            job = Job.objects.get(pk=job_id)

            # Get the data from request (the same data format sent from frontend)
            data = request.data

            # Update all keywords based on payload
            job.technologies_core = data.get('technologies_core', [])
            job.outils_phares = data.get('outils_phares', [])
            job.competences_autres = data.get('competences_autres', [])
            job.responsabilites_principales = data.get('responsabilites_principales', [])
            
            # Save it
            job.save()

            # Return successful data update
            return Response({'message': 'Job keywords updated successfully'}, status=status.HTTP_200_OK)

        # Handling problems if doesn't find
        except Job.DoesNotExist:
            return Response({'error': 'Job not found'}, status=status.HTTP_404_NOT_FOUND)
        # Error of all kind
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
   
    #eLASTICSEARCH QUERY TO MAKE THE MATCH WITH JOB OFFRE AND CANDIDATES 
    @api_view(['POST','GET'])
    @permission_classes([AllowAny])
    def test_elasticsearch_matching(request, job_id):
        """
        Match candidates to a job offer based on job title, competence phare, description, and analyzed tools.
        """
        es_client = Elasticsearch(hosts=["http://localhost:9200"])
        try:
            EXCLUDED_TERMS = [
                "stagiaire", "intern", "étudiant", "student", "stage", "alternance", 
                "alternant", "auto formation", "autoformation", "formation", "école",
                "ecole", "university", "université", "college", "collège", "lycée",
                "lycee", "bachelor", "master 1", "master 2", "license", "licence"
            ]
            # Fetch job details
            job = get_object_or_404(Job, id=job_id)

            # Extract job details
            #job_title = job.title # Job's title
            competence_phare = job.competence_phare # Key skill required for the job
            job_description = job.description # Full job description text
            tools_and_technologies = JobView.analyze_tools_and_technologies(job.title, job_description, competence_phare)  #Tools/technologies extracted from job description

            # Prepare the Elasticsearch query
            base_query = {
                "query": {
                    "bool": {
                        "minimum_should_match": 1,
                        "should": [
                            {
                                "bool": {
                                    "must": [
                                        {
                                            "match": { # Match candidate's job title with the job title
                                                "job_title": { #candidate's job title
                                                    "query": job.title, # the job title of job
                                                    "boost": 2,
                                                    "fuzziness": "AUTO"
                                                    
                                                }
                                            }
                                        },
                                        {
                                            "match": {  # Match candidate's skills with the job's key skill= competence 
                                                "skills": {
                                                    "query": competence_phare,
                                                    "boost": 2.5,
                                                    "fuzziness": "AUTO"
                                                }
                                            }
                                        }
                                    ],
                                    "should": [
                                        {
                                            "match": { # Match tools from job with candidate's tools
                                                "tools_and_technologies": " ".join(tools_and_technologies),
                                                #"boost":2.5
                                            }
                                        },
                                        {
                                            "match": {# Match job title with candidate's detailed experience
                                                "detailed_experience": {
                                                    "query": job.title,
                                                    "boost": 2
                                                }
                                            }
                                        },
                                        {
                                            "match": {
                                                "detailed_experience": {# Match key skills= competence phare with candidate's detailed experience
                                                    "query": competence_phare,
                                                    "boost": 2
                                                }
                                            }
                                        },
                                        {
                                            "match": {
                                                "detailed_experience": { # Match tools with candidate's detailed experience
                                                    "query": " ".join(tools_and_technologies),
                                                    #"boost": 2.5
                                                }
                                            }
                                        }
                                    ],
                                    "boost": 2
                                }
                            },
                            {
                                "bool": { # Second set of mandatory conditions for additional matching logic
                                    "must": [
                                        {
                                            "match": {
                                                "skills": { #Match candidate's skills with the job title
                                                    "query": job.title,
                                                    "boost": 2.5
                                                }
                                            }
                                        },
                                        {
                                            "match": {
                                                "job_title": { # Match job title of C with the job's key skills =competence
                                                    "query": competence_phare,
                                                    "boost": 2
                                                }
                                            }
                                        }
                                    ],
                                    "should": [
                                        {
                                            "match": {
                                                "tools_and_technologies": " ".join(tools_and_technologies),
                                                #"boost": 2.5
                                            }
                                        },
                                        {
                                            "match": {
                                                "detailed_experience": {  # Match skills with candidate's detailed experience
                                                    "query": competence_phare,
                                                    "boost": 2
                                                }
                                            }
                                        }
                                    ],
                                    "boost": 2
                                }
                            }
                        ],
                       "must_not": [
                                    {
                                        "bool": {
                                            "should": [
                                                # Check in job title (case insensitive)
                                                {
                                                    "terms": {
                                                        "job_title.keyword": EXCLUDED_TERMS
                                                    }
                                                },
                                                # Check in job title with lowercase analyzer
                                                {
                                                    "terms": {
                                                        "job_title": EXCLUDED_TERMS
                                                    }
                                                },
                                                # Check in detailed experience
                                                {
                                                    "terms": {
                                                        "detailed_experience": EXCLUDED_TERMS
                                                    }
                                                },
                                                # Check for partial matches in job title
                                                {
                                                    "match": {
                                                        "job_title": {
                                                            "query": " ".join(EXCLUDED_TERMS),
                                                            "operator": "or"
                                                        }
                                                    }
                                                },
                                                # Additional check for education-related words
                                                {
                                                    "match": {
                                                        "job_title": {
                                                            "query": "formation académique diplôme",
                                                            "operator": "or"
                                                        }
                                                    }
                                                }
                                            ]
                                        }
                                    }
                                    
                                ],
                                # Add a must clause to ensure minimum experience
                                "must": [
                                    {
                                        "range": {
                                            "experience": {
                                                "gte": 0  # Ensure at least 2 years experience
                                            }
                                        }
                                    }
                                ]
                    }
                },
                "sort": [
                    {
                        "_score": {
                            "order": "desc"
                        }
                    }
                ],
                "_source": [
                    "candidate_id",
                    "name",
                    "job_title",
                    "skills",
                    "tools_and_technologies",
                    "experience",
                    "detailed_experience"  
                ],
                "size": 20
            }

            # Execute Elasticsearch query
            response = es_client.search(index="candidates", body=base_query)

            # Process and return the results
            results = {
                "job_info": {
                    "job_id": job_id,
                    "job_title": job.title,
                    "competence_phare": competence_phare,
                    "required_tools": tools_and_technologies
                },
                "matches": [],
                "total_matches": response["hits"]["total"]["value"]
            }

            for hit in response["hits"]["hits"]:
                candidate = hit["_source"]
                score = hit["_score"]
            
                match_quality = "Strong Match" if score > 8 else "Potential Match" if score > 5 else "Weak Match"

                candidate_info = {
                    "candidate_id": candidate["candidate_id"],
                    "name": candidate["name"],
                    "job_title": candidate["job_title"],
                    "skills": candidate.get("skills", []),
                    "tools": candidate.get("tools_and_technologies", []),
                    "experience": candidate.get("experience", 0),
                    "detailed_experience": candidate.get("detailed_experience", ""),  # Map from experience_description
                    "match_score": score,
                    "match_quality": match_quality
                }

                results["matches"].append(candidate_info)

            return Response(results)

        except Exception as e:
            return Response({"error": str(e)}, status=500)




    @api_view(['GET'])
    def job_list_client(request,id):
        """Display a list of all jobs."""
        jobs = Job.objects.filter(client_id=id).order_by('-added_at')
        job_list = [
            {
                'id' : job.id,
                'title' : job.title,
                'description' : job.description,
                'status': job.status  or "",
                'ownerRH' : job.recruiter.first_name+' '+job.recruiter.last_name,
                'opening_date': job.opening_date  or "",
                'deadline_date': job.deadline_date or "",  # Add this line
                

            }
        for job in jobs] 
        return JsonResponse(job_list, status=201, safe=False)
    
    @api_view(['GET'])
    def job_list(request):
        if(request.user.is_superuser):
            jobs = Job.objects.all()
        else:
            jobs = Job.objects.filter(recruiter_id=request.user.id)

        job_list = [
            {
                'idJob': job.id,
                'title': job.title,
                'status': job.status,
                'ownerRH': job.recruiter.first_name + ' ' + job.recruiter.last_name,
                'client': job.client.company if job.client else job.company,
                'image': base64.b64encode(job.client.image).decode('utf-8') if job.client else None,
                'idClient': job.client.id if job.client else None,
                'location': job.location or "",
                'nb_positions': job.nb_positions or "",
                'competence_phare': job.competence_phare or "",
                'job_type_etiquette': job.job_type_etiquette or "",
                'analysis_date': job.analysis_date.isoformat() if job.analysis_date else None
                
                
            } for job in jobs
        ]
        
        page_number = request.query_params.get('page', 1)
        per_page = request.query_params.get('per_page', 5)
        
        paginator = Paginator(job_list, per_page)
        page_obj = paginator.get_page(page_number)

        current_page = page_obj.number
        total_pages = paginator.num_pages
        page_range = list(paginator.get_elided_page_range(current_page, on_each_side=1, on_ends=1))

        data = {
            'items': list(page_obj.object_list),
            'current_page': current_page,
            'total_pages': total_pages,
            'page_range': page_range,
            'total_items': paginator.count
        }
        
        return Response(data)
    
    @api_view(['GET'])
    def get_job(request, id):
        try:
            job = Job.objects.get(pk=id)
        except Job.DoesNotExist:
            return Response({'error': 'job not found'}, status=status.HTTP_404_NOT_FOUND)
        try:
            ownerRH = job.recruiter
        except Recruiter.DoesNotExist:
            return Response({'error': 'recruiter not found'}, status=status.HTTP_404_NOT_FOUND)
        try:
            client = job.client
        except Client.DoesNotExist:
            return Response({'error': 'client not found'}, status=status.HTTP_404_NOT_FOUND)

        job_data = {
            'id_Job': id,
            'title': job.title,
            'description': job.description,
            'status': job.status,
            'location': job.location,
            'ownerRH': ownerRH.first_name + ' ' + ownerRH.last_name,
            'client': client.company if client else job.company,
            'budget': job.budget,
            'contract_start_date': job.contract_start_date,
            'contract_end_date': job.contract_end_date,
            'contact_person': job.contact_person,
            'contact_person_phone': job.contact_person_phone,
            'contact_person_email': job.contact_person_email,
            'nb_positions': job.nb_positions,
            'opening_date': job.opening_date,
            'deadline_date': job.deadline_date,  # Add this line
            'mission_time': job.mission_time, # ADD THIS LINE

            'competence_phare': job.competence_phare,
            'job_type_etiquette': job.job_type_etiquette,
            
            # Include stored analysis data
            'technologies_core': job.technologies_core,
            'outils_phares': job.outils_phares,
            'competences_autres': job.competences_autres,
            'responsabilites_principales': job.responsabilites_principales,
        }
        return JsonResponse(job_data, safe=False)
        
    @api_view(['POST'])
    def job_create(request, operation, id=None):
        data = request.data
        print("Received data:", data)
        
        try:
            if operation == "byId":
                client = Client.objects.get(pk=id)
            elif operation == "byClient":
                client = Client.objects.get(id=data['client'])
            else:
                return Response({'error': 'Invalid operation'}, status=status.HTTP_400_BAD_REQUEST)
                
            ownerRH = request.user
            job_title = data.get('job_title')
            job_description = data.get('job_description')
            competence_phare = data.get('competence_phare')

            # Create new job
            newJob = Job.objects.create(
                title=job_title,
                description=job_description,
                competence_phare=competence_phare,
                client=client,
                company=client.company,
                recruiter_id=ownerRH.id,
                mission_time = data.get('mission_time') # ADD THIS LINE

            )
             # Log the activity
            try:
                activity = Activity(
                    description=f"Added a new job: {newJob.title}",
                    job=newJob,
                    recruiter_id=request.user.id
                )
                activity.save()
                print("Activity log created")
            except Exception as e:
                print(f"Error creating activity log: {str(e)}")


            # Run initial job analysis
            try:
                # Create a dummy request object for the analysis
                dummy_request = HttpRequest()
                dummy_request.method = 'GET'
                
                # Run job description analysis
                job_analysis = JobView.analyze_job_description(dummy_request, newJob.id)
                analysis_data = job_analysis.data
                
                # Update job with analysis results
                newJob.job_type_etiquette = analysis_data["type_analyse"]["type_de_poste"]
                newJob.type_analyse_justification = analysis_data["type_analyse"]["justification"]
                newJob.repartition_responsabilites = analysis_data["type_analyse"]["repartition_responsabilites"]
                
                # Update specific fields based on job type
                if newJob.job_type_etiquette.lower() == "technique":
                    newJob.technologies_core = analysis_data.get("technologies_core", [])
                    newJob.technologies_avancees = analysis_data.get("technologies_avancees", [])
                    newJob.competences_autres = analysis_data.get("competences_autres", [])
                    newJob.technologies_core = analysis_data.get("technologies_core", [])
                    newJob.outils_phares = analysis_data.get("outils_phares", [])
                    newJob.competences_autres = analysis_data.get("competences_autres", [])
                    newJob.responsabilites_principales = analysis_data.get("responsabilites_principales", [])
                elif newJob.job_type_etiquette.lower() == "fonctionnel":
                    newJob.outils_phares = analysis_data.get("outils_phares", [])
                    newJob.competences_metier_fondamentales = analysis_data.get("competences_metier_fondamentales", [])
                    newJob.expertise_domaine_metier = analysis_data.get("expertise_domaine_metier", [])
                
                newJob.analysis_date = timezone.now()
                newJob.save()
                
            except Exception as e:
                print(f"Initial analysis error: {str(e)}")
                # Continue even if analysis fails
            
            job_data = {
                'id_Job': newJob.id,
                'title': newJob.title,
                'description': newJob.description,
                'status': newJob.status or '',
                'ownerRH': f"{ownerRH.first_name} {ownerRH.last_name}",
                'opening_date': newJob.opening_date or '',
                'deadline_date': newJob.deadline_date or "",  # Add this line
                'mission_time': newJob.mission_time, # ADD THIS LINE
                'client': client.company,
                'competence_phare': newJob.competence_phare,
                'job_type_etiquette': newJob.job_type_etiquette,
                'technologies_core': newJob.technologies_core,
                'outils_phares': newJob.outils_phares,
                'competences_autres': newJob.competences_autres,
                'responsabilites_principales': newJob.responsabilites_principales,
                'analysis_summary': {
                'type_de_poste': newJob.job_type_etiquette,
                'repartition_responsabilites': newJob.repartition_responsabilites
            } if newJob.job_type_etiquette else None  # Add this part
            }
            
            return JsonResponse(job_data, safe=False)
            
        except Client.DoesNotExist:
            return Response({'error': 'Client not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            print("Error creating job:", str(e))
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

           
    @api_view(['PATCH'])
    def job_update(request, pk):
        """Update an existing job."""
        job = get_object_or_404(Job, pk=pk)
        data = request.data  # Get the data from the request body

        # Check if request.data is a valid dictionary
        if not isinstance(data, dict):
            return Response({'error': 'Invalid data format. Expected a dictionary.'}, status=status.HTTP_400_BAD_REQUEST)

        # Validate and process data
        try:
            # Set values only if they are present in request data
            job.title = data.get('jobTitle', job.title)
            job.opening_date = data.get('openingDate', job.opening_date)
            job.deadline_date = data.get('deadlineDate', job.deadline_date)
            job.status = data.get('status', job.status)
            job.location = data.get('location', job.location)
            job.description = data.get('description', job.description)
            job.budget = data.get('budget', job.budget)
            job.contact_person = data.get('contact', job.contact_person)
            job.contact_person_phone = data.get('phone', job.contact_person_phone)
            job.contact_person_email = data.get('email', job.contact_person_email)
            job.nb_positions = data.get('nb_positions', job.nb_positions)
            #job.contract_start_date = data.get('start', job.contract_start_date)
            #job.contract_end_date = data.get('end', job.contract_end_date)
            job.competence_phare = data.get('competence_phare', job.competence_phare)
            job.job_type_etiquette = data.get('job_type_etiquette', job.job_type_etiquette)

            # *** Update Keywords ***
            job.technologies_core = data.get('technologies_core', job.technologies_core)
            job.outils_phares = data.get('outils_phares', job.outils_phares)
            job.competences_autres = data.get('competences_autres', job.competences_autres)
            job.responsabilites_principales = data.get('responsabilites_principales', job.responsabilites_principales)
            job.mission_time = data.get('missionTime', job.mission_time) # ADD THIS LINE

            job.last_modified_by_id = request.user.id if request.user.is_authenticated else None

            job.save()  # Save the updated job
            return Response({'message': 'Job updated successfully'}, status=status.HTTP_200_OK)  # Send success message
        except Exception as e:
            # Handle generic exceptions
            error_message = str(e)
            return Response({'error': error_message}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


    @api_view(['DELETE'])
    @permission_classes([IsAdminUser])
    def job_delete(request, pk):
        """Delete a job."""
        job = get_object_or_404(Job, id=pk)
        job.delete()
        return Response({'message': 'Job deleted successfully'}, status=status.HTTP_200_OK)
    



    @api_view(['POST','GET'])
    @permission_classes([AllowAny])
    def analyze_job_description(request, job_id):
        """
        Analyze a job description with improved type detection and categorization.
        """
        try:
            # Fetch job details
            job = get_object_or_404(Job, id=job_id)
            job_title = job.title
            job_description = job.description
            competence_phare = job.competence_phare

            # Improved type detection prompt
            type_detection_prompt = f"""
            ROLE: Expert en analyse de postes IT avec 15 ans d'expérience dans le recrutement technique.

            OBJECTIF:Classifier précisément un poste en Technique, Fonctionnel, ou Technico-Fonctionnel
            - Garantir une analyse cohérente et reproductible
            - Fournir une justification détaillée basée sur des critères mesurables

            RÈGLES DE CLASSIFICATION STRICTES:

            1. **FONCTIONNEL:**
            - Le poste est fonctionnel si:
                - Le titre contient des mots-clés comme "fonctionnel", "business analyst", "consultant métier", "Scrum Master", "Agile Coach".
                - Plus de **70% des responsabilités** concernent:
                - Analyse métier.
                - Gestion de projet.
                - Formation.
                - Rédaction de spécifications fonctionnelles pour guider les développeurs.
                - L'interaction principale est avec les **utilisateurs métier**.
                - L'expertise requise est **métier/processus**.
                - Le paramétrage d'outils comme SAP ou CRM est considéré comme fonctionnel.
            - Même si le poste inclut des aspects techniques mineurs, il reste **fonctionnel**.

            2. **TECHNIQUE:**
            - Le poste est technique si:
                - Le titre contient des mots-clés comme "développeur", "architecte", "administrateur".
                - Plus de **70% des responsabilités** concernent:
                - Développement, programmation, ou infrastructure.
                - Administration système.
                - L'interaction principale est avec les **équipes techniques**.
                - L'expertise principale est dans les **langages de programmation, frameworks, ou architecture**.
                - Il y a **peu ou pas d'interaction** avec les utilisateurs métier.

            3. **TECHNICO-FONCTIONNEL:**
            - Le poste est technico-fonctionnel uniquement si:
                - Il nécessite une expertise réelle en **développement/programmation** ET en **analyse métier**.
                - Les responsabilités sont réparties de manière équilibrée (**40-60%**) entre:
                - Développement technique.
                - Analyse fonctionnelle.
                - Le candidat doit pouvoir coder/développer ET analyser.

            IMPORTANT:
            - Le paramétrage d'outils (SAP, CRM) est toujours considéré comme FONCTIONNEL.
            - La rédaction de spécifications pour les développeurs est une tâche FONCTIONNELLE.
            - Collaborer avec une équipe technique ne rend pas un poste technico-fonctionnel.

            POSTE À ANALYSER:
            Titre: {job_title}
            Description: {job_description}
            Compétence Phare: {competence_phare}

            FORMAT DE RÉPONSE ATTENDU:
            {{
                "type_poste": "Fonctionnel / Technique / Technico-fonctionnel",
                "justification": ["Liste des éléments clés justifiant cette catégorisation"],
                "repartition_responsabilites": {{
                    "fonctionnelles": "pourcentage",
                    "techniques": "pourcentage"
                }}
            }}
            """

            # Get type analysis with improved criteria
            type_response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "Vous êtes un expert en analyse de postes IT. Analysez minutieusement selon les critères donnés."},
                    {"role": "user", "content": type_detection_prompt}
                ],
                max_tokens=1000,
                temperature=0,
                top_p=1,
                presence_penalty=0,
                frequency_penalty=0
            )

            # Parse type analysis
            type_result = json.loads(type_response.choices[0].message.content.strip())
            determined_type = type_result["type_poste"]
            type_justification = type_result["justification"]
            responsibilities_split = type_result["repartition_responsabilites"]

            # Select appropriate analysis prompt based on determined type
            if determined_type == "Technique":
                prompt = f"""
                Poste Technique:

                ROLE: Vous êtes un expert en analyse de descriptions de postes IT avec spécialisation en engineering et architecture. Votre tâche est d'extraire et structurer les informations clés d'une description de poste selon les critères suivants.

                OBJECTIF: Analyser la description du poste pour en extraire les informations essentielles de manière structurée, permettant une mise en correspondance ultérieure avec des profils de candidats.

                RÈGLES D'ANALYSE:
                1. Technologies Core (Obligatoires):
                - Uniquement les technologies/outils explicitement mentionnés comme requis ET La compétence principale mentionnée dans le titre du poste
                    - Exemples: "Java", "Python", "AWS", "Docker"
                2. Technologies Avancées (Obligatoires):
                - Technologies spécialisées ou avancées explicitement requises
                - Concepts techniques complexes
                - Exemples: "Kubernetes en production", "Architectures microservices", "ML/AI"
                3. Compétences Autres:
                - Compétences techniques non liées aux outils, Méthodologies, Concepts métier requis, et Certifications requises
                4. Compétences Complémentaires:
                - Uniquement les éléments marqués comme: "un plus", "serait un plus", "apprécié", "préférable", nice to have", etc
                5. Responsabilités Principales:
                - Extraire UNIQUEMENT les tâches/responsabilités explicitement mentionnées
                - Conserver le niveau de détail original
                - Ne pas combiner ou interpréter les responsabilités.

                DESCRIPTION DU POSTE À ANALYSER:
                Titre: {job_title}
                Description: {job_description}
                Compétence Phare: {competence_phare}

                FORMAT DE SORTIE ATTENDUE EN JSON:
                {{
                    "intitule_de_poste": "string",
                    "experience_requise": "string | null",
                    "localisation": "string | Non spécifiée",
                    "technologies_core": ["string"],
                    "technologies_avancees": ["string"],
                    "competences_autres": ["string"],
                    "competences_complementaires": ["string"],
                    "responsabilites_principales": ["string"]
                }}
                """
            elif determined_type == "Fonctionnel":
                prompt = f"""
                Poste fonctionnel:

                ROLE: Vous êtes un expert en analyse de postes fonctionnels IT avec spécialisation en business analysis. Votre mission est d'extraire et structurer les informations clés selon les critères suivants.

                OBJECTIF: Analyser la description du poste pour en extraire les informations essentielles liées aux aspects fonctionnels et métier, permettant une mise en correspondance ultérieure avec des profils de candidats.

                RÈGLES D'ANALYSE:
                1. Outils Phares:
                - Uniquement les outils/solutions explicitement mentionnés comme requis
                    #Exemples: SAP, Oracle, Salesforce, Microsoft Dynamics, JIRA, MS Project  
                - L'outil phare ou compétence phare mentionnée dans le titre du poste.
                2. Compétences Métier Fondamentales:
                - Compétences fonctionnelles explicitement requises
                    #Exemples: Gestion de projet, Analyse des besoins, Animation d'ateliers, Rédaction de spécifications

                3. Expertise Domaine Métier:
                - Connaissances sectorielles requises
                - Processus métier spécifiques
                    #Exemples: Finance de marché, Supply Chain, RH, Comptabilité
                4. Compétences Complémentaires:
                - Uniquement les éléments marqués comme: "un plus", "serait un plus", "apprécié", "préférable", nice to have", etc
                5. Responsabilités Principales:
                - Extraire uniquement les responsabilités fonctionnelles explicites
                - Format: verbe d'action + description claire
                    #Exemples: "Analyser les besoins métier des utilisateurs", "Rédiger les spécifications fonctionnelles".

                DESCRIPTION DU POSTE À ANALYSER:
                Titre: {job_title}
                Description: {job_description}
                Compétence Phare: {competence_phare}

                FORMAT DE SORTIE ATTENDUE JSON:
                {{
                    "intitule_de_poste": "string",
                    "experience_requise": "string | null",
                    "localisation": "string | Non spécifiée",
                    "outils_phares": ["string"],
                    "competences_metier_fondamentales": ["string"],
                    "expertise_domaine_metier": ["string"],
                    "competences_complementaires": ["string"],
                    "responsabilites_principales": ["string"]
                }}
                """
            else:  # Technico-fonctionnel
                prompt = f"""
                Poste Technico-fonctionnel:

                ROLE: Vous êtes un expert en analyse de descriptions de postes IT hybrides avec double compétence technique et fonctionnelle avec 15 ans d'expérience. Votre mission est d'extraire et catégoriser précisément les aspects techniques et fonctionnels.

                OBJECTIF: Analyser une description de poste IT pour en extraire et catégoriser toutes les compétences et responsabilités, en distinguant clairement les aspects techniques et fonctionnels.

                RÈGLES D'ANALYSE:
                1. ASPECTS FONCTIONNELS:
                A. Outils Phares Fonctionnels:
                - Solutions métier explicitement requises
                B. Compétences Métier Fondamentales:
                - Savoir-faire fonctionnel explicite
                C. Expertise Domaine Métier:
                - Connaissances sectorielles et Processus métier spécifiques

                2. ASPECTS TECHNIQUES:
                A. Technologies Core:
                - Technologies de base requises
                B. Technologies Avancées:
                - Compétences techniques spécialisées

                3. COMPÉTENCES COMPLÉMENTAIRES:
                - Clairement séparées en:
                A. Techniques
                B. Fonctionnelles
                - Uniquement les éléments marqués comme: "un plus", "serait un plus", "apprécié", "préférable", nice to have", etc

                4. RESPONSABILITÉS:
                A. Techniques
                B. Fonctionnelles

                DESCRIPTION DU POSTE À ANALYSER:
                Titre: {job_title}
                Description: {job_description}
                Compétence Phare: {competence_phare}

                FORMAT DE SORTIE ATTENDUE EN JSON:
                {{
                    "intitule_de_poste": "string",
                    "experience_requise": "string | null",
                    "localisation": "string | Non spécifiée",
                    "outils_phares_fonctionnels": ["string"],
                    "competences_metier_fondamentales": ["string"],
                    "expertise_domaine_metier": ["string"],
                    "technologies_core": ["string"],
                    "technologies_avancees": ["string"],
                    "competences_complementaires_techniques": ["string"],
                    "competences_complementaires_fonctionnelles": ["string"],
                    "responsabilites_techniques": ["string"],
                    "responsabilites_fonctionnelles": ["string"]
                }}
                """

            # Get detailed analysis
            analysis_response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "Vous êtes un expert en analyse de postes IT. Retournez uniquement un JSON valide en français selon le format spécifié."},
                    {"role": "user", "content": prompt}
                ],
               max_tokens=1000,
                temperature=0,
                top_p=1,
                presence_penalty=0,
                frequency_penalty=0
            )

            # Parse and format final response
            # Parse the AI response
            try:
                    type_result = json.loads(type_response.choices[0].message.content.strip())
                    type_poste = type_result["type_poste"]
                    type_justification = type_result["justification"]
                    repartition_responsabilites = type_result["repartition_responsabilites"]

                    # Parse the detailed analysis response
                    analysis_result = json.loads(analysis_response.choices[0].message.content.strip())

                    # Parse common fields explicitly
                    intitule_de_poste = analysis_result["intitule_de_poste"]
                    experience_requise = analysis_result["experience_requise"]
                    localisation = analysis_result["localisation"]

                    # Build base result
                    final_result = {
                        "type_analyse": {
                            "type_de_poste": type_poste,
                            "justification": type_justification,
                            "repartition_responsabilites": repartition_responsabilites,
                        },
                        "intitule_de_poste": intitule_de_poste,
                        "experience_requise": experience_requise,
                        "localisation": localisation,
                    }

                    # Parse type-specific fields explicitly
                    if type_poste == "Technique":
                        technologies_core = analysis_result["technologies_core"]
                        technologies_avancees = analysis_result["technologies_avancees"]
                        competences_autres = analysis_result["competences_autres"]
                        competences_complementaires = analysis_result["competences_complementaires"]
                        responsabilites_principales = analysis_result["responsabilites_principales"]
                        
                        final_result.update({
                            "technologies_core": technologies_core,
                            "technologies_avancees": technologies_avancees,
                            "competences_autres": competences_autres,
                            "competences_complementaires": competences_complementaires,
                            "responsabilites_principales": responsabilites_principales
                        })

                    elif type_poste == "Fonctionnel":
                        outils_phares = analysis_result["outils_phares"]
                        competences_metier = analysis_result["competences_metier_fondamentales"]
                        expertise_domaine = analysis_result["expertise_domaine_metier"]
                        competences_complementaires = analysis_result["competences_complementaires"]
                        responsabilites_principales = analysis_result["responsabilites_principales"]
                        
                        final_result.update({
                            "outils_phares": outils_phares,
                            "competences_metier_fondamentales": competences_metier,
                            "expertise_domaine_metier": expertise_domaine,
                            "competences_complementaires": competences_complementaires,
                            "responsabilites_principales": responsabilites_principales
                        })

                    else:  # Technico-fonctionnel
                        outils_phares = analysis_result["outils_phares_fonctionnels"]
                        competences_metier = analysis_result["competences_metier_fondamentales"]
                        expertise_domaine = analysis_result["expertise_domaine_metier"]
                        technologies_core = analysis_result["technologies_core"]
                        technologies_avancees = analysis_result["technologies_avancees"]
                        comp_techniques = analysis_result["competences_complementaires_techniques"]
                        comp_fonctionnelles = analysis_result["competences_complementaires_fonctionnelles"]
                        resp_techniques = analysis_result["responsabilites_techniques"]
                        resp_fonctionnelles = analysis_result["responsabilites_fonctionnelles"]
                        
                        final_result.update({
                            "outils_phares_fonctionnels": outils_phares,
                            "competences_metier_fondamentales": competences_metier,
                            "expertise_domaine_metier": expertise_domaine,
                            "technologies_core": technologies_core,
                            "technologies_avancees": technologies_avancees,
                            "competences_complementaires_techniques": comp_techniques,
                            "competences_complementaires_fonctionnelles": comp_fonctionnelles,
                            "responsabilites_techniques": resp_techniques,
                            "responsabilites_fonctionnelles": resp_fonctionnelles
                        })

                    # Add warning if type detection indicates a mismatch
                    if type_poste == "Technico-fonctionnel" and \
                    float(repartition_responsabilites["fonctionnelles"].rstrip('%')) > 70:
                        final_result["type_analyse"]["warning"] = "Le poste présente une forte dominante fonctionnelle"


                    return Response(final_result, status=200)

            except KeyError as e:
                    return Response({
                        "error": f"Missing field in AI response: {e}",
                        "raw_response": analysis_response.choices[0].message.content
                    }, status=500)

            except json.JSONDecodeError:
                    return Response({
                        "error": "Invalid JSON response",
                        "raw_response": analysis_response.choices[0].message.content
                    }, status=500)

        except Job.DoesNotExist:
                return Response({"error": "Job not found"}, status=404)

        except Exception as e:
                return Response({"error": str(e)}, status=500)
        
    

   
    @api_view(['POST', 'GET'])
    @permission_classes([AllowAny])
    def analyze_candidate_cv_with_job(request, job_id):
        """
        Analyze CVs of selected candidates matched to a job based on the job description.
        Integrates job-specific fields and performs a detailed analysis for each candidate.
        """
        try:
            # Get selected candidate IDs from request body
            candidate_ids = request.data.get('candidate_ids', [])
            if not candidate_ids:
                return Response({"error": "No candidate IDs provided"}, status=400)

            # Convert DRF Request to Django HttpRequest
            factory = RequestFactory()
            django_request = factory.get(request.path, data=request.query_params)
            django_request.user = request.user

            # Fetch job details
            job = get_object_or_404(Job, id=job_id)
            job_title = job.title
            job_description = job.description
            competence_phare = job.competence_phare
            job_type = job.job_type_etiquette or "Non déterminé"

            # Initialize analysis results list
            analysis_results = []

            # Connect to MongoDB to retrieve CV data
            mongo_client = MongoClient(settings.MONGODB_URI)
            db = mongo_client[settings.MONGODB_NAME]
            resumes_collection = db['resumes']

            # Process each selected candidate
            for candidate_id in candidate_ids:
                try:
                    # Get candidate from database
                    candidate = get_object_or_404(Candidate, id=candidate_id)
                    json_id = candidate.resume_json_updated_id or candidate.resume_json_id

                    # Retrieve resume JSON data
                    document = resumes_collection.find_one(
                        {'_id': ObjectId(json_id)},
                        {'Resume_data': 1}
                    )
                    if not document or 'Resume_data' not in document:
                        raise ValueError(f"Resume data not found for candidate ID: {candidate_id}")

                    resume_data = document['Resume_data']

                    # Validate and truncate resume data if too large
                    resume_data_str = json.dumps(resume_data, indent=2)
                    if len(resume_data_str) > 3000:
                        resume_data_str = resume_data_str[:3000] + "\n... (truncated)"
                    
                    system_prompt = """Follow these five instructions below in all your responses:
                    1. Use English language only
                    2. Use English alphabet whenever possible
                    4. Avoid non-English alphabets whenever possible
                    5. Translate any other language to English whenever possible
                    6. CALCULATE NUMERICAL PERCENTAGES for all score fields - not text descriptions
                    7. Return scores as percentages with "%" symbol (e.g., "85%")
                    8. ALWAYS return years_of_experience as NUMBER + "year" or "years" (e.g., "5 years", "1 year")


                    You are an IT recruitment expert, specialized in analyzing resumes. You must return only valid JSON objects."""

                    # Build the analysis prompt
                    analysis_prompt = f"""
                    DESCRIPTION DU POSTE:
                    Titre: {job_title}
                    Description: {job_description or "Non spécifiée"}
                    Compétence Phare: {competence_phare or "Non spécifiée"}
                    Type de Poste: {job_type}

                    INFORMATIONS DU CANDIDAT:
                    {resume_data_str}

                    Règles pour la réponse :
                    1. Retournez uniquement une réponse JSON valide.
                    2. Le format attendu est :
                    {JobView.JobView.get_prompt_template(job_type.lower())}

                    IMPORTANT : Ne retournez rien d'autre que ce format JSON valide.
                    """

                    # Call OpenAI API
                    response = client.chat.completions.create(
                        model="gpt-3.5-turbo",
                        messages=[
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": analysis_prompt}
                        ],
                        max_tokens=1000,
                temperature=0,
                top_p=1,
                presence_penalty=0,
                frequency_penalty=0
                    )

                    response_text = response.choices[0].message.content.strip()
                    if not response_text:
                        raise ValueError(f"OpenAI API returned an empty response for candidate ID: {candidate_id}")

                    # Parse and validate the response
                    try:
                        analysis = json.loads(response_text)
                    except json.JSONDecodeError as e:
                        raise ValueError(f"OpenAI returned invalid JSON for candidate ID: {candidate_id}")

                    if not JobView.validate_analysis(analysis):
                        raise ValueError(f"Invalid analysis structure for candidate ID: {candidate_id}")

                    # Get Elasticsearch score for this candidate
                    # You might want to store this score when initially matching or recalculate it here
                    elastic_score = 0  # Default value, replace with actual score calculation if needed

                    # Calculate final score
                    final_score = JobView.calculate_final_score(analysis, elastic_score, job_type)

                    # Determine match quality
                    match_quality = JobView.determine_match_quality(final_score, job_type)

                    # Combine results for the candidate
                    analysis_results.append({
                        "id": candidate_id,  # Make sure to include this for frontend reference
                        "candidate_id": candidate_id,
                        "name": candidate.name,
                        "elastic_match_score": elastic_score,
                        "match_quality": match_quality,
                        "cv_analysis": analysis,
                        "final_score": f"{final_score}%"
                    })

                except Exception as e:
                    analysis_results.append({
                        "candidate_id": candidate_id,
                        "error": str(e),
                        "status": "failed"
                    })

            # Close MongoDB connection
            mongo_client.close()

            # Return final analysis results
            return Response({
                "job_info": {
                    "job_id": job_id,
                    "job_title": job_title,
                    "competence_phare": competence_phare,
                    "job_type": job_type
                },
                "total_candidates_analyzed": len(analysis_results),
                "analyses": analysis_results
            })

        except Exception as e:
            return Response({"error": "Analysis failed", "details": str(e)}, status=500)
    class JobView:
        @staticmethod
        def get_prompt_template(job_type):
            base_instruction = """
                                When evaluating candidates, prioritize relevant experience in the required domain (80% weight) over listed skills (20% weight).
                                Experience evaluation should focus on:
                                - Direct experience in the same domain/industry
                                - Similar contexts and responsibilities
                                - Depth and recency of relevant experience
                                - Leadership and project scope in relevant domain
                                """
            if job_type == "technique":
                return base_instruction + """
                {
                    "general_score": "Calculate overall percentage match",
                    "skills_score": "Calculate based on technical skills match (20% weight)",
                    "job_title_and_experience_score": "Calculate based on title and experience match (80% weight)",
                    "skills_gaps": [
                        "List each missing technical skill",
                        "List each insufficient technical competency"
                    ],
                    "job_title_and_experience_gaps": [
                        "Detail any title mismatches",
                        "Detail any experience shortfalls"
                    ],
                    "other_gaps": [
                        "List any other missing requirements"
                    ],
                    "skills_match": [
                        "List each matching technical skill",
                        "List each validated competency"
                    ],
                    "job_title_and_experience_match": [
                        "Detail matching titles",
                        "Detail relevant experience"
                    ],
                    "candidate_name": "Extract full name",
                    "general_strengths": [
                        "Write detailed strengths of the candidate regarding the post"
                    ],
                    "general_weaknesses": [
                        "Write detailed weaknesses of the candidate regarding the post"
                    ],
                    "estimated_age": "Estimate based on career timeline",
                    "location": "Extract candidate location",
                    "years_of_experience": "Estimate total years of experience, without counting internships, ALWAYS return years_of_experience as NUMBER + "year" or "years" (e.g., "5 years", "1 year")",
                    "email": "Extract email",
                    "phone": "Extract phone"
                }
                """
            elif job_type == "fonctionnel":
                return """
                {
                    "general_score": "Calculate overall percentage match",
                    "skills_score": "Calculate based on functional skills match (20% weight)",
                    "job_title_and_experience_score": "Calculate based on title and experience match (80% weight)",
                    "skills_gaps": [
                        "List each missing functional skill",
                        "List each insufficient business process competency",
                        "List each missing methodology knowledge"
                    ],
                    "job_title_and_experience_gaps": [
                        "Detail any functional title mismatches",
                        "Detail any functional experience shortfalls",
                        "Detail any required experience gaps"
                    ],
                    "other_gaps": [
                        "List any other missing requirements",
                        "List soft skills gaps",
                        "List domain knowledge gaps"
                    ],
                    "skills_match": [
                        "List each matching functional skill",
                        "List each validated business process competency",
                        "List each validated methodology expertise"
                    ],
                    "job_title_and_experience_match": [
                        "Detail matching functional titles",
                        "Detail relevant required experience",
                        "Detail relevant project management experience"
                    ],
                    "candidate_name": "Extract full name",
                    "general_strengths": [
                        "Write detailed functional and business process strengths",
                        "Write detailed project and methodology strengths"
                    ],
                    "general_weaknesses": [
                        "Write detailed functional and business process weaknesses",
                        "Write detailed project and methodology weaknesses"
                    ],
                    "estimated_age": "Estimate based on career timeline",
                    "location": "Extract candidate location",
                    "years_of_experience": "Estimate total years of experience, without counting internships, ALWAYS return years_of_experience as NUMBER + "year" or "years" (e.g., "5 years", "1 year")",
                    "email": "Extract email",
                    "phone": "Extract phone"
                }
                """
            else:  # technico-fonctionnel
                return """
                {
                    "general_score": "Calculate overall percentage match",
                    "skills_score": "Calculate based on combined technical and functional skills match (20% weight)",
                    "job_title_and_experience_score": "Calculate based on title and experience match (80% weight)",
                    "skills_gaps": [
                        "List each missing technical skill",
                        "List each missing functional skill",
                        "List each insufficient hybrid competency"
                    ],
                    "job_title_and_experience_gaps": [
                        "Detail any hybrid role title mismatches",
                        "Detail any technical experience shortfalls",
                        "Detail any functional experience shortfalls"
                    ],
                    "other_gaps": [
                        "List any missing technical-business liaison capabilities",
                        "List any missing project management requirements",
                        "List any missing required competency"
                    ],
                    "skills_match": [
                        "List each matching technical skill",
                        "List each matching functional skill",
                        "List each validated hybrid competency"
                    ],
                    "job_title_and_experience_match": [
                        "Detail matching hybrid role titles",
                        "Detail relevant technical-functional experience",
                        "Detail relevant project bridging experience"
                    ],
                    "candidate_name": "Extract full name",
                    "general_strengths": [
                        "Write detailed technical strengths",
                        "Write detailed functional strengths",
                        "Write detailed hybrid role strengths"
                    ],
                    "general_weaknesses": [
                        "Write detailed technical weaknesses",
                        "Write detailed functional weaknesses",
                        "Write detailed hybrid role weaknesses"
                    ],
                    "estimated_age": "Estimate based on career timeline",
                    "location": "Extract candidate location",
                    "years_of_experience": "Estimate total years of experience, without counting internships, ALWAYS return years_of_experience as NUMBER + "year" or "years" (e.g., "5 years", "1 year")",
                    "email": "Extract email",
                    "phone": "Extract phone"
                }
                """
    
    