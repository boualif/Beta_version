/*function handleSubmit(event) {
  event.preventDefault();
  
  // Get the form elements
  const jobTitleElement = document.getElementById("job_title");
  const descriptionElement = document.getElementById("job_description");
  const competencePhareElement = document.getElementById("competence_phare");

  // Check if elements exist
  if (!jobTitleElement || !descriptionElement || !competencePhareElement) {
    console.error("Required form elements not found");
    return;
  }

  const data = {
    "job_title": jobTitleElement.value,
    "job_description": descriptionElement.value,
    "competence_phare": competencePhareElement.value
  };
  
  console.log("Submitting data:", data);  // Debug log

  if (selectClient) {
    if (selectedValue) {
      data.client = selectedValue;
      apiClient.post(`/job/create2/`, data,
        {
          withCredentials: true,
          headers: {
            'X-CSRFToken': Cookies.get('csrftoken'),
          },
        }
      )
        .then(function (response) {
          console.log("Success response:", response.data);  // Debug log
          document.getElementById('popup').classList.remove('hidden');
          localStorage.setItem('jobData', JSON.stringify(response.data));
        })
        .catch(function (error) {
          console.error("Error details:", error);  // Debug log
          alert('Error submitting form! Please check console for details.');
        });
    } else {
      alert('Please select a client');
    }
  } else {
    const clientId = localStorage.getItem('clientId');
    if (!clientId) {
      alert('Client ID not found');
      return;
    }
    apiClient.post(`/job/create/${clientId}/`, data, {
      withCredentials: true,
      headers: {
        'X-CSRFToken': Cookies.get('csrftoken'),
      },
    })
      .then(function (response) {
        console.log("Success response:", response.data);  // Debug log
        document.getElementById('popup').classList.remove('hidden');
        localStorage.setItem('jobData', JSON.stringify(response.data));
      })
      .catch(function (error) {
        console.error("Error details:", error);  // Debug log
        alert('Error submitting form! Please check console for details.');
      });
  }


  //const formData = new FormData(document.getElementById('jobForm')); 
  //console.log('clientId==', clientId);

}*/
// Add these helper functions at the top of your file
// Modify your handleSubmit function
function handleSubmit(event) {
  event.preventDefault();
  
  setLoading(true); // Start loading state
  
  // Get the form elements
  const jobTitleElement = document.getElementById("job_title");
  const descriptionElement = document.getElementById("job_description");
  const competencePhareElement = document.getElementById("competence_phare");

  // Check if elements exist
  if (!jobTitleElement || !descriptionElement || !competencePhareElement) {
    console.error("Required form elements not found");
    setLoading(false); // Stop loading if elements not found
    return;
  }

  const data = {
    "job_title": jobTitleElement.value,
    "job_description": descriptionElement.value,
    "competence_phare": competencePhareElement.value
  };
  
  console.log("Submitting data:", data);

  if (selectClient) {
    if (selectedValue) {
      data.client = selectedValue;
      apiClient.post(`/job/create2/`, data,
        {
          withCredentials: true,
          headers: {
            'X-CSRFToken': Cookies.get('csrftoken'),
          },
        }
      )
        .then(function (response) {
          console.log("Success response:", response.data);
          document.getElementById('popup').classList.remove('hidden');
          localStorage.setItem('jobData', JSON.stringify(response.data));
          setLoading(false); // Stop loading on success
        })
        .catch(function (error) {
          console.error("Error details:", error);
          alert('Error submitting form! Please check console for details.');
          setLoading(false); // Stop loading on error
        });
    } else {
      alert('Please select a client');
      setLoading(false); // Stop loading if no client selected
    }
  } else {
    const clientId = localStorage.getItem('clientId');
    if (!clientId) {
      alert('Client ID not found');
      setLoading(false); // Stop loading if no client ID
      return;
    }
    apiClient.post(`/job/create/${clientId}/`, data, {
      withCredentials: true,
      headers: {
        'X-CSRFToken': Cookies.get('csrftoken'),
      },
    })
      .then(function (response) {
        console.log("Success response:", response.data);
        document.getElementById('popup').classList.remove('hidden');
        localStorage.setItem('jobData', JSON.stringify(response.data));
        setLoading(false); // Stop loading on success
      })
      .catch(function (error) {
        console.error("Error details:", error);
        alert('Error submitting form! Please check console for details.');
        setLoading(false); // Stop loading on error
      });
  }
}
document.getElementById('jobForm').addEventListener('submit', handleSubmit);

