const { app, connectDB } = require('../src/expressServer.js');
const { MongoMemoryReplSet } = require('mongodb-memory-server');
const request = require('supertest');
const { intervalId: orderUpdateInterval } = require('../src/models/Order');
const User = require('../src/models/User');
const { loginAndReturnCookie } = require('./test_helper');
const sender = require('../src/mailing/sender');

let server;
let mongooseConnection;
let mongodb;

const testUserCredentials = {
  email: 'ava@ava.com',
  password: 'secret',
};

const testUserData = {
  name: 'ava',
  username: 'ava',
  email: 'ava@ava.com',
  password: 'secret',
  role: 'user',
};
console.log('Test User Data:', testUserData);
console.log('Test User Credentials:', testUserCredentials);

let testUser;
beforeAll(async () => {
  mongodb = await MongoMemoryReplSet.create({
    replSet: { storageEngine: 'wiredTiger' },
  });
  const url = mongodb.getUri();
  process.env.MONGO_URL = url;
  mongooseConnection = await connectDB(url);
  server = await app.listen(8001);
});
beforeEach(async () => {
  testUser = await User.create(testUserData);
});
afterAll(async () => {
  await server.close();
  await mongooseConnection.disconnect();
  await mongodb.stop();
  clearInterval(orderUpdateInterval);
});
afterEach(async () => {
  await User.deleteMany({});
  jest.restoreAllMocks();
}, 15000);

describe('Authentication API Endpoints', () => {
  it('should register a new user and log in', async () => {
    const emailSpy = jest.spyOn(sender, 'sendWelcomeEmail');
    const registrationResponse = await request(app)
      .post('/api/v1/auth/register')
      .send(testUserData);

    expect(registrationResponse.status).toBe(201);
    expect(registrationResponse.body).toHaveProperty('user');
    const createdUser = await User.findOne({ email: testUserData.email });

    expect(createdUser).not.toBeNull();
    expect(registrationResponse.body.user).toMatchObject({
      email: createdUser.email,
      name: createdUser.name,
      role: createdUser.role,
      userId: createdUser.id,
    });
    expect(emailSpy).toHaveBeenCalledTimes(1);
    expect(emailSpy).toHaveBeenCalledWith(
      testUser.email,
      expect.objectContaining({ name: createdUser.name })
    );

    const loginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send(testUserCredentials);

    expect(loginResponse.status).toBe(201);
    expect(loginResponse.body).toHaveProperty('user');

    const userInResponse = loginResponse.body.user;
    expect(userInResponse).toHaveProperty('email');
    expect(userInResponse).toHaveProperty('name');
    expect(userInResponse).toHaveProperty('role');
    expect(userInResponse).toHaveProperty('userId');
  });

  it('should log out the user', async () => {
    const signedCookie = await loginAndReturnCookie(testUserCredentials);

    const logoutResponse = await request(app)
      .post('/api/v1/auth/logout')
      .set('Cookie', [signedCookie]);

    expect(logoutResponse.status).toBe(200);
    expect(logoutResponse.body).toEqual({ msg: 'user logged out!' });
  });

  it('should send a password reset email', async () => {
    const forgotPasswordResponse = await request(app)
      .post('/api/v1/auth/forgot_password')
      .send({ email: testUser.email });

    expect(forgotPasswordResponse.status).toBe(200);
    expect(forgotPasswordResponse.body).toEqual({
      message: 'Password reset email sent',
    });
  });
});
