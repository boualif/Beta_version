let clients = [];
let clientId;
let jobsData;
let clientData;

// Read function
// function readClient(id) {
//   const client = clients.find((client) => client.id === id);
//   if (client) {
//     console.log('Client found:', client);
//     displayClient(client);
//   } else {
//     console.log('Client not found');
//   }
// }
window.onload = function () {
  clientData = JSON.parse(localStorage.getItem('clientData'));

  //localStorage.removeItem('clientData');
  sessionStorage.setItem("pageReloaded", "true");
  console.log(clientData);
  load_Client();
  const is_superuser = localStorage.getItem("role");
  if (is_superuser === "true") {
    const iconsClient = document.getElementById("iconsClient");
    iconsClient.innerHTML += `<!-- Delete Icon -->
                  <a style="display: none;" href="javascript:void(0)" class="absolute top-4 right-14 text-red-500 hover:text-red-700 transition"
                    id="deleteClientIcon">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12">
                      </path>
                    </svg>
                  </a>`;
  }


  // Save Changes
  // async function saveClientChanges() {
  //   const data = {
  //     company: document.getElementById('companyName').textContent,
  //     website: document.getElementById('companyWebsite').textContent,
  //     description: document.getElementById('companyDescription').textContent,
  //     industry: document.getElementById('companyIndustry').textContent,
  //     headquarters_phone_number: document.getElementById('companyPhone').textContent,
  //     // Add other fields as needed
  //   };

  //   try {
  //     const response = await fetch(`/client/${clientId}/update/`, {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         'X-CSRFToken': getCSRFToken(),
  //       },
  //       body: JSON.stringify(data),
  //     });

  //     const result = await response.json();
  //     alert(result.message);
  //     toggleClientEditMode();
  //   } catch (error) {
  //     console.error('Error updating client:', error);
  //   }
  // }

  // // Delete Client
  // async function deleteClient() {

  //   if (confirm("Are you sure you want to delete this client?")) {
  //     try {
  //       const response = await fetch(`/client/${clientId}/delete/`, {
  //         method: 'DELETE',
  //         headers: {
  //           'X-CSRFToken': getCSRFToken(),
  //         },
  //       });

  //       const result = await response.json();
  //       alert(result.message);
  //       // Redirect or update the UI as needed after deletion
  //     } catch (error) {
  //       console.error('Error deleting client:', error);
  //     }
  //   }
  // }

  // Helper function to get CSRF token from the cookie
  function getCSRFToken() {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, 10) === 'csrftoken=') {
          cookieValue = decodeURIComponent(cookie.substring(10));
          break;
        }
      }
    }
    return cookieValue;
  }

  // Assign functions to buttons

  //document.getElementById('saveClientIcon').onclick = saveClientChanges();

  // Event listeners
  //document.getElementById('updateClientIcon').addEventListener('click', updateClient);
  clientId = clientData.id_Client;
  const deleteClientIcon = document.getElementById('deleteClientIcon');

  if (is_superuser === "true") {
    deleteClientIcon.style.display = "block";
    deleteClientIcon.onclick = () => deleteClient(clientId);
  }
  const addedDateElement = document.getElementById("added-date-btn");
if (addedDateElement) {
  addedDateElement.textContent = clientData.added_at;
  console.log("Added Date element found and updated:", addedDateElement.textContent);
} else {
  console.error("Added Date element not found!");
}
const statusElement = document.getElementById("status-btn");
if (statusElement) {
  statusElement.textContent = clientData.status;
  console.log("Status element found and updated:", statusElement.textContent);
} else {
  console.error("Status element not found!");
}

const engagementTypeElement = document.getElementById("egagement-type-btn");
  //if (engagementTypeElement) {
    //const engagementType = clientData.engagement_type.toLowerCase(); // Convertir en minuscules
    //const formattedEngagementType = engagementType
      //.split('_') // Diviser la chaîne en tableau
     // .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitaliser chaque mot
     // .join(' '); // Réassembler avec des espaces
    //engagementTypeElement.textContent = formattedEngagementType;
    //console.log("Engagement Type updated:", formattedEngagementType);
  //}
   //else {
    //console.error("Engagement Type element not found!");
  //}
  document.getElementById('updateClientIcon').onclick = () => toggleClientEditMode(clientId, true);
  //document.getElementById('deleteClientIcon').addEventListener('click', deleteClient(clientId));
  console.log("Key Account Manager:", clientData.key_account_manager);
  const keyAccountManagerElement = document.getElementById("key-account-manager-btn");
  if (keyAccountManagerElement) {
    keyAccountManagerElement.textContent = clientData.key_account_manager;
    console.log("Key Account Manager updated:", keyAccountManagerElement.textContent);
  } else {
    console.error("Key Account Manager element not found!");
  }
  console.log("Added At:", clientData.added_at);
  setupDeleteClientButton();


};

