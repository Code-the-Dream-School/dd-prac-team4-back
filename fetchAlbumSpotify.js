const mongoose = require('mongoose');
const SpotifyWebApi = require('spotify-web-api-node');
const Album = require('./src/models/Album');
require('dotenv').config();

// Set up the Spotify API client with our client ID and secret
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
    const response = await spotifyApi.searchAlbums('year:2023 tag:new', {
      limit: 50,
    });
    //console.log(response.body.albums);
    console.log(response.body.albums.items[0]); // another option:do JSON.stringify which will convert to a JSON string and print out every single field.  console.log("RESPONSE: ", JSON.stringify(response.body.albums.items[0], null, 4))
    // Save albums to the database
    const albumsToSave = response.body.albums.items.map((item) => ({
      artistName: item.artists.map((artist) => artist.name).join(', '),
      albumName: item.name,
      image: item.images?.[0].url,
      releaseDate: item.release_date,
      category: item.genres?.[0],
      spotifyUrl: item.external_urls.spotify,
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

//in case we need to delete the whole collection in mongoose:

// async function deleteCollection() {
//     try {
//       await Album.deleteMany({});
//       console.log('Collection deleted successfully.');
//     } catch (error) {
//       console.error('Error deleting collection:', error);
//     } finally {
//       mongoose.connection.close();
//     }
//   }

//   deleteCollection();
