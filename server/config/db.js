// ============================================================================
// BOOKKART DATABASE CONNECTIVITY CONTROLLER (Mongoose Gateway)
// ============================================================================
// This file configures the connection between our Node/Express REST API and
// the MongoDB cloud database cluster via Mongoose ORM. It performs sanity checks
// on environment variables and shuts down execution on invalid connections.

const mongoose = require('mongoose'); // Imports the Mongoose ODM library for MongoDB interaction

// connectDB: Connects the Express server to the MongoDB database instance using the MONGODB_URI environment string.
// Exits the process with failure code 1 if connection fails or connection URI is missing.
const connectDB = async () => {
  try {
    // 1. Retrieve the cloud database connection string from environment configurations
    const connStr = process.env.MONGODB_URI;
    
    // 2. Validate connection string presence to prevent connection crash loops
    if (!connStr) {
      console.error('❌ MONGODB_URI is not defined in the environment variables!');
      console.log('💡 Please configure MONGODB_URI in your server/.env file.');
      process.exit(1); // Exits the Node application with failure code 1
    }
    
    // 3. Perform active database handshake via Mongoose
    const conn = await mongoose.connect(connStr);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    // 4. Capture and log connection errors, then terminate the boot sequence
    console.error(`❌ MongoDB connection error: ${error.message}`);
    process.exit(1); // Exits the Node application with failure code 1
  }
};

// Exports the connectDB connector function to be invoked during main server.js bootstrap sequence
module.exports = connectDB;
