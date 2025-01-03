const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Address = require('./Address'); // Import the Address model

const employeeSchema = new Schema({
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true
    },
    position: {
        type: String,
        required: [true, 'Position is required'],
        enum: ['Usher', 'Cook', 'Manager', 'Encoder', 'Order-Staff'], // Restrict to specific roles
        trim: true
    },
    address: {
        type: Schema.Types.ObjectId,
        ref: 'Address',
        required: true
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        unique: true,
        match: [/^\d{10,15}$/, 'Phone number must be 10-15 digits']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
    },
    restaurant: {
        type: Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: true
    },
    hireDate: {
        type: Date,
        default: Date.now
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true // Automatically adds createdAt and updatedAt fields
});

// Create indexes for email and phone to ensure uniqueness and speed up queries
employeeSchema.index({ email: 1 }, { unique: true });
employeeSchema.index({ phone: 1 }, { unique: true });

const Employee = mongoose.model('Employee', employeeSchema);
module.exports = Employee;
