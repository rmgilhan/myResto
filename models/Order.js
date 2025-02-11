// Import the mongoose library
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OrderSchema = new mongoose.Schema({
    customer: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' }, // Reference to User
    orderItems: [{  
        menuItem: { 
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
            default: 0
        }
    }],
    totalAmount: { 
        type: Number, 
        required: true 
    }, // Total amount of the order
    payment: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Payment',
        default : '[]' 
    }, // Optional Payment reference
    status: { 
        type: String, 
        enum: ['Pending', 'Preparing', 'Completed', 'Cancelled'], 
        default: 'Pending' 
    } // Order status
}, { timestamps: true });

const Order = mongoose.model("Order", OrderSchema);

// Pre-save middleware for calculating totalAmount
orderSchema.pre('save', function (next) {
    this.totalAmount = this.orderItems.reduce((total, item) => total + item.price, 0);
    next();
});

// Create the Order model from the schema
const Order = mongoose.model('Order', orderSchema);

// Export the Order model
module.exports = Order;

