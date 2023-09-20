const { app, connectDB } = require('../src/expressServer.js');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const User = require('../src/models/User');

// Declare variables for the server, database connection, and in-memory MongoDB instance
let server;
let mongooseConnection;
let mongodb;
let testUser;

// Credentials for test user
const testUserCredentials = {
  email: 'ava@ava.com',
  password: 'secret',
};

// log in and return a cookie
const loginAndReturnCookie = async (credentials) => {
  // Send a login request and get the signed cookie from the response
  const resp = await request(app).post('/api/v1/auth/login').send(credentials);

  // Get the 'set-cookie' header from the response
  const cookieHeader = resp.headers['set-cookie'];
  // Find the cookie that starts with 'token' in the 'set-cookie' header
  // Split the cookie string by ';' and take the first part (before the first ';')
  const signedCookie = cookieHeader
    .find((cookie) => cookie.startsWith('token'))
    .split(';')[0];
  return signedCookie; // Return the signed cookie, which typically contains authentication token
};

const createSingleUser = async (userData) => {
  return User.create(userData);
};

// set up the mongodb and the express server before starting the tests
beforeAll(async () => {
  // This will create a new instance of "MongoMemoryServer" and automatically start it
  mongodb = await MongoMemoryServer.create();
  const url = mongodb.getUri();
  // set the url so that our server's mongoose connects to the in-memory mongodb and not our real one
  process.env.MONGO_URL = url;
  mongooseConnection = await connectDB(url);
  testUser = await createSingleUser({
    ...testUserCredentials,
    name: 'Ava Smith',
    username: 'ava123',
    role: 'user',
  });
  server = await app.listen(8001);
});

afterAll(async () => {
  // turn off the server and mongo connections once all the tests are done
  await server.close();
  await mongooseConnection.disconnect();
  await mongodb.stop();
});

let testUser; // Declare a variable to store the test user

beforeEach(async () => {
  // Delete all users with the same email before creating the test user
  await User.deleteMany({ email: testUserCredentials.email });

  // Create a test user before each test
  testUser = await User.create({
    name: 'ava',
    username: 'ava',
    email: 'ava@ava.com',
    password: 'secret',
    role: 'user',
  });
});

afterEach(async () => {
  // Delete the test user after each test
  await User.deleteMany({});
});

describe('GET /api/v1/users/:user_id endpoint', () => {
  it('should return a valid user without the password field if found', async () => {
    // Act: Log in and get a signed cookie
    const signedCookie = await loginAndReturnCookie(testUserCredentials);

    // Act: Get user information using the authenticated cookie
    const response = await request(app)
      .get(`/api/v1/users/${testUser.id}`)
      .set('Cookie', [signedCookie]);

    // Assert: Check the response status and user information
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('user');
    expect(response.body.user).toMatchObject({
      name: 'ava',
      email: 'ava@ava.com',
      role: 'user',
    });
    expect(response.body.user).not.toHaveProperty('password');
  });

  it('should return a 404 status if user is not found', async () => {
    // Arrange: Log in and get a signed cookie with valid test user credentials
    const signedCookie = await loginAndReturnCookie(testUserCredentials);

    // Act: Attempt to get user information using the authenticated cookie
    const response = await request(app)
      .get('/api/v1/users/nonexistentUserId') // Requesting the route to get information about a non-existent user
      .set('Cookie', [signedCookie]); // Setting the 'Cookie' HTTP header with a signed cookie for authentication

    // Assert: Check the response status for 404
    expect(response.status).toBe(404);
  });
});

describe('PATCH /api/v1/users/updateCurrentUser endpoint', () => {
  it('should update the current user', async () => {
    const signedCookie = await loginAndReturnCookie({
      email: 'ava@ava.com',
      password: 'secret',
    });

    const updatedUserData = {
      email: 'new_email@example.com',
      name: 'new_name',
    };

    const response = await request(app)
      .patch('/api/v1/users/updateCurrentUser')
      .send(updatedUserData)
      .set('Cookie', [signedCookie]);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('user');
    expect(response.body.user).toMatchObject(updatedUserData);
  });

  it('should return an error if required data is missing', async () => {
    const signedCookie = await loginAndReturnCookie({
      email: 'ava@ava.com',
      password: 'secret',
    });

    const response = await request(app)
      .patch('/api/v1/users/updateCurrentUser')
      .set('Cookie', [signedCookie]);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('msg', 'Please provide all values');
  });
});

describe('PATCH /api/v1/users/updateUserPassword endpoint', () => {
  it("should update the current user's password", async () => {
    // Arrange: Log in and get a signed cookie with valid test user credentials
    const signedCookie = await loginAndReturnCookie(testUserCredentials);

    // Arrange: Define the old and new passwords
    const oldPassword = 'secret';
    const newPassword = 'newSecret';

    // Act: Attempt to update the user's password using the authenticated cookie
    const response = await request(app)
      .patch('/api/v1/users/updateUserPassword')
      .set('Cookie', [signedCookie])
      .send({ oldPassword, newPassword });

    // Assert: Check the response status for success
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('msg', 'Success! Password Updated.');
  });

  it('should return an error if old password is incorrect', async () => {
    // Arrange: Log in and get a signed cookie with valid test user credentials
    const signedCookie = await loginAndReturnCookie(testUserCredentials);

    // Arrange: Define the incorrect old password and a new password
    const incorrectOldPassword = 'incorrectSecret';
    const newPassword = 'newSecret';

    // Act: Attempt to update the user's password with an incorrect old password
    const response = await request(app)
      .patch('/api/v1/users/updateUserPassword')
      .set('Cookie', [signedCookie])
      .send({ oldPassword: incorrectOldPassword, newPassword });

    // Assert: Check the response status for an error
    expect(response.status).toBe(401);
  });

  it('should return an error if required data is missing', async () => {
    // Arrange: Log in and get a signed cookie with valid test user credentials
    const signedCookie = await loginAndReturnCookie(testUserCredentials);

    // Act: Attempt to update the user's password without providing old and new passwords
    const response = await request(app)
      .patch('/api/v1/users/updateUserPassword')
      .set('Cookie', [signedCookie])
      .send({});

    // Assert: Check the response status for an error
    expect(response.status).toBe(400);
  });
});

