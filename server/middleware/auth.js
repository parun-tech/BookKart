// ============================================================================
// 🛡️ BOOKKART AUTHENTICATION & ROLE GATEKEEPER MIDDLEWARE
// ============================================================================
// This file secures private API routes. It inspects HTTP request headers for
// jsonwebtoken (JWT) signatures, verifies their cryptographical validity, and
// evaluates role authority rules (such as blocking standard users from admin portals).

const jwt = require('jsonwebtoken'); // Imports JSON Web Token SDK to decrypt authorization signatures
const User = require('../models/User'); // Imports the User mongoose model to look up account details

// protect: Middleware that ensures the incoming request is from a logged-in user with a valid JWT token.
// Extends the Express `req` object by appending the database User document to `req.user`.
const protect = async (req, res, next) => {
  let token;

  // 1. Check if the Authorization header is present AND follows the Bearer spec: "Bearer <JWT_TOKEN>"
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // 2. Extract token from header value: splits string by space " " and takes index 1
    token = req.headers.authorization.split(' ')[1];
  }

  // 3. Reject access immediately if no token was found in the Authorization headers
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Not authorized to access this route. Authentication token is missing.' 
    });
  }

  try {
    // 4. Decrypt and verify token signature using the secret JWT keys stored in server/.env
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_for_dev');

    // 5. Query MongoDB Atlas to find the User matching the decoded token account ID
    req.user = await User.findById(decoded.id);
    
    // 6. Reject access if the database account has been deleted since the token was issued
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Account not found with this token.' 
      });
    }

    // 7. Success! Access approved. Hand over execution control to the next route controller function
    next();
  } catch (err) {
    console.error('JWT Token Verification Failure:', err.message);
    // 8. Reject access if the token is tampered, expired, invalid, or forged
    return res.status(401).json({ 
      success: false, 
      message: 'Not authorized to access this route. Session token has expired or is invalid.' 
    });
  }
};

// authorize: Middleware that restricts route access to specific roles (like 'admin').
// Must be registered AFTER the `protect` middleware is executed so `req.user` is loaded.
const authorize = (...roles) => {
  return (req, res, next) => {
    // 1. Safeguard check: ensure protect middleware has ran and req.user exists
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authorization failed. User profile is unloaded.' 
      });
    }
    
    // 2. Reject request with 403 Forbidden if the user's role is not inside the allowed roles array
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access Denied! User role '${req.user.role}' does not carry administrative authorization privileges.`
      });
    }
    
    // 3. Success! Role matched. Hand over execution control to the next route controller function
    next();
  };
};

// Export middleware safety guards to secure bookstore catalog and cart routers
module.exports = { protect, authorize };
