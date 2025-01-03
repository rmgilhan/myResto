const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reservationSchema = new Schema({
    restaurantId: {
        type: Schema.Types.ObjectId,
        ref: 'Restaurant', // Ensures reference to the Restaurant model
        required: [true, 'Restaurant ID is required']
    },
    reservationDate: {
        type: Date,
        required: [true, 'Reservation date is required'],
        validate: {
            validator: function (value) {
                // Ensure reservation is not in the past
                return value >= new Date();
            },
            message: 'Reservation date must be in the future'
        }
    },
    numberOfGuests: {
        type: Number,
        required: [true, 'Number of guests is required'],
        min: [1, 'There must be at least one guest']
    },
    customerName: {
        type: String,
        required: [true, 'Customer name is required']
    },
    customerContact: {
        type: String,
        required: [true, 'Customer contact information is required'],
        validate: {
            validator: function (value) {
                // Simple regex for phone number validation
                return /^[0-9]{10,15}$/.test(value);
            },
            message: 'Invalid contact number format'
        }
    },
    specialRequests: {
        type: String,
        default: ''
    }
}, {
    timestamps: true // Automatically adds createdAt and updatedAt fields
});

// Create the Reservation model
const Reservation = mongoose.model('Reservation', reservationSchema);

module.exports = Reservation;
