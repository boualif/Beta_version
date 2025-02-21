var filePaths = [];
var files = [];
//var fileContent = '';
$(document).ready(function () {
  $('input[type="file"]').change(function () {
    $(".filenames").empty(); // Clear previous file names

    for (var i = 0; i < this.files.length; i++) {
      var file = this.files[i];
      var fileName = file.name;
      filePaths.push(fileName);
      $(".filenames").append('<div class="name flex" data-index="' + i + '">' + fileName + "</div>");
    }

    //console.log('fileContent:', fileContent)
  });
});
document.getElementById("uploadCVForm").addEventListener("submit", function (event) {
  event.preventDefault(); // Prevent default form submission

  const fileInput = document.getElementById("fileInput");
  const files = fileInput.files; // Get all selected files

  if (files.length === 0) {
    alert("Please select at least one file.");
    return;
  }
  const fileContents = []; // Array to store file contents

  // Function to process each file
  const processFile = (file, index, callback) => {
    const reader = new FileReader();
    reader.onload = function (e) {
      fileContents[index] = e.target.result; // Store the file content
      //console.log(`File ${index} content:`, fileContents[index]);

      // Check if all files are processed
      if (fileContents.length === files.length) {
        // All files are processed
        sendFilesToServer(fileContents);
      }
    };
    reader.onerror = function (e) {
      console.error("File reading error:", e);
    };

    // Read the file content as a data URL (base64 encoded)
    reader.readAsArrayBuffer(file);
  };

  // Process each file
  for (let i = 0; i < files.length; i++) {
    processFile(files[i], i);
  }
});
function sendFilesToServer(fileContents) {
  const fileContentsBase64 = fileContents.map(buffer => {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    const length = bytes.byteLength;
    for (let i = 0; i < length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  });
  apiClient.post(`/api/cv/`, {
    fileContents: fileContentsBase64
  }, {
    withCredentials: true,
    headers: {
      'X-CSRFToken': Cookies.get('csrftoken') // Manually extract the CSRF token
    }
  }).then(response => {
    hideLoading();
    const data = response.data;
    console.log("Success:", data);
    const list = data.list;
    const message = document.getElementById("message");
    const icon = document.getElementById("icon");
    // Iterate over the list received in the response
    const nb_files = list.length;
    if (nb_files) {
      for (var i = 0; i < nb_files; i++) {
        // Create a new element to append
        const test = document.createElement("p");
        test.textContent = "✅";
        // Check if an element with the corresponding data-index exists
        const element = document.querySelector(`[data-index="${list[i]}"]`);
        element.appendChild(test);
      }
      message.textContent = `${nb_files} "have been added successfully."`;
      icon.textContent = '✅';
    } else {
      message.textContent = "No files have been added";
      icon.textContent = '❌';
    }
    showSuccessPopup(); // Show success popup after processing
  }).catch(error => {
    hideLoading();
    console.error("Error:", error);
  });
  showLoading();
}
function showSuccessPopup() {
  document.getElementById("successPopup").classList.remove("hidden");
}
function hideSuccessPopup() {
  document.getElementById("successPopup").classList.add("hidden");
}
document.getElementById("closePopup").addEventListener("click", hideSuccessPopup);
function showLoading() {
  document.getElementById('loadingSpinner').classList.remove('hidden');
}
function hideLoading() {
  document.getElementById('loadingSpinner').classList.add('hidden');
}