const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  products: [{
    productId: String,
    name: String,
    price: Number,
    quantity: Number,
    size: String,
    color: String,
    image: String
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  shippingAddress: {
    firstName: String,
    lastName: String,
    address: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  paymentInfo: {
    paymentId: String,
    paymentMethod: {
      type: String,
      default: 'Stripe'
    },
    paymentStatus: {
      type: String,
      default: 'completed'
    }
  },
  orderStatus: {
    type: String,
    default: 'processing',
    enum: ['processing', 'shipped', 'delivered']
  },
  orderDate: {
    type: Date,
    default: Date.now
  }
});

const Purchase = mongoose.model('Purchase', purchaseSchema);

module.exports = Purchase;
