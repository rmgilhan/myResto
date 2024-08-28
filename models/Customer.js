const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Order = require('./Order');
const Reservation = require('./Reservation');

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
    reservations: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Reservation'
    }]
});

const Customer = mongoose.model('Customer', customerSchema);
module.exports = Customer;
