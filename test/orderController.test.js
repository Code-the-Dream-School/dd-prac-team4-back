const { app, connectDB } = require('../src/expressServer'); // Import your Express app here
const { StatusCodes } = require('http-status-codes');
const request = require('supertest');
const { MongoMemoryReplSet } = require('mongodb-memory-server');
const User = require('../src/models/User');
const { Order } = require('../src/models/Order');
const Album = require('../src/models/Album');
const { loginAndReturnCookie } = require('./test_helper');
const mongoose = require('mongoose');
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
  //A version of the mongo server that supports replica sets must be used for the order controller test cases because Mongo transactions are used
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

describe('OrderController API Tests', () => {
  let user;
  let album;
  let userCredentials;
  let admin;

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
    expect(response.body).toHaveProperty('clientSecret');
    expect(response.body.clientSecret).toEqual('mock_secret');
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

  // Delete order - Success case
  it('should delete an order successfully', async () => {
    //create an admin
    admin = await User.create({
      email: 'Holly@google.com',
      password: 'secret',
      name: 'Holly',
      username: 'Holly123',
      role: 'admin',
    });
    const adminCredentials = {
      email: 'Holly@google.com',
      password: 'secret',
    };
    const signedCookie = await loginAndReturnCookie(adminCredentials);

    const orderData = {
      user: admin._id,
      orderItems: [{ album: album._id, quantity: 2 }],
      subtotal: 200,
      tax: 0.1,
      total: 210,
    };
    const order = await Order.create(orderData);

    const response = await request(app)
      .delete(`/api/v1/orders/${order._id}`) // Assuming testUser is the user you want to delete
      .set('Cookie', signedCookie);

    expect(response.status).toBe(StatusCodes.OK);
    expect(response.body).toEqual({ msg: 'Success! Order was deleted' });
  });

  // Delete order - Error case - Order not found
  it('should return a 404 status if the order to delete is not found', async () => {
    const nonExistingOrderId = 'nonexistingorderid';

    const adminCredentials = {
      email: 'Holly@google.com',
      password: 'secret',
    };
    const signedCookie = await loginAndReturnCookie(adminCredentials);

    const response = await request(app)
      .delete(`/api/v1/orders/${nonExistingOrderId}`)
      .set('Cookie', signedCookie);

    expect(response.status).toBe(StatusCodes.NOT_FOUND);
  });

  // Delete order - Error case - Unauthorized user
  it('should return a 403 status if non-admin users is trying to delete the order', async () => {
    const signedCookie = await loginAndReturnCookie(userCredentials);
    console.log(signedCookie);

    const mockOrderId = new mongoose.Types.ObjectId();
    const response = await request(app)
      .delete(`/api/v1/orders/${mockOrderId}`)
      .set('Cookie', signedCookie);

    expect(response.status).toBe(StatusCodes.FORBIDDEN);
  });
});
