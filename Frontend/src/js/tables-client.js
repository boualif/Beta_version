function fetchClients() {
    apiClient.get('/list/', { withCredentials: true })
        .then(function (response) {
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
                }
                else {
                   row =  `
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
                console.log(client.id)
            });
        })
        .catch(function (error) {
            console.log('Error fetching clients:', error);
        });
}
// Déplacer la création du modal dans une fonction séparée
function createDeleteModal() {
    // Vérifier si le modal existe déjà
    if (!document.getElementById('deleteModal')) {
        document.body.insertAdjacentHTML('beforeend', `
            <div id="deleteModal" class="hidden fixed inset-0 z-50 overflow-y-auto bg-gray-500 bg-opacity-75 flex items-center justify-center">
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
                                    Supprimer le client
                                </h3>
                                <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                    Êtes-vous sûr de vouloir supprimer ce client ? Cette action est irréversible.
                                </p>
                            </div>
                        </div>
                        <div class="mt-6 flex justify-end gap-3">
                            <button type="button" id="cancelDelete" class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:bg-boxdark dark:text-white dark:border-strokedark">
                                Annuler
                            </button>
                            <button type="button" id="confirmDelete" class="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                                Supprimer
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `);
    }
}
window.onload = () => {
    if (is_superuser === "true") {
        document.getElementById("headerClient").innerHTML += `
            <th class="min-w-[150px] px-4 py-4 font-medium text-black dark:text-white">
                Actions
            </th>`;
    }
    createDeleteModal(); // Créer le modal au chargement
    fetchClients();
};
// Delete function
// Modifier la fonction deleteClient
function deleteClient(id) {
    // Créer le modal s'il n'existe pas
    createDeleteModal();

    // Récupérer les éléments après leur création
    const modal = document.getElementById('deleteModal');
    const confirmBtn = document.getElementById('confirmDelete');
    const cancelBtn = document.getElementById('cancelDelete');

    // Fonction pour fermer le modal
    const closeModal = () => {
        modal.classList.add('hidden');
        cleanup();
    };

    // Gérer la confirmation
    const handleConfirm = () => {
        apiClient
            .delete(`/${id}/client/delete/`, {
                withCredentials: true,
                headers: {
                    'X-CSRFToken': Cookies.get('csrftoken'),
                },
            })
            .then((response) => {
                console.log("Client deleted successfully:", response.data);
                window.location.href = "tables-client.html";
            })
            .catch((error) => {
                console.error("Error deleting client:", error);
            })
            .finally(() => {
                closeModal();
            });
    };

    // Nettoyer les event listeners
    const cleanup = () => {
        confirmBtn.removeEventListener('click', handleConfirm);
        cancelBtn.removeEventListener('click', closeModal);
        document.removeEventListener('keydown', handleEscape);
    };

    // Gérer la touche Escape
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
    };

    // Ajouter les event listeners
    confirmBtn.addEventListener('click', handleConfirm);
    cancelBtn.addEventListener('click', closeModal);
    document.addEventListener('keydown', handleEscape);

    // Afficher le modal
    modal.classList.remove('hidden');
}

function getClient(id) {
    apiClient.get(`/${id}/get-client/`, { withCredentials: true })
        .then(function (response) {
            const clientData = response.data;
            localStorage.removeItem("clientData");
            localStorage.setItem('clientData', JSON.stringify(clientData));
            console.log(clientData);
            window.location.href = "profile-client.html";
        })
        .catch(function (error) {
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
                    </th>`
    }
    fetchClients();
}
