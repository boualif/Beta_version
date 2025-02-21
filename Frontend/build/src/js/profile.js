let edit = false;
let hrManagement;
let candidateData;
let notes;
window.onload = () => {
  const [navigation] = performance.getEntriesByType("navigation");
  if (navigation && navigation.type === "reload") {
    console.log("page reloadedd");
    const idCandidate = JSON.parse(localStorage.getItem("responseData")).candidateData.id_candidate;
    apiClient.get(`/api/get-candidate/${idCandidate}/`, {
      withCredentials: true
    }).then(function (response) {
      const responseDt = response.data;
      localStorage.removeItem('responseData');
      localStorage.setItem('responseData', JSON.stringify(responseDt));
      const responseData = JSON.parse(localStorage.getItem("responseData"));
      localStorage.setItem("profileData", JSON.stringify(responseData));
      console.log("responseData", responseData);
      candidateData = responseData.candidateData;
      notes = responseData.Notes;
      load_profile();
    }).catch(function (error) {
      console.error("Error fetching candidate data:", error);
      alert("Failed to fetch candidate data. Please try again.");
    });
  } else {
    const responseData = JSON.parse(localStorage.getItem("responseData"));
    localStorage.setItem("profileData", JSON.stringify(responseData));
    console.log("responseData", responseData);
    candidateData = responseData.candidateData;
    notes = responseData.Notes;
    load_profile();
  }
};
function load_stats() {
  // Remove the original div
  const originalDiv = document.getElementById("profile-cdd");
  if (originalDiv) {
    originalDiv.remove();
  }
  document.getElementById("pf-btn").className = "rounded px-3 py-1 text-xs font-medium text-black hover:bg-white hover:shadow-card dark:text-white dark:hover:bg-boxdark";
  document.getElementById("hr-btn").className = "rounded px-3 py-1 text-xs font-medium text-black hover:bg-white hover:shadow-card dark:text-white dark:hover:bg-boxdark";
  document.getElementById("stat-btn").className = "rounded bg-white px-3 py-1 text-xs font-medium text-black shadow-card hover:bg-white hover:shadow-card dark:bg-boxdark dark:text-white dark:hover:bg-boxdark";
  document.getElementById("app-btn").className = "rounded px-3 py-1 text-xs font-medium text-black hover:bg-white hover:shadow-card dark:text-white dark:hover:bg-boxdark";
  document.getElementById("inter-btn").className = "rounded px-3 py-1 text-xs font-medium text-black hover:bg-white hover:shadow-card dark:text-white dark:hover:bg-boxdark";
  const targetDiv = document.createElement("div");
  targetDiv.id = "profile-cdd";
  targetDiv.className = "mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10";
  const main_content = document.getElementById("main-content");
  // Fetch the content from the external HTML file
  fetch("statistics.html").then(response => response.text()) // Get the content as text
  .then(data => {
    console.log("stat fetch");
    targetDiv.innerHTML = data; // Insert the fetched content into the div
    main_content.appendChild(targetDiv); // Append the new div to the body or any other parent element
  }).catch(error => console.error("Error loading the external file:", error));
}
function load_app() {
  const originalDiv = document.getElementById("profile-cdd");
  if (originalDiv) {
    originalDiv.remove();
  }
  document.getElementById("pf-btn").className = "rounded px-3 py-1 text-xs font-medium text-black hover:bg-white hover:shadow-card dark:text-white dark:hover:bg-boxdark";
  document.getElementById("hr-btn").className = "rounded px-3 py-1 text-xs font-medium text-black hover:bg-white hover:shadow-card dark:text-white dark:hover:bg-boxdark";
  document.getElementById("app-btn").className = "rounded bg-white px-3 py-1 text-xs font-medium text-black shadow-card hover:bg-white hover:shadow-card dark:bg-boxdark dark:text-white dark:hover:bg-boxdark";
  document.getElementById("stat-btn").className = "rounded px-3 py-1 text-xs font-medium text-black hover:bg-white hover:shadow-card dark:text-white dark:hover:bg-boxdark";
  document.getElementById("inter-btn").className = "rounded px-3 py-1 text-xs font-medium text-black hover:bg-white hover:shadow-card dark:text-white dark:hover:bg-boxdark";

  // Fetch the content from the external HTML file
  fetch("application.html").then(response => response.text()) // Get the content as text
  .then(data => {
    console.log("app fetch");
    const targetDiv = document.createElement("div");
    targetDiv.id = "profile-cdd";
    targetDiv.className = "mx-auto max-w-screen-lg p-4 md:p-6 2xl:p-10";
    const main_content = document.getElementById("main-content");
    targetDiv.innerHTML = data; // Insert the fetched content into the div

    apiClient.get(`/api/get-applications/${candidateData.id_candidate}/`, {
      withCredentials: true
    }).then(response => {
      console.log("Data updated successfully:", response.data);
      const data = response.data;
      const labels = ["New", "Preselected", "Interviewed", "Tested", "Proposed", "Hired", "Start date", "End date"];
      data.forEach(element => {
        const containerDiv = document.createElement("div");
        containerDiv.className = "rounded-sm border border-stroke pb-2 mb-8 bg-white shadow-default dark:border-strokedark dark:bg-boxdark";
        const titleDiv = document.createElement("div");
        titleDiv.className = "border-b border-stroke px-6.5 py-4 dark:border-strokedark";
        const jobDiv = document.createElement("h3");
        jobDiv.className = "font-medium text-black hover:underline hover:text-primary hover:cursor-pointer hover: dark:text-white";
        jobDiv.textContent = element.job;
        titleDiv.appendChild(jobDiv);
        titleDiv.onclick = () => getJob(element.jobId);
        containerDiv.appendChild(titleDiv);
        const ol = document.createElement("ol");
        ol.className = "items-center sm:flex pl-10 justify-between w-full";
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
          div1.className = "z-10 flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full ring-0 ring-white dark:bg-blue-900 sm:ring-8 dark:ring-gray-900 shrink-0 ";
          const div2 = document.createElement("div2");
          div2.className = "hidden sm:flex w-full bg-gray-200 h-0.5 dark:bg-gray-700";
          const h3 = document.createElement("h3");
          h3.className = "text-lg font-semibold text-gray-900 dark:text-white";
          h3.textContent = label;
          const time = document.createElement("time");
          time.className = "block mb-2 text-sm font-normal leading-none text-gray-400 dark:text-gray-500";
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
    }).catch(error => {
      console.error("Error updating data:", error);
    });
  }).catch(error => console.error("Error loading the external file:", error));

  // Remove the original div
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
  fetch("profileContent.html").then(response => response.text()) // Get the content as text
  .then(data => {
    console.log("prof fetch");
    targetDiv.innerHTML = data; // Insert the fetched content into the div
    main_content.appendChild(targetDiv); // Append the new div to the body or any other parent element

    // Save data to localStorage

    console.log("candidateData:::::::", candidateData);
    document.getElementById("nameDisplay").textContent = candidateData.candidateData.CandidateInfo.FullName;
    document.getElementById("genderDisplay").textContent = candidateData.candidateData.CandidateInfo.Gender;
    document.getElementById("maritalStatusDisplay").textContent = candidateData.candidateData.CandidateInfo.MaritalStatus;
    document.getElementById("phoneDisplay").innerHTML = `${candidateData.candidateData.CandidateInfo.PhoneNumber.FormattedNumber}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Location: ${candidateData.candidateData.CandidateInfo.PhoneNumber.Location}`;
    document.getElementById("recruiter").textContent = candidateData.recruiter;
    document.getElementById("availability").textContent = candidateData.availability;
    document.getElementById("mobility").textContent = candidateData.mobility;
    const statusDisplay = document.getElementById("status");
    const status = candidateData.status;
    statusDisplay.textContent = status;
    if (candidateData.status == "available") {
      statusDisplay.className = "inline-flex rounded-full bg-success bg-opacity-10 px-3 py-1 text-sm font-medium text-success";
    } else if (candidateData.status == "not available") {
      statusDisplay.className = "inline-flex rounded-full bg-warning bg-opacity-10 px-3 py-1 text-sm font-medium text-warning";
    } else if (candidateData.status == "restricted") {
      statusDisplay.className = "inline-flex rounded-full bg-danger bg-opacity-10 px-3 py-1 text-sm font-medium text-danger";
    }
    document.getElementById("dateOfBirthDisplay").textContent = candidateData.candidateData.CandidateInfo.DateOfBirth;
    document.getElementById("emailDisplay").textContent = candidateData.candidateData.CandidateInfo.Email;
    const linkedInDisplay = document.getElementById("linkedInDisplay");
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
    document.getElementById("countryDisplay").textContent = candidateData.candidateData.CandidateInfo.Country;
    document.getElementById("nationalityDisplay").textContent = candidateData.candidateData.CandidateInfo.Nationality;
    const linksDisplay = document.getElementById('linksDisplay');

    // Access the Links array
    const linksArray = candidateData.candidateData.CandidateInfo.Links;

    // Create clickable links with <a> tags
    const linksHTML = linksArray.map(link => `<a href="https://${link}" target="_blank" class="hover:text-blue-500 hover:underline">${link}</a>`).join('  ,  ');

    // Set the innerHTML of 'linksDisplay' to the created links
    linksDisplay.innerHTML = linksHTML;
    notes.forEach(note => {
      const notesContainer = document.getElementById("notesContainer");
      const container = document.createElement("div");
      container.dataset.id = note.id;
      container.className = "flex flex-col mt-4 p-4 border-b border-stroke dark:border-strokedark";
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
    jobTitle.textContent = candidateData.candidateData.CandidateInfo["Job Title"];

    // Split the "Soft Skills" string into an array
    const softSkillsArray = candidateData.candidateData.CandidateInfo["Soft Skills"];

    // Loop through the soft skills array
    softSkillsArray.forEach(softSkill => {
      softSkillsDisplay = document.getElementById("softSkillsDisplay");
      const skillDiv = document.createElement("div");

      // Set the class and style attributes
      skillDiv.className = " inline-flex  bg-indigo-400 items-center justify-center rounded-full border px-10 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10";
      skillDiv.style.padding = "5px 15px";
      skillDiv.style.margin = "1%";
      //skillDiv.style.backgroundColor = "#9BA9ED";

      // Set the skill name as the text content
      skillDiv.textContent = softSkill;

      // Append the new div to the container
      softSkillsDisplay.appendChild(skillDiv);
    });

    // Split the "Soft Skills" string into an array
    const hardSkillsArray = candidateData.candidateData.CandidateInfo["Hard Skills"];

    // Loop through the soft skills array
    hardSkillsArray.forEach(hardSkill => {
      hardSkillsDisplay = document.getElementById("hardSkillsDisplay");
      const skillDiv = document.createElement("div");

      // Set the class and style attributes
      skillDiv.className = "inline-flex items-center justify-center rounded-full bg-purple-600 border border-meta-3 px-10 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10";
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
    "bg-blue-200 text-blue-700", "bg-blue-300 text-blue-800", "bg-blue-400 text-blue-900", "bg-indigo-200 text-indigo-700", "bg-indigo-300 text-indigo-800", "bg-indigo-400 text-indigo-900", "bg-cyan-200 text-cyan-700", "bg-cyan-300 text-cyan-800", "bg-cyan-400 text-cyan-900", "bg-sky-200 text-sky-700", "bg-sky-300 text-sky-800", "bg-sky-400 text-sky-900", "bg-lightBlue-300 text-lightBlue-700", "bg-lightBlue-400 text-lightBlue-800", "bg-lightBlue-500 text-lightBlue-600", "bg-azure-200 text-azure-700", "bg-azure-300 text-azure-800"];
    const languages = candidateData.candidateData.CandidateInfo.Languages;
    languages.forEach(language => {
      const span = document.createElement("span");

      // Randomly select a color from the colorArray
      const randomColorClass = colorArray[Math.floor(Math.random() * colorArray.length)];

      // Set the class for the span
      span.className = `${randomColorClass} font-medium px-4 py-2 rounded-full mr-2 mb-2 inline-block`;
      span.textContent = language;

      // Append the span to the languagesDisplay element
      languagesDisplay.appendChild(span);
    });
    const degrees = candidateData.candidateData.CandidateInfo.Degrees;
    degrees.forEach(degree => {
      educationDisplay = document.getElementById("educationDisplay");
      const li = document.createElement("li");
      li.className = " mb-10 ml-6";
      const span = document.createElement("span");
      span.className = "flex absolute -left-1 justify-center items-center w-3 h-3 bg-primary rounded-full ring-8 ring-white";
      const div = document.createElement("div");
      div.className = "p-4 bg-white rounded-lg border border-gray-200 shadow-sm";
      const h2 = document.createElement("h2");
      h2.className = "mb-1 text-lg font-semibold text-gray-900";
      h2.textContent = degree.DegreeName;
      const time = document.createElement("time");
      time.className = "mb-1 text-sm font-normal leading-none text-gray-400";
      time.textContent = `${degree.StartDate} - ${degree.EndDate}`;
      const infoDegree = document.createElement("div");
      infoDegree.className = "mb-1 text-sm font-normal leading-none text-gray-400";
      infoDegree.textContent = `${degree.NormalizeDegree} - ${degree.Specialization}`;
      const p = document.createElement("p");
      p.textContent = degree.CountryOrInstitute;
      div.appendChild(h2);
      div.appendChild(infoDegree);
      div.appendChild(time);
      div.appendChild(p);
      li.appendChild(span);
      li.appendChild(div);
      educationDisplay.appendChild(li);
    });
    const certifications = candidateData.candidateData.CandidateInfo.Certifications;
    certificationDisplay = document.getElementById("certificationDisplay");
    certifications.forEach(certif => {
      const div = document.createElement("div");
      div.className = "bg-white p-5 rounded-lg shadow-md flex items-center justify-between";
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
    experienceDisplay = document.getElementById("experienceDisplay");
    experiences.forEach(experience => {
      const container = document.createElement("div");
      container.className = "relative pl-8 sm:pl-32 py-6 group";
      const div = document.createElement("div");
      div.className = "flex flex-col sm:flex-row items-start mb-2 group-last:before:hidden before:absolute before:left-2 sm:before:left-0 before:h-full before:w-[2px] before:bg-slate-300 sm:before:ml-[6.5rem] before:self-start before:-translate-x-1/2 before:translate-y-3 after:absolute after:left-2 sm:after:left-0 after:w-3 after:h-3 after:bg-indigo-500 after:border-4 after:box-content after:border-white after:rounded-full sm:after:ml-[6.5rem] after:-translate-x-1/2 after:translate-y-1.5";
      const time = document.createElement("time");
      time.className = "sm:absolute left-0 translate-y-0.5 inline-flex items-center justify-center text-xs font-semibold uppercase w-20 h-5 mb-2 sm:mb-0";
      time.style.color = "#3a86ff";
      time.textContent = experience.Periode;
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
  }).catch(error => console.error("Error loading the external file:", error));
  document.getElementById("pf-btn").className = "rounded bg-white px-3 py-1 text-xs font-medium text-black shadow-card hover:bg-white hover:shadow-card dark:bg-boxdark dark:text-white dark:hover:bg-boxdark";
  document.getElementById("hr-btn").className = "rounded px-3 py-1 text-xs font-medium text-black hover:bg-white hover:shadow-card dark:text-white dark:hover:bg-boxdark";
  document.getElementById("app-btn").className = "rounded px-3 py-1 text-xs font-medium text-black hover:bg-white hover:shadow-card dark:text-white dark:hover:bg-boxdark";
  document.getElementById("stat-btn").className = "rounded px-3 py-1 text-xs font-medium text-black hover:bg-white hover:shadow-card dark:text-white dark:hover:bg-boxdark";
  document.getElementById("inter-btn").className = "rounded px-3 py-1 text-xs font-medium text-black hover:bg-white hover:shadow-card dark:text-white dark:hover:bg-boxdark";
}
function load_interviews() {
  const originalDiv = document.getElementById("profile-cdd");
  if (originalDiv) {
    originalDiv.remove();
  }
  const targetDiv = document.createElement("div");
  targetDiv.id = "profile-cdd";
  targetDiv.className = "mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10";
  const main_content = document.getElementById("main-content");
  // Fetch the content from the external HTML file
  fetch("interview.html").then(response => response.text()) // Get the content as text
  .then(data => {
    console.log("inter fetch");
    targetDiv.innerHTML = data; // Insert the fetched content into the div
    main_content.appendChild(targetDiv); // Append the new div to the body or any other parent element
    apiClient.get(`/interview/list/get/${candidateData.id_candidate}/`, {
      withCredentials: true
    }).then(function (response) {
      if (response.status == 201) {
        const interviews = response.data;
        const interviewContainer = document.getElementById("interviewContainer");
        interviewContainer.innerHTML = '';
        interviews.forEach(interview => {
          interviewContainer.innerHTML += `<li class="mb-10 ml-4">
			<div
				class="absolute w-3 h-3 bg-gray-200 rounded-full -left-1.5 border border-white dark:border-gray-900 dark:bg-gray-700">
			</div>
			<time class="mb-1 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">${interview.dateInterview}</time>
			<h3 class="text-lg font-semibold text-gray-900 hover:underline hover:text-primary hover:cursor-pointer dark:text-white" onclick="getJob(${interview.idJob})">${interview.job}</h3>
			<p class="text-base font-normal text-gray-500 dark:text-gray-400">${interview.notesInterview}</p>
			<p class="mb-4 ">Recruiter: ${interview.recruiter}</p>
      <a href="#"
				class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">Learn
				more <svg class="w-3 h-3 ml-2" fill="currentColor" viewBox="0 0 20 20"
					xmlns="http://www.w3.org/2000/svg">
					<path fill-rule="evenodd"
						d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
						clip-rule="evenodd"></path>
				</svg></a>
		</li>`;
        });
      }
    }).catch(function (error) {
      console.error("Error:", error);
      alert("Failed to submit the form. Please try again.");
    });
  }).catch(error => console.error("Error loading the external file:", error));
  document.getElementById("pf-btn").className = "rounded px-3 py-1 text-xs font-medium text-black hover:bg-white hover:shadow-card dark:text-white dark:hover:bg-boxdark";
  document.getElementById("hr-btn").className = "rounded px-3 py-1 text-xs font-medium text-black hover:bg-white hover:shadow-card dark:text-white dark:hover:bg-boxdark";
  document.getElementById("app-btn").className = "rounded px-3 py-1 text-xs font-medium text-black hover:bg-white hover:shadow-card dark:text-white dark:hover:bg-boxdark";
  document.getElementById("stat-btn").className = "rounded px-3 py-1 text-xs font-medium text-black hover:bg-white hover:shadow-card dark:text-white dark:hover:bg-boxdark";
  document.getElementById("inter-btn").className = "rounded bg-white px-3 py-1 text-xs font-medium text-black shadow-card hover:bg-white hover:shadow-card dark:bg-boxdark dark:text-white dark:hover:bg-boxdark";
}
function load_HR_Management() {
  const originalDiv = document.getElementById("profile-cdd");
  if (originalDiv) {
    originalDiv.remove();
  }
  const targetDiv = document.createElement("div");
  targetDiv.id = "profile-cdd";
  targetDiv.className = "mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10";
  const main_content = document.getElementById("main-content");
  // Fetch the content from the external HTML file
  fetch("management.html").then(response => response.text()) // Get the content as text
  .then(data => {
    console.log("hr fetch");
    targetDiv.innerHTML = data; // Insert the fetched content into the div
    main_content.appendChild(targetDiv); // Append the new div to the body or any other parent element
    initializeDatePickers();
    edit = false;
    hrManagement = candidateData.hrManagement;
    const contractLocation = document.getElementById("contractLocation");
    contractLocation.value = hrManagement.hr.contractLocation;
    if (hrManagement.hr.contractLocation) {
      setContractType(hrManagement.hr.contractLocation);
    }
    const salaryExpectation = document.getElementById("salaryExpectation");
    salaryExpectation.value = hrManagement.hr.salaryExpectation;
    const previousSalary = document.getElementById("previousSalary");
    previousSalary.value = hrManagement.hr.previousSalary;
    const integrationDate = document.getElementById("integrationDate");
    integrationDate.value = hrManagement.hr.integrationDate;
    const leaveBalance = document.getElementById("leaveBalance");
    leaveBalance.value = hrManagement.hr.leaveBalance;
    const date1 = document.getElementById("date1");
    date1.value = hrManagement.valService.date1;
    const validatedBy1 = document.getElementById("validatedBy1");
    validatedBy1.value = hrManagement.valService.validatedBy1;
    const evaluation1 = document.getElementById("evaluation1");
    evaluation1.value = hrManagement.valService.evaluation1;
    const user1 = document.getElementById("user1");
    user1.textContent = hrManagement.valService.user1;
    const date2 = document.getElementById("date2");
    date2.value = hrManagement.valTechnic.date2;
    const validatedBy2 = document.getElementById("validatedBy2");
    validatedBy2.value = hrManagement.valTechnic.validatedBy2;
    const evaluation2 = document.getElementById("evaluation2");
    evaluation2.value = hrManagement.valTechnic.evaluation2;
    const user2 = document.getElementById("user2");
    user2.textContent = hrManagement.valTechnic.user2;
    const date3 = document.getElementById("date3");
    date3.value = hrManagement.valDirection.date3;
    const validatedBy3 = document.getElementById("validatedBy3");
    validatedBy3.value = hrManagement.valDirection.validatedBy3;
    const evaluation3 = document.getElementById("evaluation3");
    evaluation3.value = hrManagement.valDirection.evaluation3;
    const user3 = document.getElementById("user3");
    user3.textContent = hrManagement.valDirection.user3;
  }).catch(error => console.error("Error loading the external file:", error));
  document.getElementById("pf-btn").className = "rounded px-3 py-1 text-xs font-medium text-black hover:bg-white hover:shadow-card dark:text-white dark:hover:bg-boxdark";
  document.getElementById("app-btn").className = "rounded px-3 py-1 text-xs font-medium text-black hover:bg-white hover:shadow-card dark:text-white dark:hover:bg-boxdark";
  document.getElementById("stat-btn").className = "rounded px-3 py-1 text-xs font-medium text-black hover:bg-white hover:shadow-card dark:text-white dark:hover:bg-boxdark";
  document.getElementById("inter-btn").className = "rounded px-3 py-1 text-xs font-medium text-black hover:bg-white hover:shadow-card dark:text-white dark:hover:bg-boxdark";
  document.getElementById("hr-btn").className = "rounded bg-white px-3 py-1 text-xs font-medium text-black shadow-card hover:bg-white hover:shadow-card dark:bg-boxdark dark:text-white dark:hover:bg-boxdark";
}
function initializeDatePickers() {
  const dateInputs = document.querySelectorAll(".form-datepicker"); // Select date input elements

  dateInputs.forEach(input => {
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
  apiClient.get(`/api/getcv/${candidateData.id_candidate}/`, {
    withCredentials: true
  }).then(function (response) {
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

    document.getElementById("pdfFrame").src = `data:application/pdf;base64,${base64String}`;
    // Display the modal
    document.getElementById("pdfModal").style.display = "block";
    // Return the blobUrl
  }).catch(function (error) {
    console.error("Error:", error);
    alert("Failed to submit the form. Please try again.");
  });
}

// document.getElementById('pdfFrame').src = "doccc_3.pdf";

function closePDF() {
  document.getElementById("pdfModal").style.display = "none";
}
function addNote(e) {
  e.preventDefault();
  const message = document.getElementById("messageArea").value;
  const notesContainer = document.getElementById("notesContainer");
  console.log("eneter");
  apiClient.post("/api/post-note/", {
    content: message,
    candidate: candidateData.id_candidate
  }, {
    withCredentials: true,
    headers: {
      'X-CSRFToken': Cookies.get('csrftoken') // Manually extract the CSRF token
    }
  }).then(function (response) {
    alert("Form submitted successfully!");
    const note = response.data;
    const container = document.createElement("div");
    container.dataset.id = note.id;
    container.className = "flex flex-col mt-4 p-4 border-b border-stroke dark:border-strokedark";
    const nameDiv = document.createElement("div");
    nameDiv.className = "font-medium text-purple-800 mb-1";
    nameDiv.className = note.recruiter;
    const contentDiv = document.createElement("div");
    contentDiv.className = "text-purple-800 mb-2";
    contentDiv.textContent = message;
    const container2 = document.createElement("div");
    container2.className = "flex justify-end gap-x-2";
    const dateDiv = document.createElement("div");
    dateDiv.className = "flex justify-end text-gray-600";
    dateDiv.textContent = note.date;
    const deletebtn = document.createElement("a");
    deletebtn.textContent = "delete";
    deletebtn.onclick = function () {
      deleteNote(note.id); // Call the function to display the form
    };
    container.appendChild(nameDiv);
    container.appendChild(contentDiv);
    container2.appendChild(deletebtn);
    container2.appendChild(dateDiv);
    container.appendChild(container2);
    notesContainer.appendChild(container);
    console.log(response.data); // Log the response data
  }).catch(function (error) {
    console.error("Error:", error);
    alert("Failed to submit the form. Please try again.");
  });
}
function deleteNote(id) {
  apiClient.delete(`/api/delete-note/${id}/`, {
    withCredentials: true,
    headers: {
      'X-CSRFToken': Cookies.get('csrftoken') // Manually extract the CSRF token
    }
  }).then(response => {
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
  this.isOptionSelected = true;
  // Your function logic here
  const item = event.target.value;
  setContractType(item);
}
function setContractType(item) {
  const contract = document.getElementById('contract-type-div');
  if (item === 'Fr') {
    contract.innerHTML = `                  <div>
                    <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                      Type de Contrat
                    </label>
                    <div x-data="{ isOptionSelected: false, selectedContract: '${hrManagement.hr.contractType}' }" class="relative z-20 bg-white dark:bg-form-input">
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
  } else if (item === 'Tn') {
    contract.innerHTML = `                  <div>
                    <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                      Type de Contrat
                    </label>
                    <div x-data="{ isOptionSelected: false, selectedContract: '${hrManagement.hr.contractType}' }" class="relative z-20 bg-white dark:bg-form-input">
                      <select x-model="selectedContract" name="contractType" id="contractType"
                        class="relative z-20 w-full appearance-none rounded border border-stroke py-3 pl-5 pr-12 outline-none transition focus:border-gray active:border-primary dark:border-form-strokedark dark:bg-form-input"
                        :class="isOptionSelected && 'text-black dark:text-white'" @change="isOptionSelected = true">
                        <option value="integration" class="text-body">Integration</option>
                        <option value="salarié_mission" class="text-body">Salarié en mission</option>
                        <option value="cbe" class="text-body">CBE</option>
                        <option value="d.ict" class="text-body">D.ICT</option>
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
  }
  const contractType = document.getElementById("contractType");
  const svg_dropdown = document.getElementById("svg_dropdown");
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
  // Append each entry from this form to the combined FormData
  for (let [key, value] of formData.entries()) {
    dt[key] = value;
  }
  candidateData.hrManagement.valService = dt;
  apiClient.patch(`/api/val-service/${candidateData.id_candidate}/`, dt, {
    withCredentials: true,
    headers: {
      'X-CSRFToken': Cookies.get('csrftoken') // Manually extract the CSRF token
    }
  }).then(response => {
    console.log("Data updated successfully:", response.data);
    if (response.status == 200) {
      edit = false;
      document.getElementById("user1").textContent = localStorage.getItem("username");
      toggleDisplayValService();
    }
  }).catch(error => {
    console.error("Error updating data:", error);
  });
}
function saveValTechnic() {
  const combinedFormData = new FormData();
  var dt = {};
  const form = document.getElementById("form2");
  const formData = new FormData(form);
  // Append each entry from this form to the combined FormData
  for (let [key, value] of formData.entries()) {
    dt[key] = value;
  }
  candidateData.hrManagement.valTechnic = dt;
  apiClient.patch(`/api/val-technic/${candidateData.id_candidate}/`, dt, {
    withCredentials: true,
    headers: {
      'X-CSRFToken': Cookies.get('csrftoken') // Manually extract the CSRF token
    }
  }).then(response => {
    console.log("Data updated successfully:", response.data);
    if (response.status == 200) {
      edit = false;
      document.getElementById("user2").textContent = localStorage.getItem("username");
      toggleDisplayValTechnic();
    }
  }).catch(error => {
    console.error("Error updating data:", error);
  });
}
function saveValDirection() {
  const combinedFormData = new FormData();
  var dt = {};
  const form = document.getElementById("form3");
  const formData = new FormData(form);
  // Append each entry from this form to the combined FormData
  for (let [key, value] of formData.entries()) {
    dt[key] = value;
  }
  candidateData.hrManagement.valDirection = dt;
  apiClient.patch(`/api/val-direction/${candidateData.id_candidate}/`, dt, {
    withCredentials: true,
    headers: {
      'X-CSRFToken': Cookies.get('csrftoken') // Manually extract the CSRF token
    }
  }).then(response => {
    console.log("Data updated successfully:", response.data);
    if (response.status == 200) {
      edit = false;
      document.getElementById("user3").textContent = localStorage.getItem("username");
      toggleDisplayValDirection();
    }
  }).catch(error => {
    console.error("Error updating data:", error);
  });
}
function saveHRManagement() {
  const combinedFormData = new FormData();

  // 
  // console.log(candidateData.hrManagement);

  //       const formDataToJson = (formData) => {
  //   const jsonObject = {};
  //   formData.forEach((value, key) => {
  //     jsonObject[key] = value;
  //   });
  //   return jsonObject;
  // };

  // // Get JSON object from FormData
  // const jsonData = formDataToJson(combinedFormData);

  // console.log(jsonData);
  // Get each form and append its data to the combined FormData object
  //const forms = ["hrManagementForm", "form1", "form2", "form3"];
  var dt = {};
  //forms.forEach(formId => {
  const form = document.getElementById("hrManagementForm");
  const formData = new FormData(form);

  // Append each entry from this form to the combined FormData
  for (let [key, value] of formData.entries()) {
    dt[key] = value;
  }
  //});
  candidateData.hrManagement.hr = dt;
  apiClient.patch(`/api/hrmanagement/${candidateData.id_candidate}/`, dt, {
    withCredentials: true,
    headers: {
      'X-CSRFToken': Cookies.get('csrftoken') // Manually extract the CSRF token
    }
  }).then(response => {
    console.log("Data updated successfully:", response.data);
    if (response.status == 200) {
      edit = false;
      toggleDisplayHRManagement();
    }
  }).catch(error => {
    console.error("Error updating data:", error);
  });

  // console.log(combinedFormData);
  // console.log(hrManagement);
  // const differences = getDifferences(combinedFormData, hrManagement);
  // console.log(differences);
  // Log the combined form data
  // for (let [key, value] of combinedFormData.entries()) {
  //   console.log(`${key}: ${value}`);
  // }
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
  apiClient.get(`/job/get-job/${id}/`, {
    withCredentials: true
  }).then(function (response) {
    const jobData = response.data;
    console.log(jobData);
    localStorage.setItem('jobData', JSON.stringify(jobData));
    window.location.href = "job-details.html";
  }).catch(function (error) {
    console.log('Error fetching clients:', error);
  });
}