let edit = false;
let hrManagement;


let candidateData;
let notes;
/*window.onload = () => {
  const [navigation] = performance.getEntriesByType("navigation");

  if (navigation && navigation.type === "reload") {
    console.log("page reloadedd");
    const idCandidate = JSON.parse(localStorage.getItem("responseData")).candidateData.id_candidate;
    apiClient.get(`/api/get-candidate/${idCandidate}/`,
      {
        withCredentials: true,
      }
    )
      .then(function (response) {
        const responseDt = response.data;
        localStorage.removeItem('responseData');
        localStorage.setItem('responseData', JSON.stringify(responseDt));
        const responseData = JSON.parse(
          localStorage.getItem("responseData")
        );
        localStorage.setItem("profileData", JSON.stringify(responseData));
        console.log("responseData", responseData);
        candidateData = responseData.candidateData;
        notes = responseData.Notes;
        load_profile();
      })
      .catch(function (error) {
        console.error("Error fetching candidate data:", error);
        alert("Failed to fetch candidate data. Please try again.");
      });
  }
  else {
    const responseData = JSON.parse(
      localStorage.getItem("responseData")
    );
    localStorage.setItem("profileData", JSON.stringify(responseData));
    console.log("responseData", responseData);
    candidateData = responseData.candidateData;
    notes = responseData.Notes;
    load_profile();
  }


};*/

window.onload = () => {
  // Récupère l'ID du candidat depuis le localStorage
  const idCandidate = getIdFromLocalStorage();

  if (!idCandidate) {
    console.error("Aucun ID de candidat trouvé dans le localStorage");
    showError("Informations du candidat manquantes. Veuillez réessayer.");
    return;
  }

  // Vérifie si la page a été rafraîchie
  const isPageReloaded = performance.navigation.type === 1; // 1 = reload

  if (isPageReloaded) {
    // Si la page est rafraîchie, charge les données depuis le serveur
    loadCandidateData(idCandidate);
  } else {
    // Sinon, charge les données depuis le localStorage
    loadFromLocalStorage();
  }
};
function getIdFromLocalStorage() {
  try {
    const responseData = JSON.parse(localStorage.getItem("responseData"));
    return responseData?.candidateData?.id_candidate;
  } catch (error) {
    console.error("Error parsing localStorage data:", error);
    return null;
  }
}
function loadFromLocalStorage() {
  try {
    const responseData = JSON.parse(localStorage.getItem("responseData"));

    // Vérifie si les données sont valides
    if (!responseData || !responseData.candidateData || !responseData.Notes) {
      throw new Error("Données dans le localStorage invalides ou incomplètes");
    }

    // Met à jour les variables globales
    candidateData = responseData.candidateData;
    notes = responseData.Notes;

    // Charge le profil
    load_profile();
  } catch (error) {
    console.error("Erreur lors du chargement depuis le localStorage :", error);
    showError("Échec du chargement des données. Veuillez rafraîchir la page.");

    // Si les données sont corrompues, recharge depuis le serveur
    const idCandidate = getIdFromLocalStorage();
    if (idCandidate) {
      loadCandidateData(idCandidate);
    }
  }
}

function loadCandidateData(idCandidate) {
  apiClient.get(`/api/get-candidate/${idCandidate}/`, {
    withCredentials: true,
    timeout: 10000, // 10 second timeout
    headers: {
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    }
  })
  .then(function (response) {
    if (!response.data) {
      throw new Error('No data received from server');
    }
    
    // Store response data
    localStorage.removeItem('responseData');
    localStorage.setItem('responseData', JSON.stringify(response.data));
    localStorage.setItem('profileData', JSON.stringify(response.data));
    
    // Update global variables
    candidateData = response.data.candidateData;
    notes = response.data.Notes;
    
    load_profile();
  })
  .catch(function (error) {
    console.error("Error fetching candidate data:", error);
    let errorMessage = "Failed to fetch candidate data. ";
    
    if (error.response) {
      // Server responded with error
      errorMessage += `Server error: ${error.response.status}`;
      console.error("Server response:", error.response.data);
    } else if (error.request) {
      // Request made but no response
      errorMessage += "No response from server. Please check your connection.";
    } else {
      // Error setting up request
      errorMessage += error.message;
    }
    
    showError(errorMessage);
  });
}
function showError(message) {
  // Create or get error container
  let errorContainer = document.getElementById('error-container');
  if (!errorContainer) {
    errorContainer = document.createElement('div');
    errorContainer.id = 'error-container';
    errorContainer.className = 'fixed top-4 right-4 z-50 max-w-sm';
    document.body.appendChild(errorContainer);
  }

  // Create error message element
  const errorElement = document.createElement('div');
  errorElement.className = 'bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4';
  errorElement.innerHTML = `
    <div class="flex items-center">
      <div class="py-1">
        <svg class="h-6 w-6 text-red-500 mr-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div>
        <p class="font-bold">Error</p>
        <p class="text-sm">${message}</p>
      </div>
    </div>
  `;

  // Add close button
  const closeButton = document.createElement('button');
  closeButton.className = 'absolute top-0 right-0 mt-2 mr-2 text-red-700 hover:text-red-900';
  closeButton.innerHTML = '×';
  closeButton.onclick = () => errorElement.remove();
  errorElement.appendChild(closeButton);

  // Add to container and set timeout to remove
  errorContainer.appendChild(errorElement);
  setTimeout(() => errorElement.remove(), 5000);
}
function load_stats() {
  // Remove the original div
  const originalDiv = document.getElementById("profile-cdd");
  if (originalDiv) {
    originalDiv.remove();
  }
  document.getElementById("pf-btn").className =
    "rounded px-3 py-1 text-xs font-medium text-black hover:bg-white hover:shadow-card dark:text-white dark:hover:bg-boxdark";
  document.getElementById("hr-btn").className =
    "rounded px-3 py-1 text-xs font-medium text-black hover:bg-white hover:shadow-card dark:text-white dark:hover:bg-boxdark";
  document.getElementById("stat-btn").className =
    "rounded bg-white px-3 py-1 text-xs font-medium text-black shadow-card hover:bg-white hover:shadow-card dark:bg-boxdark dark:text-white dark:hover:bg-boxdark";
  document.getElementById("app-btn").className =
    "rounded px-3 py-1 text-xs font-medium text-black hover:bg-white hover:shadow-card dark:text-white dark:hover:bg-boxdark";
  document.getElementById("inter-btn").className =
    "rounded px-3 py-1 text-xs font-medium text-black hover:bg-white hover:shadow-card dark:text-white dark:hover:bg-boxdark";

  const targetDiv = document.createElement("div");
  targetDiv.id = "profile-cdd";
  targetDiv.className = "mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10";
  const main_content = document.getElementById("main-content");
  // Fetch the content from the external HTML file
  fetch("statistics.html")
    .then((response) => response.text()) // Get the content as text
    .then((data) => {
      console.log("stat fetch");
      targetDiv.innerHTML = data; // Insert the fetched content into the div
      main_content.appendChild(targetDiv); // Append the new div to the body or any other parent element
    })
    .catch((error) =>
      console.error("Error loading the external file:", error)
    );
}

/*function load_app() {
  const originalDiv = document.getElementById("profile-cdd");
  if (originalDiv) {
    originalDiv.remove();
  }

  document.getElementById("pf-btn").className =
    "rounded px-3 py-1 text-xs font-medium text-black hover:bg-white hover:shadow-card dark:text-white dark:hover:bg-boxdark";
  document.getElementById("hr-btn").className =
    "rounded px-3 py-1 text-xs font-medium text-black hover:bg-white hover:shadow-card dark:text-white dark:hover:bg-boxdark";
  document.getElementById("app-btn").className =
    "rounded bg-white px-3 py-1 text-xs font-medium text-black shadow-card hover:bg-white hover:shadow-card dark:bg-boxdark dark:text-white dark:hover:bg-boxdark";
  document.getElementById("stat-btn").className =
    "rounded px-3 py-1 text-xs font-medium text-black hover:bg-white hover:shadow-card dark:text-white dark:hover:bg-boxdark";
  document.getElementById("inter-btn").className =
    "rounded px-3 py-1 text-xs font-medium text-black hover:bg-white hover:shadow-card dark:text-white dark:hover:bg-boxdark";

  // Fetch the content from the external HTML file
  fetch("application.html")
    .then((response) => response.text()) // Get the content as text
    .then((data) => {
      console.log("app fetch");
      const targetDiv = document.createElement("div");
      targetDiv.id = "profile-cdd";
      targetDiv.className = "mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10";
      
      const main_content = document.getElementById("main-content");
      targetDiv.innerHTML = data; // Insert the fetched content into the div

      apiClient
        .get(
          `/api/get-applications/${candidateData.id_candidate}/`,
          {
            withCredentials: true,
          }
        )
        .then((response) => {
          console.log("Data updated successfully:", response.data);
          const data = response.data;

          const labels = [
            "New",
            "Preselected",
            "Interviewed",
            "Tested",
            "Proposed",
            "Interview Partner", 
            "Interview Client Final",
            "Hired",
            "Start date",
            "End date",
          ];
          data.forEach((element) => {
            const containerDiv = document.createElement("div");
            containerDiv.className =
              "rounded-sm border border-stroke pb-2 mb-8 bg-white shadow-default dark:border-strokedark dark:bg-boxdark";

            const titleDiv = document.createElement("div");
            titleDiv.className =
              "border-b border-stroke px-6.5 py-4 dark:border-strokedark";
            const jobDiv = document.createElement("h3");
            jobDiv.className = "font-medium text-black hover:underline hover:text-primary hover:cursor-pointer hover: dark:text-white";
            jobDiv.textContent = element.job;
            titleDiv.appendChild(jobDiv);
            titleDiv.onclick = () => getJob(element.jobId)
            containerDiv.appendChild(titleDiv);
            const ol = document.createElement("ol");
            ol.className =
              "items-center sm:flex pl-10 space-x-4 w-auto";
            for (var i = 0; i < 8; i++) {
              label = labels[i];
              console.log(label);
              const li = document.createElement("li");
              li.className = "relative mb-6 sm:mb-0 ";
              const container1 = document.createElement("div");
              container1.className = "flex items-center";
              const container2 = document.createElement("div");
              container2.className = "mt-3 sm:pe-8";
              const div1 = document.createElement("div");
              div1.className =
                "z-10 flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full ring-0 ring-white dark:bg-blue-900 sm:ring-8 dark:ring-gray-900 shrink-0 ";
              const div2 = document.createElement("div2");
              div2.className =
                "hidden sm:flex w-full bg-gray-200 h-0.5 dark:bg-gray-700";
              const h3 = document.createElement("h3");
              h3.className =
                "text-lg font-semibold text-gray-900 dark:text-white";
              h3.textContent = label;
              const time = document.createElement("time");
              time.className =
                "block mb-2 text-sm font-normal leading-none text-gray-400 dark:text-gray-500";
              time.textContent = element[label] || "__";
              if (element[label]) {
                // If truthy, add a blue checkmark icon
                div1.innerHTML = `
    <svg class="w-4 h-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
    </svg>
  `;
              }
              // else{
              //   div1.innerHTML = `
              //     <svg class="w-4 h-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              //       <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              //     </svg>
              //   `;
              // }
              container1.appendChild(div1);
              container1.appendChild(div2);
              container2.appendChild(h3);
              container2.appendChild(time);
              li.appendChild(container1);
              li.appendChild(container2);
              ol.appendChild(li);
            }
            containerDiv.appendChild(ol);
            targetDiv.prepend(containerDiv);
            main_content.appendChild(targetDiv); // Append the new div to the body or any other parent element
          });
        })
        .catch((error) => {
          console.error("Error updating data:", error);
        });
    })
    .catch((error) =>
      console.error("Error loading the external file:", error)
    );

  // Remove the original div
}*/
function load_app() {
  const originalDiv = document.getElementById("profile-cdd");
  if (originalDiv) {
    originalDiv.remove();
  }

  document.getElementById("pf-btn").className =
    "rounded px-3 py-1 text-xs font-medium text-black hover:bg-white hover:shadow-card dark:text-white dark:hover:bg-boxdark";
  document.getElementById("hr-btn").className =
    "rounded px-3 py-1 text-xs font-medium text-black hover:bg-white hover:shadow-card dark:text-white dark:hover:bg-boxdark";
  document.getElementById("app-btn").className =
    "rounded bg-white px-3 py-1 text-xs font-medium text-black shadow-card hover:bg-white hover:shadow-card dark:bg-boxdark dark:text-white dark:hover:bg-boxdark";
  document.getElementById("stat-btn").className =
    "rounded px-3 py-1 text-xs font-medium text-black hover:bg-white hover:shadow-card dark:text-white dark:hover:bg-boxdark";
  document.getElementById("inter-btn").className =
    "rounded px-3 py-1 text-xs font-medium text-black hover:bg-white hover:shadow-card dark:text-white dark:hover:bg-boxdark";

  // Fetch the content from the external HTML file
  fetch("application.html")
    .then((response) => response.text()) // Get the content as text
    .then((data) => {
      console.log("app fetch");
      const targetDiv = document.createElement("div");
      targetDiv.id = "profile-cdd";
      targetDiv.className = "mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10";

      const main_content = document.getElementById("main-content");
      targetDiv.innerHTML = data; // Insert the fetched content into the div

      apiClient
        .get(
          `/api/get-applications/${candidateData.id_candidate}/`,
          {
            withCredentials: true,
          }
        )
        .then((response) => {
          console.log("Data updated successfully:", response.data);
          const data = response.data;

          const labels = [
            "New",
            "Preselected",
            "Interviewed",
            "Tested",
            "Proposed",
            "Interview Partner", 
            "Interview Client Final",
            "Hired",
            "Start date",
            "End date",
          ];
          data.forEach((element) => {
            const containerDiv = document.createElement("div");
            containerDiv.className =
              "rounded-sm border border-stroke pb-2 mb-8 bg-white shadow-default dark:border-strokedark dark:bg-boxdark";

            const titleDiv = document.createElement("div");
            titleDiv.className =
              "border-b border-stroke px-6.5 py-4 dark:border-strokedark";
            const jobDiv = document.createElement("h3");
            jobDiv.className = "font-medium text-black hover:underline hover:text-primary hover:cursor-pointer dark:text-white";
            jobDiv.textContent = element.job;
            titleDiv.appendChild(jobDiv);
            titleDiv.onclick = () => getJob(element.jobId);
            containerDiv.appendChild(titleDiv);
            const ol = document.createElement("ol");
            ol.className = "items-center sm:flex pl-10 space-x-8 w-full overflow-auto";
            
            labels.forEach((label, index) => {
              const li = document.createElement("li");
              li.className = "relative mb-6 sm:mb-0 flex-shrink-0";
              const container1 = document.createElement("div");
              container1.className = "flex flex-col items-center space-y-2";
              const div1 = document.createElement("div");
              div1.className =
                "z-10 flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full dark:bg-blue-900 shrink-0";
              const div2 = document.createElement("div");
              div2.className = "hidden sm:flex w-full bg-gray-200 h-0.5 dark:bg-gray-700";
              const h3 = document.createElement("h3");
              h3.className = "text-lg font-semibold text-gray-900 dark:text-white text-center";
              h3.textContent = label;
              const time = document.createElement("time");
              time.className = "block text-sm font-normal leading-none text-gray-400 dark:text-gray-500 text-center";
              time.textContent = element[label] || "--";

              if (element[label]) {
                div1.innerHTML = `
                  <svg class="w-4 h-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                `;
              }
              container1.appendChild(div1);
              container1.appendChild(h3);
              container1.appendChild(time);
              if (index < labels.length - 1) {
                li.appendChild(div2);
              }
              li.appendChild(container1);
              li.appendChild(h3);
              li.appendChild(time);
              ol.appendChild(li);
            });

            containerDiv.appendChild(ol);
            targetDiv.prepend(containerDiv);
            main_content.appendChild(targetDiv); // Append the new div to the body or any other parent element
          });
        })
        .catch((error) => {
          console.error("Error updating data:", error);
        });
    })
    .catch((error) =>
      console.error("Error loading the external file:", error)
    );
}

