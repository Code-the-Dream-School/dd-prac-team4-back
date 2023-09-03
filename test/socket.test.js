const { app } = require('../src/expressServer');
const io = require('socket.io-client');

let server;
const PORT = 8001;

beforeAll(async () => {
  server = await app.listen(PORT);
});

afterAll(async () => {
  server.close();
});

test('test:echo socket event', (done) => {
  jest.setTimeout(30000);
  const client = io.connect(`http://localhost:${PORT}`, {
    transports: ['websocket'],
    forceNew: true,
    reconnection: false,
  });

  const messageToSend = 'Hello, server!';

  client.once('connect', () => {
    client.emit('test:echo', messageToSend);

    client.on('test:echo', (response) => {
      expect(response).toBe(messageToSend);

      client.disconnect();
      done();
    });
  });
}, 60000);
