// Import the mongoose library
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Import the Payment model (assuming it's in a file called Payment.js)
const Restaurant = require('./Restaurant');
const MenuItem = require('./MenuItem');
const User = require('./User');

// Define the Order schema
const orderSchema = new Schema({
    restaurantId: [{
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Restaurant'
    }],
    orderOn: {
        type: Date,
        default: Date.now
    },
    customerId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },    
    MenusOrdered: [{
        menuId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'MenuItem',
        },
        quantity: {
            type: Number,
            required: [true,'Quantity is required']
        },
        subTotal: {
            type: Number,
            required: [true, 'Sub Total is required']
        }
    }],
    totalAmount: {
        type: Number,
        required: [true, 'Total Price is required']
    },
    orderType: {
        type: String,
        enum: ['Dine-In', 'Take-Out', 'Delivery'],
        default: 'Dine-In'
    },
    payment: {
        type: String,
        enum: ['Pending(Waiting for payment)', 'Completed'],
        default: 'Pending(Waiting for payment)'
    } 
    
});

// Create the Order model from the schema
const Order = mongoose.model('Order', orderSchema);

// Export the Order model
module.exports = Order;
