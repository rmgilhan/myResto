const cron = require('node-cron');
const Order = require('../models/Order'); // Adjust path as needed

// Run every day at midnight
cron.schedule('0 0 * * *', async () => {
  console.log('🔁 Archiving eligible orders...');

  const now = new Date();

  try {
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    const ordersToArchive = await Order.find({
      isArchive: false,
      $or: [
        { status: 'Completed', completedAt: { $lte: twoDaysAgo } },
        { status: 'Cancelled', cancelledAt: { $lte: twoDaysAgo } }
      ]
    });

    for (const order of ordersToArchive) {
      order.isArchive = true;
      await order.save();
      console.log(`Archived order ${order._id}`);
    }

    if (ordersToArchive.length === 0) {
      console.log('ℹ️ No orders to archive today.');
    }
  } catch (err) {
    console.error('Error archiving orders:', err.message);
  }
});
