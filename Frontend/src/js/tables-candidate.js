function calculateTotalExperience(experiences) {
  if (!Array.isArray(experiences) || experiences.length === 0) {
    return "Not specified";
  }

  let totalYears = 0;
  experiences.forEach(exp => {
    const startDate = new Date(exp.StartDate);
    const endDate = exp.EndDate ? new Date(exp.EndDate) : new Date();
    const years = (endDate - startDate) / (1000 * 60 * 60 * 24 * 365.25);
    totalYears += years;
  });

  totalYears = Math.round(totalYears);
  return `${totalYears} years`;
}
window.onload = () => {
  let currentPage = 1;
  let executeOnce = false;
  let updated = false;
  let state = 1;
  let isPageOnLoad = true;
  const per_page = 5;
  let totalPages = 0;
  const prevPageButton = document.getElementById('prev-page');
  const nextPageButton = document.getElementById('next-page');
  const paginationContainer = document.getElementById('paginationContainer');


  // state = 1 currentPage <= 3
  // state = 2 currentPage >= totalPages - 2
  function updatePaginationState2(page) { // when click on next
    console.log(page, state);
    if (state == 1) {
      if (page == paginationContainer.children[2].textContent) {
        paginationContainer.children[0].textContent = paginationContainer.children[1].textContent;
        paginationContainer.children[1].textContent = paginationContainer.children[2].textContent;
        paginationContainer.children[2].textContent = Number(paginationContainer.children[2].textContent) + 1;
        //   if(paginationContainer.children[3].textContent == '...'){
        //   const button = document.createElement('Button');
        //   button.className = "pagination-button px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-100";
        //   paginationContainer.insertBefore(button, paginationContainer.children[3]);
        // }
        // paginationContainer.children[3].textContent = Number(paginationContainer.children[2].textContent) + 1;
      }
    }
    else if (state == 2) {
      if (page == paginationContainer.children[4].textContent) {
        paginationContainer.children[2].textContent = paginationContainer.children[3].textContent;
        paginationContainer.children[3].textContent = paginationContainer.children[4].textContent;
        paginationContainer.children[4].textContent = Number(paginationContainer.children[4].textContent) + 1;
      }
    }
  }

  function updatePaginationState3(page) { // when click on previous
    if (state == 1) {
      if (page == paginationContainer.children[0].textContent) {
        paginationContainer.children[2].textContent = paginationContainer.children[1].textContent;
        paginationContainer.children[1].textContent = paginationContainer.children[0].textContent;
        paginationContainer.children[0].textContent = Number(paginationContainer.children[0].textContent) - 1;

      }
    }
    else if (state == 2) {
      if (page == paginationContainer.children[2].textContent) {
        paginationContainer.children[4].textContent = paginationContainer.children[3].textContent;
        paginationContainer.children[3].textContent = paginationContainer.children[2].textContent;
        paginationContainer.children[2].textContent = Number(paginationContainer.children[2].textContent) - 1;
      }
    }
  }

  function fetchPage(page) {
    console.log("page", page)
    apiClient.get('/api/get/', {
      params: {
          page: page,
          per_page: per_page,
      },
      withCredentials: true,
  })
      .then(response => {
        currentPage = page;
        console.log(response);
        const data = response.data;
        totalPages = data.total_pages;
        totalItems = data.total_items;
        items_on_page = data.items_on_page;
        const totalItemsSpan = document.getElementById("totalItems");
        const minItemSpan = document.getElementById("minItem");
        const maxItemSpan = document.getElementById("maxItem");
        minItemSpan.textContent = page * per_page - per_page + 1 ;
        maxItemSpan.textContent = (page - 1) * per_page + items_on_page;
        totalItemsSpan.textContent = totalItems;
        //paginationContainer.innerHTML = '';
        if (totalPages > 7) {
          if (!executeOnce) {// executed on load to format the paginator with 3+1

            for (let i = 0; i < 3; i++) {
              const btn = document.createElement('a');
              btn.className = "pagination-button relative hidden cursor-pointer items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 md:inline-flex";
              btn.textContent = i + 1;
              btn.onclick = () => {
                currentPage = Number(btn.textContent)
                fetchPage(currentPage)
                console.log("page fetched");
              };

              paginationContainer.appendChild(btn);

            } // end of for

            nextPageButton.onclick = () => {
              this.disabled = currentPage === totalPages;
              if (!this.disabled) {
                updatePaginationState2(currentPage);
                currentPage = currentPage + 1;
                fetchPage(currentPage);
              }
            }
            prevPageButton.onclick = function () {
              this.disabled = currentPage === 1;
              if (!this.disabled) {
                updatePaginationState3(currentPage);
                if (currentPage > 1) {
                  currentPage = currentPage - 1;
                  fetchPage(currentPage);
                }
              }

              updated = false;
            }

            executeOnce = true;

            const ellipsisDiv = document.createElement('div');
            ellipsisDiv.textContent = '...';
            paginationContainer.insertAdjacentElement("beforeend", ellipsisDiv);

            const lastPageButton = document.createElement('a');
            lastPageButton.className = "pagination-button relative hidden cursor-pointer items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 md:inline-flex";
            lastPageButton.textContent = totalPages;
            lastPageButton.onclick = () => {
              fetchPage(Number(lastPageButton.textContent));
              currentPage = totalPages;
              console.log("page fetched");
            };
            paginationContainer.appendChild(lastPageButton);

            updated = true;
          }

          if (currentPage <= 3 && !updated) {
            state = 1;

            const ellipsisDiv = document.createElement('div');
            ellipsisDiv.textContent = '...';


            if (paginationContainer.children[1].textContent == '...') {
              paginationContainer.insertBefore(ellipsisDiv, paginationContainer.lastChild);
              paginationContainer.removeChild(paginationContainer.children[1]);
              paginationContainer.children[1].textContent = 2;
              paginationContainer.children[2].textContent = 3;
              paginationContainer.children[4].textContent = totalPages;
            }

            updated = true;

          }
          else if (currentPage >= totalPages - 2 && updated) {

            state = 2;
            updated = false;
            paginationContainer.removeChild(paginationContainer.children[3]);
            const ellipsisDiv = document.createElement('div');
            ellipsisDiv.textContent = '...';
            paginationContainer.insertBefore(ellipsisDiv, paginationContainer.children[1]);
            paginationContainer.children[0].textContent = 1;
            paginationContainer.children[2].textContent = totalPages - 2;
            paginationContainer.children[3].textContent = totalPages - 1;
          }

        }
        else { // numberof pages < 7
          for (let i = 0; i < totalPages; i++) {
            const button = document.createElement('a');
            button.className = "pagination-button relative hidden cursor-pointer items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 md:inline-flex";
            button.textContent = i + 1;
            button.onclick = () => {
              currentPage = Number(button.textContent);
              fetchPage(currentPage);
              console.log("page fetched");
            };
            if (isPageOnLoad) {
              paginationContainer.appendChild(button);
            }
          }
          nextPageButton.onclick = () => {
            this.disabled = currentPage === totalPages;
            if (!this.disabled) {
              currentPage = currentPage + 1;
              fetchPage(currentPage);
            }
          }
          prevPageButton.onclick = function () {
            this.disabled = currentPage === 1;
            if (!this.disabled) {
              if (currentPage > 1) {
                currentPage = currentPage - 1;
                fetchPage(currentPage);
              }
            }

            updated = false;
          }
          isPageOnLoad = false;
        }// end of numberof pages < 7



        document.querySelectorAll('.pagination-button').forEach(btn => {
          btn.classList.remove('active');
          if (btn.textContent.trim() == currentPage) {
            console.log("looog");
            btn.classList.add("active");
          }
        });
        const tableBody = document.querySelector("#data-table tbody");
        tableBody.innerHTML = "";
        data.items.forEach((element) => {
          const row = document.createElement("tr");
          // row.addEventListener('click', function () {
          row.dataset.id = element.id; // Store the element-id in a data attribute

          // });
          // Create and append the first name cell
          const nameCell = document.createElement("td");
          nameCell.classList.add("border-b", "border-[#eee]", "px-4", "py-5", "pl-9", "dark:border-strokedark", "xl:pl-11");
          const wrapper = document.createElement("div");
          wrapper.classList.add("flex", "items-center", "gap-3", "p-2.5", "xl:p-5");

          const text = document.createElement("a");
          text.classList.add("hidden", "font-medium", "text-black", "dark:text-white", "sm:block");
          text.style.cursor = "pointer";
          text.onmouseover = function () {
            text.style.textDecoration = "underline"; // Adds underline on hover
          };
          text.onmouseout = function () {
            text.style.textDecoration = "none"; // Removes underline when not hovering
          };
          text.onclick = () => handleAction('view', element.id);
          text.textContent = element.name;  // Directly set the text content
          wrapper.appendChild(text);
          nameCell.appendChild(wrapper);
          row.appendChild(nameCell);

          const positionCell = document.createElement("td");
          positionCell.classList.add("border-b", "border-[#eee]", "px-4", "py-5", "pl-9", "dark:border-strokedark", "xl:pl-11");
          const wrapper2 = document.createElement("div");
          wrapper2.classList.add("flex", "items-center", "gap-3", "p-2.5", "xl:p-5");
          const text2 = document.createElement("p");
          text2.classList.add("hidden", "font-medium", "text-black", "dark:text-white", "sm:block");
          text2.textContent = element.position;  // Directly set the text content
          wrapper2.appendChild(text2);
          positionCell.appendChild(wrapper2);
          row.appendChild(positionCell);
          console.log("Experience data:", element.experience);
          // In tables-candidate.js, modify the experience cell creation code:
          const experienceCell = document.createElement("td");
          experienceCell.classList.add("border-b", "border-[#eee]", "px-4", "py-5", "pl-9", "dark:border-strokedark", "xl:pl-11");
          const wrapper3 = document.createElement("div");
          wrapper3.classList.add("flex", "items-center", "gap-3", "p-2.5", "xl:p-5");
          const text3 = document.createElement("p");
          text3.classList.add("hidden", "font-medium", "text-black", "dark:text-white", "sm:block");

          // Calculate experience from CandidateInfo if available
          const candidateExperiences = element.candidateData?.CandidateInfo?.Experience;
          text3.textContent = calculateTotalExperience(candidateExperiences);

          wrapper3.appendChild(text3);
          experienceCell.appendChild(wrapper3);
          row.appendChild(experienceCell);

          const availabilityCell = document.createElement("td");
          availabilityCell.classList.add("border-b", "border-[#eee]", "px-4", "py-5", "pl-9", "dark:border-strokedark", "xl:pl-11");
          const wrapper4 = document.createElement("div");
          wrapper4.classList.add("flex", "items-center", "gap-3", "p-2.5", "xl:p-5");
          const text4 = document.createElement("p");
          text4.classList.add("hidden", "font-medium", "text-black", "dark:text-white", "sm:block");
          text4.textContent = element.availability;  // Directly set the text content
          wrapper4.appendChild(text4);
          availabilityCell.appendChild(wrapper4);
          row.appendChild(availabilityCell);

          const mobilityCell = document.createElement("td");
          mobilityCell.classList.add("border-b", "border-[#eee]", "px-4", "py-5", "pl-9", "dark:border-strokedark", "xl:pl-11");
          const wrapper5 = document.createElement("div");
          wrapper5.classList.add("flex", "items-center", "gap-3", "p-2.5", "xl:p-5");
          const text5 = document.createElement("p");
          text5.classList.add("hidden", "font-medium", "text-black", "dark:text-white", "sm:block");
          text5.textContent = element.mobility  // Directly set the text content
          wrapper5.appendChild(text5);
          mobilityCell.appendChild(wrapper5);
          row.appendChild(mobilityCell);


          

          const RHCell = document.createElement("td");
          RHCell.classList.add("border-b", "border-[#eee]", "px-4", "py-5", "pl-9", "dark:border-strokedark", "xl:pl-11");
          const wrapper7 = document.createElement("div");
          wrapper7.classList.add("flex", "items-center", "gap-3", "p-2.5", "xl:p-5");
          const text7 = document.createElement("p");
          text7.classList.add("hidden", "font-medium", "text-black", "dark:text-white", "sm:block");
          text7.textContent = element.recruiter;  // Directly set the text content
          wrapper7.appendChild(text7);
          RHCell.appendChild(wrapper7);
          row.appendChild(RHCell);

          const statusCell = document.createElement("td");
          statusCell.classList.add("border-b", "border-[#eee]", "px-4", "py-5", "pl-9", "dark:border-strokedark", "xl:pl-11");
          const wrapper8 = document.createElement("div");
          wrapper8.classList.add("flex", "items-center", "gap-3", "p-2.5", "xl:p-5");
          const text8 = document.createElement("p");

          const status = element.status;
          text8.textContent = element.status;  // Directly set the text content
          if (status == "available") {
            text8.className = "nline-flex rounded-full bg-success bg-opacity-10 px-3 py-1 text-sm font-medium text-success";
          }
          else if (status == "not available") {
            text8.className = "inline-flex rounded-full bg-warning bg-opacity-10 px-3 py-1 text-sm font-medium text-warning";
          }
          else if (status == "restricted") {
            text8.className = "inline-flex rounded-full bg-danger bg-opacity-10 px-3 py-1 text-sm font-medium text-danger";
          }

          wrapper8.appendChild(text8);
          statusCell.appendChild(wrapper8);
          row.appendChild(statusCell);

          const addetAtCell = document.createElement("td");
          addetAtCell.classList.add("border-b", "border-[#eee]", "px-4", "py-5", "pl-9", "dark:border-strokedark", "xl:pl-11");
          const wrapper9 = document.createElement("div");
          wrapper9.classList.add("flex", "items-center", "gap-3", "p-2.5", "xl:p-5");
          const text9 = document.createElement("p");
          text9.classList.add("hidden", "font-medium", "text-black", "dark:text-white", "sm:block");
          text9.textContent = element.added_at;  // Directly set the text content
          wrapper9.appendChild(text9);
          addetAtCell.appendChild(wrapper9);
          row.appendChild(addetAtCell);

          const actionCell = document.createElement('td');
          actionCell.className = 'px-4 py-5';
          const actionDiv = document.createElement('div');
          actionDiv.className = "flex items-center space-x-3.5";

          const viewIcon = document.createElement('span');
          viewIcon.className = 'cursor-pointer text-blue-500 hover:text-primary';
          viewIcon.innerHTML = `
              <svg class="fill-current" width="18" height="18" viewBox="0 0 18 18" fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M8.99981 14.8219C3.43106 14.8219 0.674805 9.50624 0.562305 9.28124C0.47793 9.11249 0.47793 8.88749 0.562305 8.71874C0.674805 8.49374 3.43106 3.20624 8.99981 3.20624C14.5686 3.20624 17.3248 8.49374 17.4373 8.71874C17.5217 8.88749 17.5217 9.11249 17.4373 9.28124C17.3248 9.50624 14.5686 14.8219 8.99981 14.8219ZM1.85605 8.99999C2.4748 10.0406 4.89356 13.5562 8.99981 13.5562C13.1061 13.5562 15.5248 10.0406 16.1436 8.99999C15.5248 7.95936 13.1061 4.44374 8.99981 4.44374C4.89356 4.44374 2.4748 7.95936 1.85605 8.99999Z"
                   />
                <path
                  d="M9 11.3906C7.67812 11.3906 6.60938 10.3219 6.60938 9C6.60938 7.67813 7.67812 6.60938 9 6.60938C10.3219 6.60938 11.3906 7.67813 11.3906 9C11.3906 10.3219 10.3219 11.3906 9 11.3906ZM9 7.875C8.38125 7.875 7.875 8.38125 7.875 9C7.875 9.61875 8.38125 10.125 9 10.125C9.61875 10.125 10.125 9.61875 10.125 9C10.125 8.38125 9.61875 7.875 9 7.875Z"
                  />
              </svg>`;
          viewIcon.onclick = () => handleAction('view', element.id);
          const is_superuser = localStorage.getItem("role");




          const updateIcon = document.createElement('span');
          updateIcon.className = 'cursor-pointer text-green-500 hover:text-success';
          updateIcon.innerHTML = `
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
              </svg>`;
          updateIcon.onclick = () => handleAction('update', element.id);
          actionDiv.appendChild(viewIcon);
          if (is_superuser === "true") {
            const deleteIcon = document.createElement('span');
            deleteIcon.style.display = "block";
            deleteIcon.className = 'cursor-pointer text-red-500 hover:text-red-700';
            deleteIcon.innerHTML = `
                  <svg class="fill-current" width="18" height="18" viewBox="0 0 18 18" fill="none"
                    xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M13.7535 2.47502H11.5879V1.9969C11.5879 1.15315 10.9129 0.478149 10.0691 0.478149H7.90352C7.05977 0.478149 6.38477 1.15315 6.38477 1.9969V2.47502H4.21914C3.40352 2.47502 2.72852 3.15002 2.72852 3.96565V4.8094C2.72852 5.42815 3.09414 5.9344 3.62852 6.1594L4.07852 15.4688C4.13477 16.6219 5.09102 17.5219 6.24414 17.5219H11.7004C12.8535 17.5219 13.8098 16.6219 13.866 15.4688L14.3441 6.13127C14.8785 5.90627 15.2441 5.3719 15.2441 4.78127V3.93752C15.2441 3.15002 14.5691 2.47502 13.7535 2.47502ZM7.67852 1.9969C7.67852 1.85627 7.79102 1.74377 7.93164 1.74377H10.0973C10.2379 1.74377 10.3504 1.85627 10.3504 1.9969V2.47502H7.70664V1.9969H7.67852ZM4.02227 3.96565C4.02227 3.85315 4.10664 3.74065 4.24727 3.74065H13.7535C13.866 3.74065 13.9785 3.82502 13.9785 3.96565V4.8094C13.9785 4.9219 13.8941 5.0344 13.7535 5.0344H4.24727C4.13477 5.0344 4.02227 4.95002 4.02227 4.8094V3.96565ZM11.7285 16.2563H6.27227C5.79414 16.2563 5.40039 15.8906 5.37227 15.3844L4.95039 6.2719H13.0785L12.6566 15.3844C12.6004 15.8625 12.2066 16.2563 11.7285 16.2563Z"
                      fill="" />
                    <path
                      d="M9.00039 9.11255C8.66289 9.11255 8.35352 9.3938 8.35352 9.75942V13.3313C8.35352 13.6688 8.63477 13.9782 9.00039 13.9782C9.33789 13.9782 9.64727 13.6969 9.64727 13.3313V9.75942C9.64727 9.3938 9.33789 9.11255 9.00039 9.11255Z"
                      fill="" />
                    <path
                      d="M11.2502 9.67504C10.8846 9.64692 10.6033 9.90004 10.5752 10.2657L10.4064 12.7407C10.3783 13.0782 10.6314 13.3875 10.9971 13.4157C11.0252 13.4157 11.0252 13.4157 11.0533 13.4157C11.3908 13.4157 11.6721 13.1625 11.6721 12.825L11.8408 10.35C11.8408 9.98442 11.5877 9.70317 11.2502 9.67504Z"
                      fill="" />
                    <path
                      d="M6.72245 9.67504C6.38495 9.70317 6.1037 10.0125 6.13182 10.35L6.3287 12.825C6.35683 13.1625 6.63808 13.4157 6.94745 13.4157C6.97558 13.4157 6.97558 13.4157 7.0037 13.4157C7.3412 13.3875 7.62245 13.0782 7.59433 12.7407L7.39745 10.2657C7.39745 9.90004 7.08808 9.64692 6.72245 9.67504Z"
                      fill="" />
                  </svg>`;
            deleteIcon.onclick = () => {
              const modal = document.getElementById('confirmationModal');
              const confirmButton = document.getElementById('confirmDelete');
              const cancelButton = document.getElementById('cancelDelete');

              modal.classList.remove('hidden'); // Show the modal
              modal.style.backgroundColor = "rgba(0, 0, 0, 0.5)";




              confirmButton.onclick = () => {
                handleAction('delete', element.id);
                modal.classList.add('hidden'); // Hide the modal after confirming
              };

              cancelButton.onclick = () => {
                modal.classList.add('hidden'); // Hide the modal without deleting
              };
            };

            actionDiv.appendChild(deleteIcon);
          }
          actionDiv.appendChild(updateIcon);
          actionCell.appendChild(actionDiv);
          row.appendChild(actionCell);

          // Append the row to the table body
          tableBody.appendChild(row);
        })
      })
      .catch(error => console.error('Delete error:', error));


  }


  // Load the first page initially
  fetchPage(currentPage);
}

