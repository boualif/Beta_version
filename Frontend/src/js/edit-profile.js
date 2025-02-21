/*const apiClient = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': Cookies.get('csrftoken')
  }
});*/
// API Client configuration
/*const apiClient = axios.create({
  baseURL: '/api'
});*/

// Add request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Basic headers for all requests
    config.headers = {
      ...config.headers,
      'Content-Type': 'application/json'
    };

    // Add authentication headers only if CSRF token exists
    const csrfToken = Cookies.get('csrftoken');
    if (csrfToken) {
      config.withCredentials = true;
      config.headers['X-CSRFToken'] = csrfToken;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 403 errors without rejecting the promise
    if (error.response && error.response.status === 403) {
      console.warn('Limited access mode - some features may be restricted');
      return Promise.resolve({ 
        data: error.response.data,
        status: error.response.status,
        limitedAccess: true
      });
    }
    return Promise.reject(error);
  }
);

// Function to check if user has full access
function hasFullAccess() {
  return !!Cookies.get('csrftoken');
}

let experiences = [];
let degrees = [];
// Modified form submission function
function submitFormData(formData, candidateId) {
  const data = {
    candidateData: {
      CandidateInfo: {
        FullName: formData.get('fullName'),
        Email: formData.get('emailAddress'),
        "Job Title": formData.get('jobTitle'),
        PhoneNumber: {
          FormattedNumber: formData.get('phoneNumber'),
          Location: formData.get('location')
        },
        // Add other fields that should be accessible to all users
        Linkedin: formData.get('linkedIn'),
        Github: formData.get('gitHub'),
        Country: formData.get('country'),
        Nationality: formData.get('nationality').split(/[,/;|:-]+/),
        DateOfBirth: formData.get('dateOfBirth'),
        Gender: formData.get('gender'),
        MaritalStatus: formData.get('maritalStatus')
      }
    },
    // These fields are now accessible to all users
    status: formData.get('status'),
    mobility: formData.get('mobility'),
    availability: formData.get('availability')
  };

  return apiClient.patch(
    `/api/update-cv/${candidateId}/`,
    data,
    {
      withCredentials: true,
      headers: {
        'X-CSRFToken': Cookies.get('csrftoken')
      }
    }
  ).then(response => {
    console.log("Update successful:", response.data);
    return response.data;
  }).catch(error => {
    console.error("Update failed:", error);
    throw error;
  });
}


// Add this for debugging
window.addEventListener('load', () => {
  const storedData = localStorage.getItem("responseData");
  console.log("Raw stored data:", storedData);
  if (storedData) {
    try {
      const parsedData = JSON.parse(storedData);
      console.log("Parsed stored data:", parsedData);
    } catch (e) {
      console.error("Error parsing stored data:", e);
    }
  }
});
// Modified window.onload handler
// Update window.onload to properly handle the data
// Updated window.onload handler
// Update the window.onload event handler
// Update the window.onload function
// Update window.onload to handle the response better
window.onload = () => {
  console.log("Loading profile data...");
  const storedData = localStorage.getItem("responseData");
  
  if (storedData) {
      try {
          const profileData = JSON.parse(storedData);
          console.log("Stored profile data:", profileData);

          // Initialize global variables
          if (profileData.candidateData?.CandidateInfo) {
              const candidateInfo = profileData.candidateData.CandidateInfo;
              
              // Initialize experiences
              experiences = Array.isArray(candidateInfo.Experience) 
                  ? candidateInfo.Experience 
                  : [];
                  
              // Initialize degrees
              degrees = Array.isArray(candidateInfo.Degrees) 
                  ? candidateInfo.Degrees 
                  : [];
                  
              // Initialize skills
              skills = {
                  soft: Array.isArray(candidateInfo['Soft Skills']) 
                      ? candidateInfo['Soft Skills'] 
                      : [],
                  hard: Array.isArray(candidateInfo['Hard Skills']) 
                      ? candidateInfo['Hard Skills'] 
                      : []
              };
              
              // Initialize languages
              languages = Array.isArray(candidateInfo.Languages) 
                  ? candidateInfo.Languages 
                  : [];
                  
              // Initialize certifications
              certifications = Array.isArray(candidateInfo.Certifications) 
                  ? candidateInfo.Certifications 
                  : [];
              
              // Store the complete candidate data
              candidateData = profileData;
              
              // Populate all form fields and sections
              populateFormFields(profileData);
              
              // Render all sections
              renderExperiences();
              renderDegrees();
              renderCertifications();
              displaySkills(skills);
              displayLanguages(languages);
      }
    } catch (e) {
          console.error("Error parsing profile data:", e);
    }
  }

  // Add form submit handler
  const form = document.getElementById("profileForm");
  if (form) {
      form.addEventListener("submit", handleFormSubmit);
  }
};


function formatDateForInput(dateString) {
  if (!dateString) return '';
  
  try {
      // Handle "Month Year" format (e.g., "Sept. 2015")
      const monthYearMatch = dateString.match(/([A-Za-z]+\.?\s+)(\d{4})/);
      if (monthYearMatch) {
          const month = monthYearMatch[1].trim().replace('.', '');
          const year = monthYearMatch[2];
          const monthNumber = {
              'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
              'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
              'Sept': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
          }[month.substring(0, 3)] || '01';
          
          return `${year}-${monthNumber}-01`;
      }

      // Handle date range format (e.g., "2015 - 2018")
      const dateRange = dateString.split(' - ');
      if (dateRange.length === 2) {
          const startYear = dateRange[0].trim();
          return `${startYear}-01-01`;
      }

      // Try parsing as regular date
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
          return date.toISOString().split('T')[0];
      }

      return '';
  } catch {
      return '';
  }
}
// Updated handleFormSubmit function
// Updated handleFormSubmit function with better data flow handling
function handleFormSubmit(e) {
      e.preventDefault();
  showLoading();
  const formData = new FormData(e.target);
  
  if (!candidateData || !candidateData.id_candidate) {
    console.error("No candidate ID available");
    hideLoading();
    showErrorMessage("Missing candidate information");
    return;
  }
 // Capture links from the form
  const linksInput = formData.get('links');
  const linksArray = linksInput ? linksInput.split(/[,/;|:-]+/).map(link => link.trim()).filter(link => link !== "") : [];
  // Process experiences with proper date handling
  const updatedExperiences = Array.from(document.querySelectorAll('[id^="experienceTitle"]')).map((titleInput, index) => {
    const startDateInput = document.getElementById(`experiencePeriodStart${index}`);
    const endDateInput = document.getElementById(`experiencePeriodEnd${index}`);
    
    // Get the dates and ensure they're properly formatted
    const startDate = startDateInput ? startDateInput.value : '';
    const endDate = endDateInput ? endDateInput.value : '';
    
    // Format dates for French display
    const formattedStartDate = formatDateToFrench(startDate);
    const formattedEndDate = formatDateToFrench(endDate);
    
    return {
      Title: titleInput.value,
      StartDate: startDate,
      EndDate: endDate,
      Period: `${formattedStartDate} - ${formattedEndDate}`,
      Description: document.getElementById(`experienceDescription${index}`).value
    };
  });

  // Process degrees with proper date handling
  const updatedDegrees = Array.from(document.querySelectorAll('[id^="degreeName"]')).map((degreeInput, index) => {
    const startDateInput = document.getElementById(`startDate${index}`);
    const endDateInput = document.getElementById(`endDate${index}`);
    
    // Get the dates and ensure they're properly formatted
    const startDate = startDateInput ? startDateInput.value : '';
    const endDate = endDateInput ? endDateInput.value : '';
    
    // Format dates for French display
    const formattedStartDate = formatDateToFrench(startDate);
    const formattedEndDate = formatDateToFrench(endDate);
    
    return {
      DegreeName: degreeInput.value,
      NormalizeDegree: document.getElementById(`normalizeDegree${index}`)?.value || '',
      Specialization: document.getElementById(`specialization${index}`)?.value || '',
      CountryOrInstitute: document.getElementById(`countryOrInstitute${index}`)?.value || '',
      StartDate: startDate,
      EndDate: endDate,
      Date: `${formattedStartDate} - ${formattedEndDate}`
    };
  });

  // Build update data with processed dates
  const updatedData = {
    candidateData: {
      ...candidateData.candidateData,
      CandidateInfo: {
        ...candidateData.candidateData.CandidateInfo,
        Experience: updatedExperiences,
        Degrees: updatedDegrees,
        Links: linksArray, // Add the links array

        // ... rest of the CandidateInfo fields
      }
    }
  };

  console.log("Sending update with processed dates:", updatedData);

  // Send update to server
  apiClient.patch(
    `/api/update-cv/${candidateData.id_candidate}/`,
    updatedData,
    {
      withCredentials: true,
      headers: {
        'X-CSRFToken': Cookies.get('csrftoken')
      }
    }
  )
  .then(response => {
    console.log("Update response:", response.data);
    localStorage.setItem('responseData', JSON.stringify(updatedData));
    candidateData = updatedData;
    window.location.href = "profile.html";
        })
        .catch(error => {
    console.error("Update error:", error);
    showErrorMessage("Failed to update profile");
  })
  .finally(() => {
    hideLoading();
  });
}
// Helper function to format date to French format
function formatDateToFrench(dateStr) {
  if (!dateStr) return '';
  
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    
    const months = [
      'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
      'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
    ];
    
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  } catch (e) {
    console.error("Error formatting date to French:", e);
    return dateStr;
  }
}
// Add event listeners for date changes
function addDateChangeListeners() {
  // For experiences
  document.querySelectorAll('[id^="experiencePeriodStart"], [id^="experiencePeriodEnd"]').forEach(input => {
    input.addEventListener('change', function(e) {
      const index = this.id.match(/\d+/)[0];
      updateExperiencePeriod(index);
    });
  });

  // For degrees
  document.querySelectorAll('[id^="startDate"], [id^="endDate"]').forEach(input => {
    input.addEventListener('change', function(e) {
      const index = this.id.match(/\d+/)[0];
      updateDegreePeriod(index);
        });
    });
  }