// Update function
/*function updateClient(id) {
  const client = clients.find((client) => client.id === id);
  if (client) {
    const leadName = document.getElementById('leadName').value;
    const leadEmail = document.getElementById('leadEmail').value;
    const leadCompany = document.getElementById('leadCompany').value;
    const leadPhone = document.getElementById('leadPhone').value;
    const leadLinkedIn = document.getElementById('leadLinkedIn').value;
    const leadClientPost = document.getElementById('leadClientPost').value;

    client.leadName = leadName;
    client.leadEmail = leadEmail;
    client.leadCompany = leadCompany;
    client.leadPhone = leadPhone;
    client.leadLinkedIn = leadLinkedIn;
    client.leadClientPost =leadClientPost;

    console.log('Client updated:', client);
    displayClient(client);
  } else {
    console.log('Client not found');
  }
}*/
async function updateClient(clientId, isToggleMode = false) {
  try {
    // If in toggle mode, just switch the edit state
    if (isToggleMode) {
      return toggleClientEditMode(clientId, true);
    }

    // Get all editable fields
    const editableFields = {
      website: 'clientWebsite',
      company: 'companyName',
      location: 'companyLocation',
      industry: 'companyIndustry',
      description: 'companyDescription',
      headquarters_phone_number: 'companyPhone'
    };

    // Get status value directly from the select element
    const statusEditSelect = document.getElementById('statusEdit');
    const statusValue = statusEditSelect ? statusEditSelect.value : null;

    // Collect updated data
    const updatedData = {
      status: statusValue, // Include status in update data
      //urls: processURLs(document.getElementById('companyURLs')?.value)
    };

    // Add all editable fields to the updated data
    for (const [key, elementId] of Object.entries(editableFields)) {
      const element = document.getElementById(elementId);
      if (element) {
        updatedData[key] = element.textContent.trim();
      }
    }

    console.log('Sending update data:', updatedData); // Debug log

    // Make API call to update client
    const response = await apiClient.patch(
      `/${clientId}/client/update/`,
      updatedData,
      {
        withCredentials: true,
        headers: {
          'X-CSRFToken': Cookies.get('csrftoken'),
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.status === 200) {
      console.log('Received response:', response.data); // Debug log
      
      // Update local storage with new data
      Object.assign(clientData, response.data);
      localStorage.setItem('clientData', JSON.stringify(clientData));

      // Directly update status elements
      const statusBtn = document.getElementById('status-btn');
      if (statusBtn && response.data.status) {
        statusBtn.textContent = response.data.status;
        console.log('Updated status button to:', response.data.status);
      }

      if (statusEditSelect && response.data.status) {
        statusEditSelect.value = response.data.status;
        console.log('Updated status select to:', response.data.status);
      }

      // Update other UI elements
      updateUIElements(response.data);

      // Exit edit mode
      toggleClientEditMode(clientId, false);

      showNotification('Client updated successfully', 'success');
      return true;
    }

    throw new Error('Update failed with status: ' + response.status);
  } catch (error) {
    console.error('Error updating client:', error);
    showNotification('Error updating client: ' + error.message, 'error');
    return false;
  }
}
function updateUIElements(data) {
  console.log('Updating UI with data:', data); // Debug log for incoming data

  // 1. First, immediately update status elements
  if (data.status) {
      // Get both status elements
      const statusBtn = document.querySelector('[data-status]') || document.getElementById('status-btn');
      const statusSelect = document.getElementById('statusEdit');
      
      console.log('Current status elements:', {
          btn: statusBtn?.textContent,
          select: statusSelect?.value
      });

      // Update status button if it exists
      if (statusBtn) {
          statusBtn.textContent = data.status;
          statusBtn.setAttribute('data-status', data.status);
      }

      // Update status select if it exists
      if (statusSelect) {
          statusSelect.value = data.status;
          
          // Force trigger change event
          const event = new Event('change', { bubbles: true });
          statusSelect.dispatchEvent(event);
      }

      console.log('Updated status elements to:', data.status);
  }

  // 2. Update all other client fields
  const fieldMappings = {
      company: { id: 'companyName', isHtml: false },
      website: { id: 'clientWebsite', isHtml: true },
      location: { id: 'companyLocation', isHtml: false },
      industry: { id: 'companyIndustry', isHtml: false },
      description: { id: 'companyDescription', isHtml: false },
      headquarters_phone_number: { id: 'companyPhone', isHtml: false },
      key_account_manager: { id: 'key-account-manager-btn', isHtml: false },
      added_at: { id: 'added-date-btn', isHtml: false }
  };

  // Update each field if data exists
  Object.entries(fieldMappings).forEach(([dataKey, { id, isHtml }]) => {
      const element = document.getElementById(id);
      const value = data[dataKey];

      if (element && value) {
          if (isHtml) {
              // Special handling for website
              element.textContent = value;
              element.href = value.startsWith('http') ? value : `https://${value}`;
          } else {
              element.textContent = value;
          }
      }
  });

  // 3. Handle URLs separately as they need special processing
 const urlsInput = document.getElementById('companyURLs');
  if (urlsInput && data.urls) {
      const urlsString = Array.isArray(data.urls) 
          ? data.urls.filter(url => url && url !== "None").join(', ')
          : '';
      urlsInput.value = urlsString;
  }

  // 4. Update profile image if present
  const profileImage = document.getElementById('profileImage');
  if (profileImage && data.image) {
      profileImage.src = `data:image/jpeg;base64,${data.image}`;
  }
}
// Function to synchronize status between dropdown and button
function syncStatusElements() {
  const statusBtn = document.querySelector('[data-status]') || document.getElementById('status-btn');
  const statusSelect = document.getElementById('statusEdit');

  if (statusBtn && statusSelect) {
      // Update dropdown when button changes
      const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
              if (mutation.type === 'characterData' || mutation.type === 'childList') {
                  statusSelect.value = statusBtn.textContent.trim();
              }
          });
      });

      observer.observe(statusBtn, {
          characterData: true,
          childList: true,
          subtree: true
      });

      // Update button when dropdown changes
      statusSelect.addEventListener('change', (event) => {
          statusBtn.textContent = event.target.value;
          statusBtn.setAttribute('data-status', event.target.value);
      });
  }
}

// Initialize status synchronization when document loads
document.addEventListener('DOMContentLoaded', () => {
  syncStatusElements();
});
/*function processURLs(urlsInput) {
  if (!urlsInput) return [];
  
  return urlsInput
    .split(',')
    .map(url => url.trim())
    .filter(url => url && url !== "None" && url.length > 0);
}*/
// Create the delete modal
function createDeleteModal() {
  // Vérifier si le modal existe déjà
  if (!document.getElementById('deleteModal')) {
      document.body.insertAdjacentHTML('beforeend', `
          <div id="deleteModal" class="hidden fixed inset-0 z-50 overflow-y-auto bg-gray-500 bg-opacity-75 flex items-center justify-center">
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
                                  Supprimer le client
                              </h3>
                              <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                  Êtes-vous sûr de vouloir supprimer ce client ? Cette action est irréversible.
                              </p>
                          </div>
                      </div>
                      <div class="mt-6 flex justify-end gap-3">
                          <button type="button" id="cancelDelete" class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:bg-boxdark dark:text-white dark:border-strokedark">
                              Annuler
                          </button>
                          <button type="button" id="confirmDelete" class="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                              Supprimer
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      `);
  }
}

