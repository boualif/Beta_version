function editJob(jobId) {
  // Redirect or open edit modal for the job
  window.location.href = `edit-job.html?job=${jobId}`;
}

function getClient(id) {
  apiClient.get(`/${id}/get-client/`, { withCredentials: true })
    .then(function (response) {
      const clientData = response.data;
      localStorage.setItem('clientData', JSON.stringify(clientData));
      window.location.href = "profile-client.html";
    })
    .catch(function (error) {
      console.log('Error fetching clients:', error);
    });
}

function getJob(id) {
  apiClient.get(`/job/get-job/${id}/`, { withCredentials: true })
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
let currentPage = 1;
let totalPages = 1;
let perPage = 10;

function fetchJobs(page = 1, perPage = 5) {
  apiClient.get(`/job/list/?page=${page}&per_page=${perPage}`, { withCredentials: true })
    .then(function (response) {
      const jobs = response.data.items;
      const totalItems = parseInt(response.data.total_items) || 0; // Assurez-vous que totalItems est un nombre
      currentPage = parseInt(response.data.page) || 1; // Assurez-vous que currentPage est un nombre
      totalPages = parseInt(response.data.total_pages) || 1; // Assurez-vous que totalPages est un nombre

      // Mettre à jour l'affichage des jobs (votre code existant)
      const tbody = document.getElementById('jobTableBody');
      tbody.innerHTML = ''; // Effacer les lignes existantes
      jobs.forEach(job => {
        var row;
        if (is_superuser === "true") {
          row = `
            <tr>
              <td class="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                <div class="flex justify-start items-center gap-3 p-1.5">
                  <div class="flex-shrink-0">
                    <img src="data:image/jpeg;base64,${job.image}" class="w-14 h-14 rounded-full border border-gray-300 dark:border-gray-700" alt="Brand" />
                  </div>
                  <p class="hidden font-medium text-black dark:text-white sm:block">
                    <a onclick="getJob(${job.idJob})" class="cursor-pointer hover:text-primary">${job.title}</a>
                  </p>
                </div>
              </td>
              <td class="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                <a onclick="getClient(${job.idClient})" class="cursor-pointer hover:text-primary">${job.client}</a>
              </td>
              <td class="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                <p class="text-black dark:text-white">Jan 13, 2023</p>
              </td>
              <td class="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                <p class="text-black dark:text-white">Feb 13, 2023</p>
              </td>
              <td class="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                <p class="text-black dark:text-white">${job.location}</p>
              </td>
              <td class="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                <p class="text-black dark:text-white">${job.nb_positions}</p>
              </td>
              <td class="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                <p class="jobStatus"></p>
              </td>
              <td class="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                <p class="text-black dark:text-white">${job.ownerRH}</p>
              </td>
              <td class="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                <a href="javascript:void(0)" onclick="deleteJob(${job.idJob})" class="top-4 right-14 text-red-500 hover:text-red-700 transition">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </a>
              </td>
            </tr>`;
        } else {
          row = `
            <tr>
              <td class="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                <div class="flex justify-start items-center gap-3 p-1.5">
                  <div class="flex-shrink-0">
                    <img src="data:image/jpeg;base64,${job.image}" class="w-14 h-14 rounded-full border border-gray-300 dark:border-gray-700" alt="Brand" />
                  </div>
                  <p class="hidden font-medium text-black dark:text-white sm:block">
                    <a onclick="getJob(${job.idJob})" class="cursor-pointer hover:text-primary">${job.title}</a>
                  </p>
                </div>
              </td>
              <td class="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                <a onclick="getClient(${job.idClient})" class="cursor-pointer hover:text-primary">${job.client}</a>
              </td>
              <td class="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                <p class="text-black dark:text-white">Jan 13, 2023</p>
              </td>
              <td class="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                <p class="text-black dark:text-white">Feb 13, 2023</p>
              </td>
              <td class="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                <p class="text-black dark:text-white">${job.location}</p>
              </td>
              <td class="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                <p class="text-black dark:text-white">${job.nb_positions}</p>
              </td>
              <td class="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                <p class="jobStatus"></p>
              </td>
              <td class="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                <p class="text-black dark:text-white">${job.ownerRH}</p>
              </td>
            </tr>`;
        }
        tbody.insertAdjacentHTML('beforeend', row);
        const jobStatus = tbody.querySelector('tr:last-child .jobStatus');
        const status = job.status;

        if (status === "Open") {
            jobStatus.className = "inline-flex rounded-full bg-success bg-opacity-10 px-3 py-1 text-sm font-medium text-success";
            jobStatus.textContent = status;
        } else if (status === "Closed") {
            jobStatus.className = "inline-flex rounded-full bg-danger bg-opacity-10 px-3 py-1 text-sm font-medium text-success";
            jobStatus.textContent = status;
        } else if (status === "To_Treat") {
            jobStatus.className = "inline-flex rounded-full bg-warning bg-opacity-10 px-3 py-1 text-sm font-medium text-warning";
            jobStatus.textContent = status;
        } else if (status === "Blocked") {
          jobStatus.className = "inline-flex rounded-full bg-black bg-opacity-90 px-3 py-1 text-sm font-medium text-white";
          jobStatus.textContent = status;
        } else {
            jobStatus.className = ""; // Cas par défaut si le statut n'est pas reconnu
        }
              });

      // Mettre à jour les informations de pagination
      document.getElementById('totalItems').innerText = totalItems;
      document.getElementById('startItem').innerText = (currentPage - 1) * perPage + 1;
      document.getElementById('endItem').innerText = Math.min(currentPage * perPage, totalItems);

      // Générer les contrôles de pagination
      generatePaginationControls();
    })
    .catch(function (error) {
      console.log('Error fetching jobs:', error);
    });
}

function generatePaginationControls() {
  const paginationNav = document.getElementById('paginationNav');
  paginationNav.innerHTML = ''; // Clear old pagination

  // Previous button
  const prevButton = `<a href="#" onclick="fetchJobs(${currentPage - 1})" class="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 ${currentPage === 1 ? 'disabled' : ''}">
                            <span class="sr-only">Previous</span>
                            <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clip-rule="evenodd" />
                            </svg>
                        </a>`;
  paginationNav.insertAdjacentHTML('beforeend', prevButton);

  // Page numbers
  for (let i = 1; i <= totalPages; i++) {
    const pageButton = `<a href="#" onclick="fetchJobs(${i})" class="relative inline-flex items-center px-4 py-2 text-sm font-semibold ${i === currentPage ? 'bg-indigo-600 text-white' : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50'} focus:z-20">
                                ${i}
                            </a>`;
    paginationNav.insertAdjacentHTML('beforeend', pageButton);
  }

  // Next button
  const nextButton = `<a href="#" onclick="fetchJobs(${currentPage + 1})" class="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 ${currentPage === totalPages ? 'disabled' : ''}">
                            <span class="sr-only">Next</span>
                            <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" />
                            </svg>
                        </a>`;
  paginationNav.insertAdjacentHTML('beforeend', nextButton);
}




function deleteJob(jobId) {
  // Confirmation and deletion logic
  if (confirm('Are you sure you want to delete this job?')) {
    apiClient.delete(`/job/${jobId}/delete/`,
      {
        withCredentials: true,
        headers: {
          'X-CSRFToken': Cookies.get('csrftoken'),  // Manually extract the CSRF token
        },
      }
    )
      .then(function (response) {
        alert('Job deleted successfully!');
        // Refresh the job table or redirect
      })
      .catch(function (error) {
        console.error('There was an error deleting the job!', error);
      });
  }
}
document.addEventListener('DOMContentLoaded', fetchJobs);
if (is_superuser === "true") {
  document.getElementById("headerJobs").innerHTML += `
                      <th class="min-w-[150px] px-4 py-4 font-medium text-black dark:text-white">
                    Actions
                </th>`
}