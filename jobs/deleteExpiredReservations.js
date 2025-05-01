const cron = require('node-cron');
const Reservation = require('../models/Reservation'); // Adjust path

cron.schedule('30 * * * *', async () => { // Runs at 30 mins past every hour
  try {
    const now = new Date();

    const result = await Reservation.deleteMany({
      reservationDate: { $lt: now },
      status: { $ne: 'Completed' } // Optional: preserve completed ones
    });

    console.log(`${result.deletedCount} expired reservations removed.`);
  } catch (err) {
    console.error('Error deleting expired reservations:', err.message);
  }
});