function updateDegreePeriod(index) {
  const startInput = document.getElementById(`startDate${index}`);
  const endInput = document.getElementById(`endDate${index}`);
  
  if (startInput && endInput && startInput.value && endInput.value) {
    const formattedStart = formatDateToFrench(startInput.value);
    const formattedEnd = formatDateToFrench(endInput.value);
    degrees[index].Date = `${formattedStart} - ${formattedEnd}`;
    degrees[index].StartDate = startInput.value;
    degrees[index].EndDate = endInput.value;
  }
}

// Call this after rendering experiences and degrees
document.addEventListener('DOMContentLoaded', function() {
  renderExperiences();
  renderDegrees();
  addDateChangeListeners();
});
// Update period string when dates change
function updateExperiencePeriod(index) {
  const startInput = document.getElementById(`experiencePeriodStart${index}`);
  const endInput = document.getElementById(`experiencePeriodEnd${index}`);
  
  if (startInput && endInput && startInput.value && endInput.value) {
    const formattedStart = formatDateToFrench(startInput.value);
    const formattedEnd = formatDateToFrench(endInput.value);
    experiences[index].Period = `${formattedStart} - ${formattedEnd}`;
    experiences[index].StartDate = startInput.value;
    experiences[index].EndDate = endInput.value;
  }
}
// Additional helper function to ensure data persistence
function ensureDataPersistence() {
  const storedData = localStorage.getItem('responseData');
  if (storedData) {
      try {
          const parsedData = JSON.parse(storedData);
          if (parsedData && parsedData.candidateData) {
              candidateData = parsedData.candidateData;
              populateFormFields(parsedData);
          }
      } catch (e) {
          console.error("Error parsing stored data:", e);
      }
  }
}
window.addEventListener('load', ensureDataPersistence);
function formatDateForStorage(dateString) {
  if (!dateString) return '';
  try {
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
          return date.toISOString().split('T')[0];
      }
      return dateString;
  } catch (e) {
      return dateString;
  }
}

function formatDateForDisplay(dateString) {
  if (!dateString) return '';
  try {
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
          return date.toLocaleDateString();
      }
      return dateString;
  } catch (e) {
      return dateString;
  }
}
// Add these helper functions for showing messages
// Function to show success message
// Success message function
function showSuccessMessage() {
  const messageContainer = document.createElement('div');
  messageContainer.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50';
  messageContainer.textContent = 'Profile updated successfully!';
  document.body.appendChild(messageContainer);
  setTimeout(() => messageContainer.remove(), 3000);
}

// Helper function to show error message
function showErrorMessage(message) {
  const messageContainer = document.createElement('div');
  messageContainer.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-50';
  messageContainer.textContent = message;
  document.body.appendChild(messageContainer);
  setTimeout(() => messageContainer.remove(), 3000);
}
// Update form submission to handle both authenticated and unauthenticated users
// Update the form submission event handler
// Modified form submission handler with proper links handling
// Modified form submission handler with proper links handling
document.getElementById("profileForm").addEventListener("submit", function(e) {
  e.preventDefault();
  showLoading();
  const formData = new FormData(this);

  // Create a deep copy of the current candidateData to preserve all existing data
  const updatedData = JSON.parse(JSON.stringify(candidateData));

  // Update basic information
  updatedData.candidateData.CandidateInfo.FullName = formData.get('fullName');
  updatedData.candidateData.CandidateInfo["Job Title"] = formData.get('jobTitle');
  updatedData.candidateData.CandidateInfo.Email = formData.get('emailAddress');

  // Handle phone number
  updatedData.candidateData.CandidateInfo.PhoneNumber = {
    FormattedNumber: formData.get('phoneNumber'),
    Location: formData.get('location')
  };

  // Update social and professional links
  updatedData.candidateData.CandidateInfo.Linkedin = formData.get('linkedIn');
  updatedData.candidateData.CandidateInfo.Github = formData.get('gitHub');

  // Handle general links - split by commas, slashes, semicolons, pipes, or hyphens
  const linksInput = formData.get('links');
  const linksArray = linksInput ? 
    linksInput.split(/[,/;|:-]+/)
      .map(link => link.trim())
      .filter(link => link !== "") : 
    [];
  
  // Explicitly set the Links array in the CandidateInfo
  updatedData.candidateData.CandidateInfo.Links = linksArray;

  // Update other personal information
  updatedData.candidateData.CandidateInfo.Country = formData.get('country');
  updatedData.candidateData.CandidateInfo.Nationality = formData.get('nationality') ? 
    formData.get('nationality').split(/[,/;|:-]+/) : [];
  updatedData.candidateData.CandidateInfo.DateOfBirth = formData.get('dateOfBirth');
  updatedData.candidateData.CandidateInfo.Gender = formData.get('gender');
  updatedData.candidateData.CandidateInfo.MaritalStatus = formData.get('maritalStatus');

  // Maintain arrays
  updatedData.candidateData.CandidateInfo["Soft Skills"] = skills.soft;
  updatedData.candidateData.CandidateInfo["Hard Skills"] = skills.hard;
  updatedData.candidateData.CandidateInfo.Languages = languages;
  updatedData.candidateData.CandidateInfo.Certifications = certifications;
  updatedData.candidateData.CandidateInfo.Experience = experiences;
  updatedData.candidateData.CandidateInfo.Degrees = degrees;

  // Update status fields
  updatedData.status = formData.get('status');
  updatedData.mobility = formData.get('mobility');
  updatedData.availability = formData.get('availability');
  updatedData.recruiter = formData.get('recruiter');

  // Handle file upload if present
  const fileInput = document.getElementById("file-upload");
  if (fileInput.files.length > 0) {
    console.log("Uploading file and updating data");
    fileContent[1] = updatedData;

    apiClient.patch(
      `/api/add-cv/${candidateData.id_candidate}/${idRecruiter}/`,
      {
        fileContents: fileContent,
      },
      {
        withCredentials: true,
        headers: {
          'X-CSRFToken': Cookies.get('csrftoken'),
        }
      }
    )
    .then((response) => {
      console.log("Data updated successfully:", response.data);
      localStorage.setItem('responseData', JSON.stringify(updatedData));
      return get_candidate(candidateData.id_candidate);
    })
    .catch((error) => {
      console.error("Error updating data:", error);
      showErrorMessage("Failed to update profile");
      hideLoading();
    });
  } else {
    console.log("Updating profile data without file");
    console.log("Updated data:", updatedData);

    apiClient.patch(
      `/api/update-cv/${candidateData.id_candidate}/`,
      updatedData,
      {
        withCredentials: true,
        headers: {
          'X-CSRFToken': Cookies.get('csrftoken'),
        }
      }
    )
    .then((response) => {
      console.log("Data updated successfully:", response.data);
      localStorage.setItem('responseData', JSON.stringify(updatedData));
      return get_candidate(candidateData.id_candidate);
    })
    .catch((error) => {
      console.error("Error updating data:", error);
      showErrorMessage("Failed to update profile");
      hideLoading();
    });
  }
});

// Function to safely get nested object values
function getNestedValue(obj, path, defaultValue = '') {
  try {
    return path.split('.').reduce((acc, part) => acc[part], obj) || defaultValue;
  } catch (e) {
    return defaultValue;
  }
}

function prepareFormData(formData) {
  // Prepare the data object
  const data = {
    candidateData: {
      CandidateInfo: {
        FullName: formData.get('fullName'),
        "Titled Post": formData.get('jobTitle'),
        Email: formData.get('emailAddress'),
        // ... add all other fields
      }
    }
  };
  
  // Add additional fields only if authenticated
  if (Cookies.get('csrftoken')) {
    data.status = formData.get('status');
    data.mobility = formData.get('mobility');
    data.availability = formData.get('availability');
  }
  
  return data;
}
let skills = {
soft: [],
hard: [],
};
let languages = [];

let certifications = [];
let candidateData;



