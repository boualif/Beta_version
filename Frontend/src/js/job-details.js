//sa fonctionne avec counts but probleme de conflit !!!!
let id_cand;
let currentCandidateId = null;
// Ajoutez ceci au début de votre fichier
document.addEventListener('DOMContentLoaded', function() {
    const style = document.createElement('style');
    style.textContent = `
      select#contact-person:not([disabled]) {
        cursor: pointer !important;
        background-color: white !important;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E") !important;
        background-repeat: no-repeat !important;
        background-position: right 0.75rem center !important;
        background-size: 16px !important;
        -webkit-appearance: none !important;
        -moz-appearance: none !important;
        appearance: none !important;
        padding-right: 2.5rem !important;
      }
    `;
    document.head.appendChild(style);
  });
const notifications = {
  showError: function(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-50';
    messageDiv.textContent = message;
    document.body.appendChild(messageDiv);
    setTimeout(() => messageDiv.remove(), 3000);
  },
  
  showSuccess: function(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50';
    messageDiv.textContent = message;
    document.body.appendChild(messageDiv);
    setTimeout(() => messageDiv.remove(), 3000);
  }
};

// Function to get query parameter by name
const jobData = JSON.parse(localStorage.getItem('jobData'));

const jobId = jobData.id_Job;
function getQueryParam(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}
function getEtiquetteColor(etiquette) {
  switch(etiquette.toLowerCase()) {
    case 'technique':
    case 'technical':
      return 'bg-blue-100 text-blue-800';
    case 'fonctionnel':
    case 'functional':
      return 'bg-green-100 text-green-800';
    case 'technico-fonctionnel':
    case 'technico-functional':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

// Function to load job details based on job ID
// Function to load job details based on job ID
// Function to load job details based on job ID
// Function to load job details based on job ID
/*function loadJobDetails() {
  try {
    // Try to get fresh job data from localStorage
    const storedJobData = localStorage.getItem('jobData');
    if (storedJobData) {
        const parsedData = JSON.parse(storedJobData);
        // Update the global jobData variable
        Object.assign(jobData, parsedData);
    }
} catch (e) {
    console.error('Error loading stored job data:', e);
}
  const originalDiv = document.getElementById('job-info');
  if (originalDiv) {
    originalDiv.remove();
  }
  const saveBtn = document.getElementById('btn-save');
  if (saveBtn) {
    saveBtn.style.display = "none";
  }
  
  const targetDiv = document.createElement('div');
  targetDiv.id = 'job-info';
  const main_content = document.getElementById("main-job-content");
  
  fetch('job-content.html')
    .then(response => response.text())
    .then(data => {
      console.log('job app fetch', jobData);
      targetDiv.innerHTML = data;
      main_content.appendChild(targetDiv);

      // Populate all the job data fields
      document.getElementById('jobTitle').value = jobData.title;
      document.getElementById("openingDate").value = jobData.opening_date;
      document.getElementById('status').value = jobData.status ? jobData.status : "";
      document.getElementById('location').value = jobData.location;
      document.getElementById("key-account-name").innerHTML = "Account Name:" + `<br>` + jobData.ownerRH;
      document.getElementById("client-name").innerHTML = "Client Name:" + `<br>` + jobData.client;
      
      // Initialize the start matching button
      const startMatchingBtn = document.getElementById('start-matching-btn');
      if (startMatchingBtn) {
        startMatchingBtn.addEventListener('click', async (e) => {
          e.preventDefault();
          const loadingOverlay = document.getElementById('loading-overlay');
          
          try {
            // Show loading spinner
            if (loadingOverlay) {
              loadingOverlay.classList.remove('hidden');
            }

            // Get job ID from jobData
            const jobId = jobData.id_Job;
            if (!jobId) {
              throw new Error('Job ID not found');
            }

            // Call the matching endpoint using apiClient
            const response = await apiClient.post(`/api/job/test-elasticsearch-matching/${jobId}/`, {}, {
              withCredentials: true,
              headers: {
                'X-CSRFToken': Cookies.get('csrftoken')
              }
            });

            if (response.status !== 200) {
              throw new Error(`API Error: ${response.status} ${response.statusText || 'Unknown error'}`);
            }

            const matchData = response.data;
            
            // Store the results and redirect
            sessionStorage.setItem('matchingResults', JSON.stringify(matchData));
            sessionStorage.setItem('currentJobId', jobId);
            window.location.href = '/matches-page.html';
            
          } catch (error) {
            console.error('Matching error:', error);
            // Show error message to user
            notifications.showError('Failed to find matches: ' + error.message);
          } finally {
            // Hide loading spinner
            if (loadingOverlay) {
              loadingOverlay.classList.add('hidden');
            }
          }
        });
      }

      // Handle job type etiquette
      if (!jobData.job_type_etiquette) {
        const jobId = jobData.id_Job;
        console.log('Analyzing job:', jobId);
        
        apiClient.get(`/api/jobs/${jobId}/analyze/`)
          .then(response => {
            console.log('Analysis response:', response.data);
            const jobType = response.data.type_analyse.type_de_poste;
            jobData.job_type_etiquette = jobType;

            return apiClient.patch(`/job/${jobId}/update/`, {
              'jobTitle': jobData.title,
              'job_type_etiquette': jobType,
              'openingDate': jobData.opening_date,
              'status': jobData.status,
              'location': jobData.location,
              'description': jobData.description,
              'competence_phare': jobData.competence_phare
            }, {
              withCredentials: true,
              headers: {
                'X-CSRFToken': Cookies.get('csrftoken'),
              },
            });
          })
          .then(updateResponse => {
            console.log('Update response:', updateResponse);
            localStorage.setItem('jobData', JSON.stringify(jobData));
            updateEtiquetteDisplay(jobData.job_type_etiquette);
          })
          .catch(error => {
            console.error('Error:', error);
            if (error.response) {
              console.error('Error response:', error.response.data);
            }
          });
      } else {
        updateEtiquetteDisplay(jobData.job_type_etiquette);
      }

      // Populate remaining fields
      document.getElementById("job-description").value = jobData.description;
      document.getElementById("budget").value = jobData.budget;
      document.getElementById("contact-person").value = jobData.contact_person;
      document.getElementById("contact-person-phone").value = jobData.contact_person_phone;
      document.getElementById("contact-person-email").value = jobData.contact_person_email;
      document.getElementById("number-openings").value = jobData.nb_positions;
      document.getElementById("contract-start-date").value = jobData.contract_start_date;
      document.getElementById("contract-end-date").value = jobData.contract_end_date;
      document.getElementById("competence_phare").value = jobData.competence_phare || "";

      // Handle superuser icons
      const jobId = jobData.id_Job;
      console.log("jobIdhere==", jobId);
      const is_superuser = localStorage.getItem("role");
      if (is_superuser === "true") {
        document.getElementById("jobIcons").innerHTML +=
          `<a onclick="deleteJob(jobId)" class="text-red-500 hover:text-red-700 cursor-pointer transition">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </a>`;
      }
      document.getElementById("updateJobIcon").onclick = () => toggleJobEditMode(jobId, true);
    })
    .catch(error => console.error('Error loading the external file:', error));

  document.getElementById("dt-btn").className = "rounded bg-white px-3 py-1 text-xs font-medium text-black shadow-card hover:bg-white hover:shadow-card dark:bg-boxdark dark:text-white dark:hover:bg-boxdark";
  document.getElementById("process-btn").className = "rounded px-3 py-1 text-xs font-medium text-black hover:bg-white hover:shadow-card dark:text-white dark:hover:bg-boxdark";
}*/
// Function to populate contact dropdown with leads from client data
// Helper function to get the lead id from contact name
// Helper function to get the lead id from contact name
// Function to update job analysis display
async function updateJobAnalysis() {
    try {
      const jobId = jobData.id_Job;
      const detailedAnalysis = document.getElementById('detailed-analysis');
  
      if (!detailedAnalysis || !jobId) return;
  
      const response = await apiClient.get(`/api/jobs/${jobId}/analyze/`);
  
      if (response.status === 200) {
        const analysisData = response.data;
        console.log("ANALYSE===",analysisData)
  
        // Extract keywords from analysisData (Adapt to your API response structure)
        const technicalKeywords = analysisData.technologies_core || [];
        const toolsPlatforms = analysisData.outils_phares || [];
        const infrastructure = analysisData.competences_autres || [];
        const methodologies = analysisData.responsabilites_principales || [];
          
        // Set the global keywordData equal to what the API has return when loading
             
        console.log("TECHNICAL==",technicalKeywords)
        console.log("TOOLS==",toolsPlatforms)
        console.log("INFRA==",infrastructure)
        console.log("METHODO==",methodologies)
  
        // Function to generate keyword input with remove button
        function createKeywordInput(keyword, category, index) {
          let bgColorClass = '';
          let textColorClass = '';
  
          switch (category) {
            case 'technical-keywords':
              bgColorClass = 'bg-blue-50 dark:bg-blue-900/20';
              textColorClass = 'text-blue-700 dark:text-blue-300';
              break;
            case 'tools-platforms':
              bgColorClass = 'bg-green-50 dark:bg-green-900/20';
              textColorClass = 'text-green-700 dark:text-green-300';
              break;
            case 'infrastructure':
              bgColorClass = 'bg-purple-50 dark:bg-purple-900/20';
              textColorClass = 'text-purple-700 dark:text-purple-300';
              break;
            case 'methodologies':
              bgColorClass = 'bg-orange-50 dark:bg-orange-900/20';
              textColorClass = 'text-orange-700 dark:text-orange-300';
              break;
            default:
              bgColorClass = 'bg-gray-100 dark:bg-gray-800';
              textColorClass = 'text-gray-700 dark:text-gray-300';
              break;
          }
          return `
                      <div class="keyword-item group relative">
                          <span class="inline-flex items-center px-3 py-1.5 rounded-lg ${bgColorClass} ${textColorClass} text-sm">
                              <input
                                  type="text"
                                  class="edit-keyword bg-transparent border-none focus:ring-0 text-sm p-0 w-auto min-w-[100px] ${textColorClass}"
                                  value="${keyword}"
                                  data-category="${category}"
                                  data-index="${index}"
                              />
                              <button
                                  class="ml-2 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onclick="removeKeyword(this, '${category}', ${index})"
                              >
                                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                                  </svg>
                              </button>
                          </span>
                      </div>
                  `;
        }
  
        let analysisHtml = `
                  <div class="space-y-6">
                      <!-- Compétences Techniques Clés -->
                      <div>
                          <h3 class="text-sm font-medium text-black dark:text-white mb-3">Technical-keywords:</h3>
                          <div class="flex flex-wrap gap-2" id="technical-keywords">
                              ${technicalKeywords.map((keyword, index) => createKeywordInput(keyword, 'technical-keywords', index)).join('')}
                              <button onclick="addNewKeyword('technical-keywords')" class="add-button">+</button>
                          </div>
                      </div>
  
                      <!-- Outils & Plateformes -->
                      
  
                      <!-- Infrastructure & Réseaux -->
                      <div>
                          <h3 class="text-sm font-medium text-black dark:text-white mb-3">Infrastructure & Réseaux:</h3>
                          <div class="flex flex-wrap gap-2" id="infrastructure">
                              ${infrastructure.map((infra, index) => createKeywordInput(infra, 'infrastructure', index)).join('')}
                              <button onclick="addNewKeyword('infrastructure')" class="add-button">+</button>
                          </div>
                      </div>
  
                      <!-- Methodologies -->
                      <div>
                          <h3 class="text-sm font-medium text-black dark:text-white mb-3">Methodologies:</h3>
                          <div class="flex flex-wrap gap-2" id="methodologies">
                              ${methodologies.map((method, index) => createKeywordInput(method, 'methodologies', index)).join('')}
                              <button onclick="addNewKeyword('methodologies')" class="add-button">+</button>
                          </div>
                      </div>
                  </div>
              `;
  
        detailedAnalysis.innerHTML = analysisHtml;
      }
    } catch (error) {
      console.error('Error updating job analysis:', error);
      if (detailedAnalysis) {
        detailedAnalysis.innerHTML = `
                  <div class="text-sm text-gray-500 dark:text-gray-400">
                      L'analyse n'est pas disponible pour le moment.
                  </div>
              `;
      }
    }
  }

// Global object to hold the keywords for each category
const keywordData = {
    technicalKeywords: [],
    toolsPlatforms: [],
    infrastructure: [],
    methodologies: []
};

// Function to add a new keyword input
function addNewKeyword(category) {
    const container = document.getElementById(category);
    const newIndex = container.children.length;
    let bgColorClass = '';
    let textColorClass = '';

    switch (category) {
        case 'technical-keywords':
            bgColorClass = 'bg-blue-50 dark:bg-blue-900/20';
            textColorClass = 'text-blue-700 dark:text-blue-300';
            break;
        case 'tools-platforms':
            bgColorClass = 'bg-green-50 dark:bg-green-900/20';
            textColorClass = 'text-green-700 dark:text-green-300';
            break;
        case 'infrastructure':
            bgColorClass = 'bg-purple-50 dark:bg-purple-900/20';
            textColorClass = 'text-purple-700 dark:text-purple-300';
            break;
        case 'methodologies':
            bgColorClass = 'bg-orange-50 dark:bg-orange-900/20';
            textColorClass = 'text-orange-700 dark:text-orange-300';
            break;
        default:
            bgColorClass = 'bg-gray-100 dark:bg-gray-800';
            textColorClass = 'text-gray-700 dark:text-gray-300';
            break;
    }
    const newKeywordDiv = document.createElement('div');
    newKeywordDiv.className = 'keyword-item group relative';
    newKeywordDiv.innerHTML = `
        <span class="inline-flex items-center px-3 py-1.5 rounded-lg ${bgColorClass} ${textColorClass} text-sm">
            <input type="text" 
                id="${category}-${newIndex}"
                class="bg-transparent border-none focus:ring-0 text-sm p-0 w-auto min-w-[100px] ${textColorClass}"
                placeholder="Nouveau mot clé"
                data-category="${category}"
                data-index="${newIndex}"
            >
            <button class="ml-2 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                onclick="removeKeyword(this, '${category}', ${newIndex})">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
            </button>
        </span>
    `;
    container.appendChild(newKeywordDiv);

    // Update the global data
    switch (category) {
        case 'technical-keywords':
            keywordData.technicalKeywords.push('');
            break;
        case 'tools-platforms':
            keywordData.toolsPlatforms.push('');
            break;
        case 'infrastructure':
            keywordData.infrastructure.push('');
            break;
        case 'methodologies':
            keywordData.methodologies.push('');
            break;
    }
}
function removeKeyword(button, category, index) {
    const keywordItem = button.closest('.keyword-item');
    keywordItem.remove();

    // Update the global array by removing the element at 'index'
    switch (category) {
        case 'technical-keywords':
            keywordData.technicalKeywords.splice(index, 1);
            break;
        case 'tools-platforms':
            keywordData.toolsPlatforms.splice(index, 1);
            break;
        case 'infrastructure':
            keywordData.infrastructure.splice(index, 1);
            break;
        case 'methodologies':
            keywordData.methodologies.splice(index, 1);
            break;
    }

    // Update the data-index attributes of the other keywords in the same category
    const container = document.getElementById(category);
    const keywordInputs = container.querySelectorAll('.keyword-item');
    keywordInputs.forEach((input, i) => {
        const editKeyword = input.querySelector('.edit-keyword');
        editKeyword.setAttribute('data-index', i);
    });
}

// Function to save the updated keywords
async function saveKeywords() {
    const updatedKeywords = {};

    // Get all keyword input elements
    const keywordInputs = document.querySelectorAll('.edit-keyword');

    // Loop through the input elements and update the keywordsData object
    keywordInputs.forEach(input => {
        const category = input.dataset.category;
        const index = parseInt(input.dataset.index);
        const value = input.value;

        // Initialize the updatedKeywords[category] array if it's undefined
        if (updatedKeywords[category] === undefined) {
            updatedKeywords[category] = [];
        }

        updatedKeywords[category][index] = value;
    });

    console.log('Updated keywords:', updatedKeywords);

    // Construct the payload to send to the backend
    const payload = {
        technologies_core: updatedKeywords['technical-keywords'] || [],
        outils_phares: updatedKeywords['tools-platforms'] || [],
        competences_autres: updatedKeywords.infrastructure || [],
        responsabilites_principales: updatedKeywords.methodologies || []
    };

    console.log('Data send backend', payload);
    try {
        const jobId = jobData.id_Job; // Assuming jobData is available
        const response = await apiClient.patch(`/api/jobs/${jobId}/update_keywords/`, payload, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 200) {
            notifications.showSuccess('Keywords saved successfully!');
        } else {
            notifications.showError('Failed to save keywords.');
        }
    } catch (error) {
        console.error('Error saving keywords:', error);
        notifications.showError('Failed to save keywords.');
    }
}
function getLeadIdFromContactName(contactName, leads) {
    if (!contactName || !leads || leads.length === 0) return null;

    for (const lead of leads) {
        const leadFullName = `${lead.first_name} ${lead.last_name}`;
        if (contactName === leadFullName) {
            return lead.id;
        }
    }
    return null;
}



// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    console.log('Checking client data on page load...');
    checkClientData();
});
 // Handle Lead Selection
// In job-details.js

function handleLeadSelection(event) {
    const contactSelect = document.getElementById('contact-person');
    const contactPersonPhone = document.getElementById("contact-person-phone");
    const contactPersonEmail = document.getElementById("contact-person-email");
  
    if (contactSelect && contactPersonPhone && contactPersonEmail) {
        const selectedOption = contactSelect.options[contactSelect.selectedIndex];
        if (selectedOption && selectedOption.value) {
            const clientData = JSON.parse(localStorage.getItem('clientData'));
            const selectedLead = clientData.leads.find(lead => lead.id === parseInt(selectedOption.value));
            
            if (selectedLead) {
                // Update the form fields
                contactPersonPhone.value = selectedLead.phone || '';
                contactPersonEmail.value = selectedLead.email || '';
                
                // Update jobData
                const jobData = JSON.parse(localStorage.getItem('jobData')) || {};
                jobData.contact_person = `${selectedLead.first_name} ${selectedLead.last_name}`;
                jobData.contact_person_phone = selectedLead.phone || '';
                jobData.contact_person_email = selectedLead.email || '';
                jobData.contact_person_id = selectedLead.id;
                
                localStorage.setItem('jobData', JSON.stringify(jobData));
                console.log('Updated contact selection:', jobData.contact_person);
                console.log('Saved jobData to localStorage:', JSON.parse(localStorage.getItem('jobData')));
            }
        }
    }
}

async function fetchClientData(clientId) {
    try {
        const response = await apiClient.get(`/api/clients/${clientId}/`, {
            withCredentials: true,
            headers: {
                'X-CSRFToken': Cookies.get('csrftoken')
            }
        });

        if (response.status === 200) {
            const clientData = response.data;
            console.log('Client data fetched:', clientData);
            // Stocker les données dans localStorage
            localStorage.setItem('clientData', JSON.stringify(clientData));
            console.log("setItem",localStorage.getItem('clientData')) // print the value there

            // ADD THIS
            console.log("WHAT IS LEADS" , clientData.leads); // NEW LOG
            return response.data;
        }
    } catch (error) {
        
        return null;
    }
}
async function initializeContactData() {
    console.log('Initializing contact data...');
    
    try {
        // Récupérer l'ID du job et le nom du client
        const jobData = JSON.parse(localStorage.getItem('jobData'));
        if (!jobData?.client) {
            console.error('No client name found in jobData');
            return;
        }

        // Appel direct à l'API clients
        const clientsResponse = await apiClient.get('/api/clients/', {
            withCredentials: true,
            headers: {
                'X-CSRFToken': Cookies.get('csrftoken')
            }
        });

        if (clientsResponse.status === 200) {
            console.log('Clients response:', clientsResponse.data);
            const clients = clientsResponse.data;

            // Trouver le client correspondant en utilisant la propriété company
            const client = clients.find(c => c.company === jobData.client);
            if (client) {
                console.log('Found client:', client);

                // Récupérer les détails du client avec les leads
                const clientDetailsResponse = await apiClient.get(`/${client.id_Client}/get-client/`, {
                    withCredentials: true,
                    headers: {
                        'X-CSRFToken': Cookies.get('csrftoken')
                    }
                });

                if (clientDetailsResponse.status === 200) {
                    const clientData = clientDetailsResponse.data;
                    console.log('Client details with leads:', clientData);

                    // Stocker dans localStorage
                    localStorage.setItem('clientData', JSON.stringify(clientData));

                    // Peupler le dropdown avec les leads
                    populateLeadsDropdown(clientData.leads);
                }
            } else {
                console.error('Client not found:', jobData.client);
            }
        }
    } catch (error) {
        console.error('Error loading contact data:', error);
    }
}

