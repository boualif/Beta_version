document.addEventListener('alpine:init', () => {
    Alpine.data('reminderApp', () => ({
        // State
        counts: {
            today: 0,
            scheduled: 0,
            flagged: 0,
            completed: 0
        },
        userLists: [],
        showNewListModal: false,
        showNewReminderModal: false,
        newListTitle: '',
        newReminder: {
            title: '',
            due_date: '',
            notes: '',
            priority: 'medium'
        },
        selectedListId: null, // Add this
        phrases: [],
        newPhraseText: '',
        newNoteText: '',
        notes: [], // Add this line



        // Replace openListPhrases with openListNotes
    async openListNotes(listId) {
        this.selectedListId = listId;
        const list = this.userLists.find(list => list.id === listId);
        this.selectedListTitle = list ? list.title : 'List';
        this.newNoteText = '';

        try {
            const response = await apiClient.get(`/api/lists/${listId}/notes/`, {
                withCredentials: true,
                headers: {
                    'X-CSRFToken': Cookies.get('csrftoken')
                }
            });
            this.notes = response.data.map(note => ({
                text: note.text,
                checked: note.checked
            }));
        } catch (error) {
            console.error('Error fetching notes:', error);
            this.notes = [];
        }

        this.showPhrasesModal = true;
    },
    async saveNotes() {
        try {
            console.log('Sending notes data:', {
                notes: this.notes
            });
            const response = await apiClient.post(`/api/lists/${this.selectedListId}/notes/`, {
                notes: this.notes
            }, {
                withCredentials: true,
                headers: {
                    'X-CSRFToken': Cookies.get('csrftoken'),
                    'Content-Type': 'application/json'
                }
            });
            console.log('Server response:', response);
            this.closePhrasesModal();
        } catch (error) {
            console.error('Error saving notes:', error);
            console.error('Error response:', error.response?.data);
        }
    },
// Add this to the reminderApp data object
// Add this to the reminderApp data object

// Add this to the reminderApp data object
confirmDeleteList(listId) {
    this.createDeleteListModal(); // Ensure the modal exists
    this.showDeleteListModal(listId);
},

async deleteList(listId) {
    try {
        await apiClient.delete(`/api/lists/${listId}/delete/`, {
            withCredentials: true,
            headers: {
                'X-CSRFToken': Cookies.get('csrftoken')
            }
        });

        // Remove from UI
        this.userLists = this.userLists.filter(list => list.id !== listId);

        // Update counts
        await this.loadCounts();
    } catch (error) {
        console.error('Error deleting list:', error);
    }
},
// Fonction pour afficher la modale de suppression d'un job
showDeleteListModal(listId) {
    return new Promise((resolve) => {

        const modal = document.getElementById('deleteListModal');
        const cancelButton = document.getElementById('cancelDeleteList');
        const confirmButton = document.getElementById('confirmDeleteList');
        confirmButton.addEventListener('click', async () => {
            await this.deleteList(listId)
            modal.classList.add('hidden');
            resolve(true);
        });
        // Afficher la modale
        modal.classList.remove('hidden');

        // Gérer le clic sur "Annuler"
        cancelButton.addEventListener('click', () => {
            modal.classList.add('hidden'); // Masquer la modale
            resolve(false); // Résoudre la promesse avec `false` (l'utilisateur a annulé)
        });
    });
},
createDeleteListModal() {
    // Vérifier si la modale existe déjà
    if (!document.getElementById('deleteListModal')) {
        document.body.insertAdjacentHTML('beforeend', `
            <div id="deleteListModal" class="hidden fixed inset-0 z-50 overflow-y-auto bg-gray-500 bg-opacity-75 flex items-center justify-center">
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
                                    Delete List
                                </h3>
                                <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                    Are you sure you want to delete this list? This action cannot be undone.
                                </p>
                            </div>
                        </div>
                        <div class="mt-6 flex justify-end gap-3">
                            <button type="button" id="cancelDeleteList" class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:bg-boxdark dark:text-white dark:border-strokedark">
                                Cancel
                            </button>
                            <button type="button" id="confirmDeleteList" class="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `);
    }
},
    addNote() {
        if (this.newNoteText.trim()) {
            this.notes.push({
                text: this.newNoteText.trim(),
                checked: false
            });
            this.newNoteText = '';
        }
    },

    deleteNote(index) {
        this.notes.splice(index, 1);
    },

    async saveNotes() {
        try {
            await apiClient.post(`/api/lists/${this.selectedListId}/notes/`, {
                notes: this.notes
            }, {
                withCredentials: true,
                headers: {
                    'X-CSRFToken': Cookies.get('csrftoken')
                }
            });
            this.closePhrasesModal();
        } catch (error) {
            console.error('Error saving notes:', error);
        }
    },

    closePhrasesModal() {
        this.showPhrasesModal = false;
        this.selectedListId = null;
        this.selectedListTitle = '';
        this.notes = [];
        this.newNoteText = '';
    },





        // Initialize
        async init() {
            try {
                // Get lists
                await this.fetchLists();
                
                // Get first list to show if it exists
                if (this.userLists.length > 0) {
                    this.selectedList = this.userLists[0].id;
                    // Get all reminders for first list
                    this.reminders = await this.fetchReminders(this.selectedList);
                } else {
                    this.reminders = [];
                }
                
                // Load counts
                await this.loadCounts();
        
                document.addEventListener('reminderCompletionChanged', async (event) => {
                    const { reminderId, isCompleted } = event.detail;
                    await this.loadCounts();
                });
            } catch (error) {
                console.error('Error initializing:', error);
                this.reminders = [];
            }
        },

        async loadCounts() {
            this.counts = await this.fetchCounts();
        },

        async fetchCounts() {
            try {
                const response = await apiClient.get('/api/reminders/counts/', {
                    withCredentials: true,
                    headers: {
                        'X-CSRFToken': Cookies.get('csrftoken')
                    }
                });
                console.log('response counts', response.data)
                return response.data;
            } catch (error) {
                console.error('Error fetching reminder counts:', error);
                return { today: 0, scheduled: 0, flagged: 0, completed: 0 };
            }
        },

        async fetchLists() {
            try {
                const response = await apiClient.get('/api/lists/', {
                    withCredentials: true,
                    headers: {
                        'X-CSRFToken': Cookies.get('csrftoken')
                    }
                });
                // Filter out the "Default List"
                this.userLists = response.data.filter(list => list.title !== "Default List");
            } catch (error) {
                console.error('Error fetching lists:', error);
                this.userLists = [];
            }
        },
        

        async createList() {
            if (!this.newListTitle.trim()) return;
        
            try {
                const response = await apiClient.post('/api/lists/create/', {  // Updated URL
                    title: this.newListTitle,
                    color: "#007AFF",
                    icon: "list"
                }, {
                    withCredentials: true,
                    headers: {
                        'X-CSRFToken': Cookies.get('csrftoken')
                    }
                });
        
                if (response.status === 201) {
                    this.userLists.push(response.data);
                    this.newListTitle = '';
                    this.showNewListModal = false;
                    await this.loadCounts();
                } else {
                    console.error('Failed to create list:', response);
                }
            } catch (error) {
                console.error('Error creating list:', error);
            }
        },

        async fetchReminders(listId) {
            try {
                let url = `/api/reminders/`;
                if (listId) {
                    url = `/api/reminders/list/${listId}/`;
                }
                const response = await apiClient.get(url, {
                    withCredentials: true,
                    headers: {
                        'X-CSRFToken': Cookies.get('csrftoken'),
                    },
                });
                return response.data;
            } catch (error) {
                console.error('Error fetching reminders:', error);
                return [];
            }
        },

        async createReminder() {
            try {
                const response = await apiClient.post('/api/reminders/create/', this.newReminder, {
                    withCredentials: true,
                    headers: {
                        'X-CSRFToken': Cookies.get('csrftoken')
                    }
                });

                // Reset form and update counts
                this.newReminder = {
                    title: '',
                    due_date: '',
                    notes: '',
                    priority: 'medium'
                };
                this.showNewReminderModal = false;
                await this.fetchCounts();
                notifications.showSuccess('Reminder created successfully');
            } catch (error) {
                console.error('Error creating reminder:', error);
                notifications.showError('Failed to create reminder');
            }
        },
          
        closeModal() {
            this.showNewListModal = false;
            this.showNewReminderModal = false;
            this.newListTitle = '';
            this.newReminder = {
                title: '',
                due_date: '',
                notes: '',
                priority: 'medium'
            };
        }
    }));
    
});