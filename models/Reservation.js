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
        ref: 'User', // Reference to Customer
        required: true
    },
    reservationDateAndTime: { 
        type: Date, 
        required: true 
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
    approvedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true //Default is the Customer during Pending
    },
    remarks: {
        type: String,
        default : 'reserve me not'
    },
    specialRequests: {
        type: String, // Allow multiple requests
        default: ''
    }
}, { timestamps: true });

const Reservation = mongoose.model('Reservation', reservationSchema);
module.exports = Reservation;