function populateLeadsDropdown(leads) {
    const contactSelect = document.getElementById('contact-person');
    if (!contactSelect) {
        console.error('Contact select element not found');
        return;
    }

    console.log('Populating dropdown with leads:', leads);

    // Vider le select
    contactSelect.innerHTML = '';

    // Option par défaut
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Select a contact...';
    contactSelect.appendChild(defaultOption);

    if (!Array.isArray(leads) || leads.length === 0) {
        const noLeadsOption = document.createElement('option');
        noLeadsOption.disabled = true;
        noLeadsOption.textContent = 'No contacts available';
        contactSelect.appendChild(noLeadsOption);
        return;
    }

    // Ajouter chaque lead
    leads.forEach(lead => {
        const option = document.createElement('option');
        option.value = lead.id;
        option.textContent = `${lead.first_name} ${lead.last_name}`;
        option.setAttribute('data-phone', lead.phone || '');
        option.setAttribute('data-email', lead.email || '');
        contactSelect.appendChild(option);
        console.log('Added lead option:', option.textContent);
    });

    // Gérer le changement de sélection
    contactSelect.addEventListener('change', function() {
        const selectedOption = this.options[this.selectedIndex];
        if (selectedOption.value) {
            document.getElementById('contact-person-phone').value = selectedOption.getAttribute('data-phone') || '';
            document.getElementById('contact-person-email').value = selectedOption.getAttribute('data-email') || '';
        }
    });

    // Restaurer la sélection précédente si elle existe
    const jobData = JSON.parse(localStorage.getItem('jobData'));
    if (jobData?.contact_person) {
        const matchingLead = leads.find(lead => 
            `${lead.first_name} ${lead.last_name}` === jobData.contact_person
        );
        if (matchingLead) {
            contactSelect.value = matchingLead.id;
            document.getElementById('contact-person-phone').value = matchingLead.phone || '';
            document.getElementById('contact-person-email').value = matchingLead.email || '';
        }
    }
}
// Fonction pour initialiser les données client
async function initializeClientData() {
    console.log('Initializing client data...');
    
    // Récupérer l'ID du client depuis jobData
    const clientName = jobData?.client;
    console.log('Client name from jobData:', clientName);

    if (!clientName) {
        console.error('No client name found in jobData');
        return;
    }

    try {
        // Récupérer d'abord la liste des clients pour trouver l'ID
        const clientsResponse = await apiClient.get('/api/clients/', {
            withCredentials: true,
            headers: {
                'X-CSRFToken': Cookies.get('csrftoken')
            }
        });

        if (clientsResponse.status === 200) {
            const clients = clientsResponse.data;
            console.log('All clients:', clients);

            // Trouver le client par son nom
            const client = clients.find(c => c.name === clientName);
            
            if (client) {
                console.log('Found client:', client);
                // Récupérer les données détaillées du client
                const clientData = await fetchClientData(client.id);
                
                if (clientData) {
                    console.log("Client Data:",clientData)
                    // Réinitialiser le dropdown après avoir chargé les données
                    populateLeadsDropdown(clientData.leads);
                }
            } else {
                console.error('Client not found:', clientName);
            }
        }
    } catch (error) {
        console.error('Error initializing client data:', error);
        notifications.showError('Failed to initialize client data');
    }
}
// Fonction améliorée pour vérifier les données client
// Add this function into the job-details.js function
async function checkClientData() {
    const clientData = localStorage.getItem('clientData');
    console.log('Current client data in localStorage:', clientData);

    if (!clientData) {
        console.log('No client data found, initializing...');
        return initializeLeadsFields();
    }

    try {
        const parsedData = JSON.parse(clientData);

        // Check if leads array exists and has a length
        if (!parsedData.leads || !Array.isArray(parsedData.leads) || parsedData.leads.length === 0) {
            console.log('No leads found in client data, reinitializing...');
            return initializeLeadsFields();
        }

        console.log('Valid client data found:', parsedData);
        populateLeadsDropdown(parsedData.leads); // Populate with existing data
        return Promise.resolve(true);
    } catch (error) {
        console.error('Error parsing client data:', error);
        return initializeLeadsFields();
    }
}
// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing leads fields...');
    checkClientData().catch(error => {
        console.error('Error during initialization:', error);
        notifications.showError('Failed to initialize contact data');
    });
});
console.log(JSON.parse(localStorage.getItem('clientData')));
// Call this when the page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing leads fields...');
    initializeLeadsFields();
});
// Initialize Leads Fields
async function initializeLeadsFields() {
    console.log('Starting initializeLeadsFields...');
    
    try {
        // Test l'appel API directement
        const response = await apiClient.get('/api/clients/', {
            withCredentials: true,
            headers: {
                'X-CSRFToken': Cookies.get('csrftoken')
            }
        });

        console.log('API Response:', response.data);

        if (response.status === 200) {
            const clients = response.data;
            
            if (clients.length === 0) {
                console.error('No clients returned from API');
                return;
            }

            // Le reste du code...
            const jobData = JSON.parse(localStorage.getItem('jobData'));
            if (!jobData?.client) {
                console.error('No client in jobData');
                return;
            }

            // Rechercher le client correspondant
            const client = clients.find(c => c.company === jobData.client);
            if (!client) {
                console.error('Client not found:', jobData.client);
                return;
            }

            // Une fois le client trouvé, chercher ses leads
            const clientResponse = await apiClient.get(`/${client.id}/get-client/`, {
                withCredentials: true,
                headers: {
                    'X-CSRFToken': Cookies.get('csrftoken')
                }
            });

            if (clientResponse.status === 200) {
                const clientData = clientResponse.data;
                console.log('Client data received:', clientData);
                
                // Sauvegarder dans localStorage
                localStorage.setItem('clientData', JSON.stringify(clientData));

                // Peupler le dropdown
                if (clientData.leads && Array.isArray(clientData.leads)) {
                    populateLeadsDropdown(clientData.leads);
                }
            }
        }
    } catch (error) {
        
    }
}
let currentJobId = null;


async function loadJobDetails() {
    try {
        // Try to get fresh job data from localStorage
        const storedJobData = localStorage.getItem('jobData');
        if (storedJobData) {
            const parsedData = JSON.parse(storedJobData);
            // Update the global jobData variable
            Object.assign(jobData, parsedData);
        }
    } catch (e) {
        console.error('Error loading stored job data:', e);
    }

    // Check if user is creator
    const currentUserId = localStorage.getItem('userId');
    const isJobCreator = currentUserId === jobData.creator_id;

    if (isJobCreator) {
        // Full access for creator
        fetch('job-content.html')
            .then(response => response.text())
            .then(async data => {
                const main_content = document.getElementById("main-job-content");
                if (!main_content) return;

                const existingJobInfo = document.getElementById('job-info');
                if (existingJobInfo) {
                    existingJobInfo.remove();
    }
    
    const targetDiv = document.createElement('div');
    targetDiv.id = 'job-info';
                main_content.appendChild(targetDiv);
                targetDiv.innerHTML = data;

                // [Rest of the existing full job details code]
            });
    } else {
        // Check if assigned
        const notificationsResponse = await apiClient.get('/api/get-notifications/', {
            withCredentials: true,
            headers: {
                'X-CSRFToken': Cookies.get('csrftoken')
            }
        });

        const isAssigned = notificationsResponse.data.some(notif => 
            notif.job_id === parseInt(jobId) && 
            notif.type === 'job_assignment'
        );

        if (isAssigned) {
            // Load restricted view for assigned users
            loadRestrictedDetails(jobData);
        }}

    // Load full job details
    const main_content = document.getElementById("main-job-content");
    if (!main_content) return;

    const existingJobInfo = document.getElementById('job-info');
    if (existingJobInfo) {
        existingJobInfo.remove();
    }

    const targetDiv = document.createElement('div');
    targetDiv.id = 'job-info';
    main_content.appendChild(targetDiv);

    //targetDiv.innerHTML = `<h1>Loading Job Details..</h1>`;  //Loading message


    const saveBtn = document.getElementById('btn-save');
    if (saveBtn) {
        saveBtn.style.display = "none";
    }
  
    fetch('job-content.html')
        .then(response => response.text())
        .then(async data => {
            targetDiv.innerHTML = data;  //LOAD the job content HTML
            console.log('Added at date from database:', jobData.added_at);

            // Get the element
            const addedAtElement = document.getElementById("added_at");
            if (addedAtElement) {
                const systemDate = jobData.added_at;
                if (systemDate) {
                    try {
                        // Parse la date en préservant le fuseau horaire
                        const date = new Date(systemDate);
                        
                        // Format avec les options complètes incluant le fuseau horaire
                        const formattedDate = date.toLocaleString('fr-FR', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                            timeZoneName: 'short'
                        });
                        
                        addedAtElement.textContent = formattedDate;
                        
                        // Log pour debug
                        console.log('Original date from DB:', systemDate);
                        console.log('Formatted date:', formattedDate);
                    } catch (error) {
                        console.error('Error formatting date:', error);
                        addedAtElement.textContent = systemDate; // Affiche la date brute en cas d'erreur
                    }
                } else {
                    addedAtElement.textContent = 'Date non disponible';
                }
            }
            // Populate all the job data fields
            document.getElementById('jobTitle').value = jobData.title;
         
            
         
            document.getElementById("DeadlineDate").value = jobData.deadline_date; // Deadline date from the databa
            document.getElementById('status').value = jobData.status ? jobData.status : "";
            document.getElementById('location').value = jobData.location;
            document.getElementById("key-account-name").innerHTML = "Account Manager:" + `<br>` + jobData.ownerRH;
            document.getElementById("client-name").innerHTML = "Client Name:" + `<br>` + jobData.client;
            document.getElementById("job-description").value = jobData.description;
            document.getElementById("budget").value = jobData.budget;
            document.getElementById("number-openings").value = jobData.nb_positions;
            document.getElementById('contact-person-phone').value = jobData.contact_person_phone || '';
            document.getElementById('contact-person-email').value = jobData.contact_person_email || '';
            document.getElementById("competence_phare").value = jobData.competence_phare || "";

            const missionTimeSelect = document.getElementById('mission-time');
            if (missionTimeSelect) {
                missionTimeSelect.value = jobData.mission_time || ''; // Select the correct option
            }
            


            // Function for initializing all flatpickr instances

            // Function to format date to YYYY-MM-DD
            function formatDate(dateString) {
                if (!dateString) return '';
                const date = new Date(dateString);
                if (isNaN(date.getTime())) return '';
                return date.toISOString().split('T')[0];
            }

            // Initialize date pickers
            const dateInputs = document.querySelectorAll(".form-datepicker");
            dateInputs.forEach(input => {
                flatpickr(input, {
                    dateFormat: "Y-m-d",
                    allowInput: true,
                    defaultDate: input.value || null
                });
            });

            // Set the dates with proper formatting
            const openingDate = formatDate(jobData.added_at || jobData.opening_date);
            const deadlineDate = formatDate(jobData.deadline_date);

            if (openingDate) {
                const openingDatePicker = document.getElementById("openingDate")._flatpickr;
                if (openingDatePicker) {
                    openingDatePicker.setDate(openingDate);
                }
            }

            if (deadlineDate) {
                const deadlineDatePicker = document.getElementById("DeadlineDate")._flatpickr;
                if (deadlineDatePicker) {
                    deadlineDatePicker.setDate(deadlineDate);
                }
            }
            // Function to generate keyword input with remove button
            function createKeywordInput(keyword, category, index) {
                let bgColorClass = '';
                let textColorClass = '';

                switch (category) {
                    case 'technical-keywords':
                        bgColorClass = 'bg-blue-50 dark:bg-blue-900/20';
                        textColorClass = 'text-blue-700 dark:text-blue-300';
                        break;
                    case 'tools-platforms':
                        bgColorClass = 'bg-green-50 dark:bg-green-900/20';
                        textColorClass = 'text-green-700 dark:text-green-300';
                        break;
                    case 'infrastructure':
                        bgColorClass = 'bg-purple-50 dark:bg-purple-900/20';
                        textColorClass = 'text-purple-700 dark:text-purple-300';
                        break;
                    case 'methodologies':
                        bgColorClass = 'bg-orange-50 dark:bg-orange-900/20';
                        textColorClass = 'text-orange-700 dark:text-orange-300';
                        break;
                    default:
                        bgColorClass = 'bg-gray-100 dark:bg-gray-800';
                        textColorClass = 'text-gray-700 dark:text-gray-300';
                        break;
                }
                return `
                                <div class="keyword-item group relative">
                                    <span class="inline-flex items-center px-3 py-1.5 rounded-lg ${bgColorClass} ${textColorClass} text-sm">
                                        <input
                                            type="text"
                                            class="edit-keyword bg-transparent border-none focus:ring-0 text-sm p-0 w-auto min-w-[100px] ${textColorClass}"
                                            value="${keyword}"
                                            data-category="${category}"
                                            data-index="${index}"
                                        />
                                        <button
                                            class="ml-2 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onclick="removeKeyword(this, '${category}', ${index})"
                                        >
                                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                                            </svg>
                                        </button>
                                    </span>
                                </div>
                            `;
            }

            // Call the datePicker function to work
            initializeDatePickers();

            console.log('After initialize the flatpickr function for opening Date and DeadLine', initializeDatePickers);
            if (jobData.technologies_core || jobData.competences_autres || jobData.responsabilites_principales) {
                const analysisData = {
                    technologies_core: jobData.technologies_core || [],
                    outils_phares: jobData.outils_phares || [],
                    competences_autres: jobData.competences_autres || [],
                    responsabilites_principales: jobData.responsabilites_principales || []
                };

                const detailedAnalysis = document.getElementById('detailed-analysis');
                if (detailedAnalysis) {
                    // Create and display analysis HTML using the stored data
                    let analysisHtml = `
                    <div class="space-y-6">
                        <!-- Technical Keywords -->
                        <div>
                            <h3 class="text-sm font-medium text-black dark:text-white mb-3">Technical-keywords:</h3>
                            <div class="flex flex-wrap gap-2" id="technical-keywords">
                                ${analysisData.technologies_core.map((keyword, index) =>
                                        createKeywordInput(keyword, 'technical-keywords', index)).join('')}
                                <button onclick="addNewKeyword('technical-keywords')" class="add-button">+</button>
                            </div>
                        </div>

                        <!-- Infrastructure -->
                        <div>
                            <h3 class="text-sm font-medium text-black dark:text-white mb-3">Infrastructure & Réseaux:</h3>
                            <div class="flex flex-wrap gap-2" id="infrastructure">
                                ${analysisData.competences_autres.map((infra, index) =>
                                        createKeywordInput(infra, 'infrastructure', index)).join('')}
                                <button onclick="addNewKeyword('infrastructure')" class="add-button">+</button>
                            </div>

                            

                        </div>

                        <!-- Methodologies -->
                        <div>
                            <h3 class="text-sm font-medium text-black dark:text-white mb-3">Methodologies:</h3>
                            <div class="flex flex-wrap gap-2" id="methodologies">
                                ${analysisData.responsabilites_principales.map((method, index) =>
                                        createKeywordInput(method, 'methodologies', index)).join('')}
                                <button onclick="addNewKeyword('methodologies')" class="add-button">+</button>
                            </div>
                        </div>
                    </div>
                `;
                    detailedAnalysis.innerHTML = analysisHtml;
                }
            } else {
                // Only if no stored analysis data, make API call
                await updateJobAnalysis();
            }
         // Set up the event listener only after dropdown creation
         const contactSelect = document.getElementById('contact-person');
         contactSelect.addEventListener('change', handleLeadSelection);
         const clientData = JSON.parse(localStorage.getItem('clientData'));
  localStorage.setItem("clientId", clientData.id_Client);
         console.log("Leads data:", clientData.leads); // Debug log to check leads specifically
         setTimeout(() => {
            populateContactSelect();
            initializeContactFields();
            updateJobAnalysis();


            // Set contact details if they exist
            const contactPersonPhone = document.getElementById('contact-person-phone');
            const contactPersonEmail = document.getElementById('contact-person-email');
            if (contactPersonPhone) contactPersonPhone.value = jobData.contact_person_phone || '';
            if (contactPersonEmail) contactPersonEmail.value = jobData.contact_person_email || '';

        }, 100); 
            updateColumnCounts();
        updateJobAnalysis();
        const is_superuser = localStorage.getItem("role");
        const jobId = jobData.id_Job;

        if (is_superuser === "true") {
            document.getElementById("jobIcons").innerHTML +=
                `<a onclick="deleteJob(jobId)" class="text-red-500 hover:text-red-700 cursor-pointer transition">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </a>`;
        }
        document.getElementById("updateJobIcon").onclick = () => toggleJobEditMode(jobId, true);

         // Setup to handle clicking of AI analysis button
            const startMatchingBtn = document.getElementById('start-matching-btn');
            if (startMatchingBtn) {
                startMatchingBtn.addEventListener('click', async (e) => {
                    e.preventDefault();
                    const loadingOverlay = document.getElementById('loading-overlay');
                    
                    try {
                        // Show loading spinner
                        if (loadingOverlay) {
                            loadingOverlay.classList.remove('hidden');
                        }
            
                        // Get job ID from jobData
                        const jobId = jobData.id_Job;
                        if (!jobId) {
                            throw new Error('Job ID not found');
                        }
            
                        // First, trigger reindexing
                        const reindexResponse = await apiClient.get('/api/reindex_candidates/', {
                            withCredentials: true,
                            headers: {
                                'X-CSRFToken': Cookies.get('csrftoken')
                            }
                        });
            
                        if (reindexResponse.status !== 200) {
                            throw new Error('Reindexing failed');
                        }
            
                        // Then proceed with matching
                        const matchResponse = await apiClient.post(`/api/job/test-elasticsearch-matching/${jobId}/`, {}, {
                            withCredentials: true,
                            headers: {
                                'X-CSRFToken': Cookies.get('csrftoken')
                            }
                        });
            
                        if (matchResponse.status !== 200) {
                            throw new Error(`API Error: ${matchResponse.status} ${matchResponse.statusText || 'Unknown error'}`);
                        }
            
                        const matchData = matchResponse.data;
                        
                        // Store the results and redirect
                        sessionStorage.setItem('matchingResults', JSON.stringify(matchData));
                        sessionStorage.setItem('currentJobId', jobId);
                        window.location.href = '/matches-page.html';
                        
                    } catch (error) {
                        console.error('Matching error:', error);
                        notifications.showError('Failed to find matches: ' + error.message);
                    } finally {
                        // Hide loading spinner
                        if (loadingOverlay) {
                            loadingOverlay.classList.add('hidden');
                        }
                    }
                });
            }
         // Handle analyze of a job
            if (!jobData.job_type_etiquette) {
                const jobId = jobData.id_Job;
                console.log('Analyzing job:', jobId);
                
                apiClient.get(`/api/jobs/${jobId}/analyze/`)
                    .then(response => {
                        console.log('Analysis response:', response.data);
                        const jobType = response.data.type_analyse.type_de_poste;
                        jobData.job_type_etiquette = jobType;
  
                        return apiClient.patch(`/job/${jobId}/update/`, {
                         'jobTitle': jobData.title,
                         'job_type_etiquette': jobType,
                         'openingDate': jobData.opening_date,
                         'deadlineDate': jobData.deadline_date, // Also send the deadline!
                         'status': jobData.status,
                         'location': jobData.location,
                         'description': jobData.description,
                         'competence_phare': jobData.competence_phare
                        }, {
                            withCredentials: true,
                            headers: {
                                'X-CSRFToken': Cookies.get('csrftoken'),
                            },
                        });
                    })
                    .then(updateResponse => {
                        console.log('Update response:', updateResponse);
                        localStorage.setItem('jobData', JSON.stringify(jobData));
                        updateEtiquetteDisplay(jobData.job_type_etiquette);
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        if (error.response) {
                            console.error('Error response:', error.response.data);
                        }
                    });
            } else {
                updateEtiquetteDisplay(jobData.job_type_etiquette);
            }
    })
    
    .catch(error => {
        console.error('Error loading the external file:', error);
    }).finally(()=>{
        document.getElementById("dt-btn").className = "rounded bg-white px-3 py-1 text-xs font-medium text-black shadow-card hover:bg-white hover:shadow-card dark:bg-boxdark dark:text-white dark:hover:bg-boxdark";
        document.getElementById("process-btn").className = "rounded px-3 py-1 text-xs font-medium text-black hover:bg-white hover:shadow-card dark:text-white dark:hover:bg-boxdark";
    });
    
     //Add count 
     updateColumnCounts()
}

async function populateContactData(clientName) {
    if (!clientName) {
        console.error('Client name not found in jobData');
        return;
    }
  
    try {
          // First call API to get a list of clients
        const clientsResponse = await apiClient.get('/list/', {
          withCredentials: true,
          headers: {
            'X-CSRFToken': Cookies.get('csrftoken')
          }
        });
  
          if (clientsResponse.status === 200) {
              const clients = clientsResponse.data;
  
              // Find the client by its company
              const client = clients.find(c => c.company === clientName);
  
              if (!client) {
                  console.error('Client not found:', clientName);
                  notifications.showError('Client not found.');
                  return;
              }
  
            // Call API to get lead information for the selected client
          /*  const clientLeadsResponse = await apiClient.get(`/${client.id_Client}/get-client/`, {
              withCredentials: true,
              headers: {
                'X-CSRFToken': Cookies.get('csrftoken')
              }
            });*/
  
            if (clientLeadsResponse.status === 200) {
              const leads = clientLeadsResponse.data.leads;
  
              // Populate the contact person dropdown
              populateContactSelect(leads);
            } else {
              console.error("Cannot obtain list of leads with ", clientName);
              notifications.showError('Cannot obtain list of leads from server');
            }
          } else {
            
          }
    } catch (error) {
        
    }
  }
