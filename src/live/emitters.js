function sendOrderCancelledEvent(io, payload) {
  io.to(payload.userId).emit('orders:cancelled', payload.message);
}

module.exports = { sendOrderCancelledEvent };
