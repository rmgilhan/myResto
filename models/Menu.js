const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Import MenuItem model
const MenuItem = require('./MenuItem');

const menuSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Menu name is required'],
        trim: true,
        minlength: [3, 'Menu name must be at least 3 characters long']
    },
    description: {
        type: String,
        required: [true, 'Menu description is required'],
        trim: true
    },
    items: [{
        type: Schema.Types.ObjectId,
        ref: 'MenuItem',
        validate: [arrayLimit, 'A menu must have at least one item']
    }],
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true // Automatically add createdAt and updatedAt fields
});

// Validator function to ensure the items array is not empty
function arrayLimit(val) {
    return val.length > 0;
}

// Create the Menu model
const Menu = mongoose.model('Menu', menuSchema);

module.exports = Menu;