function load_profile() {
  const originalDiv = document.getElementById("profile-cdd");
  if (originalDiv) {
    originalDiv.remove();
  }
  const targetDiv = document.createElement("div");
  targetDiv.id = "profile-cdd";
  targetDiv.className = "mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10";
  const main_content = document.getElementById("main-content");
  // Fetch the content from the external HTML file
  fetch("profileContent.html")
    .then((response) => response.text()) // Get the content as text
    .then((data) => {
      console.log("prof fetch");
      targetDiv.innerHTML = data; // Insert the fetched content into the div
      main_content.appendChild(targetDiv); // Append the new div to the body or any other parent element

      // Save data to localStorage

      console.log("candidateData:::::::", candidateData);
      document.getElementById("nameDisplay").textContent =
        candidateData.candidateData.CandidateInfo.FullName;
      document.getElementById("genderDisplay").textContent =
        candidateData.candidateData.CandidateInfo.Gender;
      document.getElementById("maritalStatusDisplay").textContent =
        candidateData.candidateData.CandidateInfo.MaritalStatus;
      document.getElementById(
        "phoneDisplay"
      ).innerHTML = `${candidateData.candidateData.CandidateInfo.PhoneNumber.FormattedNumber}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Location: ${candidateData.candidateData.CandidateInfo.PhoneNumber.Location}`;
      document.getElementById("recruiter").textContent =
        candidateData.recruiter;
      document.getElementById("availability").textContent =
        candidateData.availability;
      document.getElementById("mobility").textContent =
        candidateData.mobility;
      const statusDisplay = document.getElementById("status");
      const status = candidateData.status;
      statusDisplay.textContent = status;
      if (candidateData.status == "available") {
        statusDisplay.className = "inline-flex rounded-full bg-success bg-opacity-10 px-3 py-1 text-sm font-medium text-success";
      }
      else if (candidateData.status == "not available") {
        statusDisplay.className = "inline-flex rounded-full bg-warning bg-opacity-10 px-3 py-1 text-sm font-medium text-warning";
      }
      else if (candidateData.status == "restricted") {
        statusDisplay.className = "inline-flex rounded-full bg-danger bg-opacity-10 px-3 py-1 text-sm font-medium text-danger";
      }

      document.getElementById("dateOfBirthDisplay").textContent =
        candidateData.candidateData.CandidateInfo.DateOfBirth;
      document.getElementById("emailDisplay").textContent =
        candidateData.candidateData.CandidateInfo.Email;
      const linkedInDisplay = document.getElementById("linkedInDisplay")
      const linkedIn = candidateData.candidateData.CandidateInfo.Linkedin;
      if (linkedIn != "undefined" && linkedIn != "") {
        linkedInDisplay.href = `https://${linkedIn}`;
      }
      linkedInDisplay.textContent = linkedIn;
      const gitHubDisplay = document.getElementById("gitHubDisplay");
      const gitHub = candidateData.candidateData.CandidateInfo.Github;
      if (gitHub != "undefined" && gitHub != "") {
        gitHubDisplay.href = `https://${gitHub}`;
      }
      gitHubDisplay.textContent = gitHub;

      document.getElementById("countryDisplay").textContent =
        candidateData.candidateData.CandidateInfo.Country;
      document.getElementById("nationalityDisplay").textContent =
        candidateData.candidateData.CandidateInfo.Nationality;
      const linksDisplay = document.getElementById('linksDisplay');

      // Access the Links array
      const linksArray = candidateData.candidateData.CandidateInfo.Links;

      // Create clickable links with <a> tags
      const linksHTML = linksArray.map(link => `<a href="https://${link}" target="_blank" class="hover:text-blue-500 hover:underline">${link}</a>`).join('  ,  ');

      // Set the innerHTML of 'linksDisplay' to the created links
      linksDisplay.innerHTML = linksHTML;
      notes.forEach((note) => {
        const notesContainer = document.getElementById("notesContainer");
        const container = document.createElement("div");
        container.dataset.id = note.id;
        container.className =
          "flex flex-col mt-4 p-4 border-b border-stroke dark:border-strokedark";
        const nameDiv = document.createElement("div");
        nameDiv.className = "font-medium text-purple-800 mb-1";
        nameDiv.textContent = note.recruiter;
        const contentDiv = document.createElement("div");
        contentDiv.className = "text-purple-800 mb-2";
        contentDiv.textContent = note.content;
        const container2 = document.createElement("div");
        container2.className = "flex justify-end gap-x-2";
        const dateDiv = document.createElement("div");
        dateDiv.className = "text-gray-600";
        dateDiv.textContent = note.added_at;
        const deletebtn = document.createElement("a");
        deletebtn.textContent = "delete";
        deletebtn.onclick = function () {
          deleteNote(note.id); // Call the function to display the form
        };

        container2.appendChild(deletebtn);
        container2.appendChild(dateDiv);
        container.appendChild(nameDiv);
        container.appendChild(contentDiv);
        container.appendChild(container2);
        notesContainer.appendChild(container);
      });
      // Get elements
      // const toggleSkillsBtn = document.getElementById('toggleSkillsBtn');
      // const detailedSkillsContainer = document.getElementById('detailedSkillsContainer');

      // // Function to toggle visibility of the skills container
      // toggleSkillsBtn.addEventListener('click', () => {
      //   if (detailedSkillsContainer.style.display === "none") {
      //     detailedSkillsContainer.style.display = "block";
      //     detailedSkillsContainer.classList.add('show');
      //     toggleSkillsBtn.textContent = "Hide Skills";
      //   } else {
      //     detailedSkillsContainer.style.display = "none";
      //     detailedSkillsContainer.classList.remove('show');
      //     toggleSkillsBtn.textContent = "Show Skills";
      //   }
      // });
      const jobTitle = document.getElementById("jobTitle");
      jobTitle.textContent =
        candidateData.candidateData.CandidateInfo["Titled Post"];

      // Split the "Soft Skills" string into an array
      const softSkillsArray =
        candidateData.candidateData.CandidateInfo["Soft Skills"];

      // Loop through the soft skills array
      softSkillsArray.forEach((softSkill) => {
        softSkillsDisplay = document.getElementById("softSkillsDisplay");
        const skillDiv = document.createElement("div");

        // Set the class and style attributes
        skillDiv.className =
          " inline-flex  bg-indigo-400 items-center justify-center rounded-full border px-10 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10";
        skillDiv.style.padding = "5px 15px";
        skillDiv.style.margin = "1%";
        //skillDiv.style.backgroundColor = "#9BA9ED";

        // Set the skill name as the text content
        skillDiv.textContent = softSkill;

        // Append the new div to the container
        softSkillsDisplay.appendChild(skillDiv);
      });

      // Split the "Soft Skills" string into an array
      const hardSkillsArray =
        candidateData.candidateData.CandidateInfo["Hard Skills"];

      // Loop through the soft skills array
      hardSkillsArray.forEach((hardSkill) => {
        hardSkillsDisplay = document.getElementById("hardSkillsDisplay");
        const skillDiv = document.createElement("div");

        // Set the class and style attributes
        skillDiv.className =
          "inline-flex items-center justify-center rounded-full bg-purple-600 border border-meta-3 px-10 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10";
        skillDiv.style.padding = "5px 15px";
        skillDiv.style.margin = "1%";

        // Set the skill name as the text content
        skillDiv.textContent = hardSkill;

        // Append the new div to the container
        hardSkillsDisplay.appendChild(skillDiv);
      });

      // const skills = candidateData.candidateData.CandidateInfo.Skill;
      // // Loop through the soft skills array
      // skills.forEach(skill => {
      //   const detailedHardSkillsDisplay = document.getElementById('detailedHardSkillsDisplay');
      //   const detailedSoftSkillsDisplay = document.getElementById('detailedSoftSkillsDisplay');

      //   const div = document.createElement('div');
      //   const skillType = skill.Type;
      //   div.className = "bg-white p-4 rounded-lg shadow-md";
      //   const skillName = document.createElement('h4');

      //   skillName.textContent = `${skill.Skill}`;
      //   const type = document.createElement('p');
      //   type.className = "text-sm text-gray-600";
      //   type.textContent = skillType;

      //   const lastUsed = document.createElement('p');
      //   lastUsed.className = "text-sm text-gray-600";
      //   lastUsed.textContent = `Last Used: ${skill['Last Used']}`;
      //   const experienceInMonths = document.createElement('p');
      //   experienceInMonths.className = "text-sm text-gray-600";
      //   experienceInMonths.textContent = `Experience In Months: ${skill['Experience In Months']}`;

      //   div.appendChild(skillName);
      //   div.appendChild(type);
      //   div.appendChild(lastUsed);
      //   div.appendChild(experienceInMonths);
      //   if (skillType == "SoftSkill") {
      //     skillName.className = "text-lg font-medium text-yellow-600";
      //     detailedSoftSkillsDisplay.appendChild(div);
      //   } else {
      //     skillName.className = "text-lg font-medium text-purple-600";
      //     detailedHardSkillsDisplay.appendChild(div);
      //   }

      // });

      const colorArray = [
        // Blues
        "bg-blue-200 text-blue-700",
        "bg-blue-300 text-blue-800",
        "bg-blue-400 text-blue-900",
        "bg-indigo-200 text-indigo-700",
        "bg-indigo-300 text-indigo-800",
        "bg-indigo-400 text-indigo-900",
        "bg-cyan-200 text-cyan-700",
        "bg-cyan-300 text-cyan-800",
        "bg-cyan-400 text-cyan-900",
        "bg-sky-200 text-sky-700",
        "bg-sky-300 text-sky-800",
        "bg-sky-400 text-sky-900",
        "bg-lightBlue-300 text-lightBlue-700",
        "bg-lightBlue-400 text-lightBlue-800",
        "bg-lightBlue-500 text-lightBlue-600",
        "bg-azure-200 text-azure-700",
        "bg-azure-300 text-azure-800",
      ];

      const languages =
        candidateData.candidateData.CandidateInfo.Languages;
      languages.forEach((language) => {
        const span = document.createElement("span");

        // Randomly select a color from the colorArray
        const randomColorClass =
          colorArray[Math.floor(Math.random() * colorArray.length)];

        // Set the class for the span
        span.className = `${randomColorClass} font-medium px-4 py-2 rounded-full mr-2 mb-2 inline-block`;
        span.textContent = language;

        // Append the span to the languagesDisplay element
        languagesDisplay.appendChild(span);
      });

      const degrees = candidateData.candidateData.CandidateInfo.Degrees;
      degrees.forEach((degree) => {
        const li = document.createElement("li");
        li.className = "mb-10 ml-6 relative"; // Ensure relative positioning for child elements

        const span = document.createElement("span");
        span.className = "flex absolute -left-1 justify-center items-center w-3 h-3 bg-primary rounded-full ring-8 ring-white";

        const div = document.createElement("div");
        div.className = "p-4 bg-white rounded-lg border border-gray-200 shadow-sm dark:bg-boxdark dark:border-strokedark";

        const h2 = document.createElement("h2");
        h2.className = "mb-1 text-lg font-semibold text-black dark:text-white";
        h2.textContent = degree.DegreeName;

        const infoDegree = document.createElement("div");
        infoDegree.className = "mb-2 text-sm font-normal text-gray-600 dark:text-gray-400";
        infoDegree.textContent = `${degree.NormalizeDegree} - ${degree.Specialization}`;

        const time = document.createElement("time");
        // Adjust time class to make it smaller and positioned neatly
        time.className = "left-50 top-1 text-[10px] font-semibold uppercase";
        time.style.color = "#3a86ff"; // Consistent with experience section
        time.textContent = degree.Date;

        const p = document.createElement("p");
        p.className = "text-sm text-gray-600 dark:text-gray-400";
        p.textContent = degree.CountryOrInstitute;

        // Append elements in the correct order
        div.appendChild(h2);
        div.appendChild(infoDegree);
        div.appendChild(p);

        li.appendChild(time); // Add the date to the left
        li.appendChild(span);
        li.appendChild(div);

        educationDisplay.appendChild(li);
      });




      const certifications =
        candidateData.candidateData.CandidateInfo.Certifications;
      certificationDisplay = document.getElementById(
        "certificationDisplay"
      );
      certifications.forEach((certif) => {
        const div = document.createElement("div");
        div.className =
          "bg-white p-5 rounded-lg shadow-md flex items-center justify-between";
        const h3 = document.createElement("h3");
        h3.className = "text-lg font-semibold text-purple-600";
        h3.textContent = certif.CertificationName;
        const name = document.createElement("p");
        name.textContent = certif.IssuingOrganization;
        name.className = "text-sm text-gray-600";
        const organization = document.createElement("p");
        const issueDate = document.createElement("p");
        issueDate.textContent = certif.IssueDate;
        issueDate.className = "text-lg font-medium text-indigo-500";
        const div1 = document.createElement("div");
        const div2 = document.createElement("div");
        div2.className = "text-right";
        div1.appendChild(h3);
        div1.appendChild(name);
        div2.appendChild(organization);
        div2.appendChild(issueDate);
        div.appendChild(div1);
        div.appendChild(div2);
        certificationDisplay.appendChild(div);
      });

      const experiences = candidateData.candidateData.CandidateInfo.Experience;
      experiences.forEach((experience) => {
      const container = document.createElement("div");
      container.className = "relative pl-8 sm:pl-32 py-6 group";
      const div = document.createElement("div");
      div.className = "flex flex-col sm:flex-row items-start mb-2 group-last:before:hidden before:absolute before:left-2 sm:before:left-0 before:h-full before:w-[2px] before:bg-slate-300 sm:before:ml-[6.5rem] before:self-start before:-translate-x-1/2 before:translate-y-3 after:absolute after:left-2 sm:after:left-0 after:w-3 after:h-3 after:bg-indigo-500 after:border-4 after:box-content after:border-white after:rounded-full sm:after:ml-[6.5rem] after:-translate-x-1/2 after:translate-y-1.5";
      const time = document.createElement("time");
      time.className = "sm:absolute left-0 translate-y-0.5 inline-flex items-center justify-center text-xs font-semibold uppercase w-20 h-5 mb-2 sm:mb-0";
      time.style.color = "#3a86ff";
      // Use Period instead of Periode
      time.textContent = experience.Period;
      const divTitle = document.createElement("div");
      divTitle.className = "font-medium text-lg text-indigo-500 mb-2 sm:mb-0";
      divTitle.style.fontFamily = "'Poppins', sans-serif";
      divTitle.style.color = "#4a5a9a";
      divTitle.style.fontSize = "16px";
      divTitle.style.textTransform = "capitalize";
      divTitle.textContent = experience.Title;
      const divDescription = document.createElement("div");
      divDescription.className = "text-sm text-slate-500 leading-relaxed";
      divDescription.textContent = experience.Description;
      div.appendChild(time);
      div.appendChild(divTitle);
      container.appendChild(div);
      container.appendChild(divDescription);
      
      experienceDisplay.appendChild(container);
    });
    console.log("Starting Projects section...");
    console.log("Full candidateData:", candidateData);
    console.log("CandidateInfo:", candidateData.candidateData.CandidateInfo);
    console.log("Projects data:", candidateData.candidateData.CandidateInfo.Projects);
    console.log(" data:", candidateData.candidateData.CandidateInfo.PrixEtPublications);
    


    // Replace the existing Projects and Publications handling code with this:

console.log("Starting Projects section...");
try {
  // Handle Projects section
  const projects = candidateData.candidateData.CandidateInfo.Projects || [];
  const projectsDisplay = document.getElementById("projectsDisplay");
  console.log("Projects data:", projects);

  if (Array.isArray(projects) && projects.length > 0 && projectsDisplay) {
    projects.forEach((project) => {
      const div = document.createElement("div");
      div.className = "relative pl-8 sm:pl-32 py-6 group";
      
      const container = document.createElement("div");
      container.className = "flex flex-col sm:flex-row items-start mb-2 group-last:before:hidden before:absolute before:left-2 sm:before:left-0 before:h-full before:w-[2px] before:bg-slate-300 sm:before:ml-[6.5rem] before:self-start before:-translate-x-1/2 before:translate-y-3 after:absolute after:left-2 sm:after:left-0 after:w-3 after:h-3 after:bg-indigo-500 after:border-4 after:box-content after:border-white after:rounded-full sm:after:ml-[6.5rem] after:-translate-x-1/2 after:translate-y-1.5";

      const time = document.createElement("time");
      time.className = "sm:absolute left-0 translate-y-0.5 inline-flex items-center justify-center text-xs font-semibold uppercase w-20 h-5 mb-3 sm:mb-0";
      time.style.color = "#3a86ff";
      time.textContent = project.Period || "N/A";

      const projectName = document.createElement("div");
      projectName.className = "font-medium text-lg text-indigo-500 mb-2";
      projectName.style.fontFamily = "'Poppins', sans-serif";
      projectName.textContent = project.ProjectName;

      const description = document.createElement("div");
      description.className = "text-sm text-slate-500 leading-relaxed";
      description.textContent = project.Description;

      const technologies = document.createElement("div");
      technologies.className = "mt-2 flex flex-wrap gap-2";
      if (Array.isArray(project.TechnologiesUsed)) {
        project.TechnologiesUsed.forEach(tech => {
          const techSpan = document.createElement("span");
          techSpan.className = "px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600";
          techSpan.textContent = tech;
          technologies.appendChild(techSpan);
        });
      }

const role = document.createElement("div");
      role.className = "text-sm text-primary mt-2";
      role.textContent = `Role: ${project.Role}`;

      if (project.URL) {
        const url = document.createElement("a");
        url.href = project.URL;
        url.className = "text-sm text-blue-500 hover:underline mt-2 block";
        url.textContent = "Project Link";
        url.target = "_blank";
        container.appendChild(url);
      }

      container.appendChild(time);
      container.appendChild(projectName);
      div.appendChild(container);
      div.appendChild(description);
      div.appendChild(technologies);
      div.appendChild(role);
      
      projectsDisplay.appendChild(div);
    });
  } else {
    const emptyMessage = document.createElement("div");
    emptyMessage.className = "text-center text-gray-500 py-4";
    emptyMessage.textContent = "No projects available";
    projectsDisplay.appendChild(emptyMessage);
  }

  // Handle Prix et Publications section
  const publications = candidateData.candidateData.CandidateInfo.PrixEtPublications || [];
  const publicationsDisplay = document.getElementById("publicationsDisplay");
  console.log("Publications data:", publications);

  if (Array.isArray(publications) && publications.length > 0 && publicationsDisplay) {
    publications.forEach((item) => {
      const div = document.createElement("div");
      div.className = "bg-white p-5 rounded-lg shadow-md flex flex-col gap-3 mb-4";

      const header = document.createElement("div");
      header.className = "flex justify-between items-center";

      const title = document.createElement("h3");
      title.className = "text-lg font-semibold text-purple-600";
      title.textContent = item.Title;

      const type = document.createElement("span");
      type.className = `px-3 py-1 rounded-full text-sm ${
        item.Type === "Award" 
          ? "bg-yellow-100 text-yellow-800" 
          : "bg-blue-100 text-blue-800"
      }`;
      type.textContent = item.Type;

      header.appendChild(title);
      header.appendChild(type);

      const description = document.createElement("p");
      description.className = "text-gray-600";
      description.textContent = item.Description;

      const details = document.createElement("div");
      details.className = "flex justify-between text-sm text-gray-500";

      const date = document.createElement("span");
      date.textContent = item.Date;

      const publisher = document.createElement("span");
      publisher.textContent = item.PublisherOrIssuer;

      details.appendChild(date);
      details.appendChild(publisher);

      div.appendChild(header);
      div.appendChild(description);
      div.appendChild(details);

      if (item.URL) {
        const link = document.createElement("a");
        link.href = item.URL;
        link.className = "text-blue-500 hover:underline text-sm";
        link.textContent = "View Publication";
        link.target = "_blank";
        div.appendChild(link);
      }

      publicationsDisplay.appendChild(div);
    });
  } else {
    const emptyMessage = document.createElement("div");
    emptyMessage.className = "text-center text-gray-500 py-4";
    emptyMessage.textContent = "No publications or awards available";
    publicationsDisplay.appendChild(emptyMessage);
  }
} catch (error) {
  console.error("Error handling projects and publications:", error);
}
      //document.getElementById("experienceDisplay").textContent = candidateData.candidateData.experience;
      //document.getElementById("certificationDisplay").textContent = candidateData.candidateData.certifications;
      // var skills = candidateData.candidateData.skills;
      // const skillsContainer = document.getElementById('skillsDisplay');
      // skills.forEach(skill => {
      //   // Create a new div element
      //   const skillDiv = document.createElement('div');

      //   // Set the class and style attributes
      //   skillDiv.className = "inline-flex items-center justify-center rounded-full bg-meta-3 border border-meta-3 px-10 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10";
      //   skillDiv.style.padding = "5px 15px";
      //   skillDiv.style.margin = "1%";

      //   // Set the skill name as the text content
      //   skillDiv.textContent = skill;

      //   // Append the new div to the container
      //   skillsContainer.appendChild(skillDiv);
      // });

      // Append the new div to the body or any other parent element
    })
    .catch((error) =>
      console.error("Error loading the external file:", error)
    );

  document.getElementById("pf-btn").className =
    "rounded bg-white px-3 py-1 text-xs font-medium text-black shadow-card hover:bg-white hover:shadow-card dark:bg-boxdark dark:text-white dark:hover:bg-boxdark";
  document.getElementById("hr-btn").className =
    "rounded px-3 py-1 text-xs font-medium text-black hover:bg-white hover:shadow-card dark:text-white dark:hover:bg-boxdark";
  document.getElementById("app-btn").className =
    "rounded px-3 py-1 text-xs font-medium text-black hover:bg-white hover:shadow-card dark:text-white dark:hover:bg-boxdark";
  document.getElementById("stat-btn").className =
    "rounded px-3 py-1 text-xs font-medium text-black hover:bg-white hover:shadow-card dark:text-white dark:hover:bg-boxdark";
  document.getElementById("inter-btn").className =
    "rounded px-3 py-1 text-xs font-medium text-black hover:bg-white hover:shadow-card dark:text-white dark:hover:bg-boxdark";
}
function load_interviews() {
  const originalDiv = document.getElementById("profile-cdd");
  if (originalDiv) {
      originalDiv.remove();
  }

  // Create new container
  const targetDiv = document.createElement("div");
  targetDiv.id = "profile-cdd";
  targetDiv.className = "mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10";
  const main_content = document.getElementById("main-content");

  const interviewsContainer = `
      <div class="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div class="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
          <h3 class="font-medium text-black dark:text-white">Interviews History</h3>
        </div>
        <div id="interviewContainer" class="divide-y divide-stroke dark:divide-strokedark">
        </div>
      </div>
    `;

  targetDiv.innerHTML = interviewsContainer;
  main_content.appendChild(targetDiv);

  apiClient.get(`/interview/list/get/${candidateData.id_candidate}/`, {
      withCredentials: true,
  })
  .then(function (response) {
      const interviews = response.data;
      const interviewContainer = document.getElementById("interviewContainer");

      if (!interviews || interviews.length === 0) {
          interviewContainer.innerHTML = `
              <div class="p-6.5 text-center text-gray-500 dark:text-gray-400">
                No interviews found
              </div>
          `;
          return;
      }

      interviews.forEach(interview => {
          // Determine the type of interview and its style
          const typeLabel = interview.interview_type ? interview.interview_type.charAt(0).toUpperCase() + interview.interview_type.slice(1) + ' Interview' : 'Unknown';
          let typeClass = '';

          switch (interview.interview_type) {
              case 'recruiter':
                  typeClass = 'bg-primary text-white';
                  break;
              case 'partner':
                  typeClass = 'bg-success text-white';
                  break;
              case 'client':
                  typeClass = 'bg-warning text-white';
                  break;
              default:
                  typeClass = 'bg-gray-500 text-white';
          }
          
          const interviewCard = document.createElement('div');
          interviewCard.className = 'p-6.5';

          interviewCard.innerHTML = `
              <div class="flex flex-col gap-4">
                  <div class="flex flex-wrap items-center justify-between gap-3">
                      <div class="flex items-center gap-3">
                          <h4 class="text-xl font-semibold text-black dark:text-white hover:text-primary cursor-pointer" 
                              onclick="getJob(${interview.idJob})">
                              ${interview.job || 'No Job Title'}
                          </h4>
                          <span class="inline-flex rounded px-2.5 py-1 text-sm font-medium ${typeClass}">
                              ${typeLabel}
                          </span>
                      </div>
                      
                  </div>

                  <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                      <h5 class="font-medium text-black dark:text-white mb-2">
                          Interviewer: ${interview.interviewer_name || 'Not Specified'}
                      </h5>
                      <h4 class="font-medium text-black dark:text-white mb-2">
                          Comments :${interview.notesInterview || 'No notes provided'}
                      </h4>
                      <p class="text-gray-500 dark:text-gray-400 mt-2">
                          Date of Interview: ${interview.dateInterview || 'No Date Provided'}
                      </p>
                  </div>
              </div>
          `;

          interviewContainer.appendChild(interviewCard);
      });
  })
  .catch(function (error) {
      console.error("Error:", error);
      const interviewContainer = document.getElementById("interviewContainer");
      interviewContainer.innerHTML = `
        <div class="p-6.5 text-center text-red-500">
          Failed to load interview data. Error: ${error.message}
        </div>
      `;
  });

  // Update navigation buttons
  document.getElementById("pf-btn").className = 
      "rounded px-3 py-1 text-xs font-medium text-black hover:bg-white hover:shadow-card dark:text-white dark:hover:bg-boxdark";
  document.getElementById("hr-btn").className = 
      "rounded px-3 py-1 text-xs font-medium text-black hover:bg-white hover:shadow-card dark:text-white dark:hover:bg-boxdark";
  document.getElementById("app-btn").className = 
      "rounded px-3 py-1 text-xs font-medium text-black hover:bg-white hover:shadow-card dark:text-white dark:hover:bg-boxdark";
  document.getElementById("stat-btn").className = 
      "rounded px-3 py-1 text-xs font-medium text-black hover:bg-white hover:shadow-card dark:text-white dark:hover:bg-boxdark";
  document.getElementById("inter-btn").className = 
      "rounded bg-white px-3 py-1 text-xs font-medium text-black shadow-card hover:bg-white hover:shadow-card dark:bg-boxdark dark:text-white dark:hover:bg-boxdark";
}

