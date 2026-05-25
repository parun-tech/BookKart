// ============================================================================
// BOOKKART ORDER SCHEMA MODEL
// ============================================================================
// This file defines the Mongoose database schema blueprint for an "Order" entity.
// It tracks purchasing activity, maps users to purchased items, records Stripe
// transaction IDs, and charts order fulfillment states ('pending', 'completed', 'failed').

const mongoose = require('mongoose'); // Imports the Mongoose ODM library for schema generation

// Order Schema Blueprint: Defines structures, database references, and validation controls for cart checkouts.
const OrderSchema = new mongoose.Schema({
  // 1. Reference to the customer who placed this order
  user: {
    type: mongoose.Schema.Types.ObjectId, // Connects directly to the User collection Object ID
    ref: 'User', // Establishes relationships with the User collection model
    required: true // Enforces field presence
  },
  
  // 2. An array of cart items included in this checkout session
  items: [
    {
      // A. Reference to the purchased book
      book: {
        type: mongoose.Schema.Types.ObjectId, // Connects directly to the Book collection Object ID
        ref: 'Book', // Establishes relationships with the Book collection model
        required: true // Enforces field presence
      },
      // B. Quantity purchased of this specific book
      quantity: {
        type: Number,
        required: true, // Enforces field presence
        default: 1 // Default quantity purchased is 1
      },
      // C. Price of the book at the exact time of order placement
      price: {
        type: Number,
        required: true // Enforces field presence
      }
    }
  ],
  
  // 3. Overall cumulative total cost of the order (in Indian Rupees ₹)
  totalAmount: {
    type: Number,
    required: true // Enforces field presence
  },
  
  // 4. Secure checkout session ID issued by Stripe (used to audit/verify payments)
  stripeSessionId: {
    type: String,
    required: true // Enforces field presence
  },
  
  // 5. Active state tracking representing the payment lifecycle phase
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'], // Strict constraint: value must match one of these three states
    default: 'pending' // Defaults orders to 'pending' state during initialization
  },
  
  // 6. Time of purchase checkout creation
  createdAt: {
    type: Date,
    default: Date.now // Automatically logs current timestamp during database write
  }
});

// Compile and export the Order Mongoose Model, registering it to 'orders' collection
module.exports = mongoose.model('Order', OrderSchema);
