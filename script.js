const playlistContainer = document.getElementById('playlist-container');

async function fetchPlaylistItems() {
    try{
        const response = await fetch('/playlist'); // Fetch from '/playlist' route
        const data = await response.json();

        console.log("Received playlist data:", data);
        playlistContainer.innerHTML = ''; // Clear previous items

        data.forEach(item => {
            const videoTitle = item.snippet.title;
            const videoThumbnailUrl = item.snippet.thumbnails.default.url;
            const videoId = item.snippet.resourceId.videoId; // Get the video ID

            // Create elements for each playlist item
            const itemElement = document.createElement('div');
            itemElement.classList.add('playlist-item'); // Add a class for styling

            const imgElement = document.createElement('img');
            imgElement.src = videoThumbnailUrl;
            const titleElement = document.createElement('h3');
            titleElement.textContent = videoTitle;

            const linkElement = document.createElement('a');
            linkElement.href = `https://www.youtube.com/watch?v=${videoId}`; // Link to the YouTube video
            linkElement.target = "_blank"; // Open in a new tab
            linkElement.appendChild(imgElement);
            linkElement.appendChild(titleElement);

            itemElement.appendChild(linkElement);
            playlistContainer.appendChild(itemElement); 
        });
    }
    catch(error){
        console.error("Error fetching playlist:", error);
    }
}

// Example: Fetch playlist with ID 'PLmxT2pVYo5LB5EzTPZGfFN0c2GDiSXgQe' 
fetchPlaylistItems();