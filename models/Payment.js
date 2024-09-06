const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Order = require('./Order');

const paymentSchema = new Schema({
    orderId : {
        type: Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    paymentDate: {
        type: Date,
        default: Date.now
    },
    paymentAmount: {
        type: Number,
        required: true
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: ['Credit Card', 'Cash', 'PayPal', 'Bank Transfer'],  // Example payment methods
        default: 'Cash'
    }
});

const Payment = mongoose.model('Payment', paymentSchema);
module.exports = Payment;
