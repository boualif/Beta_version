// notification.js
// Constants for DOM elements and configuration
const SELECTORS = {
    NOTIFICATION_CONTAINER: '#notifications-container',
    NOTIFICATION_LIST: '#notification',
    POLLING_INTERVAL: 30000 // 30 seconds
};
const CONFIG = {
    CONTAINER_IDS: ['notifications-container', 'notification'],
    POLLING_INTERVAL: 30000, // 30 seconds
    DEBUG: true // Set to true to enable detailed logging
};
function findNotificationContainer() {
    for (const id of CONFIG.CONTAINER_IDS) {
        const container = document.getElementById(id);
        if (container) {
            logger.log(`Found container with ID: ${id}`);
            return container;
        }
    }
    return null;
}
document.addEventListener('DOMContentLoaded', () => {
  // Initialize notifications
  const notificationData = sessionStorage.getItem("notificationData");
  
  // Check if we have notification data and are on the notification page
  if (notificationData && window.location.pathname.includes('notification.html')) {
      try {
          const parsedData = JSON.parse(notificationData);
          handleNotificationPage(parsedData);
      } catch (error) {
          console.error('Error parsing notification data:', error);
          showError('Error loading notification data');
      }
  }

  // Load notifications if container exists
  if (document.getElementById('notifications-container')) {
      loadNotifications();
  }
  initializeNotificationSystem();

});
function startNotificationSystem(container) {
    // Initialize notifications in the container
    loadNotifications();
    
    // Set up polling for new notifications
    setInterval(loadNotifications, CONFIG.POLLING_INTERVAL);
    
    // Log successful initialization
    logger.log('Notification system started successfully');
}

function initializeNotificationSystem() {
    const container = findNotificationContainer();
    
    if (!container) {
        logger.log('No notification container found - this might be expected if we are not on a notifications page');
        return;
    }

    logger.log('Container found, starting notification system');
    startNotificationSystem(container);
}
const logger = {
    log: (message) => CONFIG.DEBUG && console.log(`[Notifications] ${message}`),
    error: (message) => console.error(`[Notifications Error] ${message}`)
};
function initializeNotificationsList() {
    // Check for either container (supports both possible container IDs)
    const container = document.querySelector(SELECTORS.NOTIFICATION_CONTAINER) || 
                     document.querySelector(SELECTORS.NOTIFICATION_LIST);
    
    if (container) {
        loadNotifications();
        // Set up polling for new notifications
        setInterval(loadNotifications, SELECTORS.POLLING_INTERVAL);
    } else {
        console.log('Notification container not found - This might be expected if we are not on a page that displays notifications');
    }
}
// Notification handling
function handleNotificationPage(notificationData) {
    if (notificationData.type === 'resume_update') {
        handleResumeNotification(notificationData);
    } else if (notificationData.type === 'job_assignment') {
        handleJobAssignmentNotification(notificationData.job_id);
    }
}
function handleResumeNotification(notificationData) {
    const originalResume = document.getElementById("originalResume");
    const updatedResume = document.getElementById("updatedResume");
    
    if (originalResume && updatedResume && 
        notificationData.resume_1?.resume_file && 
        notificationData.resume_2?.resume_file) {
        originalResume.src = `data:application/pdf;base64,${notificationData.resume_1.resume_file}`;
        updatedResume.src = `data:application/pdf;base64,${notificationData.resume_2.resume_file}`;
    }
}

function handleJobAssignmentNotification(jobId) {
  if (!jobId) {
      console.error('No job ID provided for assignment');
      return;
  }
  
  localStorage.setItem('fromNotification', 'true');
  localStorage.setItem('notificationJobId', jobId);
  window.location.href = `job-details.html?jobId=${jobId}&process=true`;
}

