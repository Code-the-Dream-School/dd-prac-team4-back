/* global, location, io, Toastify */

document.addEventListener('DOMContentLoaded', function () {
  const socket = io();
  const queryParams = new URLSearchParams(window.location.search);
  const userId = queryParams.get('userId');
  console.log('userId:', userId);

  socket.on('connect', function () {
    console.log('CONNECTED: ', this); // should log the socket object

    // send a message to the socket server to tell it to add us to a room for `userId` notifications
    this.emit('join:user_notifications', userId);

    // subscribe to orders:cancelled messages
    this.on('orders:cancelled', (response) => {
      // you can expand on this by using actual html elements with classes instead of just a boring text node :'D
      document.body.appendChild(document.createTextNode(response));
      // Display the message using Toastify
      Toastify({
        text: response,
        duration: 3000, // Duration in milliseconds
        newWindow: true,
        close: true,
        gravity: 'top', // Toast position
        position: 'right', // Toast position
        stopOnFocus: true, // Prevents dismissing of toast on hover
        style: {
          background: 'linear-gradient(to right, #9c27b0, #3f51b5)',
        },
      }).showToast();
    });
  });
});