function showDeleteModal() {
  return new Promise((resolve) => {
      createDeleteModal(); // Ensure the modal exists

      const modal = document.getElementById('deleteModal');
      const cancelButton = document.getElementById('cancelDelete');
      const confirmButton = document.getElementById('confirmDelete');

      // Show the modal
      modal.classList.remove('hidden');

      // Handle "Annuler" button click
      cancelButton.addEventListener('click', () => {
          modal.classList.add('hidden'); // Hide the modal
          resolve(false); // Resolve the promise with `false` (user canceled)
      });

      // Handle "Supprimer" button click
      confirmButton.addEventListener('click', () => {
          modal.classList.add('hidden'); // Hide the modal
          resolve(true); // Resolve the promise with `true` (user confirmed)
      });
  });
}

// Set up the delete client button
function setupDeleteClientButton() {
  const deleteClientIcon = document.getElementById('deleteClientIcon');
  if (deleteClientIcon) {
      deleteClientIcon.addEventListener('click', () => {
          const clientId = localStorage.getItem('clientId'); // Get the client ID
          if (clientId) {
              deleteClient(clientId); // Show the modal and handle deletion
          } else {
              console.error("No client ID found!");
          }
      });
  }
}

// Delete client function
function deleteClient(id) {
  // Créer le modal s'il n'existe pas
  createDeleteModal();

  // Récupérer les éléments après leur création
  const modal = document.getElementById('deleteModal');
  const confirmBtn = document.getElementById('confirmDelete');
  const cancelBtn = document.getElementById('cancelDelete');

  // Fonction pour fermer le modal
  const closeModal = () => {
      modal.classList.add('hidden');
      cleanup();
  };

  // Gérer la confirmation
  const handleConfirm = () => {
      apiClient
          .delete(`/${id}/client/delete/`, {
              withCredentials: true,
              headers: {
                  'X-CSRFToken': Cookies.get('csrftoken'),
              },
          })
          .then((response) => {
              console.log("Client deleted successfully:", response.data);
              window.location.href = "tables-client.html"; // Redirect after deletion
          })
          .catch((error) => {
              console.error("Error deleting client:", error);
          })
          .finally(() => {
              closeModal();
          });
  };

  // Nettoyer les event listeners
  const cleanup = () => {
      confirmBtn.removeEventListener('click', handleConfirm);
      cancelBtn.removeEventListener('click', closeModal);
      document.removeEventListener('keydown', handleEscape);
  };

  // Gérer la touche Escape
  const handleEscape = (e) => {
      if (e.key === 'Escape') {
          closeModal();
      }
  };

  // Ajouter les event listeners
  confirmBtn.addEventListener('click', handleConfirm);
  cancelBtn.addEventListener('click', closeModal);
  document.addEventListener('keydown', handleEscape);

  // Afficher le modal
  modal.classList.remove('hidden');
}

// Display clients function
function displayClients() {
  const clientList = document.getElementById('clientList');
  clientList.innerHTML = '';
  clients.forEach((client) => {
    const clientHTML = `
                        <div>
                        <h2>${client.leadName}</h2>
                        <p>Email: ${client.leadEmail}</p>
                        <p>Company: ${client.leadCompany}</p>
                        <p>Phone: ${client.leadPhone}</p>
                        <p>LinkedIn: ${client.leadLinkedIn}</p>
                        <p>ClientPost :${client.leadClientPost}</p>
                        </div>
                        `;
    clientList.innerHTML += clientHTML;
  });
}

// Display client function
function displayClient(client) {
  const clientHTML = `
            <div>
            <h2>${client.leadName}</h2>
            <p>Email: ${client.leadEmail}</p>
            <p>Company: ${client.leadCompany}</p>
            <p>Phone: ${client.leadPhone}</p>
            <p>LinkedIn: ${client.leadLinkedIn}</p>
            <p>ClientPost :${client.leadClientPost}</p>
            </div>
            `;
  document.getElementById('clientDetails').innerHTML = clientHTML;
}


