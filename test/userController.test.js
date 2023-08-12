const { app, connectDB } = require('../src/expressServer.js');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require("supertest");
const User = require('../src/models/User');

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

describe('/api/v1/users/:user_id endpoint', () => {
  it('returns a valid user without the password field if found', async () => {
    // Arrange
    const user = await User.create({
      name: "Akosua",
      email: "akos@example.com",
      password: "hashed"
    });

    // Act
    const response = await request(app).get(`/api/v1/users/${user.id}`);

    // Assert
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      user: {
        name: "Akosua",
        email: "akos@example.com",
        role: "user"
      }
    });
    expect(response.body.user).not.toHaveProperty("password");
  });

  it('returns a 404 status if user id is not found', async () => {
    // Act
    const response = await request(app).get('/api/v1/users/nonexistentUserId');

    // Assert
    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({
      msg: 'No user with id: nonexistentUserId'
    });
  });
});