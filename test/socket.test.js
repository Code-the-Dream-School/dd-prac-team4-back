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

test('test:ping socket event', (done) => {
  jest.setTimeout(30000);
  const senderClient = io.connect(`http://localhost:${PORT}`, {
    transports: ['websocket'],
    forceNew: true,
    reconnection: false,
  });

  const recipientClient = io.connect(`http://localhost:${PORT}`, {
    transports: ['websocket'],
    forceNew: true,
    reconnection: false,
  });

  const messageToSend = 'Hello, server!';

  senderClient.once('connect', () => {
    senderClient.emit('test:ping', messageToSend);
  });

  recipientClient.once('connect', () => {
    recipientClient.on('test:ping', (response) => {
      expect(response).toBe(`user sent: ${messageToSend}`);

      senderClient.disconnect();
      recipientClient.disconnect();

      // Small timeout before calling "done()" to give time for the disconnect event to fire
      setTimeout(() => done(), 1000);
    });
  });
}, 60000);