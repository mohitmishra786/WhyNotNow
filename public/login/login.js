const form = document.getElementById('loginForm');
const errorMessageDiv = document.getElementById('errorMessage'); // Get the error message div
form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  try {
    const response = await fetch('http://localhost:5000/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
      console.log('Login successful!');
      window.location.href = '/home';
    } else {
      const errorData = await response.json();
      console.error('Login failed:', errorData.error);
      
      // Display error message on the frontend
      errorMessageDiv.textContent = errorData.error; 
    }
  } catch (error) {
    console.error('Error during login:', error);
    
    // Display error message on the frontend
    errorMessageDiv.textContent = error; 
  }
});