function showNotification(message, type = 'info') {
  // Create notification element if it doesn't exist
  let notification = document.getElementById('notification');
  if (!notification) {
    notification = document.createElement('div');
    notification.id = 'notification';
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.zIndex = '1000';
    notification.style.padding = '1rem';
    notification.style.borderRadius = '0.5rem';
    notification.style.transition = 'opacity 0.3s ease-in-out';
    document.body.appendChild(notification);
  }

  // Set styles based on type
  const styles = {
    success: {
      bg: 'bg-green-500',
      text: 'text-white'
    },
    error: {
      bg: 'bg-red-500',
      text: 'text-white'
    },
    info: {
      bg: 'bg-blue-500',
      text: 'text-white'
    }
  };

  // Apply styles
  const style = styles[type] || styles.info;
  notification.className = `${style.bg} ${style.text} shadow-lg`;
  notification.textContent = message;

  // Show notification
  notification.style.opacity = '1';

  // Hide after 3 seconds
  setTimeout(() => {
    notification.style.opacity = '0';
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}


// Toggle Edit Mode
function toggleClientEditMode(clientId, editMode) {
  const editableFields = [
    'clientWebsite', 'companyName', 'companyLocation',
    'companyIndustry', 'companyDescription', 'companyPhone'
  ];

  // Handle status elements
  const statusEdit = document.getElementById('statusEdit');
  const statusBtn = document.getElementById('status-btn');
  
  if (statusEdit) {
    statusEdit.disabled = !editMode;
    if (editMode && statusBtn) {
      // When entering edit mode, sync select with current status
      statusEdit.value = statusBtn.textContent.trim();
    }
  }

  // Update icons based on mode
  const iconsClient = document.getElementById('iconsClient');
  if (iconsClient) {
    const isSuperuser = localStorage.getItem('role') === 'true';
    
    iconsClient.innerHTML = editMode 
      ? `
        <a href="javascript:void(0)" onclick="updateClient('${clientId}')"
          class="absolute top-4 right-24 text-green-500 hover:text-green-700 transition">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </a>
        <a href="javascript:void(0)" onclick="toggleClientEditMode('${clientId}', false)" 
          class="absolute top-4 right-14 text-red-500 hover:text-red-700 transition">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
        </a>`
      : `
        <a href="javascript:void(0)" onclick="updateClient('${clientId}', true)" 
          class="absolute top-4 right-24 text-blue-500 hover:text-blue-700 transition">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
              d="M13.828 4.172a4 4 0 015.656 5.656L8 19H4v-4L13.828 4.172z"></path>
            </svg>
        </a>
        ${isSuperuser ? `
          <a href="javascript:void(0)" onclick="deleteClient('${clientId}')" 
            class="absolute top-4 right-14 text-red-500 hover:text-red-700 transition">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </a>` : ''}`;
          }

  // Toggle editability of fields
    editableFields.forEach(id => {
      const element = document.getElementById(id);
    if (element) {
      element.setAttribute('contenteditable', editMode.toString());
    }
    });
  }


/*function editClient(clientId) {
  // Get all other fields...
  const website = document.getElementById('clientWebsite').textContent;
  const companyName = document.getElementById('companyName').textContent;
  const location = document.getElementById('companyLocation').textContent;
  const industry = document.getElementById('companyIndustry').textContent;
  const description = document.getElementById('companyDescription').textContent;
  const headquarters_phone_number = document.getElementById('companyPhone').textContent;
  const status = document.getElementById("statusEdit").value;

  // Handle URLs specifically
  const companyURLsInput = document.getElementById('companyURLs');
  let urls = [];
  if (companyURLsInput && companyURLsInput.value) {
    // Split the input by commas and clean up each URL
    urls = companyURLsInput.value
      .split(',') // Split by commas
      .map(url => url.trim()) // Remove extra spaces
      .filter(url => url && url !== "None" && url.length > 0); // Remove empty or invalid URLs
  }

  const data = {
      'company': companyName,
      'website': website,
      'headquarters_phone_number': headquarters_phone_number,
      'status': status,
      'industry': industry,
      'description': description,
      'location': location,
    'urls': urls  // Send as a clean array of URLs
  };

  apiClient
    .patch(`/${clientId}/client/update/`, data, {
      withCredentials: true,
      headers: {
          'X-CSRFToken': Cookies.get('csrftoken'),
      },
  })
    .then((response) => {
      if (response.status == 200) {
        console.log("Client updated successfully:", response.data);
        
        // Update local storage with the response data
        Object.assign(clientData, response.data);
        localStorage.setItem("clientData", JSON.stringify(clientData));

        // Update UI elements
        document.getElementById("status-btn").textContent = clientData.status;
        
        // Specifically handle URLs display
        const urlsInput = document.getElementById('companyURLs');
        if (urlsInput && clientData.urls) {
          const urlsString = Array.isArray(clientData.urls) 
            ? clientData.urls.filter(url => url && url !== "None").join(', ') // Convert array to comma-separated string
            : '';
          urlsInput.value = urlsString;
        }

        toggleClientEditMode(clientId, false);
      }
    })
    .catch((error) => {
      console.error("Error updating client:", error);
      alert('Error updating client. Please try again.');
    });
}*/

function load_Client() {

  const clientData = JSON.parse(localStorage.getItem('clientData'));
  localStorage.setItem("clientId", clientData.id_Client);
  console.log("Leads data:", clientData.leads); // Debug log to check leads specifically

  const [navigation] = performance.getEntriesByType("navigation");
  if (navigation && navigation.type === "reload") {
    if (sessionStorage.getItem("pageReloaded")) {
      sessionStorage.removeItem("pageReloaded");
      getClient(clientData.id_Client);
      localStorage.removeItem("jobsData");
    }
  }

  // Helper function to safely set element content
  const setElementContent = (elementId, content) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = content || '';
    }
  };

  // Set content for all elements with null checks
  setElementContent("companyName", clientData.company);
  setElementContent("companyLocation", clientData.location);
  setElementContent("companyIndustry", clientData.industry);
  setElementContent("companyDescription", clientData.description);
  setElementContent("companyPhone", clientData.headquarters_phone_number);
  setElementContent("status-btn", clientData.status);
  setElementContent("added-date-btn", clientData.added_at);
  setElementContent("key-account-manager-btn", clientData.key_account_manager);

  // Handle website with href
  const website = document.getElementById("clientWebsite");
  if (website) {
    website.textContent = clientData.website;
    website.href = clientData.website ? `https://${clientData.website}` : '#';
  }

  // Handle URLs
  const urlsContainer = document.getElementById("companyURLs");
  if (urlsContainer) {
    let urls = clientData.urls;
    console.log('Loading URLs:', urls); // Debug log
    
    if (urls) {
      // If urls is a string, try to parse it
      if (typeof urls === 'string') {
        try {
          urls = JSON.parse(urls);
        } catch (e) {
          urls = urls.split(',');
        }
      }
      
      // Ensure we're working with an array
      if (Array.isArray(urls)) {
        // Filter out None values and empty strings
        urls = urls.filter(url => url && url !== "None" && url.trim() !== "");
        // Join remaining URLs with commas
        const urlsString = urls.join(', ');
        urlsContainer.value = urlsString;
        
        // Update clientData to ensure consistency
        clientData.urls = urls;
        localStorage.setItem("clientData", JSON.stringify(clientData));
      } else {
        urlsContainer.value = '';
      }
    } else {
      urlsContainer.value = '';
    }
  }

  // Handle profile image
  const logo = clientData.image;
  if (logo) {
    const profileImage = document.getElementById("profileImage");
    if (profileImage) {
      profileImage.src = `data:image/jpeg;base64,${clientData.image}`;
    }
  }

  // Set client ID
  clientId = clientData.id_Client;
  localStorage.setItem('clientId', clientId);

  // Set up file input handler
  const fileInput = document.getElementById('profile');
  if (fileInput) {
    fileInput.addEventListener('change', handleFileChange);
  }

  // Handle leads display
  const leads = clientData.leads;
  const leadsContainer = document.getElementById('leadListContainer');
  if (leadsContainer) {
    leadsContainer.innerHTML = ''; // Clear the container
    if (leads) {
      leads.forEach(lead => {
        // Ensure the lead object includes the client_post field
        if (!lead.client_post) {
          lead.client_post = ''; // Set a default value if missing
        }
        const leadHTML = displayLead(lead);
        leadsContainer.insertAdjacentHTML('beforeend', leadHTML);
      });
    }
  }
}
function handleFileChange(e) {
    const file = e.target.files[0];
  if (!file) return;

      const reader = new FileReader();
  const profileImage = document.getElementById("profileImage");

  reader.onload = function(event) {
    if (profileImage) {
        profileImage.src = event.target.result;
    }

        const base64ImageData = event.target.result;
        const base64Data = base64ImageData.split(',')[1];

        const updateData = {
      'image': base64Data
        };

    apiClient.patch(`/${clientId}/get-client/`, updateData, {
            withCredentials: true,
            headers: {
        'X-CSRFToken': Cookies.get('csrftoken'),
            },
    })
          .then(response => {
      console.log('Image updated successfully:', response.data);
          })
          .catch(error => {
      console.error('Error updating image:', error);
          });
      };

  //reader.readAsDataURL(file);
    }
