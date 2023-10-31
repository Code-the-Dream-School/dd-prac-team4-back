import io from 'socket.io-client';

document.addEventListener('DOMContentLoaded', function () {
  const socket = io();

  document.getElementById('playButton').addEventListener('click', () => {
    const albumId = 'yourAlbumId';
    const userId = 'yourUserId';
    socket.emit('listening-to-album-play', { albumId, userId });
  });

  document.getElementById('pauseButton').addEventListener('click', () => {
    const albumId = 'yourAlbumId';
    const userId = 'yourUserId';
    socket.emit('listening-to-album-pause', { albumId, userId });
  });

  window.addEventListener('beforeunload', () => {
    socket.emit('user-leaving-page');
  });
});
