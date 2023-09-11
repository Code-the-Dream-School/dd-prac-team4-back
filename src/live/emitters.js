const { io } = require("../expressServer");

function sendOrderCancelledEvent(ordersToUpdate) {
  console.log("ordersToUpdate: ", ordersToUpdate);
  
  for (const userData of ordersToUpdate) {
    const userId = userData._id.toString();
    const numOrders = userData.orders.length;
    const orderNoun = numOrders === 1 ? 'order' : 'orders';
    
    io.to(userId).emit('orders:cancelled', `${numOrders} of your ${orderNoun} have been cancelled.`);
  }
}

module.exports = { sendOrderCancelledEvent };