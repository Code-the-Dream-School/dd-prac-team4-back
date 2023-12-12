// recommendationUtility.js
const axios = require('axios'); // for making HTTP requests
const AlbumRecommendation = require('../models/AlbumRecommendation');
const ListeningHistory = require('../models/ListeningHistory');

async function generateRecommendations(userId) {
  try {
    // Fetch the top 5 listened to artists from the user's listening history
    const listeningHistory = await ListeningHistory.find({ userId })
      .sort({ playCount: -1 })
      .limit(5);

    // Extract artistIds from listeningHistory
    const artistIds = listeningHistory.map((entry) => entry.artistId);

    // Make a call to Spotify's "Get Recommendations" endpoint
    const spotifyApiEndpoint = 'https://api.spotify.com/v1/recommendations';
    const response = await axios.get(spotifyApiEndpoint, {
      params: {
        seed_artists: artistIds.join(','),
      },
      headers: {
        Authorization: 'SPOTIFY_ACCESS_TOKEN',
      },
    });

    // Store the returned recommended tracks/songs in the AlbumRecommendation schema
    const recommendations = response.data.tracks.map((track) => ({
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