function loadValidationUpdates() {
  apiClient.get(`/api/val-service/${candidateData.id_candidate}/`)
      .then(response => {
          const updates = response.data.updates;
          const container = document.getElementById('valService');
          
          // Clear existing validation cards except the first one
          const existingCards = container.querySelectorAll('.validation-card');
          existingCards.forEach((card, index) => {
              if (index > 0) card.remove();
          });

          updates.forEach((update, index) => {
              if (index === 0) {
                  // Update the current form with latest data
                  document.getElementById('date1').value = update.data.date || '';
                  document.getElementById('validatedBy1').value = update.data.validated_by || '';
                  document.getElementById('evaluation1').value = update.data.evaluation || '';
                  document.getElementById('user1').textContent = update.user_name;
              } else {
                  // Create history cards for previous updates
                  const card = document.createElement('div');
                  card.className = 'validation-card mb-8 rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark';
                  card.innerHTML = `
                      <div class="border-b border-stroke px-7 py-4 dark:border-strokedark">
                          <h3 class="font-medium text-black dark:text-white">
                              Previous Validation Service Update
                          </h3>
                      </div>
                      <div class="p-7">
                          <div class="mb-5.5">
                              <label class="mb-3 block text-sm font-medium text-black dark:text-white">Date</label>
                              <input readonly value="${update.data.date || ''}"
                                  class="w-full rounded border border-stroke px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:text-white dark:focus:border-primary" />
                          </div>
                          <div class="mb-5.5">
                              <label class="mb-3 block text-sm font-medium text-black dark:text-white">Validé par</label>
                              <input readonly value="${update.data.validated_by || ''}"
                                  class="w-full rounded border border-stroke px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:text-white dark:focus:border-primary" />
                          </div>
                          <div class="mb-5.5">
                              <label class="mb-3 block text-sm font-medium text-black dark:text-white">Evaluation</label>
                              <textarea readonly
                                  class="w-full rounded border border-stroke px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:text-white dark:focus:border-primary"
                                  rows="6">${update.data.evaluation || ''}</textarea>
                          </div>
                          <div class="flex justify-end">
                              <span class="text-sm text-gray-600">Updated by ${update.user_name}</span>
                          </div>
                      </div>
                  `;
                  container.appendChild(card);
              }
          });
      })
      .catch(error => {
          console.error('Error loading validation updates:', error);
      });
}
function load_HR_Management() {
  // First, ensure we remove any existing content
  const existingContent = document.querySelectorAll("#profile-cdd");
  existingContent.forEach(element => element.remove());
  
  // Create new container only once
  const targetDiv = document.createElement("div");
  targetDiv.id = "profile-cdd";
  targetDiv.className = "mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10";
  
  const main_content = document.getElementById("main-content");
  if (!main_content) {
    console.error("Main content container not found");
    return;
  }

  // Use a single promise chain for all operations
  fetch("management.html")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.text();
    })
    .then((data) => {
      console.log("HR management template fetched");
      
      // Set content only once
      targetDiv.innerHTML = data;
      main_content.appendChild(targetDiv);

      // Initialize components after DOM is ready
      return new Promise(resolve => {
        setTimeout(() => {
          initializeDatePickers();
          edit = false;
          hrManagement = candidateData.hrManagement || {};
          
          // Load initial form values
          const setFormValue = (id, value) => {
            const element = document.getElementById(id);
            if (element && value !== undefined && value !== null) {
              element.value = value;
            }
          };

          // Set initial values if they exist
          if (hrManagement.hr) {
            setFormValue("contractLocation", hrManagement.hr.contractLocation);
            if (hrManagement.hr.contractLocation) {
              setContractType(hrManagement.hr.contractLocation);
            }
            setFormValue("administrativeRegularity", hrManagement.hr.administrativeRegularity);
            setFormValue("PériodeDePréavis", hrManagement.hr.PériodeDePréavis);
            setFormValue("salaryExpectation", hrManagement.hr.salaryExpectation);
            setFormValue("previousSalary", hrManagement.hr.previousSalary);
            setFormValue("integrationDate", hrManagement.hr.integrationDate);
          }

          resolve();
        }, 100);
      });
    })
    .then(() => {
      // Load all histories AFTER the main content is set
      return Promise.all([
        loadHRUpdates(),
        loadValidationHistory(),
        loadTechnicValidationHistory(),
        loadDirectionValidationHistory()
      ]);
    })
    .catch((error) => {
      console.error("Error in HR Management loading:", error);
      //showError("");
    });

  // Update navigation buttons
  const buttons = {
    "pf-btn": "rounded px-3 py-1 text-xs font-medium text-black hover:bg-white hover:shadow-card dark:text-white dark:hover:bg-boxdark",
    "hr-btn": "rounded bg-white px-3 py-1 text-xs font-medium text-black shadow-card hover:bg-white hover:shadow-card dark:bg-boxdark dark:text-white dark:hover:bg-boxdark",
    "app-btn": "rounded px-3 py-1 text-xs font-medium text-black hover:bg-white hover:shadow-card dark:text-white dark:hover:bg-boxdark",
    "stat-btn": "rounded px-3 py-1 text-xs font-medium text-black hover:bg-white hover:shadow-card dark:text-white dark:hover:bg-boxdark",
    "inter-btn": "rounded px-3 py-1 text-xs font-medium text-black hover:bg-white hover:shadow-card dark:text-white dark:hover:bg-boxdark"
  };

  Object.entries(buttons).forEach(([id, className]) => {
    const button = document.getElementById(id);
    if (button) button.className = className;
  });
}

