const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const menuSchema = new Schema({
    restaurant: {
        type: Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: true
    },
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
    return Array.isArray(val) && val.length > 0;
}

menuSchema.pre('deleteOne', { document: true }, async function(next) {
    try {
        // Delete all MenuItems that belong to this Menu
        await mongoose.model('MenuItem').deleteMany({ menu: this._id });
        next();
    } catch (error) {
        next(error);
    }
});

// Optional: Add an index for better performance when filtering active menus
menuSchema.index({ isActive: 1 });

// Create the Menu model
const Menu = mongoose.model('Menu', menuSchema);

module.exports = Menu;
