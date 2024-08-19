const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const paymentSchema = new Schema({
    paymentDate: {
        type: Date,
        required: true
    },
    paymentAmount: {
        type: Number,
        required: true
    },
    paymentMethod: {
        type: String,
        required: true
    }
});

const Payment = mongoose.model('Payment', paymentSchema);
module.exports = Payment;
