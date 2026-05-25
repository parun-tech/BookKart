/**
 * ============================================================================
 * 🚀 BOOKKART CORE BACKEND MAIN SERVER ENGINE
 * ============================================================================
 * This file serves as the main entry point and bootloader for the Express API.
 * It coordinates database connections, global security middleware, request loggers,
 * mounts API routes, and establishes the active server port listener.
 */

// 1. ENVIRONMENT CONFIGURATION loader (imports variables from server/.env)
require('dotenv').config();

// 2. EXPRESS FRAMEWORK Core (used to build our REST API endpoints)
const express = require('express');

// 3. CORS (Cross-Origin Resource Sharing) middleware (allows React client on Port 5173 to speak to API on Port 5000)
const cors = require('cors');

// 4. MORGAN Logger (outputs clean HTTP request audits in the terminal terminal, e.g. GET /api/books 200)
const morgan = require('morgan');

// 5. DATABASE Connection setup (imports custom mongoose cloud cluster bootloader)
const connectDB = require('./config/db');

// 6. GLOBAL ERROR HANDLING middleware (intercepts and formats database validation errors into clean JSON)
const errorHandler = require('./middleware/errorHandler');

// 7. ROUTE CONTROLLER Maps (imports logical REST routes for Auth, Books catalog, and Stripe checkout)
const authRoutes = require('./routes/auth');
const bookRoutes = require('./routes/books');
const cartRoutes = require('./routes/cart');

// 8. EXPRESS APPLICATION Initialization
const app = express();

/**
 * ============================================================================
 * 🛠️ GLOBAL MIDDLEWARE MOUNTING
 * ============================================================================
 */

// A. JSON BODY PARSER: Automatically parses incoming JSON request bodies, putting it into `req.body`
app.use(express.json());

// B. CROSS-ORIGIN ACCESS: Enables CORS to bypass cross-origin browser blocking
app.use(cors());

// C. DEV REQUEST LOGGER: Activates dev-style Morgan logger only when NOT running in production mode
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

/**
 * ============================================================================
 * 🛣️ API ROUTING CONTROLLER REGISTRATION
 * ============================================================================
 */

// A. USER AUTHENTICATION Portal (Register, Login, Admin Login, Profile checks)
app.use('/api/auth', authRoutes);

// B. BOOKSTORE CATALOG Manager (Public listing, user library, and Admin CRUD updates)
app.use('/api/books', bookRoutes);

// C. STRIPE SHOPPING CART Gateway (Checkout Session creation and payment receipt audits)
app.use('/api/cart', cartRoutes);

/**
 * ============================================================================
 * 🏥 HEALTH CHECKS & ERROR CAPTURES
 * ============================================================================
 */

// A. Health check endpoint (used to instantly verify server status in browser/Postman)
app.get('/api/status', (req, res) => {
  res.json({ status: 'running', message: 'BookKart MERN Stack API is fully operational' });
});

// B. Centralized error interceptor (catches database validation failures, must be registered LAST)
app.use(errorHandler);

/**
 * ============================================================================
 * 🚀 SYSTEM STARTUP COMMAND
 * ============================================================================
 */

// Fetch server port from environment configuration, defaulting to Port 5000 if not found
const PORT = process.env.PORT || 5000;

// Bootstrap database connection first, then start active Express HTTP port listener
const startServer = async () => {
  try {
    // 1. Establish MongoDB Atlas Cloud connection
    await connectDB();
    
    // 2. Start Express listener
    app.listen(PORT, () => {
      console.log(`🚀 BookKart Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
  } catch (error) {
    // 3. Catch and print fatal system boot crashes
    console.error(`Fatal Server Boot Error: ${error.message}`);
    process.exit(1);
  }
};

// Start system execution!
startServer();