// Function to populate form fields with candidate data
// Updated populateFormFields function with safe value access
// Updated populateFormFields function
function populateFormFields(profileData) {
  if (!profileData || !profileData.candidateData) {
    console.error('Invalid profile data structure:', profileData);
    return;
  }

  // Extract the main candidate data object
  const candidateData = profileData.candidateData;
  const candidateInfo = candidateData.candidateData?.CandidateInfo;

  if (!candidateInfo) {
    console.error('No CandidateInfo found in:', candidateData);
    return;
  }

  // Helper function to safely set input values
  const setInputValue = (elementId, value) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.value = value || '';
  }
  };

  // Basic Information
  setInputValue('fullName', candidateInfo.FullName);
  setInputValue('jobTitle', candidateInfo['Job Title'] || candidateInfo['Titled Post']);
  setInputValue('emailAddress', candidateInfo.Email);

  // Phone Information
  if (candidateInfo.PhoneNumber) {
    setInputValue('phoneNumber', candidateInfo.PhoneNumber.FormattedNumber);
    setInputValue('location', candidateInfo.PhoneNumber.Location);
  }

  // Social Links
  // Social Links
  setInputValue('linkedIn', candidateInfo.Linkedin);
  setInputValue('gitHub', candidateInfo.Github);
  if (Array.isArray(candidateInfo.Links)) {
    setInputValue('links', candidateInfo.Links.join(', '));
  }

  // Personal Information
  setInputValue('country', candidateInfo.Country);
  if (Array.isArray(candidateInfo.Nationality)) {
    setInputValue('nationality', candidateInfo.Nationality.join(', '));
  } else {
    setInputValue('nationality', candidateInfo.Nationality);
  }
  setInputValue('dateOfBirth', candidateInfo.DateOfBirth);
  setInputValue('gender', candidateInfo.Gender);
  setInputValue('maritalStatus', candidateInfo.MaritalStatus);

  // Status Information
  setInputValue('status', candidateData.status);
  setInputValue('mobility', candidateData.mobility);
  setInputValue('availability', candidateData.availability);
  setInputValue('recruiter', candidateData.recruiter);

  // Skills
  skills = {
    soft: Array.isArray(candidateInfo['Soft Skills']) ? candidateInfo['Soft Skills'] : [],
    hard: Array.isArray(candidateInfo['Hard Skills']) ? candidateInfo['Hard Skills'] : []
  };
  displaySkills(skills);

  // Languages
  languages = Array.isArray(candidateInfo.Languages) ? candidateInfo.Languages : [];
  displayLanguages(languages);

  // Certifications
  certifications = Array.isArray(candidateInfo.Certifications) ? candidateInfo.Certifications : [];
  const certContainer = document.getElementById("containerCertifications");
  if (certContainer) {
    certContainer.innerHTML = "";
    renderCertifications();
  }

  // Experiences
  experiences = Array.isArray(candidateInfo.Experience) ? candidateInfo.Experience : [];
  const expContainer = document.getElementById("containerExperience");
  if (expContainer) {
    expContainer.innerHTML = "";
    renderExperiences();
  }

  // Degrees
  degrees = Array.isArray(candidateInfo.Degrees) ? candidateInfo.Degrees : [];
  const degreesContainer = document.getElementById("containerEducation");
  if (degreesContainer) {
    degreesContainer.innerHTML = "";
    renderDegrees();
  }

  console.log('Form populated with data:', {
    candidateInfo,
    skills,
    languages,
    certifications,
    experiences
  });
}
// Function to render experiences
// Helper function to format date for month input
function formatMonthForInput(periodString) {
  if (!periodString) return '';
  
  // Add debug logging
  console.log("Formatting period string:", periodString);
  
  try {
      // Handle format like "juillet 2019 - juillet 2021"
      const monthsMap = {
          'janvier': '01', 'février': '02', 'mars': '03', 'avril': '04',
          'mai': '05', 'juin': '06', 'juillet': '07', 'août': '08',
          'septembre': '09', 'octobre': '10', 'novembre': '11', 'décembre': '12',
          // Add short forms
          'jan': '01', 'fév': '02', 'mar': '03', 'avr': '04',
          'mai': '05', 'juin': '06', 'juil': '07', 'août': '08',
          'sept': '09', 'oct': '10', 'nov': '11', 'déc': '12'
      };

      // Split period into start and end dates
      const parts = periodString.split('-').map(p => p.trim());
      console.log("Period parts:", parts);

      if (parts.length === 2) {
          // Parse start date
          const startParts = parts[0].toLowerCase().split(' ');
          console.log("Start parts:", startParts);
          
          // Find the month and year
          let startMonth = '';
          let startYear = '';
          
          startParts.forEach(part => {
              // Check if part is a year (4 digits)
              if (/^\d{4}$/.test(part)) {
                  startYear = part;
              }
              // Check if part is a month name
              else if (monthsMap[part.toLowerCase()]) {
                  startMonth = monthsMap[part.toLowerCase()];
              }
          });

          if (startMonth && startYear) {
              const formattedDate = `${startYear}-${startMonth}`;
              console.log("Formatted date:", formattedDate);
              return formattedDate;
          }
      }

      console.log("Could not parse date, returning empty string");
      return '';
  } catch (error) {
      console.error("Error parsing date:", error);
      return '';
  }
}

// Helper function to parse French date
function parseFrenchDate(dateStr) {
  if (!dateStr) return '';
  
  const monthsMap = {
      'janvier': '01', 'février': '02', 'mars': '03', 'avril': '04',
      'mai': '05', 'juin': '06', 'juillet': '07', 'août': '08',
      'septembre': '09', 'octobre': '10', 'novembre': '11', 'décembre': '12',
      'jan.': '01', 'fév.': '02', 'mar.': '03', 'avr.': '04',
      'mai.': '05', 'juin.': '06', 'juil.': '07', 'août.': '08',
      'sept.': '09', 'oct.': '10', 'nov.': '11', 'déc.': '12'
  };

  // Remove any dots and split
  const parts = dateStr.trim().toLowerCase().split(' ');
  const month = monthsMap[parts[0].replace('.', '')] || '01';
  const year = parts[parts.length - 1];

  return `${year}-${month}`;
}

// Updated renderExperiences function
function renderExperiences() {
  const containerExp = document.getElementById("containerExperience");
  if (!containerExp) return;

  const experiencesContainerChild = document.createElement("div");
  containerExp.innerHTML = "";

  experiences.forEach((exp, index) => {
      console.log("Processing experience:", exp); // Debug log

      const expEntryDiv = document.createElement("div");
      expEntryDiv.className = "mb-3 flex items-center justify-between";

      const inputContainer = document.createElement("div");
      inputContainer.className = "flex-1";

      // Title field
      const expTitleDiv = document.createElement("div");
      expTitleDiv.className = "mb-3 flex items-center";

      const expTitleLabel = document.createElement("label");
      expTitleLabel.className = "block w-1/3 text-sm font-medium text-black dark:text-white mr-2";
      expTitleLabel.setAttribute("for", "experienceTitle" + index);
      expTitleLabel.textContent = "Title";

      const expTitleInput = document.createElement("input");
      expTitleInput.type = "text";
      expTitleInput.className = "w-full rounded border border-stroke bg-gray px-3 py-2 font-medium text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary";
      expTitleInput.name = "experienceTitle" + index;
      expTitleInput.id = "experienceTitle" + index;
      expTitleInput.value = exp.Title || '';

      expTitleDiv.appendChild(expTitleLabel);
      expTitleDiv.appendChild(expTitleInput);
      inputContainer.appendChild(expTitleDiv);

      // Period field split into Start and End Date
      const periodDiv = document.createElement("div");
      periodDiv.className = "mb-3 flex items-center";

      const periodLabel = document.createElement("label");
      periodLabel.className = "block w-1/3 text-sm font-medium text-black dark:text-white mr-2";
      periodLabel.textContent = "Period";

      const dateContainer = document.createElement("div");
      dateContainer.className = "flex-1 grid grid-cols-2 gap-4";

      // Parse the period string
      const periodStr = exp.Period || exp.Periode || '';
      console.log("Period string:", periodStr); // Debug log
      const [startStr, endStr] = periodStr.split('-').map(d => d.trim());

      // Start date input
      const startDateContainer = document.createElement("div");
      const startMonthInput = document.createElement("input");
      startMonthInput.type = "month";
      startMonthInput.className = "w-full rounded border border-stroke bg-gray px-3 py-2 font-medium text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary";
      startMonthInput.name = "experiencePeriodStart" + index;
      startMonthInput.id = "experiencePeriodStart" + index;
      startMonthInput.value = parseFrenchDate(startStr);
      console.log("Start date parsed:", startMonthInput.value); // Debug log

      // End date input
      const endDateContainer = document.createElement("div");
      const endMonthInput = document.createElement("input");
      endMonthInput.type = "month";
      endMonthInput.className = "w-full rounded border border-stroke bg-gray px-3 py-2 font-medium text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary";
      endMonthInput.name = "experiencePeriodEnd" + index;
      endMonthInput.id = "experiencePeriodEnd" + index;
      endMonthInput.value = parseFrenchDate(endStr);
      console.log("End date parsed:", endMonthInput.value); // Debug log

      startDateContainer.appendChild(startMonthInput);
      endDateContainer.appendChild(endMonthInput);
      
      dateContainer.appendChild(startDateContainer);
      dateContainer.appendChild(endDateContainer);

      periodDiv.appendChild(periodLabel);
      periodDiv.appendChild(dateContainer);
      inputContainer.appendChild(periodDiv);

      // Description field
      const descriptionDiv = document.createElement("div");
      descriptionDiv.className = "mb-3 flex items-center";

      const descriptionLabel = document.createElement("label");
      descriptionLabel.className = "block w-1/3 text-sm font-medium text-black dark:text-white mr-2";
      descriptionLabel.setAttribute("for", "description" + index);
      descriptionLabel.textContent = "Description";

      const descriptionInput = document.createElement("textarea");
      descriptionInput.className = "w-full rounded border border-stroke bg-gray px-3 py-2 font-medium text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary";
      descriptionInput.name = "experienceDescription" + index;
      descriptionInput.id = "experienceDescription" + index;
      descriptionInput.value = exp.Description || '';

      descriptionDiv.appendChild(descriptionLabel);
      descriptionDiv.appendChild(descriptionInput);
      inputContainer.appendChild(descriptionDiv);

      expEntryDiv.appendChild(inputContainer);

      // Remove button
      const removeIconContainer = document.createElement("div");
      removeIconContainer.className = "flex-shrink-0 ml-4";
      removeIconContainer.style.alignSelf = "flex-start";
      removeIconContainer.style.marginTop = "-10px";

      const removeIcon = document.createElement("span");
      removeIcon.className = "cursor-pointer text-red-500";
      removeIcon.innerHTML = "&times;";
      removeIcon.onclick = function() {
          experiences.splice(index, 1);
          renderExperiences();
      };

      removeIconContainer.appendChild(removeIcon);
      expEntryDiv.appendChild(removeIconContainer);
      experiencesContainerChild.appendChild(expEntryDiv);
  });

  containerExp.appendChild(experiencesContainerChild);

  // Add Experience button
  const addButtonExp = document.createElement("button");
  addButtonExp.className = "mt-3 px-4 py-2 bg-primary text-white rounded";
  addButtonExp.textContent = "Add Experience";
  addButtonExp.type = "button";
  addButtonExp.onclick = displayExperienceForm;
  containerExp.appendChild(addButtonExp);
}

