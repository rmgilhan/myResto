// Import the mongoose library
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new mongoose.Schema({
    customer: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' }, // Reference to User
    orderItems: [{  
        menuItemId: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'MenuItem', 
            required: true 
        }, // Reference to MenuItem
        quantity: { 
            type: Number, 
            required: true, 
            min: 1 
        }, // Quantity of the item
        price: { 
            type: Number, 
            required: true 
        }, // Price at time of order (in case it changes later)
        total: {
            type: Number,
            required: true
        }
    }],
    totalAmount: { 
        type: Number, 
        default: 0 
    }, // Total amount of the order
    payment: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Payment',
        default : null
    }, // Optional Payment reference
    status: { 
        type: String, 
        enum: ['Pending', 'Preparing', 'Completed', 'Cancelled'], 
        default: 'Pending' 
    }, // Order status
    isArchive : {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// Pre-save middleware for calculating totalAmount
orderSchema.pre('save', function (next) {
    this.totalAmount = this.orderItems.reduce((total, item) => total + item.price, 0);
    next();
});

// Create the Order model from the schema
const Order = mongoose.model('Order', orderSchema);

// Export the Order model
module.exports = Order;