// Helper function to display client data
function displayClientData(clientData) {
    if (!clientData) {
        console.error('No client data to display');
        return;
    }

    console.log("DISPLAY CLIENT DATA",clientData)
    // Create a formatted string with client data
    let clientDataString = '<h1>Client Data</h1>';
    for (const key in clientData) {
        if (clientData.hasOwnProperty(key)) {
            clientDataString += `<p><strong>${key}:</strong> ${JSON.stringify(clientData[key])}</p>`;
        }
    }

    // Insert the data into the 'job-info' div
    const jobInfoDiv = document.getElementById('job-info');
    if (jobInfoDiv) {
        jobInfoDiv.innerHTML = clientDataString;
    } else {
        console.error('job-info div not found');
    }
}
// Add this function to ensure contact data is properly saved when editing
function saveContactData() {
    const contactSelect = document.getElementById('contact-person');
    const contactPersonPhone = document.getElementById('contact-person-phone');
    const contactPersonEmail = document.getElementById('contact-person-email');
    
    if (contactSelect && contactSelect.value) {
        const clientData = JSON.parse(localStorage.getItem('clientData'));
        const selectedLead = clientData.leads.find(lead => lead.id === parseInt(contactSelect.value));
        
        if (selectedLead) {
            const jobData = JSON.parse(localStorage.getItem('jobData')) || {};
            jobData.contact_person = `${selectedLead.first_name} ${selectedLead.last_name}`;
            jobData.contact_person_id = selectedLead.id;
            jobData.contact_person_phone = contactPersonPhone ? contactPersonPhone.value : '';
            jobData.contact_person_email = contactPersonEmail ? contactPersonEmail.value : '';
            localStorage.setItem('jobData', JSON.stringify(jobData));
        }
    }
}
// Function to populate contact dropdown with leads from client
function populateContactSelect() {
    const contactSelect = document.getElementById('contact-person');
    if (!contactSelect) {
        console.error('Contact select element not found');
        return;
    }

    const clientData = JSON.parse(localStorage.getItem('clientData'));
    const jobData = JSON.parse(localStorage.getItem('jobData'));
    
    console.log('Populating contacts. Job Data:', jobData);
    console.log('Client Data:', clientData);

    if (!clientData?.leads) {
        console.error('No leads found in client data');
        return;
    }

    // Clear existing options
    contactSelect.innerHTML = '';

    // First, add the default option
    if (!jobData?.contact_person) {
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Select a contact...';
        contactSelect.appendChild(defaultOption);
    }

    // Add leads as options
    clientData.leads.forEach(lead => {
        const option = document.createElement('option');
        option.value = lead.id;
        option.textContent = `${lead.first_name} ${lead.last_name}`;
        
        // Check if this is the saved contact
        const fullName = `${lead.first_name} ${lead.last_name}`;
        if (jobData?.contact_person === fullName) {
            option.selected = true;
            console.log('Setting selected contact:', fullName);
            
            // Also update the related fields
            const phoneInput = document.getElementById('contact-person-phone');
            const emailInput = document.getElementById('contact-person-email');
            if (phoneInput) phoneInput.value = lead.phone || '';
            if (emailInput) emailInput.value = lead.email || '';
        }
        
        contactSelect.appendChild(option);
    });

    // Event listener for changes
    contactSelect.addEventListener('change', handleLeadSelection);
}

  
 // Function to update contact fields when a contact is selected
 function updateContactFields(lead) {
    if (!lead) return;

    const phoneInput = document.getElementById('contact-person-phone');
    const emailInput = document.getElementById('contact-person-email');

    if (phoneInput) phoneInput.value = lead.phone || '';
    if (emailInput) emailInput.value = lead.email || '';
}


// Function to handle contact selection change
// Function to handle contact selection change
function handleContactChange(event) {
    const selectedOption = event.target.options[event.target.selectedIndex];
    const phoneInput = document.getElementById('contact-person-phone');
    const emailInput = document.getElementById('contact-person-email');

    if (selectedOption && selectedOption.value) {
        // Auto-fill phone and email from selected contact
        if (phoneInput) phoneInput.value = selectedOption.getAttribute('data-phone') || '';
        if (emailInput) emailInput.value = selectedOption.getAttribute('data-email') || '';
    } else {
        // Clear fields if no contact selected
        if (phoneInput) phoneInput.value = '';
        if (emailInput) emailInput.value = '';
    }
}



// Add this to your editJob function
// Add this to your editJob function
function getFormattedContactPerson() {
    const contactSelect = document.getElementById('contact-person');
    if (!contactSelect || !contactSelect.value) return '';

    const selectedOption = contactSelect.options[contactSelect.selectedIndex];
    return selectedOption.textContent; // Returns the formatted name without asterisks
}
  // Update your existing loadJobDetails function to include:
  function initializeContactFields() {
    setTimeout(() => {
        const clientData = JSON.parse(localStorage.getItem('clientData'));
        const jobData = JSON.parse(localStorage.getItem('jobData'));

        if (!clientData || !jobData) {
            console.warn('clientData or jobData not yet loaded.  Retrying...');
            initializeContactFields(); // Recursive call to try again
            return;
        }
      
        populateContactSelect();
        
        if (jobData?.contact_person) {
            const contactSelect = document.getElementById('contact-person');
            const phoneInput = document.getElementById('contact-person-phone');
            const emailInput = document.getElementById('contact-person-email');
            
            // Set the stored phone and email
            if (phoneInput) phoneInput.value = jobData.contact_person_phone || '';
            if (emailInput) emailInput.value = jobData.contact_person_email || '';
            
            // Set the selected contact in dropdown
            if (contactSelect) {
                Array.from(contactSelect.options).forEach(option => {
                    const optionText = option.textContent.trim();
                    const contactPerson = jobData.contact_person.trim();
                    if (optionText === contactPerson) {
                        option.selected = true;
                        console.log("Selected option", optionText);
                    }
                });
            }
        }
    }, 100);
}
  
 // Call this during page load
document.addEventListener('DOMContentLoaded', () => {
    populateContactSelect();
});

// Call this when toggling edit mode
function toggleContactFieldsEdit(editMode) {
    const contactSelect = document.getElementById('contact-person');
    if (contactSelect) {
        contactSelect.disabled = !editMode;
        if (editMode) {
            populateContactSelect(); // Refresh the dropdown when entering edit mode
        }
    }
}
  // Call this in your initialization
  document.addEventListener('DOMContentLoaded', () => {
      loadJobDetails();
  });

// Toggle Edit Mode
// Toggle Edit Mode

// Toggle Edit Mode
// Toggle Edit Mode
function toggleJobEditMode(jobId, editMode) {
    const editableFields = [
        { id: 'jobTitle', type: 'text' },
        { id: "openingDate", type: 'date' },
        { id: "DeadlineDate", type: 'date' }, //ADD THIS LINE
        { id: 'status', type: 'text' },
        { id: 'location', type: 'text' },
        { id: 'budget', type: 'numeric' },
        { id: 'contact-person', type: 'select' },
        { id: 'number-openings', type: 'numeric' },
        //{ id: 'contract-start-date', type: 'date' },
       // { id: 'contract-end-date', type: 'date' },
        { id: 'job-description', type: 'text' },
        { id: 'competence_phare', type: 'text' },
        { id: 'mission-time', type: 'select' } // ADD THIS LINE
        
    ];

    const saveButton = document.getElementById('saveChangesBtn');
    const contactSelect = document.getElementById('contact-person');
    
    if (editMode) {
        document.getElementById("jobIcons").innerHTML = `
            <a href="javascript:void(0)" class="absolute top-4 right-14 text-red-500 hover:text-red-700 transition" onclick="toggleJobEditMode('${jobId}', false)">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </a>`;

        // Show save button and add click handler
        if (saveButton) {
            saveButton.style.display = 'inline-flex';
            saveButton.onclick = () => editJob(jobId);
        }

        editableFields.forEach(field => {
            const element = document.getElementById(field.id);
            if (element) {
                element.removeAttribute("disabled");
                element.classList.add('cursor-pointer');
            }
        });

        // Initialize leads again
        initializeContactData();
        initializeLeadsFields();
        toggleContactFieldsEdit(editMode);

    } else {
        document.getElementById("jobIcons").innerHTML = `
            <a href="javascript:void(0)" onclick="toggleJobEditMode('${jobId}', true)" class="absolute top-4 right-24 text-blue-500 hover:text-blue-700 transition">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 4.172a4 4 0 015.656 5.656L8 19H4v-4L13.828 4.172z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 14l2 2 2-2-2-2-2 2z"></path>
                </svg>
            </a>`;

        // Hide save button
        if (saveButton) {
            saveButton.style.display = 'none';
            saveButton.onclick = null;
        }

        editableFields.forEach(field => {
            const element = document.getElementById(field.id);
            if (element) {
                element.setAttribute('disabled', true);
                element.classList.remove('cursor-pointer');
            }
        });
        toggleContactFieldsEdit(editMode);
    }
}
/*function editJob(jobId) {
  const jobTitle = document.getElementById('jobTitle').value;
  var openingDate = document.getElementById("openingDate").value;
  openingDate = openingDate ? openingDate : null;
  const status = document.getElementById('status').value;
  const location = document.getElementById('location').value;
  const description = document.getElementById("job-description").value;
  var budget = document.getElementById("budget").value;
  budget = budget ? budget : null;
  const contact = document.getElementById("contact-person").value;
  const phone = document.getElementById("contact-person-phone").value;
  const email = document.getElementById("contact-person-email").value;
  var nb_positions = document.getElementById("number-openings").value;
  nb_positions = nb_positions ? nb_positions : null;
  var start = document.getElementById("contract-start-date").value;
  start = start ? start : null;
  var end = document.getElementById("contract-end-date").value;
  end = end ? end : null;
  const competence_phare = document.getElementById("competence_phare").value;  // Get competence_phare value
  console.log("Competence Phare value:", competence_phare); // Debug log



  apiClient.patch(`/job/${jobId}/update/`, {
    'jobTitle': jobTitle,
    'openingDate': openingDate,
    'status': status,
    'location': location,
    'description': description,
    'budget': budget,
    'contact': contact,
    'phone': phone,
    'email': email,
    'nb_positions': nb_positions,
    'start': start,
    "end": end,
    'competence_phare': competence_phare  // Add this line
  },
  
    {
      withCredentials: true,
      headers: {
        'X-CSRFToken': Cookies.get('csrftoken'),  // Manually extract the CSRF token
      },
    })
    .then(response => {
      if (response.status == 200) {
        console.log('Data updated successfully:', response.data);
        analyzeJobAndUpdateEtiquette();

        toggleJobEditMode(jobId, false);
      
      apiClient.get(`/jobs/${jobId}/analyze/`)
      .then(analysisResponse => {
        console.log('Job analyzed successfully:', analysisResponse.data);
        // Reload the job details to show the updated etiquette
        loadJobDetails();
      })
      .catch(error => {
        console.error('Error analyzing job:', error);
      });
    }
    })
    .catch(error => {
      console.error('Error updating data:', error);
    });
}*/
// *** Helper Function to Extract Keywords from UI ***
function extractKeywordsFromUI() {
    const updatedKeywords = {};

    // Get all keyword input elements
    const keywordInputs = document.querySelectorAll('.edit-keyword');

    // Loop through the input elements and update the keywordsData object
    keywordInputs.forEach(input => {
        const category = input.dataset.category;
        const index = parseInt(input.dataset.index);
        const value = input.value;

        // Initialize the updatedKeywords[category] array if it's undefined
        if (updatedKeywords[category] === undefined) {
            updatedKeywords[category] = [];
        }

        updatedKeywords[category][index] = value;
    });

    return {
        technicalKeywords: updatedKeywords['technical-keywords'] || [],
        toolsPlatforms: updatedKeywords['tools-platforms'] || [],
        infrastructure: updatedKeywords.infrastructure || [],
        methodologies: updatedKeywords.methodologies || []
    };
}
function editJob(jobId) {
    const formData = {
        jobTitle: document.getElementById('jobTitle').value,
        openingDate: document.getElementById("openingDate").value || null,
        deadlineDate: document.getElementById("DeadlineDate").value || null,
        status: document.getElementById('status').value,
        location: document.getElementById('location').value,
        description: document.getElementById("job-description").value,
        budget: document.getElementById("budget").value || null,
        contact: document.getElementById("contact-person").value,
        phone: document.getElementById("contact-person-phone").value,
        email: document.getElementById("contact-person-email").value,
        nb_positions: document.getElementById("number-openings").value || null,
        missionTime: document.getElementById('mission-time').value, // ADD THIS LINE

        competence_phare: document.getElementById("competence_phare").value || ''
    };

    // Log the data being sent
    console.log('Sending data to API:', formData);

    apiClient.patch(`/job/${jobId}/update/`, formData, {
        withCredentials: true,
        headers: {
            'X-CSRFToken': Cookies.get('csrftoken'),
            'Content-Type': 'application/json'
        },
    })
    .then(response => {
        if (response.status === 200) {
            // Update local storage with new data
            saveContactData()
            const updatedJobData = {
                ...jobData,
                ...formData,
                mission_time: formData.missionTime, // ADD THIS LINE
                deadline_date: formData.deadlineDate, // Ensure deadline_date is updated
                opening_date: formData.openingDate,
            };
            localStorage.setItem('jobData', JSON.stringify(updatedJobData));
            Object.assign(jobData, updatedJobData);
            
            notifications.showSuccess('Job updated successfully!');
            toggleJobEditMode(jobId, false);

            // Reload job details to reflect changes
            loadJobDetails();
        }
    })
    .catch(error => {
        console.error('Error updating job:', error);
        console.error('Error response:', error.response?.data);
        notifications.showError('Failed to save changes');
    });
}


let dataArray = [];
// In loadProcess function, add this part after initializing Sortable
// Update loadProcess to properly set up the save button
let hasUnsavedChanges = false;

// Replace your existing loadProcess function
/*function loadProcess() {
  const jobId = jobData.id_Job;
  if (!jobId) {
      console.error('No job ID available');
      return;
  }

  const existingJobInfo = document.getElementById('job-info');
  if (existingJobInfo) {
      existingJobInfo.remove();
  }

  const saveBtn = document.getElementById('btn-save');
  if (saveBtn) {
      saveBtn.style.display = "block";
  }

  const targetDiv = document.createElement('div');
  targetDiv.id = 'job-info';
  const main_content = document.getElementById("main-job-content");

  fetch('job-applications.html')
      .then(response => response.text())
      .then(data => {
          targetDiv.innerHTML = data;
          main_content.appendChild(targetDiv);

          // Initialize Sortable before loading candidates
          initializeSortable();

          // Load ONLY candidates for this specific job
          const jobSpecificCandidates = JSON.parse(sessionStorage.getItem(`selectedCandidates_${jobId}`)) || [];
          
          const newSection = document.getElementById('new');
          if (newSection) {
              newSection.innerHTML = '';
              // Filter candidates to ensure they belong to this job
              const validCandidates = jobSpecificCandidates.filter(candidate => 
                  candidate.jobId === jobId
              );
              
              validCandidates.forEach(candidate => {
                  newSection.innerHTML += createCandidateCard(candidate);
              });
          }

          updateButtonStyles();
      })
      .catch(error => console.error('Error loading the external file:', error));
}*/
function analyzeJobAndUpdateEtiquette() {
  const jobId = jobData.id_Job;
  if (!jobId) {
      console.error('No job ID available for analysis');
      return;
  }

  return apiClient.get(`/api/jobs/${jobId}/analyze/`)
      .then(response => {
          console.log('Analysis response:', response.data);
          const jobType = response.data.type_analyse.type_de_poste;
          
          // Update the job type in jobData
          jobData.job_type_etiquette = jobType;
          
          // Update the server with new job type
          return apiClient.patch(`/job/${jobId}/update/`, {
              'job_type_etiquette': jobType
          }, {
              withCredentials: true,
              headers: {
                  'X-CSRFToken': Cookies.get('csrftoken'),
              },
          });
      })
      .then(() => {
          // Update local storage with new job data
          localStorage.setItem('jobData', JSON.stringify(jobData));



          
          // Update the etiquette display
          updateEtiquetteDisplay(jobData.job_type_etiquette);
      })
      .catch(error => {
          console.error('Error in job analysis:', error);
          throw error; // Propagate error
      });
}
// New function to fetch and populate candidates
async function fetchAndPopulateCandidates(jobId) {
    try {
        const response = await apiClient.get(`/api/job-application/${jobId}/`, {
            withCredentials: true,
            headers: {
                'X-CSRFToken': Cookies.get('csrftoken')
            }
        });

        if (response.status === 200 && response.data.applications) {
            // Clear existing candidates
            ['new', 'preselected', 'interviewed', 'tested', 'proposed', 
             'interview_partner', 'interview_client_final', 'hired', 'start', 'end']
            .forEach(stage => {
                const container = document.getElementById(stage);
                if (container) {
                    container.innerHTML = '';
                }
            });

            // Process and display candidates
            response.data.applications.forEach(candidate => {
                const stage = candidate.stage || 'new';
                const container = document.getElementById(stage);
                if (container) {
                    // Ensure candidate has numeric ID before creating card
                    const candidateId = parseInt(candidate.id_candidate || candidate.candidate_id || candidate.id);
                    if (!isNaN(candidateId)) {
                        const normalizedCandidate = {
                            ...candidate,
                            id_candidate: candidateId // Ensure consistent ID field
                        };
                        container.innerHTML += createCandidateCard(normalizedCandidate);
                    }
                }
            });

            // Store for session management
            sessionStorage.setItem(`selectedCandidates_${jobId}`, 
                JSON.stringify(response.data.applications));
        }
    } catch (error) {
        console.error('Error fetching candidates:', error);
        //notifications.showError('Error loading candidates');
    }
}
async function mergeAndDisplayCandidates(jobId) {
    try {
        const response = await apiClient.get(`/api/job-application/${jobId}/`, {
            withCredentials: true,
            headers: {
                'X-CSRFToken': Cookies.get('csrftoken')
            }
        });

        const storedCandidates = JSON.parse(sessionStorage.getItem(`selectedCandidates_${jobId}`)) || [];
        let allCandidates = [];
        
        if (response.status === 200 && response.data.applications) {
            // Ensure each candidate has a valid ID
            allCandidates = response.data.applications.map(candidate => ({
                ...candidate,
                id: validateCandidateId(candidate.id_candidate || candidate.candidate_id || candidate.id)
            })).filter(candidate => candidate.id !== null);
        }
        
        // Add stored candidates with validated IDs
        storedCandidates.forEach(stored => {
            const validId = validateCandidateId(stored.id);
            if (validId && !allCandidates.some(existing => existing.id === validId)) {
                allCandidates.push({
                    ...stored,
                    id: validId,
                    stage: stored.stage || 'new'
                });
            }
        });

        // Clear and repopulate columns
        ['new', 'preselected', 'interviewed', 'tested', 'proposed', 
         'interview_partner', 'interview_client_final', 'hired', 'start', 'end']
        .forEach(stage => {
            const container = document.getElementById(stage);
            if (container) {
                container.innerHTML = '';
            }
        });

        // Display candidates
        allCandidates.forEach(candidate => {
            const stage = candidate.stage || 'new';
            const container = document.getElementById(stage);
            if (container && candidate.id) {
                container.innerHTML += createCandidateCard(candidate);
            }
        });

        // Update storage
        sessionStorage.setItem(`selectedCandidates_${jobId}`, JSON.stringify(allCandidates));
        
        return allCandidates;
    } catch (error) {
        console.error('Error merging candidates:', error);
        
       // notifications.showError('Error loading candidates');
        throw error;
    }
}

