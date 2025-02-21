from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from openai import OpenAI
import PyPDF2 as pdf
import docx
from dotenv import load_dotenv
import os
from PIL import Image
import pytesseract
from pdf2image import convert_from_bytes
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from django.core.files.storage import default_storage

# Load environment variables
load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def extract_pdf_text(file):
    """Extract text from a PDF file using PyPDF2 and OCR as a fallback."""
    reader = pdf.PdfReader(file)
    text = ""
    for page_number, page in enumerate(reader.pages, start=1):
        try:
            page_text = page.extract_text()
            if page_text:
                text += page_text
            else:
                # Fallback to OCR for scanned PDFs
                text += "\n[Performing OCR on page...]\n"
                images = convert_from_bytes(file.read(), first_page=page_number, last_page=page_number)
                for image in images:
                    text += pytesseract.image_to_string(image)
        except Exception as e:
            text += f"\n[Error extracting text from page {page_number}: {str(e)}]\n"
    return text

def extract_docx_text(file):
    """Extract text from a DOCX file."""
    doc = docx.Document(file)
    text = ""
    for paragraph in doc.paragraphs:
        text += paragraph.text + "\n"
    return text

def delete_file(file_path):
    if default_storage.exists(file_path):
        default_storage.delete(file_path)
        
@api_view(["POST"])
@permission_classes([AllowAny])
def matching_view(request):
    job_description = request.data.get("job_description")
    uploaded_files = request.FILES.getlist("cv_files")
    candidates = []

    if not job_description or not uploaded_files:
        return Response({"error": "Veuillez fournir une description du poste et télécharger des CVs."}, status=400)

    for file in uploaded_files:
        try:
            # Save the file to the media directory
            file_path = os.path.join('cv_files', file.name)
            saved_path = default_storage.save(file_path, file)
            # Construct the URL to access the file
            file_url = request.build_absolute_uri(default_storage.url(saved_path))
            # Extraction du texte...
            if file.content_type == "application/pdf":
                resume_text = extract_pdf_text(file)
            elif file.content_type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                resume_text = extract_docx_text(file)
            else:
                continue

            # Préparation des messages pour OpenAI avec analyse stricte
            messages = [
                {"role": "system", "content": """
Vous êtes un expert en recrutement spécialisé dans l'analyse et la correspondance des candidats avec une description de poste donnée, 
avec une compréhension approfondie du domaine de l'IT (software engineering, Data Science, Big Data, cybersécurité, etc.).

Instructions d'analyse :
1. Analysez la description du poste :
   - Identifiez les compétences et qualifications essentielles
   - Notez les mots-clés critiques (indispensable, atout)
   - Repérez les critères spécifiques

2. Évaluez le profil selon cette pondération :
   - Compétences techniques et comportementales (25%)
   - Expérience professionnelle (60%)
   - Formation et certifications (10%)
   - Localisation et autres critères (5%)

3. Classez le candidat :
   - Score > 80% : Fortement recommandé
   - Score 60-80% : Recommandé
   - Score < 60% : Non recommandé"""},
                {"role": "user", "content": f"""
Analysez strictement ce CV par rapport aux exigences du poste.

CV:
{resume_text}

Description du poste:
{job_description}

Retournez l'analyse au format JSON suivant:
{{
    "nom": "Nom complet",
    "email": "Email",
    "telephone": "Téléphone",
    "localisation": "Localisation",
    "age": "Âge du candidat (laissez vide si non mentionné)",
    "annees_experience": "Années d'expérience globale",
    "score_matching": "Pourcentage de correspondance (0 si pas de compétences clés)",
    "points_forts": [
        "Liste des compétences qui correspondent aux besoins du poste (vide si pas de correspondance)"
    ],
    "points_amelioration": [
        "Compétences requises manquantes pour ce poste"
    ],
    "correspondance_competences": "Explication de l'inadéquation ou de l'adéquation avec le poste"
}}

IMPORTANT: 
- Les points forts doivent être UNIQUEMENT des compétences demandées dans la description du poste
- Si le candidat a de l'expérience dans un autre domaine, ne pas le lister comme point fort
- Le score doit refléter précisément la pondération (25/60/10/5)
- Détaillez l'analyse de correspondance avec le poste
"""
                }
            ]

            # Appel de l'API OpenAI
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=messages,
                max_tokens=1000,
                temperature=0.2
            )
            
            response_text = response.choices[0].message.content.strip()
            candidates.append({
                "file_name": file.name,
                "file_url": file_url,
                "response": response_text
            })

        except Exception as e:
            return Response({"error": f"Erreur lors du traitement du CV {file.name}: {str(e)}"}, status=500)

    return Response({"candidates": candidates}, status=200)