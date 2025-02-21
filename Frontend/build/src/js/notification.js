// Get the data from sessionStorage or localStorage
const notificationData = JSON.parse(sessionStorage.getItem("notificationData"));
console.log(notificationData);
const resume1Base64 = notificationData.resume_1.resume_file;
const resume2Base64 = notificationData.resume_2.resume_file;
console.log(notificationData.resume_1);
document.getElementById("originalResume").src = `data:application/pdf;base64,${resume1Base64}`;
document.getElementById("updatedResume").src = `data:application/pdf;base64,${resume2Base64}`;

// Use the data (example: display in console)

function approveChanges() {
  apiClient.patch(`/api/confirm-update/${notificationData.id_candidate}/`, {
    id: notificationData.id_notification
  }, {
    withCredentials: true,
    headers: {
      'X-CSRFToken': Cookies.get('csrftoken') // Manually extract the CSRF token
    }
  }).then(response => {
    console.log("Data updated successfully:", response.data);
    if (response.status == 200) {
      deleteNotification(notificationData.id_notification);
    }
  }).catch(error => {
    console.error("Error updating data:", error);
  });
}
function discardChanges() {
  apiClient.patch(`/api/cancel-update/${notificationData.id_candidate}/`, {
    id: notificationData.id_notification
  }, {
    withCredentials: true,
    headers: {
      'X-CSRFToken': Cookies.get('csrftoken') // Manually extract the CSRF token
    }
  }).then(response => {
    console.log("Data updated successfully:", response.data);
    if (response.status == 200) {
      deleteNotification(notificationData.id_notification);
    }
  }).catch(error => {
    console.error("Error updating data:", error);
  });
}
function deleteNotification(id) {
  apiClient.delete(`/api/delete-notif/${id}/`, {
    withCredentials: true,
    headers: {
      'X-CSRFToken': Cookies.get('csrftoken') // Manually extract the CSRF token
    }
  }).then(function (response) {}).catch(function (error) {
    alert("Error.", error);
  });
}
function profile() {
  apiClient.get(`/api/get-candidate/${notificationData.id_candidate}/`, {
    withCredentials: true
  }).then(function (response) {
    const responseData = response.data;
    localStorage.setItem("responseData", JSON.stringify(responseData));
    // Save the candidate data to localStorage
    //localStorage.setItem('candidateData', JSON.stringify(candidateData));

    // Redirect to profile.html
    window.location.href = "profile.html";
  }).catch(function (error) {
    console.error("Error fetching candidate data:", error);
    alert("Failed to fetch candidate data. Please try again.");
  });
}

// You can now use the notifications data to populate your HTML as needed