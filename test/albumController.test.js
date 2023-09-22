const { app, connectDB } = require('../src/expressServer'); // Import your Express app here
const { StatusCodes } = require('http-status-codes');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Album = require('../src/models/Album');
const { loginAndReturnCookie } = require('./test_helper');

let server;
let mongooseConnection;
let mongodb;

beforeAll(async () => {
  mongodb = await MongoMemoryServer.create();
  const url = mongodb.getUri();
  process.env.MONGO_URL = url;
  mongooseConnection = await connectDB(url);
  server = await app.listen(8001);
});

afterAll(async () => {
  await server.close();
  await mongooseConnection.disconnect();
  await mongodb.stop();
});

describe('AlbumController API Tests', () => {
  const mockAlbumData = {
    albumName: 'Test Album',
    artistName: 'Test Artist',
    price: 9.99,
    spotifyUrl: 'https://api.spotify.com/v1/albums/blah123',
  };
  beforeAll(async () => {
    await User.create({
      email: 'admin@admin.com',
      password: 'adminpassword',
      name: 'Ava Smith',
      username: 'ava123',
      role: 'admin',
    });
  });
  beforeEach(async () => {
    await Album.deleteMany({});
    await Album.create(mockAlbumData);
  });

  it('should test the getAllAlbums endpoint - Success Case', async () => {
    const response = await request(app).get('/api/v1/albums');
    expect(response.status).toBe(StatusCodes.OK);
    expect(response.body).toHaveProperty('albums');
    expect(response.body.albums).toHaveLength(1);
  });

  it('should return an empty list if there are no albums in the database', async () => {
    await Album.deleteMany({});
    // Make a GET request to the /api/v1/albums endpoint
    const response = await request(app).get('/api/v1/albums');

    // Assert that the response status is OK (200)
    expect(response.status).toBe(StatusCodes.OK);

    // Assert that the response body is an object with "albums" and "count" keys
    expect(response.body).toHaveProperty('albums');
    expect(response.body).toHaveProperty('count');

    // Assert that "albums" is an empty array since there are no albums in the database
    expect(response.body.albums).toEqual([]);

    // Assert that the "count" field reflects the actual count of albums (which is 0 in this case)
    expect(response.body.count).toBe(0);
  });

  it('should test the getSingleAlbum endpoint - Success Case', async () => {
    const { _id: albumId } = await Album.findOne({});

    const response = await request(app).get(`/api/v1/albums/${albumId}`);
    expect(response.status).toBe(StatusCodes.OK);
    expect(response.body).toHaveProperty('album');
  });

  it('should test the getSingleAlbum endpoint - Error Case (Not Found)', async () => {
    const response = await request(app).get('/api/v1/albums/invalidAlbumId');
    expect(response.status).toBe(StatusCodes.NOT_FOUND);
  });

  it('should test the getAlbumWithAllUsersWhoPurchasedIt endpoint - Success Case', async () => {
    // Try to find an album; if not found, create a default one
    const album = await Album.findOne({});

    const adminCredentials = {
      email: 'admin@admin.com',
      password: 'adminpassword',
    };

    // Use the loginAndReturnCookie function to log in as admin and get the signed cookie
    const signedCookie = await loginAndReturnCookie(adminCredentials);

    // Make a request to the endpoint and set the obtained cookie
    const response = await request(app)
      .get(`/api/v1/albums/${album._id}/listOfUsersWhoPurchasedThisAlbum`)
      .set('Cookie', signedCookie); // Set the obtained cookie

    // Check if the response status is OK and contains the expected properties
    expect(response.status).toBe(StatusCodes.OK);
    expect(response.body).toHaveProperty('album');
    expect(response.body).toHaveProperty('purchasingUsersCount');
  });

  it('should test the getFilteredAlbums endpoint - Success Case', async () => {
    // Create 1 album in the database
    const albumToCreate = {
      albumName: 'Album 1',
      artistName: 'Artist 1',
      spotifyUrl: 'https://api.spotify.com/v1/albums/blah123',
    };

    await Album.create(albumToCreate);

    const response = await request(app).get(
      '/api/v1/albums/filter?limit=10&order=asc'
    );

    expect(response.status).toBe(StatusCodes.OK);
    // Assert that the response body is an object with "albums" and "count" keys
    expect(response.body).toHaveProperty('albums');
    expect(response.body).toHaveProperty('count');
    // Assert that "albums" is an array with the expected number of albums (based on the limit)
    // In this case, since we have only 1 album in the database, the "albums" array should have 1 item
    expect(response.body.albums).toHaveLength(1);

    // Assert that the "count" field reflects the actual count of albums in the database
    // In this case, it should be 1 because we created 1 album
    expect(response.body.count).toBe(1);
  });

  it('should return a limited list of albums when using a limit parameter', async () => {
    const albumsToCreate = [
      {
        albumName: 'Album 1',
        artistName: 'Artist 1',
        price: 9.99,
        image: '/uploads/album1.jpg',
        releaseDate: '2022-01-01T00:00:00.000Z',
        category: 'rock',
        spotifyUrl: 'https://api.spotify.com/v1/albums/blah123',
        averageRating: 4.5,
        numOfReviews: 2,
      },
      {
        albumName: 'Album 2',
        artistName: 'Artist 2',
        price: 8.99,
        image: '/uploads/album2.jpg',
        releaseDate: '2022-02-01T00:00:00.000Z',
        category: 'pop',
        spotifyUrl: 'https://api.spotify.com/v1/albums/blah123',
        averageRating: 3.7,
        numOfReviews: 3,
      },
      {
        albumName: 'Album 3',
        artistName: 'Artist 3',
        price: 7.99,
        image: '/uploads/album3.jpg',
        releaseDate: '2022-03-01T00:00:00.000Z',
        category: 'rock',
        spotifyUrl: 'https://api.spotify.com/v1/albums/blah123',
        averageRating: 4.2,
        numOfReviews: 1,
      },
    ];

    await Album.insertMany(albumsToCreate);

    // Make a GET request to the /api/v1/albums/filter endpoint with a limit parameter set to 2
    const limit = 2;
    const response = await request(app).get(`/api/v1/albums/filter?limit=${limit}`);

    // Assert that the response status is OK (200)
    expect(response.status).toBe(StatusCodes.OK);

    // Assert that the response body is an object with "albums" and "count" keys
    expect(response.body).toHaveProperty('albums');
    expect(response.body).toHaveProperty('count');

    // Assert that "albums" is an array with a length equal to the specified limit
    expect(response.body.albums).toHaveLength(limit);

    // Assert that the "count" field reflects the actual count of albums in the database
    // In this case, it should be 5 because we created 5 albums
    expect(response.body.count).toBe(albumsToCreate.length);
  });
});
