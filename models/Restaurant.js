const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Import Menu and Employee models
const Menu = require('./Menu');
const Employee = require('./Employee');
const Address = require('./Address');

const restaurantSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    address: {
        type: Schema.Types.ObjectId,
        ref: 'Address',
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    menus: [{
        type: Schema.Types.ObjectId,
        ref: 'Menu'
    }],
    employees: [{
        type: Schema.Types.ObjectId,
        ref: 'Employee'
    }]
});

const Restaurant = mongoose.model('Restaurant', restaurantSchema);
module.exports = Restaurant;
