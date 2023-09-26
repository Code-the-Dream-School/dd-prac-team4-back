const { testPing } = require('./testHandlers');
const { handleUserNotificationsJoin } = require('./notificationHandlers');
const { handleAlbumChat } = require('./handleAlbumChat');

const onConnect = (io, socket) => {
  console.log('a user connected');

  /* Add event handlers below */
  socket.on('test:ping', testPing); // <-- this is creating a socket that listens for messages sent for the "test:ping" event and then calls the testPing function

  socket.on('join:user_notifications', (userId) => {
    handleUserNotificationsJoin(io, socket, userId);
  });

  socket.on('join:album_chat', (albumId) => {
    const chatRoomName = `chat:album:${albumId}`;
    socket.join(chatRoomName);
  });

  socket.on('chat:album', (data) => {
    handleAlbumChat(io, socket, data);
  });
  /* End event handlers */

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
};

module.exports = onConnect;
