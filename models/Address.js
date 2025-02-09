const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const addressSchema = new Schema({
  street: {
    type: String,
    required: [true, 'Street is required'],
    trim: true
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true
  },
  stateOrProvince: {
    type: String,
    required: [true, 'State or Province is required'],
    trim: true
  },
  postalCode: {
    type: String,
    required: [true, 'Postal Code is required'],
    match: [/^\d{4,6}$/, 'Postal Code must be between 4 and 6 digits']
  },
  country: {
    type: String,
    required: [true, 'Country is required'],
    default: 'USA'
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt fields
});

// Add index for city and postalCode
addressSchema.index({ city: 1, postalCode: 1 });

const Address = mongoose.model('Address', addressSchema);
module.exports = Address;
