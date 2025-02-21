document.addEventListener('DOMContentLoaded', function() { // Ensure DOM is fully loaded
  const form = document.getElementById('clientForm');
  if (!form) {
      console.error('Client form not found!');
      return;
  }

  form.addEventListener('submit', async function(event) {
    event.preventDefault();

    // Get form elements
    const elements = {
      company_logo: document.getElementById("company_logo"),
      company_name: document.getElementById("company_name"),
      website: document.getElementById("website"),
      headquarters_phone_number: document.getElementById("headquarters_phone_number"),
      status: document.getElementById("status"),
      industry: document.getElementById("Sector_of_Activity"),
      location: document.getElementById("location"),
      description: document.getElementById("description"),
      companyURLs: document.getElementById("companyURLs")
    };

    // Validate required fields
    const requiredFields = ['company_name', 'industry'];
    const missingFields = requiredFields.filter(field => !elements[field]?.value?.trim());

    if (missingFields.length > 0) {
      showError(`Please fill in required fields: ${missingFields.join(', ')}`);
      return;
    }

    try {
      // Process image if present
      let base64Data = null;
      const file = elements.company_logo.files[0];

      if (file) {
        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
          showError('Logo file size must be less than 5MB');
          return;
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
          showError('Logo must be a JPG, PNG, or GIF file');
          return;
        }

        // Convert image to base64
        base64Data = await readFileAsBase64(file);
      }

      // Prepare form data
      const formData = {
        company: elements.company_name.value.trim(),
        website: cleanWebsiteUrl(elements.website.value),
        headquarters_phone_number: cleanPhoneNumber(elements.headquarters_phone_number.value),
        status: elements.status.value,
        industry: elements.industry.value.trim(),
        image: base64Data,
        description: elements.description.value.trim(),
        location: elements.location.value.trim(),
       // urls: elements.companyURLs.value.trim()
      };

      // Show loading state
      const submitButton = form.querySelector('button[type="submit"]');
      toggleLoadingState(submitButton, true);

      try {
        console.log('Submitting form data:', formData);  // Debugging

        const response = await apiClient.post('/client/create/', formData, {
          withCredentials: true,
          headers: {
            'X-CSRFToken': Cookies.get('csrftoken'),
            'Content-Type': 'application/json'
          },
          timeout: 15000 // 15 second timeout
        });

        console.log('API Response:', response); // Debugging

        if (response.status === 201) {
          // Store client data and show success message
          const clientData = {
            ...formData,
            id_Client: response.data.id,
            added_at: response.data.added_at
          };

          localStorage.setItem("clientData", JSON.stringify(clientData));
          localStorage.setItem("currentClientId", response.data.id);

          showSuccess();
        } else {
          console.error('API returned non-201 status:', response.status);
          handleApiError(new Error(`API returned status ${response.status}`)); // More informative error handling
        }
      } catch (error) {
        handleApiError(error);
      } finally {
        toggleLoadingState(submitButton, false);
      }
    } catch (error) {
      console.error('Form submission error:', error);
      showError('An unexpected error occurred. Please try again.');
    }
  });

  // Helper Functions
  function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Data = event.target.result.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  }

  function cleanWebsiteUrl(url) {
    if (!url) return '';
    return url.trim()
      .toLowerCase()
      .replace(/^https?:\/\//i, '')
      .replace(/\/+$/, '');
  }

  function cleanPhoneNumber(phone) {
    if (!phone) return '';
    return phone.trim()
      .replace(/[^\d+]/g, '')
      .replace(/^([^+])/, '+$1');
  }

  function toggleLoadingState(button, isLoading) {
    if (!button) return;
    button.disabled = isLoading;
    button.textContent = isLoading ? 'Creating...' : 'Create Client';
  }

  function showError(message) {
    console.error(message);
    alert(message);
  }

  function showSuccess() {
    console.log('showSuccess() called');
    const popup = document.getElementById('popup');
    if (!popup) {
      console.error('Popup element not found');
      return;
    }

    // Ensure popup is visible by removing hidden class and setting display
    popup.classList.remove('hidden');
    popup.style.display = 'flex';

    // Get the stored client data
    const clientData = JSON.parse(localStorage.getItem("clientData"));

    // Set up the event handlers for the buttons
    setupPopupButtons(clientData?.id_Client);

    // Log success for debugging
    console.log('Showing success popup');
  }

  function setupPopupButtons(clientId) {
    // Set up the view details button (using the existing onclick function)
    const viewEditButton = document.getElementById('viewEditButton');
    if (viewEditButton) {
      // Remove any existing click handlers to prevent duplicates
      viewEditButton.onclick = function() {
        // Store the client ID in local storage or as a URL parameter
        if (clientId) {
          localStorage.setItem("currentClientId", clientId);
          // Call the existing redirect function
          redirectToProfile();
        }
      };
    }

    // Set up the close button
    const closeBtn = document.getElementById('closePopup');
    if (closeBtn) {
      // Remove any existing click handlers to prevent duplicates
      closeBtn.onclick = function() {
        document.getElementById('popup').classList.add('hidden');
        window.location.href = "tables-client.html";
      };
    }
  }

  function handleApiError(error) {
    let errorMessage = 'Error creating client. ';

    if (error.response) {
      // Server returned an error response
      errorMessage += error.response.data.message ||
                     Object.values(error.response.data).flat().join(', ') ||
                     `Server error: ${error.response.status}`;
    } else if (error.request) {
      // Request was made but no response received
      errorMessage += 'No response from server. Please check your connection.';
    } else {
      // Error in request setup
      errorMessage += error.message;
    }

    showError(errorMessage);
  }

  function redirectToProfile() {
    const clientId = localStorage.getItem("currentClientId");
    if (clientId) {
      window.location.href = `profile-client.html?id=${clientId}`;
    } else {
      // Fallback if no ID is available
      window.location.href = 'profile-client.html';
    }
  }
});  //Closing tag for the document.addEventListener.