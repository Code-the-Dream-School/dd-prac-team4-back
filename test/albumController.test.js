const { app, connectDB } = require('../src/expressServer'); // Import your Express app here
const { StatusCodes } = require('http-status-codes');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Album = require('../src/models/Album');

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
    expect(response.body).toEqual([]);
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
    const { _id: albumId } = await Album.findOne({});

    const response = await request(app).get(
      `/api/v1/albums/:id/listOfUsersWhoPurchasedThisAlbum`
    );
    expect(response.status).toBe(StatusCodes.OK);
    expect(response.body).toHaveProperty('album');
    expect(response.body).toHaveProperty('album');
    expect(response.body).toHaveProperty('purchasingUsersCount');
  });

  it('should test the getAlbumWithAllUsersWhoPurchasedIt endpoint - Error Case (Not Found)', async () => {
    const response = await request(app).get(
      '/api/v1/albums/invalidAlbumId/listOfUsersWhoPurchasedThisAlbum'
    );
    expect(response.status).toBe(StatusCodes.NOT_FOUND); // Expect not found status code
  });

  it('should test the getFilteredAlbums endpoint - Success Case', async () => {
    const response = await request(app).get(
      '/api/v1/albums?limit=10&order=asc'
    );
    expect(response.status).toBe(StatusCodes.OK);
    expect(response.body).toHaveProperty('albums');
    expect(response.body).toHaveProperty('count');
  });
});
