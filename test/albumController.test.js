const { app, connectDB } = require('../src/expressServer'); // Import your Express app here
const { StatusCodes } = require('http-status-codes');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Album = require('../src/models/Album');
const User = require('../src/models/User');
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
    const response = await request(app).get('/api/v1/albums');

    expect(response.status).toBe(StatusCodes.OK);
    expect(response.body).toHaveProperty('albums');
    expect(response.body).toHaveProperty('count');
    expect(response.body.albums).toEqual([]);
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
    const album = await Album.findOne({});

    const adminCredentials = {
      email: 'admin@admin.com',
      password: 'adminpassword',
    };

    // Use the loginAndReturnCookie function to log in as admin and get the signed cookie
    const signedCookie = await loginAndReturnCookie(adminCredentials);

    const response = await request(app)
      .get(`/api/v1/albums/${album._id}/listOfUsersWhoPurchasedThisAlbum`)
      .set('Cookie', signedCookie);

    expect(response.status).toBe(StatusCodes.OK);
    expect(response.body).toHaveProperty('album');
    expect(response.body).toHaveProperty('purchasingUsersCount');
  });

  it('should test the getFilteredAlbums endpoint - Success Case', async () => {
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
    expect(response.body).toHaveProperty('albums');
    expect(response.body).toHaveProperty('count');
    expect(response.body.albums).toHaveLength(1);
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

    const limit = 3;
    const response = await request(app).get(
      `/api/v1/albums/filter?limit=${limit}`
    );

    expect(response.status).toBe(StatusCodes.OK);
    expect(response.body).toHaveProperty('albums');
    expect(response.body).toHaveProperty('count');
    expect(response.body.albums).toHaveLength(limit);
    expect(response.body.count).toBe(albumsToCreate.length);
  });

  it('should create a new album - Success Case', async () => {
    const adminCredentials = {
      email: 'admin@admin.com',
      password: 'adminpassword',
    };

    const signedCookie = await loginAndReturnCookie(adminCredentials);

    const newAlbumData = {
      albumName: 'New Album',
      artistName: 'New Artist',
      price: 9.99,
      spotifyUrl: 'https://api.spotify.com/v1/albums/new123',
    };

    const response = await request(app)
      .post('/api/v1/albums')
      .set('Cookie', signedCookie)
      .send(newAlbumData);

    expect(response.status).toBe(StatusCodes.CREATED);
    expect(response.body).toHaveProperty('album');
  });

  it('should create a new album - Error Case (Invalid Data)', async () => {
    const adminCredentials = {
      email: 'admin@admin.com',
      password: 'adminpassword',
    };

    const signedCookie = await loginAndReturnCookie(adminCredentials);

    const invalidAlbumData = {
      artistName: 'New Artist',
      price: 12.99,
      spotifyUrl: 'https://api.spotify.com/v1/albums/new123',
    };

    const response = await request(app)
      .post('/api/v1/albums')
      .set('Cookie', signedCookie)
      .send(invalidAlbumData);

    expect(response.status).toBe(StatusCodes.BAD_REQUEST);
  });

  it('should update an existing album - Success Case', async () => {
    const adminCredentials = {
      email: 'admin@admin.com',
      password: 'adminpassword',
    };

    const signedCookie = await loginAndReturnCookie(adminCredentials);

    const existingAlbum = await Album.findOne({});
    const updatedData = {
      albumName: 'Updated Album Name',
    };

    const response = await request(app)
      .patch(`/api/v1/albums/${existingAlbum._id}`)
      .set('Cookie', signedCookie)
      .send(updatedData);

    expect(response.status).toBe(StatusCodes.OK);
    expect(response.body).toHaveProperty('album');
    const updatedAlbum = await Album.findById(existingAlbum._id);

    expect(updatedAlbum).not.toBeNull();
    expect(updatedAlbum.albumName).toBe(updatedData.albumName);
  });

  it('should update an existing album - Error Case (Not Found)', async () => {
    const adminCredentials = {
      email: 'admin@admin.com',
      password: 'adminpassword',
    };

    const signedCookie = await loginAndReturnCookie(adminCredentials);

    const invalidAlbumId = 'invalidAlbumId';
    const updatedData = {
      albumName: 'Updated Album Name',
    };

    const response = await request(app)
      .patch(`/api/v1/albums/${invalidAlbumId}`)
      .set('Cookie', signedCookie)
      .send(updatedData);

    expect(response.status).toBe(StatusCodes.NOT_FOUND);
  });

  it('should update album prices - Success Case', async () => {
    const adminCredentials = {
      email: 'admin@admin.com',
      password: 'adminpassword',
    };

    const signedCookie = await loginAndReturnCookie(adminCredentials);

    const existingAlbum = await Album.findOne({});
    const updatedData = {
      id: existingAlbum._id,
      price: 14.99,
    };

    const response = await request(app)
      .patch(`/api/v1/albums/${existingAlbum._id}`)
      .set('Cookie', signedCookie)
      .send(updatedData);

    expect(response.status).toBe(StatusCodes.OK);
    expect(response.body).toHaveProperty('album');
  });

  it('should update album prices - Error Case (Invalid Price)', async () => {
    const adminCredentials = {
      email: 'admin@admin.com',
      password: 'adminpassword',
    };

    const signedCookie = await loginAndReturnCookie(adminCredentials);
    const existingAlbum = await Album.findOne({});
    const invalidPriceData = {
      price: -5.99, // Invalid price
    };

    const response = await request(app)
      .patch(`/api/v1/albums/${existingAlbum._id}`)
      .set('Cookie', signedCookie)
      .send(invalidPriceData);

    expect(response.status).toBe(StatusCodes.BAD_REQUEST);
  });
});
