// Your JavaScript code specific to the header
const idRecruiter = 14;
console.log("Header script running!");
// const recruiterData = localStorage.getItem("recruiterdata");
// if(!recruiterData){
//   getRecruiter();
// }
// const notification = document.getElementById("notification");
// apiClient
//   .get(`/api/get-notifications/`)
//   .then((response) => {
//     data = response.data;
//     console.log(data);
//     data.forEach((element) => {
//       const li = document.createElement("li");
//       const a = document.createElement("a");
//       a.className =
//         "flex flex-col gap-2.5 border-t border-stroke px-4.5 py-3 hover:bg-gray-2 cursor-pointer dark:border-strokedark dark:hover:bg-meta-4";
//       a.onclick = function () {
//         apiClient
//           .get(`/api/get-notif/${element.id}/`)
//           .then((response) => {
//             console.log("Data updated successfully:", response.data);
//             sessionStorage.setItem(
//               "notificationData",
//               JSON.stringify(response.data)
//             );
//             // Redirect to the new page
//             window.location.href = "notification.html";
//           })
//           .catch((error) => {
//             console.error("Error updating data:", error);
//           });
//       };

//       const info = document.createElement("span");
//       info.className = "text-black dark:text-white";
//       info.textContent = `${element.recruiter} ${element.content}`;
//       const date = document.createElement("p");
//       date.className = "text-xs";
//       date.textContent = element.date;

//       a.appendChild(info);
//       a.appendChild(date);
//       li.appendChild(a);
//       notification.appendChild(li);
//       console.log("Data updated successfully:", response.data);
//     });
//   })
//   .catch((error) => {
//     console.error("Error updating data:", error);
//   });

function getRecruiter() {
  apiClient
    .get(`/api/get-recruiter/${idRecruiter}/`)
    .then(function (response) {
      const recruiterData = response.data;
      // Save the candidate data to localStorage
      localStorage.setItem("recruiterData", JSON.stringify(recruiterData));
      const userImage = document.getElementById("imgUser");
      userImage.src = `data:image/jpeg;base64,${recruiterData.image}`;
      console.log(recruiterData);

      // Redirect to profile.html

    })
    .catch(function (error) {
      console.error("Error fetching recruiter data:", error);
      alert("Failed to fetch recruiter data. Please try again.");
    });
}

function profileRecruiter() {
  apiClient
    .get(`/api/get-recruiter/14/`)
    .then(function (response) {
      const recruiterData = response.data;
      // Save the candidate data to localStorage
      localStorage.setItem("recruiterData", JSON.stringify(recruiterData));

      console.log(recruiterData);

      // Redirect to profile.html
      window.location.href = "profile-recruiter.html";
    })
    .catch(function (error) {
      console.error("Error fetching recruiter data:", error);
      alert("Failed to fetch recruiter data. Please try again.");
    });
}

function logout() {
  apiClient
    .post(`/api/logout/`)
    .then(function (response) {

      localStorage.removeItem("recruiterData");
      // Redirect to profile.html
      window.location.href = "signin.html";
    })
    .catch(function (error) {
      console.error("Error fetching recruiter data:", error);
      alert("Failed to fetch recruiter data. Please try again.");
    });

}