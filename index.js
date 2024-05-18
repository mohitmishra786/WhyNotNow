const express = require('express');
const axios = require('axios');
const cors = require('cors');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const session = require('express-session');
const path = require('path');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();
app.use(cors({
    origin: 'http://localhost:5000',
    credentials: true,
}));
app.use(express.json()); 
const port = process.env.PORT || 5000;

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

const apiKey = process.env.YOUTUBE_API_KEY;
const playlistId = process.env.PLAYLIST_ID; 

// MySQL Database Connection
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root', 
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'moonhack' 
});

db.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL database:', err);
    } else {
        console.log('Connected to MySQL database!');
    }
});

// Session Middleware (Updated with basic session management)
app.use(cookieParser());
app.use(session({
    secret: process.env.SESSION_SECRET || 'f8b78009-3e98-471f-a627-38b5a35d4529', // Example
    resave: false,
    saveUninitialized: false,
}));

app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"], // Allow resources from domain
        scriptSrc: ["'self'", "'unsafe-inline'"], // Allow inline scripts
      }
    }
}));

// Fetch playlist data
app.get('/playlist', async (req, res) => {
    try {
      // Fetch playlist details
      const playlistDetailsUrl = `https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${playlistId}&key=${apiKey}`;
      const playlistDetailsResponse = await axios.get(playlistDetailsUrl);
      const playlistDetails = playlistDetailsResponse.data.items[0].snippet;

      // Fetch playlist items
      const playlistItemsUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&key=${apiKey}`;
      const playlistItemsResponse = await axios.get(playlistItemsUrl);
      const playlistItems = playlistItemsResponse.data.items;

      // Send both playlist details and items as a single object
      res.json({
          details: playlistDetails,
          items: playlistItems
      });
    } catch (error) {
      console.error("Error fetching playlist data:", error);
      res.status(500).send('Error fetching playlist data');
    }
  });

// --------------------------------
// User Authentication Endpoints 
// --------------------------------

// 1. Signup Endpoint
app.post('/signup', async (req, res) => {
  const { name, username, email, password } = req.body;

  try {
      // Check if username already exists
      const checkUsernameSql = 'SELECT 1 FROM users WHERE username = ?';
      db.query(checkUsernameSql, [username], async (err, result) => {
          if (err) {
              console.error("Error checking username:", err);
              return res.status(500).json({ error: 'Failed to check username' });
          }

          if (result.length > 0) {
              return res.status(409).json({ error: 'Username already exists' });
          }

          // Hash the password
          const hashedPassword = await bcrypt.hash(password, 10); 

          // Insert the new user into the database
          const insertUserSql = 'INSERT INTO users (name, username, email, password) VALUES (?, ?, ?, ?)';
          db.query(insertUserSql, [name, username, email, hashedPassword], (err, result) => {
              if (err) {
                  console.error("Error inserting user:", err);
                  return res.status(500).json({ error: 'Failed to create user' });
              }

              console.log("User created successfully!");
              res.status(200).json({ message: 'User created successfully! You can now log in.' }); 
              // Frontend will handle the redirect
          });
      });
  } catch (error) {
      console.error("Error during signup:", error);
      res.status(500).json({ error: 'Failed to sign up' });
  }
});

// 2. Login Endpoint 
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const sql = 'SELECT * FROM users WHERE username = ?';
        db.query(sql, [username], async (err, result) => {
            if (err) {
                console.error("Error during login:", err);
                return res.status(500).json({ error: 'Failed to log in' });
            }

            if (result.length === 0) {
                return res.status(401).json({ error: 'Invalid username or password' });
            }

            const user = result[0];
            const isValidPassword = await bcrypt.compare(password, user.password);

            if (!isValidPassword) {
                return res.status(401).json({ error: 'Invalid username or password' });
            }

            // Successful login - set up session 
            req.session.loggedIn = true;
            req.session.username = user.username; 
            console.log("User logged in successfully!");

            // Send JSON response 
            res.status(200).json({ message: 'Login successful!' }); 
        });

    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ error: 'Failed to log in' });
    }
});

// 3. Logout Endpoint
app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error("Error destroying session:", err);
            res.status(500).send('Failed to log out');
        } else {
            res.redirect('/login.html'); // Add .html to the redirect URL
        }
    });
});

// 4. Home Endpoint
app.get('/home', (req, res) => {
    if (req.session.loggedIn) {
        // Update path if home.html is in a different location
        res.sendFile(__dirname + '/public/home.html'); 
    } else {
        res.redirect('/login'); 
    }
});

// API Endpoints for User Progress

// 1. Get User Progress 
app.get('/api/courses/:playlistId/progress', (req, res) => {
    const userId = req.session.username ? req.session.username : 'temp_user'; // Get username from session

    const { playlistId } = req.params;

    const sql = `SELECT video_id, completed 
                 FROM user_course_progress 
                 WHERE user_id = ? AND playlist_id = ?`;

    db.query(sql, [userId, playlistId], (err, results) => {
        if (err) {
            console.error("Error fetching user progress:", err);
            res.status(500).send('Error fetching user progress');
        } else {
            const progress = {};
            results.forEach(row => {
                progress[row.video_id] = row.completed === 1; 
            });
            res.json(progress);
        }
    });
});

// 2. Update User Progress 
app.post('/api/courses/:playlistId/update', (req, res) => {
    const username = req.session.username ? req.session.username : 'temp_user'; // Get username from session

    const { playlistId } = req.params;
    const { videoId, completed } = req.body;

    // 1. Get user_id from users table based on username
    const getUserIdSql = 'SELECT id FROM users WHERE username = ?';
    db.query(getUserIdSql, [username], (err, result) => {
        if (err) {
            console.error("Error getting user ID:", err);
            return res.status(500).send('Error updating user progress');
        }

        if (result.length === 0) {
            console.error("User not found:", username);
            return res.status(500).send('Error updating user progress');
        }

        const userId = result[0].id;

        // 2. Insert or update user progress 
        const sql = `
            INSERT INTO user_course_progress (user_id, username, playlist_id, video_id, completed) 
            VALUES (?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE completed = VALUES(completed) 
        `; 

        db.query(sql, [userId, username, playlistId, videoId, completed ? 1 : 0], (err) => {
            if (err) {
                console.error("Error updating user progress:", err);
                return res.status(500).send('Error updating user progress');
            } 
            res.sendStatus(200); 
        });
    });
});

// --------------------------------
// Protected Route - Example
// --------------------------------
app.get('/home', (req, res) => {
  if (req.session.loggedIn) {
      res.sendFile(__dirname + '/home.html');
  } else {
      res.redirect('/login'); // Redirect to login if not logged in
  }
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});