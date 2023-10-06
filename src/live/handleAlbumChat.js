function handleAlbumChat(io, socket, data) {
  const { message, userId, albumId } = data;

  // Create a chat room name for the album chat
  const chatRoomName = `chat:album:${albumId}`;

  // Send the message to the room
  socket.to(chatRoomName).emit('chat:album', { message, userId, albumId });
}

module.exports = { handleAlbumChat };
