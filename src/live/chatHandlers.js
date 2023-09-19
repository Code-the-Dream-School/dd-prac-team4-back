const sendChatMessage = (io, socket, message) => {
  console.log(`Received chat message: ${message}`);

  io.emit('chatMessage', message);
};

module.exports = { sendChatMessage };
