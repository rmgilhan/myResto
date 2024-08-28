const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Import Menu and Employee models
const Menu = require('./Menu');
const Employee = require('./Employee');

const restaurantSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    location: {
        type: String,
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
