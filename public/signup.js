const form = document.getElementById('signupForm');
form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const name = document.getElementById('name').value;
  const username = document.getElementById('username').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  // Password Validation
  if (!validatePassword(password)) {
    alert("Password must meet the following criteria:\n\n" + 
          "- At least 8 characters long\n" +
          "- At least one uppercase letter\n" +
          "- At least one lowercase letter\n" +
          "- At least one number\n" +
          "- At least one special character");
    return; 
  }

  // Email Validation
  if (!validateEmail(email)) {
    alert("Please enter a valid email address.");
    return;
  }

  // Basic password confirmation
  if (password !== confirmPassword) {
    alert("Passwords don't match!");
    return;
  }

  try {
    const response = await fetch('http://localhost:5000/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, username, email, password }),
    });

    if (response.ok) {
      console.log('Signup successful!');
      window.location.href = '/login.html'; 
    } else {
      const errorData = await response.json();
      console.error('Signup failed:', errorData.error);
      // TODO: Display a more user-friendly error message
    }
  } catch (error) {
    console.error('Error during signup:', error);
    // TODO: Display a more user-friendly error message
  }

  // Function to validate password strength
  function validatePassword(password) {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password); 
  }
  
  // Function to validate email format
  function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
});