// Close pop-up when clicking the close button
document.getElementById('closePopup').addEventListener('click', function () {
  document.getElementById('popup').classList.add('hidden');
 // if (document.referrer) {
  //  const referrerUrl = document.referrer;
  //  const pageName = referrerUrl.substring(referrerUrl.lastIndexOf('/') + 1);
  //  console.log(pageName); // Outputs: profile-client.html
  //  if (pageName === "profile-client.html") {
   //   window.location.href = "profile-client.html";
  //  } else if (pageName === "tables-job.html") {
      // Fallback if referrer is not available
    //  window.location.href = "tables-job.html";
    //}
 // }
});
function setLoading(isLoading) {
  const button = document.getElementById('submitJobButton');
  const spinner = button.querySelector('.loading-spinner');
  const buttonText = button.querySelector('.button-text');

  if (isLoading) {
    button.disabled = true;
    spinner.classList.remove('hidden');
    buttonText.textContent = 'Saving...';
  } else {
    button.disabled = false;
    spinner.classList.add('hidden');
    buttonText.textContent = 'Save Job Offer';
  }
}
// Redirect to job-details.html
function redirectToProfile() {
  window.location.href = 'job-details.html';
}
let selectClient;
window.onload = function () {
  if (document.referrer) {
    const referrerUrl = document.referrer;
    const pageName = referrerUrl.substring(referrerUrl.lastIndexOf('/') + 1);
    console.log(pageName); // Outputs: profile-client.html
    if (pageName === "profile-client.html") {
      selectClient = false;
    } else if (pageName === "tables-job.html") {
      // Fallback if referrer is not available
      document.getElementById("client").classList.remove("hidden");
      selectClient = true;
    }
  }
}


const cl = 
{
    4:"client1",
    2:"client2",
    46:"client3"
}
let selectedValue = null;
function dropdown() {
  document.getElementById("client_name").value = ""
return {
options: [],
selected: [],
show: false,
open() {
  this.show = true;
},
close() {
  this.show = false;
},
isOpen() {
  return this.show === true;
},
select(index, event) {
    this.selected = [];
    this.options[index].selected = true;
    this.options[index].element = event.target;
    if(this.options[index].value != -1)
    {
      this.selected.push(index);
    }
    this.close(); 
},
remove(index, option) {
  this.options[option].selected = false;
  this.selected.splice(index, 1);
  document.getElementById("client_name").value = ""
},
async loadOptions(event) {
    event.preventDefault();

    this.open();

    if(this.selected.length > 0){
      document.getElementById("client_name").value = "";
    }
    
    this.options = [];
    this.selected = [];

    try {
      const query = document.getElementById("client_name").value;
      // Make a request to the backend
      const response = await apiClient.get(`/api/clients/?search=${query}`,
        {
          withCredentials: true
        }
      );
      console.log(response);
      console.log(response.data);
      // Add new options based on the response
      const data = response.data;
      if(data.length > 0){
        data.forEach((client) => {
          this.options.push({
            value: client.id,
            text: client.company,
            selected: false, // Ensure no option is preselected
          });
        });
      }
      else{
        this.options.push({
          value: -1,
          text: "no results found",
          selected: false, // Ensure no option is preselected
        });
      }

    } catch (error) {
      console.error("Error fetching clients:", error);
    }
},
selectedValues() {
  if(this.selected.length > 0){
    selectedValue = this.options[this.selected[0]].value;
    return selectedValue; 
  }
  else
    return document.getElementById("client_name").value;
},
};
}




// function searchClient(event) {
//   const query = event.target.value.toLowerCase();
//   const dropdown = document.querySelector("[x-data]");
//   //const dropdownInstance = Alpine.discoverComponent(dropdown);

//     dropdownInstance.options.push({ text: query, value: query, selected: false });

// }


// function searchClient(event){
//   console.log(event.target.value);
  
// }



// function dropdown() {
//   return {
//     options: [],
//     selected: [],
//     show: false,
//     open() {
//       this.show = true;
//     },
//     close() {
//       this.show = false;
//     },
//     isOpen() {
//       return this.show === true;
//     },
//     select(index, event) {
//       if (!this.options[index].selected) {
//         this.options[index].selected = true;
//         this.options[index].element = event.target;
//         this.selected.push(index);
//       } else {
//         this.selected.splice(this.selected.lastIndexOf(index), 1);
//         this.options[index].selected = false;
//       }
//     },
//     remove(index, option) {
//       this.options[option].selected = false;
//       this.selected.splice(index, 1);
//     },
//     loadOptions() {
//       const options = document.getElementById("select").options;
//       for (let i = 0; i < options.length; i++) {
//         this.options.push({
//           value: options[i].value,
//           text: options[i].innerText,
//           selected:
//             options[i].getAttribute("selected") != null
//               ? options[i].getAttribute("selected")
//               : false,
//         });
//       }
//     },
//     selectedValues() {
//       return this.selected.map((option) => {
//         return this.options[option].value;
//       });
//     },
//   };
// }