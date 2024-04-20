const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const cors = require('cors'); // Add cors package

const app = express();
const port = 3000;

// Enable CORS for all origins (adjust as needed for production)
app.use(cors()); 

// Database configuration (replace with your credentials)
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'authentication'
};

// Middleware to parse JSON request body
app.use(express.json());

// Signup route
app.post('/signup', async (req, res) => {
  const { firstName, lastName, username, email, password } = req.body;

  console.log('Received signup data:', req.body); // Log received data

  try {
    const connection = await mysql.createConnection(dbConfig);

    console.log('Connected to database'); // Log successful connection

    // Check if user exists
    const [rows] = await connection.execute(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (rows.length > 0) {
      console.log('User already exists'); // Log if user exists
      return res.status(400).json({ message: 'Username or email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Password hashed'); // Log successful hashing

    // Insert new user
    await connection.execute(
      'INSERT INTO users (first_name, last_name, username, email, password) VALUES (?, ?, ?, ?, ?)',
      [firstName, lastName, username, email, hashedPassword]
    );

    console.log(res);

    console.log('User inserted into database'); // Log successful insertion
    res.json({ message: 'User created successfully' });

    connection.end();
  } catch (err) {
    console.error('Error during signup:', err); // Log errors
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Login route (to be implemented)
app.post('/login', async (req, res) => {
  // ...
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});