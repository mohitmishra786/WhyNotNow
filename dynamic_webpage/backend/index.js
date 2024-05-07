const express = require('express');
const axios = require('axios');
const cors = require('cors'); // Install cors: npm install cors 
require('dotenv').config();

const app = express();
app.use(cors()); // Enable CORS for all routes
const port = process.env.PORT || 5000;

app.get('/playlist/:name', async (req, res) => {
  const name = req.params.name;
  const playlistId = process.env[`PLAYLIST_ID_${name.toUpperCase()}`];
  console.log(`${name.toUpperCase()}`);
    // const playlistId = process.env.PLAYLIST_ID;
  const apiKey = process.env.YOUTUBE_API_KEY;

  try {
    // Fetch playlist details
    const playlistDetailsUrl = `https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${playlistId}&key=${apiKey}`;
    const playlistDetailsResponse = await axios.get(playlistDetailsUrl);
    const playlistDetails = playlistDetailsResponse.data.items[0].snippet;

    // Fetch playlist items
    const playlistItemsUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&key=${apiKey}`;
    const playlistItemsResponse = await axios.get(playlistItemsUrl);
    const playlistItems = playlistItemsResponse.data.items;

    // Log playlist information
    console.log("Playlist Title:", playlistDetails.title);
    console.log("Playlist Description:", playlistDetails.description);
    console.log("Number of Videos:", playlistItems.length);
    console.log("Video Titles:");
    playlistItems.forEach(item => console.log("- ", item.snippet.title));

    console.log("Sending playlist data:", playlistItems);
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

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});