// Event handler to update period when dates change
function handleDateChange(event, index) {
  const startInput = document.getElementById(`experiencePeriodStart${index}`);
  const endInput = document.getElementById(`experiencePeriodEnd${index}`);
  
  if (startInput.value && endInput.value) {
      const startDate = new Date(startInput.value);
      const endDate = new Date(endInput.value);
      
      const formatMonth = (date) => {
          const monthNames = [
              'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
              'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
          ];
          return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
      };
      
      experiences[index].Period = `${formatMonth(startDate)} - ${formatMonth(endDate)}`;
  }
}

// Event listener to update period string when month inputs change
function updatePeriodString(startInput, endInput, periodInput) {
  const monthNames = [
      'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
      'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
  ];

  if (startInput.value && endInput.value) {
      const startDate = new Date(startInput.value);
      const endDate = new Date(endInput.value);
      
      const startStr = `${monthNames[startDate.getMonth()]} ${startDate.getFullYear()}`;
      const endStr = `${monthNames[endDate.getMonth()]} ${endDate.getFullYear()}`;
      
      periodInput.value = `${startStr} - ${endStr}`;
  }
}
// Function to display experience form
function displayExperienceForm() {
  const containerExp = document.getElementById("containerExperience");
  const addButton = containerExp.querySelector("button");
  if (addButton) {
    addButton.style.display = "none";
  }

    const formContainer = document.createElement("div");
    formContainer.className = "mt-4 p-4 border rounded shadow";

  // Create form fields
  const fields = [
    { name: "title", label: "Title", type: "text" },
    { name: "period", label: "Period", type: "text" },
    { name: "description", label: "Description", type: "textarea" }
  ];

  fields.forEach(field => {
    const fieldDiv = document.createElement("div");
    fieldDiv.className = "mb-3";

    const label = document.createElement("label");
    label.className = "block text-sm font-medium text-black dark:text-white mb-2";
    label.textContent = field.label;
    fieldDiv.appendChild(label);

    if (field.type === "textarea") {
      const textarea = document.createElement("textarea");
      textarea.className = "block w-full p-2 border rounded";
      textarea.placeholder = field.label;
      fieldDiv.appendChild(textarea);
    } else {
      const input = document.createElement("input");
      input.type = field.type;
      input.className = "block w-full p-2 border rounded";
      input.placeholder = field.label;
      fieldDiv.appendChild(input);
    }

    formContainer.appendChild(fieldDiv);
  });

  // Save button
    const saveButton = document.createElement("button");
  saveButton.className = "mt-3 px-4 py-2 bg-success text-white rounded";
  saveButton.textContent = "Save Experience";
  saveButton.onclick = function() {
    const [titleInput, periodInput, descriptionInput] = formContainer.querySelectorAll("input, textarea");
    
    const newExp = {
      Title: titleInput.value,
      Period: periodInput.value,
      Description: descriptionInput.value
    };

    experiences.push(newExp);
    formContainer.remove();
    if (addButton) {
      addButton.style.display = "block";
    }
    renderExperiences();
      };

  // Cancel button
  const cancelButton = document.createElement("button");
  cancelButton.className = "mt-3 px-4 py-2 bg-red-500 text-white rounded ml-2";
  cancelButton.textContent = "Cancel";
  cancelButton.onclick = function() {
    formContainer.remove();
    if (addButton) {
      addButton.style.display = "block";
    }
  };

  formContainer.appendChild(saveButton);
  formContainer.appendChild(cancelButton);
  containerExp.appendChild(formContainer);
}

// Function to display degrees form
function displayDegreesForm() {
  const degreesContainer = document.getElementById("containerEducation");
  const addButton = degreesContainer.querySelector("button");
  if (addButton) {
    addButton.style.display = "none";
  }

  const formContainer = document.createElement("div");
  formContainer.className = "mt-4 p-4 border rounded shadow";

  // Create form fields
  const fields = [
    { name: "degreeName", label: "Degree Name", type: "text" },
    { name: "normalizeDegree", label: "Normalized Degree", type: "text" },
    { name: "specialization", label: "Specialization", type: "text" },
    { name: "countryOrInstitute", label: "Country or Institute", type: "text" },
    { name: "startDate", label: "Start Date", type: "date" },
    { name: "endDate", label: "End Date", type: "date" }
  ];

  fields.forEach(field => {
    const fieldDiv = document.createElement("div");
    fieldDiv.className = "mb-3";

    const label = document.createElement("label");
    label.className = "block text-sm font-medium text-black dark:text-white mb-2";
    label.textContent = field.label;
    fieldDiv.appendChild(label);

    const input = document.createElement("input");
    input.type = field.type;
    input.className = "block w-full p-2 border rounded";
    input.placeholder = field.label;
    fieldDiv.appendChild(input);

    formContainer.appendChild(fieldDiv);
  });

  // Save button
  const saveButton = document.createElement("button");
  saveButton.className = "mt-3 px-4 py-2 bg-success text-white rounded";
  saveButton.textContent = "Save Degree";
  saveButton.onclick = function() {
    const inputs = formContainer.querySelectorAll("input");
    
    const newDegree = {
      DegreeName: inputs[0].value,
      NormalizeDegree: inputs[1].value,
      Specialization: inputs[2].value,
      CountryOrInstitute: inputs[3].value,
      StartDate: inputs[4].value,
      EndDate: inputs[5].value
    };

    degrees.push(newDegree);
      formContainer.remove();
    if (addButton) {
      addButton.style.display = "block";
    }
    renderDegrees();
    };

  // Cancel button
    const cancelButton = document.createElement("button");
  cancelButton.className = "mt-3 px-4 py-2 bg-red-500 text-white rounded ml-2";
    cancelButton.textContent = "Cancel";
  cancelButton.onclick = function() {
      formContainer.remove();
    if (addButton) {
      addButton.style.display = "block";
    }
    };

  formContainer.appendChild(saveButton);
    formContainer.appendChild(cancelButton);
  degreesContainer.appendChild(formContainer);
  }
