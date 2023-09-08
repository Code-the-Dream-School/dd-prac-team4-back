document.addEventListener('DOMContentLoaded', function () {
    const socket = io();
    
    socket.on("connect", function () {
      console.log("CONNECTED: ", this); // should log the socket object
      
      this.emit("join:user_notifications", "64d44c0e337399ccf9ad7e52")
      // subscribe to orders:cancelled messages
      this.on("orders:cancelled", (response) => {
        console.log(response)
      })
    });
  });