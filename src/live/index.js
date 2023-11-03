const { testPing } = require('./testHandlers');
const { handleUserNotificationsJoin } = require('./notificationHandlers');
const { handleAlbumChat } = require('./handleAlbumChat');
//const albumController = require('../controllers/albumController');

const onConnect = (io, socket) => {
  console.log('a user connected');

  /* Add event handlers below */
  socket.on('test:ping', testPing);

  socket.on('join:user_notifications', (user) => {
    handleUserNotificationsJoin(io, socket, user);
    console.log(`User joined notifications room for user: ${user}`);
  });

  socket.on('join:album_chat', (albumId) => {
    const chatRoomName = `chat:album:${albumId}`;
    console.log(
      `received message from socket: ${socket.id}. Will join room: ${chatRoomName}`
    );
    socket.join(chatRoomName);
    //console.log(`User joined album chat room for album: ${albumId}`);
  });

  socket.on('chat:album', async (data) => {
    handleAlbumChat(io, socket, data);
  });

  // Handle "listening-to-album-play" event
  socket.on('listening-to-album-play', (data) => {
    const { albumId, userId } = data;
    const albumRoom = `album_listening:${albumId}`;
    socket.join(albumRoom);
    socket.to(albumRoom).emit('play', {
      user: userId,
      album: albumId,
      message: 'User started playing the album',
    });
  });

  // Handle "listening-to-album-pause" event
  socket.on('listening-to-album-pause', (data) => {
    const { albumId, userId } = data;
    const albumRoom = `album_listening:${albumId}`;
    socket.join(albumRoom);
    socket.to(albumRoom).emit('pause', {
      user: userId,
      album: albumId,
      message: 'User paused the album',
    });
  });

  socket.on('listening-to-album-play', () => {
    // albumId should be added as a parameter   socket.on('listening-to-album-play', (albumId) => {
    //   albumController.startAlbumPlayback(albumId);
    console.log('Album is now playing');
  });

  socket.on('listening-to-album-pause', () => {
    io.emit('album-paused', 'Album is now paused');
    console.log('Album is now paused');
  });

  socket.on('user-leaving-page', () => {
    io.emit('user-left', 'User has left the page');
    console.log('User has left the page');
  });
  /* End event handlers */

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
};

module.exports = onConnect;
