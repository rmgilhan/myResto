const mongoose = require('mongoose');
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
        unique: true
    },
    password : {
		type : String,
		required: [true, 'Password is required']
	},
    mobileNo: {
        type: String,
        required: [true, 'Mobile number is required'],
		unique: true
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
   },
   empPosition:{
        type: String,
        enum: ['Usher','Cook','Manager','Encoder','Order-staff'],
        default: 'Usher'
   }
});

const User = mongoose.model('User', userSchema);
module.exports = User;
