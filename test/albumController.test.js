const { app, connectDB } = require('../src/expressServer'); // Import your Express app here
const { StatusCodes } = require('http-status-codes');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Album = require('../src/models/Album');

// Import the AlbumController methods you want to test
const {
  getAllAlbums,
  getSingleAlbum,
  getAlbumWithAllUsersWhoPurchasedIt,
  getFilteredAlbums,
} = require('../src/albumControllercontrollers/albumController');

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
describe('GET /api/v1/albums endpoint', () => {
  const mockAlbumData = {
    albumName: 'Test Album',
    artistName: 'Test Artist',
    price: 9.99,
  };

  beforeEach(async () => {
    await Album.deleteMany({});
    await Album.create(mockAlbumData);
  });

  it('should test the getAllAlbums endpoint', async () => {
    const response = await request(app).get('/api/albums');
    expect(response.status).toBe(StatusCodes.OK);
    expect(response.body).toHaveProperty('albums');
    expect(response.body.albums).toHaveLength(1);
  });

  it('should test the getSingleAlbum endpoint', async () => {
    const albums = await Album.find({});
    const albumId = albums[0]._id;

    const response = await request(app).get(`/api/albums/${albumId}`);
    expect(response.status).toBe(StatusCodes.OK);
    expect(response.body).toHaveProperty('album');
  });

  it('should test the getAlbumWithAllUsersWhoPurchasedIt endpoint', async () => {
    const albums = await Album.find({});
    const albumId = albums[0]._id;

    const response = await request(app).get(
      `/api/albums/${albumId}/purchased-users`
    );
    expect(response.status).toBe(StatusCodes.OK);
    expect(response.body).toHaveProperty('album');
    expect(response.body).toHaveProperty('purchasingUsersCount');
  });

  it('should test the getFilteredAlbums endpoint', async () => {
    const response = await request(app).get('/api/albums?limit=10&order=asc');
    expect(response.status).toBe(StatusCodes.OK);
    expect(response.body).toHaveProperty('albums');
    expect(response.body).toHaveProperty('count');
  });
});
