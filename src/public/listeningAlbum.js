import io from 'socket.io-client';

document.addEventListener('DOMContentLoaded', function () {
  const socket = io();

  document.getElementById('playButton').addEventListener('click', () => {
    socket.emit('listening-to-album-play');
  });

  document.getElementById('pauseButton').addEventListener('click', () => {
    socket.emit('listening-to-album-pause');
  });

  window.addEventListener('beforeunload', () => {
    socket.emit('user-leaving-page');
  });
});
