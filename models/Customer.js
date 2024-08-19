const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Order = require('./Order');

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

const customerSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    orders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    }],
    reservations: [reservationSchema]
});

const Customer = mongoose.model('Customer', customerSchema);
module.exports = Customer;
