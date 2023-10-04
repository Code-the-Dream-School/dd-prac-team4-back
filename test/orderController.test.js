const { app, connectDB } = require('../src/expressServer'); // Import your Express app here
const { StatusCodes } = require('http-status-codes');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Order = require('../src/models/Order');
const User = require('../src/models/User');
const Album = require('../src/models/Album');
const { loginAndReturnCookie } = require('./test_helper');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
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

describe('OrderController API Tests', () => {
  let user;
  let album;
  let userCredentials;
  let response;

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
    const mockPaymentIntent = {
      id: 'pi_mock123',
      client_secret: 'mock_secret',
    };
    //data for order
    let orderData = {
      orderItems: [
        {
          album: album._id,
          quantity: 2,
        },
      ],
      subtotal: 100,
      tax: 10,
      total: 110,
      user: user._id,
      paymentIntentId: mockPaymentIntent.id,
    };

    //AKOS: this one gives 500 status code
    response = await request(app)
      .post(`/api/v1/orders`)
      .set('Cookie', signedCookie)
      .send(orderData);

    expect(response.status).toBe(StatusCodes.CREATED);
    expect(response.body).toHaveProperty(
      'clientSecret',
      mockPaymentIntent.client_secret
    );
    expect(response.body).toHaveProperty('order');
  });

  //create an order -Error case- user tries to create an order without logging in
  it('should create an order successfully- Error case- user was not logged in', async () => {
    //data for order
    const orderData = {
      orderItems: [
        {
          album: album._id,
          quantity: 2,
        },
      ],
      subtotal: 100,
      tax: 10,
      total: 110,
      user: user._id,
    };

    response = await request(app).post(`/api/v1/orders`).send(orderData);
    expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
  });
  //create an order -Error case - some data is missing
  //get 201 instead of 400.. not sure why
  it('should return a 400 status if order items are missing', async () => {
    const orderData = {
      orderItems: [],
      subtotal: 100,
      tax: 10,
      total: 110,
      user: user._id,
    };

    const response = await request(app).post('/api/v1/orders').send(orderData);

    expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    expect(response.body).toHaveProperty(
      'error',
      'Unable to create an order because the order items are missing.'
    );
  });
});