function getClient(id) {
  apiClient.get(`/${id}/get-client/`,
    {
    withCredentials: true,
})
    .then(function (response) {
      const clientData = response.data;

      localStorage.setItem('clientData', JSON.stringify(clientData));
      console.log(clientData)
    })
    .catch(function (error) {
      alert('Error fetching client!');
      console.log(error);
    });
}

// Toggle visibility of lead form
function toggleLeadForm() {
  const leadFormContainer = document.getElementById('leadFormContainer');
  leadFormContainer.style.display = leadFormContainer.style.display === 'none' ? 'block' : 'none';
  document.getElementById('saveLead-btn').onclick = function () {
    addLead();
    leadFormContainer.style.display = leadFormContainer.style.display === 'none' ? 'block' : 'none';
  }
}

// Load leads on page load
//document.addEventListener('DOMContentLoaded', loadLeads);

function addLead() {
  const firstName = document.getElementById('leadFirstName').value;
  const lastName = document.getElementById('leadLastName').value;
  const email = document.getElementById('leadEmail').value;
  const phone = document.getElementById('leadPhone').value;
  const linkedIn = document.getElementById('leadLinkedIn').value;
  const notes = document.getElementById('leadNotes').value;
  const clientPost = document.getElementById('leadClientPost').value;
  const currentDate = new Date().toISOString();


  const lead = {
    first_name: firstName,
    last_name: lastName,
    email: email,
    phone: phone,
    linkedin: linkedIn,
    notes: notes,
    client_post: clientPost,
    client_id: clientId,
    added_at: currentDate // Ajout de la date ici

  };

  console.log("Sending lead data:", lead);

  apiClient.post('/lead/new/', lead, {
      withCredentials: true,
      headers: {
      'X-CSRFToken': Cookies.get('csrftoken'),
      'Content-Type': 'application/json'
      },
  })
    .then(response => {
      if (response.status === 201) {
      // Log pour voir la réponse exacte
      console.log("Réponse du serveur:", response.data);
      
      const completeLeadData = {
        ...lead,
        ...response.data,
        id: response.data.id,
        client_post: clientPost || '',
        added_at: response.data.added_at || currentDate // Utiliser la date du serveur ou notre date locale

      };
      
      // Log pour vérifier les données complètes
      console.log("Données complètes du lead:", completeLeadData);
      
      if (!clientData.leads) {
        clientData.leads = [];
      }
      clientData.leads.push(completeLeadData);
      
      // Log pour vérifier les données avant stockage
      console.log("ClientData avant stockage:", clientData);
      
      localStorage.setItem("clientData", JSON.stringify(clientData));
      
      const leadHTML = displayLead(completeLeadData);
        const leadsContainer = document.getElementById('leadListContainer');
        leadsContainer.insertAdjacentHTML('beforeend', leadHTML);
      
      clearLeadForm();
      toggleLeadForm();
      }
    })
  .catch(error => {
    console.error('Error adding lead:', error);
    alert('Error adding lead. Please try again.');
  });
}




function loadLeads() {
  fetch('/lead/')
    .then(response => response.json())
    .then(data => {
      const leadListContainer = document.getElementById('leadListContainer');
      leadListContainer.innerHTML = ''; // Clear existing content
      data.leads.forEach((lead, index) => {
        leadListContainer.innerHTML += displayLead(lead);
      });
    })
    .catch(error => console.error('Error loading leads:', error));
}

// Save lead (create or update)
function saveLead(event) {
  event.preventDefault();

  const leadForm = document.getElementById('leadForm');
  const formData = new FormData(leadForm);

  fetch('/lead/create_or_update/', {
    method: 'POST',
    body: formData,
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        loadLeads();
        toggleLeadForm();
        leadForm.reset();
      } else {
        alert('Failed to save lead. Please try again.');
      }
    })
    .catch(error => console.error('Error saving lead:', error));
}

