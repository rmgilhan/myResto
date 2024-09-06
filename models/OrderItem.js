const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Import the Payment model (assuming it's in a file called Payment.js)
const Payment = require('./Payment');  // Adjust the path as necessary
const MenuItem = require('./MenuItem')


// Define the OrderItem schema
const orderItemSchema = new Schema({
    menuItemId: {
        type: Schema.Types.ObjectId,
        required: [true, 'Menu ID is required'],
        ref: 'MenuItem'
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

// Create the Order model from the schema
const OrderItem = mongoose.model('OrderItem', orderSchema);

// Export the Order model
module.exports = OrderItem;
