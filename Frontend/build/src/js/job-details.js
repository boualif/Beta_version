let id_cand;
// Function to get query parameter by name
const jobData = JSON.parse(localStorage.getItem('jobData'));
const jobId = jobData.id_Job;
function getQueryParam(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

// Function to load job details based on job ID
function loadJobDetails() {
  const originalDiv = document.getElementById('job-info');
  if (originalDiv) {
    originalDiv.remove();
  }
  const saveBtn = document.getElementById('btn-save');
  saveBtn.style.display = "none";
  const targetDiv = document.createElement('div');
  targetDiv.id = 'job-info';
  const main_content = document.getElementById("main-job-content");
  fetch('job-content.html').then(response => response.text()) // Get the content as text
  .then(data => {
    console.log('job app fetch', jobData);
    targetDiv.innerHTML = data; // Insert the fetched content into the div
    main_content.appendChild(targetDiv); // Append the new div to the body or any other parent element
    document.getElementById('jobTitle').value = jobData.title;
    document.getElementById("openingDate").value = jobData.opening_date;
    document.getElementById('status').value = jobData.status ? jobData.status : "";
    document.getElementById('location').value = jobData.location;
    document.getElementById("key-account-name").innerHTML = "Key Account Name:" + `<br>` + jobData.ownerRH;
    document.getElementById("client-name").innerHTML = "Client Name:" + `<br>` + jobData.client;
    document.getElementById("job-description").value = jobData.description;
    document.getElementById("budget").value = jobData.budget;
    document.getElementById("contact-person").value = jobData.contact_person;
    document.getElementById("contact-person-phone").value = jobData.contact_person_phone;
    document.getElementById("contact-person-email").value = jobData.contact_person_email;
    document.getElementById("number-openings").value = jobData.nb_positions;
    document.getElementById("job-description").value = jobData.description;
    document.getElementById("contract-start-date").value = jobData.contract_start_date;
    document.getElementById("contract-end-date").value = jobData.contract_end_date;
    document.getElementById("competence_phare").value = jobData.competence_phare;  // Get competence_phare value


    const jobId = jobData.id_Job;
    console.log("jobIdhere==", jobId);
    const is_superuser = localStorage.getItem("role");
    if (is_superuser === "true") {
      document.getElementById("jobIcons").innerHTML += `<a onclick ="deleteJob(jobId)" class="text-red-500 hover:text-red-700 cursor-pointer transition">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </a>`;
    }
    document.getElementById("updateJobIcon").onclick = () => toggleJobEditMode(jobId, true);
  }).catch(error => console.error('Error loading the external file:', error));
  document.getElementById("dt-btn").className = "rounded bg-white px-3 py-1 text-xs font-medium text-black shadow-card hover:bg-white hover:shadow-card dark:bg-boxdark dark:text-white dark:hover:bg-boxdark";
  document.getElementById("process-btn").className = "rounded px-3 py-1 text-xs font-medium text-black hover:bg-white hover:shadow-card dark:text-white dark:hover:bg-boxdark";
}

// Toggle Edit Mode
function toggleJobEditMode(jobId, editMode) {
  console.log("edit job mode");
  const editableFields = [{
    id: 'jobTitle',
    type: 'text'
  }, {
    id: "openingDate",
    type: 'date'
  }, {
    id: 'status',
    type: 'text'
  }, {
    id: 'location',
    type: 'text'
  }, {
    id: 'budget',
    type: 'numeric'
  }, {
    id: 'contact-person',
    type: 'text'
  }, {
    id: 'contact-person-phone',
    type: 'tel'
  }, {
    id: 'contact-person-email',
    type: 'email'
  }, {
    id: 'number-openings',
    type: 'numeric'
  }, {
    id: 'contract-start-date',
    type: 'date'
  }, {
    id: 'contract-end-date',
    type: 'date'
  }, {
    id: 'job-description',
    type: 'text'
  },
  {
    id: 'competence_phare',
    type: 'text'
  }];
  
  if (editMode) {
    document.getElementById("jobIcons").innerHTML = `
              <a href="javascript:void(0)" onclick="editJob('${jobId}')"
                class="absolute top-4 right-24 text-green-500 hover:text-green-700 transition" 
                style="display: inline;">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </a>
              <!-- Cancel Icon -->
                        <a href="javascript:void(0)" onclick="toggleJobEditMode('${jobId}',false)" class="absolute top-4 right-14 text-red-500 hover:text-red-700 transition">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </a>`;
    editableFields.forEach(field => {
      const element = document.getElementById(field.id);
      document.getElementById(field.id).removeAttribute("disabled");

      // Add inputmode to help define the expected input type for mobile keyboards
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
          // You might need to handle dates differently if the field isn't a date input
          element.setAttribute('type', 'date');
          break;
        default:
          element.setAttribute('inputmode', 'text');
      }
    });
  } else {
    document.getElementById("jobIcons").innerHTML = `<a href="javascript:void(0)" onclick="toggleJobEditMode('${jobId}',true)" class="absolute top-4 right-24  text-blue-500 hover:text-blue-700 transition">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 4.172a4 4 0 015.656 5.656L8 19H4v-4L13.828 4.172z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 14l2 2 2-2-2-2-2 2z"></path>
            </svg>
          </a>`;
    if (is_superuser === "true") {
      document.getElementById("jobIcons").innerHTML += `<!-- Delete Icon -->
            <a href="javascript:void(0)" onclick="deleteJob('${jobId}')" class="absolute top-4 right-14 text-red-500 hover:text-red-700 transition">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </a>`;
    }
    editableFields.forEach(field => {
      const element = document.getElementById(field.id);
      document.getElementById(field.id).setAttribute('disabled', true);
    });
  }

  //document.getElementById('updateClientIcon').onclick = () => toggleUpdateClientForm()
  //document.getElementById('updateClientIcon').style.display =
  // document.getElementById('updateClientIcon').style.display === 'none' ? 'inline' : 'none';
  //document.getElementById('saveClientIcon').style.display =
  //document.getElementById('saveClientIcon').style.display === 'none' ? 'inline' : 'none';
}
function editJob(jobId) {
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
  const competence_phare = document.getElementById("competence_phare").value;  // Add this line

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
    "end": end
    }, {
    withCredentials: true,
    headers: {
      'X-CSRFToken': Cookies.get('csrftoken') // Manually extract the CSRF token
    }
  }).then(response => {
    if (response.status == 200) {
      console.log('Data updated successfully:', response.data);
      toggleJobEditMode(jobId, false);
    }
  }).catch(error => {
    console.error('Error updating data:', error);
  });
}
let dataArray = [];
function loadProcess() {
  const originalDiv = document.getElementById('job-info');
  if (originalDiv) {
    originalDiv.remove();
  }
  const saveBtn = document.getElementById('btn-save');
  saveBtn.style.display = "block";
  const targetDiv = document.createElement('div');
  targetDiv.id = 'job-info';
  const main_content = document.getElementById("main-job-content");
  // Fetch the content from the external HTML file
  fetch('job-applications.html').then(response => response.text()) // Get the content as text
  .then(data => {
    console.log('job app fetch');
    targetDiv.innerHTML = data; // Insert the fetched content into the div
    main_content.appendChild(targetDiv); // Append the new div to the body or any other parent element
    ['new', 'preselected', 'interviewed', 'tested', 'proposed', 'hired', 'start', 'end'].forEach(columnId => {
      Sortable.create(document.getElementById(columnId), {
        group: 'shared',
        // Allow dragging between columns
        animation: 150,
        // Animation speed in ms
        ghostClass: 'bg-blue-100',
        // Class name for the drop placeholder
        onStart: handleDragStart,
        onEnd: handleDragEnd
      });
    });
    const jobId = jobData.id_Job;
    apiClient.get(`/api/job-application/${jobId}/`, {
      withCredentials: true
    }).then(function (response) {
      // Save the candidate data to localStorage
      //localStorage.setItem('candidateData', JSON.stringify(candidateData));
      dataArray = response.data;
      dataArray.forEach((element, index) => {
        const html = `
<div id="card"${index} data-index=${index} id_cand=${element.id_candidate} class="dark:bg-slate-800 gap-6 flex items-center justify-center">
  <div class="bg-gray-100 dark:bg-gray-700 relative shadow-xl overflow-hidden hover:shadow-2xl group rounded-xl p-5 transition-all duration-500 transform">
    <div class="flex items-center gap-4">
      <div class="w-fit transition-all transform duration-500 max-w-[100px] cursor-pointer">
        <h1 onclick="get_candidate(${element.id_candidate})" class="text-gray-600 dark:text-gray-200 font-bold hover:text-primary">${element.fullName}</h1>
        <p class="text-gray-400">${element.jobTitle}</p>
        <a href="" class="text-xs text-gray-500 dark:text-gray-200 group-hover:opacity-100 opacity-0 transform transition-all delay-300 duration-500 break-words leading-[1.25]">${element.email}</a>
      </div>
    </div>
  </div>
</div>`;
        console.log(element.lastStage);
        document.getElementById(element.lastStage).innerHTML += html;
      });
      document.getElementById('btn-save').addEventListener('click', function () {
        saveAppChanges();
      });
    }).catch(function (error) {
      console.error("Error fetching candidate data:", error);
      alert("Failed to fetch candidate data. Please try again.");
    });
  }).catch(error => console.error('Error loading the external file:', error));
  document.getElementById("dt-btn").className = "rounded px-3 py-1 text-xs font-medium text-black hover:bg-white hover:shadow-card dark:text-white dark:hover:bg-boxdark";
  document.getElementById("process-btn").className = "rounded bg-white px-3 py-1 text-xs font-medium text-black shadow-card hover:bg-white hover:shadow-card dark:bg-boxdark dark:text-white dark:hover:bg-boxdark";
}
function saveAppChanges() {
  // console.log(updatedIndex)

  updatedIndex.forEach(index => {
    // Select the element with the matching data-index attribute
    const itemElement = document.querySelector(`[data-index='${index}']`);
    if (itemElement) {
      // Get the parent element's ID
      const parentElementId = itemElement.parentElement.id;
      //console.log(`Item with data-index ${index} is inside parent element with ID: ${parentElementId}`);
    }
  });
  // Array to hold updated data elements
  const updatedDataArray = updatedIndex.map(index => {
    // Find the element with the current index from updatedIndex
    const itemElement = document.querySelector(`[data-index='${index}']`);

    // Check if the element exists in the DOM and get its parent ID
    if (itemElement) {
      const currentParentId = itemElement.parentElement.id;
      element = dataArray[index];
      // Check if the current element's lastStage is different from the parent container's ID

      element.lastStage = currentParentId;
      element.date = new Date();
      return element; // Include this element in the new array
    }
    return null; // Exclude elements that don't meet the criteria
  }).filter(element => element !== null); // Filter out null values

  console.log(updatedDataArray);
  const jobId = jobData.id_Job;
  apiClient.patch(`/api/job-application/${jobId}/`, updatedDataArray, {
    withCredentials: true,
    headers: {
      'X-CSRFToken': Cookies.get('csrftoken') // Manually extract the CSRF token
    }
  }).then(response => {
    console.log('Data updated successfully:', response.data);
  }).catch(error => {
    console.error('Error updating data:', error);
  });
}
// On page load
window.onload = () => {
  //const jobId = getQueryParam("1");
  //if (jobId) {
  loadJobDetails();

  //} else {
  //  document.getElementById("job-title").textContent = "Invalid job ID";
  //}
};