function displayLead(lead) {
  const icons = "iconsLead" + lead.id;
  const leadId = lead.id;
  const is_superuser = localStorage.getItem("role");
  const cleanPhone = lead.phone ? lead.phone.replace(/\D/g, '') : '';
  
  console.log("Lead data received:", lead); // Ajout de ce log
  
  // Ensure client_post has a fallback value
  const clientPost = lead.client_post || '';
  
  // Clean up LinkedIn URL
  const linkedInUrl = lead.linkedIn || '#';
  
  // Format the creation date
  let formattedDate;
  if (typeof lead.added_at === 'string') {
    try {
      const date = new Date(lead.added_at);
      formattedDate = new Intl.DateTimeFormat('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'UTC'
      }).format(date);
    } catch (e) {
      console.error("Date parsing error:", e);
      formattedDate = lead.added_at; // Use raw string if parsing fails
    }
  } else if (lead.created_at) {
    // Fallback to created_at if added_at is not available
    formattedDate = new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'UTC'
    }).format(new Date(lead.created_at));
  } else {
    // If no date is available, use current date
    formattedDate = new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'UTC'
    }).format(new Date());
  }
  return `
      <div data-id="${leadId}" class="mb-4 flex items-start justify-between border-b border-gray-200 dark:border-gray-700 pb-4">
        <div class="flex-grow">
          <h5 id="leadFirstName${leadId}" class="text-lg font-semibold text-black dark:text-white" contenteditable="false">${lead.first_name}</h5>
          <h5 id="leadLastName${leadId}" class="text-lg font-semibold text-black dark:text-white" contenteditable="false">${lead.last_name}</h5>
          <table class="w-full mt-2 border-collapse">
            <tbody>
              <tr>
              <td class="font-semibold text-bodydark dark:text-white/70">Contact:</td>
              <td><p id="leadEmail${leadId}" contenteditable="false">${lead.email}</p></td>
              </tr>
              <tr>
                <td class="font-semibold text-bodydark dark:text-white/70">Phone:</td>
              <td class="flex items-center space-x-2">
                <span id="leadPhone${leadId}" contenteditable="false">${lead.phone || ''}</span>
                ${lead.phone ? `
                  <div class="flex space-x-2">
                    <a href="kavkom://call?number=${cleanPhone}" 
                       onclick="openKavkom('${cleanPhone}')"
                       class="inline-flex items-center justify-center p-2 rounded-full bg-blue-100 hover:bg-blue-200 transition-colors duration-200"
                       title="Call with Kavkom">
                      <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z">
                        </path>
                      </svg>
                    </a>
                  </div>
                ` : ''}
              </td>
            </tr>
            <tr>
              <td class="font-semibold text-bodydark dark:text-white/70">Client Post:</td>
              <td id="leadClientPost${leadId}" contenteditable="false">${clientPost}</td>
              </tr>
              <tr>
                <td class="font-semibold text-bodydark dark:text-white/70">LinkedIn:</td>
              <td id="leadLinkedIn${leadId}" contenteditable="false">
                <a href="${linkedInUrl}" class="text-primary hover:underline">${linkedInUrl === '#' ? 'LinkedIn Profile' : linkedInUrl}</a>
              </td>
            </tr>
            <tr>
              <td class="font-semibold text-bodydark dark:text-white/70">Created:</td>
              <td>
                <div class="flex items-center">
                  <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    ${formattedDate}
                  </span>
                </div>
              </td>
              </tr>
            </tbody>
          </table>
          <div class="mt-4">
          <label for="leadNotes${leadId}" class="block text-sm font-medium text-bodydark dark:text-white/70">Notes</label>
          <textarea
            id="leadNotes${leadId}"
            class="mt-1 block w-full border border-stroke rounded-lg p-2 text-bodydark dark:bg-boxdark dark:text-white resize-y"
            rows="3"
            readonly
          >${lead.notes || ''}</textarea>
        </div>
        </div>
        <div id="${icons}" class="flex space-x-2 items-center">
          <a href="javascript:void(0)" onclick="toggleLeadEditMode('${leadId}',true)" class="text-blue-500 hover:text-blue-700 transition">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 4.172a4 4 0 015.656 5.656L8 19H4v-4L13.828 4.172z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 14l2 2 2-2-2-2-2 2z"></path>
            </svg>
          </a>
        ${is_superuser === "true" ? `
          <a href="javascript:void(0)" onclick="deleteLead('${leadId}')" class="text-red-500 hover:text-red-700 transition">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </a>
        ` : ''}
        </div>
      </div>
    `;
}

function openKavkom(phoneNumber) {
  // Store the original URL
  const kavkomUrl = `kavkom://call?number=${phoneNumber}`;
  
  // First try to check if Kavkom is available
  checkKavkomAvailability()
    .then(isAvailable => {
      if (isAvailable) {
        // If available, try to open Kavkom
        window.location.href = kavkomUrl;
      } else {
        // If not available, show installation modal
        showKavkomInstallModal(phoneNumber);
      }
    });
}

// Function to check if Kavkom is available
function checkKavkomAvailability() {
  return new Promise((resolve) => {
    const timeout = 500; // Timeout in milliseconds
    const start = Date.now();
    const kavkomCheck = window.location.href;

    // Try to open Kavkom with a test URL
    window.location.href = 'kavkom://';

    // Check if we're still on the same page after a delay
    setTimeout(() => {
      if (document.hidden || document.webkitHidden) {
        // App opened
        resolve(true);
      } else {
        // App not opened
        resolve(false);
      }
    }, timeout);
  });
}

