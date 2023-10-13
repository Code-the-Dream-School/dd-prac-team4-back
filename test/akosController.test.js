const { MongoMemoryReplSet } = require('mongodb-memory-server');
const request = require('supertest');
const { app, connectDB } = require('../src/expressServer');
// const { Order } = require('../models/Order');
// const User = require('../src/models/User');
// const Album = require('../src/models/Album');

let server;
let mongooseConnection;
let mongodb;

beforeAll(async () => {
  mongodb = await MongoMemoryReplSet.create({
    replSet: { storageEngine: 'wiredTiger' },
  });
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

it('should work', async () => {
  const mockData = {
    name: 'akos',
    username: 'akos',
    email: 'akos@gm.com',
    password: 'akosua11',
    role: 'admin',
  };
  // const mockData = {
  // 	albumName: 'Test Album',
  // 	artistName: 'Test Artist',
  // 	price: 9.99,
  // 	spotifyUrl: 'https://api.spotify.com/v1/albums/blah123',
  // }
  // const user = await User.create({
  // 	email: 'Emily@google.com',
  // 	password: 'secret',
  // 	name: 'Emily',
  // 	username: 'emily123',
  // 	role: 'user',
  // });

  // const album = await Album.create({
  //   albumName: 'Unique Album',
  //   artistName: 'Unique Artist',
  //   spotifyUrl: 'https://api.spotify.com/v1/albums/unique',
  // });

  // const mockData = {
  // 	orderItems: [
  // 		{
  // 			album: album._id,
  // 			quantity: 2,
  // 		},
  // 	],
  // 	subtotal: 100,
  // 	tax: 0.10,
  // 	total: 110,
  // 	user: user._id,
  // }

  // const mockData = {
  // 	user: "user._id",
  // 	albums: [album._id]
  // }

  const response = await request(app).post('/api/v1/akos').send(mockData);
  expect(response.status).toEqual(201);
});
