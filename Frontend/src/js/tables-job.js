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
      
      // Ensure both dates are set to the creation date
      const creationDate = new Date().toISOString().split('T')[0];
      jobData.added_at = creationDate;
      jobData.opening_date = creationDate;
      
      console.log('Job data with synced dates:', jobData);
      localStorage.setItem('jobData', JSON.stringify(jobData));
      window.location.href = "job-details.html";
    })
    .catch(function (error) {
      console.log('Error fetching job:', error);
    });
}

let currentPage = 1;
let totalPages = 1;
let perPage = 10;

// Function to format date for display
function formatDate(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '-';
  
  // Format as "MMM DD, YYYY"
  return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
  });
}

function fetchJobs(page = 1, perPage = 5) {
  apiClient.get(`/job/list/?page=${page}&per_page=${perPage}`, { withCredentials: true })
    .then(function (response) {
      const jobs = response.data.items;
      const totalItems = parseInt(response.data.total_items) || 0;
      currentPage = parseInt(response.data.page) || 1;
      totalPages = parseInt(response.data.total_pages) || 1;

      const tbody = document.getElementById('jobTableBody');
      tbody.innerHTML = '';
      
      jobs.forEach(job => {
        apiClient.get(`/job/get-job/${job.idJob}/`, { withCredentials: true })
          .then(function(jobResponse) {
            const fullJobData = jobResponse.data;
        var row;
            const publicationDate = job.added_at || '-';

            console.log('publicationDate',publicationDate)
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
                    <p class="text-black dark:text-white">${publicationDate}</p>
              </td>
              <td class="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                    <p class="text-black dark:text-white">${fullJobData.deadline_date || '-'}</p>
              </td>
              <td class="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                    <p class="text-black dark:text-white">${job.location || '-'}</p>
              </td>
              <td class="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                    <p class="text-black dark:text-white">${job.nb_positions || '-'}</p>
              </td>
              <td class="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                <p class="jobStatus"></p>
              </td>
              <td class="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                    <p class="text-black dark:text-white">${job.ownerRH || '-'}</p>
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
                    <p class="text-black dark:text-white">${publicationDate}</p>
              </td>
              <td class="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                    <p class="text-black dark:text-white">${fullJobData.deadline_date || '-'}</p>
              </td>
              <td class="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                    <p class="text-black dark:text-white">${job.location || '-'}</p>
              </td>
              <td class="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                    <p class="text-black dark:text-white">${job.nb_positions || '-'}</p>
              </td>
              <td class="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                <p class="jobStatus"></p>
              </td>
              <td class="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                    <p class="text-black dark:text-white">${job.ownerRH || '-'}</p>
              </td>
            </tr>`;
        }
            
        tbody.insertAdjacentHTML('beforeend', row);
        const jobStatus = tbody.querySelector('tr:last-child .jobStatus');
        const status = job.status;

        if (status === "Open") {
            jobStatus.className = "inline-flex rounded-full bg-success bg-opacity-10 px-3 py-1 text-sm font-medium text-success";
            jobStatus.textContent = status;
            } else if (status === "Inactif") {
            jobStatus.className = "inline-flex rounded-full bg-danger bg-opacity-10 px-3 py-1 text-sm font-medium text-success";
            jobStatus.textContent = status;
        } else if (status === "To_Treat") {
            jobStatus.className = "inline-flex rounded-full bg-warning bg-opacity-10 px-3 py-1 text-sm font-medium text-warning";
            jobStatus.textContent = status;
            } else if (status === "Untreated") {
          jobStatus.className = "inline-flex rounded-full bg-black bg-opacity-90 px-3 py-1 text-sm font-medium text-white";
          jobStatus.textContent = status;
        } else {
              jobStatus.className = "";
        }
          })
          .catch(function (error) {
            console.log('Error fetching job details:', error);
          });
              });

      // Update pagination information
      document.getElementById('totalItems').innerText = totalItems;
      document.getElementById('startItem').innerText = (currentPage - 1) * perPage + 1;
      document.getElementById('endItem').innerText = Math.min(currentPage * perPage, totalItems);

      // Generate pagination controls
      generatePaginationControls();
    })
    .catch(function (error) {
      console.log('Error in main jobs fetch:', error);
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
                  // Rafraîchir la liste des jobs après la suppression
                  fetchJobs(currentPage, perPage);
              }
      })
          .catch((error) => {
              console.error("Error deleting job:", error);
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