// Function to handle the display of card content on drag start
function handleDragStart(event) {
  event.item.classList.add('dragging');
}
let updatedIndex = [];
// Function to handle the removal of drag styles on drag end
function handleDragEnd(event) {
  event.item.classList.remove('dragging');
  const targetContainerId = event.to.id; // ID of the container where the item was dropped
  const movedItem = event.item;
  const itemIndex = movedItem.getAttribute('data-index'); // ID of the dropped item
  id_cand = movedItem.getAttribute('id_cand');
  if (dataArray) {
    if (dataArray[itemIndex].lastStage != targetContainerId) {
      if (!updatedIndex.includes(itemIndex)) {
        updatedIndex.push(itemIndex);
        initializeDatePickers();
      }
    }
  }
  console.log(`Card with ID ${itemIndex} was dropped in container with ID ${targetContainerId}`);
  // const card = document.querySelector(`[data-index="${itemIndex}"]`);
  if (targetContainerId == 'interviewed') {
    document.getElementById('interviewModal').classList.remove('hidden');
    console.log("hello");
  }
}
function toggleEditMode() {
  document.querySelectorAll('.editable').forEach(element => {
    // Toggle contenteditable state
    element.contentEditable = element.contentEditable === "true" ? "false" : "true";
    // Optionally, add some styling to show edit mode
    if (element.contentEditable === "true") {
      element.style.backgroundColor = '#f9f9f9'; // Light grey background for editable state
    } else {
      element.style.backgroundColor = ''; // Reset background color
    }
  });
}

