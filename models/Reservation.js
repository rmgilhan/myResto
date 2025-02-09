const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reservationSchema = new Schema({
    restaurant: {
        type: Schema.Types.ObjectId,
        ref: 'Restaurant', // Reference to Restaurant
        required: true
    },
    customer: {
        type: Schema.Types.ObjectId,
        ref: 'Customer', // Reference to Customer
        required: true
    },
    reservationDate: {
        type: Date,
        required: true,
        validate: {
            validator: function (value) {
                return value >= new Date();
            },
            message: 'Reservation date must be in the future'
        }
    },
    numberOfGuests: {
        type: Number,
        required: true,
        min: [1, 'There must be at least one guest']
    },
    status: {
        type: String,
        enum: ['Pending', 'Confirmed', 'Cancelled'], // Reservation status
        default: 'Pending'
    },
    specialRequests: {
        type: [String], // Allow multiple requests
        default: []
    }
}, { timestamps: true });

const Reservation = mongoose.model('Reservation', reservationSchema);
module.exports = Reservation;