async function loadProcess() {
    if (processInitialized) return; // Prevent multiple initializations

    const jobId = jobData?.id_Job ||
                 localStorage.getItem('notificationJobId') ||
                 new URLSearchParams(window.location.search).get('jobId');
    console.log('Loading process with jobId:', jobId, 'JobData:', jobData);

    if (!jobId) {
        console.error('No job ID available');
        notifications.showError('Job ID not found');
        return;
    }

    const main_content = document.getElementById("main-job-content");
    if (!main_content) return;

    // Clear existing content
    const existingJobInfos = main_content.querySelectorAll('#job-info');
    existingJobInfos.forEach(element => element.remove());
    destroyExistingSortables();

    const saveBtn = document.getElementById('btn-save');
    if (saveBtn) {
        saveBtn.style.display = "block";
    }

    const targetDiv = document.createElement('div');
    targetDiv.id = 'job-info';

    fetch('job-applications.html')
        .then(response => response.text())
        .then(async data => {
            const existingJobInfos = main_content.querySelectorAll('#job-info');
            existingJobInfos.forEach(element => element.remove());

            targetDiv.innerHTML = data;
            main_content.appendChild(targetDiv);
            


            // Load and merge candidates
            const localCandidates = JSON.parse(localStorage.getItem(`jobApplications_${jobId}`)) || [];
            const sessionCandidates = JSON.parse(sessionStorage.getItem(`selectedCandidates_${jobId}`)) || [];
            
            const mergedCandidates = mergeCandidatesWithPriority(
                sessionCandidates,
                localCandidates,
                [],
                jobId
            );

            try {
                const response = await apiClient.get(`/api/job-application/${jobId}/`, {
                    withCredentials: true,
                    headers: {
                        'X-CSRFToken': Cookies.get('csrftoken')
                    }
                });

                if (response.status === 200 && response.data.applications) {
                    const allCandidates = mergeCandidatesWithPriority(
                        mergedCandidates,
                        [],
                        response.data.applications,
                        jobId
                    );

                    sessionStorage.setItem(`selectedCandidates_${jobId}`, JSON.stringify(allCandidates));
                    localStorage.setItem(`jobApplications_${jobId}`, JSON.stringify(allCandidates));

                    // Distribute candidates while preserving the dropdown
                    const newSection = document.getElementById('new');
                    if (newSection) {
                        const dropdown = newSection.querySelector('#recruiter-section-dropdown'); // Get the selector of the dropdown
                        distributeToColumns(allCandidates); // Send all the candidate to the function
                        if (dropdown && newSection) { // Check if dropdown and the column exists.
                            newSection.insertBefore(dropdown, newSection.firstChild); //Place the dropdown first.
                        }
                    } else {
                        console.warn("The column 'new' is not found, please review the job-applications.html. file") // Warns if something wrong is in the application itself.
                    }

                }
            } catch (error) {
                console.warn('Error fetching server candidates:', error);
                // Distribute candidates while preserving the dropdown
                const newSection = document.getElementById('new');

                if (newSection) {

                    const dropdown = newSection.querySelector('#recruiter-section-dropdown');
                distributeToColumns(mergedCandidates);
                    if (dropdown && newSection) {
                        newSection.insertBefore(dropdown, newSection.firstChild);
                    }
                } else {
                        console.warn("The column 'new' is not found, please review the job-applications.html. file") // Warns if something wrong is in the application itself.
            }

            }
            // Add recruiter dropdown first
            addRecruiterDropdownToSection();
            initializeSortable();
            updateButtonStyles();
            //await fetchAndPopulateCandidates(jobId);
            updateColumnCounts();
            updateRestrictedColumnCounts();


        })
        .catch(error => {
            console.error('Error in loadProcess:', error);
            notifications.showError('Error loading process view');
        });
}
// Add this after your other initialization code
function initializeCountObserver() {
  const config = { childList: true, subtree: true };
  const callback = function(mutationsList, observer) {
      updateColumnCounts();
  };

  const observer = new MutationObserver(callback);
  const targetNode = document.getElementById('job-info');
  if (targetNode) {
      observer.observe(targetNode, config);
  }
}

// Function to load and merge all candidates for a job
// Function to load and merge all candidates for a job
async function loadAllCandidatesForJob(jobId) {
  try {
      // Clear existing candidates
      ['new', 'preselected', 'interviewed', 'tested', 'proposed', 'interview_partner', 'interview_client_final', 'hired', 'start', 'end']
      .forEach(stage => {
          const container = document.getElementById(stage);
          if (container) {
              container.innerHTML = '';
          }
      });

      // Get stored candidates
      const storedCandidates = JSON.parse(sessionStorage.getItem(`selectedCandidates_${jobId}`)) || [];
      
      // Distribute candidates to their correct columns
      storedCandidates.forEach(candidate => {
          const stage = candidate.stage || 'new';
          const container = document.getElementById(stage);
          if (container) {
              container.innerHTML += createCandidateCard(candidate);
          }
      });

      updateColumnCounts();

  } catch (error) {
      console.error('Error loading candidates:', error);
      //notifications.showError('Error loading candidates');
  }
}

// Enhanced merge function that prioritizes existing stages
// Enhanced merge function that prioritizes existing stages
function mergeCandidatesWithPriority(selected, processed, server, jobId) {
  const candidateMap = new Map();
  
  // Helper to standardize candidate object
  const standardizeCandidate = (candidate, source) => {
      // Handle potential null/undefined candidate
      if (!candidate) return null;

      // Extract ID using multiple possible properties
      const id = candidate.id || candidate.candidate_id;
      if (!id) return null;

      return {
          id: id,
          name: candidate.name || candidate.candidate_name || 'Unknown',
          jobTitle: candidate.jobTitle || candidate.current_job_title || candidate.title || 'No Title',
          email: candidate.email || '',
          stage: candidate.stage || 'new',
          jobId: jobId,
          source: source // Track where this candidate came from for prioritization
      };
  };

  // Add server candidates first (lowest priority)
  server.forEach(candidate => {
      const standardized = standardizeCandidate(candidate, 'server');
      if (standardized && standardized.id) {
          candidateMap.set(standardized.id.toString(), standardized);
      }
  });

  // Add processed candidates (medium priority)
  processed.forEach(candidate => {
      const standardized = standardizeCandidate(candidate, 'processed');
      if (standardized && standardized.id) {
          candidateMap.set(standardized.id.toString(), standardized);
      }
  });

  // Add selected candidates (highest priority, but preserve existing stages)
  selected.forEach(candidate => {
      const standardized = standardizeCandidate(candidate, 'selected');
      if (standardized && standardized.id) {
          const existingCandidate = candidateMap.get(standardized.id.toString());
          if (existingCandidate) {
              // Preserve the existing stage if it's not 'new'
              standardized.stage = existingCandidate.stage !== 'new' 
                  ? existingCandidate.stage 
                  : standardized.stage;
          }
          candidateMap.set(standardized.id.toString(), standardized);
      }
  });

  return Array.from(candidateMap.values());
}
async function loadAllCandidates(jobId) {
  if (!jobId) {
      console.error('No job ID provided');
      return;
  }

  try {
      // First try to get selected candidates from current session
      const selectedCandidates = JSON.parse(sessionStorage.getItem('selectedCandidates')) || [];
      console.log('Current selected candidates:', selectedCandidates);

      // Get any previously processed candidates
      const processedCandidates = JSON.parse(sessionStorage.getItem(`selectedCandidates_${jobId}`)) || [];
      console.log('Previously processed candidates:', processedCandidates);

      // Combine both sets of candidates
      let allCandidates = [...selectedCandidates];
      
      // Add processed candidates that aren't already included
      processedCandidates.forEach(processed => {
          if (!allCandidates.some(selected => selected.id === processed.id)) {
              allCandidates.push(processed);
          }
      });

      // Try to get additional candidates from server if available
      try {
          const response = await fetch(`/api/job-application/${jobId}/`, {
              method: 'GET',
              credentials: 'include',
              headers: {
                  'Content-Type': 'application/json',
                  'X-CSRFToken': Cookies.get('csrftoken')
              }
          });

          if (response.ok) {
              const serverData = await response.json();
              if (serverData && serverData.applications) {
                  // Merge server candidates with existing ones
                  serverData.applications.forEach(serverCandidate => {
                      if (!allCandidates.some(existing => 
                          existing.id === (serverCandidate.id_candidate || serverCandidate.id)
                      )) {
                          allCandidates.push({
                              id: serverCandidate.id_candidate || serverCandidate.id,
                              name: serverCandidate.name || 'Unknown',
                              jobTitle: serverCandidate.current_job_title || serverCandidate.jobTitle || 'No Title',
                              email: serverCandidate.email || '',
                              stage: serverCandidate.stage || 'new'
                          });
                      }
                  });
              }
          }
      } catch (serverError) {
          console.warn('Server fetch failed, continuing with local candidates:', serverError);
      }

      // Update storage with complete candidate list
      if (allCandidates.length > 0) {
          sessionStorage.setItem(`selectedCandidates_${jobId}`, JSON.stringify(allCandidates));
          console.log('Updated candidates in storage:', allCandidates);
      }

      // Distribute candidates to columns
      distributeToColumns(allCandidates);
      
      // Initialize sortable
      initializeSortable();
      
      // Update column counts
      updateColumnCounts();

  } catch (error) {
      console.error('Error in loadAllCandidates:', error);
      showError('Failed to load candidates. Please refresh the page.');
  }
}
// Helper function to distribute candidates to columns
function distributeToColumns(candidates) {
  if (!Array.isArray(candidates)) {
      console.error('Invalid candidates array:', candidates);
      return;
  }

  // Get all column elements
  const columns = {
      new: document.getElementById('new'),
      preselected: document.getElementById('preselected'),
      interviewed: document.getElementById('interviewed'),
      tested: document.getElementById('tested'),
      proposed: document.getElementById('proposed'),
      interview_partner: document.getElementById('interview_partner'),
      interview_client_final: document.getElementById('interview_client_final'),
      hired: document.getElementById('hired'),
      start: document.getElementById('start'),
      end: document.getElementById('end')
  };

  // Clear existing content while preserving Sortable initialization
  Object.values(columns).forEach(column => {
      if (column) {
          const sortableInstance = column.sortable;
          column.innerHTML = '';
          if (sortableInstance) {
              // Reinitialize sortable if needed
              sortableInstance.option("disabled", false);
          }
      }
  });

  // Distribute candidates to their respective columns
  candidates.forEach(candidate => {
      if (!candidate) return;
      
      const stage = candidate.stage || 'new';
      const column = columns[stage];
      
      if (column) {
          const cardHtml = createCandidateCard(candidate);
          column.insertAdjacentHTML('beforeend', cardHtml);
      }
  });

  // Update column counts
  updateColumnCounts();
}
// Helper function to merge candidates
// Updated mergeCandidates function with better candidate matching
function mergeCandidates(stored, server) {
  if (!Array.isArray(stored)) stored = [];
  if (!Array.isArray(server)) server = [];
  
  const merged = [...stored];
  const seenIds = new Set(stored.map(c => c.id?.toString()));
  
  server.forEach(serverCandidate => {
      const candidateId = (serverCandidate.id_candidate || serverCandidate.candidate_id || serverCandidate.id)?.toString();
      
      if (candidateId && !seenIds.has(candidateId)) {
          merged.push({
              id: candidateId,
              name: serverCandidate.name || 'Unknown',
              jobTitle: serverCandidate.title || serverCandidate.jobTitle || 'No Title',
              email: serverCandidate.email || '',
              stage: serverCandidate.stage || 'new'
          });
          seenIds.add(candidateId);
      }
  });
  
  return merged;
}
function refreshToken() {
  return apiClient.post('/auth/refresh-token/', {}, {
    withCredentials: true
  })
  .then(response => {
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response;
  });
}


// 2. Add this new function after the loadProcess function
function loadSelectedCandidatesIntoNew() {
  const selectedCandidates = JSON.parse(sessionStorage.getItem('selectedCandidates')) || [];
  const newSection = document.getElementById('new');
  
  if (!newSection || selectedCandidates.length === 0) return;

  // Clear existing content
  newSection.innerHTML = '';
  candidatesData = []; // Reset global data

  // Add each selected candidate
  selectedCandidates.forEach((candidate, index) => {
      newSection.innerHTML += createCandidateCard(candidate, index);
  });

  // Initialize Sortable if needed
  if (!newSection.classList.contains('sortable-initialized')) {
      Sortable.create(newSection, {
          group: 'shared',
          animation: 150,
          ghostClass: 'bg-blue-100',
          onEnd: handleDragEnd
      });
      newSection.classList.add('sortable-initialized');
  }
}
//  this  function will add the job post 
function updateEtiquetteDisplay(jobType) {
  if (!jobType) return;
  
  document.getElementById("job_type_etiquette").value = jobType;
  const etiquetteBadge = document.getElementById("etiquette_badge");
  etiquetteBadge.textContent = jobType;
  etiquetteBadge.classList.remove("hidden");
  
  // Set color based on job type
  switch(jobType.toLowerCase()) {
    case 'technique':
    case 'technical':
      etiquetteBadge.className = 'px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800';
      break;
    case 'fonctionnel':
    case 'functional':
      etiquetteBadge.className = 'px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800';
      break;
    case 'technico-fonctionnel':
    case 'technico-functional':
      etiquetteBadge.className = 'px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800';
      break;
    default:
      etiquetteBadge.className = 'px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800';
  }
}
function saveAllCandidatesState() {
  const jobId = jobData.id_Job;
  const updates = [];
  
  // Get all cards from all sections
  ['new', 'preselected', 'interviewed', 'tested', 'proposed', 'interview_partner', 'interview_client_final', 'hired', 'start', 'end'].forEach(stage => {
      const stageElement = document.getElementById(stage);
      if (stageElement) {
          const cards = stageElement.querySelectorAll('[id_cand]');
          cards.forEach(card => {
              updates.push({
                  id_candidate: card.getAttribute('id_cand'),
                  lastStage: stage,
                  date: new Date().toISOString()
              });
          });
      }
  });

}

function refreshCandidateCards(responseData) {
  if (!responseData.updates) return;
  
  responseData.updates.forEach(update => {
      const card = document.querySelector(`[id_cand="${update.candidate_id}"]`);
      if (card) {
          // Update any card attributes/content as needed
          card.setAttribute('data-stage', update.stage);
          const stageContainer = document.getElementById(update.stage);
          if (stageContainer && !stageContainer.contains(card)) {
              stageContainer.appendChild(card);
          }
      }
  });
}

// On page load
function getUrlParams() {
  const params = new URLSearchParams(window.location.search);
  return {
      process: params.get('process') === 'true',
      jobId: params.get('jobId')
  };
}


// Update your window.onload
/*window.onload = () => {
  {   console.log('DOM loaded, updating counts...');   
    updateColumnCounts();      // Also update counts when process view is loaded   
    if (window.location.search.includes('process=true')) 
      {       loadProcess();   } 
    else {
      loadJobDetails();
  }}
};*/

/*document.addEventListener('DOMContentLoaded', () =>
  {   console.log('DOM loaded, updating counts...');   
 updateColumnCounts();      // Also update counts when process view is loaded   
 if (window.location.search.includes('process=true')) 
   {       loadProcess();   } 
 loadJobDetails();
});*/

// Call this in your initialization
//document.addEventListener('DOMContentLoaded', () => {

// initializeCountObserver();
//});
// Single event listener for page initialization
let initialized = false;  // Flag to prevent duplicate initialization

let jobDetailsInitialized = false;
let processInitialized = false;

// Main initialization function
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM Content Loaded');
    
    try {
        // Get URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const isProcessView = urlParams.get('process') === 'true';
        
        // Initialize counters section
        initializeCountersSection();
        
        // Set up navigation buttons
        setupNavigationButtons();
        
        // Always load job details first by default
        if (!isProcessView) {
            await loadJobDetails();
            jobDetailsInitialized = true;
            updateButtonStyles('details');
        } else {
            await loadProcess();
            processInitialized = true;
            updateButtonStyles('process');
        }
        
        // Initialize counts
    initializeCounts();
    
    } catch (error) {
        console.error('Initialization error:', error);
        notifications.showError(error.message);
    }
});
function initializeCountersSection() {
    const main_content = document.getElementById("main-job-content");
    if (!main_content) return;

    // Check if counters section already exists
    let countersDiv = document.getElementById('pipeline-counters');
    if (countersDiv) {
        return; // Already initialized
    }

    // Create the counters section
    countersDiv = document.createElement('div');
    countersDiv.id = 'pipeline-counters';
    countersDiv.className = 'flex items-center mb-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm';
    countersDiv.innerHTML = `
        <div class="flex items-center mr-6">
            <span class="text-sm font-medium dark:text-gray-200">Pipeline:</span>
            <span id="pipeline-count" class="inline-flex ml-2 bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs font-semibold">0</span>
        </div>
        <div class="flex items-center mr-6">
            <span class="text-sm font-medium dark:text-gray-200">Proposed:</span>
            <span id="proposed-count" class="inline-flex ml-2 bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-semibold">0</span>
        </div>
        <div class="flex items-center mr-6">
            <span class="text-sm font-medium dark:text-gray-200">Partner Interview:</span>
            <span id="partner-count" class="inline-flex ml-2 bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-semibold">0</span>
        </div>
        <div class="flex items-center">
            <span class="text-sm font-medium dark:text-gray-200">Hired:</span>
            <span id="hired-count" class="inline-flex ml-2 bg-red-100 text-red-800 px-2 py-0.5 rounded-full text-xs font-semibold">0</span>
        </div>
    `;

    // Insert counters at the beginning of main content
    const firstChild = main_content.firstChild;
    if (firstChild) {
        main_content.insertBefore(countersDiv, firstChild);
    } else {
        main_content.appendChild(countersDiv);
    }

    // Initialize the counts
    updateColumnCounts();
}
let buttonsInitialized = false;

function setupNavigationButtons() {
    if (buttonsInitialized) return; // Prevent multiple initializations
    
    const dtBtn = document.getElementById('dt-btn');
    const processBtn = document.getElementById('process-btn');

    if (dtBtn && processBtn) {
        // Remove all existing event listeners
        dtBtn.replaceWith(dtBtn.cloneNode(true));
        processBtn.replaceWith(processBtn.cloneNode(true));
        
        // Get fresh references after replacing
        const newDtBtn = document.getElementById('dt-btn');
        const newProcessBtn = document.getElementById('process-btn');

        newDtBtn.addEventListener('click', async () => {
            if (processInitialized) {
                destroyExistingSortables();
                const processContent = document.getElementById('job-info');
                if (processContent) {
                    processContent.innerHTML = '';
                }
                processInitialized = false;
            }
            
            if (!jobDetailsInitialized) {
                await loadJobDetails();
                jobDetailsInitialized = true;
            }
            
            updateButtonStyles('details');
        });

        newProcessBtn.addEventListener('click', async () => {
            if (jobDetailsInitialized) {
                const jobInfo = document.getElementById('job-info');
                if (jobInfo) {
                    jobInfo.innerHTML = '';
                }
                jobDetailsInitialized = false;
            }
            
            if (!processInitialized) {
                await loadProcess();
                processInitialized = true;
            }
            
            updateButtonStyles('process');
});

        //buttonsInitialized = true;  // Mark as initialized
    }
}

