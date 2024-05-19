const form = document.getElementById('loginForm');
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
      // TODO: Display a more user-friendly error message
    }
  } catch (error) {
    console.error('Error during login:', error);
    // TODO: Display a more user-friendly error message
  }
});