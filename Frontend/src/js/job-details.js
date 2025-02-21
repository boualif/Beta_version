//sa fonctionne avec counts but probleme de conflit !!!!
let id_cand;
let currentCandidateId = null;

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

function loadJobDetails() {
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
        notifications.showError('Error loading saved job data');
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
    
    // Check if countersDiv already exists
    let countersDiv = document.getElementById('pipeline-counters');
    if (!countersDiv) {
        // Create the counters section only if it doesn't exist
        countersDiv = document.createElement('div');
        countersDiv.id = 'pipeline-counters';
        countersDiv.className = 'flex items-center mb bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm';
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
        main_content.appendChild(countersDiv);
    }
  
    fetch('job-content.html')
        .then(response => response.text())
        .then(data => {
            targetDiv.innerHTML = data;
            main_content.appendChild(targetDiv);
  
            // Populate all the job data fields
            document.getElementById('jobTitle').value = jobData.title;
            document.getElementById("openingDate").value = jobData.opening_date;
            document.getElementById('status').value = jobData.status ? jobData.status : "";
            document.getElementById('location').value = jobData.location;
            document.getElementById("key-account-name").innerHTML = "Account Manager:" + `<br>` + jobData.ownerRH;
            document.getElementById("client-name").innerHTML = "Client Name:" + `<br>` + jobData.client;
            // Update the counters and proposed candidates field
            updateColumnCounts();

            // Get the proposed count from localStorage
            const proposedCount = localStorage.getItem('proposedCount') || '0';
            const candidatesProposedInput = document.getElementById('candidates-proposed');
            if (candidatesProposedInput) {
                candidatesProposedInput.removeAttribute('disabled');
                candidatesProposedInput.value = proposedCount;
                candidatesProposedInput.setAttribute('value', proposedCount);
                candidatesProposedInput.setAttribute('disabled', 'true');
            }
  
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
                          'jobTitle': formData.jobTitle,
                          'openingDate': formData.openingDate,
                          'status': formData.status,
                          'location': formData.location,
                          'description': formData.description,
                          'budget': formData.budget,
                          'contact_person': formData.contact,
                          'contact_person_phone': formData.phone,
                          'contact_person_email': formData.email,
                          'nb_positions': parseInt(formData.nb_positions) || null,
                          'contract_start_date': formData.start,
                          'contract_end_date': formData.end,
                          'competence_phare': formData.competence_phare || ''
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
            
            // Re-enable any disabled fields if in edit mode
            const isEditMode = document.querySelector('[onclick*="editJob"]') !== null;
            if (isEditMode) {
                document.querySelectorAll('input, textarea').forEach(element => {
                    element.removeAttribute('disabled');
                });
            }
        })
        .catch(error => {
            console.error('Error loading the external file:', error);
            notifications.showError('Error loading job details');
        });
  
    // Update the counters and proposed candidates field
    //updateColumnCounts();
    initializeCounts();
  }
// Function to update navigation counts


// Toggle Edit Mode
function toggleJobEditMode(jobId, editMode) {
    const editableFields = [
        { id: 'jobTitle', type: 'text' },
        { id: "openingDate", type: 'date' },
        { id: 'status', type: 'text' },
        { id: 'location', type: 'text' },
        { id: 'budget', type: 'numeric' },
        { id: 'contact-person', type: 'text' },
        { id: 'contact-person-phone', type: 'tel' },
        { id: 'contact-person-email', type: 'email' },
        { id: 'number-openings', type: 'numeric' },
        { id: 'contract-start-date', type: 'date' },
        { id: 'contract-end-date', type: 'date' },
        { id: 'job-description', type: 'text' },
        { id: 'competence_phare', type: 'text' }
    ];

    const saveButton = document.getElementById('saveChangesBtn');
    
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
                switch (field.type) {
                    case 'numeric':
                        element.setAttribute('type', 'number');
                        break;
                    case 'tel':
                        element.setAttribute('inputmode', 'tel');
                        break;
                    case 'email':
                        element.setAttribute('inputmode', 'email');
                        break;
                    case 'date':
                        element.setAttribute('type', 'date');
                        break;
                    default:
                        element.setAttribute('inputmode', 'text');
                }
            }
        });
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
            }
        });
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
function editJob(jobId) {
    const formData = {
        jobTitle: document.getElementById('jobTitle').value,
        openingDate: document.getElementById("openingDate").value || null,
        status: document.getElementById('status').value,
        location: document.getElementById('location').value,
        description: document.getElementById("job-description").value, // Make sure this is included
        budget: document.getElementById("budget").value || null,
        contact: document.getElementById("contact-person").value,
        phone: document.getElementById("contact-person-phone").value,
        email: document.getElementById("contact-person-email").value,
        nb_positions: document.getElementById("number-openings").value || null,
        start: document.getElementById("contract-start-date").value || null,
        end: document.getElementById("contract-end-date").value || null,
        competence_phare: document.getElementById("competence_phare").value || ''
    };

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
            const updatedJobData = {
                ...jobData,
                ...formData
            };
            localStorage.setItem('jobData', JSON.stringify(updatedJobData));
            
            notifications.showSuccess('All changes saved successfully');
            toggleJobEditMode(jobId, false);
        }
    })
    .catch(error => {
        console.error('Error updating data:', error);
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
        notifications.showError('Error loading candidates');
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
        notifications.showError('Error loading candidates');
        throw error;
    }
}

