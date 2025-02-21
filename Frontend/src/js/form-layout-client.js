  function handleSubmit(event) {
    event.preventDefault();

    // Log each entry in the FormData object


    const company_logo = document.getElementById("company_logo");
    const company_name = document.getElementById("company_name").value;
    const website = document.getElementById("website").value;
    const headquarters_phone_number = document.getElementById("headquarters_phone_number").value;
    const status = document.getElementById("status").value;
    const engagement_type = document.getElementById("engagement_type").value;
    const industry = document.getElementById("Sector_of_Activity").value;
    const location = document.getElementById("location").value;
    const description = document.getElementById("description").value;
    const urls = document.getElementById("companyURLs").value; // Corrected ID here
    const file = company_logo.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = function (event) {
        //profileImage.src = event.target.result;
        //console.log('result==', event.target.result)
        //clientData.image = event.target.result;
        const base64ImageData = event.target.result;
        const base64Data = base64ImageData.split(',')[1];

        submitFormData(base64Data);

      };

      reader.readAsDataURL(file);
    }
    else {
      image = null;
      submitFormData(image);
    }


    function submitFormData(base64Data) {
    const data = {
      company: company_name,
      website: website,
      headquarters_phone_number: headquarters_phone_number,
      status: status,
      engagement_type: engagement_type,
      industry: industry,
      image: base64Data,
      description: description,
      location: location,
      urls: urls,
    };
    apiClient.post('/client/create/', data,
      {
        withCredentials: true,
        headers: {
            'X-CSRFToken': Cookies.get('csrftoken'),  // Manually extract the CSRF token
        },
    }
    )
      .then(function (response) {
        document.getElementById('popup').classList.remove('hidden');
        console.log(response.data);
        if(response.status == 201){
          response = response.data;
          data.id_Client = response.id;
          data.added_at = response.added_at;
          localStorage.setItem("clientData", JSON.stringify(data));
        }
       
      })
      .catch(function (error) {
        alert('Error submitting form!');
        console.log(error);
      });
  }
  }



  document.getElementById('clientForm').addEventListener('submit', handleSubmit);

  // Close pop-up when clicking the close button
  document.getElementById('closePopup').addEventListener('click', function () {
    document.getElementById('popup').classList.add('hidden');
    window.location.href = "tables-client.html";
  });

  // Redirect to profile-client.html
  function redirectToProfile() {
    window.location.href = 'profile-client.html';
  }