// If the page is already loaded when the script runs, initialize immediately
/*if (document.readyState !== 'loading' && !initialized) {
    const event = new Event('DOMContentLoaded');
    document.dispatchEvent(event);
}*/
// Helper function to check and load appropriate content
function checkAndLoadContent() {
    const isProcessView = window.location.search.includes('process=true');
    
    if (jobData && jobData.id_Job) {
        if (isProcessView) {
            loadProcess();
        } else {
            loadJobDetails();
        }
    } else {
        // If jobData isn't available yet, retry after a short delay
        setTimeout(checkAndLoadContent, 100);
    }
}
function handleDragStart(event) {
  console.log("Drag started:", event.item);
}
function initializeProcessHandlers() {
  const processButton = document.getElementById('process-selected-btn');
  if (processButton) {
      // Remove existing listeners
      const newButton = processButton.cloneNode(true);
      processButton.parentNode.replaceChild(newButton, processButton);
      
      // Add new listener
      newButton.addEventListener('click', processSelectedCandidates);
  }
}
function loadNewCandidates() {
  const newSection = document.getElementById('new');
  const selectedCandidates = JSON.parse(sessionStorage.getItem('selectedCandidates')) || [];
  
  newSection.innerHTML = '';
  if (selectedCandidates.length === 0) {
      newSection.innerHTML = '<p class="text-gray-600">No candidates selected.</p>';
  } else {
      selectedCandidates.forEach(candidate => {
          const card = `
              <div class="bg-gray-100 dark:bg-gray-700 relative shadow-xl p-5 rounded-xl">
                  <h1 class="text-gray-600 dark:text-gray-200 font-bold">${candidate.name}</h1>
                  <p class="text-gray-400">${candidate.jobTitle}</p>
                  <p class="text-gray-400">${candidate.email}</p>
              </div>
          `;
          newSection.innerHTML += card;
      });
  }
}
function showPartnerInterviewModal(candidateId) {
  const modal = document.getElementById('partnerInterviewModal');
  if (!modal) {
      console.error('Partner interview modal not found');
      return;
  }

  // Store candidate ID in modal's dataset
  modal.dataset.candidateId = candidateId;
  
  // Pre-fill date with today's date
  const dateInput = modal.querySelector('input[name="date"]');
  if (dateInput) {
      const today = new Date().toISOString().split('T')[0];
      dateInput.value = today;
  }

  modal.classList.remove('hidden');
}
function handleDragEnd(evt) {
    const candidateElement = evt.item;  // The card being dragged
    const candidateId = candidateElement.getAttribute('id_cand');


    if (!candidateElement) {
        console.error("Error: candidateElement is null. DragEnd event likely fired on non-candidate.");
        return; // Early exit if there's no candidate element
    }

    const jobId = candidateElement.dataset.jobId ||
                document.getElementById('main-job-content')?.dataset?.jobId ||
                new URLSearchParams(window.location.search).get('jobId');

    const newStage = evt.to.id;
    const oldStage = evt.from.id;

    console.log('handleDragEnd:', { jobId, candidateId, newStage, oldStage });

    if (!candidateId || !jobId) {
        console.error('Missing required data:', {
            candidateId,
            jobId,
            elementData: candidateElement.dataset,
            urlParams: window.location.search
        });
        notifications.showError('Invalid operation context');
        return;
    }
    if(jobId === "undefined" || jobId === null) {
        console.error("Found an ID with an undefined or null value for jobId. Check your elements and data to fix");
    }

    let storedCandidates = JSON.parse(sessionStorage.getItem(`selectedCandidates_${jobId}`)) || [];

    // Update candidate stage
    const updatedCandidates = storedCandidates.map(candidate => {
        const candidateNumId = parseInt(candidate.id_candidate || candidate.id);
        if (candidateNumId === parseInt(candidateId)) {
            return {
                ...candidate,
                stage: newStage,
                jobId: jobId,
                lastModified: new Date().toISOString()
            };
        }
        return candidate;
    });

    // Update session storage
    sessionStorage.setItem(`selectedCandidates_${jobId}`, JSON.stringify(updatedCandidates));
    localStorage.setItem(`jobApplications_${jobId}`, JSON.stringify(updatedCandidates));

    // Prepare update payload
    const updatePayload = {
        candidates: [{
            id_candidate: parseInt(candidateId),
            new_stage: newStage,
            old_stage: oldStage,
            job_id: parseInt(jobId),
            date_updated: new Date().toISOString()
        }]
    };

    // Call interview modals based on the new stage
    switch (newStage) {
        case 'interviewed': // Assuming 'interviewed' means recruiter interview
            showInterviewModal(candidateId);
            break;
        case 'interview_partner':
            showPartnerInterviewModal(candidateId);
            break;
        case 'interview_client_final':
            showClientInterviewModal(candidateId);
            break;
        default:
            // No interview modal needed for this stage
            break;
    }


    apiClient.patch(`/api/job-application/${jobId}/`, updatePayload, {
        withCredentials: true,
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': Cookies.get('csrftoken')
        }
    })
    .then(response => {
        if (response.status === 200) {
            notifications.showSuccess('Position updated successfully');
            // Use the restricted counter update
            updateRestrictedColumnCounts();
        }
    })
    .catch(error => {
        console.error('Server update failed:', error);
        notifications.showError('Failed to update position on server');
    });
}
document.addEventListener('DOMContentLoaded', () => {
    // Set job ID in main container's dataset
    const mainContent = document.getElementById('main-job-content');
    if (mainContent && jobData?.id_Job) {
        mainContent.dataset.jobId = jobData.id_Job;
    }
});
async function loadCandidatesFromServer(jobId) {
    try {
        const response = await apiClient.get(`/api/job-application/${jobId}/`, {
            withCredentials: true,
            headers: {
                'X-CSRFToken': Cookies.get('csrftoken')
            }
        });

        if (response.status === 200 && response.data.applications) {
            // Clear existing candidates
            ['new', 'preselected', 'interviewed', 'tested', 'proposed', 'interview_partner', 'interview_client_final', 'hired', 'start', 'end']
            .forEach(stage => {
                const container = document.getElementById(stage);
                if (container) {
                    container.innerHTML = '';
                }
            });

            // Process and display candidates
            response.data.applications.forEach(candidate => {
                const stage = candidate.stage || 'new';
                const container = document.getElementById(stage);
                if (container) {
                    container.innerHTML += createCandidateCard(candidate);
                }
            });

            // Update counts
            updateColumnCounts();
        }
    } catch (error) {
        console.error('Error fetching candidates:', error);
       // notifications.showError('Error loading candidates');
    }
}
/*document.addEventListener('DOMContentLoaded', () => {
    const jobId = jobData.id_Job;
    if (jobId) {
        loadCandidatesFromServer(jobId);
        }
});*/
function updateProposedCandidatesInput() {
    const jobId = jobData.id_Job;

    // Get the number of proposed candidates
    const storedCandidates = JSON.parse(sessionStorage.getItem(`selectedCandidates_${jobId}`)) || [];
    const proposedCount = storedCandidates.filter(candidate => candidate.stage === 'proposed').length;

    // Update the "candidates-proposed" field
    const candidatesProposedInput = document.getElementById('candidates-proposed');
    if (candidatesProposedInput) {
        candidatesProposedInput.value = proposedCount;
        candidatesProposedInput.setAttribute('value', proposedCount);
    }

    // Update storedProposedCount in localStorage
    localStorage.setItem('proposedCount', proposedCount);

    console.log('Champ "candidates-proposed" mis à jour:', proposedCount);
}
function showClientInterviewModal(candidateId) {
  const modal = document.getElementById('clientInterviewModal');
  if (!modal) {
      console.error('Client interview modal not found');
      return;
  }

  // Store candidate ID in modal's dataset
  modal.dataset.candidateId = candidateId;
  
  // Pre-fill with today's date
  const dateInput = modal.querySelector('input[name="date"]');
  if (dateInput) {
      const today = new Date().toISOString().split('T')[0];
      dateInput.value = today;
  }

  modal.classList.remove('hidden');
}
// Add new save functions for each interview type
function savePartnerInterview(event) {
  event.preventDefault();
  
  // Get candidate ID from modal's dataset
  const modal = document.getElementById('partnerInterviewModal');
  const candidateId = modal?.dataset.candidateId || currentCandidateId;
  
    // ***NEW*** Get the Job ID from the form or container
    const jobId = document.getElementById('main-job-content')?.dataset?.jobId ||
                  jobData?.id_Job ||
                  localStorage.getItem('notificationJobId') ||
                  new URLSearchParams(window.location.search).get('jobId');
  
    if (!candidateId || !jobId) {
      console.error('Missing required IDs:', { candidateId, jobId });
      notifications.showError('Missing candidate or job information');
      return;
  }

  const form = document.getElementById("partnerInterviewForm");
  const formData = new FormData(form);

  // Validate form data
  if (!formData.get('notes') || !formData.get('date') || !formData.get('partner_name')) {
      notifications.showError('Please fill in all required fields');
      return;
  }

  // Format date
  const rawDate = formData.get('date');
  const formattedDate = new Date(rawDate).toISOString().slice(0, 10).replace(/-/g, '/');
  formData.set('date', formattedDate);

  // Log request details for debugging
  console.log('Submitting partner interview:', {
      candidateId,
      jobId: jobId,  // Use the local jobId
      formData: Object.fromEntries(formData)
  });

  apiClient
      .post(`/interview/partner/${candidateId}/${jobId}/`, formData, {
          withCredentials: true,
          headers: {
              'X-CSRFToken': Cookies.get('csrftoken'),
          },
      })
      .then(response => {
          if (response.status === 200) {
              notifications.showSuccess('Partner interview saved successfully');
              closePartnerInterviewModal();
              saveAppChanges();
          }
      })
      .catch(error => {
          console.error('Error saving partner interview:', error);
          let errorMessage = 'Failed to save partner interview. ';
          
          if (error.response?.data?.error) {
              errorMessage += error.response.data.error;
          } else if (error.response?.status === 404) {
              errorMessage += 'Invalid candidate or job ID.';
          } else {
              errorMessage += 'Please try again.';
          }
          
          notifications.showError(errorMessage);
      });
}

// Add clear form functions
function clearPartnerInterviewForm() {
  const form = document.getElementById("partnerInterviewForm");
  if (form) form.reset();
}
function saveClientInterview(event) {
  event.preventDefault();
  
  // Get candidate ID from modal's dataset
  const modal = document.getElementById('clientInterviewModal');
  const candidateId = modal?.dataset.candidateId || currentCandidateId;
  
    // ***NEW*** Get the Job ID from the form or container
    const jobId = document.getElementById('main-job-content')?.dataset?.jobId ||
                  jobData?.id_Job ||
                  localStorage.getItem('notificationJobId') ||
                  new URLSearchParams(window.location.search).get('jobId');
  
  
    if (!candidateId || !jobId) {
      console.error('Missing required IDs:', { candidateId, jobId });
      notifications.showError('Missing candidate or job information');
      return;
  }

  const form = document.getElementById("clientInterviewForm");
  const formData = new FormData(form);

  // Validate form data
  if (!formData.get('notes') || !formData.get('date') || !formData.get('client_name')) {
      notifications.showError('Please fill in all required fields');
      return;
  }

  // Format date
  const rawDate = formData.get('date');
  const formattedDate = new Date(rawDate).toISOString().slice(0, 10).replace(/-/g, '/');
  formData.set('date', formattedDate);

  // Log request details for debugging
  console.log('Submitting client interview:', {
      candidateId,
      jobId: jobId,  // Use the local jobId
      formData: Object.fromEntries(formData)
  });

  apiClient
      .post(`/interview/client/${candidateId}/${jobId}/`, formData, {
          withCredentials: true,
          headers: {
              'X-CSRFToken': Cookies.get('csrftoken'),
          },
      })
      .then(response => {
          if (response.status === 200) {
              notifications.showSuccess('Client interview saved successfully');
              closeClientInterviewModal();
              saveAppChanges();
          }
      })
      .catch(error => {
          console.error('Error saving client interview:', error);
          let errorMessage = 'Failed to save client interview. ';
          
          if (error.response?.data?.error) {
              errorMessage += error.response.data.error;
          } else if (error.response?.status === 404) {
              errorMessage += 'Invalid candidate or job ID.';
          } else {
              errorMessage += 'Please try again.';
          }
          
          notifications.showError(errorMessage);
      });
}
function closeClientInterviewModal() {
  const modal = document.getElementById('clientInterviewModal');
  if (modal) {
      modal.classList.add('hidden');
      delete modal.dataset.candidateId;
      clearClientInterviewForm();
  }
  currentCandidateId = null; // Clear the global tracking
}
function refreshKanbanBoard() {
  const jobId = jobData.id_Job;
  
  apiClient.get(`/api/job-application/${jobId}/`, {
      withCredentials: true
  })
  .then(response => {
      if (response.status === 200 && response.data.applications) {
          // Clear all columns
          ['new', 'preselected', 'interviewed', 'tested', 'proposed', 'interview_partner', 'interview_client_final', 'hired', 'start', 'end']
          .forEach(stage => {
              const container = document.getElementById(stage);
              if (container) {
                  container.innerHTML = '';
              }
          });

          // Only show candidates for this job
          response.data.applications
              .filter(app => app.job_id === jobId)
              .forEach(candidate => {
                  const stage = candidate.stage || 'new';
                  const container = document.getElementById(stage);
                  if (container) {
                      container.innerHTML += createCandidateCard({
                          ...candidate,
                          jobId: jobId
                      });
                  }
              });

          initializeSortable();
      }
  })
  .catch(error => {
      console.error('Failed to refresh board:', error);
      notifications.showError('Failed to refresh the board');
  });
}
function refreshCandidateStages(applications) {
  if (!applications || !applications.length) {
      console.error("No applications to refresh.");  // Debugging
      return;
  }

  // Clear all sections
  ['new', 'preselected', 'interviewed', 'tested', 'proposed', 'interview_partner', 'interview_client_final', 'hired', 'start', 'end'].forEach(stage => {
      const column = document.getElementById(stage);
      if (column) {
          column.innerHTML = ''; // Clear the column
      }
  });

  // Populate sections with updated candidates
  applications.forEach(application => {
      const column = document.getElementById(application.stage);
      if (column) {
          const candidateCard = createCandidateCard(application); // Generate candidate card
          column.innerHTML += candidateCard; // Append to the appropriate section
      } else {
          console.warn(`No column found for stage: ${application.stage}`);
      }
  });

  initializeDragAndDrop();  // Reinitialize drag-and-drop
}
function clearClientInterviewForm() {
  const form = document.getElementById("clientInterviewForm");
  if (form) {
      form.reset();
      // Clear any custom validation states or highlights
      form.querySelectorAll('.is-invalid').forEach(el => {
          el.classList.remove('is-invalid');
      });
  }
}
// Optional: Add form validation
function validateClientInterviewForm(form) {
  const requiredFields = ['client_name', 'date', 'notes'];
  let isValid = true;

  requiredFields.forEach(field => {
      const input = form.elements[field];
      if (!input.value.trim()) {
          input.classList.add('is-invalid');
          isValid = false;
      } else {
          input.classList.remove('is-invalid');
      }
  });

  return isValid;
}
function closePartnerInterviewModal() {
  const modal = document.getElementById('partnerInterviewModal');
  if (modal) {
      modal.classList.add('hidden');
      delete modal.dataset.candidateId;
      clearPartnerInterviewForm();
  }
  currentCandidateId = null; // Clear the global tracking
}
function updateLocalStorage(candidateId, newStage) {
  const jobId = jobData.id_Job;
  let stored = localStorage.getItem(`jobApplications_${jobId}`);
  let updates = stored ? JSON.parse(stored) : [];
  
  const candidateIndex = updates.findIndex(c => c.candidate_id === parseInt(candidateId));
  if (candidateIndex >= 0) {
    updates[candidateIndex].stage = newStage;
  } else {
    updates.push({
      candidate_id: parseInt(candidateId),
      stage: newStage,
      job_id: parseInt(jobId)
    });
  }
  
  localStorage.setItem(`jobApplications_${jobId}`, JSON.stringify(updates));
}

