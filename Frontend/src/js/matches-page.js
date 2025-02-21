// matches-page.js

// matches-page.js

function displayMatches() {
    const matchesData = sessionStorage.getItem('matchingResults');
    const jobId = sessionStorage.getItem('currentJobId');

    if (!matchesData) {
        console.error('No match data found');
        return;
    }

    const data = JSON.parse(matchesData);
    const matchesList = document.getElementById('matches-list');
    const totalMatchesElement = document.getElementById('total-matches');

    totalMatchesElement.textContent = data.total_matches || 0;

    // Add select all checkbox before the matches list
    const selectAllContainer = document.createElement('div');
    selectAllContainer.className = 'bg-white p-4 mb-4 rounded-lg shadow-md flex items-center gap-2';
    selectAllContainer.innerHTML = `
        <input type="checkbox" 
               id="select-all-checkbox"
               class="h-5 w-5 rounded border-gray-300 cursor-pointer">
        <label for="select-all-checkbox" class="text-gray-700 font-medium cursor-pointer">
            Select All Candidates
        </label>
    `;
    matchesList.parentNode.insertBefore(selectAllContainer, matchesList);

    matchesList.innerHTML = data.matches.map(candidate => `
        <div class="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200">
            <div class="flex items-start gap-4">
                <input type="checkbox" 
                       class="candidate-checkbox mt-1 h-5 w-5 rounded border-gray-300 cursor-pointer"
                       data-candidate-id="${candidate.candidate_id}"
                       data-candidate-name="${candidate.name}">
                <div class="flex-1">
                    <div class="flex justify-between items-start mb-2">
                        <h3 class="text-lg font-semibold">${candidate.name}</h3>
                    </div>
                    <p class="text-gray-600">Titled Post: ${candidate.job_title}</p>                    
                </div>
            </div>
        </div>
    `).join('');

    // Add event listener for select all checkbox
    const selectAllCheckbox = document.getElementById('select-all-checkbox');
    selectAllCheckbox.addEventListener('change', (e) => {
        const candidateCheckboxes = document.querySelectorAll('.candidate-checkbox');
        candidateCheckboxes.forEach(checkbox => {
            checkbox.checked = e.target.checked;
        });
        updateSelectedCount();
    });

    updateSelectedCount();
}

function getScoreColorClass(score) {
    if (score >= 85) return 'bg-green-100 text-green-800';
    if (score >= 70) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
}

function getRecommendationColorClass(recommendation) {
    switch (recommendation) {
        case 'Highly Recommended':
            return 'text-green-600';
        case 'Recommended':
            return 'text-yellow-600';
        default:
            return 'text-red-600';
    }
}

function viewCandidateProfile(candidateId) {
    window.location.href = `/candidate-profile.html?id=${candidateId}`;
}

function updateSelectedCount() {
    try {
        const selectedCount = document.querySelectorAll('.candidate-checkbox:checked').length;
        const analyzeButton = document.querySelector('button[onclick="processSelectedCandidates()"]');
        const selectAllCheckbox = document.getElementById('select-all-checkbox');
        const totalCheckboxes = document.querySelectorAll('.candidate-checkbox').length;
        
        console.log('Updating selected count:', selectedCount);
        
        // Update select all checkbox state
        if (selectAllCheckbox) {
            selectAllCheckbox.checked = selectedCount === totalCheckboxes && totalCheckboxes > 0;
            selectAllCheckbox.indeterminate = selectedCount > 0 && selectedCount < totalCheckboxes;
        }
        
        if (analyzeButton) {
            analyzeButton.textContent = `Analyze (${selectedCount})`;
            analyzeButton.disabled = selectedCount === 0;
        } else {
            console.error('Analyze button not found');
        }
    } catch (error) {
        console.error('Error updating selected count:', error);
    }
}

async function processSelectedCandidates() {
    const checkboxes = document.querySelectorAll('.candidate-checkbox:checked');
    const selectedCandidates = Array.from(checkboxes).map(checkbox => ({
        id: checkbox.dataset.candidateId,
        name: checkbox.dataset.candidateName
    }));

    if (selectedCandidates.length === 0) {
        alert('Please select at least one candidate to analyze.');
        return;
    }

    try {
        const jobId = sessionStorage.getItem('currentJobId');
        if (!jobId) throw new Error('Job ID not found');

        // Store selected candidates for the analysis page
        sessionStorage.setItem('selectedCandidates', JSON.stringify(selectedCandidates));

        // Redirect to analysis page
        window.location.href = '/candidate-analysis.html';
    } catch (error) {
        console.error('Error:', error);
        alert(error.message);
    }
}

function debugFileStructure() {
    console.log('Current location:', window.location.href);
    console.log('Pathname:', window.location.pathname);
    console.log('Origin:', window.location.origin);
    
    const scripts = document.getElementsByTagName('script');
    console.log('Loaded scripts:');
    Array.from(scripts).forEach(script => {
        console.log('Script src:', script.src);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    debugFileStructure();
    console.log('matches-page.js loaded');
    console.log('Current path:', window.location.pathname);
    displayMatches();
    setupFilters();

    // Add event listener for checkbox changes
    document.addEventListener('change', event => {
        if (event.target.type === 'checkbox') {
            updateSelectedCount();
        }
    });
});

function setupFilters() {
    const filterInput = document.getElementById('filter-input');
    const filterBtn = document.getElementById('filter-btn');

    if (filterInput && filterBtn) {
        filterBtn.addEventListener('click', () => {
            filterCandidates(filterInput.value);
        });

        filterInput.addEventListener('input', event => {
            filterCandidates(event.target.value);
        });
    }
}

function filterCandidates(searchTerm) {
    const cards = document.querySelectorAll('#matches-list > div');
    searchTerm = searchTerm.toLowerCase();

    cards.forEach(card => {
        const text = card.textContent.toLowerCase();
        card.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}
