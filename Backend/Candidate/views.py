# from django.shortcuts import render, redirect
# from .forms import CandidateForm
# from .models import Candidate
from pymongo import MongoClient
from django.conf import settings
from django.contrib.auth.hashers import make_password
from rest_framework import status
from django.core.exceptions import BadRequest
from django.utils.dateparse import parse_date
import google.generativeai as genai
import io
from NoteCandidate.models import NoteCandidate
from Activity.models import Activity
from Notification.models import Notification
from django.core.paginator import Paginator
from rest_framework.permissions import AllowAny

from django.shortcuts import render
from rest_framework.views import APIView
from . models import *
from rest_framework.response import Response
from . serializer import *
import json
from bson import ObjectId
import gridfs
from django.http import HttpResponse
from rest_framework.decorators import api_view,permission_classes
from django.contrib.auth.decorators import login_required
from rest_framework.permissions import IsAdminUser
from django.views.decorators.csrf import csrf_exempt
from django.core.mail import send_mail
from django.conf import settings
from rest_framework_simplejwt.tokens import RefreshToken
from .verification import decrypt_token,create_html_template
from django.http import HttpResponseRedirect
from django.core.files.base import ContentFile
from django.http import JsonResponse
import base64
import itertools
import pdfplumber
from datetime import datetime
from django.utils import timezone
from django.shortcuts import get_object_or_404
from elasticsearch_config import Elasticsearch
import os
from openai import OpenAI
from django.db.models import Q

openai_client = OpenAI(api_key=os.environ['OPENAI_API_KEY'])
es_client = Elasticsearch(hosts=["http://localhost:9200"])