function handleNotificationClick(notificationDataStr) {
    try {
        const notification = JSON.parse(decodeURIComponent(notificationDataStr));
        if (!notification.job_id) {
            console.error('No job ID in notification');
            return;
        }

        // Pré-charger les données du job immédiatement
        apiClient.get(`/api/restricted-job/${notification.job_id}/`, {
          withCredentials: true,
          headers: {
                'X-CSRFToken': Cookies.get('csrftoken')
            }
        })
        .then(response => {
            // Stocker les données du job
            localStorage.setItem('jobData', JSON.stringify(response.data));
            localStorage.setItem('fromNotification', 'true');
            localStorage.setItem('isRestricted', 'true');
            localStorage.setItem('notificationJobId', notification.job_id.toString());
            localStorage.setItem('currentNotification', JSON.stringify(notification));

            // Marquer comme lu en arrière-plan
            if (notification.id_notification && !notification.is_read) {
                markNotificationRead(notification.id_notification).catch(console.error);
            }

            // Rediriger vers la bonne URL
            window.location.href = `job-details.html?jobId=${notification.job_id}&from=notification&restricted=true`;
        })
        .catch(error => {
            console.error('Error loading job data:', error);
            notifications.showError('Failed to load job details');
        });

    } catch (error) {
        console.error('Error processing notification:', error);
        notifications.showError('Error processing notification');
    }
}


// Make it globally available
window.handleNotificationClick = handleNotificationClick;

function validateNotification(notification) {
  if (!notification) {
      console.error('Notification is null or undefined');
      return false;
  }

  if (!notification.id_notification) {
      console.error('Notification missing ID:', notification);
      return false;
  }

  if (!notification.type) {
      console.error('Notification missing type:', notification);
      return false;
  }

  return true;
}

function initNotifications() {
  console.log('Initialisation des notifications...');
  const container = document.getElementById('notifications-container');
  
  if (!container) {
      console.error('Container de notifications non trouvé');
      return;
  }

  loadNotifications();
}

// Modification de l'event listener existant
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM chargé, démarrage des notifications');
  initNotifications();

  // Vérifier si on vient d'une notification
  const fromNotification = localStorage.getItem('fromNotification');
  const notificationJobId = localStorage.getItem('notificationJobId');
  
  if (fromNotification === 'true' && notificationJobId) {
      console.log('Chargement depuis une notification pour le job:', notificationJobId);
  }
});
// UI Functions
function createNotificationElement(notification) {
    if (!notification || !notification.id_notification) {
        console.error('Invalid notification:', notification);
        return '';
    }

    const safeNotification = {
        ...notification,
        content: notification.content || '',
        recruiter_name: notification.recruiter_name || 'Unknown',
        date: notification.date || ''
    };

    const notificationData = encodeURIComponent(JSON.stringify(safeNotification));

    // Structure modifiée pour contenir correctement le point de notification
    return `
        <li>
            <a class="relative flex flex-col border-t border-stroke px-4.5 py-3 hover:bg-gray-2 dark:border-strokedark dark:hover:bg-meta-4 cursor-pointer"
               onclick="handleNotificationClick('${notificationData}')"
               data-notification-id="${safeNotification.id_notification}">
                
                <div class="flex items-center w-full">
                    <div class="flex-grow pr-8"> <!-- Ajout de padding-right pour l'espace du point -->
                        <span class="text-sm font-medium text-black dark:text-white">
                            ${safeNotification.recruiter_name}
                        </span>
                        <p class="text-sm text-gray-500">
                            ${safeNotification.content}
                        </p>
                        <p class="text-xs text-gray-400 mt-1">
                            ${safeNotification.date}
                        </p>
                    </div>
                    
                    ${!safeNotification.is_read ? `
                        <div class="absolute right-4 top-1/2 -translate-y-1/2">
                            <span class="block h-2 w-2 rounded-full bg-primary"></span>
                        </div>
                    ` : ''}
                </div>
            </a>
        </li>
    `;
}

// API Calls
function loadNotifications() {
    // Check for either container (supports both possible container IDs)
    const container = document.querySelector(SELECTORS.NOTIFICATION_CONTAINER) || 
                     document.querySelector(SELECTORS.NOTIFICATION_LIST);
    
    if (!container) {
        return; // Silent return if container not found - this might be expected on some pages
    }

    apiClient.get('/api/get-notifications/', {
        withCredentials: true,
        headers: {
            'X-CSRFToken': Cookies.get('csrftoken')
        }
    })
    .then(response => {
        const notifications = response.data || [];
        if (notifications.length === 0) {
            container.innerHTML = `
                <li class="px-4.5 py-3 text-sm text-gray-500">
                    No notifications
                </li>`;
            return;
        }
        
        container.innerHTML = notifications
            .map(notification => createNotificationElement(notification))
            .join('');
      })
    .catch(error => {
        console.error('Error loading notifications:', error);
        container.innerHTML = `
            <li class="px-4.5 py-3 text-sm text-red-500">
                Failed to load notifications
            </li>`;
    });
}

