# job_matching_utils.py (new file)
from typing import Dict
from .models import Job
from Candidate.models import Candidate
from openai import OpenAI
import json
import os
from pymongo import MongoClient
from django.conf import settings
from bson import ObjectId

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def prepare_candidate_info(candidate: Candidate) -> Dict:
    """Prepare candidate information from MongoDB and PostgreSQL."""
    try:
        # Connect to MongoDB
        client = MongoClient(settings.MONGODB_URI)
        db = client[settings.MONGODB_NAME]
        resumes_json_collection = db.resumes

        # Get resume data from MongoDB
        resume_json_id = candidate.resume_json_updated_id or candidate.resume_json_id
        object_id = ObjectId(resume_json_id)
        
        # Find the document
        document = resumes_json_collection.find_one(
            {'_id': object_id}, 
            {'_id': 0, 'Resume_data': 1}
        )
        
        resume_data = document.get('Resume_data', {}) if document else {}

        # Prepare candidate info
        candidate_info = {
            "candidate_id": candidate.id,
            "name": candidate.name,
            "job_title": candidate.job_title,
            "experience": candidate.experience,
            "availability": candidate.availability,
            "mobility": candidate.mobility,
            "contract_location": candidate.contract_location,
            "contract_type": candidate.contract_type,
            "salary_expectation": candidate.salary_expectation,
            "resume_data": resume_data
        }

        # Extract skills from resume_data if available
        if resume_data:
            candidate_info["hard_skills"] = resume_data.get("CandidateInfo", {}).get("Hard Skills", [])
            candidate_info["soft_skills"] = resume_data.get("CandidateInfo", {}).get("Soft Skills", [])
            
            # Extract experience details
            experience = resume_data.get("CandidateInfo", {}).get("Experience", [])
            if experience:
                candidate_info["detailed_experience"] = experience

        return candidate_info

    except Exception as e:
        print(f"Error preparing candidate info: {str(e)}")
        # Return basic info if MongoDB fetch fails
        return {
            "candidate_id": candidate.id,
            "name": candidate.name,
            "job_title": candidate.job_title,
            "experience": candidate.experience,
            "availability": candidate.availability,
            "mobility": candidate.mobility,
            "contract_location": candidate.contract_location,
            "contract_type": candidate.contract_type,
            "salary_expectation": candidate.salary_expectation,
        }
    finally:
        client.close()

def analyze_job_type(job_description: str) -> str:
    """Determine if the job is technical, functional, or hybrid using OpenAI."""
    messages = [
        {"role": "system", "content": "Analyze the job description and classify it as 'technical', 'functional', or 'hybrid'."},
        {"role": "user", "content": job_description}
    ]
    
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=messages,
        temperature=0.2
    )
    return response.choices[0].message.content.strip().lower()

def extract_job_keywords(job: Job) -> Dict:
        """Extract keywords based on job type."""
        job_type = analyze_job_type(job.description)
        
        # Prepare the prompt based on your template
        if job_type == "technical":
            prompt_template = """Extract technical keywords as JSON:
            {
                "type_de_poste": "technique",
                "intitule_de_poste": "",
                "competences_cles_prioritaires_Techniques": {
                    "core_technologies": [],
                    "advanced_capabilities": []
                },
                "competences_cles_prioritaires_other": [],
                "competences_complementaires": [],
                "responsabilites_principales": [],
                "experience_requise": "",
                "localisation": ""
            }"""
        else:
            prompt_template = """Extract functional keywords as JSON:
            {
                "intitule_de_poste": "",
                "competences_cles_prioritaires_Fonctionnelles": {
                    "outils_Phares": [],
                    "core_skills": [],
                    "domain_expertise": []
                },
                "competences_complementaires": [],
                "responsabilites_principales": [],
                "experience_requise": "",
                "localisation": ""
            }"""

        messages = [
            {"role": "system", "content": prompt_template},
            {"role": "user", "content": job.description}
        ]
        
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=messages,
            temperature=0.2
        )
        
        return json.loads(response.choices[0].message.content)

def calculate_match_score(candidate_info: Dict, job_requirements: Dict) -> Dict:
        """Calculate matching score using your 20/80 logic."""
        messages = [
            {"role": "system", "content": """
            Analyze the match between candidate and job requirements using this scoring:
            
            Skills Score (20%):
            - Technical/Functional skills alignment
            - Tools and technologies match
            - Domain expertise
            
            Experience & Position Score (80%):
            - Job title relevance
            - Years of experience
            - Professional background
            
            Return a JSON with:
            {
                "skills_score": float,  # Out of 20
                "experience_score": float,  # Out of 80
                "total_score": float,  # Total percentage
                "matching_points": [],
                "gaps": [],
                "recommendation": "Highly Recommended/Recommended/Not Recommended"
            }
            """},
            {"role": "user", "content": f"""
            Job Requirements:
            {json.dumps(job_requirements)}
            
            Candidate Profile:
            {json.dumps(candidate_info)}
            """}
        ]
        
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=messages,
            temperature=0.2,
            top_p=0.9

        )
        
        return json.loads(response.choices[0].message.content)