// Function to render degrees/education
function renderDegrees() {
  const degreesContainer = document.getElementById("containerEducation");
  if (!degreesContainer) return;

  const degreesContainerChild = document.createElement("div");
  degreesContainer.innerHTML = "";

    degrees.forEach((degree, index) => {
      const degreeEntryDiv = document.createElement("div");
      degreeEntryDiv.className = "mb-3 flex items-center justify-between";

      const inputContainer = document.createElement("div");
      inputContainer.className = "flex-1";

      // Degree Name field
      const degreeNameDiv = document.createElement("div");
      degreeNameDiv.className = "mb-3 flex items-center";

      const degreeNameLabel = document.createElement("label");
      degreeNameLabel.className = "block w-1/3 text-sm font-medium text-black dark:text-white mr-2";
      degreeNameLabel.setAttribute("for", "degreeName" + index);
      degreeNameLabel.textContent = "Degree Name";

      const degreeNameInput = document.createElement("input");
      degreeNameInput.type = "text";
      degreeNameInput.className = "w-full rounded border border-stroke bg-gray px-3 py-2 font-medium text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary";
      degreeNameInput.name = "degreeName" + index;
      degreeNameInput.id = "degreeName" + index;
      degreeNameInput.value = degree.DegreeName || '';

      degreeNameDiv.appendChild(degreeNameLabel);
      degreeNameDiv.appendChild(degreeNameInput);
      inputContainer.appendChild(degreeNameDiv);

      // Normalized Degree field
      const normalizeDegreeDiv = document.createElement("div");
      normalizeDegreeDiv.className = "mb-3 flex items-center";

      const normalizeDegreeLabel = document.createElement("label");
      normalizeDegreeLabel.className = "block w-1/3 text-sm font-medium text-black dark:text-white mr-2";
      normalizeDegreeLabel.setAttribute("for", "normalizeDegree" + index);
      normalizeDegreeLabel.textContent = "Normalized Degree";

      const normalizeDegreeInput = document.createElement("input");
      normalizeDegreeInput.type = "text";
      normalizeDegreeInput.className = "w-full rounded border border-stroke bg-gray px-3 py-2 font-medium text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary";
      normalizeDegreeInput.name = "normalizeDegree" + index;
      normalizeDegreeInput.id = "normalizeDegree" + index;
      normalizeDegreeInput.value = degree.NormalizeDegree || '';

      normalizeDegreeDiv.appendChild(normalizeDegreeLabel);
      normalizeDegreeDiv.appendChild(normalizeDegreeInput);
      inputContainer.appendChild(normalizeDegreeDiv);

      // Specialization field
      const specializationDiv = document.createElement("div");
      specializationDiv.className = "mb-3 flex items-center";

      const specializationLabel = document.createElement("label");
      specializationLabel.className = "block w-1/3 text-sm font-medium text-black dark:text-white mr-2";
      specializationLabel.setAttribute("for", "specialization" + index);
      specializationLabel.textContent = "Specialization";

      const specializationInput = document.createElement("input");
      specializationInput.type = "text";
      specializationInput.className = "w-full rounded border border-stroke bg-gray px-3 py-2 font-medium text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary";
      specializationInput.name = "specialization" + index;
      specializationInput.id = "specialization" + index;
      specializationInput.value = degree.Specialization || '';

      specializationDiv.appendChild(specializationLabel);
      specializationDiv.appendChild(specializationInput);
      inputContainer.appendChild(specializationDiv);

      // Country/Institute field
      const countryOrInstituteDiv = document.createElement("div");
      countryOrInstituteDiv.className = "mb-3 flex items-center";

      const countryOrInstituteLabel = document.createElement("label");
      countryOrInstituteLabel.className = "block w-1/3 text-sm font-medium text-black dark:text-white mr-2";
      countryOrInstituteLabel.setAttribute("for", "countryOrInstitute" + index);
      countryOrInstituteLabel.textContent = "Country Or Institute";
      countryOrInstituteDiv.appendChild(countryOrInstituteLabel);

      const countryOrInstituteInput = document.createElement("input");
      countryOrInstituteInput.type = "text";
      countryOrInstituteInput.className = "w-full rounded border border-stroke bg-gray px-3 py-2 font-medium text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary";
      countryOrInstituteInput.name = "countryOrInstitute" + index;
      countryOrInstituteInput.id = "countryOrInstitute" + index;
      countryOrInstituteInput.value = degree.CountryOrInstitute || '';

      countryOrInstituteDiv.appendChild(countryOrInstituteLabel);
      countryOrInstituteDiv.appendChild(countryOrInstituteInput);

      inputContainer.appendChild(countryOrInstituteDiv);

      // Start Date field with calendar
      const startDateDiv = document.createElement("div");
      startDateDiv.className = "mb-3 flex items-center";

      const startDateLabel = document.createElement("label");
      startDateLabel.className = "block w-1/3 text-sm font-medium text-black dark:text-white mr-2";
      startDateLabel.setAttribute("for", "startDate" + index);
      startDateLabel.textContent = "Start Date";
      startDateDiv.appendChild(startDateLabel);

      const startDateInput = document.createElement("input");
      startDateInput.type = "date"; // Changed to date type for calendar
    startDateInput.className = "w-full rounded border border-stroke bg-gray px-3 py-2 font-medium text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary";
    startDateInput.name = "startDate" + index;
    startDateInput.id = "startDate" + index;
      const formattedStartDate = formatDateForInput(degree.StartDate || degree.Date?.split(' - ')[0]);
      startDateInput.value = formattedStartDate;

      startDateDiv.appendChild(startDateLabel);
      startDateDiv.appendChild(startDateInput);
      inputContainer.appendChild(startDateDiv);

      // End Date field with calendar
      const endDateDiv = document.createElement("div");
      endDateDiv.className = "mb-3 flex items-center";

      const endDateLabel = document.createElement("label");
      endDateLabel.className = "block w-1/3 text-sm font-medium text-black dark:text-white mr-2";
      endDateLabel.setAttribute("for", "endDate" + index);
      endDateLabel.textContent = "End Date";
      endDateDiv.appendChild(endDateLabel);

      const endDateInput = document.createElement("input");
      endDateInput.type = "date"; // Changed to date type for calendar
      endDateInput.className = "w-full rounded border border-stroke bg-gray px-3 py-2 font-medium text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary";
      endDateInput.name = "endDate" + index;
      endDateInput.id = "endDate" + index;
      const formattedEndDate = formatDateForInput(degree.EndDate || degree.Date?.split(' - ')[1]);
      endDateInput.value = formattedEndDate;

      endDateDiv.appendChild(endDateLabel);
      endDateDiv.appendChild(endDateInput);
      inputContainer.appendChild(endDateDiv);

      degreeEntryDiv.appendChild(inputContainer);

      // Remove button
      const removeIconContainer = document.createElement("div");
      removeIconContainer.className = "flex-shrink-0 ml-4";
      removeIconContainer.style.alignSelf = "flex-start";
      removeIconContainer.style.marginTop = "-10px";

      const removeIcon = document.createElement("span");
      removeIcon.className = "cursor-pointer text-red-500";
      removeIcon.innerHTML = "&times;";
      removeIcon.onclick = function() {
          degrees.splice(index, 1);
          renderDegrees();
      };

      removeIconContainer.appendChild(removeIcon);
      degreeEntryDiv.appendChild(removeIconContainer);
      degreesContainerChild.appendChild(degreeEntryDiv);
    });

  degreesContainer.appendChild(degreesContainerChild);

  // Add Degree button
  const addButtonDegree = document.createElement("button");
  addButtonDegree.className = "mt-3 px-4 py-2 bg-primary text-white rounded";
  addButtonDegree.textContent = "Add Degree";
  addButtonDegree.type = "button";
  addButtonDegree.onclick = displayDegreesForm;
  degreesContainer.appendChild(addButtonDegree);
}
function displaySkills(skills) {
const softSkillsDisplay = document.getElementById("softSkillsDisplay");
const hardSkillsDisplay = document.getElementById("hardSkillsDisplay");

softSkillsDisplay.innerHTML = "";
hardSkillsDisplay.innerHTML = "";

skills.soft.forEach((softSkill, index) => {
  const skillDiv = createSkillDiv(softSkill, "Soft", index);
  softSkillsDisplay.appendChild(skillDiv);
});

skills.hard.forEach((hardSkill, index) => {
  const skillDiv = createSkillDiv(hardSkill, "Hard", index);
  hardSkillsDisplay.appendChild(skillDiv);
});
}

function createSkillDiv(skill, type, index) {
const skillDiv = document.createElement("div");
skillDiv.className = "skill-container";
skillDiv.id = `skillText-${type}-${index}`;
skillDiv.setAttribute("data-index", index);
skillDiv.setAttribute("data-type", type);

// Skill text
const skillText = document.createElement("span");
skillText.textContent = skill;
skillText.className = "skill-text";

// Edit button
const editButton = document.createElement("button");
editButton.className = "edit-button";
editButton.innerHTML = "✎"; // Edit icon
editButton.onclick = () => showEditInputSkill(type, index, skill);

// Remove button
const removeButton = document.createElement("button");
removeButton.className = "remove-button";
removeButton.textContent = "✖"; // Remove icon
removeButton.onclick = () => removeSkill(type, index);

skillDiv.appendChild(skillText);
skillDiv.appendChild(editButton);
skillDiv.appendChild(removeButton);

return skillDiv;
}

function showEditInputSkill(type, index, currentSkill) {
const skillDiv = document.getElementById(`skillText-${type}-${index}`);
const inputField = document.createElement("input");
inputField.type = "text";
inputField.value = currentSkill;
inputField.className = "skill-edit-input";
inputField.setAttribute("data-index", index);
inputField.setAttribute("data-type", type);

// On pressing "Enter", save the updated skill
inputField.onkeydown = function (event) {
  if (event.key === "Enter") {
    saveSkill(type, index, inputField.value);
  }
};

skillDiv.innerHTML = ""; // Clear content for the edit
skillDiv.appendChild(inputField);
inputField.focus(); // Automatically focus on the input field
}

