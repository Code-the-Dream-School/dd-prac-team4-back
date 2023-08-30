const { testPing } = require('./testHandlers');
const onConnect = (io, socket) => {
  console.log('a user connected');

  /* Add event handlers below */
  socket.on('test:ping', testPing); // <-- this is creating a socket that listens for messages sent for the "test:ping" event and then calls the testPing function
  /* End event handlers */

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
};

module.exports = onConnect;
