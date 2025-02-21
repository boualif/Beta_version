document.addEventListener('DOMContentLoaded', () => {
  displayMatches(); // Only call displayMatches on the matches page
});
function displayMatches() {
  // Get matches data from sessionStorage
  const matchesData = sessionStorage.getItem('matchingResults');
  if (!matchesData) {
    showError('No matching results found');
    return;
  }
  try {
    const data = JSON.parse(matchesData);
    const matchesList = document.getElementById('matches-list');
    const noMatches = document.getElementById('no-matches');
    const totalMatches = document.getElementById('total-matches');
    if (!data.matches || data.matches.length === 0) {
      if (noMatches) {
        noMatches.classList.remove('hidden');
      }
      if (totalMatches) {
        totalMatches.textContent = '0';
      }
      return;
    }

    // Update total matches
    if (totalMatches) {
      totalMatches.textContent = data.matches.length;
    }

    // Display matches
    if (matchesList) {
      matchesList.innerHTML = data.matches.map(match => `
                <div class="bg-white p-4 rounded-lg shadow-md">
                    <div class="font-semibold text-lg">${match.candidate_name || 'Unknown'}</div>
                    <div class="text-sm text-gray-600">Match Score: ${match.score || 0}%</div>
                    ${match.skills ? `
                        <div class="mt-2 text-sm">
                            <span class="font-medium">Skills:</span> ${match.skills.join(', ')}
                        </div>
                    ` : ''}
                    ${match.experience ? `
                        <div class="text-sm">
                            <span class="font-medium">Experience:</span> ${match.experience} years
                        </div>
                    ` : ''}
                </div>
            `).join('');
    }
  } catch (error) {
    console.error('Error displaying matches:', error);
    showError('Error displaying matches');
  }
}
function showError(message) {
  const matchResults = document.getElementById('match-results');
  if (matchResults) {
    matchResults.innerHTML = `
            <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                ${message}
            </div>
        `;
  }
}