const { sendChatMessage } = require('./chatHandlers');

const setupSocket = (io, socket) => {
  console.log('Socket connected:', socket.id);

  socket.on('sendChatMessage', ({ message }) => {
    sendChatMessage(io, socket, message);
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
  });
};

module.exports = setupSocket;
