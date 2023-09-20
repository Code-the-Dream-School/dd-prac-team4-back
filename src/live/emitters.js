function sendOrderCancelledEvent(userData) {
  console.log('userData: ', userData);

  const userId = userData._id.toString();
  const numOrders = userData.orders.length;
  const orderNoun = numOrders === 1 ? 'order' : 'orders';
  console.log('Sending orders:cancelled event');
  global.io
    .to(userId)
    .emit(
      'orders:cancelled',
      `${numOrders} of your ${orderNoun} have been cancelled.`
    );
}

module.exports = { sendOrderCancelledEvent };