describe('DELETE /api/v1/users/deleteSingleUser endpoint', () => {
  it('should delete a user if the user exists', async () => {
    // Arrange: Log in and get a signed cookie with valid test user credentials
    const signedCookie = await loginAndReturnCookie(testUserCredentials);

    // Act: Attempt to delete the user using the authenticated cookie
    const response = await request(app)
      .delete('/api/v1/users/deleteSingleUser')
      .set('Cookie', [signedCookie]);

    // Assert: Check the response status for success
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('msg', 'Success! User Deleted.');
  });

  it('should return an error if the user does not exist', async () => {
    // Arrange: Log in and get a signed cookie with valid test user credentials
    const signedCookie = await loginAndReturnCookie(testUserCredentials);

    // Act: Attempt to delete a non-existent user
    const response = await request(app)
      .delete('/api/v1/users/nonexistentUserId')
      .set('Cookie', [signedCookie]);

    // Assert: Check the response status for an error
    expect(response.status).toBe(404);
  });

  it('should return an error if not authenticated', async () => {
    // Act: Attempt to delete a user without authentication
    const response = await request(app).delete(
      '/api/v1/users/deleteSingleUser'
    );

    // Assert: Check the response status for an error
    expect(response.status).toBe(401);
  });
});
/*
const { app, connectDB } = require('../src/expressServer.js');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const User = require('../src/models/User');
const { intervalId: orderUpdateInterval } = require('../src/models/Order');

// Declare variables for the server, database connection, and in-memory MongoDB instance
let server;
let mongooseConnection;
let mongodb;

// Credentials for test user
const testUserCredentials = {
  email: 'ava@ava.com',
  password: 'secret',
};

// log in and return a cookie
const loginAndReturnCookie = async (credentials) => {
  // Send a login request and get the signed cookie from the response
  const resp = await request(app).post('/api/v1/auth/login').send(credentials);

  // Get the 'set-cookie' header from the response
  const cookieHeader = resp.headers['set-cookie'];
  // Find the cookie that starts with 'token' in the 'set-cookie' header
  // Split the cookie string by ';' and take the first part (before the first ';')
  const signedCookie = cookieHeader
    .find((cookie) => cookie.startsWith('token'))
    .split(';')[0];
  return signedCookie; // Return the signed cookie, which typically contains authentication token
};

// set up the mongodb and the express server before starting the tests
beforeAll(async () => {
  // This will create a new instance of "MongoMemoryServer" and automatically start it
  mongodb = await MongoMemoryServer.create();
  const url = mongodb.getUri();
  // set the url so that our server's mongoose connects to the in-memory mongodb and not our real one
  process.env.MONGO_URL = url;
  mongooseConnection = await connectDB(url);
  server = await app.listen(8001);
});

afterAll(async () => {
  // turn off the server and mongo connections once all the tests are done
  await server.close();
  await mongooseConnection.disconnect();
  await mongodb.stop();
  // turn off the order update interval so that jest can cleanly shutdown
  clearInterval(orderUpdateInterval);
});

describe('GET /api/v1/users/:user_id endpoint', () => {
  it('should return a valid user without the password field if found', async () => {
    // Arrange: Log in and get a signed cookie with valid test user credentials
    const signedCookie = await loginAndReturnCookie(testUserCredentials);

    // Act: Get user information using the authenticated cookie
    const response = await request(app)
      .get(`/api/v1/users/${testUser.id}`)
      .set('Cookie', [signedCookie]);

    // Assert: Check the response status and user information
    expect(response.status).toBe(200); // Assertion: Expecting the response status to be 200 (successful request)
    expect(response.body).toHaveProperty('user'); // Assertion: Expecting the response body to have the property "user"
    // Assertion: Expecting the user properties (name, email, role) to match the specified values
    expect(response.body.user).toMatchObject({
      name: 'Ava Smith',
      email: 'ava@ava.com',
      role: 'user',
    });
    expect(response.body.user).not.toHaveProperty('password');
  });

  it('should return a 404 status if user is not found', async () => {
    // Arrange: Log in and get a signed cookie with valid test user credentials
    const signedCookie = await loginAndReturnCookie(testUserCredentials);

    // Act: Attempt to get user information using the authenticated cookie
    const response = await request(app)
      .get('/api/v1/users/nonexistentUserId') // Requesting the route to get information about a non-existent user
      .set('Cookie', [signedCookie]); // Setting the 'Cookie' HTTP header with a signed cookie for authentication

    // Assert: Check the response status for 404
    expect(response.status).toBe(404);
  });
});
*/
