const express = require('express');
const axios = require('axios');
const cors = require('cors');
const mysql = require('mysql');
require('dotenv').config();

const app = express();
app.use(cors()); 
app.use(express.json()); 
const port = process.env.PORT || 5000;

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

// API Endpoints for User Progress

// 1. Get User Progress 
app.get('/api/courses/:playlistId/progress', (req, res) => {
    // Important: Implement proper authentication and get userId from req.user!
    const userId = req.user ? req.user.id : 1; // Placeholder! Replace with real user ID 

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
    // Important: Implement proper authentication and get userId from req.user!
    const userId = req.user ? req.user.id : 1; // Placeholder! Replace with real user ID 
    // Important: Get username from req.user as well!
    const username = req.user ? req.user.username : 'temp_user'; // Placeholder!

    const { playlistId } = req.params;
    const { videoId, completed } = req.body;

    // Corrected SQL Query: 
    const sql = `
        INSERT INTO user_course_progress (user_id, username, playlist_id, video_id, completed) 
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE completed = ?
    `; 

    db.query(sql, [userId, username, playlistId, videoId, completed ? 1 : 0, completed ? 1 : 0], (err) => {
        if (err) {
            console.error("Error updating user progress:", err);
            res.status(500).send('Error updating user progress');
        } else {
            res.sendStatus(200); 
        }
    });
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});