// ============================================================================
// 🔐 BOOKKART AUTHENTICATION ROUTE CONTROLLERS
// ============================================================================
// This file registers standard HTTP endpoints for user registration, user logins,
// admin logins, and profile fetches. It generates secure cryptographical JWT
// session tokens upon successful credential verification.

const express = require('express'); // Imports the Express framework
const router = express.Router(); // Instantiates Express Router to define endpoints
const jwt = require('jsonwebtoken'); // Imports JWT library to sign secure session tokens
const User = require('../models/User'); // Imports User mongoose blueprint schema
const { protect } = require('../middleware/auth'); // Imports security protect guard middleware

// sendTokenResponse: Signs a cryptographic JWT token carrying the User ID, sets expiration to 30 days,
// and outputs a standardized response object with user metadata back to the client.
const sendTokenResponse = (user, statusCode, res) => {
  // 1. Sign JWT Token containing the database User ID in its payload
  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET || 'fallback_secret_for_dev',
    { expiresIn: '30d' }
  );

  // 2. Return 200/201 status with token and safe user profile metadata
  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      purchasedBooks: user.purchasedBooks
    }
  });
};

// POST /api/auth/register: Handles standard customer registration.
// Default role assigned is strictly set to 'user'.
router.post('/register', async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // 1. Validate if user already exists in MongoDB with the same email or username
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      res.status(400); // 400 Bad Request
      throw new Error('An account already exists with that email address or username.');
    }

    // 2. Insert new user record in MongoDB (password will be hashed by pre-save middleware)
    const user = await User.create({
      username,
      email,
      password,
      role: 'user' // Ensures new registers are always standard customers
    });

    // 3. Return session token
    sendTokenResponse(user, 201, res);
  } catch (error) {
    // 4. Pass control to central error handler middleware
    next(error);
  }
});

// POST /api/auth/login: Handles standard customer authentication.
// Checks email presence, loads encrypted password hash, and performs validation check.
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1. Enforce both credentials presence check
    if (!email || !password) {
      res.status(400);
      throw new Error('Please enter both email address and password.');
    }

    // 2. Search database for user email, explicitly requesting the hidden password hash string
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      res.status(401); // 401 Unauthorized
      throw new Error('Invalid email or password. Access denied.');
    }

    // 3. Perform cryptographic comparison to see if typed password matches hashed string
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      res.status(401); // 401 Unauthorized
      throw new Error('Invalid email or password. Access denied.');
    }

    // 4. Verification success! Generate and return session token
    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/admin-login: Handles administrator authentication.
// Performs identical audits to /login, but blocks entry if user.role !== 'admin'.
router.post('/admin-login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1. Enforce credentials presence
    if (!email || !password) {
      res.status(400);
      throw new Error('Please enter both administrator email and password.');
    }

    // 2. Query MongoDB for email and retrieve password hash
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      res.status(401);
      throw new Error('Access Denied. Invalid administrator credentials.');
    }

    // 3. Strict Authority audit: block entry if the account role is not explicitly 'admin'
    if (user.role !== 'admin') {
      res.status(403); // 403 Forbidden
      throw new Error('Access Denied. Administrator privileges are required to unlock this console.');
    }

    // 4. Cryptographic password comparison audit
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      res.status(401);
      throw new Error('Access Denied. Invalid administrator credentials.');
    }

    // 5. Verification success! Generate and return session token
    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
});

// GET /api/auth/profile: Retrieves the profile of the currently logged-in user.
// Populates the full data structures of the owned books.
router.get('/profile', protect, async (req, res, next) => {
  try {
    // Query database using the token User ID, resolving the book information references
    const user = await User.findById(req.user.id).populate('purchasedBooks');
    
    // Return standard profiles response
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        purchasedBooks: user.purchasedBooks
      }
    });
  } catch (error) {
    next(error);
  }
});

// Export auth routing controllers
module.exports = router;
