const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
   isAdmin: {
        type: Boolean,
        required: true,
        default: false
   },
   isCustomer: {
        type: Boolean,
        required: true,
        default: true
   }
});

const User = mongoose.model('User', userSchema);
module.exports = User;
