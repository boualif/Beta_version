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
// Modified form submission function
function submitFormData(formData, candidateId) {
  const data = {
    candidateData: {
      CandidateInfo: {
        FullName: formData.get('fullName'),
        Email: formData.get('emailAddress'),
        "Job Title": formData.get('jobTitle'),
        // Add other basic fields here
      }
    }
  };

  // Add restricted fields only if authenticated
  if (hasFullAccess()) {
    data.status = formData.get('status');
    data.mobility = formData.get('mobility');
    data.availability = formData.get('availability');
  }

  return apiClient.patch(
    `/api/update-cv/${candidateId}/`,
    data
  ).then(response => {
    console.log("Update successful:", response.data);
    if (response.data.limitedAccess) {
      console.log("Limited access mode - some features restricted");
    }
    return response.data;
  }).catch(error => {
    console.error("Update failed:", error);
    throw error;
  });
}
window.onload = () => {
  // Load profile data
  const profileData = localStorage.getItem("profileData");
  console.log("Loading profile data:", profileData);

  if (profileData) {
    try {
      const profileDataObject = JSON.parse(profileData);
      candidateData = profileDataObject.candidateData;
      if (candidateData) {
        populateFormFields(candidateData);
      }
    } catch (e) {
      console.error("Error loading profile data:", e);
    }
  }

  // Add form submit handler
  const form = document.getElementById("profileForm");
  if (form) {
    form.addEventListener("submit", function(e) {
      e.preventDefault();
      const formData = new FormData(this);
      submitFormData(formData, candidateData.id_candidate)
        .then(() => {
          // Reload the page or show success message
          window.location.reload();
        })
        .catch(error => {
          alert("Failed to update profile. Please try again.");
        });
    });
  }
};

