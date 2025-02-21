function handleSubmit(event) {
  event.preventDefault();
  const firstName = document.getElementById("firstname").value;
  const lastName = document.getElementById("lastname").value;
  const phone = document.getElementById("phone").value;
  const address = document.getElementById("address").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const position = document.getElementById("position").value;
  const responsible = document.getElementById("responsible").value;
  apiClient.post('/api/post-recruiter/', {
    first_name: firstName,
    last_name: lastName,
    responsible: responsible,
    position: position,
    address: address,
    phone: phone,
    email: email,
    password: password
  }, {
    withCredentials: true,
    headers: {
      'X-CSRFToken': Cookies.get('csrftoken') // Manually extract the CSRF token
    }
  }).then(function (response) {
    alert("Form submitted successfully!");
    apiClient.get(`/api/get-recruiter/${response.data.id}/`, {
      withCredentials: true
    }).then(function (response) {
      const recruiterData = response.data;
      // Save the candidate data to localStorage
      localStorage.removeItem("recruiterData");
      localStorage.setItem('recruiterData', JSON.stringify(recruiterData));
      console.log(recruiterData);

      // Redirect to profile.html
      window.location.href = "profile-recruiter.html";
    }).catch(function (error) {
      console.error("Error fetching recruiter data:", error);
      alert("Failed to fetch recruiter data. Please try again.");
    });
    console.log(response.data); // Log the response data
  }).catch(function (error) {
    console.error("Error:", error);
    alert("Failed to submit the form. Please try again.");
  });
}
document.getElementById("contactForm").addEventListener("submit", handleSubmit);