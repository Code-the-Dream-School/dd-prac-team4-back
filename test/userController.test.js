const { app, connectDB } = require('../src/expressServer.js');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const User = require('../src/models/User');
const { loginAndReturnCookie } = require('./test_helper');
const closeAllConnections = require('./testHelpers');

// Declare variables for the server, database connection, and in-memory MongoDB instance
let server;
let mongooseConnection;
let mongodb;
let testUser;
// eslint-disable-next-line no-unused-vars
let testAdmin;

// Credentials for test user
const testUserCredentials = {
  email: 'ava@ava.com',
  password: 'secret',
};
// Credentials for test admin
const testAdminCredentials = {
  email: 'admin@admin.com',
  password: 'secret',
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
  await closeAllConnections({ server, mongooseConnection, mongodb });
});

beforeEach(async () => {
  // Delete all users before creating the test users (one for each role)
  await User.deleteMany({});

  // Create a test user before each test
  testUser = await User.create({
    name: 'ava',
    username: 'ava',
    email: 'ava@ava.com',
    password: 'secret',
    role: 'user',
  });
  testAdmin = await User.create({
    name: 'admin',
    username: 'admin',
    email: 'admin@admin.com',
    password: 'secret',
    role: 'admin',
  });
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
    // Arrange: Log in and get a signed cookie with valid test user credentials
    const signedCookie = await loginAndReturnCookie(testUserCredentials);

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
    const signedCookie = await loginAndReturnCookie(testUserCredentials);

    const response = await request(app)
      .patch('/api/v1/users/updateCurrentUser')
      .set('Cookie', [signedCookie]);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('msg', 'Please provide all values');
  });
});

describe('GET /api/v1/users/showMe/withAlbums endpoint', () => {
  it('should return the data of the currently authenticated user with purchased albums', async () => {
    // Act: Log in and get a signed cookie
    const signedCookie = await loginAndReturnCookie(testUserCredentials);

    // Act: Get the current user's information with purchased albums using the authenticated cookie
    const response = await request(app)
      .get('/api/v1/users/showMe/withAlbums')
      .set('Cookie', [signedCookie]);

    // Assert: Check the response status and user information
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('user');
    expect(response.body.user).toHaveProperty('name', 'ava');
    expect(response.body.user).toHaveProperty('email', 'ava@ava.com');
    expect(response.body.user).toHaveProperty('role', 'user');
    expect(response.body.user).toHaveProperty('purchasedAlbums');
    expect(Array.isArray(response.body.user.purchasedAlbums)).toBe(true);

    // Check that each purchased album has required properties
    response.body.user.purchasedAlbums.forEach((album) => {
      expect(album).toHaveProperty('title');
      expect(album).toHaveProperty('artist');
      expect(album).toHaveProperty('year');
      // Add more checks for album properties if needed
    });

    expect(response.body.user).not.toHaveProperty('password');
  });

  it('should return a 401 status if the user is not authenticated', async () => {
    // Act: Attempt to get the current user's information with purchased albums without authentication
    const response = await request(app).get('/api/v1/users/showMe/withAlbums');

    // Assert: Check the response status for 401
    expect(response.status).toBe(401);
  });
});

describe('GET /api/v1/users/showCurrentUser endpoint', () => {
  it('should return the data of the currently authenticated user', async () => {
    // Act: Log in and get a signed cookie
    const signedCookie = await loginAndReturnCookie(testUserCredentials);

    // Act: Get the current user's information using the authenticated cookie
    const response = await request(app)
      .get('/api/v1/users/showMe')
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

  it('should return a 401 status if the user is not authenticated', async () => {
    // Act: Attempt to get the current user's information without authentication
    const response = await request(app).get('/api/v1/users/showMe');

    // Assert: Check the response status for 401
    expect(response.status).toBe(401);
  });
});

describe('GET /api/v1/users endpoint', () => {
  it('should return a list of users without the password field', async () => {
    // Arrange: Log in as an admin and get a signed cookie
    const signedCookie = await loginAndReturnCookie(testAdminCredentials);

    // Act: Get a list of users using the authenticated cookie
    const response = await request(app)
      .get('/api/v1/users')
      .set('Cookie', [signedCookie]);

    // Assert: Check the response status and the list of users
    expect(response.status).toBe(200);
    expect(response.body.users).toBeInstanceOf(Array);
    expect(Array.isArray(response.body.users)).toBe(true);

    // Check that each user in the list doesn't have a password field
    response.body.users.forEach((user) => {
      expect(user).toHaveProperty('name');
      expect(user).toHaveProperty('email');
      expect(user).toHaveProperty('role');
      expect(user).not.toHaveProperty('password');
    });
  });

  it('should return a 401 status if the user is not authenticated', async () => {
    // Act: Attempt to get a list of users without authentication
    const response = await request(app).get('/api/v1/users');

    expect(response.status).toBe(401);
  });

  it('should return a 403 status if the user is not an admin', async () => {
    // Arrange: Log in as a regular user and get a signed cookie
    const signedCookie = await loginAndReturnCookie(testUserCredentials);
    // Act: Attempt to get a list of users using the authenticated cookie
    const response = await request(app)
      .get('/api/v1/users')
      .set('Cookie', [signedCookie]);
    // Assert: Check the response status for 403
    expect(response.status).toBe(403);
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
    const signedCookieAdmin = await loginAndReturnCookie(testAdminCredentials);

    const response = await request(app)
      .delete(`/api/v1/users/${testUser.id}`) // Assuming testUser is the user you want to delete
      .set('Cookie', [signedCookieAdmin]);

    // Assert: Check the response status for success
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty(
      'message',
      'User deleted successfully'
    );
  });

  it('should return an error if the user does not exist', async () => {
    // Arrange: Log in and get a signed cookie with valid test user credentials
    const signedCookieAdmin = await loginAndReturnCookie(testAdminCredentials);

    // Act: Attempt to delete a non-existent user
    const response = await request(app)
      .delete('/api/v1/users/nonexistentUserId')
      .set('Cookie', [signedCookieAdmin]);

    // Assert: Check the response status for an error
    expect(response.status).toBe(404);
  });

  it('should return an error if not authenticated', async () => {
    // Act: Attempt to delete a user without authentication
    const response = await request(app).delete(`/api/v1/users/${testUser.id}`);

    // Assert: Check the response status for an error
    expect(response.status).toBe(401);
  });
});
