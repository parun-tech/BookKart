// ============================================================================
// 🛡️ BOOKKART PROTECTED ROUTE WRAPPER (Navigation Security Guard)
// ============================================================================
// This component acts as a route authorization guard for the React client.
// It intercepts viewport requests to secure layouts, evaluates Authentication states,
// shows a glowing glassmorphic loading spinner while tokens sync, and redirects
// unauthorized guests or customers away from private or administrator consoles.

import React, { useContext } from 'react'; // Imports React hooks
import { Navigate } from 'react-router-dom'; // Imports React Router redirection utilities
import { AuthContext } from '../context/AuthContext'; // Imports global Authentication Context to read user roles

// ProtectedRoute: Evaluates access conditions and redirects guest/customer accounts accordingly.
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading, isAdmin } = useContext(AuthContext); // Retrieve active authentication state flags

  // 1. Show glowing custom loading panel if initial startup token verification is running
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: 'var(--bg-deep)',
        color: 'var(--text-secondary)',
        fontSize: '1.2rem',
        fontWeight: '500'
      }}>
        {/* Glowing glass spinner wrapper */}
        <div style={{
          border: '4px solid rgba(255, 255, 255, 0.1)',
          borderTop: '4px solid var(--primary)',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          animation: 'spin 1s linear infinite',
          marginBottom: '1rem'
        }}></div>
        
        {/* Dynamic stylesheet block containing spinner animation */}
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
        <span>Loading...</span>
      </div>
    );
  }

  // 2. Reject unauthenticated guest users immediately, redirecting them to standard/admin login forms
  if (!user) {
    return <Navigate to={adminOnly ? "/admin/login" : "/login"} replace />;
  }

  // 3. Reject standard customer accounts attempting to access administrator dashboards
  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  // 4. Verification success! Access approved. Render child view layout
  return children;
};

// Export Route Guard component as default
export default ProtectedRoute;
//
