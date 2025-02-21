let selectedCandidateIds = new Set();

async function initializeAnalysis() {
    try {
        showLoading();
        
        // Get selected candidates and job data
        const selectedCandidates = JSON.parse(sessionStorage.getItem('selectedCandidates'));
        const jobId = sessionStorage.getItem('currentJobId');
        
        if (!selectedCandidates || !jobId) {
            throw new Error('Missing required data');
        }

        // Update initial UI
        document.getElementById('selected-count').textContent = selectedCandidates.length;
        
        // Extract candidate IDs to analyze
        const candidateIds = selectedCandidates.map(candidate => candidate.id);
        
        // Fetch analysis from backend with POST request containing candidate IDs
        const analysisResponse = await fetch(`http://localhost:8000/api/analyze-candidate/${jobId}/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ candidate_ids: candidateIds })
        });

        if (!analysisResponse.ok) {
            throw new Error('Failed to fetch analysis');
        }
        
        const analysisData = await analysisResponse.json();
        console.log('Analysis Data:', analysisData);
        
        // Update UI with results
        await updateAnalysisUI(analysisData);
        
    } catch (error) {
        console.error('Analysis error:', error);
        showError(error.message);
    } finally {
        hideLoading();
    }
}
// Initialize selected candidates from session storage
function initializeSelectedCandidates() {
    try {
        const stored = sessionStorage.getItem('selectedCandidates');
        if (stored) {
            selectedCandidates = JSON.parse(stored);
            
            // Sync checkboxes with stored state
            document.querySelectorAll('.candidate-checkbox').forEach(checkbox => {
                const candidateId = checkbox.getAttribute('data-id');
                checkbox.checked = selectedCandidates.some(c => c.id === candidateId);
            });
            
            // Update count display
            const selectedCountElement = document.getElementById('selected-count');
            if (selectedCountElement) {
                selectedCountElement.textContent = selectedCandidates.length;
            }
        }
    } catch (error) {
        console.error('Error initializing selected candidates:', error);
    }
}

// Clear selection helper
function clearSelectedCandidates() {
    selectedCandidates = [];
    sessionStorage.removeItem('selectedCandidates');
    document.querySelectorAll('.candidate-checkbox').forEach(checkbox => {
        checkbox.checked = false;
    });
    const selectedCountElement = document.getElementById('selected-count');
    if (selectedCountElement) {
        selectedCountElement.textContent = '0';
    }
}

async function updateAnalysisUI(analysisData) {
    if (!analysisData || !analysisData.analyses || !Array.isArray(analysisData.analyses)) {
        console.error('Invalid analysis data structure:', analysisData);
        showError('Invalid data received from server');
        return;
    }

    // Sort candidates by final score
    analysisData.analyses.sort((a, b) => {
        const scoreA = parseFloat(String(a.final_score).replace(/[%\s]/g, '')) || 0;
        const scoreB = parseFloat(String(b.final_score).replace(/[%\s]/g, '')) || 0;
        return scoreB - scoreA;
    });

    // Add rank to each candidate
    analysisData.analyses.forEach((analysis, index) => {
        analysis.rank = index + 1;
    });

    // Update match scores chart
    const matchScoresCtx = document.getElementById('match-scores-chart');
    if (matchScoresCtx) {
        // Destroy existing chart if it exists
        if (window.matchScoresChart) {
            window.matchScoresChart.destroy();
        }

        // Create new chart
        window.matchScoresChart = new Chart(matchScoresCtx, {
            type: 'bar',
            data: {
                labels: analysisData.analyses.map(a => a.cv_analysis ? a.cv_analysis.candidate_name : 'Unknown'),
                datasets: [{
                    label: 'Match Score',
                    data: analysisData.analyses.map(a => parseFloat(String(a.final_score).replace(/[%\s]/g, '')) || 0),
                    backgroundColor: analysisData.analyses.map((_, index) => 
                        index === 0 ? 'rgba(234, 179, 8, 0.5)' :
                        index === 1 ? 'rgba(156, 163, 175, 0.5)' :
                        index === 2 ? 'rgba(180, 83, 9, 0.5)' :
                        'rgba(66, 153, 225, 0.5)'
                    ),
                    borderColor: analysisData.analyses.map((_, index) => 
                        index === 0 ? 'rgb(234, 179, 8)' :
                        index === 1 ? 'rgb(156, 163, 175)' :
                        index === 2 ? 'rgb(180, 83, 9)' :
                        'rgb(66, 153, 225)'
                    ),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    }

    // Update other UI elements...
    const skillsBreakdown = document.getElementById('skills-breakdown');
    if (skillsBreakdown) {
        skillsBreakdown.innerHTML = createSkillsBreakdown(analysisData.analyses);
    }

    const profilesContainer = document.getElementById('candidate-profiles');
    if (profilesContainer) {
        profilesContainer.innerHTML = analysisData.analyses
            .filter(analysis => analysis.cv_analysis)
            .map(analysis => createProfileCard(analysis))
            .join('');
    }
}
function createSkillsBreakdown(analyses) {
    return analyses.map(analysis => {
        if (!analysis.cv_analysis) return '';
        
        return `
            <div class="mb-6 p-4 border rounded">
                <h3 class="font-semibold mb-2">${analysis.cv_analysis.candidate_name}</h3>
                <div class="space-y-2">
                    <div>
                        <p class="text-sm font-medium">Skills Match:</p>
                        <div class="flex flex-wrap gap-2 mt-1">
                            ${analysis.cv_analysis.skills_match.map(skill => 
                                `<span class="skill-badge">${skill}</span>`
                            ).join('')}
                        </div>
                    </div>
                    <div>
                        <p class="text-sm font-medium text-red-600">Skills Gaps:</p>
                        <div class="flex flex-wrap gap-2 mt-1">
                            ${analysis.cv_analysis.skills_gaps.map(gap => 
                                `<span class="skill-badge bg-red-100">${gap}</span>`
                            ).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function createExperienceMatch(analyses) {
    return analyses.map(analysis => {
        if (!analysis.cv_analysis) return '';
        
        return `
            <div class="mb-6 p-4 border rounded">
                <h3 class="font-semibold mb-2">${analysis.cv_analysis.candidate_name}</h3>
                <div class="space-y-2">
                    <p>Years of Experience: ${analysis.cv_analysis.years_of_experience}</p>
                    <div>
                        <p class="text-sm font-medium">Experience Match:</p>
                        <ul class="list-disc list-inside text-sm">
                            ${analysis.cv_analysis.job_title_and_experience_match.map(match => 
                                `<li>${match}</li>`
                            ).join('')}
                        </ul>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function createComparisonTableRows(analyses) {
    return `
        <tr>
            <td class="p-3 font-medium">Match Score</td>
            ${analyses.map(a => `
                <td class="p-3">${a.final_score || 0}%</td>
            `).join('')}
        </tr>
        <tr>
            <td class="p-3 font-medium">Skills Score</td>
            ${analyses.map(a => `
                <td class="p-3">${a.cv_analysis ? a.cv_analysis.skills_score : 'N/A'}</td>
            `).join('')}
        </tr>
        <tr>
            <td class="p-3 font-medium">Experience Score</td>
            ${analyses.map(a => `
                <td class="p-3">${a.cv_analysis ? a.cv_analysis.job_title_and_experience_score : 'N/A'}</td>
            `).join('')}
        </tr>
    `;
}

function createProfileCard(analysis) {
    const score = analysis.final_score || 0;
    const elastic_score = analysis.elastic_match_score || 0;
    let scoreClass = score >= 70 ? 'text-green-500' : score >= 50 ? 'text-yellow-500' : 'text-red-500';
    console.log('Full analysis object:', analysis);
    console.log("CandidateAnalysis ID:", analysis.candidate_id);
    const candidateId = analysis.candidate_id || 'unknown';

    console.log("Opening PDF for candidate:", candidateId);




    return `
        <div class="bg-white rounded-lg shadow p-6 mb-6 w-full">
            <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-4">
                    <div class="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        #${analysis.rank}
                    </div>
                    <div>
                        <h3 class="text-xl font-bold text-gray-800">${analysis.cv_analysis.candidate_name}</h3>
                        <div class="flex items-center mt-1">
                            <span class="text-gray-600">Score: </span>
                            <span class="${scoreClass} font-semibold ml-1">${score}</span>
                        </div>
                    </div>
                </div>
                <div class="flex gap-4">
                    <a href="#" onclick="openPDF('${candidateId}'); return false;" class="inline-flex items-center justify-center rounded-md border border-primary px-6 py-2 text-center font-medium text-primary hover:bg-opacity-90">
                        View CV
                    </a>
                </div>
            </div>

            <div class="grid grid-cols-2 gap-6 mb-6">
                <div class="flex items-center gap-2">
                    <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                    </svg>
                    <span class="text-gray-600">${analysis.cv_analysis.email || 'Email not available'}</span>
                </div>
                <div class="flex items-center gap-2">
                    <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                    <span class="text-gray-600">${analysis.cv_analysis.location || 'Location not available'}</span>
                </div>
                <div class="flex items-center gap-2">
                    <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                    </svg>
                    <span class="text-gray-600">${analysis.cv_analysis.years_of_experience} </span>
                </div>
                <div class="flex items-center gap-2">
                    <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                    </svg>
                    <span class="text-gray-600">Age: ${analysis.cv_analysis.estimated_age}</span>
                </div>
            </div>

            <div class="space-y-4">
                <!-- Scores Section -->
               <!--  <div class="grid grid-cols-2 gap-4">
                    <div class="bg-blue-50 p-4 rounded-lg">
                        <h4 class="font-semibold text-blue-600 mb-2">Scores d'évaluation</h4>
                        <ul class="space-y-2">
                            <li class="text-gray-700">Overall score: ${analysis.cv_analysis.general_score}</li>
                            <li class="text-gray-700">Skills score: ${analysis.cv_analysis.skills_score}</li>
                            <li class="text-gray-700">Experience score: ${analysis.cv_analysis.job_title_and_experience_score}</li>
                        </ul>
                    </div>
                </div>--> 

                <!-- Skills Match -->
                <div>
                    <h4 class="font-semibold text-green-600 mb-2">Matching skills</h4>
                    <div class="bg-green-50 p-4 rounded-lg">
                        <ul class="space-y-2">
                            ${analysis.cv_analysis.skills_match.map(skill => 
                                `<li class="text-gray-700">${skill}</li>`
                            ).join('')}
                        </ul>
                    </div>
                </div>

                <!-- Experience Match -->
                <div>
                    <h4 class="font-semibold text-green-600 mb-2">Relevant experience</h4>
                    <div class="bg-green-50 p-4 rounded-lg">
                        <ul class="space-y-2">
                            ${analysis.cv_analysis.job_title_and_experience_match.map(exp => 
                                `<li class="text-gray-700">${exp}</li>`
                            ).join('')}
                        </ul>
                    </div>
                </div>

                <!-- Gaps Section -->
                <!-- <div class="grid grid-cols-2 gap-4">
                    <div>
                        <h4 class="font-semibold text-orange-600 mb-2">Skills gaps</h4>
                        <div class="bg-orange-50 p-4 rounded-lg">
                            <ul class="space-y-2">
                                ${analysis.cv_analysis.skills_gaps.map(gap => 
                                    `<li class="text-gray-700">${gap}</li>`
                                ).join('')}
                            </ul>
                        </div>
                    </div>
                    <div>
                        <h4 class="font-semibold text-orange-600 mb-2">Lacunes en expérience</h4>
                        <div class="bg-orange-50 p-4 rounded-lg">
                            <ul class="space-y-2">
                                ${analysis.cv_analysis.job_title_and_experience_gaps.map(gap => 
                                    `<li class="text-gray-700">${gap}</li>`
                                ).join('')}
                            </ul>
                        </div>
                    </div>
                </div>-->

                <!-- Strengths & Weaknesses -->
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <h4 class="font-semibold text-green-600 mb-2">Key strengths</h4>
                        <div class="bg-green-50 p-4 rounded-lg">
                            <ul class="space-y-2">
                                ${analysis.cv_analysis.general_strengths.map(strength => 
                                    `<li class="text-gray-700">${strength}</li>`
                                ).join('')}
                            </ul>
                        </div>
                    </div>
                    <div>
                        <h4 class="font-semibold text-red-600 mb-2">Weak points</h4>
                        <div class="bg-red-50 p-4 rounded-lg">
                            <ul class="space-y-2">
                                ${analysis.cv_analysis.general_weaknesses.map(weakness => 
                                    `<li class="text-gray-700">${weakness}</li>`
                                ).join('')}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <div class="mt-4 flex justify-end">
                <label class="inline-flex items-center">
                    <input type="checkbox" 
                           class="candidate-checkbox form-checkbox h-5 w-5 text-blue-600" 
                           data-id="${candidateId}"
                           data-name="${analysis.cv_analysis.candidate_name || ''}"
                           data-job-title="${analysis.cv_analysis.current_job_title || ''}"
                           data-email="${analysis.cv_analysis.email || ''}"
                           ${selectedCandidateIds.has(candidateId.toString()) ? 'checked' : ''}>
                    <span class="ml-2 text-gray-700">Select Candidate</span>
                </label>
            </div>
        </div>
    `;

}
if (!document.getElementById('pdfModal')) {
    const modal = document.createElement('div');
    modal.id = 'pdfModal';
    modal.innerHTML = `
        <span class="close" onclick="closePDF()">&times;</span>
        <div id="pdfModalContent">
            <iframe id="pdfFrame" src="" frameborder="0" width="100%" height="100%"></iframe>
        </div>
    `;
    document.body.appendChild(modal);
}


async function openPDF(candidateId) {
    if (!candidateId) {
        console.error('No candidate ID provided');
        alert('Candidate ID is missing. Unable to fetch CV.');
        return;
    }

    console.log("Opening PDF for candidate:", candidateId);

    try {
        const response = await apiClient.get(`/api/getcv/${candidateId}/`, {
            withCredentials: true,
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.data || !response.data.file_data || !response.data.file_data.resume_file) {
            throw new Error('Invalid PDF data received.');
        }

        const pdfUrl = `data:application/pdf;base64,${response.data.file_data.resume_file}`;
        const pdfFrame = document.getElementById('pdfFrame');
        if (pdfFrame) {
            pdfFrame.src = pdfUrl;
        } else {
            throw new Error('PDF frame element not found.');
        }

        const pdfModal = document.getElementById('pdfModal');
        if (pdfModal) {
            pdfModal.style.display = 'flex';
        }
    } catch (error) {
        console.error('Error loading PDF:', error);
        alert(`Failed to load CV for candidate ID: ${candidateId}. Please try again.`);
        closePDF();
    }
}

function closePDF() {
    const pdfModal = document.getElementById('pdfModal');
    if (pdfModal) {
        pdfModal.style.display = 'none';
        const pdfFrame = document.getElementById('pdfFrame');
        if (pdfFrame) {
            pdfFrame.src = ''; // Clear the iframe source to release memory
        }
    }
}




// Process selected candidates and move them to the job application board
// In candidate-analysis.js
// Modified processSelectedCandidates function to be job-specific
function processSelectedCandidates() {
    // Get only the checked candidates
    const checkedBoxes = document.querySelectorAll('.candidate-checkbox:checked');
    console.log('Number of checked boxes:', checkedBoxes.length);
    
    if (checkedBoxes.length === 0) {
        notifications.showError('No candidates selected to process.');
        return;
    }

    const jobData = JSON.parse(localStorage.getItem('jobData')) || {};
    const jobId = jobData.id_Job;

    if (!jobId) {
        console.error('No job ID found');
        notifications.showError('Error: Job ID not found');
        return;
    }

    // Create array of only selected candidates
    const selectedCandidates = Array.from(checkedBoxes).map(checkbox => ({
        id: checkbox.getAttribute('data-id'),
        name: checkbox.getAttribute('data-name'),
        jobTitle: checkbox.getAttribute('data-job-title'),
        email: checkbox.getAttribute('data-email'),
        jobId: jobId,
        stage: 'new'
    }));

    console.log('Selected candidates:', selectedCandidates);
    
    // Store only these selected candidates
    sessionStorage.setItem(`selectedCandidates_${jobId}`, JSON.stringify(selectedCandidates));
    localStorage.setItem(`jobApplications_${jobId}`, JSON.stringify(selectedCandidates));

    // Clear the general selection
    sessionStorage.removeItem('selectedCandidates');

    // Redirect to process view
    window.location.href = `job-details.html?process=true&jobId=${jobId}`;
}


function initializeProcess() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('process') === 'true') {
        loadProcess();
        
        // Load saved state if it exists
        const jobId = params.get('jobId');
        const savedState = localStorage.getItem(`jobApplications_${jobId}`);
        if (savedState) {
            const updates = JSON.parse(savedState);
            refreshView(updates);
        }
    }
}
function loadProcess() {
    const originalDiv = document.getElementById('job-info');
    if (originalDiv) {
        originalDiv.remove();
    }

    const saveBtn = document.getElementById('btn-save');
    if (saveBtn) {
        saveBtn.style.display = "block";
        saveBtn.addEventListener('click', saveAppChanges);
    }

    const targetDiv = document.createElement('div');
    targetDiv.id = 'job-info';
    const main_content = document.getElementById("main-job-content");

    fetch('job-applications.html')
        .then(response => response.text())
        .then(data => {
            targetDiv.innerHTML = data;
            main_content.appendChild(targetDiv);

            // Initialize Sortable for all columns
            initializeSortable();

            // Load only the specifically selected candidates
            const selectedCandidates = JSON.parse(sessionStorage.getItem('selectedCandidates')) || [];
            
            const newSection = document.getElementById('new');
            if (newSection && selectedCandidates.length > 0) {
                newSection.innerHTML = '';
                selectedCandidates.forEach((candidate, index) => {
                    newSection.innerHTML += createCandidateCard(candidate, index);
                });
            }
        })
        .catch(error => console.error('Error loading the external file:', error));

    updateButtonStyles();
}
function createCandidateCard(candidate, index) {
    return `
        <div id="card${index}" 
             data-index="${index}" 
             id_cand="${candidate.id || ''}" 
             class="dark:bg-slate-800 gap-6 flex items-center justify-center cursor-move">
            <div class="bg-gray-100 dark:bg-gray-700 relative shadow-xl overflow-hidden hover:shadow-2xl group rounded-xl p-5 transition-all duration-500 transform">
                <div class="flex items-center gap-4">
                    <div class="w-fit transition-all transform duration-500 max-w-[100px]">
                        <h1 onclick="get_candidate('${candidate.id}')" 
                            class="text-gray-600 dark:text-gray-200 font-bold hover:text-primary cursor-pointer">
                            ${candidate.name || 'Unknown'}
                        </h1>
                        <p class="text-gray-400">${candidate.jobTitle || 'No Title'}</p>
                        <a class="text-xs text-gray-500 dark:text-gray-200 group-hover:opacity-100 opacity-0 transform transition-all delay-300 duration-500 break-words leading-[1.25]">
                            ${candidate.email || ''}
                        </a>
                    </div>
                </div>
            </div>
        </div>`;
}

// Helper function to update button styles
function updateButtonStyles() {
    const dtBtn = document.getElementById("dt-btn");
    const processBtn = document.getElementById("process-btn");
    
    if (dtBtn) {
        dtBtn.className = "rounded px-3 py-1 text-xs font-medium text-black hover:bg-white hover:shadow-card dark:text-white dark:hover:bg-boxdark";
    }
    if (processBtn) {
        processBtn.className = "rounded bg-white px-3 py-1 text-xs font-medium text-black shadow-card hover:bg-white hover:shadow-card dark:bg-boxdark dark:text-white dark:hover:bg-boxdark";
    }
}
// Utility functions
function showLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) overlay.classList.remove('hidden');
}

function hideLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) overlay.classList.add('hidden');
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4';
    errorDiv.textContent = message;
    document.querySelector('.container').prepend(errorDiv);
}



// Add this debugging helper
function safeJSONParse(str) {
    try {
        return JSON.parse(str);
    } catch (e) {
        console.error('JSON Parse Error:', e);
        console.log('Problematic JSON string:', str);
        return [];
    }
}

// Modified selection handling
function handleCandidateSelection(checkbox) {
    const candidateId = checkbox.getAttribute('data-id');
    const candidateName = checkbox.getAttribute('data-name');
    const jobTitle = checkbox.getAttribute('data-job-title');
    const email = checkbox.getAttribute('data-email');

    // Get or initialize the array of selected candidates
    let selectedCandidates = JSON.parse(sessionStorage.getItem('selectedCandidates')) || [];
    
    if (checkbox.checked) {
        // Add candidate if not already selected
        if (!selectedCandidates.some(c => c.id === candidateId)) {
            selectedCandidates.push({
                id: candidateId,
                name: candidateName,
                jobTitle: jobTitle,
                email: email,
                stage: 'new'
            });
    }
    } else {
        // Remove candidate if unselected
        selectedCandidates = selectedCandidates.filter(c => c.id !== candidateId);
    }

    // Update storage
    sessionStorage.setItem('selectedCandidates', JSON.stringify(selectedCandidates));

    // Update UI count
    const countElement = document.getElementById('selected-count');
    if (countElement) {
        countElement.textContent = selectedCandidates.length;
    }
    
    console.log('Updated selected candidates:', selectedCandidates);
}
function updateSelectedCount() {
    const countElement = document.getElementById('selected-count');
    if (countElement) {
        countElement.textContent = selectedCandidateIds.size;
    }
}

// Add new function to initialize checkbox handlers
function initializeCheckboxHandlers() {
    document.querySelectorAll('.candidate-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            handleCandidateSelection(this);
        });
        
        const candidateId = checkbox.getAttribute('data-id');
        if (selectedCandidateIds.has(candidateId)) {
            checkbox.checked = true;
    }
    });
}
//const selectedCandidates = [];
//document.addEventListener('DOMContentLoaded', function() {
//   initializeAnalysis();
 //   
    // Add event listener for process button
   // const processButton = document.getElementById('process-selected-btn');
    //if (processButton) {
     //   processButton.addEventListener('click', processSelectedCandidates);
    //}
//});
// Initialize when page loads
//document.addEventListener('DOMContentLoaded', initializeAnalysis);

document.addEventListener('DOMContentLoaded', function() {
    // Create PDF modal if it doesn't exist
    if (!document.getElementById('pdfModal')) {
        const modal = document.createElement('div');
        modal.id = 'pdfModal';
        modal.className = 'fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-50 hidden';
        modal.innerHTML = `
            <div class="relative bg-white rounded-lg shadow-lg w-3/4 h-3/4 mx-auto mt-16">
                <button id="closePdfButton" class="absolute top-3 right-3 text-black text-lg">✕</button>
                <iframe id="pdfFrame" class="w-full h-full" frameborder="0"></iframe>
            </div>
        `;
        document.body.appendChild(modal);

        // Add event listener to the close button
        const closeButton = modal.querySelector('#closePdfButton');
        if (closeButton) {
            closeButton.addEventListener('click', closePDF);
        }

        // Optional: Add click event on modal background to close
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closePDF();
            }
        });
    }

    selectedCandidateIds.clear();
    updateSelectedCount();
    
    // Initialize analysis
    initializeAnalysis();
    
    // Add event listener for process button
    const processButton = document.getElementById('process-selected-btn');
    if (processButton) {
        processButton.addEventListener('click', processSelectedCandidates);
    }

    // Initialize checkbox handlers after analysis is complete
    initializeCheckboxHandlers();
});