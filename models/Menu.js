const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Import MenuItem model
const MenuItem = require('./MenuItem');

const menuSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    items: [{
        type: Schema.Types.ObjectId,
        ref: 'MenuItem'
    }]
});

const Menu = mongoose.model('Menu', menuSchema);
module.exports = Menu;
