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
            console.log('Handling click for result:', result);
            
            try {
                // Consistent API URL structure
                const detailsUrl = `/api/${result.type}s/${result.id}/`;  // Note: pluralizes the type

                const response = await fetch(detailsUrl, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    credentials: 'include'
                });

                if (!response.ok) {
                    throw new Error(`Failed to fetch details: ${response.status}`);
                }

                const detailData = await response.json();
                
                // Store the full details in localStorage
                localStorage.setItem('selectedItem', JSON.stringify({
                    ...detailData,
                    type: result.type  // Make sure to preserve the type
                }));

                // Navigate to the appropriate page using proper URL construction
                const pageUrls = {
                    candidate: '/candidates/profile',
                    job: '/jobs/details',
                    client: '/clients/profile'
                };

                const targetUrl = pageUrls[result.type];
                if (targetUrl) {
                    window.location.href = targetUrl;
                } else {
                    console.error('Unknown result type:', result.type);
                }
            } catch (error) {
                console.error('Error handling result click:', error);
                this.error = 'Failed to load details. Please try again.';
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