function saveSkill(type, index, updatedSkill) {
if (type === "Soft") {
  skills.soft[index] = updatedSkill;
} else {
  skills.hard[index] = updatedSkill;
}
displaySkills(skills);
}

function removeSkill(type, index) {
if (type === "Soft") {
  skills.soft.splice(index, 1);
} else {
  skills.hard.splice(index, 1);
}
displaySkills(skills);
}

function addSkill(type) {
const inputField = document.getElementById(`new${type}Skill`);
const newSkill = inputField.value.trim();

if (newSkill) {
  if (type === "Soft") {
    skills.soft.push(newSkill);
  } else {
    skills.hard.push(newSkill);
  }
  inputField.value = ""; // Clear the input field
  displaySkills(skills);
}
}

function displayLanguages(languages) {
const languagesDisplay = document.getElementById("languagesDisplay");
languagesDisplay.innerHTML = "";

languages.forEach((language, index) => {
  const languageDiv = createLanguageDiv(language, index);
  languagesDisplay.appendChild(languageDiv);
});
}

function createLanguageDiv(language, index) {
const languageDiv = document.createElement("div");
languageDiv.className = "skill-container";
languageDiv.setAttribute("data-index", index);
languageDiv.id = `languageText-${index}`;
// Skill text
const languageText = document.createElement("span");
languageText.textContent = language;
languageText.className = "skill-text";

// Edit button
const editButton = document.createElement("button");
editButton.className = "edit-button";
editButton.innerHTML = "✎"; // Edit icon
editButton.onclick = () => showEditInputLanguage(index, language);

// Remove button
const removeButton = document.createElement("button");
removeButton.className = "remove-button";
removeButton.textContent = "✖"; // Remove icon
removeButton.onclick = () => removeLanguage(index);

languageDiv.appendChild(languageText);
languageDiv.appendChild(editButton);
languageDiv.appendChild(removeButton);

return languageDiv;
}

function showEditInputLanguage(index, currentLanguage) {
const languageDiv = document.getElementById(`languageText-${index}`);
const inputField = document.createElement("input");
inputField.type = "text";
inputField.value = currentLanguage;
inputField.className = "language-edit-input";
inputField.setAttribute("data-index", index);

// On pressing "Enter", save the updated skill
inputField.onkeydown = function (event) {
  if (event.key === "Enter") {
    saveLanguage(index, inputField.value);
  }
};

languageDiv.innerHTML = ""; // Clear content for the edit
languageDiv.appendChild(inputField);
inputField.focus(); // Automatically focus on the input field
}

function saveLanguage(index, updatedLanguage) {
languages[index] = updatedLanguage;

displayLanguages(languages);
}

function removeLanguage(index) {
languages.splice(index, 1);

displayLanguages(languages);
}
// Function to render certifications
function renderCertifications() {
  const container = document.getElementById("containerCertifications");
  if (!container) return;

  const certificationsContainerChild = document.createElement("div");
  container.innerHTML = "";

  certifications.forEach((certif, index) => {
    const certEntryDiv = document.createElement("div");
    certEntryDiv.className = "mb-3 flex items-center justify-between";

    const inputContainer = document.createElement("div");
    inputContainer.className = "flex-1";

    // Certification Name field
    const certNameDiv = document.createElement("div");
    certNameDiv.className = "mb-3 flex items-center";

    const certNameLabel = document.createElement("label");
    certNameLabel.className = "block w-1/3 text-sm font-medium text-black dark:text-white mr-2";
    certNameLabel.setAttribute("for", "certificationName" + index);
    certNameLabel.textContent = "Certification Name";
    
    const certNameInput = document.createElement("input");
    certNameInput.name = "certificationName" + index;
    certNameInput.id = "certificationName" + index;
    certNameInput.value = certif.CertificationName || '';
    certNameInput.className = "w-full rounded border border-stroke bg-gray px-3 py-2 font-medium text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary";

    certNameDiv.appendChild(certNameLabel);
    certNameDiv.appendChild(certNameInput);
    inputContainer.appendChild(certNameDiv);

    // Issuing Organization field
    const issuingOrgDiv = document.createElement("div");
    issuingOrgDiv.className = "mb-3 flex items-center";

    const issuingOrgLabel = document.createElement("label");
    issuingOrgLabel.className = "block w-1/3 text-sm font-medium text-black dark:text-white mr-2";
    issuingOrgLabel.setAttribute("for", "issuingOrganization" + index);
    issuingOrgLabel.textContent = "Issuing Organization";

    const issuingOrgInput = document.createElement("input");
    issuingOrgInput.type = "text";
    issuingOrgInput.className = "w-full rounded border border-stroke bg-gray px-3 py-2 font-medium text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary";
    issuingOrgInput.name = "issuingOrganization" + index;
    issuingOrgInput.id = "issuingOrganization" + index;
    issuingOrgInput.value = certif.IssuingOrganization || '';

    issuingOrgDiv.appendChild(issuingOrgLabel);
    issuingOrgDiv.appendChild(issuingOrgInput);
    inputContainer.appendChild(issuingOrgDiv);

    // Issue Date field
    const issueDateDiv = document.createElement("div");
    issueDateDiv.className = "mb-3 flex items-center";

    const issueDateLabel = document.createElement("label");
    issueDateLabel.className = "block w-1/3 text-sm font-medium text-black dark:text-white mr-2";
    issueDateLabel.setAttribute("for", "issueDate" + index);
    issueDateLabel.textContent = "Issue Date";

    const issueDateInput = document.createElement("input");
    issueDateInput.type = "date";
    issueDateInput.className = "w-full rounded border border-stroke bg-gray px-3 py-2 font-medium text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary";
    issueDateInput.name = "issueDate" + index;
    issueDateInput.id = "issueDate" + index;
    issueDateInput.value = certif.IssueDate || '';

    issueDateDiv.appendChild(issueDateLabel);
    issueDateDiv.appendChild(issueDateInput);
    inputContainer.appendChild(issueDateDiv);

    certEntryDiv.appendChild(inputContainer);

    // Remove button
    const removeIconContainer = document.createElement("div");
    removeIconContainer.className = "flex-shrink-0 ml-4";
    removeIconContainer.style.alignSelf = "flex-start";
    removeIconContainer.style.marginTop = "-10px";

    const removeIcon = document.createElement("span");
    removeIcon.className = "cursor-pointer text-red-500";
    removeIcon.innerHTML = "&times;";
    removeIcon.onclick = function() {
      certifications.splice(index, 1);
      renderCertifications();
    };

    removeIconContainer.appendChild(removeIcon);
    certEntryDiv.appendChild(removeIconContainer);
    certificationsContainerChild.appendChild(certEntryDiv);
  });

  container.appendChild(certificationsContainerChild);

  // Add Certification button
  const addButton = document.createElement("button");
  addButton.className = "mt-3 px-4 py-2 bg-primary text-white rounded";
  addButton.textContent = "Add Certification";
  addButton.type = "button";
  addButton.onclick = displayCertificationForm;
  container.appendChild(addButton);
}

// Function to display certification form
function displayCertificationForm() {
  const container = document.getElementById("containerCertifications");
  const addButton = container.querySelector("button");
  if (addButton) {
    addButton.style.display = "none";
  }

  const formContainer = document.createElement("div");
  formContainer.className = "mt-4 p-4 border rounded shadow";

  // Create form fields
  const fields = [
    { name: "certificationName", label: "Certification Name", type: "text" },
    { name: "issuingOrganization", label: "Issuing Organization", type: "text" },
    { name: "issueDate", label: "Issue Date", type: "date" }
  ];

  fields.forEach(field => {
    const input = document.createElement("input");
    input.type = field.type;
    input.placeholder = field.label;
    input.className = "block w-full mt-2 p-2 border rounded";
    formContainer.appendChild(input);
  });

  // Save button
  const saveButton = document.createElement("button");
  saveButton.className = "mt-3 px-4 py-2 bg-success text-white rounded";
  saveButton.textContent = "Save Certification";
  saveButton.onclick = function() {
    const [nameInput, orgInput, dateInput] = formContainer.querySelectorAll("input");
    
    const newCertif = {
      CertificationName: nameInput.value,
      IssuingOrganization: orgInput.value,
      IssueDate: dateInput.value
    };

    certifications.push(newCertif);
    formContainer.remove();
    if (addButton) {
      addButton.style.display = "block";
    }
    renderCertifications();
  };

  // Cancel button
  const cancelButton = document.createElement("button");
  cancelButton.className = "mt-3 px-4 py-2 bg-red-500 text-white rounded ml-2";
  cancelButton.textContent = "Cancel";
  cancelButton.onclick = function() {
    formContainer.remove();
    if (addButton) {
      addButton.style.display = "block";
    }
  };

  formContainer.appendChild(saveButton);
  formContainer.appendChild(cancelButton);
  container.appendChild(formContainer);
}