function initializeDatePickers() {
  const dateInputs = document.querySelectorAll(".form-datepicker"); // Select date input elements

  dateInputs.forEach((input) => {
    flatpickr(input, {
      // Options for the date picker (e.g., date format)
      defaultDate: input.value || null,
      onOpen: function (selectedDates, dateStr, instance) {
        // Set the datepicker to the current value of the input
        instance.setDate(input.value || '', false); // false prevents triggering the change event
      },
      onChange: function (selectedDates, dateStr) {
        input.value = dateStr; // Update the input field when a date is selected
      },
      dateFormat: "Y-m-d",
      allowInput: true,
      static: true
    });
  });
}



let blobUrl;
function openPDF() {
  apiClient
    .get(`/api/getcv/${candidateData.id_candidate}/`,
      {
        withCredentials: true,
      }
    )
    .then(function (response) {
      console.log("iddd:", candidateData.id_candidate);
      console.log(response.data);
      const base64String = response.data.file_data.resume_file;
      console.log(base64String);
      // const byteCharacters = atob(base64String);
      // const byteNumbers = new Array(byteCharacters.length);
      // for (let i = 0; i < byteCharacters.length; i++) {
      //   byteNumbers[i] = byteCharacters.charCodeAt(i);
      // }
      // const byteArray = new Uint8Array(byteNumbers);

      // // Create a Blob from the byte array
      // const blob = new Blob([byteArray], { type: 'application/pdf' });

      // Create a URL for the Blob

      document.getElementById(
        "pdfFrame"
      ).src = `data:application/pdf;base64,${base64String}`;
      // Display the modal
      document.getElementById("pdfModal").style.display = "block";
      // Return the blobUrl
    })
    .catch(function (error) {
      console.error("Error:", error);
      alert("Failed to submit the form. Please try again.");
    });
}

