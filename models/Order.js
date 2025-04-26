// Import the mongoose library
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new mongoose.Schema({
    customer: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' }, // Reference to User
    orderItems: [{  
        menuItemId: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'MenuItem', 
            required: true 
        }, // Reference to MenuItem
        quantity: { 
            type: Number, 
            required: true, 
            min: 1 
        }, // Quantity of the item
        price: { 
            type: Number, 
            required: true 
        }, // Price at time of order (in case it changes later)
        total: {
            type: Number,
            required: true
        }
    }],
    totalAmount: { 
        type: Number, 
        default: 0 
    }, // Total amount of the order
    payment: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Payment',
        default : null
    }, // Optional Payment reference
    status: { 
        type: String, 
        enum: ['Pending', 'Preparing', 'Completed', 'Cancelled'], 
        default: 'Pending' 
    }, // Order status
    isArchive: {
        type: Boolean,
        default: false
    },
    completedAt: {
        type: Date,
        default: null
    },
    cancelledAt: {
        type: Date,
        default: null
    }
}, { timestamps: true });

// Pre-save middleware for calculating totalAmount
orderSchema.pre('save', function (next) {
  // Calculate totalAmount
  this.totalAmount = this.orderItems.reduce((total, item) => total + item.total, 0);

  // If status is changing to Completed or Cancelled, set timestamp
  if (this.isModified('status')) {
    if (this.status === 'Completed' && !this.completedAt) {
      this.completedAt = new Date();
    }
    if (this.status === 'Cancelled' && !this.cancelledAt) {
      this.cancelledAt = new Date();
    }
  }

  next();
});


orderSchema.post('save', function (doc, next) {
  const now = new Date();

  if (!doc.isArchive && (doc.status === 'Completed' || doc.status === 'Cancelled')) {
    const baseDate = doc.status === 'Completed' ? doc.completedAt : doc.cancelledAt;

    if (baseDate) {
      const twoDaysLater = new Date(baseDate);
      twoDaysLater.setDate(twoDaysLater.getDate() + 2);

      if (now >= twoDaysLater) {
        doc.isArchive = true;
        doc.save().then(() => next()).catch(next);
        return;
      }
    }
  }

  next();
});


// Create the Order model from the schema
const Order = mongoose.model('Order', orderSchema);

// Export the Order model
module.exports = Order;