// Update form submission to handle both authenticated and unauthenticated users
document.getElementById("profileForm").addEventListener("submit", function(e) {
  e.preventDefault();
  const formData = new FormData(this);
  const updatedData = prepareFormData(formData);
  
  apiClient.patch(
    `/api/update-cv/${candidateData.id_candidate}/`,
    updatedData
  )
  .then(response => {
    console.log("Update successful:", response.data);
    localStorage.setItem('responseData', JSON.stringify(response.data));
    window.location.reload();
  })
  .catch(error => {
    console.error("Update failed:", error);
    alert("Failed to update. Please try again.");
  });
});

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
function populateFormFields(candidateData) {
if (candidateData) {
  document.getElementById("fullName").value =
    candidateData.candidateData.CandidateInfo.FullName;
  document.getElementById("jobTitle").value =
    candidateData.candidateData.CandidateInfo["Titled Post"];
  document.getElementById("phoneNumber").value =
    candidateData.candidateData.CandidateInfo.PhoneNumber.FormattedNumber;
  document.getElementById("location").value =
    candidateData.candidateData.CandidateInfo.PhoneNumber.Location;
  document.getElementById("emailAddress").value =
    candidateData.candidateData.CandidateInfo.Email;
  const recruiterId = candidateData.recruiterId;
  if (recruiterId != null) {
    document.getElementById("recruiter").value = recruiterId;
  }
  const availability = candidateData.availability;
  if (availability != null) {
    document.getElementById("availability").value = availability;
  }
  const mobility = candidateData.mobility;
  if (mobility != null) {
    document.getElementById("mobility").value = mobility;
  }
  document.getElementById("linkedIn").value =
    candidateData.candidateData.CandidateInfo.Linkedin;
  document.getElementById("gitHub").value =
    candidateData.candidateData.CandidateInfo.Github;
  document.getElementById("links").value =
    candidateData.candidateData.CandidateInfo.Links.join(', ');
  document.getElementById("country").value =
    candidateData.candidateData.CandidateInfo.Country;
  document.getElementById("nationality").value =
    candidateData.candidateData.CandidateInfo.Nationality;
  document.getElementById("dateOfBirth").value =
    candidateData.candidateData.CandidateInfo.DateOfBirth;
  document.getElementById("gender").value =
    candidateData.candidateData.CandidateInfo.Gender;
  document.getElementById("maritalStatus").value =
    candidateData.candidateData.CandidateInfo.MaritalStatus;
  document.getElementById("status").value =
    candidateData.status;

  skills = {
    soft: candidateData.candidateData.CandidateInfo["Soft Skills"],
    hard: candidateData.candidateData.CandidateInfo["Hard Skills"],
  };
  languages = candidateData.candidateData.CandidateInfo.Languages;

  displaySkills(skills);
  displayLanguages(languages);

  certifications =
    candidateData.candidateData.CandidateInfo.Certifications;
  const container = document.getElementById("containerCertifications");
  const certificationsContainerChild = document.createElement("div");
  const certificationFormContainerChild = document.createElement("div");
  container.innerHTML = "";

  // Function to render certifications
  // Function to render the certifications
  function renderCertifications() {
    certificationsContainerChild.innerHTML = ""; // Clear the container first

    certifications.forEach((certif, index) => {
      // Create a wrapper div for each certification entry
      const certEntryDiv = document.createElement("div");
      certEntryDiv.className = "mb-3 flex items-center justify-between";

      // Create a sub-container for inputs
      const inputContainer = document.createElement("div");
      inputContainer.className = "flex-1";

      // Create and append Certification Name field
      const certNameDiv = document.createElement("div");
      certNameDiv.className = "mb-3 flex items-center";

      const certNameLabel = document.createElement("label");
      certNameLabel.className =
        "block w-1/3 text-sm font-medium text-black dark:text-white mr-2";
      certNameLabel.setAttribute("for", "certificationName" + index);
      certNameLabel.textContent = "Certification Name";
      certNameDiv.appendChild(certNameLabel);

      // Create and configure the textarea element
      const certNameInput = document.createElement("input");
      certNameInput.name = "certificationName" + index;
      certNameInput.id = "certificationName" + index;
      certNameInput.value = certif.CertificationName;

      // Apply the className before calculating the height
      certNameInput.className =
        "w-full rounded border border-stroke bg-gray px-3 py-2 font-medium text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary";

      // Append the textarea to its container div
      certNameDiv.appendChild(certNameInput);
      inputContainer.appendChild(certNameDiv);

      // Resize the textarea after it has been rendered and styled
      //   requestAnimationFrame(() => {
      //     autoResizeTextarea(certNameInput); // Ensure the textarea is resized after rendering
      //   });

      //   // Add an input event listener to resize the textarea dynamically as the content changes
      //   certNameInput.addEventListener("input", function () {
      //     autoResizeTextarea(this);
      //   });

      // Create and append Issuing Organization field
      const issuingOrgDiv = document.createElement("div");
      issuingOrgDiv.className = "mb-3 flex items-center";

      const issuingOrgLabel = document.createElement("label");
      issuingOrgLabel.className =
        "block w-1/3 text-sm font-medium text-black dark:text-white mr-2";
      issuingOrgLabel.setAttribute(
        "for",
        "issuingOrganization" + index
      );
      issuingOrgLabel.textContent = "Issuing Organization";
      issuingOrgDiv.appendChild(issuingOrgLabel);

      const issuingOrgInput = document.createElement("input");
      issuingOrgInput.type = "text";
      issuingOrgInput.className =
        "w-full rounded border border-stroke bg-gray px-3 py-2 font-medium text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary";
      issuingOrgInput.name = "issuingOrganization" + index;
      issuingOrgInput.id = "issuingOrganization" + index;
      issuingOrgInput.value = certif.IssuingOrganization;
      issuingOrgDiv.appendChild(issuingOrgInput);

      inputContainer.appendChild(issuingOrgDiv);

      // Create and append Issue Date field
      const issueDateDiv = document.createElement("div");
      issueDateDiv.className = "mb-3 flex items-center";

      const issueDateLabel = document.createElement("label");
      issueDateLabel.className =
        "block w-1/3 text-sm font-medium text-black dark:text-white mr-2";
      issueDateLabel.setAttribute("for", "issueDate" + index);
      issueDateLabel.textContent = "Issue Date";
      issueDateDiv.appendChild(issueDateLabel);

      const issueDateInput = document.createElement("input");
      issueDateInput.type = "text";
      issueDateInput.className =
        "w-full rounded border border-stroke bg-gray px-3 py-2 font-medium text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary";
      issueDateInput.name = "issueDate" + index;
      issueDateInput.id = "issueDate" + index;
      issueDateInput.value = certif.IssueDate;
      issueDateDiv.appendChild(issueDateInput);

      inputContainer.appendChild(issueDateDiv);

      certEntryDiv.appendChild(inputContainer);

      // Create remove icon and place it far from the input fields
      const removeIconContainer = document.createElement("div");
      removeIconContainer.className = "flex-shrink-0 ml-4"; // Adjust the margin to move the icon away
      removeIconContainer.style.alignSelf = "flex-start"; // Align icon to the top
      removeIconContainer.style.marginTop = "-10px"; // Move the icon higher if needed

      const removeIcon = document.createElement("span");
      removeIcon.className = "cursor-pointer text-red-500";
      removeIcon.innerHTML = "&times;"; // Using HTML entity for '×' (close icon)
      removeIcon.onclick = function () {
        certifications.splice(index, 1); // Remove the certification from JSON
        renderCertifications(); // Re-render certifications
      };
      removeIconContainer.appendChild(removeIcon);

      certEntryDiv.appendChild(removeIconContainer);

      certificationsContainerChild.appendChild(certEntryDiv);
      container.prepend(certificationsContainerChild);
    });
  }

  // Render certifications on load
  renderCertifications();

  // Add button to display a form for adding a new certification
  const addButton = document.createElement("button");
  addButton.className = "mt-3 px-4 py-2 bg-primary text-white rounded";
  addButton.textContent = "Add Certification";
  addButton.type = "button";
  addButton.onclick = function () {
    displayCertificationForm(); // Call the function to display the form
  };

  container.appendChild(addButton);

  // Function to display a form for adding a new certification
  function displayCertificationForm() {
    addButton.style.display = "none";
    // Create a form container
    const formContainer = document.createElement("div");
    formContainer.className = "mt-4 p-4 border rounded shadow";

    // Create input fields for the new certification
    const certNameInput = document.createElement("input");
    certNameInput.type = "text";
    certNameInput.placeholder = "Certification Name";
    certNameInput.className = "block w-full mt-2 p-2 border rounded";
    formContainer.appendChild(certNameInput);

    const issuingOrgInput = document.createElement("input");
    issuingOrgInput.type = "text";
    issuingOrgInput.placeholder = "Issuing Organization";
    issuingOrgInput.className = "block w-full mt-2 p-2 border rounded";
    formContainer.appendChild(issuingOrgInput);

    const issueDateInput = document.createElement("input");
    issueDateInput.type = "date";
    issueDateInput.className = "block w-full mt-2 p-2 border rounded";
    formContainer.appendChild(issueDateInput);

    // Create save button
    const saveButton = document.createElement("button");
    saveButton.className =
      "mt-3 px-4 py-2 bg-success text-white rounded";
    saveButton.textContent = "Save Certification";
    saveButton.onclick = function () {
      const newCertif = {
        CertificationName: certNameInput.value,
        IssuingOrganization: issuingOrgInput.value,
        IssueDate: issueDateInput.value,
      };

      // Push the new certification to the array
      certifications.push(newCertif);

      // Remove form after saving
      formContainer.remove();
      addButton.style.display = "block";
      // Re-render the certifications
      renderCertifications();
    };

    formContainer.appendChild(saveButton);
    // Create cancel button
    const cancelButton = document.createElement("button");
    cancelButton.className =
      "mt-3 px-4 py-2 bg-red-500 text-white rounded ml-2";
    cancelButton.textContent = "Cancel";
    cancelButton.onclick = function () {
      // Remove the form without adding a certification
      formContainer.remove();

      // Show the "Add Certification" button again
      addButton.style.display = "block";
    };
    formContainer.appendChild(cancelButton);

    // Append the form container to the DOM
    certificationFormContainerChild.appendChild(formContainer);
    container.appendChild(certificationFormContainerChild);
  }

  const degrees = candidateData.candidateData.CandidateInfo.Degrees;
  const degreesContainer =
    document.getElementById("containerEducation");
  const degreesContainerChild = document.createElement("div");
  const degreeFormContainerChild = document.createElement("div");
  degreesContainer.innerHTML = "";
  // Function to render certifications
  function renderDegrees() {
    degreesContainerChild.innerHTML = ""; // Clear the container first

    degrees.forEach((degree, index) => {
      // Create a wrapper div for each certification entry
      const degreeEntryDiv = document.createElement("div");
      degreeEntryDiv.className =
        "mb-3 flex items-center justify-between";

      // Create a sub-container for inputs
      const inputContainer = document.createElement("div");
      inputContainer.className = "flex-1";

      // Create and append Certification Name field

      const degreeNameDiv = document.createElement("div");
      degreeNameDiv.className = "mb-3 flex items-center";

      const degreeNameLabel = document.createElement("label");
      degreeNameLabel.className =
        "block w-1/3 text-sm font-medium text-black dark:text-white mr-2";
      degreeNameLabel.setAttribute("for", "degreeName" + index);
      degreeNameLabel.textContent = "Degree Name";
      degreeNameDiv.appendChild(degreeNameLabel);

      const degreeNameInput = document.createElement("input");
      degreeNameInput.type = "text";
      degreeNameInput.className =
        "w-full rounded border border-stroke bg-gray px-3 py-2 font-medium text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary";
      degreeNameInput.name = "degreeName" + index;
      degreeNameInput.id = "degreeName" + index;
      degreeNameInput.value = degree.DegreeName;
      degreeNameDiv.appendChild(degreeNameInput);

      inputContainer.appendChild(degreeNameDiv);

      // Create and append Issuing Organization field
      const normalizeDegreeDiv = document.createElement("div");
      normalizeDegreeDiv.className = "mb-3 flex items-center";

      const normalizeDegreeLabel = document.createElement("label");
      normalizeDegreeLabel.className =
        "block w-1/3 text-sm font-medium text-black dark:text-white mr-2";
      normalizeDegreeLabel.setAttribute(
        "for",
        "normalizeDegree" + index
      );
      normalizeDegreeLabel.textContent = "Normalize Degree";
      normalizeDegreeDiv.appendChild(normalizeDegreeLabel);

      const normalizeDegreeInput = document.createElement("input");
      normalizeDegreeInput.type = "text";
      normalizeDegreeInput.className =
        "w-full rounded border border-stroke bg-gray px-3 py-2 font-medium text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary";
      normalizeDegreeInput.name = "normalizeDegree" + index;
      normalizeDegreeInput.id = "normalizeDegree" + index;
      normalizeDegreeInput.value = degree.NormalizeDegree;
      normalizeDegreeDiv.appendChild(normalizeDegreeInput);

      inputContainer.appendChild(normalizeDegreeDiv);

      // Create and append Issue Date field
      const specializationDiv = document.createElement("div");
      specializationDiv.className = "mb-3 flex items-center";
      const specializationLabel = document.createElement("label");
      specializationLabel.className =
        "block w-1/3 text-sm font-medium text-black dark:text-white mr-2";
      specializationLabel.setAttribute("for", "specialization" + index);
      specializationLabel.textContent = "Specialization";
      specializationDiv.appendChild(specializationLabel);

      const specializationInput = document.createElement("input");
      specializationInput.type = "text";
      specializationInput.className =
        "w-full rounded border border-stroke bg-gray px-3 py-2 font-medium text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary";
      specializationInput.name = "specialization" + index;
      specializationInput.id = "specialization" + index;
      specializationInput.value = degree.Specialization;
      specializationDiv.appendChild(specializationInput);

      inputContainer.appendChild(specializationDiv);

      const countryOrInstituteDiv = document.createElement("div");
      countryOrInstituteDiv.className = "mb-3 flex items-center";
      const countryOrInstituteLabel = document.createElement("label");
      countryOrInstituteLabel.className =
        "block w-1/3 text-sm font-medium text-black dark:text-white mr-2";
      countryOrInstituteLabel.setAttribute(
        "for",
        "countryOrInstitute" + index
      );
      countryOrInstituteLabel.textContent = "Country Or Institute";
      countryOrInstituteDiv.appendChild(countryOrInstituteLabel);

      const countryOrInstituteInput = document.createElement("input");
      countryOrInstituteInput.type = "text";
      countryOrInstituteInput.className =
        "w-full rounded border border-stroke bg-gray px-3 py-2 font-medium text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary";
      countryOrInstituteInput.name = "countryOrInstitute" + index;
      countryOrInstituteInput.id = "countryOrInstitute" + index;
      countryOrInstituteInput.value = degree.CountryOrInstitute;
      countryOrInstituteDiv.appendChild(countryOrInstituteInput);

      inputContainer.appendChild(countryOrInstituteDiv);

      const startDateDiv = document.createElement("div");
      startDateDiv.className = "mb-3 flex items-center";

      const startDateLabel = document.createElement("label");
      startDateLabel.className =
        "block w-1/3 text-sm font-medium text-black dark:text-white mr-2";
      startDateLabel.setAttribute("for", "startDate" + index);
      startDateLabel.textContent = "Start Date";
      startDateDiv.appendChild(startDateLabel);

      const startDateInput = document.createElement("input");
    startDateInput.type = "date"; // Change to date type
    startDateInput.className = "w-full rounded border border-stroke bg-gray px-3 py-2 font-medium text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary";
    startDateInput.name = "startDate" + index;
    startDateInput.id = "startDate" + index;
    startDateInput.value = degree.StartDate; // Ensure the date is in YYYY-MM-DD format
    inputContainer.appendChild(startDateInput);

      const endDateDiv = document.createElement("div");
      endDateDiv.className = "mb-3 flex items-center";

      const endDateLabel = document.createElement("label");
      endDateLabel.className =
        "block w-1/3 text-sm font-medium text-black dark:text-white mr-2";
      endDateLabel.setAttribute("for", "endDate" + index);
      endDateLabel.textContent = "End Date";
      endDateDiv.appendChild(endDateLabel);

      const endDateInput = document.createElement("input");
      endDateInput.type = "text";
      endDateInput.className =
        "w-full rounded border border-stroke bg-gray px-3 py-2 font-medium text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary";
      endDateInput.name = "endDate" + index;
      endDateInput.id = "endDate" + index;
      endDateInput.value = degree.EndDate;
      endDateDiv.appendChild(endDateInput);
      inputContainer.appendChild(endDateDiv);

      degreeEntryDiv.appendChild(inputContainer);

      // Create remove icon and place it higher and far from the input fields
      const removeIconContainer = document.createElement("div");
      removeIconContainer.className = "flex-shrink-0 ml-4"; // Margin to move the icon horizontally away
      removeIconContainer.style.alignSelf = "flex-start"; // Align icon to the top
      removeIconContainer.style.marginTop = "-10px"; // Move the icon higher if needed

      const removeIcon = document.createElement("span");
      removeIcon.className = "cursor-pointer text-red-500";
      removeIcon.innerHTML = "&times;"; // Using HTML entity for '×' (close icon)
      removeIcon.onclick = function () {
        degrees.splice(index, 1); // Remove the certification from JSON
        renderDegrees(); // Re-render certifications
      };
      removeIconContainer.appendChild(removeIcon);

      degreeEntryDiv.appendChild(removeIconContainer);

      degreesContainerChild.appendChild(degreeEntryDiv);

      // Always add degreesContainerChild as the first child
      degreesContainer.prepend(degreesContainerChild);
    });
  }

  // Render degrees on load
  renderDegrees();

  // Add button to display a form for adding a new degree
  const addButtonDegree = document.createElement("button");
  addButtonDegree.style.display = "block";
  addButtonDegree.className =
    "mt-3 px-4 py-2 bg-primary text-white rounded";
  addButtonDegree.textContent = "Add Degree";
  addButtonDegree.type = "button";
  addButtonDegree.onclick = function () {
    displayDegreesForm();
  };

  degreesContainer.appendChild(addButtonDegree);

  function displayDegreesForm() {
    addButtonDegree.style.display = "none";
    // Create a form container
    const formContainer = document.createElement("div");
    formContainer.className = "mt-4 p-4 border rounded shadow";

    // Create input fields for the new certification
    const degreeNameInput = document.createElement("input");
    degreeNameInput.type = "text";
    degreeNameInput.placeholder = "Degree Name";
    degreeNameInput.className = "block w-full mt-2 p-2 border rounded";
    formContainer.appendChild(degreeNameInput);

    const normalizeDegreeInput = document.createElement("input");
    normalizeDegreeInput.type = "text";
    normalizeDegreeInput.placeholder = "Normalized Degree";
    normalizeDegreeInput.className =
      "block w-full mt-2 p-2 border rounded";
    formContainer.appendChild(normalizeDegreeInput);

    const specializationInput = document.createElement("input");
    specializationInput.type = "text";
    specializationInput.placeholder = "Specialization";
    specializationInput.className =
      "block w-full mt-2 p-2 border rounded";
    formContainer.appendChild(specializationInput);

    const countryOrInstituteInput = document.createElement("input");
    countryOrInstituteInput.type = "text";
    countryOrInstituteInput.placeholder = "Country Or Institute";
    countryOrInstituteInput.className =
      "block w-full mt-2 p-2 border rounded";
    formContainer.appendChild(countryOrInstituteInput);

    const startDateInput = document.createElement("input");
    startDateInput.type = "text";
    startDateInput.placeholder = "Start Date";
    startDateInput.className = "block w-full mt-2 p-2 border rounded";
    formContainer.appendChild(startDateInput);

    const endDateInput = document.createElement("input");
    endDateInput.type = "text";
    endDateInput.placeholder = "End Date";
    endDateInput.className = "block w-full mt-2 p-2 border rounded";
    formContainer.appendChild(endDateInput);

    // Create save button
    const saveButton = document.createElement("button");
    saveButton.className =
      "mt-3 px-4 py-2 bg-success text-white rounded";
    saveButton.textContent = "Save Degree";
    saveButton.onclick = function () {
      const newDegree = {
        DegreeName: degreeNameInput.value,
        NormalizeDegree: normalizeDegreeInput.value,
        Specialization: specializationInput.value,
        CountryOrInstitute: countryOrInstituteInput.value,
        StartDate: startDateInput.value,
        EndDate: endDateInput.value,
      };
      // Show the "Add Certification" button again
      addButtonDegree.style.display = "block";
      // Push the new certification to the array
      degrees.push(newDegree);

      // Remove form after saving
      formContainer.remove();
      // Re-render the certifications
      renderDegrees();
    };

    formContainer.appendChild(saveButton);
    // Create cancel button
    const cancelButton = document.createElement("button");
    cancelButton.className =
      "mt-3 px-4 py-2 bg-red-500 text-white rounded ml-2";
    cancelButton.textContent = "Cancel";
    cancelButton.onclick = function () {
      // Remove the form without adding a certification
      formContainer.remove();

      // Show the "Add Certification" button again
      addButtonDegree.style.display = "block";
    };
    formContainer.appendChild(cancelButton);

    // Append the form container to the DOM
    degreeFormContainerChild.appendChild(formContainer);
    degreesContainer.appendChild(degreeFormContainerChild);
  }

  experiences = candidateData.candidateData.CandidateInfo.Experience;
  const containerExp = document.getElementById("containerExperience");
  const experiencesContainerChild = document.createElement("div");
  const experienceFormContainerChild = document.createElement("div");
  containerExp.innerHTML = "";
  // Function to render experiences
  // Function to render the experiences
  function renderExperiences() {
    experiencesContainerChild.innerHTML = ""; // Clear the container first

    experiences.forEach((exp, index) => {
      // Create a wrapper div for each certification entry
      const expEntryDiv = document.createElement("div");
      expEntryDiv.className = "mb-3 flex items-center justify-between";

      // Create a sub-container for inputs
      const inputContainer = document.createElement("div");
      inputContainer.className = "flex-1";

      // Create and append Certification Name field
      const expTitleDiv = document.createElement("div");
      expTitleDiv.className = "mb-3 flex items-center";

      const expTitleLabel = document.createElement("label");
      expTitleLabel.className =
        "block w-1/3 text-sm font-medium text-black dark:text-white mr-2";
      expTitleLabel.setAttribute("for", "experienceTitle" + index);
      expTitleLabel.textContent = "Title";
      expTitleDiv.appendChild(expTitleLabel);

      const expTitleInput = document.createElement("input");
      expTitleInput.type = "text";
      expTitleInput.className =
        "w-full rounded border border-stroke bg-gray px-3 py-2 font-medium text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary";
      expTitleInput.name = "experienceTitle" + index;
      expTitleInput.id = "experienceTitle" + index;
      expTitleInput.value = exp.Title;
      expTitleDiv.appendChild(expTitleInput);

      inputContainer.appendChild(expTitleDiv);

      // Create and append Issuing Organization field
      const periodeDiv = document.createElement("div");
      periodeDiv.className = "mb-3 flex items-center";

      const periodeLabel = document.createElement("label");
      periodeLabel.className =
        "block w-1/3 text-sm font-medium text-black dark:text-white mr-2";
      periodeLabel.setAttribute("for", "periode" + index);
      periodeLabel.textContent = "Periode";
      periodeDiv.appendChild(periodeLabel);

      const periodeInput = document.createElement("input");
      periodeInput.type = "text";
      periodeInput.className =
        "w-full rounded border border-stroke bg-gray px-3 py-2 font-medium text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary";
      periodeInput.name = "experiencePeriode" + index;
      periodeInput.id = "experiencePeriode" + index;
      periodeInput.value = exp.Periode;
      periodeDiv.appendChild(periodeInput);

      inputContainer.appendChild(periodeDiv);

      // Create and append Issue Date field
      const descriptionDiv = document.createElement("div");
      descriptionDiv.className = "mb-3 flex items-center";

      const descriptionLabel = document.createElement("label");
      descriptionLabel.className =
        "block w-1/3 text-sm font-medium text-black dark:text-white mr-2";
      descriptionLabel.setAttribute("for", "description" + index);
      descriptionLabel.textContent = "Description";
      descriptionDiv.appendChild(descriptionLabel);

      const descriptionInput = document.createElement("textarea");
      descriptionInput.type = "text";
      descriptionInput.className =
        "w-full rounded border border-stroke bg-gray px-3 py-2 font-medium text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary";
      descriptionInput.name = "experienceDescription" + index;
      descriptionInput.id = "experienceDescription" + index;
      descriptionInput.value = exp.Description;
      descriptionDiv.appendChild(descriptionInput);

      inputContainer.appendChild(descriptionDiv);
      // Resize the textarea after it has been rendered and styled
      requestAnimationFrame(() => {
        autoResizeTextarea(descriptionInput); // Ensure the textarea is resized after rendering
      });

      // Add an input event listener to resize the textarea dynamically as the content changes
      descriptionInput.addEventListener("input", function () {
        autoResizeTextarea(this);
      });

      expEntryDiv.appendChild(inputContainer);

      // Create remove icon and place it far from the input fields
      const removeIconContainer = document.createElement("div");
      removeIconContainer.className = "flex-shrink-0 ml-4"; // Adjust the margin to move the icon away
      removeIconContainer.style.alignSelf = "flex-start"; // Align icon to the top
      removeIconContainer.style.marginTop = "-10px"; // Move the icon higher if needed

      const removeIcon = document.createElement("span");
      removeIcon.className = "cursor-pointer text-red-500";
      removeIcon.innerHTML = "&times;"; // Using HTML entity for '×' (close icon)
      removeIcon.onclick = function () {
        experiences.splice(index, 1); // Remove the certification from JSON
        renderExperiences(); // Re-render certifications
      };
      removeIconContainer.appendChild(removeIcon);

      expEntryDiv.appendChild(removeIconContainer);

      experiencesContainerChild.appendChild(expEntryDiv);
      containerExp.prepend(experiencesContainerChild);
    });
  }

  // Render certifications on load
  renderExperiences();

  // Add button to display a form for adding a new certification
  const addButtonExp = document.createElement("button");
  addButtonExp.className =
    "mt-3 px-4 py-2 bg-primary text-white rounded";
  addButtonExp.textContent = "Add Experience";
  addButtonExp.type = "button";
  addButtonExp.onclick = function () {
    displayExperienceForm(); // Call the function to display the form
  };

  containerExp.appendChild(addButtonExp);

  // Function to display a form for adding a new certification
  function displayExperienceForm() {
    addButtonExp.style.display = "none";
    // Create a form container
    const formContainer = document.createElement("div");
    formContainer.className = "mt-4 p-4 border rounded shadow";

    // Create input fields for the new certification
    const expTitleInput = document.createElement("input");
    expTitleInput.type = "text";
    expTitleInput.placeholder = "Title";
    expTitleInput.className = "block w-full mt-2 p-2 border rounded";
    formContainer.appendChild(expTitleInput);

    const periodeInput = document.createElement("input");
    periodeInput.type = "text";
    periodeInput.placeholder = "Periode";
    periodeInput.className = "block w-full mt-2 p-2 border rounded";
    formContainer.appendChild(periodeInput);

    const descriptionInput = document.createElement("input");
    descriptionInput.type = "text";
    descriptionInput.placeholder = "Description";
    descriptionInput.className = "block w-full mt-2 p-2 border rounded";
    formContainer.appendChild(descriptionInput);

    // Create save button
    const saveButton = document.createElement("button");
    saveButton.className =
      "mt-3 px-4 py-2 bg-success text-white rounded";
    saveButton.textContent = "Save Experience";
    saveButton.onclick = function () {
      const newExp = {
        Title: expTitleInput.value,
        Periode: periodeInput.value,
        Description: descriptionInput.value,
      };

      // Push the new certification to the array
      experiences.push(newExp);

      // Remove form after saving
      formContainer.remove();
      addButtonExp.style.display = "block";
      // Re-render the certifications
      renderExperiences();
    };

    formContainer.appendChild(saveButton);
    // Create cancel button
    const cancelButton = document.createElement("button");
    cancelButton.className =
      "mt-3 px-4 py-2 bg-red-500 text-white rounded ml-2";
    cancelButton.textContent = "Cancel";
    cancelButton.onclick = function () {
      // Remove the form without adding a certification
      formContainer.remove();

      // Show the "Add Certification" button again
      addButtonExp.style.display = "block";
    };
    formContainer.appendChild(cancelButton);

    // Append the form container to the DOM
    experienceFormContainerChild.appendChild(formContainer);
    containerExp.appendChild(experienceFormContainerChild);
  }
}
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

function get_candidate(id) {
apiClient.get(`/api/get-candidate/${id}/`,
  {
    withCredentials: true,
    headers: {
        'X-CSRFToken': Cookies.get('csrftoken'),  // Manually extract the CSRF token
    },
}
)
  .then(function (response) {
    const responseData = response.data;
    localStorage.removeItem('responseData');
    localStorage.setItem('responseData', JSON.stringify(responseData));
    console.log("responseDataresponseData", responseData)
    // Save the candidate data to localStorage
    //localStorage.setItem('candidateData', JSON.stringify(candidateData));

    // Redirect to profile.html
    window.location.href = "profile.html";
  })
  .catch(function (error) {
    console.error("Error fetching candidate data:", error);
    alert("Failed to fetch candidate data. Please try again.");
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


function showLoading() {
document.getElementById('loadingSpinner').classList.remove('hidden');
}

function hideLoading() {
document.getElementById('loadingSpinner').classList.add('hidden');
}

function showSuccessPopup() {
document.getElementById('successPopup').classList.remove('hidden');
}

function hideSuccessPopup() {
document.getElementById('successPopup').classList.add('hidden');
}

document.getElementById('closePopup').addEventListener('click', hideSuccessPopup);