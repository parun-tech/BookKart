// ============================================================================
// 🏥 BOOKKART CENTRALIZED EXPRESS ERROR INTERCEPTOR MIDDLEWARE
// ============================================================================
// This file handles global error catching for the entire Express REST API.
// It intercepts database errors (duplicate entries, bad IDs, field validation issues),
// translates them into user-friendly plain-English sentences, and returns a uniform JSON API response.

// errorHandler: Express error-handling middleware that intercepts thrown errors in all routers.
// Intercepts Mongoose database validation anomalies and outputs formatted error payloads.
const errorHandler = (err, req, res, next) => {
  // 1. Copy error properties into a local mutable object
  let error = { ...err };
  error.message = err.message;

  // 2. Audit log to terminal console for developer reference in vscode
  console.error('Captured Backend Crash:', err);

  // A. MONGOOSE BAD OBJECTID (CastError): Triggered when someone queries a book ID that does not exist or has bad syntax
  if (err.name === 'CastError') {
    const message = `Database lookup failure: Resource not found with ID of ${err.value}`;
    error = new Error(message);
    res.status(404); // Set HTTP response status to 404 Not Found
  }

  // B. MONGOOSE DUPLICATE KEY (ErrorCode 11000): Triggered when someone registers a username or email that already exists in MongoDB
  if (err.code === 11000) {
    const message = 'Authentication conflict: An account already exists with that username or email address.';
    error = new Error(message);
    res.status(400); // Set HTTP response status to 400 Bad Request
  }

  // C. MONGOOSE VALIDATION FAILURES (ValidationError): Triggered when a database write fails schema rules (e.g. password too short, empty title)
  if (err.name === 'ValidationError') {
    // Map over Mongoose validator errors array and join them into a clean comma-separated string list
    const message = Object.values(err.errors).map(val => val.message);
    error = new Error(message.join(', '));
    res.status(400); // Set HTTP response status to 400 Bad Request
  }

  // 3. Fallback: If no custom HTTP status was set by routes or mongoose overrides, default to 500 Internal Server Error
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  // 4. Send uniform standardized JSON error response back to React client
  res.status(statusCode).json({
    success: false,
    message: error.message || 'Internal Server API Error'
  });
};

// Export central error handler middleware (mounted in server.js)
module.exports = errorHandler;