// document.getElementById('pdfFrame').src = "doccc_3.pdf";

function closePDF() {
  document.getElementById("pdfModal").style.display = "none";
}
function createTempNote(message) {
  const container = document.createElement("div");
  container.dataset.id = `temp-${Date.now()}`;
  container.className = "flex flex-col mt-4 p-4 border-b border-stroke dark:border-strokedark";

  const username = localStorage.getItem('username') || 'Current User';
  
  container.innerHTML = `
    <div class="font-medium text-purple-800 mb-1">${username}</div>
    <div class="text-purple-800 mb-2">${message}</div>
    <div class="flex justify-end gap-x-2">
      <a href="javascript:void(0)" class="cursor-pointer hover:text-primary opacity-50">delete</a>
      <div class="text-gray-600">${new Date().toLocaleString()}</div>
    </div>
  `;

  return container;
}

function updateNoteElement(element, noteData) {
  if (!element) return;
  
  element.dataset.id = noteData.id;
  
  // Update the delete link
  const deleteLink = element.querySelector('a');
  if (deleteLink) {
    deleteLink.classList.remove('opacity-50');
    deleteLink.onclick = () => deleteNote(noteData.id);
  }

  // Update timestamp if provided
  if (noteData.added_at) {
    const timeDiv = element.querySelector('.text-gray-600');
    if (timeDiv) {
      timeDiv.textContent = noteData.added_at;
    }
  }
}
async function refreshCandidateData(candidateId) {
  try {
    console.log("Starting refreshCandidateData for candidate:", candidateId);

    // Validate candidate ID
    if (!candidateId) {
      console.error("Invalid candidate ID:", candidateId);
      return;
    }

    const response = await apiClient.get(`/api/get-candidate/${candidateId}/`, {
      withCredentials: true,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    });
    
    // Validate response data
    if (!response.data) {
      throw new Error("Empty response data");
    }

    console.log("Received candidate data:", response.data);

    // Update local storage and global variables
    localStorage.setItem('responseData', JSON.stringify(response.data));
    localStorage.setItem("profileData", JSON.stringify(response.data));
    
    // Update global variables with validation
    if (response.data.candidateData) {
      candidateData = response.data.candidateData;
    }
    if (Array.isArray(response.data.Notes)) {
      notes = response.data.Notes;
    }
    
    console.log("Successfully refreshed candidate data");

  } catch (error) {
    console.error("Error refreshing candidate data:", error);
    if (error.response) {
      console.error("Error response data:", error.response.data);
      console.error("Error response status:", error.response.status);
      console.error("Error response headers:", error.response.headers);
    }

    // Try to recover using existing data if refresh fails
    try {
      const existingData = JSON.parse(localStorage.getItem('responseData'));
      if (existingData && existingData.candidateData) {
        console.log("Using cached candidate data");
        candidateData = existingData.candidateData;
        notes = existingData.Notes || [];
        return;
      }
    } catch (cacheError) {
      console.error("Could not recover from cache:", cacheError);
    }
  }
}
function addNote(e) {
  e.preventDefault();
  const message = document.getElementById("messageArea").value;
  
  // Validate inputs with better error messaging
  if (!message || !message.trim()) {
    console.log("Note validation failed: empty message");
    alert("Please enter a note message");
    return;
  }

  if (!candidateData || !candidateData.id_candidate) {
    console.error("Missing candidate ID", candidateData);
    alert("Error: Cannot add note - missing candidate information");
    return;
  }

  // Prepare the note data
  const noteData = {
    content: message.trim(),
    candidate: candidateData.id_candidate,
  };

  // Log the request data for debugging
  console.log("Sending note data:", noteData);

  apiClient
    .post("/api/post-note/", noteData, {
      withCredentials: true,
      headers: {
        'X-CSRFToken': Cookies.get('csrftoken'),
        'Content-Type': 'application/json'
      },
    })
    .then(function (response) {
      console.log("Note addition response:", response);
      
      if (response.data) {
        const note = response.data;
        
        // Clear the message area
        document.getElementById("messageArea").value = "";

        // Add the new note to the UI
        const notesContainer = document.getElementById("notesContainer");
        const container = document.createElement("div");
        container.dataset.id = note.id;
        container.className = "flex flex-col mt-4 p-4 border-b border-stroke dark:border-strokedark";
        
        container.innerHTML = `
          <div class="font-medium text-purple-800 mb-1">${note.recruiter}</div>
          <div class="text-purple-800 mb-2">${message}</div>
          <div class="flex justify-end gap-x-2">
            <a href="javascript:void(0)" onclick="deleteNote(${note.id})">delete</a>
            <div class="text-gray-600">${note.added_at}</div>
          </div>
        `;
        
        notesContainer.insertBefore(container, notesContainer.firstChild);

        // Update the notes array
        if (!notes) {
          notes = [];
        }
        notes.unshift(note);

        // Try to refresh the candidate data
        try {
          refreshCandidateData(candidateData.id_candidate)
            .catch(error => {
              console.warn("Non-critical error refreshing data:", error);
              // Note was still added successfully, so we don't show error to user
            });
        } catch (error) {
          console.warn("Error initiating refresh:", error);
        }
      }
    })
    .catch(function (error) {
      console.error("Error adding note:", error);
      console.error("Error details:", error.response?.data);
      console.error("Error status:", error.response?.status);
      
      let errorMessage = "Failed to add note. ";
      if (error.response?.data?.error) {
        errorMessage += error.response.data.error;
      } else if (error.response?.status === 403) {
        errorMessage += "Permission denied. Please check your login status.";
      } else if (error.response?.status === 500) {
        errorMessage += "Server error. Please try again later.";
      }
      
      alert(errorMessage);
      
      // Preserve the user's input in case they want to try again
      document.getElementById("messageArea").value = message;
    });
}

function deleteNote(id) {
  apiClient
    .delete(`/api/delete-note/${id}/`,
      {
        withCredentials: true,
        headers: {
          'X-CSRFToken': Cookies.get('csrftoken'),  // Manually extract the CSRF token
        },
      }
    )
    .then((response) => {
      if (response.status === 204) {
        // 204 No Content means successful deletion
        console.log("Deleted:", response);
        // Find the row element in the DOM and remove it
        const noteToRemove = document.querySelector(`[data-id="${id}"]`);
        if (noteToRemove) {
          noteToRemove.remove();
        }
      }
    });
}

function onChange(event) {
  if (!event || !event.target) return;
  this.isOptionSelected = true;
  const item = event.target.value;
  setContractType(item);
}

function setContractType(item) {
  const contract = document.getElementById('contract-type-div');
  if (!contract) return; // Guard clause to prevent errors if element doesn't exist
  
  let contractHTML = '';
  
  switch(item) {
    case 'Fr':
      contractHTML = `
        <div>
          <label class="mb-3 block text-sm font-medium text-black dark:text-white">
            Type de Contrat
          </label>
          <div x-data="{ isOptionSelected: false, selectedContract: '${hrManagement?.hr?.contractType || ''}' }" class="relative z-20 bg-white dark:bg-form-input">
            <select x-model="selectedContract" name="contractType" id="contractType"
              class="relative z-20 w-full appearance-none rounded border border-stroke py-3 pl-5 pr-12 outline-none transition focus:border-gray active:border-primary dark:border-form-strokedark dark:bg-form-input"
              :class="isOptionSelected && 'text-black dark:text-white'" @change="isOptionSelected = true">
              <option value="salarié" class="text-body">salarié</option>
              <option value="freelance" class="text-body">Freelance</option>
              <option value="portage" class="text-body">Portage</option>
            </select>
            <span id="svg_dropdown" class="absolute right-4 top-1/2 z-10 -translate-y-1/2">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g opacity="0.8">
                  <path fill-rule="evenodd" clip-rule="evenodd"
                    d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"
                    fill="#637381"></path>
                </g>
              </svg>
            </span>
          </div>
        </div>`;
      break;
      
    case 'Tn':
      contractHTML = `
        <div>
          <label class="mb-3 block text-sm font-medium text-black dark:text-white">
            Type de Contrat
          </label>
          <div x-data="{ isOptionSelected: false, selectedContract: '${hrManagement?.hr?.contractType || ''}' }" class="relative z-20 bg-white dark:bg-form-input">
            <select x-model="selectedContract" name="contractType" id="contractType"
              class="relative z-20 w-full appearance-none rounded border border-stroke py-3 pl-5 pr-12 outline-none transition focus:border-gray active:border-primary dark:border-form-strokedark dark:bg-form-input"
              :class="isOptionSelected && 'text-black dark:text-white'" @change="isOptionSelected = true">
              <option value="integration" class="text-body">CDD</option>
              <option value="salarié_mission" class="text-body">CDI</option>
              <option value="cbe" class="text-body">Freelance</option>
            </select>
            <span id="svg_dropdown" class="absolute right-4 top-1/2 z-10 -translate-y-1/2">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g opacity="0.8">
                  <path fill-rule="evenodd" clip-rule="evenodd"
                    d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"
                    fill="#637381"></path>
                </g>
              </svg>
            </span>
          </div>
        </div>`;
      break;
      
    case 'Me':
      contractHTML = `
        <div>
          <label class="mb-3 block text-sm font-medium text-black dark:text-white">
            Type de Contrat
          </label>
          <div x-data="{ isOptionSelected: false, selectedContract: '${hrManagement?.hr?.contractType || ''}' }" class="relative z-20 bg-white dark:bg-form-input">
            <select x-model="selectedContract" name="contractType" id="contractType"
              class="relative z-20 w-full appearance-none rounded border border-stroke py-3 pl-5 pr-12 outline-none transition focus:border-gray active:border-primary dark:border-form-strokedark dark:bg-form-input"
              :class="isOptionSelected && 'text-black dark:text-white'" @change="isOptionSelected = true">
              <option value="cdd" class="text-body">CDD</option>
              <option value="cdi" class="text-body">CDI</option>
              <option value="freelance_me" class="text-body">Freelance</option>
            </select>
            <span id="svg_dropdown" class="absolute right-4 top-1/2 z-10 -translate-y-1/2">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g opacity="0.8">
                  <path fill-rule="evenodd" clip-rule="evenodd"
                    d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"
                    fill="#637381"></path>
                </g>
              </svg>
            </span>
          </div>
        </div>`;
      break;
      
    default:
      console.warn('Unknown contract location:', item);
      return;
  }
  
  contract.innerHTML = contractHTML;
  
  // After updating the HTML, get the new elements
  const contractType = document.getElementById("contractType");
  const svg_dropdown = document.getElementById("svg_dropdown");
  
  if (!contractType || !svg_dropdown) return;
  
  if (!edit) {
    contractType.classList.add("pointer-events-none", "bg-transparent");
    svg_dropdown.classList.remove("hidden");
  } else {
    contractType.classList.remove("pointer-events-none", "bg-transparent");
    contractType.classList.add("bg-gray");
    svg_dropdown.classList.remove("hidden");
  }
}

