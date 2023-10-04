const { app, connectDB } = require('../src/expressServer'); // Import your Express app here
const { StatusCodes } = require('http-status-codes');
const request = require('supertest');
const { MongoMemoryReplSet } = require('mongodb-memory-server');
const User = require('../src/models/User');
const Album = require('../src/models/Album');
const { loginAndReturnCookie } = require('./test_helper');

let server;
let mongooseConnection;
let mongodb;

jest.mock('stripe', () => {
  // When `require('stripe')` is called, the below jest mock function will be returned instead
  return jest.fn(() => ({
    // When the `require('stripe')(API_KEY)` is called, the below object will be returned instead
    paymentIntents: {
      // The `stripe.paymentIntents.create` will be replaced with the below jest mock function that returns our mock data
      create: jest.fn(() => ({
        id: 'pi_mock123',
        client_secret: 'mock_secret',
      })),
    },
  }));
});

beforeAll(async () => {
  mongodb = await MongoMemoryReplSet.create({
    replSet: { storageEngine: 'wiredTiger' },
  });
  const url = mongodb.getUri();
  process.env.MONGO_URL = url;
  mongooseConnection = await connectDB(url);
  server = await app.listen(8001);
  // process.env.STRIPE_SECRET_KEY = stripeSecretKey; -Akos: I didn't understand what else to do using this approach
});

afterAll(async () => {
  await server.close();
  await mongooseConnection.disconnect();
  await mongodb.stop();
});

describe('OrderController API Tests', () => {
  let user;
  let album;
  let userCredentials;

  beforeAll(async () => {
    //create a user
    user = await User.create({
      email: 'Emily@google.com',
      password: 'secret',
      name: 'Emily',
      username: 'emily123',
      role: 'user',
    });
    // Create an album
    album = await Album.create({
      albumName: 'Unique Album',
      artistName: 'Unique Artist',
      spotifyUrl: 'https://api.spotify.com/v1/albums/unique',
    });
  });

  beforeEach(async () => {
    userCredentials = {
      email: 'Emily@google.com',
      password: 'secret',
    };
  });

  //create an order -Success case
  it('should create an order successfully', async () => {
    const signedCookie = await loginAndReturnCookie(userCredentials);

    //data for order
    let orderData = {
      orderItems: [
        {
          album: album._id,
          quantity: 2,
        },
      ],
      subtotal: 100,
      tax: 0.1,
      total: 110,
      user: user._id,
    };

    const response = await request(app)
      .post(`/api/v1/orders`)
      .set('Cookie', signedCookie)
      .send(orderData);

    expect(response.status).toBe(StatusCodes.CREATED);
    expect(response.body).toHaveProperty('order');
  });

  //create an order -Error case- user tries to create an order without logging in
  it('should NOT create an order successfully if the user was not logged in', async () => {
    //data for order
    const orderData = {
      orderItems: [
        {
          album: album._id,
          quantity: 2,
        },
      ],
      subtotal: 100,
      tax: 0.1,
      total: 110,
      user: user._id,
    };

    const response = await request(app).post(`/api/v1/orders`).send(orderData);
    expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
  });
  //create an order -Error case - some data is missing
  //get 401 instead of 400.. not sure why
  it('should return a 400 status if order items are missing', async () => {
    const signedCookie = await loginAndReturnCookie(userCredentials);
    const orderData = {
      subtotal: 100,
      tax: 0.1,
      total: 110,
      user: user._id,
    };

    const response = await request(app)
      .post('/api/v1/orders')
      .set('Cookie', signedCookie)
      .send(orderData);

    expect(response.status).toBe(StatusCodes.BAD_REQUEST);
  });
});
