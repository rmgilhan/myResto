// Import the mongoose library
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the Order schema
const orderSchema = new Schema({
    orderOn: {
        type: Date,
        default: Date.now
    },
    customerId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    MenusOrdered: [{
        menuId: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'MenuItem'
        },
        quantity: {
            type: Number,
            required: [true, 'Quantity is required']
        },
        subTotal: {
            type: Number,
            required: [true, 'Sub Total is required']
        }
    }],
    totalAmount: {
        type: Number,
        required: [true, 'Total Amount is required']
    },
    orderType: {
        type: String,
        enum: ['Dine-In', 'Take-Out', 'Delivery'],
        default: 'Dine-In'
    },
    status: {
        type: String,
        enum: ['Pending', 'Preparing', 'Ready', 'Completed', 'Cancelled'],
        default: 'Pending'
    },
    paymentDetails: {
        method: {
            type: String,
            enum: ['Cash', 'Card', 'Online'],
            default: 'Cash'
        },
        transactionId: {
            type: String,
            default: null
        }
    }
}, {
    timestamps: true // Automatically adds createdAt and updatedAt
});

// Pre-save middleware for calculating totalAmount
orderSchema.pre('save', function (next) {
    this.totalAmount = this.MenusOrdered.reduce((total, item) => total + item.subTotal, 0);
    next();
});

// Create the Order model from the schema
const Order = mongoose.model('Order', orderSchema);

// Export the Order model
module.exports = Order;

