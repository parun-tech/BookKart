// ============================================================================
// BOOKKART USER SCHEMA MODEL
// ============================================================================
// This file defines the Mongoose database schema blueprint for a "User" entity.
// It manages login accounts, registers passwords using cryptographical hashing (Bcrypt),
// validates security credentials, defines account authority roles ('user', 'admin'),
// and stores persistent lists of successfully purchased books.

const mongoose = require('mongoose'); // Imports the Mongoose ODM library for schema generation
const bcrypt = require('bcryptjs'); // Imports cryptographic library to securely hash passwords

// User Schema Blueprint: Establishes fields, validation formats, hook triggers, and matching methods.
const UserSchema = new mongoose.Schema({
  // 1. Unique handle/alias chosen by the customer
  username: {
    type: String,
    required: [true, 'Please add a username'], // Enforces field presence with descriptive warning
    unique: true, // Prevents duplicate usernames inside MongoDB collection indices
    trim: true // Sanitizes input: trims spaces
  },
  
  // 2. Primary communication email address (used for logging in)
  email: {
    type: String,
    required: [true, 'Please add an email'], // Enforces field presence with descriptive warning
    unique: true, // Prevents duplicate emails inside MongoDB collection indices
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, // Standard email validation regex filter
      'Please add a valid email' // Warning thrown if input fails regex match test
    ]
  },
  
  // 3. Securely hashed authorization password string
  password: {
    type: String,
    required: [true, 'Please add a password'], // Enforces field presence
    minlength: 6, // Prevents short passwords (must carry 6 or more characters)
    select: false // Strict database defense: omits password from query results by default
  },
  
  // 4. Role authority level determining route navigation access permissions
  role: {
    type: String,
    enum: ['user', 'admin'], // Constraints: value must strictly match 'user' or 'admin'
    default: 'user' // Default status level for newly registered customers
  },
  
  // 5. Array of Book ObjectIds indicating volumes successfully purchased by the user
  purchasedBooks: [
    {
      type: mongoose.Schema.Types.ObjectId, // Connects directly to the Book collection Object ID
      ref: 'Book' // Establishes relations with the Book collection model
    }
  ],
  
  // 6. Time of user registration
  createdAt: {
    type: Date,
    default: Date.now // Automatically logs current timestamp during database write
  }
});

// Pre-Save Middleware Encryption Hook: Intercepts saving processes to automatically generate 
// a cryptographic salt and hash the plain-text password using Bcrypt. Only triggers if password is modified.
UserSchema.pre('save', async function (next) {
  // A. Skip encryption calculations if password has not been altered
  if (!this.isModified('password')) {
    next();
  }
  
  // B. Generate secure cryptographic Salt factor of 10
  const salt = await bcrypt.genSalt(10);
  
  // C. Re-assign user password to secure Bcrypt hash string
  this.password = await bcrypt.hash(this.password, salt);
});

// matchPassword: Decrypts and compares entered login password inputs against database hash value.
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Compile and export the User Mongoose Model, registering it to 'users' collection
module.exports = mongoose.model('User', UserSchema);
