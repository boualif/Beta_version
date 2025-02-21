var filePaths = [];
var files = [];

$(document).ready(function () {
  $('input[type="file"]').change(function () {
    $(".filenames").empty(); // Clear previous file names

    for (var i = 0; i < this.files.length; i++) {
      var file = this.files[i];
      var fileName = file.name;
      filePaths.push(fileName);

      $(".filenames").append(
        '<div class="name flex" data-index="' +
          i +
          '">' +
          fileName +
          "</div>"
      );
    }
  });
});

document.getElementById("uploadCVForm").addEventListener("submit", function (event) {
  event.preventDefault();
  const fileInput = document.getElementById("fileInput");
  const files = fileInput.files;

  if (files.length === 0) {
    alert("Please select at least one file.");
    return;
  }

  showLoading();
  
  // Use Promise.all to handle multiple file reads
  const filePromises = Array.from(files).map((file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const buffer = e.target.result;
        let binary = "";
        const bytes = new Uint8Array(buffer);
        const length = bytes.byteLength;
        for (let i = 0; i < length; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        resolve(window.btoa(binary));
      };
      
      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(file);
    });
  });

  // Process all files at once
  Promise.all(filePromises)
    .then((fileContentsBase64) => {
      return apiClient.post(
        `/api/cv/`, 
        { fileContents: fileContentsBase64 },
        {
          withCredentials: true,
          headers: {
            'X-CSRFToken': Cookies.get('csrftoken'),
          },
        }
      );
    })
    .then((response) => {
      hideLoading();
      const data = response.data;
      console.log("Server response:", data);
      
      const message = document.getElementById("message");
      const icon = document.getElementById("icon");
      
      // Handle successful uploads
      if (data.success && data.success.length > 0) {
        data.success.forEach(index => {
          const element = document.querySelector(`[data-index="${index}"]`);
          if (element) {
            const status = document.createElement("p");
            status.textContent = "✅";
            element.appendChild(status);
          }
        });
      }

      // Handle duplicates
      if (data.duplicates && data.duplicates.length > 0) {
        data.duplicates.forEach(duplicate => {
          const element = document.querySelector(`[data-index="${duplicate.file_index}"]`);
          if (element) {
            const status = document.createElement("p");
            status.textContent = "⚠️ Duplicate";
            status.title = `Candidate already exists with email: ${duplicate.email}`;
            element.appendChild(status);
          }
        });
      }

      // Create summary message
      const successCount = data.success?.length || 0;
      const duplicateCount = data.duplicates?.length || 0;
      const errorCount = data.error_count || 0;
      
      let messageText = [];
      if (successCount > 0) {
        messageText.push(`${successCount} files added successfully`);
      }
      if (duplicateCount > 0) {
        messageText.push(`${duplicateCount} duplicates found`);
      }
      if (errorCount > 0) {
        messageText.push(`${errorCount} errors occurred`);
      }

      message.textContent = messageText.length > 0 
        ? messageText.join(', ') 
        : "No files were processed successfully";
      icon.textContent = successCount > 0 ? '✅' : '⚠️';

      showSuccessPopup();
      
      // Reset the form after successful upload
      document.getElementById("uploadCVForm").reset();
      document.querySelector(".filenames").innerHTML = "";
    })
    .catch((error) => {
      hideLoading();
      console.error("Server error:", error);
      
      const message = document.getElementById("message");
      const icon = document.getElementById("icon");
      message.textContent = `Error: ${error.response?.data?.error || error.message || 'Unknown error occurred'}`;
      icon.textContent = '❌';
      
      showSuccessPopup();
    });
});

function showSuccessPopup() {
  document.getElementById("successPopup").classList.remove("hidden");
}

function hideSuccessPopup() {
  document.getElementById("successPopup").classList.add("hidden");
}

document
  .getElementById("closePopup")
  .addEventListener("click", hideSuccessPopup);

function showLoading() {
  document.getElementById('loadingSpinner').classList.remove('hidden');
}

function hideLoading() {
  document.getElementById('loadingSpinner').classList.add('hidden');
}