// Example function to save changes (can be customized)
function saveChanges() {
  const updatedData = {};
  document.querySelectorAll('.editable').forEach(element => {
    updatedData[element.id] = element.textContent.trim();
  });

  // Send `updatedData` to your backend or handle it as needed
  console.log('Updated Data:', updatedData);

  // Optionally, disable editing mode after saving
  toggleEditMode();
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
  apiClient.get(`/api/get-candidate/${id}/`, {
    withCredentials: true
  }).then(function (response) {
    const responseData = response.data;
    localStorage.setItem('candidateData', JSON.stringify(responseData));
    // Save the candidate data to localStorage
    // localStorage.setItem('candidateData', JSON.stringify(candidateData));

    // Redirect to profile.html
    window.location.href = "profile.html";
  }).catch(function (error) {
    console.error("Error fetching candidate data:", error);
    alert("Failed to fetch candidate data. Please try again.");
  });
}
function deleteJob(jobId) {
  if (confirm('Are you sure you want to delete this job?')) {
    apiClient.delete(`/job/${jobId}/delete/`, {
      withCredentials: true,
      headers: {
        'X-CSRFToken': Cookies.get('csrftoken') // Manually extract the CSRF token
      }
    }).then(response => {
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
        } else if (pageName === "form-layout-job.html") {
          window.location.href = "profile-client.html";
        }
      }
    }).catch(error => {
      console.error("Error deleting job:", error);
    });
  }
}
function closeModal(event) {
  event.preventDefault();
  document.getElementById("interviewModal").classList.add("hidden");
}
function saveInterview(event) {
  event.preventDefault();
  const form = document.getElementById("interviewForm");
  const formData = new FormData(form);
  console.log(formData);
  apiClient.post(`/interview/post/${id_cand}/${jobData.id_Job}/`, formData, {
    withCredentials: true,
    headers: {
      'X-CSRFToken': Cookies.get('csrftoken') // Manually extract the CSRF token
    }
  }).then(response => {
    console.log("Interview added successfully:", response.data);
    if (response.status == 200) {
      document.getElementById("interviewModal").classList.add("hidden");
      saveAppChanges();
    }
  }).catch(error => {
    console.error("Error updating data:", error);
  });
}
function initializeDatePickers() {
  const dateInputs = document.querySelectorAll(".form-datepicker"); // Select date input elements

  dateInputs.forEach(input => {
    flatpickr(input, {
      // Options for the date picker (e.g., date format)
      dateFormat: "Y/m/d",
      allowInput: true
    });
  });
}