function addLanguage() {
const inputField = document.getElementById(`newLanguage`);
const newLanguage = inputField.value.trim();

if (newLanguage) {
  languages.push(newLanguage);

  inputField.value = ""; // Clear the input field
  displayLanguages(languages);
}
}
let fileContent = [];
document.addEventListener("DOMContentLoaded", function () {
const form = document.getElementById("profileForm");
const cancelButton = document.getElementById("cancelButton");
let initialData = {}; // Object to store initial form data

// Function to load initial form data from JSON or server
function loadInitialData() {
  // Fetch data from JSON file or server and populate form
  // For demonstration purposes, we'll assume data is already available
  //initialData = candidateData;
  //console.log('initialDt===', initialData)
  // Load other form fields similarly...
}

// Function to revert form changes
function revertChanges() {
  //form.fullName.value = initialData.candidateData.CandidateInfo.FullName;
  // form.emailAddress.value = initialData.candidateData.CandidateInfo.Emails[0]
  // form.phoneNumber.value = initialData.candidateData.CandidateInfo.PhoneNumber.FormattedNumber;
  // form.location.value = initialData.candidateData.CandidateInfo.PhoneNumber.Location;
  // form.country.value = initialData.candidateData.CandidateInfo.Country;
  // form.nationality.value = initialData.candidateData.CandidateInfo.Nationality;
  // form.gender.value = initialData.candidateData.CandidateInfo.Gender;
  // form.dateOfBirth.value = initialData.candidateData.CandidateInfo.DateOfBirth;
  // form.maritalStatus.value = initialData.candidateData.CandidateInfo.MaritalStatus;
  // skills.hard = initialData.candidateData.CandidateInfo["Hard Skills"];
  // skills.soft = initialData.candidateData.CandidateInfo["Soft Skills"];
  // languages = initialData.candidateData.CandidateInfo.Languages;
  // certifications = initialData.candidateData.CandidateInfo.Certifications;
  // renderCertifications();
  // displaySkills(skills);
  // displayLanguages(languages);
}

// Handle form submission to save changes
form.addEventListener("submit", function (e) {
  e.preventDefault();
  const formData = new FormData(form);
  // Process formData (e.g., send to server, save to JSON)
  console.log(
    "Form data saved:",
    Object.fromEntries(formData.entries())
  );
  const formEntries = Object.fromEntries(formData.entries());

  const fullName = formEntries.fullName;
  const jobTitle = formEntries.jobTitle;
  const jobTitles = candidateData.candidateData.CandidateInfo.Jobs;
  const linkedIn = formEntries.linkedIn;
  const gitHub = formEntries.gitHub;
  const mobility = formEntries.mobility;
  const availability = formEntries.availability;
  const status = formEntries.status;
  const recruiter = formEntries.recruiter;
  const email = formEntries.emailAddress;
  const phoneNumber = formEntries.phoneNumber;
  const location = formEntries.location;
  const country = formEntries.country;
  const nationality = formEntries.nationality.split(/[,/;|:-]+/);
  const dateOfBirth = formEntries.dateOfBirth;
  const gender = formEntries.gender;
  const maritalStatus = formEntries.maritalStatus;
  const languages = candidateData.candidateData.CandidateInfo.Languages;
  const hardSkills = skills.hard;
  const softSkills = skills.soft;
  const certifications =
    candidateData.candidateData.CandidateInfo.Certifications;
  const degress = candidateData.candidateData.CandidateInfo.Degress;
  const experience =
    candidateData.candidateData.CandidateInfo.Experience;
  const candidateDataUpdated = {};

  function normalizeValue(value) {
    return value === null ? "" : value;
  }

  if (
    normalizeValue(candidateData.availability) !==
    normalizeValue(availability)
  ) {
    candidateDataUpdated.availability = availability;
    console.log("different avail");
  }
  if (
    normalizeValue(candidateData.mobility) !== normalizeValue(mobility)
  ) {
    candidateDataUpdated.mobility = mobility;
  }
  if (
    normalizeValue(candidateData.recruiter) !==
    normalizeValue(recruiter)
  ) {
    candidateDataUpdated.recruiter = recruiter;
  }

    candidateDataUpdated.status = status;
console.log("cddddd",candidateDataUpdated);

  candidateData.candidateData.CandidateInfo.FullName = fullName;
  candidateData.candidateData.CandidateInfo["Titled Post"] = jobTitle;
  candidateData.candidateData.CandidateInfo.Linkedin = linkedIn;
  candidateData.candidateData.CandidateInfo.Github = gitHub;
  candidateData.candidateData.CandidateInfo.Email = email;
  candidateData.candidateData.CandidateInfo.PhoneNumber.FormattedNumber =
    phoneNumber;
  candidateData.candidateData.CandidateInfo.PhoneNumber.Location =
    location;
  candidateData.candidateData.CandidateInfo.Country = country;
  candidateData.candidateData.CandidateInfo.Nationality = nationality;
  candidateData.candidateData.CandidateInfo.DateOfBirth = dateOfBirth;
  candidateData.candidateData.CandidateInfo.Gender = gender;
  candidateData.candidateData.CandidateInfo.MaritalStatus =
    maritalStatus;
  candidateData.candidateData.CandidateInfo["Hard Skills"] = hardSkills;
  candidateData.candidateData.CandidateInfo["Soft Skills"] = softSkills;

  Object.keys(formEntries).forEach((key) => {
    // Check if the key starts with 'certificationName'
    if (key.startsWith("certificationName")) {
      // Extract the index number from the key (e.g., 'certificationName0' -> '0')
      const index = key.match(/\d+/)[0];

      // Ensure the Certifications array has an object for this index
      candidateData.candidateData.CandidateInfo.Certifications[index] =
        candidateData.candidateData.CandidateInfo.Certifications[
        index
        ] || {};

      // Add the CertificationName field
      candidateData.candidateData.CandidateInfo.Certifications[
        index
      ].CertificationName = formEntries[key];
    }

    // Check for other fields related to certifications (like IssuingOrganization or IssueDate)
    if (key.startsWith("issuingOrganization")) {
      const index = key.match(/\d+/)[0];
      candidateData.candidateData.CandidateInfo.Certifications[index] =
        candidateData.candidateData.CandidateInfo.Certifications[
        index
        ] || {};
      candidateData.candidateData.CandidateInfo.Certifications[
        index
      ].IssuingOrganization = formEntries[key];
    }

    if (key.startsWith("issueDate")) {
      const index = key.match(/\d+/)[0];
      candidateData.candidateData.CandidateInfo.Certifications[index] =
        candidateData.candidateData.CandidateInfo.Certifications[
        index
        ] || {};
      candidateData.candidateData.CandidateInfo.Certifications[
        index
      ].IssueDate = formEntries[key];
    }
    if (key.startsWith("degreeName")) {
      const index = key.match(/\d+/)[0];
      candidateData.candidateData.CandidateInfo.Degrees[index] =
        candidateData.candidateData.CandidateInfo.Degrees[index] || {};
      candidateData.candidateData.CandidateInfo.Degrees[
        index
      ].DegreeName = formEntries[key];
    }
    if (key.startsWith("normalizeDegree")) {
      const index = key.match(/\d+/)[0];
      candidateData.candidateData.CandidateInfo.Degrees[index] =
        candidateData.candidateData.CandidateInfo.Degrees[index] || {};
      candidateData.candidateData.CandidateInfo.Degrees[
        index
      ].NormalizeDegree = formEntries[key];
    }
    if (key.startsWith("specialization")) {
      const index = key.match(/\d+/)[0];
      candidateData.candidateData.CandidateInfo.Degrees[index] =
        candidateData.candidateData.CandidateInfo.Degrees[index] || {};
      candidateData.candidateData.CandidateInfo.Degrees[
        index
      ].Specialization = formEntries[key];
    }
    if (key.startsWith("startDate")) {
      const index = key.match(/\d+/)[0];
      candidateData.candidateData.CandidateInfo.Degrees[index] =
        candidateData.candidateData.CandidateInfo.Degrees[index] || {};
      candidateData.candidateData.CandidateInfo.Degrees[
        index
      ].StartDate = formEntries[key];
    }
    if (key.startsWith("endDate")) {
      const index = key.match(/\d+/)[0];
      candidateData.candidateData.CandidateInfo.Degrees[index] =
        candidateData.candidateData.CandidateInfo.Degrees[index] || {};
      candidateData.candidateData.CandidateInfo.Degrees[index].EndDate =
        formEntries[key];
    }
    if (key.startsWith("countryOrInstitute")) {
      const index = key.match(/\d+/)[0];
      candidateData.candidateData.CandidateInfo.Degrees[index] =
        candidateData.candidateData.CandidateInfo.Degrees[index] || {};
      candidateData.candidateData.CandidateInfo.Degrees[
        index
      ].CountryOrInstitute = formEntries[key];
    }
    if (key.startsWith("experienceTitle")) {
      const index = key.match(/\d+/)[0];
      candidateData.candidateData.CandidateInfo.Experience[index] =
        candidateData.candidateData.CandidateInfo.Experience[index] ||
        {};
      candidateData.candidateData.CandidateInfo.Experience[
        index
      ].Title = formEntries[key];
    }
    if (key.startsWith("experiencePeriode")) {
      const index = key.match(/\d+/)[0];
      candidateData.candidateData.CandidateInfo.Experience[index] =
        candidateData.candidateData.CandidateInfo.Experience[index] ||
        {};
      candidateData.candidateData.CandidateInfo.Experience[
        index
      ].Periode = formEntries[key];
    }
    if (key.startsWith("experienceDescription")) {
      const index = key.match(/\d+/)[0];
      candidateData.candidateData.CandidateInfo.Experience[index] =
        candidateData.candidateData.CandidateInfo.Experience[index] ||
        {};
      candidateData.candidateData.CandidateInfo.Experience[
        index
      ].Description = formEntries[key];
    }
  });
  console.log(
    "candidateInfooooo===",
    candidateData.candidateData.CandidateInfo
  );

  const fileInput = document.getElementById("file-upload");

  candidateDataUpdated.candidateData = candidateData.candidateData;
  if (fileInput.files.length > 0) {
    console.log("file");
    console.log("candidateDataUpdated===", candidateDataUpdated);
    fileContent[1] = candidateDataUpdated;
    apiClient
      .patch(
        `/api/add-cv/${candidateData.id_candidate}/${idRecruiter}/`,
        {
          fileContents: fileContent,
        },
        
      )
      .then((response) => {
        console.log("Data updated successfully:", response.data);
        get_candidate(candidateData.id_candidate);
      })
      .catch((error) => {
        console.error("Error updating data:", error);
      });
  } else {
    console.log("no file");
    console.log("candidateData:::", candidateData);

    console.log("yes they are diiferent");

    console.log("candidateDataUpdated===", candidateDataUpdated);
    apiClient
      .patch(
        `/api/update-cv/${candidateData.id_candidate}/`,
        candidateDataUpdated,
        {
          withCredentials: true,
          headers: {
              'X-CSRFToken': Cookies.get('csrftoken'),  // Manually extract the CSRF token
          },
      }
      )
      .then((response) => {
        console.log("Data updated successfully:", response.data);
        get_candidate(candidateData.id_candidate);
        candidateData.candidateData.CandidateInfo.Links=linksArray;

      })
      .catch((error) => {
        console.error("Error updating data:", error);
      });
  }


});

// Handle cancel button click to revert changes
cancelButton.addEventListener("click", function () {
  revertChanges();
  console.log("Form changes reverted to initial state");
});

// Initialize form data on page load
loadInitialData();
});

