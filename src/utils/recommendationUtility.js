const SpotifyWebApi = require('spotify-web-api-node'); // Import Spotify Web API library
const AlbumRecommendation = require('../models/AlbumRecommendation');

// Set up Spotify Web API client with credentials
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
});

async function generateRecommendations(userId, listeningHistory) {
  try {
    // Check if listeningHistory is empty
    if (listeningHistory.length === 0) {
      console.warn('No listening history found for user:', userId);
      return;
    }

    // Extract artistIds from listeningHistory
    const artistIds = listeningHistory.map((entry) => entry.artistId);

    // Make a call to Spotify's "Get Recommendations" endpoint
    const response = await spotifyApi.getRecommendations({
      seed_artists: artistIds.join(','),
    });

    // Store the returned recommended tracks/songs in the AlbumRecommendation schema
    const recommendations = response.body.tracks.map((track) => ({
      userId,
      songId: track.id,
    }));

    await AlbumRecommendation.insertMany(recommendations);
  } catch (error) {
    console.error('Error generating recommendations:', error);
  }
}

module.exports = {
  generateRecommendations,
};
