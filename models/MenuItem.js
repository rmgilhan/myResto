const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const menuItemSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Menu item name is required'],
        trim: true,
        minlength: [3, 'Menu item name must be at least 3 characters long']
    },
    description: {
        type: String,
        trim: true,
        default: ''
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price must be a non-negative value']
    },
    category: {
        type: String,
        enum: ['Appetizer', 'Main Course', 'Dessert', 'Beverage'], // Expand as needed
        required: true
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    image: {
        type: String,
        trim: true,
        default: '' // Can store URL or relative path
    }
}, {
    timestamps: true // Automatically adds createdAt and updatedAt fields
});

// Create the MenuItem model
const MenuItem = mongoose.model('MenuItem', menuItemSchema);

module.exports = MenuItem;