function toggleEditMode() {
  document.querySelectorAll('.editable').forEach(element => {
    // Toggle contenteditable state
    element.contentEditable = (element.contentEditable === "true") ? "false" : "true";
    // Optionally, add some styling to show edit mode
    if (element.contentEditable === "true") {
      element.style.backgroundColor = '#f9f9f9'; // Light grey background for editable state
    } else {
      element.style.backgroundColor = ''; // Reset background color
    }
  });
}
function saveAppChanges() {
  const updatedDataArray = [];

  // Ensure updatedIndex is populated dynamically
  const updatedIndex = Array.from(document.querySelectorAll("[data-index]"))
      .map(element => element.getAttribute("data-index"));

  updatedIndex.forEach(index => {
      const itemElement = document.querySelector(`[data-index='${index}']`);
      if (itemElement) {
          const currentParentId = itemElement.parentElement.id;
          const element = dataArray.find(item => item.index == index); // Find matching element dynamically

          // Validate and prepare data for the backend
          if (element) {
              element.lastStage = currentParentId;
              element.date = new Date().toISOString(); // Send ISO format
              updatedDataArray.push({
                  id_candidate: element.id_candidate,
                  new_stage: element.lastStage,
                  date_updated: element.date,
              });
          }
      }
  });

  const jobId = jobData.id_Job;
  console.log('Payload:', updatedDataArray); // Log payload for debugging

  if (updatedDataArray.length === 0) {
      console.warn('No changes detected.');
      return;
  }

  apiClient.patch(`/api/job-application/${jobId}/`, { candidates: updatedDataArray }, {
      withCredentials: true,
      headers: {
          'X-CSRFToken': Cookies.get('csrftoken'),
      },
  })
  .then(response => {
      console.log('Applications updated successfully:', response.data);
  })
  .catch(error => {
      console.error('Error updating data:', error.response?.data || error.message);
      notifications.showError('Failed to update application changes.');
  });
}
function showSuccessMessage(message) {
  const messageDiv = document.createElement('div');
  messageDiv.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50';
  messageDiv.textContent = message;
  document.body.appendChild(messageDiv);
  setTimeout(() => messageDiv.remove(), 3000);
}
document.getElementById('interviewForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const candidateId = document.getElementById('interviewModal').dataset.candidateId;
  if (!candidateId) {
      notifications.showError('Missing candidate information');
      return;
  }
  id_cand = candidateId;
  saveInterview(e);
});
function refreshView(data) {
  ['new', 'preselected', 'interviewed', 'tested', 'proposed', 'interview_partner', 'interview_client_final', 'hired', 'start', 'end'].forEach(stage => {
    const section = document.getElementById(stage);
    if (section) {
      section.innerHTML = '';
    }
  });

  const candidates = Array.isArray(data) ? data : (data?.updates || []);
  candidates.forEach((candidate, index) => {
    const section = document.getElementById(candidate.stage);
    if (section) {
      section.innerHTML += createCandidateCard({
        id: candidate.candidate_id,
        name: candidate.name || 'Unknown',
        jobTitle: candidate.title || 'No Title',
        email: candidate.email || ''
      }, index);
    }
  });

  initializeSortable();
}
// Function to fetch recruiters
async function getRecruiters() {
    try {
        const response = await apiClient.get('/api/recruiters/', {
            withCredentials: true,
            headers: {
                'X-CSRFToken': Cookies.get('csrftoken')
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching recruiters:', error);
        notifications.showError('Failed to load recruiters');
        return [];
    }
}

function matchInDatabase() {
  document.getElementById('loading-overlay').classList.add('active');
  // Simulate an API call
  setTimeout(() => {
    document.getElementById('loading-overlay').classList.remove('active');
    alert('Matching in database...');
  }, 2000);
}

function load_pipeline() {
  alert('Loading In Pipeline Candidates...');
}

function load_hired() {
  alert('Loading Hired Candidates...');
}

function load_not_available() {
  alert('Loading Not Available Candidates...');
}
function get_candidate(id) {
    const candidateId = parseInt(String(id).trim());

    if (isNaN(candidateId)) {
        console.error('Invalid candidate ID:', id);
        notifications.showError('Invalid candidate ID');
        return;
    }

    // Store the candidate ID in localStorage
    localStorage.setItem('currentCandidateId', candidateId);
    localStorage.setItem('responseData', "");//ADDED FOR UPDATE DATA
    // Make the API call to fetch candidate data
    apiClient.get(`/api/get-candidate/${candidateId}/`, {
        withCredentials: true,
        headers: {
            'X-CSRFToken': Cookies.get('csrftoken')
        }
    })
    .then(response => {
        if (response.status === 200) {
            // Store the candidate data in localStorage
            localStorage.setItem('candidateData', JSON.stringify(response.data));
            localStorage.setItem('profileData', JSON.stringify(response.data));

            // Redirect to the candidate profile page
            window.location.href = `profile.html?candidateId=${candidateId}`;
        } else {
            console.error('Failed to fetch candidate data:', response.statusText);
            notifications.showError('Failed to load candidate profile');
        }
    })
    .catch(error => {
        console.error('Error getting candidate:', error);
        notifications.showError('Failed to load candidate profile');
    });
}

// Initialize drag and drop with status tracking
function initializeDragAndDrop() {
  ['new', 'preselected', 'interviewed', 'tested', 'proposed', 'interview_partner', 'interview_client_final', 'hired', 'start', 'end'].forEach(columnId => {
      const column = document.getElementById(columnId);
      if (column) {
          new Sortable(column, {
              group: 'shared',
              animation: 150,
              ghostClass: 'bg-blue-100',
              onEnd: function(evt) {
                  const targetContainerId = evt.to.id;  // ID of the container where the item was dropped
                  const movedItem = evt.item;
                  const itemIndex = movedItem.getAttribute('data-index');  // Index of the dropped item
                  id_cand = movedItem.getAttribute('id_cand');

                  console.log(`Card with ID ${itemIndex} was dropped in container with ID ${targetContainerId}`);

                  if (targetContainerId === 'interviewed') {
                      clearInterviewForm(); // Clear the form before showing the modal
                      document.getElementById('interviewModal').classList.remove('hidden');
                  }
              }
          });
      }
  });
}
// Fonction pour créer la modale de suppression d'un job
function createDeleteJobModal() {
    // Vérifier si la modale existe déjà
    if (!document.getElementById('deleteJobModal')) {
        document.body.insertAdjacentHTML('beforeend', `
            <div id="deleteJobModal" class="hidden fixed inset-0 z-50 overflow-y-auto bg-gray-500 bg-opacity-75 flex items-center justify-center">
                <div class="relative bg-white dark:bg-boxdark rounded-lg max-w-md w-full mx-4 md:mx-auto shadow-lg">
                    <div class="p-6">
                        <div class="flex items-center justify-center gap-4">
                            <div class="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                                <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                                </svg>
                            </div>
                            <div class="flex-1">
                                <h3 class="text-lg font-medium text-graydark dark:text-white">
                                    Supprimer le job
                                </h3>
                                <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                    Êtes-vous sûr de vouloir supprimer ce job ? Cette action est irréversible.
                                </p>
                            </div>
                        </div>
                        <div class="mt-6 flex justify-end gap-3">
                            <button type="button" id="cancelDeleteJob" class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:bg-boxdark dark:text-white dark:border-strokedark">
                                Annuler
                            </button>
                            <button type="button" id="confirmDeleteJob" class="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                                Supprimer
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `);
    }
}
// Fonction pour afficher la modale de suppression d'un job
function showDeleteJobModal() {
    return new Promise((resolve) => {
        createDeleteJobModal(); // S'assurer que la modale existe

        const modal = document.getElementById('deleteJobModal');
        const cancelButton = document.getElementById('cancelDeleteJob');
        const confirmButton = document.getElementById('confirmDeleteJob');

        // Afficher la modale
        modal.classList.remove('hidden');

        // Gérer le clic sur "Annuler"
        cancelButton.addEventListener('click', () => {
            modal.classList.add('hidden'); // Masquer la modale
            resolve(false); // Résoudre la promesse avec `false` (l'utilisateur a annulé)
        });

        // Gérer le clic sur "Supprimer"
        confirmButton.addEventListener('click', () => {
            modal.classList.add('hidden'); // Masquer la modale
            resolve(true); // Résoudre la promesse avec `true` (l'utilisateur a confirmé)
        });
    });
}
// Fonction pour supprimer un job
async function deleteJob(jobId) {
    const confirmed = await showDeleteJobModal(); // Afficher la modale et attendre la réponse

    if (confirmed) {
        // Si l'utilisateur confirme la suppression
    apiClient
            .delete(`/job/${jobId}/delete/`, {
          withCredentials: true,
          headers: {
                    'X-CSRFToken': Cookies.get('csrftoken'), // Token CSRF
          },
            })
      .then((response) => {
                if (response.status === 200) {
        console.log("Job deleted successfully:", response.data);
                    // Rediriger en fonction de la page précédente
        if (document.referrer) {
          const referrerUrl = document.referrer;
          const pageName = referrerUrl.substring(referrerUrl.lastIndexOf('/') + 1);
          console.log(pageName); // Outputs: profile-client.html
          if (pageName === "profile-client.html") {
            window.location.href = "profile-client.html";
          } else if (pageName === "tables-job.html") {
            window.location.href = "tables-job.html";
                        } else if (pageName === "form-layout-job.html") {
            window.location.href = "profile-client.html";
          }
                    }
        }
      })
      .catch((error) => {
        console.error("Error deleting job:", error);
      });
  }
}
function closeModal(event) {
  event.preventDefault();
  const modal = event.target.closest('.modal');
  if (!modal) return;

  switch(modal.id) {
      case 'interviewModal':
          closeInterviewModal();
          break;
      case 'partnerInterviewModal':
          closePartnerInterviewModal();
          break;
      case 'clientInterviewModal':
          closeClientInterviewModal();
          break;
      default:
          console.warn('Unknown modal:', modal.id);
  }
}
function getCandidateApplications(candidateId) {
  console.log(`Fetching applications for candidate_id: ${candidateId}`);
  apiClient.get(`/api/get-applications/${candidateId}/`, {
      withCredentials: true,
  })
  .then(response => {
      console.log('Applications:', response.data);
      // Process and display applications
  })
  .catch(error => {
      console.error('Error fetching applications:', error.response?.data || error.message);
      notifications.showError('Failed to fetch applications.');
  });
}

function saveInterview(event) {
  event.preventDefault();
  
  // Get candidate ID from modal's dataset
  const interviewModal = document.getElementById('interviewModal');
  const candidateId = interviewModal?.dataset.candidateId || currentCandidateId;
  
    // ***NEW*** Get the Job ID from the form or container
    const jobId = document.getElementById('main-job-content')?.dataset?.jobId ||
      jobData?.id_Job ||
      localStorage.getItem('notificationJobId') ||
      new URLSearchParams(window.location.search).get('jobId');
  
    if (!candidateId || !jobId) {
      console.error('Missing required IDs:', { candidateId, jobId });
      notifications.showError('Missing candidate or job information');
      return;
  }

  const form = document.getElementById("interviewForm");
  const formData = new FormData(form);

  // Ensure date is in the required format
  const rawDate = formData.get('date');
  if (!rawDate) {
      notifications.showError('Please select a date');
      return;
  }

  const formattedDate = new Date(rawDate).toISOString().slice(0, 10).replace(/-/g, '/');
  formData.set('date', formattedDate);

  // Log form data for debugging
  console.log('Submitting interview for candidate:', candidateId);
  console.log('Form data:', Object.fromEntries(formData));

  apiClient
      .post(`/interview/post/${candidateId}/${jobId}/`, formData, {
          withCredentials: true,
          headers: {
              'X-CSRFToken': Cookies.get('csrftoken'),
          },
      })
      .then(response => {
          if (response.status === 200) {
              notifications.showSuccess('Interview saved successfully');
              document.getElementById('interviewModal').classList.add('hidden');
              clearInterviewForm();
              saveAppChanges();
          }
      })
      .catch(error => {
          console.error('Error saving interview:', error);
          let errorMessage = 'Failed to save interview. ';
          
          if (error.response?.data?.error) {
              errorMessage += error.response.data.error;
          } else if (error.response?.status === 404) {
              errorMessage += 'Invalid candidate or job ID.';
          } else {
              errorMessage += 'Please try again.';
          }
          
          notifications.showError(errorMessage);
      });
}
// Update the interview modal setup
function showInterviewModal(candidateId) {
  currentCandidateId = candidateId;
  const modal = document.getElementById('interviewModal');
  modal.dataset.candidateId = candidateId;
  modal.classList.remove('hidden');
  
  // Pre-fill date with today's date
  const dateInput = modal.querySelector('input[name="date"]');
  if (dateInput) {
      const today = new Date().toISOString().split('T')[0];
      dateInput.value = today;
  }
}
function clearInterviewModal() {
  currentCandidateId = null;
  const modal = document.getElementById('interviewModal');
  if (modal) {
      delete modal.dataset.candidateId;
      modal.classList.add('hidden');
  }
}
function clearInterviewForm() {
  const form = document.getElementById("interviewForm");
  form.reset(); // Clear all form fields
}
function initializeDatePickers() {
  const dateInputs = document.querySelectorAll(".form-datepicker");
    
  dateInputs.forEach((input) => {
        // Clear any existing instances
        if (input._flatpickr) {
            input._flatpickr.destroy();
        }

      flatpickr(input, {
            dateFormat: "Y-m-d",
          allowInput: true,
            enableTime: false,
            onChange: function(selectedDates, dateStr, instance) {
                // Log the change
                console.log(`Date changed for ${instance.element.id}:`, dateStr);
                
                // Update the input value
                instance.element.value = dateStr;
                
                // If it's the deadline date, ensure the value is persisted
                if (instance.element.id === 'DeadlineDate') {
                    const currentJobData = JSON.parse(localStorage.getItem('jobData')) || {};
                    currentJobData.deadline_date = dateStr;
                    localStorage.setItem('jobData', JSON.stringify(currentJobData));
                }
            }
      });
  });
}

async function processSelectedCandidates() {
    // 1.  Ensure you have the correct selection
    // Ideally, the list of *selected* candidate IDs should come from a UI element
    // like checkboxes or some other selection mechanism.  For this example, I'm assuming
    // there's a way to identify selected cards in the DOM, e.g., by checking for
    // a specific class.
  
    const selectedCandidates = [];
    document.querySelectorAll('.candidate-card.selected').forEach(card => {
        const candidateId = card.getAttribute('id_cand');
        if (candidateId) {
            selectedCandidates.push(candidateId);
        }
    });
    
    if (selectedCandidates.length === 0) {
        notifications.showError('No candidates selected to process.');
        return;
    }

    const jobId = jobData.id_Job;
    if (!jobId) {
        notifications.showError('No job ID found');
        return;
    }

    try {
      // 2. Format candidates for the backend *ONLY* selected candidates
      const candidateUpdates = selectedCandidates.map(candidateId => ({
          id_candidate: parseInt(candidateId),
            new_stage: 'new',
            job_id: parseInt(jobId),
            date_updated: new Date().toISOString()
        }));

      // 3. Send to backend first (Patch the data).
        const response = await apiClient.patch(`/api/job-application/${jobId}/`, {
            candidates: candidateUpdates
        }, {
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': Cookies.get('csrftoken')
            }
        });

        if (response.status === 200) {
        // 4. Update session storage *ONLY* the selected candidates
            let existingCandidates = JSON.parse(sessionStorage.getItem(`selectedCandidates_${jobId}`)) || [];
            
        // Loop through the selected candidate ID's and make the corresponding candidates new
        selectedCandidates.forEach(candidateId => {
          existingCandidates = existingCandidates.map(candidate => {
            if (parseInt(candidate.id_candidate || candidate.id) === parseInt(candidateId)) {
              return {
                ...candidate,
                        stage: 'new',
                        jobId: jobId
              };
                }
            return candidate;
          });
            });

            // Save to session storage
            sessionStorage.setItem(`selectedCandidates_${jobId}`, JSON.stringify(existingCandidates));
            
            // Also save to local storage for persistence
            localStorage.setItem(`jobApplications_${jobId}`, JSON.stringify(existingCandidates));
            
        // Clear the original selection (remove sessionStorage.removeItem('selectedCandidates'))

            // Update the UI counts
            updateColumnCounts();
            
            // Redirect to process view
            window.location.href = `job-details.html?process=true&jobId=${jobId}`;
        }
    } catch (error) {
        console.error('Error processing candidates:', error);
        notifications.showError('Failed to process candidates');
    }
}
function handleCandidateSelection(analysis) {
    if (!analysis) return;

    const candidateId = getConsistentCandidateId(analysis);
    if (!candidateId) {
        console.error('Invalid candidate ID in analysis data');
        return;
    }

    const candidate = {
        id_candidate: candidateId, // Use consistent ID field
        name: analysis.cv_analysis?.candidate_name || '',
        jobTitle: candidate.current_job_title || candidate.jobTitle || candidate.title || 'No Title', // Standardisation du titre
        email: analysis.cv_analysis?.email || '',
        score: analysis.final_score || 0,
        stage: 'new'
    };

    const jobId = sessionStorage.getItem('currentJobId');
    if (jobId) {
        // Update stored candidates with consistent ID handling
        let selectedCandidates = JSON.parse(sessionStorage.getItem(`selectedCandidates_${jobId}`)) || [];
        
        // Check for existing candidate using consistent ID
        const exists = selectedCandidates.some(c => getConsistentCandidateId(c) === candidateId);
        
        if (!exists) {
            selectedCandidates.push(candidate);
            sessionStorage.setItem(`selectedCandidates_${jobId}`, JSON.stringify(selectedCandidates));
        }
    }
}

// Helper function to ensure candidates are loaded for the correct job
function filterCandidatesForJob(candidates, jobId) {
  if (!Array.isArray(candidates)) return [];
  
  return candidates.filter(candidate => {
      // Check if the candidate is explicitly associated with this job
      // or if it's a server candidate with matching job_id
      return (candidate.jobId === jobId) || 
             (candidate.job_id === jobId) ||
             (candidate.jobId === parseInt(jobId)) ||
             (candidate.job_id === parseInt(jobId));
  });
}



let sortableInstances = {};
function validateSetup() {
  console.log('Validating setup...');
  
  // Check jobData
  console.log('Job Data:', jobData);
  if (!jobData || !jobData.id_Job) {
      console.error('Invalid or missing job data');
  }

  // Check stage containers
  ['new', 'preselected', 'interviewed', 'tested', 'proposed', 'interview_partner', 'interview_client_final', 'hired', 'start', 'end'].forEach(stage => {
      const container = document.getElementById(stage);
      if (!container) {
          console.error(`Missing container for stage: ${stage}`);
      } else {
          console.log(`Found container for ${stage} with ${container.children.length} candidates`);
      }
  });

  // Check candidate cards
  const cards = document.querySelectorAll('[id_cand]');
  cards.forEach(card => {
      console.log('Card data:', {
          id: card.id,
          candidateId: card.getAttribute('id_cand'),
          stage: card.closest('[id]').id
      });
  });
}
// Ajoutez cette fonction pour nettoyer les anciennes instances
function destroyExistingSortables() {
  const stages = ['new', 'preselected', 'interviewed', 'tested', 'proposed', 'interview_partner', 'interview_client_final', 'hired', 'start', 'end'];
  stages.forEach(stage => {
      const element = document.getElementById(stage);
      if (element && element.sortable) {
          element.sortable.destroy();
          element.sortable = null;
      }
  });
}

function initializeSortable() {
  const stages = ['new', 'preselected', 'interviewed', 'tested', 'proposed', 'interview_partner', 'interview_client_final', 'hired', 'start', 'end'];
  
  stages.forEach(stage => {
      const stageElement = document.getElementById(stage);
      if (stageElement) {
          // IMPORTANT : Détruire l'instance existante avant d'en créer une nouvelle
          if (stageElement.sortable) {
              stageElement.sortable.destroy();
          }
          
          const sortable = Sortable.create(stageElement, {
              group: 'shared',
              animation: 150,
              ghostClass: 'bg-blue-100',
              onEnd: handleDragEnd
          });
          
          // Stocker l'instance Sortable sur l'élément
          stageElement.sortable = sortable;
      }
      //updateColumnCounts();

  });
}
function updateColumnCounts() {
    // Initialiser les compteurs
    let pipelineCount = 0;
    let proposedCount = 0;
    let partnerCount = 0;
    let hiredCount = 0;

    // Obtenir l'ID du job
    const jobId = jobData.id_Job;

    // Récupérer les candidats stockés pour ce job
    const storedCandidates = JSON.parse(sessionStorage.getItem(`selectedCandidates_${jobId}`)) || [];
    const proposedCandidates = storedCandidates.filter(candidate => candidate.stage === 'proposed');

    // Calculer les compteurs
    pipelineCount = storedCandidates.length;
    proposedCount = proposedCandidates.length;
    partnerCount = storedCandidates.filter(candidate => candidate.stage === 'interview_partner').length;
    hiredCount = storedCandidates.filter(candidate => candidate.stage === 'hired').length;

    // Mettre à jour l'interface utilisateur
    const elements = {
        'pipeline-count': pipelineCount,
        'proposed-count': proposedCount,
        'partner-count': partnerCount,
        'hired-count': hiredCount
    };

    Object.entries(elements).forEach(([id, count]) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = count;
        }
    });

    // Mettre à jour le champ "candidates-proposed" et storedProposedCount
    updateProposedCandidatesInput();

    console.log('Compteurs finaux:', {
        'Total Pipeline': pipelineCount,
        'Proposed': proposedCount,
        'Partner Interview': partnerCount,
        'Hired': hiredCount,
        'Valeur du champ "Candidates Proposed"': document.getElementById('candidates-proposed')?.value
    });
}

// Add helper function to initialize counts when page loads
function initializeCounts() {
    const storedProposedCount = localStorage.getItem('proposedCount') || '0';
    const candidatesProposedInput = document.getElementById('candidates-proposed');
    console.log('storedProposedCount:',storedProposedCount)

    if (candidatesProposedInput) {
        candidatesProposedInput.value = storedProposedCount;
        candidatesProposedInput.setAttribute('value', storedProposedCount);
    }
    updateColumnCounts();
}
// Add this helper function to verify candidate IDs
function validateCandidateId(id) {
    if (!id) return null;
    
    // Try to parse as integer if it's a string
    const numericId = parseInt(id);
    if (isNaN(numericId)) return null;
    
    return numericId;
}

// Store candidate data globally
let candidatesData = [];
// Add this helper function to ensure consistent ID handling
function getConsistentCandidateId(candidateData) {
    if (!candidateData) return null;
    
    // Try different possible ID fields in order of preference
    const id = candidateData.id_candidate || 
               candidateData.candidate_id || 
               candidateData.id;
    
    if (!id) return null;
    
    // Ensure it's a number
    const numericId = parseInt(id);
    return isNaN(numericId) ? null : numericId;
}

function loadRestrictedJobDetails(jobId) {
    if (!jobId) {
        console.error('No job ID provided to loadRestrictedJobDetails');
        notifications.showError('Invalid job ID');
        return;
    }

    const main_content = document.getElementById("main-job-content");
    if (!main_content) return;

    // Clear any existing content first
    main_content.innerHTML = '';

    // Get stored job data
    const jobData = JSON.parse(localStorage.getItem('jobData') || '{}');

    // Create the base structure with navigation and counters
    main_content.innerHTML = `
        <!-- Navigation Buttons -->
        <div class="flex gap-4 mb-4">
            <button id="dt-btn" class="rounded bg-white px-3 py-1 text-xs font-medium text-black shadow-card hover:bg-white hover:shadow-card dark:bg-boxdark dark:text-white dark:hover:bg-boxdark">
                Details
            </button>
            <button id="process-btn" class="rounded px-3 py-1 text-xs font-medium text-black hover:bg-white hover:shadow-card dark:text-white dark:hover:bg-boxdark">
                Process
            </button>
        </div>

        <!-- Pipeline Counters -->
        <div id="pipeline-counters" class="flex items-center mb-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
            <div class="flex items-center mr-6">
                <span class="text-sm font-medium dark:text-gray-200">Pipeline:</span>
                <span id="pipeline-count" class="inline-flex ml-2 bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs font-semibold">0</span>
            </div>
            <div class="flex items-center mr-6">
                <span class="text-sm font-medium dark:text-gray-200">Proposed:</span>
                <span id="proposed-count" class="inline-flex ml-2 bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-semibold">0</span>
            </div>
            <div class="flex items-center mr-6">
                <span class="text-sm font-medium dark:text-gray-200">Partner Interview:</span>
                <span id="partner-count" class="inline-flex ml-2 bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-semibold">0</span>
            </div>
            <div class="flex items-center">
                <span class="text-sm font-medium dark:text-gray-200">Hired:</span>
                <span id="hired-count" class="inline-flex ml-2 bg-red-100 text-red-800 px-2 py-0.5 rounded-full text-xs font-semibold">0</span>
            </div>
        </div>

        <!-- Main Content Area -->
        <div id="job-info"></div>

        <!-- Interview Modals -->
        <div id="interviewModal" class="hidden fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
            <!-- Interview Modal Content -->
        </div>

        <div id="partnerInterviewModal" class="hidden fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
            <!-- Partner Interview Modal Content -->
        </div>

        <div id="clientInterviewModal" class="hidden fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
            <!-- Client Interview Modal Content -->
        </div>
    `;

    // Initialize views
    const dtBtn = document.getElementById('dt-btn');
    const processBtn = document.getElementById('process-btn');

    dtBtn.addEventListener('click', () => {
        loadRestrictedDetails(jobData);
        dtBtn.className = "rounded bg-white px-3 py-1 text-xs font-medium text-black shadow-card hover:bg-white hover:shadow-card dark:bg-boxdark dark:text-white dark:hover:bg-boxdark";
        processBtn.className = "rounded px-3 py-1 text-xs font-medium text-black hover:bg-white hover:shadow-card dark:text-white dark:hover:bg-boxdark";
    });

    processBtn.addEventListener('click', () => {
        loadRestrictedProcess(jobId);
        dtBtn.className = "rounded px-3 py-1 text-xs font-medium text-black hover:bg-white hover:shadow-card dark:text-white dark:hover:bg-boxdark";
        processBtn.className = "rounded bg-white px-3 py-1 text-xs font-medium text-black shadow-card hover:bg-white hover:shadow-card dark:bg-boxdark dark:text-white dark:hover:bg-boxdark";
    });

    // Load initial details view
    loadRestrictedDetails(jobData);

    // Initialize data
    initializeData(jobId);
    // Replace this
    initializeSortable();

    // With this
    initializeRestrictedSortable(jobId);
}
// Helper function to initialize data
async function initializeData(jobId) {
    try {
        // Load candidates from server
        const response = await apiClient.get(`/api/job-application/${jobId}/`, {
            withCredentials: true,
            headers: {
                'X-CSRFToken': Cookies.get('csrftoken'),
                'X-From-Notification': 'true'
            }
        });

        if (response.status === 200 && response.data.applications) {
            // Merge with any existing local data
            const storedCandidates = JSON.parse(sessionStorage.getItem(`selectedCandidates_${jobId}`)) || [];
            const mergedCandidates = mergeCandidatesWithPriority(
                storedCandidates,
                [],
                response.data.applications,
                jobId
            );

            // Update storage
            sessionStorage.setItem(`selectedCandidates_${jobId}`, JSON.stringify(mergedCandidates));
            localStorage.setItem(`jobApplications_${jobId}`, JSON.stringify(mergedCandidates));
        }

        // Update UI elements
        updateColumnCounts();
        initializeSortable();

    } catch (error) {
        console.error('Error initializing data:', error);
        notifications.showError('Error loading job data');
    }
}

