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

// Update function
function updateClient(id) {
  const client = clients.find(client => client.id === id);
  if (client) {
    const leadName = document.getElementById('leadName').value;
    const leadEmail = document.getElementById('leadEmail').value;
    const leadCompany = document.getElementById('leadCompany').value;
    const leadPhone = document.getElementById('leadPhone').value;
    const leadLinkedIn = document.getElementById('leadLinkedIn').value;
    client.leadName = leadName;
    client.leadEmail = leadEmail;
    client.leadCompany = leadCompany;
    client.leadPhone = leadPhone;
    client.leadLinkedIn = leadLinkedIn;
    console.log('Client updated:', client);
    displayClient(client);
  } else {
    console.log('Client not found');
  }
}

// Delete function
function deleteClient(id) {
  if (confirm('Are you sure you want to delete this client?')) {
    apiClient.delete(`/${id}/client/delete/`, {
      withCredentials: true,
      headers: {
        'X-CSRFToken': Cookies.get('csrftoken') // Manually extract the CSRF token
      }
    }).then(response => {
      console.log("Client deleted successfully:", response.data);
      window.location.href = "tables-client.html";
    }).catch(error => {
      console.error("Error deleting lead:", error);
    });
  }
}

// Display clients function
function displayClients() {
  const clientList = document.getElementById('clientList');
  clientList.innerHTML = '';
  clients.forEach(client => {
    const clientHTML = `
                        <div>
                        <h2>${client.leadName}</h2>
                        <p>Email: ${client.leadEmail}</p>
                        <p>Company: ${client.leadCompany}</p>
                        <p>Phone: ${client.leadPhone}</p>
                        <p>LinkedIn: ${client.leadLinkedIn}</p>
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
            </div>
            `;
  document.getElementById('clientDetails').innerHTML = clientHTML;
}
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
  document.getElementById('updateClientIcon').onclick = () => toggleClientEditMode(clientId, true);
  //document.getElementById('deleteClientIcon').addEventListener('click', deleteClient(clientId));
};

// Toggle Edit Mode
function toggleClientEditMode(clientId, editMode) {
  console.log("edit client mode");
  const editableFields = ['clientWebsite', 'companyName', 'companyLocation', 'companyIndustry', 'companyDescription', 'companyPhone', 'companyURLs'];
  if (editMode) {
    const statusTab = document.getElementById("statusTab");
    const statusEdit = document.getElementById("statusEdit");
    statusTab.classList.remove("hidden");
    statusEdit.value = clientData.status;
    const engagementTab = document.getElementById("engagementTab");
    engagementTab.classList.remove("hidden");
    const engagementTypeEdit = document.getElementById("engagementTypeEdit");
    engagementTypeEdit.value = clientData.engagement_type;
    document.getElementById("iconsClient").innerHTML = `
              <a href="javascript:void(0)" onclick="editClient('${clientId}')"
                class="absolute top-4 right-24 text-green-500 hover:text-green-700 transition" 
                style="display: inline;">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </a>
                            <!-- Cancel Icon -->
                        <a href="javascript:void(0)" onclick="toggleClientEditMode('${clientId}',false)" class="absolute top-4 right-14 text-red-500 hover:text-red-700 transition">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </a>`;
    editableFields.forEach(id => {
      const element = document.getElementById(id);
      element.setAttribute('contenteditable', 'true');
    });
  } else {
    document.getElementById("statusTab").classList.add("hidden");
    document.getElementById("engagementTab").classList.add("hidden");
    document.getElementById("iconsClient").innerHTML = `<a href="javascript:void(0)" onclick="toggleClientEditMode('${clientId}',true)" class="absolute top-4 right-24  text-blue-500 hover:text-blue-700 transition">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 4.172a4 4 0 015.656 5.656L8 19H4v-4L13.828 4.172z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 14l2 2 2-2-2-2-2 2z"></path>
            </svg>
          </a>`;
    if (is_superuser === "true") {
      document.getElementById("iconsClient").innerHTML += `<!-- Delete Icon -->
          <a href="javascript:void(0)" onclick="deleteClient('${clientId}')" class="absolute top-4 right-14 text-red-500 hover:text-red-700 transition">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </a>`;
    }
    editableFields.forEach(id => {
      const element = document.getElementById(id);
      element.setAttribute('contenteditable', 'false');
    });
  }

  //document.getElementById('updateClientIcon').onclick = () => toggleUpdateClientForm()
  //document.getElementById('updateClientIcon').style.display =
  // document.getElementById('updateClientIcon').style.display === 'none' ? 'inline' : 'none';
  //document.getElementById('saveClientIcon').style.display =
  //document.getElementById('saveClientIcon').style.display === 'none' ? 'inline' : 'none';
}
function editClient(clientId) {
  const website = document.getElementById('clientWebsite').textContent;
  const companyName = document.getElementById('companyName').textContent;
  const location = document.getElementById('companyLocation').textContent;
  const industry = document.getElementById('companyIndustry').textContent;
  const description = document.getElementById('companyDescription').textContent;
  const headquarters_phone_number = document.getElementById('companyPhone').textContent;
  const companyURLs = document.getElementById('companyURLs').textContent;
  const status = document.getElementById("statusEdit").value;
  const engagementType = document.getElementById("engagementTypeEdit").value;
  apiClient.patch(`/${clientId}/client/update/`, {
    'company': companyName,
    'website': website,
    'headquarters_phone_number': headquarters_phone_number,
    'status': status,
    'industry': industry,
    'description': description,
    'location': location,
    'status': status,
    'engagement_type': engagementType,
    'urls': companyURLs
  }, {
    withCredentials: true,
    headers: {
      'X-CSRFToken': Cookies.get('csrftoken') // Manually extract the CSRF token
    }
  }).then(response => {
    if (response.status == 200) {
      console.log("Client updated successfully:");
      clientData.company = companyName;
      clientData.website = website;
      clientData.headquarters_phone_number = headquarters_phone_number;
      clientData.industry = industry;
      clientData.description = description;
      clientData.location = location;
      clientData.status = status;
      clientData.engagement_type = engagementType;
      document.getElementById("status-btn").textContent = clientData.status;
      document.getElementById("egagement-type-btn").textContent = clientData.engagement_type;
      localStorage.setItem("clientData", JSON.stringify(clientData));
      toggleClientEditMode(clientId, false);
    }
  }).catch(error => {
    console.error("Error updating client:", error);
  });
}
function load_Client() {
  const clientData = JSON.parse(localStorage.getItem('clientData'));
  localStorage.setItem("clientId", clientData.id_Client);
  const [navigation] = performance.getEntriesByType("navigation");
  if (navigation && navigation.type === "reload") {
    console.log("yeeeeeeeeeees");
    if (sessionStorage.getItem("pageReloaded")) {
      // Reset the flag after handling reload logic
      sessionStorage.removeItem("pageReloaded");
      // Perform any additional logic if needed
      console.log("relooooooooooadeeeeeed");
      getClient(clientData.id_Client);
      localStorage.removeItem("jobsData");
    }
  }
  document.getElementById("companyName").textContent = clientData.company;
  document.getElementById("companyLocation").textContent = clientData.location;
  document.getElementById("companyIndustry").textContent = clientData.industry;
  document.getElementById("companyDescription").textContent = clientData.description;
  document.getElementById("companyPhone").textContent = clientData.headquarters_phone_number;
  var urls = clientData.urls;
  if (urls) {
    //urls=urls.split(',');
    const listUrls = document.getElementById("listUrls");
    listUrls.innerHTML = '';
    urls.forEach(url => {
      const newUrl = `<li><a href="https://${url}" class="text-blue-600 hover:underline"
        target="_blank">${url}</a></li>`;
      listUrls.innerHTML += newUrl;
    });
  }
  document.getElementById("status-btn").textContent = clientData.status;
  document.getElementById("egagement-type-btn").textContent = clientData.engagement_type;
  document.getElementById("added-date-btn").textContent = clientData.added_at;
  document.getElementById("key-account-manager-btn").textContent = clientData.key_account_manager;
  const website = document.getElementById("clientWebsite");
  website.textContent = clientData.website;
  website.href = "https://" + clientData.website;
  const logo = clientData.image;
  if (logo) {
    document.getElementById("profileImage").src = `data:image/jpeg;base64,${clientData.image}`;
  }
  clientId = clientData.id_Client;
  localStorage.setItem('clientId', clientId);
  const fileInput = document.getElementById('profile');
  fileInput.addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (event) {
        profileImage.src = event.target.result;
        //console.log('result==', event.target.result)
        clientData.image = event.target.result;
        const base64ImageData = event.target.result;
        const base64Data = base64ImageData.split(',')[1];

        // Prepare the update data object with the base64 image data only
        const updateData = {
          'image': base64Data // This is just the base64-encoded string without the prefix
        };
        console.log(updateData);
        apiClient.patch(`/${clientId}/get-client/`, updateData, {
          withCredentials: true,
          headers: {
            'X-CSRFToken': Cookies.get('csrftoken') // Manually extract the CSRF token
          }
        }).then(response => {
          console.log('Data updated successfully:', response.data);
        }).catch(error => {
          console.error('Error updating data:', error);
        });
      };
      reader.readAsDataURL(file);
    }
  });
  const leads = clientData.leads;
  const leadsContainer = document.getElementById('leadListContainer');
  leadsContainer.innerHTML = ''; // Clear the container
  if (leads) {
    leads.forEach(lead => {
      const leadHTML = displayLead(lead);
      // Append the generated HTML to the container

      leadsContainer.insertAdjacentHTML('beforeend', leadHTML);
    });
  }
}
function getClient(id) {
  apiClient.get(`/${id}/get-client/`, {
    withCredentials: true
  }).then(function (response) {
    const clientData = response.data;
    localStorage.setItem('clientData', JSON.stringify(clientData));
    console.log(clientData);
  }).catch(function (error) {
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
  };
}

// Load leads on page load
//document.addEventListener('DOMContentLoaded', loadLeads);

function addLead() {
  console.log("clientID", clientId);
  const firstName = document.getElementById('leadFirstName').value;
  const lastName = document.getElementById('leadLastName').value;
  const email = document.getElementById('leadEmail').value;
  const phone = document.getElementById('leadPhone').value;
  const linkedIn = document.getElementById('leadLinkedIn').value;
  const lead = {
    first_name: firstName,
    last_name: lastName,
    email: email,
    phone: phone,
    linkedIn: linkedIn,
    client_id: clientId
  };
  apiClient.post('/lead/new/', lead, {
    withCredentials: true,
    headers: {
      'X-CSRFToken': Cookies.get('csrftoken') // Manually extract the CSRF token
    }
  }).then(response => {
    if (response.status === 201) {
      console.log('added:', response);
      const data = response.data;
      const lead_id = data.id;
      lead.id = lead_id;
      const leadHTML = displayLead(lead);
      // Append the generated HTML to the container
      const leadsContainer = document.getElementById('leadListContainer');
      leadsContainer.insertAdjacentHTML('beforeend', leadHTML);
      var array = clientData.leads;
      array.push(lead);
      console.log("newCD", clientData);
      localStorage.removeItem("clientData");
      localStorage.setItem("clientData", JSON.stringify(clientData));
    }
  }).catch(error => console.error('Error:', error));
}
;
function loadLeads() {
  fetch('/lead/').then(response => response.json()).then(data => {
    const leadListContainer = document.getElementById('leadListContainer');
    leadListContainer.innerHTML = ''; // Clear existing content
    data.leads.forEach((lead, index) => {
      leadListContainer.innerHTML += displayLead(lead);
    });
  }).catch(error => console.error('Error loading leads:', error));
}

// Save lead (create or update)
function saveLead(event) {
  event.preventDefault();
  const leadForm = document.getElementById('leadForm');
  const formData = new FormData(leadForm);
  fetch('/lead/create_or_update/', {
    method: 'POST',
    body: formData
  }).then(response => response.json()).then(data => {
    if (data.success) {
      loadLeads(); // Reload the leads list
      toggleLeadForm(); // Hide the form
      leadForm.reset(); // Clear the form
    } else {
      alert('Failed to save lead. Please try again.');
    }
  }).catch(error => console.error('Error saving lead:', error));
}
function displayLead(lead) {
  const icons = "iconsLead" + lead.id;
  leadId = lead.id;
  const is_superuer = localStorage.getItem("role");
  const leadHTML = `
      <div data-id="${leadId}" class="mb-4 flex items-start justify-between border-b border-gray-200 dark:border-gray-700 pb-4">
        <div class="flex-grow">
          <h5 id="leadFirstName${leadId}" class="text-lg font-semibold text-black dark:text-white" contenteditable="false">${lead.first_name}</h5>
          <h5 id="leadLastName${leadId}" class="text-lg font-semibold text-black dark:text-white" contenteditable="false">${lead.last_name}</h5>
          <table class="w-full mt-2 border-collapse">
            <tbody>
              <tr>
                <td class="font-semibold text-bodydark dark:text-white/70" >Contact:</td>
                <td ><p id="leadEmail${leadId}" contenteditable="false"> ${lead.email}</p></td>
              </tr>
              <tr>
                <td class="font-semibold text-bodydark dark:text-white/70">Phone:</td>
                <td id="leadPhone${leadId}" contenteditable="false">${lead.phone}</td>
              </tr>
              <tr>
                <td class="font-semibold text-bodydark dark:text-white/70">LinkedIn:</td>
                <td id="leadLinkedIn${leadId}" contenteditable="false"><a href="${lead.linkedin}" class="text-primary hover:underline">LinkedIn Profile</a></td>
              </tr>
            </tbody>
          </table>
          <div class="mt-4">
            <label for="leadNotes-${leadId}" class="block text-sm font-medium text-bodydark dark:text-white/70">Notes</label>
            <textarea id="leadNotes-${leadId}" class="mt-1 block w-full border border-stroke rounded-lg p-2 text-bodydark dark:bg-boxdark dark:text-white">${lead.notes}</textarea>
          </div>
        </div>
        <div id="${icons}" class="flex space-x-2 items-center">
          <!-- Update Icon -->
          <a href="javascript:void(0)" onclick="toggleLeadEditMode('${leadId}',true)" class="text-blue-500 hover:text-blue-700 transition">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 4.172a4 4 0 015.656 5.656L8 19H4v-4L13.828 4.172z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 14l2 2 2-2-2-2-2 2z"></path>
            </svg>
          </a>
          <!-- Delete Icon -->
          <a style="display: ${is_superuser === "true" ? 'inline' : 'none'}"; onclick="deleteLead('${leadId}')" class="text-red-500 hover:text-red-700 transition hover:cursor-pointer">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </a>
        </div>
      </div>
    `;
  const deleteIcon = document.createElement("div");
  return leadHTML;
}
function toggleLeadEditMode(leadId, editMode) {
  console.log("edit lead mode");
  const iconsLead = "iconsLead" + leadId;
  const firstName = 'leadFirstName' + leadId;
  const lastName = 'leadLastName' + leadId;
  const email = 'leadEmail' + leadId;
  const phone = 'leadPhone' + leadId;
  const linkedIn = 'leadLinkedIn' + leadId;
  const editableFields = [firstName, lastName, email, phone, linkedIn];
  const iconsLeadContainer = document.getElementById(iconsLead);
  if (editMode) {
    iconsLeadContainer.innerHTML = `
              <a href="javascript:void(0)" onclick="editLead('${leadId}')"
                class="text-green-500 hover:text-green-700 transition" 
                style="display: inline;">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </a>
              <!-- Cancel Icon -->
                        <a href="javascript:void(0)" onclick="toggleLeadEditMode('${leadId}',false)" class="text-red-500 hover:text-red-700 transition">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </a>`;
    editableFields.forEach(id => {
      const element = document.getElementById(id);
      element.setAttribute('contenteditable', 'true');
    });
  } else {
    iconsLeadContainer.innerHTML = `<a href="javascript:void(0)" onclick="toggleLeadEditMode('${leadId}',true)" class="text-blue-500 hover:text-blue-700 transition">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 4.172a4 4 0 015.656 5.656L8 19H4v-4L13.828 4.172z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 14l2 2 2-2-2-2-2 2z"></path>
            </svg>
          </a>`;
    if (is_superuser === "true") {
      iconsLeadContainer.innerHTML += `<!-- Delete Icon -->
            <a href="javascript:void(0)" onclick="deleteLead('${leadId}')" class="text-red-500 hover:text-red-700 transition">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </a>`;
    }
    editableFields.forEach(id => {
      const element = document.getElementById(id);
      element.setAttribute('contenteditable', 'false');
    });
  }

  //document.getElementById('updateClientIcon').onclick = () => toggleUpdateClientForm()
  //document.getElementById('updateClientIcon').style.display =
  // document.getElementById('updateClientIcon').style.display === 'none' ? 'inline' : 'none';
  //document.getElementById('saveClientIcon').style.display =
  //document.getElementById('saveClientIcon').style.display === 'none' ? 'inline' : 'none';
}

// Edit lead (populate form with existing data)
function editLead(leadId) {
  const iconsLead = "iconsLead" + leadId;
  const firstName = 'leadFirstName' + leadId;
  const lastName = 'leadLastName' + leadId;
  const email = 'leadEmail' + leadId;
  const phone = 'leadPhone' + leadId;
  const linkedIn = 'leadLinkedIn' + leadId;
  const leadFirstName = document.getElementById(firstName).textContent;
  const leadLastName = document.getElementById(lastName).textContent;
  const leadEmail = document.getElementById(email).textContent;
  const leadPhone = document.getElementById(phone).textContent;
  const leadLinkedIn = document.getElementById(linkedIn).textContent;
  console.log(firstName, leadFirstName);
  const data = {
    'first_name': leadFirstName,
    'last_name': leadLastName,
    'email': leadEmail,
    'phone': leadPhone,
    'linkedIn': leadLinkedIn
  };
  apiClient.patch(`/lead/${leadId}/edit/`, data, {
    withCredentials: true,
    headers: {
      'X-CSRFToken': Cookies.get('csrftoken') // Manually extract the CSRF token
    }
  }).then(response => {
    if (response.status == 200) {
      console.log("Lead updated successfully:");
      const array = clientData.leads;
      data.id = leadId;
      for (let i = 0; i < array.length; i++) {
        if (array[i].id == leadId) {
          array[i] = data;
          console.log("data==", data);
          break;
        }
      }
      localStorage.setItem("clientData", JSON.stringify(clientData));
      toggleLeadEditMode(leadId, false);
    }
  }).catch(error => {
    console.error("Error updating lead:", error);
  });
}

// Delete lead
function deleteLead(leadId) {
  console.log("deleeeeeeeeeeeete");
  if (confirm('Are you sure you want to delete this lead?')) {
    apiClient.delete(`/lead/${leadId}/delete/`, {
      withCredentials: true,
      headers: {
        'X-CSRFToken': Cookies.get('csrftoken') // Manually extract the CSRF token
      }
    }).then(response => {
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
    }).catch(error => {
      console.error("Error deleting lead:", error);
    });
  }
}
function deleteJob(jobId) {
  if (confirm('Are you sure you want to delete this job?')) {
    apiClient.delete(`/job/${jobId}/delete/`, {
      withCredentials: true,
      headers: {
        'X-CSRFToken': Cookies.get('csrftoken') // Manually extract the CSRF token
      }
    }).then(response => {
      if (response.status === 200) {
        console.log("Job deleted successfully:", response.data);
        const jobToRemove = document.querySelector(`[data-id="${jobId}"]`);
        if (jobToRemove) {
          console.log("leadremove");
          jobToRemove.remove();
        }
        for (let key in jobsData) {
          console.log("keeeeey===", jobsData[key].id, "jobdata===", jobsData[key]);
          if (jobsData[key].id == jobId) {
            console.log("nooooooooooo");
            delete jobsData[key];
            break;
          }
        }
        localStorage.removeItem("jobsData");
        localStorage.setItem("jobsData", JSON.stringify(jobsData));
      }
    }).catch(error => {
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
    apiClient.get(`/job/get/${clientId}/`, {
      withCredentials: true
    }).then(response => {
      const jobs = response.data;
      console.log("Jobs loaded successfully:", jobs);
      localStorage.setItem('jobsData', JSON.stringify(jobs));
      jobsData = JSON.parse(localStorage.getItem('jobsData'));
      displayJobs(jobs);
    }).catch(error => {
      console.error("Error loading jobs:", error);
    });
  } else {
    displayJobs(jobsData);
  }
  function displayJobs(jobs) {
    jobs.forEach(job => {
      const jobHTML = `  
                <div data-id="${job.id}"
      class="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-4 mb-6">            
  <div class="flex items-center justify-between mb-4">
    <h5 class="text-lg font-semibold text-black dark:text-white cursor-pointer hover:underline hover:text-blue-500" onclick="get_job(${job.id})">${job.title}</h5>

      <div class="flex space-x-2 items-center">
        <!-- Update Icon -->
        <a href="javascript:void(0)" onclick="get_job(${job.id})"
          class="text-blue-500 hover:text-blue-700 transition">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M13.828 4.172a4 4 0 015.656 5.656L8 19H4v-4L13.828 4.172z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 14l2 2 2-2-2-2-2 2z"></path>
          </svg>
        </a>
        <!-- Delete Icon -->
        <a style="display: ${is_superuser === "true" ? 'inline' : 'none'};" href="javascript:void(0)" onclick="deleteJob('${job.id}')"
          class="text-red-500 hover:text-red-700 transition">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </a>
      </div>
    </div>

  
  <table class="w-full border-collapse">
    <tbody>
      <tr>
        <td class="font-semibold text-bodydark dark:text-white/70">Status:</td>
        <td>${job.status}</td>
      </tr>
      <tr>
        <td class="font-semibold text-bodydark dark:text-white/70">Opening Date:</td>
        <td>${job.opening_date}</td>
      </tr>
      <tr>
        <td class="font-semibold text-bodydark dark:text-white/70">Description:</td>
        <td>${job.description}</td>
      </tr>
      <tr>
        <td class="font-semibold text-bodydark dark:text-white/70">Key Account Manager:</td>
        <td>${job.ownerRH}</td>
      </tr>
      <tr>
        <td class="font-semibold text-bodydark dark:text-white/70">Selected Candidates:</td>
        <td>...</td>
      </tr>
    </tbody>
  </table>
  </div>`;
      jobsContainer.innerHTML += jobHTML;
    });
  }
}
function get_job(id) {
  apiClient.get(`/job/get-job/${id}/`, {
    withCredentials: true
  }).then(response => {
    const job = response.data;
    console.log("Job loaded successfully:", job);
    localStorage.setItem('jobData', JSON.stringify(job));
    window.location.href = 'job-details.html';
  }).catch(error => {
    console.error("Error loading job:", error);
  });
}