// Function to handle icon actions
function handleAction(action, id) {
  let url;
  switch (action) {
    case 'delete':
      apiClient.delete(`/api/delete-candidate/${id}/`,
        {
          withCredentials: true,
          headers: {
              'X-CSRFToken': Cookies.get('csrftoken'),  // Manually extract the CSRF token
          },
      }
      )
        .then(response => {
          if (response.status === 204) { // 204 No Content means successful deletion
            console.log('Deleted:', response);
            // Find the row element in the DOM and remove it
            const rowToRemove = document.querySelector(`[data-id="${id}"]`);
            if (rowToRemove) {
              rowToRemove.remove();
            }
          }
        })
        .catch(error => console.error('Delete error:', error));
      break;
    case 'view':
      apiClient.get(`/api/get-candidate/${id}/`,
        {
          withCredentials: true,
      }
      )
        .then(function (response) {
          const responseData = response.data;
          localStorage.setItem('responseData', JSON.stringify(responseData));
          // Save the candidate data to localStorage
          //localStorage.setItem('candidateData', JSON.stringify(candidateData));

          // Redirect to profile.html
          window.location.href = "profile.html";
        })
        .catch(function (error) {
          console.error("Error fetching candidate data:", error);
          alert("Failed to fetch candidate data. Please try again.");
        });
      break;
    case 'update':
      let candidateData;
      apiClient.get(`/api/get-candidate/${id}/`,
        {
          withCredentials: true,
      }
      )
        .then(function (response) {
          candidateData = response.data;
          console.log('newww  dataa:', candidateData);
          localStorage.setItem('profileData', JSON.stringify(candidateData));
          window.location.href = "edit-profile.html";


        })
        .catch(error => {
          console.error('Error updating data:', error);
        });// Stop the event from propagating to parent elements

      break;
  }
}
