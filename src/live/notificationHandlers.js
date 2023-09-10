const handleUserNotificationsJoin = (io, socket, userId) => {
  console.log('User joined room for notifications:', userId);
  socket.join(userId);
};

module.exports = { handleUserNotificationsJoin };
