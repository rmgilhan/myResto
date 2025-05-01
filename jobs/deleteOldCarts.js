const cron = require('node-cron');
const Cart = require('../models/Cart'); // Adjust path

cron.schedule('0 * * * *', async () => { // Runs every hour
  try {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago

    const result = await Cart.deleteMany({ updatedAt: { $lte: cutoff } });
    console.log(`${result.deletedCount} old carts deleted.`);
  } catch (err) {
    console.error('Error deleting old carts:', err.message);
  }
});
