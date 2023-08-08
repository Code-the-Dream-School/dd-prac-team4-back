const mongoose = require('mongoose');
const SpotifyWebApi = require('spotify-web-api-node');
const Album = require('./src/models/Album');
require('dotenv').config();

// Set up the Spotify API client with your client ID and secret
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
});

// Connect to the MongoDB database
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Function to fetch and save albums from Spotify
async function fetchAndSaveAlbums() {
  try {
    // Get an access token using client credentials flow
    const data = await spotifyApi.clientCredentialsGrant();
    spotifyApi.setAccessToken(data.body['access_token']);

    // Fetch recent albums
    const response = await spotifyApi.searchAlbums('year:2023 tag:new', { limit: 50 });
    console.log(response)
    // Save albums to the database
    const albumsToSave = response.body.albums.items.map(item => ({
      artistName: item.artists.map(artist => artist.name).join(', '),
      albumName: item.name,
    
      // Add later more fields 
    }));

    await Album.insertMany(albumsToSave);

    console.log('Albums fetched and saved successfully.');
  } catch (error) {
    console.error('Error fetching and saving albums:', error);
  } finally {
    mongoose.connection.close();
  }
}

fetchAndSaveAlbums();
