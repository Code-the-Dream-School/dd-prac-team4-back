const { testPing } = require('./testHandlers');
const { handleUserNotificationsJoin } = require('./notificationHandlers');
const ChatMessage = require('../models/ChatMessage');
const { handleAlbumChat } = require('./handleAlbumChat');
const User = require('../models/User');

const onConnect = (io, socket) => {
  console.log('a user connected');

  /* Add event handlers below */
  socket.on('test:ping', testPing);

  socket.on('join:user_notifications', (userId) => {
    handleUserNotificationsJoin(io, socket, userId);
    console.log(`User joined notifications room for user: ${userId}`);
  });

  socket.on('join:album_chat', (albumId) => {
    const chatRoomName = `chat:album:${albumId}`;
    console.log(
      `received message from socket: ${socket.id}. Will join room: ${chatRoomName}`
    );
    socket.join(chatRoomName);
    //console.log(`User joined album chat room for album: ${albumId}`);
  });

  // Event handler for 'chat:album' that performs the following actions:
  // - Creates a new message and saves it to the database
  // - Checks the message count and deletes old messages if it exceeds 50
  // - Broadcasts the message to all connected users in the album chat room
  // - Calls the handleAlbumChat function for additional message processing in the album chat room
  socket.on('chat:album', async (data) => {
    try {
      if (!data.userId || !data.message || !data.albumId) {
        console.error('Invalid data format:', data);
        return;
      }
      await ChatMessage.create(data);
      console.log('Chat message saved:', data);
      const messagesCount = await ChatMessage.countDocuments({
        albumId: data.albumId,
      });
      if (messagesCount > 50) {
        await ChatMessage.findOneAndDelete(
          { albumId: data.albumId },
          { sort: { timestamp: 1 } }
        );
      }

      // user name
      const user = await User.findById(data.userId);
      if (!user) {
        console.error('User not found:', data.userId);
        return;
      }
      data.userName = user.name;

      io.to(`chat:album:${data.albumId}`).emit('chat:album', data);

      handleAlbumChat(io, socket, data);
    } catch (error) {
      console.error('Error saving chat message:', error);
    }
  });

  /* End event handlers */

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
};

module.exports = onConnect;
