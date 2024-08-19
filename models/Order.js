// Import the mongoose library
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Import the Payment model (assuming it's in a file called Payment.js)
const Payment = require('./Payment');  // Adjust the path as necessary

// Define the OrderItem schema
const orderItemSchema = new Schema({
    menuItemId: {
        type: Schema.Types.ObjectId,
        required: [true, 'Menu ID is required']
    },
    name: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    }
});

// Define the Order schema
const orderSchema = new Schema({
    restaurantId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    orderDate: {
        type: Date,
        required: true
    },
    totalAmount: {
        type: Number,
        required: true
    },
    items: [orderItemSchema],
    payment: {
        type: Schema.Types.ObjectId,
        ref: 'Payment',
        required: true
    }
});

// Create the Order model from the schema
const Order = mongoose.model('Order', orderSchema);

// Export the Order model
module.exports = Order;