// Appeler immédiatement après le chargement du DOM
document.addEventListener('DOMContentLoaded', () => {
    loadNotifications();
});

// Rafraîchir périodiquement les notifications
setInterval(loadNotifications, 30000); // Toutes les 30 secondes

// S'assurer que le DOM est chargé avant d'initialiser
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM chargé, initialisation des notifications');
  loadNotifications();
});

// Ajouter une fonction pour rafraîchir les notifications
function refreshNotifications() {
  loadNotifications();
}

// Rafraîchir toutes les 30 secondes
setInterval(refreshNotifications, 30000);

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  console.log('Initializing notifications...');
  loadNotifications();
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  loadNotifications();
});

function markNotificationRead(notificationId) {
    if (!notificationId) {
        return Promise.reject(new Error('Invalid notification ID'));
    }

    return apiClient.post(`/api/notifications/${notificationId}/mark-read/`, {}, {
        withCredentials: true,
        headers: {
            'X-CSRFToken': Cookies.get('csrftoken')
        }
    });
}

function approveChanges(notificationData) {
  if (!notificationData?.id_candidate || !notificationData?.id_notification) {
      console.error('Missing notification data for approval');
      return;
  }

  apiClient.patch(`/api/confirm-update/${notificationData.id_candidate}/`, 
        { id: notificationData.id_notification },
        {
          withCredentials: true,
          headers: {
              'X-CSRFToken': Cookies.get('csrftoken')
          }
      }
      )
  .then(response => {
      if (response.status === 200) {
          showSuccess('Changes approved successfully');
          deleteNotification(notificationData.id_notification);
        }
      })
  .catch(error => {
      console.error('Error approving changes:', error);
      showError('Failed to approve changes');
      });
  }

function discardChanges(notificationData) {
  if (!notificationData?.id_candidate || !notificationData?.id_notification) {
      console.error('Missing notification data for discard');
      return;
  }

  apiClient.patch(`/api/cancel-update/${notificationData.id_candidate}/`,
      { id: notificationData.id_notification },
        {
          withCredentials: true,
          headers: {
              'X-CSRFToken': Cookies.get('csrftoken')
          }
      }
      )
  .then(response => {
      if (response.status === 200) {
          showSuccess('Changes discarded');
          deleteNotification(notificationData.id_notification);
      }
  })
  .catch(error => {
      console.error('Error discarding changes:', error);
      showError('Failed to discard changes');
      });
  }

function deleteNotification(id) {
  apiClient.delete(`/api/delete-notif/${id}/`, {
          withCredentials: true,
      headers: {
          'X-CSRFToken': Cookies.get('csrftoken')
      }
  })
  .then(() => {
      const element = document.querySelector(`[data-notification-id="${id}"]`);
      if (element) element.remove();
  })
  .catch(error => {
      console.error('Error deleting notification:', error);
      showError('Failed to delete notification');
  });
}

// Utility Functions
function showError(message) {
  const notifications = {
      showError: function(message) {
          const messageDiv = document.createElement('div');
          messageDiv.className = 'fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-50';
          messageDiv.textContent = message;
          document.body.appendChild(messageDiv);
          setTimeout(() => messageDiv.remove(), 3000);
      }
  };
  notifications.showError(message);
}

function showSuccess(message) {
  const notifications = {
      showSuccess: function(message) {
          const messageDiv = document.createElement('div');
          messageDiv.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50';
          messageDiv.textContent = message;
          document.body.appendChild(messageDiv);
          setTimeout(() => messageDiv.remove(), 3000);
      }
  };
  notifications.showSuccess(message);
}
const notifications = {
    showError: function(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-50';
        messageDiv.textContent = message;
        document.body.appendChild(messageDiv);
        setTimeout(() => messageDiv.remove(), 3000);
    },
    
    showSuccess: function(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50';
        messageDiv.textContent = message;
        document.body.appendChild(messageDiv);
        setTimeout(() => messageDiv.remove(), 3000);
    }
};
function showNotification(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `fixed bottom-4 right-4 text-white px-4 py-2 rounded shadow-lg z-50 ${
        type === 'error' ? 'bg-red-500' : 'bg-green-500'
    }`;
    messageDiv.textContent = message;
    document.body.appendChild(messageDiv);
    setTimeout(() => messageDiv.remove(), 3000);
  }
// Make necessary functions globally available
window.handleNotificationClick = handleNotificationClick;
window.notifications = notifications;