function arraysEqual(arr1, arr2) {
if (arr1.length !== arr2.length) return false; // Different lengths, not equal

for (let i = 0; i < arr1.length; i++) {
  if (arr1[i] !== arr2[i]) return false; // Found a difference
}

return true; // Arrays are equal
}

function saveChanges() {
// Your JavaScript logic to save changes to the JSON file
console.log("changes saved");
}
const fileInput = document.getElementById("file-upload");
const fileNameDisplay = document.getElementById("file-name");

// Use jQuery to handle the file input change event
$(document).ready(function () {
$("#file-upload").change(function () {
  // Assuming candidateData is defined somewhere else in your script

  if (this.files.length > 0) {
    console.log("hello");

    const file = this.files[0]; // Get the first file
    const fileName = file.name;

    fileNameDisplay.textContent = fileName; // Update file name display

    const reader = new FileReader();
    reader.onload = function (e) {
      // binary data
      fileContent[0] = e.target.result;
      sendFileToServer(fileContent[0]); // Correct function name
      console.log("fileContent inside onload:", fileContent);
    };
    reader.onerror = function (e) {
      // error occurred
      console.log("Error : " + e.type);
    };
    reader.readAsBinaryString(file);

    const removeIconContainer = document.createElement("div");
    removeIconContainer.className = "flex-shrink-0 ml-4"; // Adjust the margin to move the icon away
    removeIconContainer.style.alignSelf = "flex-start"; // Align icon to the top
    removeIconContainer.style.marginTop = "-10px"; // Move the icon higher if needed

    const removeIcon = document.createElement("span");
    removeIcon.className = "cursor-pointer text-red-500";
    removeIcon.innerHTML = "&times;"; // Using HTML entity for '×' (close icon)
    removeIcon.onclick = function () {
      fileInput.value = ""; // Assuming there's only one file input
      fileNameDisplay.textContent = "No file chosen"; // Remove the file display element
    };
    removeIconContainer.appendChild(removeIcon);
    fileNameDisplay.appendChild(removeIconContainer);
  } else {
    fileNameDisplay.textContent = "No file chosen";
  }
});
});

// Function to send file content to the server
function sendFileToServer(file) {
// Convert the string to Base64
const fileContentBase64 = window.btoa(file);
fileContent[0] = fileContentBase64;
const mobility = candidateData.mobility;
const availability = candidateData.availability;
const recruiter = candidateData.recruiter;
const status = candidateData.status;
const id_candidate = candidateData.id_candidate;
// Send the Base64 string to the server using apiClient
apiClient
  .post(`/api/new-cv/${idRecruiter}/`, {
    fileContents: fileContentBase64,
  })
  .then((response) => {
    hideLoading();  // Hide loading spinner
    // Assuming candidateData is updated and used elsewhere
    candidateData = response.data;
    console.log("Data updated successfully:", response.data);
    // Update candidateData with additional info if needed

    candidateData.mobility = mobility;
    candidateData.availability = availability;
    candidateData.recruiter = recruiter;
    candidateData.status = status;
    candidateData.id_candidate = id_candidate;
    populateFormFields(candidateData);
    showSuccessPopup();  // Show success popup after processing
  })
  .catch((error) => {
    hideLoading();  // Hide loading spinner
    console.error("Error:", error);
  });
showLoading();
}

// Update the get_candidate function
// Modified get_candidate function to handle the response better
function get_candidate(id) {
  showLoading();
  
  return apiClient.get(`/api/get-candidate/${id}/`, {
    withCredentials: true,
    headers: {
          'X-CSRFToken': Cookies.get('csrftoken')
}
  })
  .then(function(response) {
    const responseData = response.data;
    localStorage.setItem('responseData', JSON.stringify(responseData));
      console.log("New candidate data loaded:", responseData);

      // Update global candidate data
      candidateData = responseData.candidateData;
      
      // Reload the page to show updates
    window.location.href = "profile.html";
  })
  .catch(function(error) {
    console.error("Error fetching candidate data:", error);
      showErrorMessage("Failed to fetch updated candidate data");
      hideLoading();
  });
}

// fileInput.addEventListener('change', function () {
//     // Extract the FullName from candidateData
//     const mobility = candidateData.mobility;
//     const availability = candidateData.mobility;
//     const recruiter = candidateData.recruiter;
//     const id_candidate = candidateData.id_candidate;

//     if (fileInput.files.length > 0) {
//         fileName.textContent = fileInput.files[0].name;
//         apiClient.post(`/api/new-cv/`)
//             .then(response => {
//                 candidateData = response.data;
//                 candidateData.mobility = mobility;
//                 candidateData.availability = availability;
//                 candidateData.recruiter = recruiter;
//                 candidateData.id_candidate = id_candidate;
//                 console.log('Data updated successfully:', response.data);
//                 populateFormFields(candidateData);
//             })
//             .catch(error => {
//                 console.error('Error updating data:', error);
//             });
//     } else {
//         fileName.textContent = 'No file chosen';
//     }
// });

function autoResizeTextarea(textarea) {
textarea.style.height = "auto"; // Reset height
const lineHeight = parseFloat(
  window.getComputedStyle(textarea).lineHeight
); // Get line height
const maxLines = 20; // Maximum number of lines
var textLines = Math.min(textarea.scrollHeight / lineHeight, maxLines);
const defaultLineHeight = 16; // Set a default line height, e.g., 16px

//const textLines = textarea.value.split('\n').length; // Calculate the number of text lines

// Set height based on content, up to maxLines
const height = textarea.scrollHeight;
textarea.style.height = `${textLines * lineHeight}px`;

if (
  textarea.scrollHeight >
  10 * parseFloat(getComputedStyle(textarea).lineHeight)
) {
  textarea.classList.add("scrollable");
} else {
  textarea.classList.remove("scrollable");
}
}


// Loading indicator functions
// Helper function to show loading state
function showLoading() {
  const loader = document.createElement('div');
  loader.id = 'updateLoader';
  loader.className = 'fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50';
  loader.innerHTML = `
      <div class="bg-white p-4 rounded-lg shadow-lg">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <div class="mt-2 text-white">Updating...</div>
      </div>
  `;
  document.body.appendChild(loader);
}


function hideLoading() {
  const loader = document.getElementById('updateLoader');
  if (loader) {
      loader.remove();
}
}
function showSuccessPopup() {
document.getElementById('successPopup').classList.remove('hidden');
}

function hideSuccessPopup() {
document.getElementById('successPopup').classList.add('hidden');
}

document.getElementById('closePopup').addEventListener('click', hideSuccessPopup);