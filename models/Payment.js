const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const paymentSchema = new Schema({
    order: {
        type: Schema.Types.ObjectId,
        ref: 'Order',
        required: [true, 'Order ID is required'],
        index: true // Optimizes queries by orderId
    },
    amount: {
        type: Number,
        required: [true, 'Payment amount is required'],
        min: [0, 'Payment amount must be positive']
    },
    method : {
        type: String,
        required: [true, 'Payment method is required'],
        enum: ['Credit Card', 'Cash', 'PayPal', 'GCash'], // Expand methods as needed
        default: 'Cash'
    },
    transactionId: {
        type: String,
        default: null, // Optional field for external payment system tracking
        sparse: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Completed', 'Failed'],
        default: 'Pending'
    }
}, {
    timestamps: true // Adds createdAt and updatedAt fields
});

// Create the Payment model
const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;
