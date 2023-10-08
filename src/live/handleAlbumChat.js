const ChatMessage = require('../models/ChatMessage');

async function handleAlbumChat(io, socket, data) {
  try {
    const { albumId } = data;

    // Create a chat room name for the album chat
    const chatRoomName = `chat:album:${albumId}`;

    const msg = await ChatMessage.create({ ...data, user: data.user });
    await msg.populate('user', 'name');
    console.log('Chat message saved:', data);

    // Check and delete old messages if needed
    const messagesCount = await ChatMessage.countDocuments({ albumId });
    if (messagesCount > 50) {
      await ChatMessage.findOneAndDelete(
        { albumId },
        { sort: { timestamp: 1 } }
      );
    }

    // Broadcast the message to all connected users in the album chat room
    io.to(chatRoomName).emit('chat:album', data);
  } catch (error) {
    console.error('Error handling chat message:', error);
  }
}

module.exports = { handleAlbumChat };
