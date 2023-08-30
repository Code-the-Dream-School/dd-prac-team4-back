// You *must* define it with a regular `function` rather than an const + arrow function
// That way `this` will refer to the socket object that is calling this event
function testPing(payload) {
  console.log('Received: ', payload);
  return this.broadcast.emit('test:ping', `user sent: ${payload}`);
}
