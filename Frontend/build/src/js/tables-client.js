function fetchClients() {
  apiClient.get('/list/', {
    withCredentials: true
  }).then(function (response) {
    const clients = response.data;
    const tbody = document.getElementById('clientTableBody');
    tbody.innerHTML = ''; // Clear existing rows

    clients.forEach(client => {
      var row;
      if (is_superuser === "true") {
        row = `
                    <tr>
                        <td class="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                            <div class="flex items-center gap-3 p-2.5 xl:p-5">
                                <div class="flex-shrink-0">
                                    <img src="data:image/jpeg;base64,${client.image}" class="w-14 h-14 rounded-full border border-gray-300 dark:border-gray-700" alt="Brand"/>
                                </div>
                                <p class="hidden font-medium text-black dark:text-white sm:block cursor-pointer">
                                    <a onclick="getClient(${client.id})" id="profile" class="hover:text-primary">
                                        ${client.company}
                                    </a>
                                </p>
                            </div>
                        </td>
                        <td class="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                            <p class="text-black dark:text-white">${client.industry}</p>
                        </td>
                        <td class="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                            <p class="text-black dark:text-white">${client.engagement_type}</p>
                        </td>
                        <td class="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                            <p class="inline-flex rounded-full bg-info bg-opacity-10 px-3 py-1 text-sm font-medium text-info">
                                ${client.status}
                            </p>
                        </td>
                        <td class="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                            <p class="text-black dark:text-white">${client.key_account_manager}</p>
                        </td>
                        <td class="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                            <p class="text-black dark:text-white">${new Date(client.added_at).toLocaleDateString()}</p>
                        </td>
                        <td class="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                                    <a href="javascript:void(0)" onclick="deleteClient(${client.id})" class="text-red-500 hover:text-red-700 transition">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                        </a>
                    </td>
                    </tr>
                `;
      } else {
        row = `
                    <tr>
                        <td class="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                            <div class="flex items-center gap-3 p-2.5 xl:p-5">
                                <div class="flex-shrink-0">
                                    <img src="data:image/jpeg;base64,${client.image}" class="w-14 h-14 rounded-full border border-gray-300 dark:border-gray-700" alt="Brand"/>
                                </div>
                                <p class="hidden font-medium text-black dark:text-white sm:block cursor-pointer">
                                    <a onclick="getClient(${client.id})" id="profile" class="hover:text-primary">
                                        ${client.company}
                                    </a>
                                </p>
                            </div>
                        </td>
                        <td class="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                            <p class="text-black dark:text-white">${client.industry}</p>
                        </td>
                        <td class="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                            <p class="text-black dark:text-white">${client.engagement_type}</p>
                        </td>
                        <td class="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                            <p class="inline-flex rounded-full bg-info bg-opacity-10 px-3 py-1 text-sm font-medium text-info">
                                ${client.status}
                            </p>
                        </td>
                        <td class="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                            <p class="text-black dark:text-white">${client.key_account_manager}</p>
                        </td>
                        <td class="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                            <p class="text-black dark:text-white">${new Date(client.added_at).toLocaleDateString()}</p>
                        </td>
                    </tr>
                `;
      }
      tbody.insertAdjacentHTML('beforeend', row);
      console.log(client.id);
    });
  }).catch(function (error) {
    console.log('Error fetching clients:', error);
  });
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
function getClient(id) {
  apiClient.get(`/${id}/get-client/`, {
    withCredentials: true
  }).then(function (response) {
    const clientData = response.data;
    localStorage.removeItem("clientData");
    localStorage.setItem('clientData', JSON.stringify(clientData));
    console.log(clientData);
    window.location.href = "profile-client.html";
  }).catch(function (error) {
    alert('Error loading client!');
    console.log(error);
  });
}

// document.addEventListener('DOMContentLoaded', fetchClients);
window.onload = () => {
  if (is_superuser === "true") {
    document.getElementById("headerClient").innerHTML += `
                          <th class="min-w-[150px] px-4 py-4 font-medium text-black dark:text-white">
                        Actions
                    </th>`;
  }
  fetchClients();
};