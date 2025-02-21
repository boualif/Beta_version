// matching-script.js

export function initializeMatching() {
    const startMatchingBtn = document.getElementById('start-matching-btn');
    const loadingOverlay = document.getElementById('loading-overlay');
    
    if (startMatchingBtn) {
        console.log('Matching button found, adding listener');
        startMatchingBtn.addEventListener('click', handleMatchingClick);
    } else {
        console.error('Start Matching button not found');
    }
}

async function handleMatchingClick(e) {
    e.preventDefault();
    const loadingOverlay = document.getElementById('loading-overlay');
    try {
        // Show loading spinner
        if (loadingOverlay) loadingOverlay.classList.remove('hidden');

        // Get job data from localStorage
        const jobData = JSON.parse(localStorage.getItem('jobData'));
        if (!jobData || !jobData.id_Job) {
            throw new Error('Job data not found in localStorage');
        }

        const jobId = jobData.id_Job;
        console.log('Using job ID:', jobId);  // Debug log

        // Call the test-elasticsearch-matching endpoint
        const apiEndpoint = `http://localhost:8000/api/job/test-elasticsearch-matching/${jobId}/`;
        console.log('Calling API endpoint:', apiEndpoint);
        
        const response = await fetch(apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-CSRFToken': Cookies.get('csrftoken')  // Add CSRF token if needed
            },
            credentials: 'include'  // Include credentials if needed
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            const errorMessage = errorData ? JSON.stringify(errorData) : response.statusText;
            throw new Error(`API Error: ${response.status} ${response.statusText}\nDetails: ${errorMessage}`);
        }

        const matchData = await response.json();
        
        // Validate match data structure before storing
        if (!matchData || !matchData.matches) {
            throw new Error('Invalid match data received from server');
        }
        
        // Store the results
        sessionStorage.setItem('matchingResults', JSON.stringify(matchData));
        sessionStorage.setItem('currentJobId', jobId);

        // Redirect to the matches page
        window.location.href = '/matches-page.html';
    } catch (error) {
        console.error('Matching error:', error);
        showError(error.message);
    } finally {
        if (loadingOverlay) loadingOverlay.classList.add('hidden');
    }
}

function showError(message) {
    let errorDiv = document.getElementById('error-message');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.id = 'error-message';
        errorDiv.className = 'bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4';
        const startMatchingBtn = document.getElementById('start-matching-btn');
        startMatchingBtn.parentNode.insertBefore(errorDiv, startMatchingBtn.nextSibling);
    }
    errorDiv.textContent = message;
}