function loadRestrictedDetails(jobData) {
    const jobInfo = document.getElementById('job-info');
    if (!jobInfo) return;

    jobInfo.innerHTML = `
        <div class="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div class="border-b border-stroke px-7 py-4 dark:border-strokedark">
                <h3 class="font-medium text-black dark:text-white">
                    ${jobData.title || 'Job Details'}
                </h3>
            </div>
            <div class="p-7">
                <div class="mb-5.5">
                    <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                        Status
                    </label>
                    <div class="text-sm">${jobData.status || 'N/A'}</div>
                </div>
                
                <div class="mb-5.5">
                    <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                        Location
                    </label>
                    <div class="text-sm">${jobData.location || 'N/A'}</div>
                </div>

               

                <div class="mb-5.5">
                    <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                        Budget
                    </label>
                    <div class="text-sm">${jobData.budget || 'N/A'}</div>
                </div>

                <div class="mb-5.5">
                    <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                        Number of Positions
                    </label>
                    <div class="text-sm">${jobData.nb_positions || 'N/A'}</div>
                </div>

                <div class="mb-5.5">
                    <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                        Deadline
                    </label>
                    <div class="text-sm">
                        ${jobData.deadline_date || 'N/A'}
                    </div>
                </div>
                 <div class="mb-5.5">
                    <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                        Key Skills
                    </label>
                    <div class="text-sm">${jobData.competence_phare || 'N/A'}</div>
                </div>
                <div class="mb-5.5">
                    <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                        Description
                    </label>
                    <div class="text-sm whitespace-pre-wrap">${jobData.description || 'N/A'}</div>
                </div>
            </div>
            
        </div>
    `;
}

// First check permissions and route accordingly
async function loadProcessView() {
    // Get jobId from multiple sources
    const urlParams = new URLSearchParams(window.location.search);
    const jobId = urlParams.get('jobId') || 
                 localStorage.getItem('notificationJobId') || 
                 (jobData && jobData.id_Job);

    if (!jobId) {
        console.error('No job ID available');
        notifications.showError('Job ID not found');
        return;
    }

    try {
        // Check notifications for assignment
        const notificationsResponse = await apiClient.get('/api/get-notifications/', {
            withCredentials: true,
            headers: {
                'X-CSRFToken': Cookies.get('csrftoken')
            }
        });

        const isAssigned = notificationsResponse.data.some(notif => 
            notif.job_id === parseInt(jobId) && 
            notif.type === 'job_assignment'
        );

        // If user is assigned or is superuser, load full process view
        const isSuperuser = localStorage.getItem('role') === 'true';
        
        if (isAssigned || isSuperuser) {
            loadProcess();
        } else {
            // Load restricted view for non-assigned users
            loadRestrictedProcess();
        }

    } catch (error) {
        console.error('Error checking permissions:', error);
        // If there's an error checking permissions, default to restricted view
        loadRestrictedProcess();
    }
}

