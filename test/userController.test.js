const { app, connectDB } = require('../src/expressServer.js');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require("supertest");
const User = require('../src/models/User');
const { creatJWT } = require('../src/utils/jwt');
const createTokenUser = require('../src/utils/createTokenUser'); 

// Define the generateAuthToken function
const generateAuthToken = (user) => {
  // Replace this with your actual logic to generate an auth token
  const token = "your_generated_token_here";
  return token;
};

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
      // Create a fake user for testing
      const fakeUser = {
        _id: 'fakeUserId',
        name: 'John Doe',
        role: 'user',
      };
  
      // Create payload object using createTokenUser
      const payload = createTokenUser(fakeUser);
  
      // Call creatJWT with payload
      const token = creatJWT({ payload });

    });
  });