function toggleEditHRManagement() {
  edit = true;
  // Select all input and select elements
  const container = document.getElementById("hr-management");

  // Select all input and select elements within the container
  const elements = container.querySelectorAll("input, select, textarea");

  // Loop through each element and apply the classes
  elements.forEach(element => {
    element.classList.remove("pointer-events-none", "bg-transparent", "hover:cursor-default", "focus:cursor-default");
    element.classList.add("bg-gray", "focus:border-primary");
    element.removeAttribute("readonly");
  });

  // Select all SVG elements within the container and remove the 'hidden' class
  const svgs = container.querySelectorAll("svg");
  svgs.forEach(svg => {
    svg.classList.remove("hidden");
  });
  document.getElementById("hrFormBtn").classList.remove("hidden");

  // console.log("toggle here");
  // const contractLocation = document.getElementById("contractLocation");
  // contractLocation.classList.remove("bg-transparent", "pointer-events-none");
  // contractLocation.classList.add("bg-gray");
  // const contractType = document.getElementById("contractType");
  // setContractType(candidateData.contract_type);
  // const salaryExpectation = document.getElementById("salaryExpectation");
  // salaryExpectation.classList.remove("focus:border-gray", "focus:cursor-default", "hover:cursor-default");
  // salaryExpectation.classList.add("bg-gray", "focus:border-primary");
  // salaryExpectation.removeAttribute("readonly");
  // const previousSalary = document.getElementById("previousSalary");
  // previousSalary.classList.remove("focus:border-gray", "focus:cursor-default", "hover:cursor-default");
  // previousSalary.classList.add("bg-gray", "focus:border-primary");
  // previousSalary.removeAttribute("readonly");
  // const integrationDate = document.getElementById("integrationDate");
  // integrationDate.classList.remove("pointer-events-none", "bg-transparent");
  // integrationDate.classList.add("bg-gray");
  // const svg = document.getElementById("svg");
  // svg.classList.remove("hidden");
  // const leaveBalance = document.getElementById("leaveBalance");
  // leaveBalance.classList.remove("focus:border-gray", "focus:cursor-default", "hover:cursor-default");
  // leaveBalance.classList.add("bg-gray", "focus:border-primary");
  // leaveBalance.removeAttribute("readonly");

  // const date1 = document.getElementById("date1");
  // date1.classList.remove("pointer-events-none", "bg-transparent");
  // date1.classList.add("bg-gray");
  // const svg1 = document.getElementById("svg1");
  // svg1.classList.remove("hidden");
  // const validatedBy1 = document.getElementById("validatedBy1");
  // validatedBy1.classList.remove("focus:border-gray", "focus:cursor-default", "hover:cursor-default");
  // validatedBy1.classList.add("bg-gray", "focus:border-primary");
  // validatedBy1.removeAttribute("readonly");
  // const evaluation1 = document.getElementById("evaluation1");
  // evaluation1.classList.remove("focus:border-gray", "focus:cursor-default", "hover:cursor-default");
  // evaluation1.classList.add("bg-gray", "focus:border-primary");
  // evaluation1.removeAttribute("readonly");

  // const date2 = document.getElementById("date2");
  // date2.classList.remove("pointer-events-none", "bg-transparent");
  // date2.classList.add("bg-gray");
  // const svg2 = document.getElementById("svg2");
  // svg2.classList.remove("hidden");
  // const validatedBy2 = document.getElementById("validatedBy2");
  // validatedBy2.classList.remove("focus:border-gray", "focus:cursor-default", "hover:cursor-default");
  // validatedBy2.classList.add("bg-gray", "focus:border-primary");
  // validatedBy2.removeAttribute("readonly");
  // const evaluation2 = document.getElementById("evaluation2");
  // evaluation2.classList.remove("focus:border-gray", "focus:cursor-default", "hover:cursor-default");
  // evaluation2.classList.add("bg-gray", "focus:border-primary");
  // evaluation2.removeAttribute("readonly");

  // const date3 = document.getElementById("date3");
  // date3.classList.remove("pointer-events-none", "bg-transparent");
  // date3.classList.add("bg-gray");
  // const svg3 = document.getElementById("svg3");
  // svg3.classList.remove("hidden");
  // const validatedBy3 = document.getElementById("validatedBy3");
  // validatedBy3.classList.remove("focus:border-gray", "focus:cursor-default", "hover:cursor-default");
  // validatedBy3.classList.add("bg-gray", "focus:border-primary");
  // validatedBy3.removeAttribute("readonly");
  // const evaluation3 = document.getElementById("evaluation3");
  // evaluation3.classList.remove("focus:border-gray", "focus:cursor-default", "hover:cursor-default");
  // evaluation3.classList.add("bg-gray", "focus:border-primary");
  // evaluation3.removeAttribute("readonly");
}

function toggleEditValService() {
      // Get today's date
      const today = new Date();
      const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      
      // Set the placeholder to today's date
      document.getElementById('date1').placeholder = formattedDate;
      document.getElementById('date1').value = formattedDate;
  const valService = document.getElementById("valService");
  const elements = valService.querySelectorAll("input, select, textarea");
  elements.forEach(element => {
    element.classList.remove("pointer-events-none", "bg-transparent", "hover:cursor-default", "focus:cursor-default");
    element.classList.add("bg-gray", "focus:border-primary");
    element.removeAttribute("readonly");
  });

  // Select all SVG elements within the container and remove the 'hidden' class
  const svgs = valService.querySelectorAll("svg");
  svgs.forEach(svg => {
    svg.classList.remove("hidden");
  });
  document.getElementById("form1Btn").classList.remove("hidden");

}

function toggleEditValTechnic() {
      // Get today's date
      const today = new Date();
      const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  
      // Set the placeholder to today's date
      document.getElementById('date2').placeholder = formattedDate;
      document.getElementById('date2').value = formattedDate;
  const valTechnic = document.getElementById("valTechnic");
  const elements = valTechnic.querySelectorAll("input, select, textarea");
  elements.forEach(element => {
    element.classList.remove("pointer-events-none", "bg-transparent", "hover:cursor-default", "focus:cursor-default");
    element.classList.add("bg-gray", "focus:border-primary");
    element.removeAttribute("readonly");
  });

  // Select all SVG elements within the container and remove the 'hidden' class
  const svgs = valTechnic.querySelectorAll("svg");
  svgs.forEach(svg => {
    svg.classList.remove("hidden");
  });
  document.getElementById("form2Btn").classList.remove("hidden");
}

function toggleEditValDirection() {
      // Get today's date
      const today = new Date();
      const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  
      // Set the placeholder to today's date
      document.getElementById('date3').placeholder = formattedDate;
      document.getElementById('date3').value = formattedDate;

  const valDirection = document.getElementById("valDirection");
  const elements = valDirection.querySelectorAll("input, select, textarea");
  elements.forEach(element => {
    element.classList.remove("pointer-events-none", "bg-transparent", "hover:cursor-default", "focus:cursor-default");
    element.classList.add("bg-gray", "focus:border-primary");
    element.removeAttribute("readonly");
  });

  // Select all SVG elements within the container and remove the 'hidden' class
  const svgs = valDirection.querySelectorAll("svg");
  svgs.forEach(svg => {
    svg.classList.remove("hidden");
  });
  document.getElementById("form3Btn").classList.remove("hidden");
}

function toggleDisplayValService() {
  const valService = document.getElementById("valService");
  const elements = valService.querySelectorAll("input, select, textarea");
  elements.forEach(element => {
    element.classList.add("pointer-events-none", "bg-transparent", "hover:cursor-default", "focus:cursor-default");
    element.classList.remove("bg-gray", "focus:border-primary");
  });

  // Select all SVG elements within the container and remove the 'hidden' class
  const svgs = valService.querySelectorAll("svg");
  svgs.forEach(svg => {
    svg.classList.add("hidden");
  });
  document.getElementById("form1Btn").classList.add("hidden");
}

function toggleDisplayValTechnic() {
  const valTechnic = document.getElementById("valTechnic");
  const elements = valTechnic.querySelectorAll("input, select, textarea");
  elements.forEach(element => {
    element.classList.add("pointer-events-none", "bg-transparent", "hover:cursor-default", "focus:cursor-default");
    element.classList.remove("bg-gray", "focus:border-primary");
  });

  // Select all SVG elements within the container and remove the 'hidden' class
  const svgs = valTechnic.querySelectorAll("svg");
  svgs.forEach(svg => {
    svg.classList.add("hidden");
  });
  document.getElementById("form2Btn").classList.add("hidden");
}

function toggleDisplayValDirection() {
  const valDirection = document.getElementById("valDirection");
  const elements = valDirection.querySelectorAll("input, select, textarea");
  elements.forEach(element => {
    element.classList.add("pointer-events-none", "bg-transparent", "hover:cursor-default", "focus:cursor-default");
    element.classList.remove("bg-gray", "focus:border-primary");
  });

  // Select all SVG elements within the container and remove the 'hidden' class
  const svgs = valDirection.querySelectorAll("svg");
  svgs.forEach(svg => {
    svg.classList.add("hidden");
  });
  document.getElementById("form3Btn").classList.add("hidden");
}

function toggleDisplayHRManagement() {
  edit = true;
  // Select all input and select elements
  const container = document.getElementById("hr-management");

  // Select all input and select elements within the container
  const elements = container.querySelectorAll("input, select, textarea");

  // Loop through each element and apply the classes
  elements.forEach(element => {
    element.classList.add("pointer-events-none", "bg-transparent", "hover:cursor-default", "focus:cursor-default");
    element.classList.remove("bg-gray", "focus:border-primary");
  });

  // Select all SVG elements within the container and remove the 'hidden' class
  const svgs = container.querySelectorAll("svg");
  svgs.forEach(svg => {
    svg.classList.add("hidden");
  });
  document.getElementById("hrFormBtn").classList.add("hidden");
}

