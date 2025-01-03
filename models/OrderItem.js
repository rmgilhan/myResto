const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the OrderItem schema
const orderItemSchema = new Schema({
    menuItemId: {
        type: Schema.Types.ObjectId,
        required: [true, 'Menu Item ID is required'],
        ref: 'MenuItem'
    },
    quantity: {
        type: Number,
        required: [true, 'Quantity is required'],
        min: [1, 'Quantity must be at least 1']
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price must be non-negative']
    },
    total: {
        type: Number,
        required: true,
        min: [0, 'Total must be non-negative'],
        default: function () {
            return this.quantity * this.price; // Calculate total dynamically
        }
    }
}, {
    timestamps: true // Automatically add createdAt and updatedAt
});

// Create the OrderItem model
const OrderItem = mongoose.model('OrderItem', orderItemSchema);

// Export the OrderItem model
module.exports = OrderItem;
