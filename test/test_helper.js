const request = require('supertest');
const { app } = require('../src/expressServer.js');

const loginAsAdmin = async (credentials) => {
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

module.exports = {
  loginAsAdmin,
};