class CandidateView(APIView):
    def __init__(self):
        self.serializer_class = CandidateSerializer
        self.client = MongoClient(settings.MONGODB_URI)
        self.db = self.client[settings.MONGODB_NAME]
        self.resumes_collection = self.db.resumes
        self.resumes_file_collection = self.db.Resume_file
        self.openai_client = OpenAI(api_key=os.environ['OPENAI_API_KEY'])


        client = MongoClient(settings.MONGODB_URI)


    @api_view(['POST'])
    def assign_candidate(request, candidate_id):
        try:
            recruiter_id = request.data.get('recruiter_id')
            if not recruiter_id:
                return Response({'error': 'Recruiter ID is required'}, status=status.HTTP_400_BAD_REQUEST)

            # Get candidate and recruiter
            candidate = get_object_or_404(Candidate, id=candidate_id)
            recruiter = get_object_or_404(Recruiter, id=recruiter_id)

            # Assign recruiter to candidate
            candidate.recruiter = recruiter
            candidate.stage = 'preselected'  # Mettre à jour le stage
            candidate.save()

            return Response({
                'message': 'Candidate assigned successfully',
                'candidate_id': candidate_id,
                'recruiter_id': recruiter_id
            }, status=status.HTTP_200_OK)

        except Candidate.DoesNotExist:
            return Response({'error': 'Candidate not found'}, status=status.HTTP_404_NOT_FOUND)
        except Recruiter.DoesNotExist:
            return Response({'error': 'Recruiter not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    # @api_view(['POST' , 'GET'])
    # @csrf_exempt
    # def post_cv(request):
    #     if request.method == 'POST':
    #         print("post method")
    #         client = MongoClient(settings.MONGODB_URI)
    #         db = client[settings.MONGODB_NAME]
    #         resumes_collection = db.Resume_file
    #         resumes_json_collection = db.resumes
    #         file_content = request.data.get('fileContents')
    #         #print('file_content=========',file_content)

    #         if not file_content:
    #             raise BadRequest("No file content was provided.")
    #         print("tyyyype=====",type(file_content))
    #         for file in file_content:
    #         # Extract the Base64 data from the data URL (if using readAsDataURL)

    #                 # Find the Base64-encoded data
    #             base64_data = file.split(',')
    #             binary_data = base64.b64decode(base64_data)


    #             # You can now save the file to a model or process it as needed.
    #             # with open("uploaded_file.pdf", "wb") as f:
    #             #     f.write(pdf_file.read())
    #             # print('pdf file content:::: ',pdf_file)

    #             resume_data = {
    #                 'resume_file': base64_data,
    #                 'created_at': datetime.datetime.now()
    #             }
    #             result = resumes_collection.insert_one(resume_data)
    #             #Load JSON data from file
    #             with open(r"C:\Users\gasso\Downloads\test.json", 'r') as file:
    #                 json_content = json.load(file)

    #             if isinstance(json_content, dict):
    #                 # Insert one document if json_data is a single document
    #                 print('oneee')
    #                 json_data = {
    #                 'Resume_data': json_content,
    #                 'created_at': datetime.datetime.now()
    #             }
    #                 result_json=resumes_json_collection.insert_one(json_data)
    #             else:
    #                 raise ValueError("JSON data should be a dictionary or list of dictionaries.")


    #             resume_id = result.inserted_id
    #             resume_json_id = result_json.inserted_id
    #             print('resume_id===',resume_id)
    #             print('resume_json_id===',resume_json_id)
    #             # Save the resume_json_id to the candidate and save to PostgreSQL
    #             candidate = Candidate()
    #             candidate.name = json_content['name']
    #             candidate.resume_json_id = str(resume_json_id)
    #             candidate.resume_file_id = str(resume_id)
    #             candidate.save()

    #         return JsonResponse({"message": "File uploaded and saved successfully"})
    #     elif request.method == 'GET':
    #         print("get method")
    #         with open(r"C:\Users\gasso\Downloads\Fatma-Ben-Lakhdhar-CV (5).json", 'r') as file:
    #                 document = json.load(file)
    #     if document:
    #         # file_data = document.get('Resume_data')  # Adjust this based on your document structure
    #         # print('file_data=',file_data)
    #         candidate_data = {
    #         'candidateData':document
    #         }
    #     else:
    #         print('no file data')
    #         candidate_data = ''
    #     return JsonResponse(candidate_data, safe=False)

    @api_view(['GET'])
    def get_cv(request,id):
        # file_data=''
        # return HttpResponse(file_data, content_type='application/octet-stream')
        candidate = Candidate.objects.get(pk=id)
        file_updated_id = candidate.resume_file_updated_id
        if file_updated_id is None:
            document_id = candidate.resume_file_id
        else:
            document_id = candidate.resume_file_updated_id

        object_id = ObjectId(document_id)
        client = MongoClient(settings.MONGODB_URI)
        db = client[settings.MONGODB_NAME]
        resumes_file_collection = db.Resume_file

        document = resumes_file_collection.find_one({'_id': object_id}, {'resume_file': 1, '_id': 0})
        if document:                
            resume_data={
                    "file_data": document
                }
            return JsonResponse(resume_data, safe=False)
        else:
             return Response({"error": "File data not found in the document"}, status=404)


    @api_view(['POST'])
    def post_cv(request, operation):
        id_rec = request.user.id
        # logger.info("Received POST request with data: %s", request.data)

        # request_hash = sha256(request.body).hexdigest()
        # if cache.get(request_hash):
        #     return JsonResponse({"error": "Duplicate request detected."}, status=400)
        
        # cache.set(request_hash, True, timeout=30)
        client = MongoClient(settings.MONGODB_URI)
        db = client[settings.MONGODB_NAME]
        resumes_collection = db.Resume_file
        resumes_json_collection = db.resumes
        file_contents = request.data.get('fileContents')
        print("length=====",len(file_contents))
        if not file_contents: #or not isinstance(file_contents, list)
                return JsonResponse({"error": "Invalid or missing file content."}, status=400)
        #print(file_contents)
        results = []
        duplicates = []
        success = []
        i=0
        #model = genai.GenerativeModel('gemini-1.5-flash')
        input_prompt = """
                                  As an HR professional responsible for saving resumes in a database, classify and extract the following details from the provided resume text:

                            Name: Extract the candidate's full name.
                            Phone Number: Extract the candidate's phone number, including the raw number, ISD code (if it's not defined, if possible, predict it), original number as it appears in the resume, formatted number, phone type (e.g., mobile, landline), and the associated location (if it's not defined, if possible, predict it) based on the ISD code.
                            Email: Extract provided email address.
                            Linkedin: Extract provided linkedin address.
                            Github: Extract provided Github address or link.
                            Links: Extract all provided links for websites other than linkedin and github and mail.
                            Country: Identify the candidate's current resident country.
                            Nationality(ies): Extract all provided nationalities (if it's not defined, if possible, predict it).
                            Date of Birth: Extract the candidate's date of birth or age.
                            Gender: Extract the candidate's gender.
                            Marital Status: Extract the candidate's marital status.
                            Languages: Classify the candidate's actual known languages based on the resume. If it is not defined or cannot be extracted, assign the value "".
                            Job Title: Extract the candidate's self-reported current job title exactly as stated in their submission. Do not infer or predict titles from experience - only use the job title explicitly provided by the candidate.
                            For the most recent experience, check if the candidate mentions 'Alternance' or any misspelled version of it by:
                            - Checking if the text contains a word that is similar to 'Alternance' even if misspelled (e.g., missing letters, extra letters, or swapped letters)
                            - If such a word is found → Set job title to 'Alternance'
                            - If no similar word is found → Use the self-reported job title
                            Jobs: Classify the candidate's suited jobs identifying which job titles most suit the candidate. Enumerate the possible job titles.
                            Degrees: Classify the candidate's Degrees with the details. 
                            For each Degree extract:
                            - DegreeName
                            - NormalizeDegree
                            - Specialization
                            - Date
                            - CountryOrInstitute
                            Certifications: Classify all the candidate's Certifications with the details. 
                            For each Certification extract:
                            - CertificationName
                            - IssuingOrganization
                            - IssueDate
                            Hard Skills: Classify the candidate's most top important and worked on Hard Skills or as we call them technical skills and make them in an array, max 20 skills
                            Soft Skills: Classify the candidate's most top important Soft Skills and make them in an array, max 20 skills
                            Experience:
                                        Professional Work History (excluding internships and alternance):
                                        Note: Only include experiences that are relevant to the candidate's current job title or stated career path.

                                        Relevance Criteria:
                                        - Experience must align with one or more of:
                                        * Current job title/role
                                        * Stated career objectives
                                        * Primary skill set
                                        * Industry focus
                                        - Skip experiences that are:
                                        * Unrelated to professional domain
                                        * Outside career trajectory
                                        * Non-professional roles
                                        * Part-time or temporary positions

                                        For each relevant experience, extract:
                                        - Job title (full-time positions only)
                                        - Company name
                                        - Location
                                        - Start date (handle various formats in English/French)
                                        - End date:
                                        * For current positions, recognize variations like:
                                            - English: "Present", "Current", "Ongoing", "Now", "To date"
                                            - French: "Aujourd'hui", "Présent", "Actuel", "À ce jour", "En cours"
                                        * Convert to standardized "PRESENT" value
                                        - Duration (calculate based on start date and end date)
                                        * For ongoing positions, calculate up to current date
                                        * Handle duration expressions in both English and French:
                                            - English: "X years Y months", "X+ years"
                                            - French: "X ans Y mois", "X+ ans"
                                        - Responsibilities (preserve original bullet points in either language)
                                        * Must demonstrate relevance to career path
                                        * Should align with stated skills
                                        - Achievements (with quantitative metrics if available)
                                        - Technologies/Tools used
                                        - Team size (if mentioned)

                                        Relevance Scoring:
                                        - High: Direct match with current role/title
                                        - Medium: Related field or transferable skills
                                        - Low: Tangential connection
                                        - Skip: Unrelated experience

                                        Date Format Handling:
                                        - Accept various date formats:
                                        * English: "Jan 2023", "January 2023", "01/2023", "2023"
                                        * French: "Janv 2023", "Janvier 2023", "01/2023", "2023"
                                        - Standardize all dates to ISO format (YYYY-MM)
                                        - For partial dates (year only), use YYYY-01
                                        - Handle season references:
                                        * English: "Spring 2023", "Summer 2023", "Fall 2023", "Winter 2023"
                                        * French: "Printemps 2023", "Été 2023", "Automne 2023", "Hiver 2023"
                            Projects: Extract and classify all projects mentioned in the resume. For each project extract:
                            - ProjectName
                            - Description
                            - TechnologiesUsed
                            - Role
                            - Period
                            - URL (if available)                            
                            Prix et Publications: Extract and classify all awards, honors, and publications. For each item extract:
                            - Type (Award/Publication)
                            - Title
                            - Description
                            - Date
                            - Publisher/Issuer
                            - URL (if available)
                            For any field that is not defined or cannot be extracted, assign the value "".

                            Make the result in this structure:

                            {
                                "CandidateInfo": {
                                    "FullName": "",
                                    "PhoneNumber": {
                                        "Number": "",
                                        "ISDCode": "",
                                        "OriginalNumber": "",
                                        "FormattedNumber": "",
                                        "Type": "",
                                        "Location": ""
                                    },
                                    "Email": "",
                                    "Linkedin": "",
                                    "Github": "",
                                    "Links": [
                                        ""
                                    ],
                                    "Nationality": [
                                        ""
                                    ],
                                    "DateOfBirth": "",
                                    "Gender": "",
                                    "MaritalStatus": "",
                                    "Languages": [
                                        ""
                                    ],
                                    "Job Title": "",
                                    "Jobs": [
                                        ""
                                    ],
                                    "Degrees": [
                                        {
                                            "DegreeName": "",
                                            "NormalizeDegree": "",
                                            "Specialization": "",
                                            "Date": "",
                                            "CountryOrInstitute": ""
                                        }
                                    ],
                                    "Certifications": [
                                        {
                                            "CertificationName": "",
                                            "IssuingOrganization": "",
                                            "IssueDate": ""
                                        }
                                    ],
                                    "Hard Skills": ["","",],
                                    "Soft Skills": ["","",],
                                    "Experience": [
                                        {
                                            "Title": "",
                                            "Period": "",
                                            "Description": "",
                                            
                                        }
                                    ],
                                    "Projects": [
                                        {
                                            "ProjectName": "",
                                            "Description": "",
                                            "TechnologiesUsed": ["","",],
                                            "Role": "",
                                            "Period": "",
                                            "URL": ""
                                        }
                                    ],
                                    "PrixEtPublications": [
                                        {
                                            "Type": "",
                                            "Title": "",
                                            "Description": "",
                                            "Date": "",
                                            "PublisherOrIssuer": "",
                                            "URL": ""
                                        }
                                    ]
                                }
                            }

        """

        if operation == 'add':
            try:
                print("=== Starting file processing ===")
                id_rec = request.user.id
                client = MongoClient(settings.MONGODB_URI)
                db = client[settings.MONGODB_NAME]
                resumes_collection = db.Resume_file
                resumes_json_collection = db.resumes
                file_contents = request.data.get('fileContents')
                
                print(f"Number of files received: {len(file_contents) if file_contents else 0}")
                
                if not file_contents:
                    print("No file contents received")
                    return JsonResponse({"error": "Invalid or missing file content."}, status=400)

                results = []
                duplicates = []
                success = []
                i = 0
                
                for idx, base64_data in enumerate(file_contents):
                    print(f"\nProcessing file {idx}")
                    if not base64_data:
                        print(f"Empty content for file {idx}")
                        continue

                    try:
                        # Step 1: Decode base64
                        print("Attempting to decode base64")
                        binary_data = base64.b64decode(base64_data)
                        print(f"Successfully decoded base64, size: {len(binary_data)} bytes")

                        # Step 2: Extract PDF text
                        print("Attempting to extract PDF text")
                        pdf_text = ""
                        with pdfplumber.open(io.BytesIO(binary_data)) as pdf:
                            for page in pdf.pages:
                                pdf_text += page.extract_text() + "\n"
                        pdf_text = pdf_text.strip()
                        print(f"Successfully extracted text, length: {len(pdf_text)} characters")

                        # Step 3: Process with OpenAI
                        print("Sending to OpenAI for processing")
                        response = openai_client.chat.completions.create(
                            model="gpt-3.5-turbo",
                            messages=[
                                {"role": "system", "content": input_prompt},
                                {"role": "user", "content": pdf_text}
                            ],
                            temperature=0.1,
                            max_tokens=1200
                           # top_p=0.7,
                            #frequency_penalty=0.2,
                           # presence_penalty=0
                        
                        )
                        
                        parsed_response = response.choices[0].message.content
                        print("Raw OpenAI Response:", parsed_response)
                        print("Received response from OpenAI")
                        print("Attempting to parse JSON response")
                        response_dict = json.loads(parsed_response)
                        print("Successfully parsed JSON response")
                        if "CandidateInfo" not in response_dict:
                            response_dict["CandidateInfo"] = {}

                        if "Projects" not in response_dict["CandidateInfo"]:
                            response_dict["CandidateInfo"]["Projects"] = [{
                                "ProjectName": "Sample Project",
                                "Description": "Sample project description",
                                "TechnologiesUsed": ["Python", "JavaScript"],
                                "Role": "Developer",
                                "Period": "2024",
                                "URL": ""
                            }]  # Add a sample project by default

                        if "PrixEtPublications" not in response_dict["CandidateInfo"]:
                            response_dict["CandidateInfo"]["PrixEtPublications"] = [{
                                "Type": "Publication",
                                "Title": "Sample Publication",
                                "Description": "Sample publication description",
                                "Date": "2024",
                                "PublisherOrIssuer": "Sample Publisher",
                                "URL": ""
                            }] 


                        # Step 4: Check for duplicates
                        candidate_email = response_dict.get("CandidateInfo", {}).get("Email", "").lower()
                        candidate_name = response_dict.get("CandidateInfo", {}).get("FullName", "").lower()
                        print(f"Checking duplicates for {candidate_name} ({candidate_email})")
                        
                        existing_candidate = Candidate.objects.filter(
                            Q(email__iexact=candidate_email) | 
                            Q(name__iexact=candidate_name)
                        ).first()
                        
                        if existing_candidate:
                            print(f"Duplicate found for file {idx}")
                            duplicates.append({
                                "file_index": idx,
                                "name": candidate_name,
                                "email": candidate_email
                            })
                            continue

                        # Step 5: Add to results if not duplicate
                        print(f"Adding file {idx} to results")
                        results.append({
                            "file_name": idx,
                            "response_text": response_dict
                        })
                        success.append(idx)
                        print(f"Successfully processed file {idx}")
                        
                    except Exception as e:
                        print(f"Error processing file {idx}: {str(e)}")
                        i += 1
                        continue

                # Step 6: Save successful results
                print(f"\n=== Processing {len(results)} successful results ===")
                for result in results:
                    try:
                        index = result["file_name"]
                        print(f"Saving candidate from file {index}")
                        
                        # Save to MongoDB
                        print("Saving to MongoDB")
                        resume_data = {
                            'resume_file': file_contents[index],
                            'created_at': datetime.now()
                        }
                        result_file = resumes_collection.insert_one(resume_data)
                        
                        json_data = {
                            'Resume_data': result["response_text"],
                            'created_at': datetime.now(),
                            'status': "available"
                        }
                        result_json = resumes_json_collection.insert_one(json_data)
                        
                        # Save to PostgreSQL
                        print("Saving to PostgreSQL")
                        candidate = Candidate()
                        candidate.name = result["response_text"].get("CandidateInfo", {}).get("FullName", "Not Provided")
                        candidate.email = result["response_text"].get("CandidateInfo", {}).get("Email", "Not Provided")
                        candidate.job_title = result["response_text"].get("CandidateInfo", {}).get("Job Title", "Not Provided")
                        candidate.recruiter_id = id_rec
                        candidate.resume_json_id = str(result_json.inserted_id)
                        candidate.resume_file_id = str(result_file.inserted_id)
                        candidate.save()
                        print(f"Successfully saved candidate from file {index}")
                        
                    except Exception as e:
                        print(f"Error saving candidate: {str(e)}")
                        i += 1
                        if index in success:
                            success.remove(index)
                        continue

                # Step 7: Create activity log
                print("\n=== Finalizing ===")
                if success:
                    try:
                        activity = Activity(description=f" added {len(success)} candidates", candidate=candidate)
                        activity.recruiter_id = id_rec
                        activity.save()
                        print("Activity log created")
                    except Exception as e:
                        print(f"Error creating activity log: {str(e)}")

                # Step 8: Return response
                response_data = {
                    "success": success,
                    "duplicates": duplicates,
                    "error_count": i
                }
                print("Final response:", response_data)
                return JsonResponse(response_data)
                
            except Exception as e:
                print(f"Unexpected error: {str(e)}")
                return JsonResponse({
                    "error": f"Unexpected error: {str(e)}",
                    "success": [],
                    "duplicates": [],
                    "error_count": 1
                }, status=500)
        return JsonResponse({"error": "Invalid operation"}, status=400)

            
    #elif operation == 'update':
    #    try:
    #        pdf_text = ""
    #        file_contents = request.data.get('fileContents')
    #        if not file_contents:
    #            return JsonResponse({"error": "No file content provided"}, status=400)
    #            
    #       binary_data = base64.b64decode(file_contents)
    #      try:
    #        with pdfplumber.open(io.BytesIO(binary_data)) as pdf:
    #              for page in pdf.pages:
    #                    pdf_text += page.extract_text() + "\n"
    #                pdf_text = pdf_text.strip()
    #        except Exception as e:
    #            return JsonResponse({"error": f"Error processing PDF: {str(e)}"}, status=500)""

            # Process with OpenAI
    #        response = openai_client.chat.completions.create(
    #            model="gpt-3.5-turbo",
    #            messages=[
    #                {"role": "system", "content": input_prompt},
    #               {"role": "user", "content": pdf_text}
    #            ],
    #            temperature=0.2,
    #            max_tokens=2000
    #        )
    #        
    #        parsed_response = response.choices[0].message.content
    #        response_dict = json.loads(parsed_response)
    #        candidate_data = {
    #            'candidateData': response_dict
    #        }
    #        print("type===", type(candidate_data))
    #        
    #        return JsonResponse(candidate_data, safe=False)
    #        
    #    except Exception as e:
    #        return JsonResponse({"error": f"Unexpected error: {str(e)}"}, status=500)

    
    # start ameliorated version:
    # @api_view(['POST'])
    # def post_cv(request):


    #     file_contents = request.data.get('fileContents')

    #     if not file_contents:
    #         return JsonResponse({"error": "No file content was provided."}, status=400)

    #     results = []

    #     for idx, file_content in enumerate(file_contents):
    #         try:
    #             print(file_content)
    #             if file_content is not None:
    #                 base64_data = file_content
    #                 binary_data = base64.b64decode(base64_data)

    #                 # Extract text from the PDF
    #                 with pdfplumber.open(io.BytesIO(binary_data)) as pdf:
    #                     pdf_text = "\n".join([page.extract_text() for page in pdf.pages]).strip()
    #                     # print(pdf_text)

    #                 # Define the prompt
    #                 input_prompt =  """
    #                     say hello
    #                     """

    #                 # Send the request to the model
    #                 model = genai.GenerativeModel('gemini-1.5-flash')
    #                 response = model.generate_content([input_prompt, pdf_text])
    #                 # print(response)

    #                 # Parse response and handle JSON parsing
    #                 response_text = 'response.text'
    #                 # print(response_text)
    #                   # Print the result for this file
    #                 print(f"Result for file {idx + 1}: {response_text}")

    #                 try:
    #                     if response_text.startswith("json") and response_text.endswith(""):
    #                         response_text = response_text[7:-3].strip()

    #                     personal_info_json = json.loads(response_text)
    #                     json_file = json.dumps(personal_info_json, indent=4)
    #                 except json.JSONDecodeError:
    #                     json_file = json.dumps({"error": "Invalid JSON format", "data": response_text}, indent=4)

    #                 # Store the response for this resume
    #                 results.append({
    #                     "file_name": f"Resume_{idx + 1}",
    #                     "response_text": json_file
    #                 })
    #             else:
    #                 return JsonResponse({"error": "Invalid file content format."}, status=400)

    #         except Exception as e:
    #             print(f"Error processing file {idx + 1}: {str(e)}")
    #             results.append({
    #                 "file_name": f"Resume_{idx + 1}",
    #                 "error": str(e)
    #             })

    #     return JsonResponse({"results": results})

    @api_view(['PATCH'])
    @permission_classes([AllowAny])
    def update_cv(request, operation, id, idRec=None):
        client = MongoClient(settings.MONGODB_URI)
        db = client[settings.MONGODB_NAME]
        resumes_collection = db.Resume_file
        resumes_json_collection = db.resumes
        
        try:
            candidate = Candidate.objects.get(id=id)
            data = request.data

            if operation == "update_cv":
                # For unauthenticated users, only allow updating basic info
                if 'candidateData' in data:
                    # Update basic candidate information
                    candidate_info = data.get("candidateData", {}).get("CandidateInfo", {})
                    if candidate_info:
                        candidate.name = candidate_info.get("FullName", candidate.name)
                        candidate.email = candidate_info.get("Email", candidate.email)
                        candidate.job_title = candidate_info.get("Job Title", candidate.job_title)

                        # Get the document ID
                        json_updated_id = candidate.resume_json_updated_id
                        document_id = json_updated_id if json_updated_id else candidate.resume_json_id

                        # Update MongoDB document
                        update_document = {'Resume_data': data['candidateData']}
                        
                        # Only add status if user is authenticated
                        if request.user.is_authenticated and 'status' in data:
                            update_document['status'] = data['status']
                            candidate.status = data['status']
                        
                        resumes_json_collection.update_one(
                            {'_id': ObjectId(document_id)},
                            {'$set': update_document}
                        )

                # Only update these fields if user is authenticated
                if request.user.is_authenticated:
                    if 'mobility' in data:
                        candidate.mobility = data['mobility']
                    if 'availability' in data:
                        candidate.availability = data['availability']
                    if 'status' in data:
                        candidate.status = data['status']

                candidate.save()

                # After successful update, fetch and return the updated data
                document_id = candidate.resume_json_updated_id or candidate.resume_json_id
                updated_document = resumes_json_collection.find_one({'_id': ObjectId(document_id)})
                
                # Prepare the response data
                response_data = {
                    'candidateData': {
                        'id_candidate': candidate.id,
                        'mobility': candidate.mobility,
                        'availability': candidate.availability,
                        'status': candidate.status,
                        'recruiter': f"{candidate.recruiter.first_name} {candidate.recruiter.last_name}" if candidate.recruiter else None,
                        'recruiterId': candidate.recruiter_id if candidate.recruiter else None,
                        'candidateData': updated_document.get('Resume_data') if updated_document else None,
                    }
                }

                # Create activity log if user is authenticated
                if request.user.is_authenticated:
                    Activity.objects.create(
                        description="Updated candidate profile",
                        candidate=candidate,
                        recruiter=request.user
                    )

                return Response(response_data, status=status.HTTP_200_OK)

        except Candidate.DoesNotExist:
            return Response({'error': 'Candidate not found'}, status=404)
        except Exception as e:
            return Response({'error': str(e)}, status=500)


    @api_view(['GET'])
    def get_candidates(request):
        # Example timestamp
        candidate_list = Candidate.objects.all()
        output = [{
            "id": candidate.id,
            "name": candidate.name,
            "position": candidate.job_title,
            "recruiter":candidate.recruiter.first_name + " " + candidate.recruiter.last_name,
            "added_at": (
                            lambda added_at: (
                                added_at.strftime("%d-%m-%Y %H:%M %Z") + added_at.strftime('%z')[:3]
                                if added_at is not None else None
                            )
                        )(candidate.added_at),
            "experience": candidate.experience,
            "availability": candidate.availability,
            "mobility": candidate.mobility,
            "date_last_contacted": candidate.date_last_contacted,
            "status": candidate.status,
        } for candidate in candidate_list]
        print(request.data)
        page_number = request.GET.get('page')
        print(page_number)
        per_page = request.GET.get('per_page', 1)
        
        paginator = Paginator(output, per_page)  # Show `per_page` items per page
        
        page_obj = paginator.get_page(page_number)
        print("total=",paginator.num_pages)

        # Total number of items
        total_items = paginator.count
        items = list(page_obj.object_list)
        data = {
            'items': items ,  # Serialize the data
            'page': page_obj.number,
            'total_pages': paginator.num_pages,
            'has_next': page_obj.has_next(),
            'has_previous': page_obj.has_previous(),
            'total_items': total_items,  # Total number of items
            'items_on_page': len(items)
        }
        return Response(data)

    @api_view(['GET'])
    def profile(request, id):
        try:
            # Debug: Log the candidate ID received
            print(f"Candidate ID received from URL: {id}")

            # Ensure the ID is an integer
            candidate_id = int(id)

            # Debug: Log the candidate ID after conversion
            print(f"Candidate ID after conversion: {candidate_id}")

            # Fetch the candidate from the database
            candidate = Candidate.objects.get(pk=candidate_id)

            # Debug: Log the candidate data fetched
            print(f"Candidate data fetched: ID={candidate.id}, Name={candidate.name}")

            # Fetch notes for the candidate
            
            notes = NoteCandidate.objects.filter(candidate_id=candidate_id).order_by('id')
            notes_output = []
        
            for note in notes:
                try:
                    recruiter_name = f"{note.recruiter.first_name} {note.recruiter.last_name}" if note.recruiter else "Unknown"
                except AttributeError:
                    recruiter_name = "Unknown"
                    
                notes_output.append({
                    "id": note.id,
                    "content": note.content,
                    "added_at": note.added_at.strftime("%d-%m-%Y %H:%M") if note.added_at else None,
                    "recruiter": recruiter_name
                })
            # Debug: Log the notes
            print(f"Notes for candidate {candidate_id}: {notes_output}")

            # Fetch the resume data from MongoDB
            json_updated_id = candidate.resume_json_updated_id
            if json_updated_id is None:
                document_id = candidate.resume_json_id
            else:
                document_id = candidate.resume_json_updated_id

            object_id = ObjectId(document_id)
            client = MongoClient(settings.MONGODB_URI)
            db = client[settings.MONGODB_NAME]
            resumes_json_collection = db.resumes

            document = resumes_json_collection.find_one({'_id': object_id}, {'_id': 0, 'Resume_data': 1, 'status': 1})

            # Debug: Log the document
            print(f"Resume document for candidate {candidate_id}: {document}")

            # Prepare HR management data
            hr = {
                'contractLocation': candidate.contract_location,
                'contractType': candidate.contract_type,
                'salaryExpectation': candidate.salary_expectation,
                'previousSalary': candidate.previous_salary,
                'integrationDate': candidate.integration_date,
                'administrativeRegularity': candidate.administrative_regularity,
                'PériodeDePréavis': candidate.periode_preavis
            }
            valService = {
                'date1': candidate.date1,
                'validatedBy1': candidate.validated_by1,
                'evaluation1': candidate.evaluation1,
                'user1': f"{candidate.user1.first_name + ' ' + candidate.user1.last_name if candidate.user1 else ' '}",
            }
            valTechnic = {
                'date2': candidate.date2,
                'validatedBy2': candidate.validated_by2,
                'evaluation2': candidate.evaluation2,
                'user2': f"{candidate.user2.first_name + ' ' + candidate.user2.last_name if candidate.user2 else ' '}",
            }
            valDirection = {
                'date3': candidate.date3,
                'validatedBy3': candidate.validated_by3,
                'evaluation3': candidate.evaluation3,
                'user3': f"{candidate.user3.first_name + ' ' + candidate.user3.last_name if candidate.user3 else ' '}",
            }
            hr_management = {
                'hr': hr,
                'valService': valService,
                'valTechnic': valTechnic,
                'valDirection': valDirection
            }

            # Prepare candidate data
            candidate_data = {}
            if document:
                candidate_data = {
                    'id_candidate': candidate_id,  # Ensure this matches the requested ID
                    'mobility': candidate.mobility,
                    'availability': candidate.availability,
                    'status': document.get('status'),
                    'recruiter': candidate.recruiter.first_name + " " + candidate.recruiter.last_name,
                    'recruiterId': candidate.recruiter_id,
                    'candidateData': document.get('Resume_data'),
                    'hrManagement': hr_management
                }
            else:
                print('No file data')
                candidate_data = {
                    'id_candidate': candidate_id,  # Ensure this matches the requested ID
                    'candidateData': '',
                    'hrManagement': hr_management
                }

            # Prepare the response
            response_data = {
                "candidateData": candidate_data,
                "Notes": notes_output
            }

            # Debug: Log the response data
            print(f"Response data for candidate {candidate_id}: {response_data}")

            return JsonResponse(response_data, safe=False)

        except Candidate.DoesNotExist:
            print(f"Candidate with ID {id} not found")
            return JsonResponse({'error': 'Candidate not found'}, status=404)
        except Exception as e:
            print(f"Error fetching candidate data: {str(e)}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @api_view(['PATCH', 'GET'])
    def saveValService(request, id):
        try:
            candidate = Candidate.objects.get(pk=id)
        except Candidate.DoesNotExist:
            return JsonResponse({'error': 'Candidate not found'}, status=404)

        if request.method == 'GET':
            # Get all validation updates for this candidate
            updates = ValidationUpdate.objects.filter(
                candidate=candidate,
                validation_type='valService'
            ).order_by('-created_at')
            
            updates_data = [{
                'id': update.id,
                'user_name': f"{update.user.first_name} {update.user.last_name}",
                'created_at': update.created_at,
                'is_active': update.is_active,
                'data': {
                    'date': update.date,
                    'validated_by': update.validated_by,
                    'evaluation': update.evaluation
                }
            } for update in updates]
            
            return Response({'updates': updates_data})

        elif request.method == 'PATCH':
            data = request.data
            
            # Create new validation update
            new_update = ValidationUpdate.objects.create(
                candidate=candidate,
                validation_type='valService',
                user=request.user,
                date=data.get('date1'),
                validated_by=data.get('validatedBy1'),
                evaluation=data.get('evaluation1'),
                is_active=True
            )
            
            # Set previous active update to inactive
            ValidationUpdate.objects.filter(
                candidate=candidate,
                validation_type='valService',
                is_active=True
            ).exclude(id=new_update.id).update(is_active=False)
            
            response_data = {
                'id': new_update.id,
                'user_name': f"{request.user.first_name} {request.user.last_name}",
                'created_at': new_update.created_at,
                'is_active': True,
                'data': {
                    'date': new_update.date,
                    'validated_by': new_update.validated_by,
                    'evaluation': new_update.evaluation
                }
            }
            
            return Response(response_data, status=status.HTTP_200_OK)

        return Response({'error': 'Invalid operation'}, status=status.HTTP_400_BAD_REQUEST)  
   
    @api_view(['PATCH', 'GET'])
    def saveValDirection(request, id):
        try:
            candidate = Candidate.objects.get(pk=id)
        except Candidate.DoesNotExist:
            return JsonResponse({'error': 'Candidate not found'}, status=404)

        if request.method == 'GET':
            # Get all direction validation updates for this candidate
            updates = ValidationUpdate.objects.filter(
                candidate=candidate,
                validation_type='valDirection'
            ).order_by('-created_at')
            
            updates_data = [{
                'id': update.id,
                'user_name': f"{update.user.first_name} {update.user.last_name}",
                'created_at': update.created_at,
                'is_active': update.is_active,
                'data': {
                    'date': update.date,
                    'validated_by': update.validated_by,
                    'evaluation': update.evaluation
                }
            } for update in updates]
            
            return Response({'updates': updates_data})

        elif request.method == 'PATCH':
            data = request.data
            # Create new validation update
            new_update = ValidationUpdate.objects.create(
                candidate=candidate,
                validation_type='valDirection',
                user=request.user,
                date=data.get('date3'),
                validated_by=data.get('validatedBy3'),
                evaluation=data.get('evaluation3'),
                is_active=True
            )
            # Set previous active update to inactive
            ValidationUpdate.objects.filter(
                candidate=candidate,
                validation_type='valDirection',
                is_active=True
            ).exclude(id=new_update.id).update(is_active=False)
            
            response_data = {
                'id': new_update.id,
                'user_name': f"{request.user.first_name} {request.user.last_name}",
                'created_at': new_update.created_at,
                'is_active': True,
                'data': {
                    'date': new_update.date,
                    'validated_by': new_update.validated_by,
                    'evaluation': new_update.evaluation
                }
            }
            
            return Response(response_data, status=status.HTTP_200_OK)

    @api_view(['PATCH', 'GET'])
    def saveHRManagement(request, id):
        """Handle HR Management data updates"""
        try:
            candidate = Candidate.objects.get(pk=id)
        except Candidate.DoesNotExist:
            return JsonResponse({'error': 'Candidate not found'}, status=404)

        if request.method == 'GET':
            # Get all HR management updates for this candidate
            updates = ValidationUpdate.objects.filter(
                candidate=candidate
            ).order_by('-created_at')
            
            updates_data = [{
                'id': update.id,
                'recruiter_name': f"{update.recruiter.first_name} {update.recruiter.last_name}",
                'created_at': update.created_at.isoformat(),
                'is_active': update.is_active,
                'data': {
                    'contractLocation': update.contract_location,
                    'contractType': update.contract_type,
                    'salaryExpectation': update.salary_expectation,
                    'previousSalary': update.previous_salary,
                    'integrationDate': update.integration_date,
                    'administrativeRegularity': update.administrative_regularity,
                    'PériodeDePréavis': update.periode_preavis
                }
            } for update in updates]
            
            return Response({'updates': updates_data})

        elif request.method == 'PATCH':
            try:
                data = request.data
                
                # Create new HR update
                new_update = ValidationUpdate.objects.create(
                    candidate=candidate,
                    recruiter=request.user,
                    contract_location=data.get('contractLocation'),
                    contract_type=data.get('contractType'),
                    salary_expectation=data.get('salaryExpectation'),
                    previous_salary=data.get('previousSalary'),
                    integration_date=data.get('integrationDate'),
                    administrative_regularity=data.get('administrativeRegularity'),
                    periode_preavis=data.get('PériodeDePréavis'),
                    is_active=True
                )
                
                # Set previous active update to inactive
                ValidationUpdate.objects.filter(
                    candidate=candidate,
                    is_active=True
                ).exclude(id=new_update.id).update(is_active=False)
                
                # Update candidate model
                candidate.contract_location = data.get('contractLocation', candidate.contract_location)
                candidate.contract_type = data.get('contractType', candidate.contract_type)
                candidate.salary_expectation = data.get('salaryExpectation', candidate.salary_expectation)
                candidate.previous_salary = data.get('previousSalary', candidate.previous_salary)
                candidate.integration_date = data.get('integrationDate', candidate.integration_date)
                candidate.administrative_regularity = data.get('administrativeRegularity', candidate.administrative_regularity)
                candidate.periode_preavis = data.get('PériodeDePréavis', candidate.periode_preavis)
                candidate.save()
                
                # Create activity log
                Activity.objects.create(
                    description="Updated HR Management information",
                    candidate=candidate,
                    recruiter=request.user
                )
                
                response_data = {
                    'message': 'HR Management data updated successfully',
                    'update': {
                        'id': new_update.id,
                        'recruiter_name': f"{request.user.first_name} {request.user.last_name}",
                        'created_at': new_update.created_at.isoformat(),
                        'is_active': True,
                        'data': data
                    }
                }
                
                return Response(response_data, status=status.HTTP_200_OK)
                
            except Exception as e:
                return Response(
                    {'error': f'Failed to update HR Management data: {str(e)}'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

        return Response({'error': 'Invalid operation'}, status=status.HTTP_400_BAD_REQUEST)        

    
    
    @api_view(['PATCH'])
    def hrManagement(request, id, operation):
        data = request.data
        print(data)
        try:
            candidate = Candidate.objects.get(pk=id)
        except Candidate.DoesNotExist:
            return JsonResponse({'error': 'Candidate not found'}, status=404)
        user_id = request.user.id
        if operation == "valService":
            candidate.date1 = data['date1']      
            candidate.validated_by1 = data['validatedBy1']     
            candidate.evaluation1 = data['evaluation1']      
            candidate.user1_id = user_id
        elif operation == "valTechnic":
            candidate.date2 = data['date2']            
            candidate.validated_by2 = data['validatedBy2']          
            candidate.evaluation2 = data['evaluation2']           
            candidate.user2_id = user_id 
        elif operation == "valDirection": 
            candidate.date3 = data['date3']             
            candidate.validated_by3 = data['validatedBy3']          
            candidate.evaluation3 = data['evaluation3']      
            candidate.user3_id = user_id  
        elif operation == "hr":
            candidate.contract_location = data.get('contractLocation', candidate.contract_location)
            candidate.contract_type = data.get('contractType', candidate.contract_type)
            candidate.previous_salary = data.get('previousSalary', candidate.previous_salary)   
            candidate.salary_expectation = data.get('salaryExpectation', candidate.salary_expectation)
            candidate.integration_date = data.get('integrationDate', candidate.integration_date)  
            candidate.administrative_regularity = data.get('administrativeRegularity', candidate.administrative_regularity)
            candidate.periode_preavis = data.get('PériodeDePréavis', candidate.periode_preavis)
        

        candidate.save()

        return Response({'message': 'Data updated successfully'}, status=status.HTTP_200_OK)

    @api_view(['DELETE'])
    @permission_classes([IsAdminUser])
    def delete(request, id):
        try:
            candidate = Candidate.objects.get(id=id)  # or `pk=id` for primary key lookup
        except Candidate.DoesNotExist:
            return Response({'error': 'Candidate not found'}, status=status.HTTP_404_NOT_FOUND)

        candidate.delete()
        return Response({'message': 'Item deleted successfully'}, status=status.HTTP_204_NO_CONTENT)

    @api_view(['PATCH'])
    def delete_resume(request, id, operation):
        
        client = MongoClient(settings.MONGODB_URI)
        db = client[settings.MONGODB_NAME]
        resumes_file_collection = db.Resume_file
        resumes_collection = db.resumes

        try:
            candidate = Candidate.objects.get(id=id)  # or `pk=id` for primary key lookup
        except Candidate.DoesNotExist:
            return Response({'error': 'Candidate not found'}, status=status.HTTP_404_NOT_FOUND)
        if candidate.resume_json_id and candidate.resume_file_id and candidate.resume_file_updated_id and candidate.resume_json_updated_id: 
            if operation == "confirm_update": 
                notification_id = request.data.get('id')
                print(notification_id)
                try:
                    resume_file_1 = candidate.resume_file_id
                    json_1 = candidate.resume_json_id     
                    resume_file_2 = candidate.resume_file_updated_id
                    json_2 = candidate.resume_json_updated_id          
                    file_id1 = ObjectId(resume_file_1)
                    json_id2 = ObjectId(json_1)
                    result1 = resumes_file_collection.delete_one({'_id': file_id1})
                    result2 = resumes_collection.delete_one({'_id': json_id2})
                    if result1.deleted_count > 0 and result2.deleted_count > 0:
                        candidate.resume_file_id = resume_file_2
                        candidate.resume_json_id = json_2
                        print("yeyes")
                        candidate.resume_file_updated_id = None
                        candidate.resume_json_updated_id = None
                        notification = Notification.objects.get(id=notification_id)
                        notification.is_confirmed = True
                        notification.save()
                        candidate.save()
                        return Response("Files were deleted successfully", status=status.HTTP_200_OK)
                    else:
                        return Response("An unexpected issue occurred while deleting the files.", status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                        
                except Exception as e:
                    print(f"An error occurred: {e}")
                
            elif operation == "cancel_update":
                notification_id = request.data.get('id')
                try:
                    resume_file_2 = candidate.resume_file_updated_id
                    json_2 = candidate.resume_json_updated_id
                    json_1 = candidate.resume_json_id
                    file_id_2 = ObjectId(resume_file_2)
                    json_id_2 = ObjectId(json_2)
                    json_content = resumes_collection.find_one({'_id': ObjectId(json_1)})
                    candidate.name = json_content['Resume_data'].get('CandidateInfo').get('FullName')
                    candidate.email = json_content['Resume_data'].get('CandidateInfo').get('Email')
                    candidate.job_title = json_content['Resume_data'].get('CandidateInfo').get('Job Title')
                    result1 = resumes_file_collection.delete_one({'_id': file_id_2})
                    result2 = resumes_collection.delete_one({'_id': json_id_2})
                    if result1.deleted_count > 0 and result2.deleted_count > 0:
                        print('noooo')
                        candidate.resume_file_updated_id = None
                        candidate.resume_json_updated_id = None
                        notification = Notification.objects.get(id=notification_id)
                        notification.is_confirmed = True
                        notification.save()
                        candidate.save()
                        return Response("Files were deleted successfully", status=status.HTTP_200_OK)
                    else:
                        return Response("An unexpected issue occurred while deleting the files.", status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                except Exception as e:
                    print(f"An error occurred: {e}")
            
            if not notification_id:
                return Response({"error": "Notification ID is required"}, status=400)
        
            try:
            
                return Response({"message": "Notification confirmed successfully"}, status=200)
            except Notification.DoesNotExist:
                return Response({"error": "Notification not found"}, status=404)
        else:
            return Response("error", status=404)


    @api_view(['GET'])
    def download_candidate_image(request):
        try:
            candidate = Candidate.objects.get(id=69)

            # Create an HTTP response with the binary image data
            response = HttpResponse(candidate.image, content_type='image/jpeg')
            response['Content-Disposition'] = f'attachment; filename="{candidate.name}_{candidate.position}.jpeg"'

            return response
        except Candidate.DoesNotExist:
            return HttpResponse(status=404)

    @api_view(['POST'])
    def post_candidate(request):

        # with open(r"C:\Users\gasso\Downloads\profile.png", 'rb') as file:
        #     binary_data = file.read()

    # Extracting data from request
        name = request.data.get('name')
        email = request.data.get('email')
        address = request.data.get('address')
        phone = request.data.get('phone')
        source = request.data.get('source')
        experience = request.data.get('experience')
        availability = request.data.get('availability')
        position = request.data.get('position')
        mobility = request.data.get('mobility')  # Fixed typo
        date_last_contacted_str = request.data.get('date_last_contacted')

        # Convert date_last_contacted to a proper datetime object
        date_last_contacted = parse_date(date_last_contacted_str)
        new_candidate=Candidate.objects.create(
            name=name,
            email=email,
            address=address,
            phone=phone,
            experience=experience,
            source=source,
            availability=availability,
            position=position,
            mobility=mobility,
            date_last_contacted=date_last_contacted
            #image=binary_data
        )
        new_candidate.save()
        # for i in itertools.chain(range(4, 13), range(14, 24)):
        #     candidate = Candidate.objects.get(id=i)
        #     candidate.image=binary_data
        #     candidate.save()

        # creation of access token
        # refresh=RefreshToken.for_user(new_candidate)
        # print('refresh=',refresh)
        payload={
                'email':email,
                'exp': datetime.datetime.utcnow() + datetime.timedelta(days=2),
                'id':new_candidate.id

            }
        # print("id_cand=",new_candidate.id)

        html=create_html_template("test")
        email_subject = 'Activate your account'
        send_mail(
                email_subject,
                    ' ',
                settings.EMAIL_HOST_USER,
                [email],
                html_message=html
                )
        return JsonResponse({"message": "Candidate created successfully"})


    @api_view(['POST'])
    def verify_mail(request):
        enc_token=request.POST['token']
        data=decrypt_token(enc_token)
        print("token_after_verif=",data)


        return HttpResponseRedirect('http://127.0.0.1:3000/setpassword-page')

    @api_view(['POST'])
    def set_password(request):
        password = request.data.get('password')
        if not password:
            return Response({"error": "Password is required"}, status=status.HTTP_400_BAD_REQUEST)

        # user = request.user
        # user.password = make_password(password)
        # user.save()

        print('it\'s ok received')

        return Response({"success": "Password updated successfully"}, status=status.HTTP_200_OK)


    #@api_view(['POST'])
    #def analyze_selected_candidates(request):
        """
        Analyze selected candidates against job requirements using GPT-4 and elasticsearch scores
        """
        try:
            # Get the job ID and selected candidate IDs from request
            data = request.data
            job_id = data.get('jobId')
            candidate_ids = data.get('candidates', [])

            if not job_id or not candidate_ids:
                return Response({
                    "error": "Job ID and candidate IDs are required"
                }, status=400)

            # Get job details
            job = get_object_or_404(Job, id=job_id)
            job_title = job.title
            job_description = job.description
            competence_phare = job.competence_phare

            # Get elasticsearch scores for these candidates
            es_client = Elasticsearch(hosts=["http://localhost:9200"])
            es_scores = {}
            
            # Fetch elasticsearch scores for each candidate
            for candidate_id in candidate_ids:
                try:
                    es_result = es_client.get(
                        index="candidates",
                        id=candidate_id
                    )
                    es_scores[candidate_id] = es_result.get('_score', 0)
                except Exception as e:
                    print(f"Error getting elasticsearch score for candidate {candidate_id}: {e}")
                    es_scores[candidate_id] = 0

            analysis_results = []
            
            # Analyze each candidate
            for candidate_id in candidate_ids:
                candidate = get_object_or_404(Candidate, id=candidate_id)
                
                # Get candidate's resume data from MongoDB
                resume_json_id = candidate.resume_json_updated_id or candidate.resume_json_id
                resume_data = Candidate.get_candidate_resume_data(resume_json_id)
                
                if not resume_data:
                    continue

                # Prepare the prompt for GPT-4 analysis
                prompt = f"""
                Analyze this candidate's fit for the job position with detailed scoring in various categories.
                
                Job Details:
                Title: {job_title}
                Key Skill Required: {competence_phare}
                Description: {job_description}
                
                Candidate Information:
                {json.dumps(resume_data, indent=2)}
                
                Previous Matching Score: {es_scores.get(candidate_id, 0)}
                
                Provide a detailed analysis in the following structure:
                1. Technical Skills Match (Score out of 40)
                2. Experience Relevance (Score out of 30)
                3. Education & Certifications (Score out of 20)
                4. Additional Factors (Score out of 10)
                
                For each category:
                - List matching skills/qualifications
                - Identify gaps
                - Justify the score
                
                Return the analysis  this JSON finormat:
                {
                    "technical_score": number,
                    "technical_details": {
                        "matching_skills": [],
                        "missing_skills": [],
                        "justification": ""
                    },
                    "experience_score": number,
                    "experience_details": {
                        "relevant_experience": [],
                        "gaps": [],
                        "justification": ""
                    },
                    "education_score": number,
                    "education_details": {
                        "relevant_qualifications": [],
                        "missing_qualifications": [],
                        "justification": ""
                    },
                    "additional_score": number,
                    "additional_details": {
                        "positive_factors": [],
                        "concerns": [],
                        "justification": ""
                    },
                    "total_score": number,
                    "final_recommendation": "",
                    "key_strengths": [],
                    "development_areas": []
                }
                """

                # Call GPT-4 for analysis
                try:
                    response = Candidate.client.chat.completions.create(
                        model="gpt-3.5-turbo",
                        messages=[
                            {"role": "system", "content": "You are an expert HR analyst specializing in technical recruitment."},
                            {"role": "user", "content": prompt}
                        ],
                        temperature=0.2
                    )
                    
                    analysis = json.loads(response.choices[0].message.content)
                    
                    # Combine with elasticsearch score
                    analysis['elasticsearch_score'] = es_scores.get(candidate_id, 0)
                    
                    analysis_results.append({
                        'candidate_id': candidate_id,
                        'name': candidate.name,
                        'job_title': candidate.job_title,
                        'analysis': analysis
                    })
                    
                except Exception as e:
                    print(f"Error analyzing candidate {candidate_id}: {e}")
                    continue

            return Response({
                'job_info': {
                    'job_id': job_id,
                    'job_title': job_title,
                    'competence_phare': competence_phare
                },
                'analysis_results': analysis_results
            })

        except Exception as e:
            return Response({
                "error": f"Analysis failed: {str(e)}"
            }, status=500)
    @staticmethod
    def get_candidate_resume_data(resume_json_id):
        """Helper function to get candidate resume data from MongoDB"""
        try:
            client = MongoClient(settings.MONGODB_URI)
            db = client[settings.MONGODB_NAME]
            resumes_json_collection = db.resumes
            
            document = resumes_json_collection.find_one(
                {'_id': ObjectId(resume_json_id)},
                {'_id': 0, 'Resume_data': 1}
            )
            
            return document.get('Resume_data') if document else None
        
        except Exception as e:
            print(f"Error fetching resume data: {e}")
            return None
        


        
    def candidate_analysis_view(request):
        return render(request, 'candidate-analysis.html')
    @api_view(['POST'])
    @permission_classes([AllowAny])
    def analyze_selected_candidates(request):
        """
        Analyze selected candidates against job requirements using GPT-4 and elasticsearch scores
        """
        try:
            data = request.data
            job_id = data.get('jobId')
            candidate_ids = data.get('candidates', [])

            if not job_id or not candidate_ids:
                return Response({
                    "error": "Job ID and candidate IDs are required"
                }, status=400)

            # Get job details
            job = get_object_or_404(Job, id=job_id)
            job_title = job.title
            job_description = job.description
            competence_phare = job.competence_phare

            # Get elasticsearch scores for these candidates
            es_scores = {}
            
            # Fetch elasticsearch scores for each candidate
            for candidate_id in candidate_ids:
                try:
                    es_result = es_client.get(
                        index="candidates",
                        id=str(candidate_id)  # Convert to string
                    )
                    es_scores[candidate_id] = es_result.get('_score', 0)
                except Exception as e:
                    print(f"Error getting elasticsearch score for candidate {candidate_id}: {e}")
                    es_scores[candidate_id] = 0

            analysis_results = []
            
            # Analyze each candidate
            for candidate_id in candidate_ids:
                candidate = get_object_or_404(Candidate, id=candidate_id)
                
                # Get candidate's resume data from MongoDB
                resume_json_id = candidate.resume_json_updated_id or candidate.resume_json_id
                resume_data = CandidateView.get_candidate_resume_data(resume_json_id)
                
                if not resume_data:
                    continue

                # Prepare the prompt for GPT-4 analysis
                prompt = f"""
                Analyze this candidate's fit for the job position with detailed scoring.

                Job Details:
                Title: {job_title}
                Key Skill Required: {competence_phare}
                Description: {job_description}
                
                Candidate Information:
                {json.dumps(resume_data, indent=2)}
                
                Previous Matching Score: {es_scores.get(candidate_id, 0)}
                
                Provide a detailed analysis with scores and justifications.
                """

                # Call GPT-4 for analysis
                try:
                    response = openai_client.chat.completions.create(
                        model="gpt-3.5-turbo",
                        messages=[
                            {"role": "system", "content": "You are an expert HR analyst specializing in technical recruitment."},
                            {"role": "user", "content": prompt}
                        ],
                        temperature=0.1,
                        max_tokens=1200
                       # top_p=0.2,
                        #frequency_penalty=0.2,
                        #presence_penalty=0.2
                    )
                    
                    analysis = json.loads(response.choices[0].message.content)
                    
                    # Combine with elasticsearch score
                    analysis['elasticsearch_score'] = es_scores.get(candidate_id, 0)
                    
                    analysis_results.append({
                        'candidate_id': candidate_id,
                        'name': candidate.name,
                        'job_title': candidate.job_title,
                        'analysis': analysis
                    })
                    
                except Exception as e:
                    print(f"Error analyzing candidate {candidate_id}: {e}")
                    continue

            return Response({
                'job_info': {
                    'job_id': job_id,
                    'job_title': job_title,
                    'competence_phare': competence_phare
                },
                'analysis_results': analysis_results
            })

        except Exception as e:
            return Response({
                "error": f"Analysis failed: {str(e)}"
            }, status=500)
# from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
# from allauth.socialaccount.providers.oauth2.client import OAuth2Client
# from dj_rest_auth.registration.views import SocialLoginView

# class GoogleLoginView(SocialLoginView):
#     print('this is google')
#     adapter_class = GoogleOAuth2Adapter
#     env = environ.Env()
#     environ.Env.read_env()
#     callback_url =env('GOOGLE_REDIRECT_URL')
#     client_class = OAuth2Client