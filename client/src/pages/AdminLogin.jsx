// ============================================================================
// ⚛️ BOOKKART STANDALONE ADMINISTRATOR LOGIN PAGE (Legacy Gate)
// ============================================================================
// This page serves as a standalone gate for administrator login (legacy/fallback).
// It authenticates credentials with Auth context APIs and redirects authorized
// administrators directly to the management console dashboard.

import React, { useState, useContext } from 'react'; // Imports React hooks
import { Link, useNavigate } from 'react-router-dom'; // Imports routing navigation links
import { AuthContext } from '../context/AuthContext'; // Imports global Authentication Context to submit admin logins

// AdminLogin: Handles legacy administrator credentials authentication.
const AdminLogin = () => {
  const { adminLogin } = useContext(AuthContext); // Loads adminLogin function from Auth Context
  const navigate = useNavigate(); // Navigation redirect hook

  // 1. Initial local credentials form variables state
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false); // Controls button loading spinner statuses
  const [errorMsg, setErrorMsg] = useState(null); // Captures validation or unauthorized credentials errors

  const { email, password } = formData;

  // handleChange: Syncs changes typed in individual input blocks into form local state.
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // handleSubmit: Submits credentials to adminLogin() query in AuthContext.
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null); // Reset previous errors

    // A. Enforce non-empty inputs validation check
    if (!email || !password) {
      setErrorMsg('Please supply admin credentials.');
      return;
    }

    setLoading(true); // Trigger loading status
    try {
      await adminLogin(email, password);
      
      // Success! Redirect to management console dashboard console
      navigate('/admin/dashboard');
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Access denied. Invalid credentials or insufficient permissions.');
    } finally {
      setLoading(false); // Restore buttons
    }
  };

  return (
    <div className="auth-container flex-center admin-page-body">
      
      {/* ADMINISTRATOR ACCESS CARD */}
      <div className="auth-card glass-panel admin-card">
        
        {/* Header Block */}
        <div className="auth-header">
          <span className="auth-icon">🛡️</span>
          <h2 className="auth-title">Admin Console</h2>
          <p className="auth-subtitle" style={{ color: '#c084fc' }}>
            Authorized Personnel Only. Please authenticate with administrator access tokens.
          </p>
        </div>

        {/* Warning Alert */}
        {errorMsg && (
          <div className="auth-error-alert admin-error">
            <span>⚠️ {errorMsg}</span>
          </div>
        )}

        {/* Standalone Login Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          
          {/* Admin Email Input */}
          <div className="form-group-field">
            <label className="form-label-field" style={{ color: '#c084fc' }}>Admin Email</label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={handleChange}
              placeholder="admin@bookkart.com"
              required
              className="form-input-field admin-input"
            />
          </div>

          {/* Password Input */}
          <div className="form-group-field">
            <label className="form-label-field" style={{ color: '#c084fc' }}>Secret Code / Password</label>
            <input
              type="password"
              name="password"
              value={password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              className="form-input-field admin-input"
            />
          </div>

          {/* Submit Action */}
          <button 
            type="submit" 
            disabled={loading} 
            className="glow-btn auth-submit-btn admin-submit-btn"
          >
            {loading ? 'Decrypting Access Keys...' : '🔑 Authenticate Admin Console'}
          </button>
        </form>

        {/* Back-to-shop Footer */}
        <div className="auth-footer-nav">
          <Link to="/" className="back-to-shop-link">
            ◀ Exit to Public Bookstore
          </Link>
        </div>
      </div>

      {/* Stylesheet Enclosure */}
      <style>{`
        .admin-page-body {
          background-image: 
            radial-gradient(at 10% 20%, rgba(168, 85, 247, 0.2) 0px, transparent 50%),
            radial-gradient(at 90% 80%, rgba(239, 68, 68, 0.1) 0px, transparent 50%);
        }

        .admin-card {
          border-color: rgba(168, 85, 247, 0.3);
          box-shadow: 0 10px 40px rgba(168, 85, 247, 0.2);
          background: rgba(18, 10, 32, 0.8);
        }

        .admin-error {
          background: rgba(239, 68, 68, 0.15);
          border-color: rgba(239, 68, 68, 0.4);
        }

        .admin-input:focus {
          border-color: var(--secondary) !important;
          box-shadow: 0 0 8px var(--secondary-glow) !important;
        }

        .admin-submit-btn {
          background: linear-gradient(135deg, var(--secondary), #ec4899) !important;
          box-shadow: 0 4px 15px var(--secondary-glow) !important;
        }

        .admin-submit-btn:hover {
          box-shadow: 0 6px 20px rgba(236, 72, 153, 0.5) !important;
        }

        .back-to-shop-link {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-secondary);
          transition: var(--transition-fast);
        }

        .back-to-shop-link:hover {
          color: var(--text-primary);
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

// Export AdminLogin legacy component as default
export default AdminLogin;