// Restricted view for non-assigned users
function loadRestrictedProcess(jobId) {
    // Get jobId from multiple possible sources
    const effectiveJobId = jobId || 
                          jobData?.id_Job || 
                          localStorage.getItem('notificationJobId') ||
                          new URLSearchParams(window.location.search).get('jobId');

    if (!effectiveJobId) {
        console.error('No job ID provided to loadRestrictedProcess');
        notifications.showError('Job ID not found');
        return;
    }

    // Store jobId in main container's dataset
    const main_content = document.getElementById("main-job-content");
    if (main_content) {
        main_content.dataset.jobId = effectiveJobId;
    }

    // Clear existing content
    const existingJobInfo = document.getElementById('job-info');
    if (existingJobInfo) {
        existingJobInfo.remove();
    }

    const targetDiv = document.createElement('div');
    targetDiv.id = 'job-info';
    targetDiv.dataset.jobId = effectiveJobId; //

    // Create the process layout with all sections
    targetDiv.innerHTML = `
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5 2xl:grid-cols-5">
            <!-- New Column -->
            <div class="relative flex flex-col bg-white border border-stroke rounded-lg shadow-default dark:border-strokedark dark:bg-boxdark">
                <div class="flex items-center justify-between px-4 py-3 border-b border-stroke dark:border-strokedark">
                    <h4 class="text-sm font-medium text-black dark:text-white">
                        New
                        <span id="new-count" class="inline-flex ml-2 text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full">0</span>
                    </h4>
                </div>
                <div id="new" class="p-4 min-h-[200px]"></div>
            </div>

            <!-- Preselected Column -->
            <div class="relative flex flex-col bg-white border border-stroke rounded-lg shadow-default dark:border-strokedark dark:bg-boxdark">
                <div class="flex items-center justify-between px-4 py-3 border-b border-stroke dark:border-strokedark">
                    <h4 class="text-sm font-medium text-black dark:text-white">
                        Preselected
                        <span id="preselected-count" class="inline-flex ml-2 text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full">0</span>
                    </h4>
                </div>
                <div id="preselected" class="p-4 min-h-[200px]"></div>
            </div>

            <!-- Interviewed Column -->
            <div class="relative flex flex-col bg-white border border-stroke rounded-lg shadow-default dark:border-strokedark dark:bg-boxdark">
                <div class="flex items-center justify-between px-4 py-3 border-b border-stroke dark:border-strokedark">
                    <h4 class="text-sm font-medium text-black dark:text-white">
                        Interviewed
                        <span id="interviewed-count" class="inline-flex ml-2 text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full">0</span>
                    </h4>
                </div>
                <div id="interviewed" class="p-4 min-h-[200px]"></div>
            </div>

            <!-- Tested Column -->
            <div class="relative flex flex-col bg-white border border-stroke rounded-lg shadow-default dark:border-strokedark dark:bg-boxdark">
                <div class="flex items-center justify-between px-4 py-3 border-b border-stroke dark:border-strokedark">
                    <h4 class="text-sm font-medium text-black dark:text-white">
                        Tested
                        <span id="tested-count" class="inline-flex ml-2 text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full">0</span>
                    </h4>
                </div>
                <div id="tested" class="p-4 min-h-[200px]"></div>
            </div>

            <!-- Proposed Column -->
            <div class="relative flex flex-col bg-white border border-stroke rounded-lg shadow-default dark:border-strokedark dark:bg-boxdark">
                <div class="flex items-center justify-between px-4 py-3 border-b border-stroke dark:border-strokedark">
                    <h4 class="text-sm font-medium text-black dark:text-white">
                        Proposed
                        <span id="proposed-count" class="inline-flex ml-2 text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full">0</span>
                    </h4>
                </div>
                <div id="proposed" class="p-4 min-h-[200px]"></div>
            </div>

            <!-- Partner Interview Column -->
            <div class="relative flex flex-col bg-white border border-stroke rounded-lg shadow-default dark:border-strokedark dark:bg-boxdark">
                <div class="flex items-center justify-between px-4 py-3 border-b border-stroke dark:border-strokedark">
                    <h4 class="text-sm font-medium text-black dark:text-white">
                        Partner Interview
                        <span id="interview_partner-count" class="inline-flex ml-2 text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full">0</span>
                    </h4>
                </div>
                <div id="interview_partner" class="p-4 min-h-[200px]"></div>
            </div>

            <!-- Client Final Interview Column -->
            <div class="relative flex flex-col bg-white border border-stroke rounded-lg shadow-default dark:border-strokedark dark:bg-boxdark">
                <div class="flex items-center justify-between px-4 py-3 border-b border-stroke dark:border-strokedark">
                    <h4 class="text-sm font-medium text-black dark:text-white">
                        Client Interview
                        <span id="interview_client_final-count" class="inline-flex ml-2 text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full">0</span>
                    </h4>
                </div>
                <div id="interview_client_final" class="p-4 min-h-[200px]"></div>
            </div>

            <!-- Hired Column -->
            <div class="relative flex flex-col bg-white border border-stroke rounded-lg shadow-default dark:border-strokedark dark:bg-boxdark">
                <div class="flex items-center justify-between px-4 py-3 border-b border-stroke dark:border-strokedark">
                    <h4 class="text-sm font-medium text-black dark:text-white">
                        Hired
                        <span id="hired-count" class="inline-flex ml-2 text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full">0</span>
                    </h4>
                </div>
                <div id="hired" class="p-4 min-h-[200px]"></div>
            </div>

            <!-- Start Column -->
            <div class="relative flex flex-col bg-white border border-stroke rounded-lg shadow-default dark:border-strokedark dark:bg-boxdark">
                <div class="flex items-center justify-between px-4 py-3 border-b border-stroke dark:border-strokedark">
                    <h4 class="text-sm font-medium text-black dark:text-white">
                        Started
                        <span id="start-count" class="inline-flex ml-2 text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full">0</span>
                    </h4>
                </div>
                <div id="start" class="p-4 min-h-[200px]"></div>
            </div>

            <!-- End Column -->
            <div class="relative flex flex-col bg-white border border-stroke rounded-lg shadow-default dark:border-strokedark dark:bg-boxdark">
                <div class="flex items-center justify-between px-4 py-3 border-b border-stroke dark:border-strokedark">
                    <h4 class="text-sm font-medium text-black dark:text-white">
                        Ended
                        <span id="end-count" class="inline-flex ml-2 text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full">0</span>
                    </h4>
                </div>
                <div id="end" class="p-4 min-h-[200px]"></div>
            </div>
        </div>

        <!-- Interview Modals -->
        <div id="interviewModal" class="hidden fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-boxdark">
                <h3 class="text-lg font-medium text-black dark:text-white mb-4">Interview Details</h3>
                <form id="interviewForm" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-black dark:text-white">Date</label>
                        <input type="date" name="date" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-boxdark dark:border-strokedark" required>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-black dark:text-white">Notes</label>
                        <textarea name="notes" rows="4" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-boxdark dark:border-strokedark"></textarea>
                    </div>
                    <div class="flex justify-end space-x-2">
                        <button type="button" onclick="closeModal(event)" class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-boxdark dark:text-white dark:border-strokedark">Cancel</button>
                        <button type="submit" class="px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md hover:bg-opacity-90">Save</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    main_content.appendChild(targetDiv);

    // Initialize functionality
    initializeRestrictedProcess(jobId);
}
function handleRestrictedDragEnd(evt) {
    // Get jobId from multiple sources
    const jobId = evt.jobId || 
                 evt.from.dataset.jobId || 
                 document.getElementById('main-job-content')?.dataset?.jobId ||
                 jobData?.id_Job;

    const candidateId = evt.item.getAttribute('id_cand');
    const newStage = evt.to.id;
    const oldStage = evt.from.id;

    console.log('Restricted drag event:', { jobId, candidateId, newStage, oldStage });

    if (!candidateId || !jobId) {
        console.error('Missing required data:', { candidateId, jobId });
        notifications.showError('Error updating candidate position');
        // Revert the drag
        if (evt.from) {
            evt.from.appendChild(evt.item);
        }
        return;
    }

    // Allow moves within the same stage
    if (oldStage === newStage) {
        console.log('Same stage move detected');
        // Just update the order without validation
        let storedCandidates = JSON.parse(sessionStorage.getItem(`selectedCandidates_${jobId}`)) || [];
        sessionStorage.setItem(`selectedCandidates_${jobId}`, JSON.stringify(storedCandidates));
        return;
    }

    // Get stored candidates
    let storedCandidates = JSON.parse(sessionStorage.getItem(`selectedCandidates_${jobId}`)) || [];
    
    // Update candidate stage
    const updatedCandidates = storedCandidates.map(candidate => {
        const candidateNumId = parseInt(candidate.id_candidate || candidate.id);
        if (candidateNumId === parseInt(candidateId)) {
            return {
                ...candidate,
                stage: newStage,
                lastModified: new Date().toISOString()
            };
        }
        return candidate;
    });

    // Update session storage
    sessionStorage.setItem(`selectedCandidates_${jobId}`, JSON.stringify(updatedCandidates));
    localStorage.setItem(`jobApplications_${jobId}`, JSON.stringify(updatedCandidates));

    // Prepare update payload
    const updatePayload = {
        candidates: [{
            id_candidate: parseInt(candidateId),
            new_stage: newStage,
            old_stage: oldStage,
            job_id: parseInt(jobId),
            date_updated: new Date().toISOString()
        }]
    };

    apiClient.patch(`/api/job-application/${jobId}/`, updatePayload, {
        withCredentials: true,
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': Cookies.get('csrftoken')
        }
    })
    .then(response => {
        if (response.status === 200) {
            notifications.showSuccess('Position updated successfully');
            // Use the restricted counter update
            updateRestrictedColumnCounts();
        }
    })
    .catch(error => {
        console.error('Server update failed:', error);
        notifications.showError('Failed to update position on server');
        
        // Revert the drag
        if (evt.from) {
            evt.from.appendChild(evt.item);
            
            // Revert storage updates
            const revertedCandidates = storedCandidates.map(candidate => {
                const candidateNumId = parseInt(candidate.id_candidate || candidate.id);
                if (candidateNumId === parseInt(candidateId)) {
                    return {
                        ...candidate,
                        stage: oldStage
                    };
                }
                return candidate;
            });
            
            sessionStorage.setItem(`selectedCandidates_${jobId}`, JSON.stringify(revertedCandidates));
            localStorage.setItem(`jobApplications_${jobId}`, JSON.stringify(revertedCandidates));
            
            // Use the restricted counter update after revert
            updateRestrictedColumnCounts();
        }
    });

}

// Function to handle order updates within the same stage
function updateCandidateOrder(candidateId, stage, jobId) {
    const container = document.getElementById(stage);
    if (!container) return;

    // Get all candidates in the current stage
    const candidates = Array.from(container.children).map(child => ({
        id: child.getAttribute('id_cand'),
        order: Array.from(container.children).indexOf(child)
    }));

    // Update local storage with new order
    const storedCandidates = JSON.parse(sessionStorage.getItem(`selectedCandidates_${jobId}`)) || [];
    const updatedCandidates = storedCandidates.map(candidate => {
        const candidateNumId = parseInt(candidate.id_candidate || candidate.id);
        const orderInfo = candidates.find(c => parseInt(c.id) === candidateNumId);
        if (orderInfo) {
            return {
                ...candidate,
                order: orderInfo.order
            };
        }
        return candidate;
    });

    // Update storage
    sessionStorage.setItem(`selectedCandidates_${jobId}`, JSON.stringify(updatedCandidates));
    localStorage.setItem(`jobApplications_${jobId}`, JSON.stringify(updatedCandidates));
}
function updateRestrictedColumnCounts() {
    const jobId = jobData?.id_Job ||
                 document.getElementById('main-job-content')?.dataset?.jobId ||
                 localStorage.getItem('notificationJobId') ||
                 new URLSearchParams(window.location.search).get('jobId');

    if (!jobId) {
        console.error('No jobId available for updating counts in updateRestrictedColumnCounts');
        return;
    }

    console.log('Updating restricted counts for jobId:', jobId);

    const storedCandidatesString = sessionStorage.getItem(`selectedCandidates_${jobId}`);
    console.log('storedCandidatesString:', storedCandidatesString);

    const storedCandidates = JSON.parse(storedCandidatesString) || [];
    console.log('storedCandidates:', storedCandidates);

    const proposedCandidates = storedCandidates.filter(c => c.stage === 'proposed');
    console.log('proposedCandidates:', proposedCandidates);

    const partnerCount = storedCandidates.filter(candidate => candidate.stage === 'interview_partner').length;
    const hiredCount = storedCandidates.filter(candidate => candidate.stage === 'hired').length;

    const counts = {
        'pipeline-count': storedCandidates.length,
        'proposed-count': proposedCandidates.length,
        'partner-count': partnerCount,
        'hired-count': hiredCount
    };

    Object.entries(counts).forEach(([id, count]) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = count;
        }
    });

    const candidatesProposedInput = document.getElementById('candidates-proposed');
    if (candidatesProposedInput) {
        candidatesProposedInput.value = counts['proposed-count'];
        localStorage.setItem('proposedCount', counts['proposed-count'].toString());
    }

    console.log('Restricted counts:', counts);
}
function initializeRestrictedSortable(jobId) {
    if (!jobId) {
        console.error('No jobId provided to initializeRestrictedSortable');
        return;
    }

    console.log('Initializing restricted sortable with jobId:', jobId);
    
    const stages = ['new', 'preselected', 'interviewed', 'tested', 'proposed', 
                   'interview_partner', 'interview_client_final', 'hired', 'start', 'end'];
    
    stages.forEach(stage => {
        const container = document.getElementById(stage);
        if (container) {
            // Clean up existing instance
            if (container.sortable) {
                container.sortable.destroy();
            }

            // Store jobId in container's dataset
            container.dataset.jobId = jobId;

            // Create new instance with restricted handler
            container.sortable = Sortable.create(container, {
                group: 'restricted-shared',  // Use same group name for all columns
                animation: 150,
                ghostClass: 'bg-blue-100',
                draggable: '.cursor-move',
                onStart: function(evt) {
                    evt.item.classList.add('dragging');
                },
                onEnd: function(evt) {
                    evt.jobId = jobId;
                    handleRestrictedDragEnd(evt);
                    evt.item.classList.remove('dragging');
                },
                sort: true,  // Enable sorting within lists
                onChoose: function(evt) {
                    evt.item.classList.add('selected');
                },
                onUnchoose: function(evt) {
                    evt.item.classList.remove('selected');
                },
                filter: '.nodrag',  // Elements with this class won't be draggable
                preventOnFilter: true
            });

            // Add drag handle to cards if needed
            container.querySelectorAll('.cursor-move').forEach(card => {
                if (!card.querySelector('.drag-handle')) {
                    const handle = document.createElement('div');
                    handle.className = 'drag-handle';
                    card.insertBefore(handle, card.firstChild);
                }
            });
        }
    });
}
function updateCandidatePosition(candidateId, newStage, oldStage, jobId) {
    if (!candidateId || !jobId) {
        console.error('Missing required data:', { candidateId, jobId });
        notifications.showError('Error updating candidate position');
        return;
    }

    // Get current state from session storage
    let storedCandidates = JSON.parse(sessionStorage.getItem(`selectedCandidates_${jobId}`)) || [];
    
    // Update candidate stage
    const updatedCandidates = storedCandidates.map(candidate => {
        const candidateNumId = parseInt(candidate.id_candidate || candidate.id);
        if (candidateNumId === parseInt(candidateId)) {
            return {
                ...candidate,
                stage: newStage,
                lastModified: new Date().toISOString()
            };
        }
        return candidate;
    });

    // Update session storage
    sessionStorage.setItem(`selectedCandidates_${jobId}`, JSON.stringify(updatedCandidates));
    
    // Update local storage
    localStorage.setItem(`jobApplications_${jobId}`, JSON.stringify(updatedCandidates));

    // Prepare update payload
    const updatePayload = {
        candidates: [{
            id_candidate: parseInt(candidateId),
            new_stage: newStage,
            old_stage: oldStage,
            job_id: parseInt(jobId),
            date_updated: new Date().toISOString()
        }]
    };

    // Update server using restricted endpoint
    apiClient.patch(`/api/restricted-job-application/${jobId}/`, updatePayload, {
        withCredentials: true,
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': Cookies.get('csrftoken'),
            'X-From-Notification': 'true'
        }
    })
    .then(response => {
        if (response.status === 200) {
            notifications.showSuccess('Position updated successfully');
            updateColumnCounts();
        }
    })
    .catch(error => {
        console.error('Server update failed:', error);
        notifications.showError('Failed to update position on server');
        
        // Revert the drag in UI
        const candidateElement = document.querySelector(`[id_cand="${candidateId}"]`);
        const oldContainer = document.getElementById(oldStage);
        if (candidateElement && oldContainer) {
            oldContainer.appendChild(candidateElement);
        }
        
        // Revert storage updates
        sessionStorage.setItem(`selectedCandidates_${jobId}`, JSON.stringify(storedCandidates));
        localStorage.setItem(`jobApplications_${jobId}`, JSON.stringify(storedCandidates));
        
        updateColumnCounts();
    });
}
// Function to initialize the restricted process functionality
function initializeRestrictedProcess(jobId) {
    if (!jobId) {
        console.error('No jobId provided to initializeRestrictedProcess');
        return;
    }

    console.log('Initializing restricted process with jobId:', jobId);

    // First get stored candidates
    const storedCandidates = JSON.parse(sessionStorage.getItem(`selectedCandidates_${jobId}`)) || [];

    // Then fetch from server
    apiClient.get(`/api/job-application/${jobId}/`, {
        withCredentials: true,
        headers: {
            'X-CSRFToken': Cookies.get('csrftoken'),
            'X-From-Notification': 'true'
        }
    })
    .then(response => {
        if (response.status === 200 && response.data.applications) {
            // Merge server candidates with stored candidates
            const serverCandidates = response.data.applications;
            const allCandidates = mergeCandidatesWithPriority(
                storedCandidates,
                [],
                serverCandidates,
                jobId
            );

            // Store merged candidates
            sessionStorage.setItem(`selectedCandidates_${jobId}`, JSON.stringify(allCandidates));
            localStorage.setItem(`jobApplications_${jobId}`, JSON.stringify(allCandidates));

            // Distribute candidates to columns
            distributeToColumns(allCandidates);

            // Initialize sortable
            initializeRestrictedSortable(jobId);
            
            // Update counts using restricted counter function
            updateRestrictedColumnCounts();
        }
    })
    .catch(error => {
        console.error('Error loading candidates:', error);
        notifications.showError('Error loading candidates');
        
        // If we have stored candidates, still show them
        if (storedCandidates.length > 0) {
            distributeToColumns(storedCandidates);
            initializeRestrictedSortable(jobId);
            updateRestrictedColumnCounts();
        }
    });
}

// Update your event listeners
/*document.addEventListener('DOMContentLoaded', () => {
    // Check if we're in process view
    if (window.location.search.includes('process=true')) {
        loadProcessView();  // This will check permissions and load appropriate view
    }

    // Add click handler for process button
    const processBtn = document.getElementById('process-btn');
    if (processBtn) {
        processBtn.addEventListener('click', loadProcessView);
    }
});*/
// Function to set up modal event listeners
function setupModalListeners() {
    // Interview form submission
    const interviewForm = document.getElementById('interviewForm');
    if (interviewForm) {
        interviewForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await saveInterview(e);
        });
    }

    // Close modal when clicking outside
    const modals = ['interviewModal', 'partnerInterviewModal', 'clientInterviewModal'];
    modals.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    closeModal(e);
                }
            });
        }
    });
}
// Helper function to load from stored data
function loadRestrictedJobDetailsFromStored(jobData, container) {
    container.innerHTML = `
        <div class="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div class="border-b border-stroke px-7 py-4 dark:border-strokedark">
                <h3 class="font-medium text-black dark:text-white">
                    ${jobData.title || 'Assigned Job Details'}
                </h3>
            </div>
            <!-- Rest of the job details HTML -->
        </div>
    `;
}

// Modify your existing window.onload or DOMContentLoaded handler

async function populateRecruiterDropdown() {
    try {
        const response = await apiClient.get('/api/recruiters/', {
            withCredentials: true,
            headers: {
                'X-CSRFToken': Cookies.get('csrftoken')
            }
        });

        const select = document.getElementById('section-recruiter-select');
        if (select) {
            // Clear existing options except the first one
            while (select.options.length > 1) {
                select.remove(1);
            }

            response.data.forEach(recruiter => {
                const option = document.createElement('option');
                option.value = recruiter.id;
                option.textContent = `${recruiter.first_name} ${recruiter.last_name}`;
                option.className = 'py-2 px-3 text-black dark:text-white';
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error populating dropdown:', error);
        notifications.showError('Failed to load recruiters list');
    }
}
function addRecruiterDropdownToSection() {
    const newSection = document.getElementById('new');
    if (!newSection) return;

    // Check if dropdown already exists
    if (document.getElementById('recruiter-section-dropdown')) return;

    const dropdownContainer = document.createElement('div');
    dropdownContainer.id = 'recruiter-section-dropdown';
    dropdownContainer.className = 'w-full p-4 bg-white dark:bg-boxdark border-b border-stroke dark:border-strokedark';
    dropdownContainer.innerHTML = `
        <div class="flex flex-col gap-2 w-full">
            <label for="section-recruiter-select" class="text-sm font-medium text-black dark:text-white">
                Assign to Recruiter:
            </label>
            <div class="flex items-center gap-2">
                <select 
                    id="section-recruiter-select"
                    class="w-full h-10 rounded-md border border-gray-300 bg-white px-3 text-black text-base focus:border-primary focus:ring-1 focus:ring-primary dark:border-strokedark dark:bg-boxdark dark:text-white"
                >
                    <option value="" disabled selected>Select a recruiter...</option>
                </select>
                <button 
                    id="assign-recruiter-btn"
                    class="h-10 rounded-md bg-primary px-4 text-white hover:bg-opacity-90 disabled:bg-gray-400"
                    disabled
                >
                    Assign
                </button>
            </div>
        </div>
    `;

    // Insert at the top of the new section
    newSection.insertBefore(dropdownContainer, newSection.firstChild);

    // Populate dropdown with recruiters
    populateRecruiterDropdown();

    // Event listeners
    const select = document.getElementById('section-recruiter-select');
    const assignButton = document.getElementById('assign-recruiter-btn');

    select.addEventListener('change', (e) => {
        assignButton.disabled = !e.target.value;
    });

    assignButton.addEventListener('click', async () => {
        const recruiterId = select.value;
        if (!recruiterId) {
            notifications.showError('Please select a recruiter');
            return;
        }

        try {
            assignButton.disabled = true;
            const candidateCards = newSection.querySelectorAll('[id_cand]');
            
            for (const card of candidateCards) {
                const candidateId = card.getAttribute('id_cand');
                await assignRecruiter(candidateId, recruiterId);
            }
            
            notifications.showSuccess('Candidates assigned successfully');
            updateColumnCounts();
        } catch (error) {
            console.error('Error assigning candidates:', error);
            notifications.showError('Failed to assign candidates');
        } finally {
            assignButton.disabled = false;
            select.value = ''; // Reset selection
        }
    });
}
async function assignRecruiter(candidateId, recruiterId) {
    if (!recruiterId) {
        notifications.showError('Please select a recruiter');
        return;
    }

    const jobId = jobData.id_Job;

    try {
        // First assign the candidate
        const assignResponse = await apiClient.post(`/api/assign-candidate/${candidateId}/`, {
            recruiter_id: recruiterId
        }, {
            withCredentials: true,
            headers: {
                'X-CSRFToken': Cookies.get('csrftoken')
            }
        });

        if (assignResponse.status === 200) {
            // Create notification
            const notificationResponse = await apiClient.post('/api/create-notification/', {
                recruiter_id: recruiterId,
                candidate_id: candidateId,
                job_id: jobId,
                content: 'New assignment',
                is_confirmed: false
            }, {
                withCredentials: true,
                headers: {
                    'X-CSRFToken': Cookies.get('csrftoken')
                }
            });

            if (notificationResponse.status === 201) {
                // Update candidate stage in local storage and session storage
                const storedCandidates = JSON.parse(sessionStorage.getItem(`selectedCandidates_${jobId}`)) || [];
                
                const updatedCandidates = storedCandidates.map(candidate => {
                    if (parseInt(candidate.id_candidate || candidate.id) === parseInt(candidateId)) {
                        return {
                            ...candidate,
                            stage: 'preselected',
                            recruiterId: recruiterId,
                            lastModified: new Date().toISOString()
                        };
                    }
                    return candidate;
                });

                // Update storage
                sessionStorage.setItem(`selectedCandidates_${jobId}`, JSON.stringify(updatedCandidates));
                localStorage.setItem(`jobApplications_${jobId}`, JSON.stringify(updatedCandidates));

                // Update server status
                await apiClient.patch(`/api/job-application/${jobId}/`, {
                    candidates: [{
                        id_candidate: parseInt(candidateId),
                        new_stage: 'preselected',
                        job_id: parseInt(jobId),
                        date_updated: new Date().toISOString()
                    }]
                }, {
                    withCredentials: true,
                    headers: {
                        'X-CSRFToken': Cookies.get('csrftoken'),
                        'Content-Type': 'application/json'
                    }
                });

                // Update UI
                const candidateElement = document.querySelector(`[id_cand="${candidateId}"]`);
                if (candidateElement) {
                    const preselectedColumn = document.getElementById('preselected');
                    if (preselectedColumn) {
                        preselectedColumn.appendChild(candidateElement);
                    }
                }

                // Update column counts
                updateColumnCounts();
                
                notifications.showSuccess('Candidate assigned successfully');
            }
        }
    } catch (error) {
        console.error('Assignment error:', error);
        notifications.showError('Failed to assign candidate');
        throw error;
    }
}
// Function to refresh candidate display after assignment
async function refreshCandidateDisplay(jobId) {
    try {
        // Get all candidates from server
        const response = await apiClient.get(`/api/job-application/${jobId}/`, {
            withCredentials: true,
            headers: {
                'X-CSRFToken': Cookies.get('csrftoken')
            }
        });

        if (response.status === 200) {
            const serverCandidates = response.data.applications || [];
            
            // Get stored candidates
            const storedCandidates = JSON.parse(sessionStorage.getItem(`selectedCandidates_${jobId}`)) || [];
            
            // Merge candidates with priority to server data
            const mergedCandidates = mergeCandidatesWithPriority(storedCandidates, [], serverCandidates, jobId);
            
            // Update storage
            sessionStorage.setItem(`selectedCandidates_${jobId}`, JSON.stringify(mergedCandidates));
            localStorage.setItem(`jobApplications_${jobId}`, JSON.stringify(mergedCandidates));
            
            // Refresh the display
            distributeToColumns(mergedCandidates);
            
            // Reinitialize sortable and update counts
            initializeSortable();
            updateColumnCounts();
        }
    } catch (error) {
        console.error('Error refreshing candidates:', error);
        notifications.showError('Failed to refresh candidate display');
    }
}
// Function to create candidate card
// Updated createCandidateCard function
function createCandidateCard(candidate) {
    const candidateId = candidate.id_candidate || candidate.candidate_id || candidate.id;
    // Get jobId from candidate data or current job context
    const jobId = candidate.job_id || jobData?.id_Job ||
        document.getElementById('main-job-content')?.dataset?.jobId ||
        new URLSearchParams(window.location.search).get('jobId');
   // Main card template
    return `
        <div id="candidate_card_${candidateId}" 
             id_cand="${candidateId}" 
             data-job-id="${jobId}"
             class="dark:bg-slate-800 gap-6 flex items-center justify-center cursor-move mb-3"
             data-candidate-id="${candidateId}"
             data-stage="${candidate.stage || 'new'}">
            <div class="bg-gray-100 dark:bg-gray-700 relative shadow-xl overflow-hidden hover:shadow-2xl group rounded-xl p-5 transition-all duration-500 transform w-full">
                <div class="flex items-center gap-4">
                    <div class="flex-1 min-w-0">
                        <div 
                            class="text-gray-600 dark:text-gray-200 font-bold hover:text-primary cursor-pointer candidate-name truncate"
                            data-candidate-id="${candidateId}"
                            onclick="get_candidate(${candidateId})"
                        >
                            ${(candidate.name || 'Unknown').replace(/[<>]/g, '')}
                        </div>
                        <p class="text-gray-400 truncate">${(candidate.jobTitle || 'No Title').replace(/[<>]/g, '')}</p>
                        <a class="text-xs text-gray-500 dark:text-gray-200 group-hover:opacity-100 opacity-0 transform transition-all delay-300 duration-500 break-words leading-[1.25] truncate">
                            ${(candidate.email || '').replace(/[<>]/g, '')}
                        </a>
                    </div>
                </div>
            </div>
        </div>`;
}
// Add this function to handle the profile page loading
function loadCandidateProfile() {
    const urlParams = new URLSearchParams(window.location.search);
    const candidateId = urlParams.get('candidateId');
    sessionStorage.setItem('debug_profile_candidateId', candidateId); // Store profile page candidateId

    const storedData = localStorage.getItem('candidateData');
    if (!storedData) {
        sessionStorage.setItem('debug_error', 'No stored candidate data');
        return;
    }

    try {
        const candidateData = JSON.parse(storedData);
        sessionStorage.setItem('debug_profile_candidateData', JSON.stringify(candidateData)); // Store profile page candidateData

        // Verify the candidate ID matches
        if (candidateData.id_candidate !== parseInt(candidateId)) {
            sessionStorage.setItem('debug_error', `Candidate ID mismatch: URL=${candidateId}, Data=${candidateData.id_candidate}`);
            notifications.showError('Candidate ID mismatch');
            return;
        }

        // Add your profile page display logic here
        // ...
        
    } catch (error) {
        sessionStorage.setItem('debug_error', `Error loading profile: ${error.message}`);
        notifications.showError('Error loading profile data');
    }
}

// Function to track candidate state changes
function updateCandidateState(candidateId, newStage, jobId) {
  // Get current candidates
  const storedCandidates = JSON.parse(sessionStorage.getItem(`selectedCandidates_${jobId}`)) || [];
  
  // Update the candidate's stage
  const updatedCandidates = storedCandidates.map(candidate => {
      if ((candidate.id_candidate || candidate.candidate_id || candidate.id)?.toString() === candidateId?.toString()) {
          return { ...candidate, stage: newStage };
      }
      return candidate;
  });
  
  // Store updated candidates
  sessionStorage.setItem(`selectedCandidates_${jobId}`, JSON.stringify(updatedCandidates));
  
  // Also update the server if possible
  try {
      apiClient.patch(`/api/job-application/${jobId}/`, {
          candidates: [{
              id_candidate: parseInt(candidateId),
              new_stage: newStage,
              job_id: parseInt(jobId),
              date_updated: new Date().toISOString()
          }]
      }, {
          withCredentials: true,
          headers: {
              'Content-Type': 'application/json',
              'X-CSRFToken': Cookies.get('csrftoken')
          }
      }).catch(error => {
          console.warn('Failed to update server, but local state is preserved:', error);
      });
  } catch (error) {
      console.warn('Error updating server:', error);
  }
}
function updateButtonStyles(activeView) {
    const dtBtn = document.getElementById('dt-btn');
    const processBtn = document.getElementById('process-btn');
    
    if (dtBtn && processBtn) {
        const activeClass = "rounded bg-white px-3 py-1 text-xs font-medium text-black shadow-card hover:bg-white hover:shadow-card dark:bg-boxdark dark:text-white dark:hover:bg-boxdark";
        const inactiveClass = "rounded px-3 py-1 text-xs font-medium text-black hover:bg-white hover:shadow-card dark:text-white dark:hover:bg-boxdark";
        
        if (activeView === 'details') {
            dtBtn.className = activeClass;
            processBtn.className = inactiveClass;
        } else {
            dtBtn.className = inactiveClass;
            processBtn.className = activeClass;
        }
    }
}

/*document.addEventListener('DOMContentLoaded', () => {
  // Remove any existing event listeners first
  const processTab = document.getElementById('process-btn');
  if (processTab) {
      const newProcessTab = processTab.cloneNode(true);
      processTab.parentNode.replaceChild(newProcessTab, processTab);
  }

  // Check if we're in process view
  if (window.location.search.includes('process=true')) {
      console.log('Loading process view');
      loadProcess();
  }
}, { once: true });*/

//to Reset!!! for testing 
function quickReset() {
  const jobId = jobData.id_Job;
  if (!jobId) {
      notifications.showError('No job ID found');
      return;
  }

  if (confirm('Are you sure you want to reset everything for this job? This cannot be undone!')) {
      // Clear all relevant storage
      sessionStorage.removeItem(`selectedCandidates_${jobId}`);
      sessionStorage.removeItem('selectedCandidates');
      localStorage.removeItem(`jobApplications_${jobId}`);
      
      // Clear all columns
      ['new', 'preselected', 'interviewed', 'tested', 'proposed', 'interview_partner', 'interview_client_final', 'hired', 'start', 'end']
      .forEach(stage => {
          const container = document.getElementById(stage);
          if (container) {
              container.innerHTML = '';
          }
      });

      // Update the UI
      updateColumnCounts();
      initializeSortable();
      
      notifications.showSuccess('Reset complete! Reloading page...');
      
      // Reload the page after a short delay
      setTimeout(() => {
          window.location.reload();
      }, 1500);
  }
}
// Modal management functions
function openJobDescriptionModal() {
    const modal = document.getElementById('jobDescriptionModal');
    const textarea = document.getElementById('jobDescriptionText');
    const input = document.getElementById('job-description');
    const editBtn = document.getElementById('editDescriptionBtn');
    
    // Copy content from input to modal
    textarea.value = input.value;
    
    // Check if we're in edit mode globally
    const isEditModeEnabled = !input.disabled;
    if (isEditModeEnabled) {
        editBtn.style.display = 'inline-flex';
    } else {
        editBtn.style.display = 'none';
    }
    
    modal.classList.remove('hidden');
}

function closeJobDescriptionModal() {
    const modal = document.getElementById('jobDescriptionModal');
    modal.classList.add('hidden');
}
function toggleDescriptionEdit() {
    const textarea = document.getElementById('jobDescriptionText');
    const editBtn = document.getElementById('editDescriptionBtn');
    const saveBtn = document.getElementById('saveDescriptionBtn');
    const cancelBtn = document.getElementById('cancelDescriptionBtn');
    
    textarea.disabled = false;
    textarea.focus();
    editBtn.classList.add('hidden');
    saveBtn.classList.remove('hidden');
    cancelBtn.classList.remove('hidden');
}
function saveDescription() {
    const textarea = document.getElementById('jobDescriptionText');
    const input = document.getElementById('job-description');
    const editBtn = document.getElementById('editDescriptionBtn');
    const saveBtn = document.getElementById('saveDescriptionBtn');
    const cancelBtn = document.getElementById('cancelDescriptionBtn');
    
    // Update the original input
    input.value = textarea.value;
    
    // Enable the main save button
    const mainSaveBtn = document.getElementById('saveChangesBtn');
    if (mainSaveBtn) {
        mainSaveBtn.style.display = 'inline-flex';
    }
    
    // Reset modal state
    textarea.disabled = true;
    editBtn.classList.remove('hidden');
    saveBtn.classList.add('hidden');
    cancelBtn.classList.add('hidden');
    
    // Close modal
    closeJobDescriptionModal();
    
    // Show notification that changes need to be saved
    notifications.showSuccess('Description updated. Click "Save Changes" to save permanently.');
}

function cancelDescriptionEdit() {
    const textarea = document.getElementById('jobDescriptionText');
    const input = document.getElementById('job-description');
    const editBtn = document.getElementById('editDescriptionBtn');
    const saveBtn = document.getElementById('saveDescriptionBtn');
    const cancelBtn = document.getElementById('cancelDescriptionBtn');
    
    // Restore original content
    textarea.value = input.value;
    
    // Reset modal state
    textarea.disabled = true;
    editBtn.classList.remove('hidden');
    saveBtn.classList.add('hidden');
    cancelBtn.classList.add('hidden');
}
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('jobDescriptionModal');
    if (modal) {
        const modalContent = modal.querySelector('div:nth-child(2)');
        if (modalContent) {
            // Votre code pour gérer la modal
        } else {
            console.error('Le contenu de la modal n\'a pas été trouvé.');
        }
    } else {
        console.error('La modal avec l\'ID "jobDescriptionModal" n\'a pas été trouvée.');
    }
});
// Competence Phare Modal management functions
function openCompetenceModal() {
    const modal = document.getElementById('competencePhareModal');
    const textarea = document.getElementById('competencePhareText');
    const input = document.getElementById('competence_phare');
    const editBtn = document.getElementById('editCompetenceBtn');
    
    // Copy content from input to modal
    textarea.value = input.value;
    
    // Check if we're in edit mode globally
    const isEditModeEnabled = !input.disabled;
    if (isEditModeEnabled) {
        editBtn.style.display = 'inline-flex';
    } else {
        editBtn.style.display = 'none';
    }
    
    modal.classList.remove('hidden');
}

function closeCompetenceModal() {
    const modal = document.getElementById('competencePhareModal');
    modal.classList.add('hidden');
}

function toggleCompetenceEdit() {
    const textarea = document.getElementById('competencePhareText');
    const editBtn = document.getElementById('editCompetenceBtn');
    const saveBtn = document.getElementById('saveCompetenceBtn');
    const cancelBtn = document.getElementById('cancelCompetenceBtn');
    
    textarea.disabled = false;
    textarea.focus();
    editBtn.classList.add('hidden');
    saveBtn.classList.remove('hidden');
    cancelBtn.classList.remove('hidden');
}

function saveCompetence() {
    const textarea = document.getElementById('competencePhareText');
    const input = document.getElementById('competence_phare');
    const editBtn = document.getElementById('editCompetenceBtn');
    const saveBtn = document.getElementById('saveCompetenceBtn');
    const cancelBtn = document.getElementById('cancelCompetenceBtn');
    
    // Update the original input
    input.value = textarea.value;
    
    // Enable the main save button
    const mainSaveBtn = document.getElementById('saveChangesBtn');
    if (mainSaveBtn) {
        mainSaveBtn.style.display = 'inline-flex';
    }
    
    // Reset modal state
    textarea.disabled = true;
    editBtn.classList.remove('hidden');
    saveBtn.classList.add('hidden');
    cancelBtn.classList.add('hidden');
    
    // Close modal
    closeCompetenceModal();
    
    // Show notification that changes need to be saved
    notifications.showSuccess('Compétence Phare updated. Click "Save Changes" to save permanently.');
}

function cancelCompetenceEdit() {
    const textarea = document.getElementById('competencePhareText');
    const input = document.getElementById('competence_phare');
    const editBtn = document.getElementById('editCompetenceBtn');
    const saveBtn = document.getElementById('saveCompetenceBtn');
    const cancelBtn = document.getElementById('cancelCompetenceBtn');
    
    // Restore original content
    textarea.value = input.value;
    
    // Reset modal state
    textarea.disabled = true;
    editBtn.classList.remove('hidden');
    saveBtn.classList.add('hidden');
    cancelBtn.classList.add('hidden');
}

// Add click outside to close for competence modal
document.addEventListener('click', function(event) {
    const modal = document.getElementById('competencePhareModal');
    if (modal && event.target === modal) {
        closeCompetenceModal();
    }
});