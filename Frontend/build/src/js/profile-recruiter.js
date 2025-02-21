let recruiterData;
window.onload = () => {
  console.log("hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh");
  document.getElementById("app-btn").onclick = () => load_activity();
  recruiterData = JSON.parse(localStorage.getItem('recruiterData'));
  load_profile();
  const [navigation] = performance.getEntriesByType("navigation");
  if (navigation && navigation.type === "reload") {
    const id_Rec = recruiterData.id_Recruiter;
    var url = "";
    if (is_superuser === "true") {
      if (id_Rec) {
        url = "/api/get-recruiter/" + id_Rec + "/";
      } else {
        url = "/api/get-profile/";
      }
    } else {
      url = "/api/get-Header/";
    }
    apiClient.get(url, {
      withCredentials: true
    }).then(function (response) {
      recruiterData = response.data;
      localStorage.removeItem("recruiterData");
      localStorage.setItem('recruiterData', JSON.stringify(recruiterData));
      console.log(recruiterData);
    }).catch(function (error) {
      console.error("Error fetching recruiter data:", error);
      alert("Failed to fetch recruiter data. Please try again.");
    });
    //load_profile();
  }
};
function load_profile() {
  const originalDiv = document.getElementById('profile-rc');
  if (originalDiv) {
    originalDiv.remove();
  }
  document.getElementById("pf-btn").className = "rounded bg-white px-3 py-1 text-xs font-medium text-black shadow-card hover:bg-white hover:shadow-card dark:bg-boxdark dark:text-white dark:hover:bg-boxdark";
  document.getElementById("app-btn").className = "rounded px-3 py-1 text-xs font-medium text-black hover:bg-white hover:shadow-card dark:text-white dark:hover:bg-boxdark";
  const targetDiv = document.createElement('div');
  targetDiv.id = 'profile-rc';
  targetDiv.className = 'mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10';
  const main_content = document.getElementById("main-content");
  // Fetch the content from the external HTML file
  fetch('profileRecruiterContent.html').then(response => response.text()) // Get the content as text
  .then(data => {
    console.log('profile rc fetch');
    targetDiv.innerHTML = data; // Insert the fetched content into the div
    main_content.appendChild(targetDiv); // Append the new div to the body or any other parent element

    // const is_superuser = localStorage.getItem("role");
    // if(is_superuser === "true"){
    const editBtn = document.getElementById("editBtn");
    editBtn.innerHTML = `<a href="edit-recruiter-profile.html"
                        class="flex cursor-pointer items-center justify-center gap-2 rounded bg-primary px-2 py-1 text-sm font-medium text-white hover:bg-opacity-80 xsm:px-4">

                        <span>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                stroke-width="1.5" stroke="currentColor" class="size-4">
                                <path stroke-linecap="round" stroke-linejoin="round"
                                    d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                            </svg>


                        </span>
                        <span>Edit</span>
                    </a>`;
    //     }
    console.log("recruiterData:::", recruiterData);
    const name = document.getElementById('name');
    const position = document.getElementById('position');
    const responsible = document.getElementById('responsible');
    const email = document.getElementById('email');
    const phone = document.getElementById('phone');
    const address = document.getElementById('address');
    const image = document.getElementById('profileImage');
    name.textContent = `${recruiterData.first_name} ${recruiterData.last_name}`;
    position.textContent = recruiterData.position;
    responsible.textContent = recruiterData.responsible;
    email.textContent = recruiterData.email;
    phone.textContent = recruiterData.phone;
    address.textContent = recruiterData.address;
    image.src = `data:image/jpeg;base64,${recruiterData.image}`;
    const fileInput = document.getElementById('profile');
    fileInput.addEventListener('change', function (e) {
      const file = e.target.files[0];
      var base64Data;
      if (file) {
        const reader = new FileReader();
        reader.onload = function (event) {
          profileImage.src = event.target.result;
          //console.log('result==', event.target.result)
          //recruiterData.image = event.target.result;
          const base64ImageData = event.target.result;
          base64Data = base64ImageData.split(',')[1];

          // Prepare the update data object with the base64 image data only
          const updateData = {
            'image': base64Data // This is just the base64-encoded string without the prefix
          };
          const id_Rec = recruiterData.id_Recruiter;
          var url = "";
          if (id_Rec) {
            url = "/api/update-img/" + id_Rec + "/";
          } else {
            url = "/api/update-img/";
          }
          apiClient.patch(url, updateData, {
            withCredentials: true,
            headers: {
              'X-CSRFToken': Cookies.get('csrftoken') // Manually extract the CSRF token
            }
          }).then(response => {
            console.log('Data updated successfully:', response.data);
            localStorage.removeItem("recruiterDataHeader");
            // var recruiterDataHeader = JSON.parse(localStorage.getItem("recruiterDataHeader"));
            // recruiterDataHeader.image = base64Data;
            recruiterData.image = base64Data;
          }).catch(error => {
            console.error('Error updating data:', error);
          });
        };
        reader.readAsDataURL(file);
      }
    });
  }).catch(error => console.error('Error loading the external file:', error));
}
function load_activity() {
  const originalDiv = document.getElementById('profile-rc');
  if (originalDiv) {
    originalDiv.remove();
  }
  document.getElementById("pf-btn").className = "rounded px-3 py-1 text-xs font-medium text-black hover:bg-white hover:shadow-card dark:text-white dark:hover:bg-boxdark";
  document.getElementById("app-btn").className = "rounded bg-white px-3 py-1 text-xs font-medium text-black shadow-card hover:bg-white hover:shadow-card dark:bg-boxdark dark:text-white dark:hover:bg-boxdark";
  const targetDiv = document.createElement('div');
  targetDiv.id = 'profile-rc';
  targetDiv.className = 'mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10';
  const main_content = document.getElementById("main-content");
  // Fetch the content from the external HTML file
  fetch('activity.html').then(response => response.text()) // Get the content as text
  .then(data => {
    console.log('activity fetch');
    targetDiv.innerHTML = data; // Insert the fetched content into the div
    main_content.appendChild(targetDiv); // Append the new div to the body or any other parent element
    get_activities(recruiterData.id_Recruiter, 1);
  }).catch(error => console.error('Error loading the external file:', error));
}
function get_activities(id, page = 1) {
  const id_Rec = recruiterData.id_Recruiter;
  var url = "";
  if (id_Rec) {
    url = "/api/get-activities/" + id_Rec + "/";
  } else {
    url = "/api/get-activities/";
  }
  apiClient.get(url, {
    withCredentials: true
  }).then(response => {
    const activityContainer = document.getElementById('activityContainer');
    console.log('Data updated successfully:', response.data);
    data = response.data;
    data.forEach(element => {
      const date = element.date;
      const id_candidate = element.id_candidate;
      const id_client = element.id_client;
      const id_lead = element.id_lead;
      const id_job = element.id_job;
      var ref = "";
      var id;
      const container = document.createElement('div');
      if (id_candidate) {
        ref = "candidate";
        id = id_candidate;
      } else if (id_client) {
        ref = "client";
        id = id_client;
      } else if (id_job) {
        ref = "job";
        id = id_job;
      } else if (id_lead) {
        ref = "lead";
        id = id_lead;
      }
      if (id) {
        const desc = element.description;
        const text = desc.trim().substring(0, desc.trim().lastIndexOf(' '));
        const description = `${element.recruiter} ${text}`;
        container.innerHTML = `<div class="my-6 -ml-1.5 flex w-full items-center">
                    <div class="z-10 w-1/12">
                        <div class="h-3.5 w-3.5 rounded-full bg-blue-600"></div>
                    </div>
                    <div class="w-11/12">
                        <p class="text-sm">${description}
                            <a onclick="(function() { handleAction('${ref}', '${id}'); })()" class="font-bold text-blue-600 cursor-pointer">${ref}</a>
                            </p>
                        <p class="text-gray-500 text-xs">${date}</p>
                    </div>
                    </div>
                `;
      } else {
        const description = `${element.recruiter} ${element.description}`;
        container.innerHTML = `<div class="my-6 -ml-1.5 flex w-full items-center">
                    <div class="z-10 w-1/12">
                        <div class="h-3.5 w-3.5 rounded-full bg-blue-600"></div>
                    </div>
                    <div class="w-11/12">
                        <p class="text-sm">${description} ${ref}</p>
                        <p class="text-gray-500 text-xs">${date}</p>
                    </div>
                    </div>
                `;
      }
      activityContainer.appendChild(container);
    });
  }).catch(error => {
    console.error('Error updating data:', error);
  });
}
function handleAction(action, id) {
  console.log(action);
  switch (action) {
    case 'candidate':
      apiClient.get(`/api/get-candidate/${id}/`, {
        withCredentials: true
      }).then(function (response) {
        const responseData = response.data;
        localStorage.setItem('responseData', JSON.stringify(responseData));
        // Save the candidate data to localStorage
        //localStorage.setItem('candidateData', JSON.stringify(candidateData));

        // Redirect to profile.html
        window.location.href = "profile.html";
      }).catch(function (error) {
        console.error("Error fetching candidate data:", error);
        alert("Failed to fetch candidate data. Please try again.");
      });
      break;
    case 'client':
    case 'lead':
      apiClient.get(`/${id}/get-client/`, {
        withCredentials: true
      }).then(function (response) {
        const clientData = response.data;
        localStorage.setItem('clientData', JSON.stringify(clientData));
        console.log(clientData);
        window.location.href = "profile-client.html";
      }).catch(function (error) {
        alert('Error loading client!');
        console.log(error);
      });
      break;
    case 'job':
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
      break;
  }
}