function loadProcess() {
    const jobId = jobData.id_Job;
    if (!jobId) {
        console.error('No job ID available');
        notifications.showError('Job ID not found');
        return;
    }

    // Clean up existing elements
    destroyExistingSortables();
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
        .then(async data => {
            targetDiv.innerHTML = data;
            main_content.appendChild(targetDiv);
            
            // Try to load candidates from both storage sources
            const localCandidates = JSON.parse(localStorage.getItem(`jobApplications_${jobId}`)) || [];
            const sessionCandidates = JSON.parse(sessionStorage.getItem(`selectedCandidates_${jobId}`)) || [];
            
            // Merge candidates from both sources
            const mergedCandidates = mergeCandidatesWithPriority(
                sessionCandidates,
                localCandidates,
                [],  // Server candidates will be fetched next
                jobId
            );

            try {
                // Fetch server candidates
                const response = await apiClient.get(`/api/job-application/${jobId}/`, {
                    withCredentials: true,
                    headers: {
                        'X-CSRFToken': Cookies.get('csrftoken')
                    }
                });

                if (response.status === 200 && response.data.applications) {
                    // Merge with server candidates
                    const allCandidates = mergeCandidatesWithPriority(
                        mergedCandidates,
                        [],
                        response.data.applications,
                        jobId
                    );

                    // Update storage with complete set
                    sessionStorage.setItem(`selectedCandidates_${jobId}`, JSON.stringify(allCandidates));
                    localStorage.setItem(`jobApplications_${jobId}`, JSON.stringify(allCandidates));

                    // Distribute to columns
                    distributeToColumns(allCandidates);
                }
            } catch (error) {
                console.warn('Error fetching server candidates:', error);
                // Continue with local candidates
                distributeToColumns(mergedCandidates);
            }

            initializeSortable();
            updateButtonStyles();
            updateColumnCounts();
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
      notifications.showError('Error loading candidates');
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
      const id = candidate.id_candidate || candidate.candidate_id || candidate.id;
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

document.addEventListener('DOMContentLoaded', () => {
    if (initialized) return;  // Prevent multiple initializations
    initialized = true;
    initializeCounts();
    
    // Listen for changes in the kanban board
    const kanbanBoard = document.getElementById('job-info');
    if (kanbanBoard) {
        const observer = new MutationObserver(() => {
            updateColumnCounts();
        });
        
        observer.observe(kanbanBoard, {
            childList: true,
            subtree: true
        });
    }
    
    console.log('DOM loaded, initializing...');
    
    const isProcessView = window.location.search.includes('process=true');
    
    if (isProcessView) {
        console.log('Loading process view...');
        initializeCountObserver();
        loadProcess();
    } else {
        console.log('Loading details view...');
        const counters = document.getElementById('pipeline-counters');
        if (counters) counters.style.display = 'none';
        loadJobDetails();
    }

    // Set up click handlers for candidate names
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('candidate-name')) {
            const candidateId = e.target.getAttribute('data-candidate-id');
            if (candidateId) {
                get_candidate(candidateId);
            }
        }
    });
});

