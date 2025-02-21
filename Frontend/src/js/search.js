document.addEventListener('alpine:init', () => {
    Alpine.data('search', () => ({
        query: '',
        results: [],
        loading: false,
        showResults: false,
        error: null,
        
        async performSearch() {
            if (!this.query.trim()) {
                this.results = [];
                this.showResults = false;
                return;
            }
            
            this.loading = true;
            this.showResults = true;
            this.error = null;
            
            try {
                const response = await fetch(`/api/search/?q=${encodeURIComponent(this.query)}`, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    credentials: 'include'
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                this.results = data.results;
                console.log('Search results:', this.results);
                
            } catch (error) {
                console.error('Search error:', error);
                this.error = 'Search failed. Please try again.';
                this.results = [];
            } finally {
                this.loading = false;
            }
        },

        async handleResultClick(result) {
            console.log('Clicked result:', result);
            try {
                if (result.type === 'candidate') {
                    // Faire l'appel API en utilisant l'URL fournie par le backend
                    const response = await apiClient.get(`/api/get-candidate/${result.id}/`, {
                        withCredentials: true,
                        headers: {
                            'X-CSRFToken': Cookies.get('csrftoken')
                        }
                    });
        
                    // Stocker les données
                    localStorage.setItem('responseData', JSON.stringify(response.data));
                    
                    // Rediriger vers la page profile
                    window.location.href = `profile.html?candidateId=${result.id}`;
                } else if (result.type === 'job') {
                    const response = await apiClient.get(`/job/get-job/${result.id}/`, {
                        withCredentials: true
                    });
                    localStorage.setItem('jobData', JSON.stringify(response.data));
                    window.location.href = "job-details.html";
                }
                else if (result.type === 'client') {
                    const response = await apiClient.get(`/${result.id}/get-client/`, {
                        withCredentials: true,
                    headers: {
                        'Accept': 'application/json',
                            'Content-Type': 'application/json',
                            'X-CSRFToken': Cookies.get('csrftoken')
                        }
                    });
 
                    if (response.data) {
                        localStorage.setItem('clientData', JSON.stringify(response.data));
                        window.location.href = "profile-client.html";
                    }
                }
                
                // Ajouter d'autres types si nécessaire
            } catch (error) {
                console.error('Error handling result click:', error);
                this.error = 'Failed to load details';
            }
        },
        init() {
            // Debounce search input
            let debounceTimeout;
            this.$watch('query', () => {
                clearTimeout(debounceTimeout);
                debounceTimeout = setTimeout(() => {
                    this.performSearch();
                }, 300);
            });

            // Close results when clicking outside
            document.addEventListener('click', (event) => {
                if (!this.$el.contains(event.target)) {
                    this.showResults = false;
                }
            });
        }
    }));
});