function saveValService() {
  const combinedFormData = new FormData();
  var dt = {};
  const form = document.getElementById("form1");
  const formData = new FormData(form);
  
  // Get current form data
  for (let [key, value] of formData.entries()) {
    dt[key] = value;
  }

  apiClient
    .patch(`/api/val-service/${candidateData.id_candidate}/`, dt,
      {
        withCredentials: true,
        headers: {
          'X-CSRFToken': Cookies.get('csrftoken'),
        },
      }
    )
    .then((response) => {
      console.log("Data updated successfully:", response.data);
      if (response.status == 200) {
        // Store current form values
        const currentData = {
          date1: document.getElementById('date1').value,
          validatedBy1: document.getElementById('validatedBy1').value,
          evaluation1: document.getElementById('evaluation1').value,
          user1: localStorage.getItem("username")
        };

        // Add to candidateData if it doesn't exist
        if (!candidateData.validationHistory) {
          candidateData.validationHistory = [];
        }
        candidateData.validationHistory.push({
          ...currentData,
          timestamp: new Date().toISOString()
        });

        // Create new validation card for history
        const historyContainer = document.getElementById('validation-history-service');
        const historyCard = document.createElement('div');
        historyCard.className = 'mb-6 p-4 bg-gray-50 rounded-sm border border-stroke dark:border-strokedark dark:bg-meta-4';
        historyCard.innerHTML = `
          <div class="mb-3">
            <label class="mb-2 block text-sm font-medium text-black dark:text-white">Date</label>
            <p class="text-sm text-gray-600 dark:text-gray-400">${currentData.date1}</p>
          </div>
          <div class="mb-3">
            <label class="mb-2 block text-sm font-medium text-black dark:text-white">Validé par</label>
            <p class="text-sm text-gray-600 dark:text-gray-400">${currentData.validatedBy1}</p>
          </div>
          <div class="mb-3">
            <label class="mb-2 block text-sm font-medium text-black dark:text-white">Evaluation</label>
            <p class="text-sm text-gray-600 dark:text-gray-400">${currentData.evaluation1}</p>
          </div>
          <div class="text-right text-sm text-gray-500">
            Validated by ${currentData.user1} on ${new Date().toLocaleString()}
          </div>
        `;

        // Add the new history card after the "Previous Validations" heading
        const heading = historyContainer.querySelector('h4');
        if (heading) {
          heading.insertAdjacentElement('afterend', historyCard);
        } else {
          historyContainer.appendChild(historyCard);
        }

        // Update the current user display
        document.getElementById("user1").textContent = currentData.user1;
        toggleDisplayValService();
      }
    })
    .catch((error) => {
      console.error("Error updating data:", error);
    });
}
function loadValidationHistory() {
  const container = document.getElementById('validation-history-service');
  if (!container) return;
  

  // Clear container but keep the heading
  container.innerHTML = `
  <h4 class="mb-6 text-xl font-semibold text-black dark:text-white">
    Previous Validations
  </h4>
`;

  // Load all previous validations if they exist
  if (candidateData.validationHistory) {
    candidateData.validationHistory.forEach(validation => {
      const historyCard = document.createElement('div');
      historyCard.className = 'mb-6 p-4 bg-gray-50 rounded-sm border border-stroke dark:border-strokedark dark:bg-meta-4';
      historyCard.innerHTML = `
        <div class="mb-3">
          <label class="mb-2 block text-sm font-medium text-black dark:text-white">Date</label>
          <p class="text-sm text-gray-600 dark:text-gray-400">${validation.date1 || ''}</p>
        </div>
        <div class="mb-3">
          <label class="mb-2 block text-sm font-medium text-black dark:text-white">Validé par</label>
          <p class="text-sm text-gray-600 dark:text-gray-400">${validation.validatedBy1 || ''}</p>
        </div>
        <div class="mb-3">
          <label class="mb-2 block text-sm font-medium text-black dark:text-white">Evaluation</label>
          <p class="text-sm text-gray-600 dark:text-gray-400">${validation.evaluation1 || ''}</p>
        </div>
        <div class="text-right text-sm text-gray-500">
          Validated by ${validation.user1 || ''} 
          ${validation.timestamp ? `on ${new Date(validation.timestamp).toLocaleString()}` : ''}
        </div>
      `;
      historyContainer.appendChild(historyCard);
    });
  }

  // Also add the initial validation if it exists
  if (candidateData.hrManagement?.valService) {
    const initialValidation = candidateData.hrManagement.valService;
    if (initialValidation.date1 || initialValidation.validatedBy1 || initialValidation.evaluation1) {
      const historyCard = document.createElement('div');
      historyCard.className = 'mb-6 p-4 bg-gray-50 rounded-sm border border-stroke dark:border-strokedark dark:bg-meta-4';
      historyCard.innerHTML = `
        <div class="mb-3">
          <label class="mb-2 block text-sm font-medium text-black dark:text-white">Date</label>
          <p class="text-sm text-gray-600 dark:text-gray-400">${initialValidation.date1 || ''}</p>
        </div>
        <div class="mb-3">
          <label class="mb-2 block text-sm font-medium text-black dark:text-white">Validé par</label>
          <p class="text-sm text-gray-600 dark:text-gray-400">${initialValidation.validatedBy1 || ''}</p>
        </div>
        <div class="mb-3">
          <label class="mb-2 block text-sm font-medium text-black dark:text-white">Evaluation</label>
          <p class="text-sm text-gray-600 dark:text-gray-400">${initialValidation.evaluation1 || ''}</p>
        </div>
        <div class="text-right text-sm text-gray-500">
          Initial validation by ${initialValidation.user1 || ''}
        </div>
      `;
      historyContainer.appendChild(historyCard);
    }
  }
}
function saveValTechnic() {
  const form = document.getElementById("form2");
  const formData = new FormData(form);
  const dt = {};
  
  for (let [key, value] of formData.entries()) {
    dt[key] = value;
  }

  apiClient
    .patch(`/api/val-technic/${candidateData.id_candidate}/`, dt, {
      withCredentials: true,
      headers: {
        'X-CSRFToken': Cookies.get('csrftoken'),
      },
    })
    .then((response) => {
      console.log("Data updated successfully:", response.data);
      if (response.status === 200) {
        // Store current form values
        const currentData = {
          date2: document.getElementById('date2').value,
          validatedBy2: document.getElementById('validatedBy2').value,
          evaluation2: document.getElementById('evaluation2').value,
          user2: localStorage.getItem("username")
        };

        // Add to history if it doesn't exist
        if (!candidateData.technicValidationHistory) {
          candidateData.technicValidationHistory = [];
        }
        candidateData.technicValidationHistory.push({
          ...currentData,
          timestamp: new Date().toISOString()
        });

        // Create new history card
        const historyContainer = document.getElementById('validation-history-technic');
        const historyCard = document.createElement('div');
        historyCard.className = 'mb-6 p-4 bg-gray-50 rounded-sm border border-stroke dark:border-strokedark dark:bg-meta-4';
        historyCard.innerHTML = `
          <div class="mb-3">
            <label class="mb-2 block text-sm font-medium text-black dark:text-white">Date</label>
            <p class="text-sm text-gray-600 dark:text-gray-400">${currentData.date2}</p>
          </div>
          <div class="mb-3">
            <label class="mb-2 block text-sm font-medium text-black dark:text-white">Validé par</label>
            <p class="text-sm text-gray-600 dark:text-gray-400">${currentData.validatedBy2}</p>
          </div>
          <div class="mb-3">
            <label class="mb-2 block text-sm font-medium text-black dark:text-white">Evaluation</label>
            <p class="text-sm text-gray-600 dark:text-gray-400">${currentData.evaluation2}</p>
          </div>
          <div class="text-right text-sm text-gray-500">
            Validated by ${currentData.user2} on ${new Date().toLocaleString()}
          </div>
        `;

        // Add new history card after heading
        const heading = historyContainer.querySelector('h4');
        if (heading) {
          heading.insertAdjacentElement('afterend', historyCard);
        } else {
          historyContainer.appendChild(historyCard);
        }

        // Update current user display
        document.getElementById("user2").textContent = currentData.user2;
        toggleDisplayValTechnic();
      }
    })
    .catch((error) => {
      console.error("Error updating data:", error);
    });
}
function saveValDirection() {
  const form = document.getElementById("form3");
  const formData = new FormData(form);
  const dt = {};
  
  for (let [key, value] of formData.entries()) {
    dt[key] = value;
  }

  apiClient
    .patch(`/api/val-direction/${candidateData.id_candidate}/`, dt, {
      withCredentials: true,
      headers: {
        'X-CSRFToken': Cookies.get('csrftoken'),
      },
    })
    .then((response) => {
      console.log("Data updated successfully:", response.data);
      if (response.status === 200) {
        // Store current form values
        const currentData = {
          date3: document.getElementById('date3').value,
          validatedBy3: document.getElementById('validatedBy3').value,
          evaluation3: document.getElementById('evaluation3').value,
          user3: localStorage.getItem("username")
        };

        // Add to history if it doesn't exist
        if (!candidateData.directionValidationHistory) {
          candidateData.directionValidationHistory = [];
        }
        candidateData.directionValidationHistory.push({
          ...currentData,
          timestamp: new Date().toISOString()
        });

        // Create new history card
        const historyContainer = document.getElementById('validation-history-direction');
        const historyCard = document.createElement('div');
        historyCard.className = 'mb-6 p-4 bg-gray-50 rounded-sm border border-stroke dark:border-strokedark dark:bg-meta-4';
        historyCard.innerHTML = `
          <div class="mb-3">
            <label class="mb-2 block text-sm font-medium text-black dark:text-white">Date</label>
            <p class="text-sm text-gray-600 dark:text-gray-400">${currentData.date3}</p>
          </div>
          <div class="mb-3">
            <label class="mb-2 block text-sm font-medium text-black dark:text-white">Validé par</label>
            <p class="text-sm text-gray-600 dark:text-gray-400">${currentData.validatedBy3}</p>
          </div>
          <div class="mb-3">
            <label class="mb-2 block text-sm font-medium text-black dark:text-white">Evaluation</label>
            <p class="text-sm text-gray-600 dark:text-gray-400">${currentData.evaluation3}</p>
          </div>
          <div class="text-right text-sm text-gray-500">
            Validated by ${currentData.user3} on ${new Date().toLocaleString()}
          </div>
        `;

        // Add new history card after heading
        const heading = historyContainer.querySelector('h4');
        if (heading) {
          heading.insertAdjacentElement('afterend', historyCard);
        } else {
          historyContainer.appendChild(historyCard);
        }

        // Update current user display
        document.getElementById("user3").textContent = currentData.user3;
        toggleDisplayValDirection();
      }
    })
    .catch((error) => {
      console.error("Error updating data:", error);
    });
}
function loadTechnicValidationHistory() {
  const container = document.getElementById('validation-history-technic');
  if (!container) return;

  container.innerHTML = `
    <h4 class="mb-6 text-xl font-semibold text-black dark:text-white">
      Previous Validations
    </h4>
  `;

  // Load all previous validations if they exist
  if (candidateData.technicValidationHistory) {
    candidateData.technicValidationHistory.forEach(validation => {
      const historyCard = document.createElement('div');
      historyCard.className = 'mb-6 p-4 bg-gray-50 rounded-sm border border-stroke dark:border-strokedark dark:bg-meta-4';
      historyCard.innerHTML = `
        <div class="mb-3">
          <label class="mb-2 block text-sm font-medium text-black dark:text-white">Date</label>
          <p class="text-sm text-gray-600 dark:text-gray-400">${validation.date2 || ''}</p>
        </div>
        <div class="mb-3">
          <label class="mb-2 block text-sm font-medium text-black dark:text-white">Validé par</label>
          <p class="text-sm text-gray-600 dark:text-gray-400">${validation.validatedBy2 || ''}</p>
        </div>
        <div class="mb-3">
          <label class="mb-2 block text-sm font-medium text-black dark:text-white">Evaluation</label>
          <p class="text-sm text-gray-600 dark:text-gray-400">${validation.evaluation2 || ''}</p>
        </div>
        <div class="text-right text-sm text-gray-500">
          Validated by ${validation.user2 || ''} 
          ${validation.timestamp ? `on ${new Date(validation.timestamp).toLocaleString()}` : ''}
        </div>
      `;
      historyContainer.appendChild(historyCard);
    });
  }

  // Add initial validation if it exists
  if (candidateData.hrManagement?.valTechnic) {
    const initialValidation = candidateData.hrManagement.valTechnic;
    if (initialValidation.date2 || initialValidation.validatedBy2 || initialValidation.evaluation2) {
      const historyCard = document.createElement('div');
      historyCard.className = 'mb-6 p-4 bg-gray-50 rounded-sm border border-stroke dark:border-strokedark dark:bg-meta-4';
      historyCard.innerHTML = `
        <div class="mb-3">
          <label class="mb-2 block text-sm font-medium text-black dark:text-white">Date</label>
          <p class="text-sm text-gray-600 dark:text-gray-400">${initialValidation.date2 || ''}</p>
        </div>
        <div class="mb-3">
          <label class="mb-2 block text-sm font-medium text-black dark:text-white">Validé par</label>
          <p class="text-sm text-gray-600 dark:text-gray-400">${initialValidation.validatedBy2 || ''}</p>
        </div>
        <div class="mb-3">
          <label class="mb-2 block text-sm font-medium text-black dark:text-white">Evaluation</label>
          <p class="text-sm text-gray-600 dark:text-gray-400">${initialValidation.evaluation2 || ''}</p>
        </div>
        <div class="text-right text-sm text-gray-500">
          Initial validation by ${initialValidation.user2 || ''}
        </div>
      `;
      historyContainer.appendChild(historyCard);
    }
  }
}

