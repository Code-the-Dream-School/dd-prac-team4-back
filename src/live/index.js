const { testPing } = require('./testHandlers');
const { handleUserNotificationsJoin } = require('./notificationHandlers');
const onConnect = (io, socket) => {
  console.log('a user connected');

  /* Add event handlers below */
  socket.on('test:ping', testPing); // <-- this is creating a socket that listens for messages sent for the "test:ping" event and then calls the testPing function
  
  socket.on('join:user_notifications', (userId) => {
    handleUserNotificationsJoin(io, socket, userId);
  });

  /* End event handlers */

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
};

module.exports = onConnect;
