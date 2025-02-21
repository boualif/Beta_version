const form = document.getElementById("signinForm");
form.addEventListener("submit", function (e) {
    e.preventDefault();
    
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    
    // Log the data being sent
    console.log("Sending data:", { email, password });

    axios.post(`http://localhost:8000/api/signin/`, 
        {
            email: email,
            password: password,
        },
        {
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': document.cookie.split('csrftoken=')[1],
            },
            withCredentials: true,
        }
    )
    .then((response) => {
        console.log("Response:", response);  // Add this to debug
        if (response.status === 200) {
            localStorage.setItem("role", response.data.role);
            localStorage.setItem("username", response.data.username);
            localStorage.setItem("access_token", response.data.access);
            localStorage.setItem("refresh_token", response.data.refresh);
            window.location.href = "index.html";
        }
    })
    .catch((error) => {
        console.log("Full error:", error.response);  // Add this to see full error details
        console.error("Error signing in:", error.message);
    });
});