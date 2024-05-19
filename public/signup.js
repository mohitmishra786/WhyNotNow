const form = document.getElementById('signupForm');
form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const name = document.getElementById('name').value;
  const username = document.getElementById('username').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

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
});