// Function to show Kavkom installation modal
function showKavkomInstallModal(phoneNumber) {
  // Create modal if it doesn't exist
  if (!document.getElementById('kavkomModal')) {
    const modalHTML = `
      <div id="kavkomModal" class="hidden fixed inset-0 z-50 overflow-y-auto bg-gray-500 bg-opacity-75 flex items-center justify-center">
        <div class="relative bg-white dark:bg-boxdark rounded-lg max-w-md w-full mx-4 md:mx-auto shadow-lg">
          <div class="p-6">
            <div class="flex items-center justify-center gap-4 mb-4">
              <div class="flex-shrink-0 w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <svg class="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                </svg>
              </div>
              <div class="flex-1">
                <h3 class="text-lg font-medium text-graydark dark:text-white">
                  Kavkom Not Found
                </h3>
                <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Kavkom needs to be installed to make calls. Would you like to:
                </p>
              </div>
            </div>
            <div class="space-y-3">
              <button onclick="installKavkom()" class="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                Install Kavkom
              </button>
              <button onclick="makeRegularCall('${phoneNumber}')" class="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
                Make Regular Call Instead
              </button>
              <button onclick="closeKavkomModal()" class="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }

  // Show the modal
  const modal = document.getElementById('kavkomModal');
  modal.classList.remove('hidden');
}

// Function to handle Kavkom installation
function installKavkom() {
  // Replace these URLs with actual Kavkom store URLs
  const isAndroid = /Android/i.test(navigator.userAgent);
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
  
  if (isAndroid) {
    window.location.href = 'https://play.google.com/store/apps/details?id=com.kavkom.app'; // Replace with actual Play Store URL
  } else if (isIOS) {
    window.location.href = 'https://apps.apple.com/app/kavkom/id123456789'; // Replace with actual App Store URL
  } else {
    // For desktop or other devices, you might want to show a different message
    alert('Please visit the app store on your mobile device to install Kavkom.');
  }
  
  closeKavkomModal();
}

// Function to make a regular phone call
function makeRegularCall(phoneNumber) {
  window.location.href = `tel:${phoneNumber}`;
  closeKavkomModal();
}

// Function to close the modal
function closeKavkomModal() {
  const modal = document.getElementById('kavkomModal');
  if (modal) {
    modal.classList.add('hidden');
  }
}

function toggleLeadEditMode(leadId, editMode) {
  const iconsLead = "iconsLead" + leadId;
  const editableFields = [
    'leadFirstName' + leadId,
    'leadLastName' + leadId,
    'leadEmail' + leadId,
    'leadPhone' + leadId,
    'leadLinkedIn' + leadId,
    'leadClientPost' + leadId
  ];
  
  const notes = document.getElementById(`leadNotes${leadId}`);
  if (notes) {
    notes.readOnly = !editMode;
  }
  
const iconsLeadContainer = document.getElementById(iconsLead);
  if (editMode) {
    // Edit mode icons
    iconsLeadContainer.innerHTML = `
              <a href="javascript:void(0)" onclick="editLead('${leadId}')"
                class="text-green-500 hover:text-green-700 transition" 
                style="display: inline;">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </a>
                        <a href="javascript:void(0)" onclick="toggleLeadEditMode('${leadId}',false)" class="text-red-500 hover:text-red-700 transition">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </a>`;
      
    editableFields.forEach(id => {
      const element = document.getElementById(id);
      if (element) {
      element.setAttribute('contenteditable', 'true');
      }
    });
  } else {
    // View mode icons
    iconsLeadContainer.innerHTML = `
      <a href="javascript:void(0)" onclick="toggleLeadEditMode('${leadId}',true)" class="text-blue-500 hover:text-blue-700 transition">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 4.172a4 4 0 015.656 5.656L8 19H4v-4L13.828 4.172z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 14l2 2 2-2-2-2-2 2z"></path>
            </svg>
          </a>`;
      
    const is_superuser = localStorage.getItem("role");
          if(is_superuser === "true"){
      iconsLeadContainer.innerHTML += `
            <a href="javascript:void(0)" onclick="deleteLead('${leadId}')" class="text-red-500 hover:text-red-700 transition">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
        </a>`;
          }
      
    editableFields.forEach(id => {
      const element = document.getElementById(id);
      if (element) {
      element.setAttribute('contenteditable', 'false');
      }
    });
  }
}

// Edit lead (populate form with existing data)
function editLead(leadId) {
  const existingLead = clientData.leads.find(lead => lead.id == leadId);
  
  const updatedData = {
    first_name: document.getElementById(`leadFirstName${leadId}`).textContent,
    last_name: document.getElementById(`leadLastName${leadId}`).textContent,
    email: document.getElementById(`leadEmail${leadId}`).textContent,
    phone: document.getElementById(`leadPhone${leadId}`).textContent,
    linkedIn: document.getElementById(`leadLinkedIn${leadId}`).querySelector('a').href,
    notes: document.getElementById(`leadNotes${leadId}`).value,
    client_post: document.getElementById(`leadClientPost${leadId}`).textContent
  };

  // Make sure client_post isn't empty or undefined
  if (!updatedData.client_post) {
    updatedData.client_post = '';
  }

  // Clean up LinkedIn URL
  if (updatedData.linkedIn === '#') {
    updatedData.linkedIn = null;
  }

  console.log('Updating lead with data:', updatedData);

  apiClient
    .patch(`/lead/${leadId}/edit/`, updatedData, {
        withCredentials: true,
        headers: {
        'X-CSRFToken': Cookies.get('csrftoken'),
        'Content-Type': 'application/json',
        },
    })
    .then((response) => {
      if (response.status === 200) {
        // Create complete updated lead data
        const finalLeadData = {
          ...existingLead,
          ...response.data,
          id: leadId,
          client_post: updatedData.client_post, // Preserve the updated client_post
          linkedIn: updatedData.linkedIn,
          notes: updatedData.notes
        };
        
        // Update clientData
        const leadIndex = clientData.leads.findIndex(lead => lead.id == leadId);
        if (leadIndex !== -1) {
          clientData.leads[leadIndex] = finalLeadData;
        localStorage.setItem("clientData", JSON.stringify(clientData));
          
          // Update UI
          const leadElement = document.querySelector(`[data-id="${leadId}"]`);
          if (leadElement) {
            const newLeadHTML = displayLead(finalLeadData);
            leadElement.outerHTML = newLeadHTML;
          }
        }
        
        toggleLeadEditMode(leadId, false);
      }
    })
    .catch(error => {
      console.error("Error updating lead:", error);
      alert('Error updating lead. Please try again.');
    });
}



function clearLeadForm() {
  document.getElementById('leadFirstName').value = '';
  document.getElementById('leadLastName').value = '';
  document.getElementById('leadEmail').value = '';
  document.getElementById('leadPhone').value = '';
  document.getElementById('leadLinkedIn').value = '';
  document.getElementById('leadNotes').value = ''; // Add this line
  document.getElementById('leadClientPost').value = '';

}


function createDeleteLeadModal() {
  if (!document.getElementById('deleteLeadModal')) {
    document.body.insertAdjacentHTML('beforeend', `
      <div id="deleteLeadModal" class="hidden fixed inset-0 z-50 overflow-y-auto bg-gray-500 bg-opacity-75 flex items-center justify-center">
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
                  Supprimer le lead
                </h3>
                <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Êtes-vous sûr de vouloir supprimer ce Contact ? Cette action est irréversible.
                </p>
              </div>
            </div>
            <div class="mt-6 flex justify-end gap-3">
              <button type="button" id="cancelDeleteLead" class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:bg-boxdark dark:text-white dark:border-strokedark">
                Annuler
              </button>
              <button type="button" id="confirmDeleteLead" class="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                Supprimer
              </button>
            </div>
          </div>
        </div>
      </div>
    `);
  }
}// Function to delete a lead using a modal
function deleteLead(leadId) {
  // Ensure the modal exists
  createDeleteLeadModal();

  // Get the modal and buttons
  const modal = document.getElementById('deleteLeadModal');
  const cancelButton = document.getElementById('cancelDeleteLead');
  const confirmButton = document.getElementById('confirmDeleteLead');

  // Show the modal
  modal.classList.remove('hidden');

  // Handle "Annuler" button click
  cancelButton.addEventListener('click', () => {
    modal.classList.add('hidden'); // Hide the modal
  });

  // Handle "Supprimer" button click
  confirmButton.addEventListener('click', () => {
    modal.classList.add('hidden'); // Hide the modal

    // Perform the deletion
    apiClient
      .delete(`/lead/${leadId}/delete/`, {
          withCredentials: true,
          headers: {
          'X-CSRFToken': Cookies.get('csrftoken'), // Manually extract the CSRF token
          },
      })
      .then((response) => {
        console.log("Lead deleted successfully:", response.data);
        if (response.status == 200) {
          const leadToRemove = document.querySelector(`[data-id="${leadId}"]`);
          if (leadToRemove) {
            console.log("leadremove");
            leadToRemove.remove();
          }
          const array = clientData.leads;
          console.log("arrayyyheeeeeeeeere:", array);
          console.log("clientDataTEST:", clientData);
          for (let i = 0; i < array.length; i++) {
            if (array[i].id == leadId) {
              array.splice(i, 1);
              break;
            }
          }
          localStorage.setItem("clientData", JSON.stringify(clientData));
        }
      })
      .catch((error) => {
        console.error("Error deleting lead:", error);
      });
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
          const jobToRemove = document.querySelector(`[data-id="${jobId}"]`);
          if (jobToRemove) {
                      jobToRemove.remove(); // Supprimer la carte du DOM
          }

                  // Mettre à jour les données locales
          for (let key in jobsData) {
            if (jobsData[key].id == jobId) {
              delete jobsData[key];
              break;
            }
          }

                  localStorage.setItem("jobsData", JSON.stringify(jobsData)); // Mettre à jour le localStorage
        }
      })
      .catch((error) => {
        console.error("Error deleting job:", error);
      });
  }
}

// Utility function to get CSRF token (required for POST/DELETE requests in Django)
function getCSRFToken() {
  return document.querySelector('[name=csrfmiddlewaretoken]').value;
}

function load_Jobs() {
  const clientId = localStorage.getItem('clientId');

  const jobsContainer = document.getElementById('jobsContainer');
  jobsContainer.innerHTML = '';
  if (!jobsData) {
    apiClient
      .get(`/job/get/${clientId}/`,
        {
          withCredentials: true,
      }
      )
      .then((response) => {
        const jobs = response.data;
        console.log("Jobs loaded successfully:", jobs);
        localStorage.setItem('jobsData', JSON.stringify(jobs));
        jobsData = JSON.parse(localStorage.getItem('jobsData'));
        displayJobs(jobs);
      })
      .catch((error) => {
        console.error("Error loading jobs:", error);
      });
  }
  else {
    displayJobs(jobsData);
  }
  function displayJobs(jobs) {
    const pipelineCount = localStorage.getItem('pipelineCount') || 0;
    const jobsContainer = document.getElementById('jobsContainer');

    // Clear existing content
    jobsContainer.innerHTML = '';

    // Create a wrapper div to center the job cards
    const wrapperDiv = document.createElement('div');
    wrapperDiv.className = 'flex flex-col items-center w-full'; // Center the job cards

    jobs.forEach((job) => {
      const jobHTML = `
            <div data-id="${job.id}" class="job-card bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 mb-6 w-full max-w-3xl flex flex-row items-center justify-between">
    <div class="flex-grow">
                    <h5 class="text-xl font-bold text-gray-900 dark:text-white cursor-pointer hover:text-blue-600 transition-colors duration-300" onclick="get_job(${job.id})">${job.title}</h5>
                    <div class="mt-4 space-y-2">
                        <div class="flex items-center space-x-2">
                            <span class="text-sm font-semibold text-gray-600 dark:text-gray-300">Status:</span>
                            <span class="text-sm text-gray-700 dark:text-gray-200">${job.status}</span>
    </div>
                        <div class="flex items-center space-x-2">
                            <span class="text-sm font-semibold text-gray-600 dark:text-gray-300">Start Date:</span>
                            <span class="text-sm text-gray-700 dark:text-gray-200">${job.opening_date}</span>
                        </div>
                        <div class="flex items-center space-x-2">
                            <span class="text-sm font-semibold text-gray-600 dark:text-gray-300">Description:</span>
                            <span class="text-sm text-gray-700 dark:text-gray-200">${job.description}</span>
                        </div>
                        <div class="flex items-center space-x-2">
                            <span class="text-sm font-semibold text-gray-600 dark:text-gray-300">Account Manager:</span>
                            <span class="text-sm text-gray-700 dark:text-gray-200">${job.idRecruiter}</span>
                        </div>
                        <div class="flex items-center space-x-2">
                            <span class="text-sm font-semibold text-gray-600 dark:text-gray-300">Selected Candidates:</span>
                            <span class="text-sm text-gray-700 dark:text-gray-200">${pipelineCount}</span>
                        </div>
                    </div>
                </div>
                <div class="flex space-x-4 items-center">
      <!-- Update Icon -->
                    <a href="javascript:void(0)" onclick="get_job(${job.id})" class="text-blue-500 hover:text-blue-700 transition-colors duration-300">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 4.172a4 4 0 015.656 5.656L8 19H4v-4L13.828 4.172z"></path>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 14l2 2 2-2-2-2-2 2z"></path>
        </svg>
      </a>
      <!-- Delete Icon -->
                    <a style="display: ${is_superuser === "true" ? 'inline' : 'none'};" href="javascript:void(0)" onclick="deleteJob('${job.id}')" class="text-red-500 hover:text-red-700 transition-colors duration-300">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </a>
    </div>
  </div>
`;
        wrapperDiv.insertAdjacentHTML('beforeend', jobHTML);
    });

    // Append the wrapper div to the jobs container
    jobsContainer.appendChild(wrapperDiv);
  }
  
}

function get_job(id) {
  apiClient
    .get(`/job/get-job/${id}/`,
      {
        withCredentials: true,
    }
    )
    .then((response) => {
      const job = response.data;
      console.log("Job loaded successfully:", job);
      localStorage.setItem('jobData', JSON.stringify(job));
      window.location.href = 'job-details.html';

    })
    .catch((error) => {
      console.error("Error loading job:", error);
    });
}