function loadDirectionValidationHistory() {
  const container = document.getElementById('validation-history-direction');
  if (!container) return;

  // Clear container but keep heading
  container.innerHTML = `
    <h4 class="mb-6 text-xl font-semibold text-black dark:text-white">
      Previous Validations
    </h4>
  `;

  // Load all previous validations if they exist
  if (candidateData.directionValidationHistory) {
    candidateData.directionValidationHistory.forEach(validation => {
      const historyCard = document.createElement('div');
      historyCard.className = 'mb-6 p-4 bg-gray-50 rounded-sm border border-stroke dark:border-strokedark dark:bg-meta-4';
      historyCard.innerHTML = `
        <div class="mb-3">
          <label class="mb-2 block text-sm font-medium text-black dark:text-white">Date</label>
          <p class="text-sm text-gray-600 dark:text-gray-400">${validation.date3 || ''}</p>
        </div>
        <div class="mb-3">
          <label class="mb-2 block text-sm font-medium text-black dark:text-white">Validé par</label>
          <p class="text-sm text-gray-600 dark:text-gray-400">${validation.validatedBy3 || ''}</p>
        </div>
        <div class="mb-3">
          <label class="mb-2 block text-sm font-medium text-black dark:text-white">Evaluation</label>
          <p class="text-sm text-gray-600 dark:text-gray-400">${validation.evaluation3 || ''}</p>
        </div>
        <div class="text-right text-sm text-gray-500">
          Validated by ${validation.user3 || ''} 
          ${validation.timestamp ? `on ${new Date(validation.timestamp).toLocaleString()}` : ''}
        </div>
      `;
      historyContainer.appendChild(historyCard);
    });
  }

  // Add initial validation if it exists
  if (candidateData.hrManagement?.valDirection) {
    const initialValidation = candidateData.hrManagement.valDirection;
    if (initialValidation.date3 || initialValidation.validatedBy3 || initialValidation.evaluation3) {
      const historyCard = document.createElement('div');
      historyCard.className = 'mb-6 p-4 bg-gray-50 rounded-sm border border-stroke dark:border-strokedark dark:bg-meta-4';
      historyCard.innerHTML = `
        <div class="mb-3">
          <label class="mb-2 block text-sm font-medium text-black dark:text-white">Date</label>
          <p class="text-sm text-gray-600 dark:text-gray-400">${initialValidation.date3 || ''}</p>
        </div>
        <div class="mb-3">
          <label class="mb-2 block text-sm font-medium text-black dark:text-white">Validé par</label>
          <p class="text-sm text-gray-600 dark:text-gray-400">${initialValidation.validatedBy3 || ''}</p>
        </div>
        <div class="mb-3">
          <label class="mb-2 block text-sm font-medium text-black dark:text-white">Evaluation</label>
          <p class="text-sm text-gray-600 dark:text-gray-400">${initialValidation.evaluation3 || ''}</p>
        </div>
        <div class="text-right text-sm text-gray-500">
          Initial validation by ${initialValidation.user3 || ''}
        </div>
      `;
      historyContainer.appendChild(historyCard);
    }
  }
}

function loadHRUpdates() {
  const container = document.getElementById('hr-management');
  if (!container) {
    console.error('HR management container not found');
    return;
  }

  // Show loading state
  const loadingDiv = document.createElement('div');
  loadingDiv.className = 'text-center py-4';
  loadingDiv.innerHTML = 'Loading HR updates...';
  container.appendChild(loadingDiv);

  apiClient.get(`/api/hrmanagement/${candidateData.id_candidate}/hr/`)
    .then(response => {
      // Remove loading state
      loadingDiv.remove();
      
      const updates = response.data.updates;
      
      // Find active update
      const activeUpdate = updates.find(update => update.is_active);
      if (activeUpdate) {
        // Helper function to safely set form values
        const setFormValue = (id, value) => {
          const element = document.getElementById(id);
          if (element) {
            element.value = value || '';
          }
        };

        // Update form with active data
        setFormValue('contractLocation', activeUpdate.data.contractLocation);
        setFormValue('contractType', activeUpdate.data.contractType);
        setFormValue('salaryExpectation', activeUpdate.data.salaryExpectation);
        setFormValue('previousSalary', activeUpdate.data.previousSalary);
        setFormValue('integrationDate', activeUpdate.data.integrationDate);
        setFormValue('administrativeRegularity', activeUpdate.data.administrativeRegularity);
        setFormValue('PériodeDePréavis', activeUpdate.data.PériodeDePréavis);

        // If there's a contract location, update the contract type dropdown
        if (activeUpdate.data.contractLocation) {
          setContractType(activeUpdate.data.contractLocation);
        }
      }

      // Create or get history section
      let historySection = container.querySelector('#updates-history');
      if (!historySection) {
        historySection = document.createElement('div');
        historySection.id = 'updates-history';
        historySection.className = 'mt-8 border-t border-stroke pt-8 dark:border-strokedark';
        container.appendChild(historySection);
      }

      // Clear existing history
      historySection.innerHTML = `
        <h3 class="text-lg font-medium text-black dark:text-white mb-4">Update History</h3>
      `;

      // Add each update to history
      if (updates.length === 0) {
        historySection.innerHTML += `
          <p class="text-gray-500 dark:text-gray-400 text-sm">No previous updates</p>
        `;
      } else {
        updates.forEach((update, index) => {
          const updateDiv = document.createElement('div');
          updateDiv.className = `mb-4 p-4 rounded-sm border ${update.is_active ? 
            'border-primary bg-primary bg-opacity-5' : 
            'border-stroke bg-gray-50 dark:border-strokedark dark:bg-meta-4'}`;
          
          updateDiv.innerHTML = `
            <div class="flex justify-between items-center mb-2">
              <span class="font-medium text-black dark:text-white">
                ${update.is_active ? 'Current Version' : `Previous Version ${updates.length - index}`}
              </span>
              <span class="text-sm text-gray-500">
                ${new Date(update.created_at).toLocaleString()}
              </span>
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400">
              <p>Updated by: ${update.recruiter_name}</p>
              <p>Contract Location: ${update.data.contractLocation || '-'}</p>
              <p>Contract Type: ${update.data.contractType || '-'}</p>
              <p>Salary Expectation: ${update.data.salaryExpectation || '-'}</p>
              <p>Previous Salary: ${update.data.previousSalary || '-'}</p>
              <p>Integration Date: ${update.data.integrationDate || '-'}</p>
              <p>Administrative Regularity: ${update.data.administrativeRegularity || '-'}</p>
              <p>Période De Préavis: ${update.data.PériodeDePréavis || '-'}</p>
            </div>
          `;
          
          historySection.appendChild(updateDiv);
        });
      }
    })
    .catch(error => {
      // Remove loading state
      loadingDiv.remove();
      
      console.error('Error loading HR updates:', error);
      
      // Show error message in container
      const errorDiv = document.createElement('div');
      errorDiv.className = 'text-red-500 dark:text-red-400 p-4 text-center';
      errorDiv.textContent = '';
      container.appendChild(errorDiv);
    });
}

function loadHRManagementHistory() {
  const historyContainer = document.getElementById('hr-management-history');
  if (!historyContainer) {
    console.error('HR management history container not found');
    return;
  }

  // Clear container but keep heading
  historyContainer.innerHTML = `
    <h4 class="mb-6 text-xl font-semibold text-black dark:text-white">
      Previous HR Management Updates
    </h4>
  `;

  // Load all previous updates if they exist
  if (candidateData.hrManagementHistory && candidateData.hrManagementHistory.length > 0) {
    candidateData.hrManagementHistory.forEach((update, index) => {
      const historyCard = document.createElement('div');
      historyCard.className = 'mb-6 p-4 bg-gray-50 rounded-sm border border-stroke dark:border-strokedark dark:bg-meta-4';
      
      historyCard.innerHTML = `
        <div class="mb-3">
          <label class="mb-2 block text-sm font-medium text-black dark:text-white">Contract Location</label>
          <p class="text-sm text-gray-600 dark:text-gray-400">${update.contractLocation || '-'}</p>
        </div>
        <div class="mb-3">
          <label class="mb-2 block text-sm font-medium text-black dark:text-white">Contract Type</label>
          <p class="text-sm text-gray-600 dark:text-gray-400">${update.contractType || '-'}</p>
        </div>
        <div class="mb-3">
          <label class="mb-2 block text-sm font-medium text-black dark:text-white">Salary Expectation</label>
          <p class="text-sm text-gray-600 dark:text-gray-400">${update.salaryExpectation || '-'}</p>
        </div>
        <div class="mb-3">
          <label class="mb-2 block text-sm font-medium text-black dark:text-white">Previous Salary</label>
          <p class="text-sm text-gray-600 dark:text-gray-400">${update.previousSalary || '-'}</p>
        </div>
        <div class="mb-3">
          <label class="mb-2 block text-sm font-medium text-black dark:text-white">Integration Date</label>
          <p class="text-sm text-gray-600 dark:text-gray-400">${update.integrationDate || '-'}</p>
        </div>
        <div class="mb-3">
          <label class="mb-2 block text-sm font-medium text-black dark:text-white">Administrative Regularity</label>
          <p class="text-sm text-gray-600 dark:text-gray-400">${update.administrativeRegularity || '-'}</p>
        </div>
        <div class="mb-3">
          <label class="mb-2 block text-sm font-medium text-black dark:text-white">Période De Préavis</label>
          <p class="text-sm text-gray-600 dark:text-gray-400">${update.PériodeDePréavis || '-'}</p>
        </div>
        <div class="text-right text-sm text-gray-500">
          Updated by ${update.updatedBy || 'Unknown'} 
          ${update.timestamp ? `on ${new Date(update.timestamp).toLocaleString()}` : ''}
        </div>
      `;
      
      historyContainer.appendChild(historyCard);
    });
  } else {
    // If no history exists, show a message
    const noHistoryMessage = document.createElement('p');
    noHistoryMessage.className = 'text-gray-500 dark:text-gray-400 text-sm';
    noHistoryMessage.textContent = 'No HR management history available';
    historyContainer.appendChild(noHistoryMessage);
  }
}

function saveHRManagement() {
  try {
    const form = document.getElementById("hrManagementForm");
    if (!form) {
      console.error("Form not found");
      return;
    }

    const formData = new FormData(form);
    const data = {
      contractLocation: formData.get('contractLocation'),
      contractType: formData.get('contractType'),
      salaryExpectation: parseFloat(formData.get('salaryExpectation')) || null,
      previousSalary: parseFloat(formData.get('previousSalary')) || null,
      integrationDate: formData.get('integrationDate') || null,
      administrativeRegularity: formData.get('administrativeRegularity'),
      PériodeDePréavis: formData.get('PériodeDePréavis')
    };

    console.log("Sending data:", data);  // Debug log

    apiClient.patch(
      `/api/hrmanagement/${candidateData.id_candidate}/`, 
      data,
      {
        withCredentials: true,
        headers: {
          'X-CSRFToken': Cookies.get('csrftoken'),
          'Content-Type': 'application/json'
        },
      }
    )
    .then((response) => {
      console.log("Response:", response);
      if (response.status === 200) {
        // Show success message
        alert("HR Management data updated successfully!");

        // Update the form display state
        toggleDisplayHRManagement();

        // Add the new update to the history
        const newUpdate = {
          ...data,
          updatedBy: localStorage.getItem('username') || 'Unknown',
          timestamp: new Date().toISOString()
        };

        // Add the new update to the candidateData.hrManagementHistory array
        if (!candidateData.hrManagementHistory) {
          candidateData.hrManagementHistory = [];
        }
        candidateData.hrManagementHistory.push(newUpdate);

        // Reload the HR Management history
        loadHRManagementHistory();
      }
    })
    .catch((error) => {
      console.error("Error details:", error.response?.data);
      console.error("Full error:", error);
      alert(error.response?.data?.error || "Failed to update HR Management data. Please try again.");
    });

  } catch (error) {
    console.error("Error in saveHRManagement:", error);
    alert("An error occurred while saving. Please try again.");
  }
}
//     function getDifferences(formData, jsonData) {
//     // Convert FormData to a plain object
//     const formDataObj = {};
//     for (let [key, value] of formData.entries()) {
//         formDataObj[key] = value;
//     }
//   console.log("formObj",formDataObj);
//     // Create an object to hold differences
//     const differences = {};

//     // Compare each entry in jsonData with formDataObj
//     for (const key in jsonData) {
//         if (formDataObj.hasOwnProperty(key)) {
//             if (formDataObj[key] !== jsonData[key]) {
//                 differences[key] = {
//                     formDataValue: formDataObj[key],
//                     jsonValue: jsonData[key]
//                 };
//             }
//         } else {
//             differences[key] = {
//                 formDataValue: undefined,
//                 jsonValue: jsonData[key]
//             };
//         }
//     }

//     // Check for any extra fields in FormData
//     for (const key in formDataObj) {
//         if (!jsonData.hasOwnProperty(key)) {
//             differences[key] = {
//                 formDataValue: formDataObj[key],
//                 jsonValue: undefined
//             };
//         }
//     }

//     return differences;
// }

function getJob(id) {
  apiClient.get(`/job/get-job/${id}/`,
    {
      withCredentials: true,
    }
  )
    .then(function (response) {
      const jobData = response.data;
      console.log(jobData);
      localStorage.setItem('jobData', JSON.stringify(jobData));
      window.location.href = "job-details.html";
    })
    .catch(function (error) {
      console.log('Error fetching clients:', error);
    });
}