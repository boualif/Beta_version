function handleSubmit(event) {
  event.preventDefault();
  const jobTitle = document.getElementById("job_title").value;
  const description = document.getElementById("job_description").value;
  const data = {
    "job_title": jobTitle,
    "job_description": description
  };
  var clientId;
  if (selectClient) {
    data.client = selectedValue;
    console.log("dataaa==", data);
    apiClient.post(`/job/create2/`, data, {
      withCredentials: true,
      headers: {
        'X-CSRFToken': Cookies.get('csrftoken') // Manually extract the CSRF token
      }
    }).then(function (response) {
      document.getElementById('popup').classList.remove('hidden');
      console.log(response.data);
      localStorage.setItem('jobData', JSON.stringify(response.data));
    }).catch(function (error) {
      alert('Error submitting form!');
      console.log(error);
    });
  } else {
    clientId = localStorage.getItem('clientId');
    apiClient.post(`/job/create/${clientId}/`, data, {
      withCredentials: true,
      headers: {
        'X-CSRFToken': Cookies.get('csrftoken') // Manually extract the CSRF token
      }
    }).then(function (response) {
      document.getElementById('popup').classList.remove('hidden');
      console.log(response.data);
      localStorage.setItem('jobData', JSON.stringify(response.data));
    }).catch(function (error) {
      alert('Error submitting form!');
      console.log(error);
    });
  }

  //const formData = new FormData(document.getElementById('jobForm')); 
  console.log('clientId==', clientId);
}
document.getElementById('jobForm').addEventListener('submit', handleSubmit);

// Close pop-up when clicking the close button
document.getElementById('closePopup').addEventListener('click', function () {
  document.getElementById('popup').classList.add('hidden');
  if (document.referrer) {
    const referrerUrl = document.referrer;
    const pageName = referrerUrl.substring(referrerUrl.lastIndexOf('/') + 1);
    console.log(pageName); // Outputs: profile-client.html
    if (pageName === "profile-client.html") {
      window.location.href = "profile-client.html";
    } else if (pageName === "tables-job.html") {
      // Fallback if referrer is not available
      window.location.href = "tables-job.html";
    }
  }
});

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
};
const cl = {
  4: "client1",
  2: "client2",
  46: "client3"
};
let selectedValue = null;
function dropdown() {
  document.getElementById("client_name").value = "";
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
      if (this.options[index].value != -1) {
        this.selected.push(index);
      }
      this.close();
    },
    remove(index, option) {
      this.options[option].selected = false;
      this.selected.splice(index, 1);
      document.getElementById("client_name").value = "";
    },
    async loadOptions(event) {
      event.preventDefault();
      this.open();
      if (this.selected.length > 0) {
        document.getElementById("client_name").value = "";
      }
      this.options = [];
      this.selected = [];
      try {
        const query = document.getElementById("client_name").value;
        // Make a request to the backend
        const response = await apiClient.get(`/api/clients/?search=${query}`, {
          withCredentials: true
        });
        console.log(response);
        console.log(response.data);
        // Add new options based on the response
        const data = response.data;
        if (data.length > 0) {
          data.forEach(client => {
            this.options.push({
              value: client.id,
              text: client.company,
              selected: false // Ensure no option is preselected
            });
          });
        } else {
          this.options.push({
            value: -1,
            text: "no results found",
            selected: false // Ensure no option is preselected
          });
        }
      } catch (error) {
        console.error("Error fetching clients:", error);
      }
    },
    selectedValues() {
      if (this.selected.length > 0) {
        selectedValue = this.options[this.selected[0]].value;
        return selectedValue;
      } else return document.getElementById("client_name").value;
    }
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