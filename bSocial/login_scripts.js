// login_scripts.js

function submitLoginForm() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
  
    // Perform any additional client-side validation if needed
  
    // Send login data to the backend
    fetch('http://localhost:3000/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    })
      .then(response => {
        // Check if the response status is OK (status code 200)
        if (response.ok) {
          // Parse the JSON response
          return response.json();
        } else {
          // Parse the JSON error response
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
      })
      .then(data => {
        // Handle the response from the backend
        console.log('Login response:', data);
  
        // If login is successful and token is present, store the JWT token in local storage
        if (data.token) {
          localStorage.setItem('jwtToken', data.token);
          
          // Redirect to another page
          window.location.href = 'index.html';
        } else {
          // Display an alert for failed login attempts
          alert('Login failed. Please check your credentials.');
        }
      })
      .catch(error => {
        console.error('Error during login:', error);
        alert('An error occurred during login. Please try again.');
      });
  }
  