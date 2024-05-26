const express = require('express');
const axios = require('axios');
const cors = require('cors');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const session = require('express-session');
const path = require('path');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const url = require('url');
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
// Access Playlists from .env
const playLists = JSON.parse(process.env.PLAYLISTS);

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

// Session Middleware
app.use(cookieParser());
app.use(session({
    secret: process.env.SESSION_SECRET || 'f8b78009-3e98-471f-a627-38b5a35d4529', 
    resave: false,
    saveUninitialized: false,
}));

app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"], 
        scriptSrc: ["'self'", "'unsafe-inline'"], 
      }
    }
}));

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Route to handle contact form submission
app.post('/send-email', (req, res) => {
    const { name, email, subject, message } = req.body;
  
    // Create a transporter using your email provider's settings
    const transporter = nodemailer.createTransport({
      service: 'gmail', // e.g., 'gmail', 'yahoo', 'hotmail'
      auth: {
        user: 'immadmohit@gmail.com', 
        pass: 'yhlk rzfk pdes rqlu'
      }
    });
  
    // Set up email data
    const mailOptions = {
      from: email, // Sender's email (from the form)
      to: 'immadmohit@gmail.com', // Your email address 
      subject: subject,
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`
    };
  
    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log('Error sending email:', error);
        res.status(500).send('Error sending email'); // Respond with an error
      } else {
        console.log('Email sent:', info.response);
        res.redirect('/contact/contact.html'); // Redirect on success
      }
    });
  });

// Route to serve available playlists
app.get('/playlists', (req, res) => {
    res.json(playLists); 
  });

// Fetch playlist data 
app.get('/playlist', async (req, res) => {
    try {
        // Get playlist NAME from query parameters 
        const playlistName = req.query.playlist; // Now read the 'playlist' parameter
        console.log("Playlist Name:", playlistName); 

        if (!playlistName) {
            return res.status(400).send('Missing playlist name');
        }

        // Look up the playlist ID from the playLists object 
        const playlistId = playLists[playlistName]; 

        if (!playlistId) {
            console.error("Playlist not found:", playlistName);
            return res.status(404).send('Playlist not found');
        }

        const playlistDetailsUrl = `https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${playlistId}&key=${apiKey}`;
        const playlistDetailsResponse = await axios.get(playlistDetailsUrl);
      
        // --- Check if items array is empty ---
        if (!playlistDetailsResponse.data.items || playlistDetailsResponse.data.items.length === 0) {
            console.error("Playlist not found or is empty:", playlistId);
            return res.status(404).send('Playlist not found'); 
        }

        const playlistDetails = playlistDetailsResponse.data.items[0].snippet;
    
        const playlistItemsUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&key=${apiKey}`;
        const playlistItemsResponse = await axios.get(playlistItemsUrl);
        const playlistItems = playlistItemsResponse.data.items;
    
        res.json({
            details: playlistDetails,
            items: playlistItems
        });
    } catch (error) {
        console.error("Error fetching playlist data:", error);
        res.status(500).send('Error fetching playlist data');
    }
});

// User Authentication Endpoints 

// 1. Signup Endpoint
app.post('/signup', async (req, res) => {
    const { name, username, email, password } = req.body;
  
    try {
        const checkUserSql = 'SELECT 1 FROM users WHERE username = ? OR email = ?';
        db.query(checkUserSql, [username, email], async (err, result) => {
            if (err) {
                console.error("Error checking username or email:", err);
                return res.status(500).json({ error: 'Failed to check user data' });
            }
  
            if (result.length > 0) {
                return res.status(409).json({ error: 'Username or email already exists' });
            }
  
            const hashedPassword = await bcrypt.hash(password, 10); 
  
            const insertUserSql = 'INSERT INTO users (name, username, email, password) VALUES (?, ?, ?, ?)';
            db.query(insertUserSql, [name, username, email, hashedPassword], (err, result) => {
                if (err) {
                    console.error("Error inserting user:", err);
                    return res.status(500).json({ error: 'Failed to create user' });
                }
  
                console.log("User created successfully!");
                res.redirect('/login/login.html');  // Redirect to login page
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

            req.session.loggedIn = true;
            req.session.username = user.username; 
            console.log("User logged in successfully!");
            res.redirect('/home/home.html');  // Redirect to home on success
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
            res.redirect('/login/login.html'); // Redirect to login after logout
        }
    });
});

// 4. Home Endpoint
app.get('/home', (req, res) => {
    if (req.session.loggedIn) {
        res.sendFile(__dirname + '/public/home/home.html'); 
    } else {
        res.redirect('/login/login.html'); 
    }
});

// API Endpoints for User Progress

// 1. Get User Progress 
app.get('/api/courses/:playlistId/progress', (req, res) => {
    const username = req.session.username ? req.session.username : 'temp_user'; // Get username from session
    const { playlistId } = req.params;

    const getUserIdSql = 'SELECT id FROM users WHERE username = ?';
    db.query(getUserIdSql, [username], (err, result) => {
        if (err) {
            console.error("Error getting user ID:", err);
            return res.status(500).send('Error fetching user progress');
        }

        if (result.length === 0) {
            console.error("User not found:", username);
            return res.status(500).send('Error fetching user progress');
        }

        const userId = result[0].id; 

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
});

// 2. Update User Progress 
app.post('/api/courses/:playlistId/update', (req, res) => {
    const username = req.session.username ? req.session.username : 'temp_user'; // Get username from session

    const { playlistId } = req.params;
    const { videoId, completed } = req.body;

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

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});