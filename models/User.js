const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    firstName: {
        type: String,
        required: [true, 'First name is required']
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        index: true
    },
    password: {
        type: String,
        required: [true, 'Password is required']
    },
    mobileNo: {
        type: String,
        required: [true, 'Mobile number is required'],
        unique: true,
        index: true
    },
    roles: {
        type: [String],
        enum: ['Admin', 'Customer', 'Usher', 'Cook', 'Manager', 'Encoder', 'Order-staff'],
        default: ['Customer']
    },
    empPosition: {
        type: String,
        enum: ['Usher', 'Cook', 'Manager', 'Encoder', 'Order-staff'],
        default: null,
        validate: {
            validator: function (value) {
                // empPosition can only be set if the user is not a customer
                return !value || this.roles.includes('Admin') || this.roles.some(role => role !== 'Customer');
            },
            message: 'Employee position can only be assigned to non-customers'
        }
    }
}, {
    timestamps: true // Adds createdAt and updatedAt fields
});

// Pre-save middleware for hashing passwords
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Create the User model
const User = mongoose.model('User', userSchema);

module.exports = User;

