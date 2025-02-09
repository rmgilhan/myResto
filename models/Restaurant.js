const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the Restaurant schema
const restaurantSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Restaurant name is required']
    },
    address: {
        type: Schema.Types.ObjectId,
        ref: 'Address',
        required: [true, 'Address is required']
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        validate: {
            validator: function (value) {
                // Simple phone number regex
                return /^[0-9]{10,15}$/.test(value);
            },
            message: 'Invalid phone number format'
        }
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        validate: {
            validator: function (value) {
                // Simple email regex
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            },
            message: 'Invalid email format'
        },
        unique: true,
        index: true
    }
}, {
    timestamps: true // Automatically add createdAt and updatedAt fields
});

// Pre-remove hook to handle cascade deletions
restaurantSchema.pre('remove', async function (next) {
    try {
        // Remove associated menus and employees
        await Address.findByIdAndDelete(this.address);
        await mongoose.model('Menu').deleteMany({ restaurant: this._id });
        await mongoose.model('User').deleteMany({ restaurant: this._id });
        next();
    } catch (error) {
        next(error);
    }
});

// Pre-save hook to prevent multiple restaurants
restaurantSchema.pre('save', async function (next) {
  const existingRestaurant = await mongoose.model('Restaurant').countDocuments();
  if (existingRestaurant > 0) {
    return next(new Error('Only one restaurant can exist.'));
  }
  next();
});

// Create the Restaurant model
const Restaurant = mongoose.model('Restaurant', restaurantSchema);

module.exports = Restaurant;
