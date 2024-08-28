const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Restaurant = require('./Restaurant');

const reservationSchema = new Schema({
    restaurantId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'Restaurant ID is required']
    },
    reservationDate: {
        type: Date,
        required: true
    },
    numberOfGuests: {
        type: Number,
        required: true
    }
});
const Reservation = mongoose.model('Reservation', restaurantSchema);
module.exports = Reservation;
