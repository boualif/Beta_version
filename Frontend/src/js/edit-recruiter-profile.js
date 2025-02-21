const recruiterData = JSON.parse(localStorage.getItem("recruiterData"));
const firstName = document.getElementById("firstName");
const lastName = document.getElementById("lastName");
const position = document.getElementById("position");
const responsible = document.getElementById("responsible");
const email = document.getElementById("emailAddress");
const phone = document.getElementById("phoneNumber");
const address = document.getElementById("address");
const password = document.getElementById("password");
window.onload = () => {
  console.log(recruiterData);
  firstName.value = recruiterData.first_name;
  lastName.value = recruiterData.last_name;
  position.value = recruiterData.position;
  responsible.value = recruiterData.responsible;
  email.value = recruiterData.email;
  phone.value = recruiterData.phone;
  address.value = recruiterData.address;
};
const form = document.getElementById("editForm");
document.addEventListener("submit", function (e) {
  e.preventDefault();
  recruiterData.first_name = firstName.value;
  recruiterData.last_name = lastName.value;
  recruiterData.email = email.value;
  recruiterData.phone = phone.value;
  recruiterData.address = address.value;
  recruiterData.position = position.value;
  recruiterData.responsible = responsible.value;
  console.log(recruiterData);
  const recruiterDataUpdated = {};
  recruiterDataUpdated.first_name = firstName.value;
  recruiterDataUpdated.last_name = lastName.value;
  recruiterDataUpdated.email = email.value;
  recruiterDataUpdated.phone = phone.value;
  recruiterDataUpdated.address = address.value;
  recruiterDataUpdated.position = position.value;
  recruiterDataUpdated.responsible = responsible.value;
  if(password.value){
    recruiterDataUpdated.password = password.value;
  }
  console.log(recruiterDataUpdated);
  const id_Rec = recruiterData.id_Recruiter;
  var url = "";
  if(id_Rec){
    url = "/api/get-recruiter/"+id_Rec + "/";
  }
  else{
    url = "/api/get-profile/";
  }
  apiClient
    .patch(
      url,
      recruiterDataUpdated,
      {
        withCredentials: true,
        headers: {
            'X-CSRFToken': Cookies.get('csrftoken'),  // Manually extract the CSRF token
        },
    }
    )
    .then((response) => {
      console.log("Data updated successfully:", response.data);
      get_recruiter(recruiterData.id_Recruiter);
      if(!id_Rec){
        localStorage.removeItem("recruiterDataHeader");
      }
      localStorage.removeItem("recruiterData");
    })
    .catch((error) => {
      console.error("Error updating data:", error);
    });
});

function get_recruiter(id){
  var url = "";
  if(id){
    url = "/api/get-recruiter/"+id + "/";
  }
  else{
    url = "/api/get-profile/";
  }
  apiClient.get(url,
    {
      withCredentials: true,
  }
  )
        .then(function (response) {
          const recruiterData = response.data;
          // Save the candidate data to localStorage
          localStorage.setItem('recruiterData', JSON.stringify(recruiterData));

          console.log(recruiterData);

          // Redirect to profile.html
          window.location.href = "profile-recruiter.html";

        })
        .catch(error => {
          console.error('Error updating data:', error);
        });// Stop the event from propagating to parent elements
}