// If the page is already loaded when the script runs, initialize immediately
if (document.readyState !== 'loading' && !initialized) {
    const event = new Event('DOMContentLoaded');
    document.dispatchEvent(event);
}
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
// Updated handleDragEnd function to ensure persistence
function handleDragEnd(evt) {
    const jobId = jobData.id_Job;
    const candidateId = evt.item.getAttribute('id_cand');
    const newStage = evt.to.id;

    if (!candidateId || !jobId) {
        console.error('Données manquantes');
        notifications.showError('Erreur lors de la mise à jour de la position du candidat');
        return;
    }

    // Mettre à jour le stage du candidat dans le stockage
    const storedCandidates = JSON.parse(sessionStorage.getItem(`selectedCandidates_${jobId}`)) || [];
    const updatedCandidates = storedCandidates.map(candidate => {
        if (candidate.id_candidate === parseInt(candidateId)) {
            return { ...candidate, stage: newStage };
        }
        return candidate;
    });

    // Sauvegarder les candidats mis à jour
    sessionStorage.setItem(`selectedCandidates_${jobId}`, JSON.stringify(updatedCandidates));

    // Mettre à jour les compteurs de l'interface utilisateur
    updateColumnCounts();

    // Mettre à jour le champ "candidates-proposed"
    updateProposedCandidatesInput();

    // Mettre à jour le backend
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
    })
    .then(response => {
        if (response.status === 200) {
            notifications.showSuccess('Position mise à jour avec succès');
        }
    })
    .catch(error => {
        console.error('Échec de la mise à jour de la position du candidat:', error);
        notifications.showError('Échec de la mise à jour de la position du candidat');
        // Annuler le drag si la mise à jour du serveur échoue
        if (evt.from) {
            evt.from.appendChild(evt.item);
        }
    });
}
function updateProposedCandidatesInput() {
    const jobId = jobData.id_Job;

    // Obtenir le nombre de candidats proposés
    const storedCandidates = JSON.parse(sessionStorage.getItem(`selectedCandidates_${jobId}`)) || [];
    const proposedCount = storedCandidates.filter(candidate => candidate.stage === 'proposed').length;

    // Mettre à jour le champ "candidates-proposed"
    const candidatesProposedInput = document.getElementById('candidates-proposed');
    if (candidatesProposedInput) {
        candidatesProposedInput.value = proposedCount;
        candidatesProposedInput.setAttribute('value', proposedCount);
    }

    // Mettre à jour storedProposedCount dans localStorage
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
  
  if (!candidateId || !jobData?.id_Job) {
      console.error('Missing required IDs:', { candidateId, jobId: jobData?.id_Job });
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
      jobId: jobData.id_Job,
      formData: Object.fromEntries(formData)
  });

  apiClient
      .post(`/interview/partner/${candidateId}/${jobData.id_Job}/`, formData, {
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
  
  if (!candidateId || !jobData?.id_Job) {
      console.error('Missing required IDs:', { candidateId, jobId: jobData?.id_Job });
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
      jobId: jobData.id_Job,
      formData: Object.fromEntries(formData)
  });

  apiClient
      .post(`/interview/client/${candidateId}/${jobData.id_Job}/`, formData, {
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
    sessionStorage.setItem('debug_get_candidate_inputId', id); // Store input ID

    if (!id) {
        sessionStorage.setItem('debug_error', 'No candidate ID provided');
        notifications.showError('Invalid candidate ID');
        return;
    }

    const candidateId = parseInt(String(id).trim());
    if (isNaN(candidateId)) {
        sessionStorage.setItem('debug_error', `Invalid candidate ID format: ${id}`);
        notifications.showError('Invalid candidate ID format');
        return;
    }

    // Store the candidate ID being fetched
    sessionStorage.setItem('debug_candidateId_being_fetched', candidateId);

    apiClient.get(`/api/get-candidate/${candidateId}/`, {
        withCredentials: true,
        headers: {
            'X-CSRFToken': Cookies.get('csrftoken')
        }
    })
    .then(response => {
        // Store the API response for debugging
        sessionStorage.setItem('debug_api_response', JSON.stringify(response.data));

        if (!response.data || !response.data.candidateData) {
            sessionStorage.setItem('debug_error', 'Invalid response data');
            throw new Error('Invalid response data');
        }

        const candidateData = response.data.candidateData;
        // Store the candidate data for debugging
        sessionStorage.setItem('debug_candidateData', JSON.stringify(candidateData));

        // Navigate to profile page
        window.location.href = `profile.html?candidateId=${candidateId}`;
    })
    .catch(error => {
        // Store the error for debugging
        sessionStorage.setItem('debug_error', `Error getting candidate: ${error.message}`);
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
function deleteJob(jobId) {
  if (confirm('Are you sure you want to delete this job?')) {
    apiClient
      .delete(`/job/${jobId}/delete/`,
        {
          withCredentials: true,
          headers: {
            'X-CSRFToken': Cookies.get('csrftoken'),  // Manually extract the CSRF token
          },
        }
      )
      .then((response) => {
        console.log("Job deleted successfully:", response.data);
        if (document.referrer) {
          const referrerUrl = document.referrer;
          const pageName = referrerUrl.substring(referrerUrl.lastIndexOf('/') + 1);
          console.log(pageName); // Outputs: profile-client.html
          if (pageName === "profile-client.html") {
            window.location.href = "profile-client.html";
          } else if (pageName === "tables-job.html") {
            // Fallback if referrer is not available
            window.location.href = "tables-job.html";
          }
          else if (pageName === "form-layout-job.html") {
            window.location.href = "profile-client.html";
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
  
  if (!candidateId || !jobData?.id_Job) {
      console.error('Missing required IDs:', { candidateId, jobId: jobData?.id_Job });
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
      .post(`/interview/post/${candidateId}/${jobData.id_Job}/`, formData, {
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
      flatpickr(input, {
          dateFormat: "Y/m/d",
          allowInput: true,
      });
  });
}

async function processSelectedCandidates() {
    const selectedCandidates = JSON.parse(sessionStorage.getItem('selectedCandidates')) || [];
    
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
        // Format candidates for the backend
        const candidateUpdates = selectedCandidates.map(candidate => ({
            id_candidate: parseInt(candidate.id),
            new_stage: 'new',
            job_id: parseInt(jobId),
            date_updated: new Date().toISOString()
        }));

        // Send to backend first
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
            // After successful backend update, update session storage
            let existingCandidates = JSON.parse(sessionStorage.getItem(`selectedCandidates_${jobId}`)) || [];
            
            // Add new candidates while avoiding duplicates
            selectedCandidates.forEach(newCandidate => {
                const candidateId = parseInt(newCandidate.id);
                const exists = existingCandidates.some(existing => 
                    parseInt(existing.id) === candidateId
                );
                
                if (!exists) {
                    existingCandidates.push({
                        ...newCandidate,
                        stage: 'new',
                        jobId: jobId
                    });
                }
            });

            // Save to session storage
            sessionStorage.setItem(`selectedCandidates_${jobId}`, JSON.stringify(existingCandidates));
            
            // Also save to local storage for persistence
            localStorage.setItem(`jobApplications_${jobId}`, JSON.stringify(existingCandidates));
            
            // Clear the original selection
            sessionStorage.removeItem('selectedCandidates');

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
        jobTitle: analysis.cv_analysis?.current_job_title || '',
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

// Function to create candidate card
// Updated createCandidateCard function
function createCandidateCard(candidate) {
    if (!candidate) return '';
    
    // Ensure consistent ID handling
    const candidateId = parseInt(candidate.id_candidate || candidate.candidate_id || candidate.id);
    
    if (isNaN(candidateId)) {
        sessionStorage.setItem('debug_error', `Invalid candidate ID: ${candidate}`);
        return '';
    }

    return `
        <div id="candidate_card_${candidateId}" 
             id_cand="${candidateId}" 
             class="dark:bg-slate-800 gap-6 flex items-center justify-center cursor-move"
             data-candidate-id="${candidateId}"
             data-stage="${candidate.stage || 'new'}">
            <div class="bg-gray-100 dark:bg-gray-700 relative shadow-xl overflow-hidden hover:shadow-2xl group rounded-xl p-5 transition-all duration-500 transform">
                <div class="flex items-center gap-4">
                    <div class="w-fit transition-all transform duration-500 max-w-[100px]">
                        <div 
                            class="text-gray-600 dark:text-gray-200 font-bold hover:text-primary cursor-pointer candidate-name"
                            data-candidate-id="${candidateId}">
                            ${(candidate.name || 'Unknown').replace(/[<>]/g, '')}
                        </div>
                        <p class="text-gray-400">${(candidate.jobTitle || candidate.job_title || 'No Title').replace(/[<>]/g, '')}</p>
                        <a class="text-xs text-gray-500 dark:text-gray-200 group-hover:opacity-100 opacity-0 transform transition-all delay-300 duration-500 break-words leading-[1.25]">
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
function updateButtonStyles() {
  document.getElementById("dt-btn").className = "rounded px-3 py-1 text-xs font-medium text-black hover:bg-white hover:shadow-card dark:text-white dark:hover:bg-boxdark";
  document.getElementById("process-btn").className = "rounded bg-white px-3 py-1 text-xs font-medium text-black shadow-card hover:bg-white hover:shadow-card dark:bg-boxdark dark:text-white dark:hover:bg-boxdark";
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