// ============================================================================
// ⚛️ BOOKKART CUSTOMER REGISTRATION PAGE
// ============================================================================
// This page provides a customer registration form. It performs initial client-side
// credential safety validation checks, intercepts autofills using safe autocomplete
// overrides, communicates with the Auth context APIs, handles loading states,
// renders errors, and redirects customers directly to catalog listings on success.

import React, { useState, useContext } from 'react'; // Imports React hooks
import { Link, useNavigate } from 'react-router-dom'; // Imports routing utilities
import { AuthContext } from '../context/AuthContext'; // Imports global Authentication Context to submit registrations

// Register: Handles customer sign ups.
const Register = () => {
  const { register } = useContext(AuthContext); // Loads register context trigger
  const navigate = useNavigate(); // Navigation redirect hook

  // 1. Initial local credentials form variables state
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false); // Controls submission loading spinner buttons
  const [errorMsg, setErrorMsg] = useState(null); // Captures validation or database unique key errors

  // Destructure form inputs
  const { username, email, password, confirmPassword } = formData;

  // handleChange: Syncs changes typed in individual input blocks into form local state.
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // handleSubmit: Validates passwords alignment and pings the register APIs in AuthContext.
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null); // Reset previous errors

    // A. Client validation: Enforce empty fields check
    if (!username || !email || !password || !confirmPassword) {
      setErrorMsg('Please populate all input fields.');
      return;
    }

    // B. Client validation: Enforce secure password lengths
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters in length.');
      return;
    }

    // C. Client validation: Enforce password matching
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please verify.');
      return;
    }

    setLoading(true); // Disable buttons and trigger loading spinner status
    try {
      // Execute registration query
      await register(username, email, password);
      
      // Success! Redirect to home catalog listings
      navigate('/');
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Registration failed. That username or email might already be taken.');
    } finally {
      setLoading(false); // Restore normal button states
    }
  };

  return (
    <div className="auth-container flex-center">
      
      {/* GLOWING REGISTER PANEL CARD */}
      <div className="auth-card glass-panel">
        
        {/* Header Branding */}
        <div className="auth-header">
          <span className="auth-icon">🚀</span>
          <h2 className="auth-title">Create Account</h2>
          <p className="auth-subtitle">Join us to start curating your dream digital library collection.</p>
        </div>

        {/* Dynamic Warning Dialog */}
        {errorMsg && (
          <div className="auth-error-alert">
            <span>⚠️ {errorMsg}</span>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          
          {/* Username Field */}
          <div className="form-group-field">
            <label className="form-label-field">Choose Username</label>
            <input
              type="text"
              name="username"
              value={username}
              onChange={handleChange}
              placeholder="e.g. bookworm99"
              required
              autoComplete="off" // Blocks browser autocomplete dropdowns
              className="form-input-field"
            />
          </div>

          {/* Email Address Field */}
          <div className="form-group-field">
            <label className="form-label-field">Email Address</label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={handleChange}
              placeholder="example@domain.com"
              required
              autoComplete="off" // Blocks browser autocomplete dropdowns
              className="form-input-field"
            />
          </div>

          {/* Password Field */}
          <div className="form-group-field">
            <label className="form-label-field">Password</label>
            <input
              type="password"
              name="password"
              value={password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              autoComplete="new-password" // Prevents password managers from autoselecting credentials
              className="form-input-field"
            />
          </div>

          {/* Confirm Password Field */}
          <div className="form-group-field">
            <label className="form-label-field">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              required
              autoComplete="new-password" // Prevents password managers from autoselecting credentials
              className="form-input-field"
            />
          </div>

          {/* Submit Trigger */}
          <button type="submit" disabled={loading} className="glow-btn auth-submit-btn">
            {loading ? 'Registering Account...' : 'Register'}
          </button>
        </form>

        {/* Redirect Footer */}
        <div className="auth-footer-nav">
          <p>
            Already have an account? <Link to="/login" className="auth-nav-link">Sign In</Link>
          </p>
        </div>
      </div>

      {/* Stylesheet Enclosure */}
      <style>{`
        .auth-container {
          min-height: 90vh;
          padding: 20px;
        }

        .auth-card {
          width: 100%;
          max-width: 450px;
          padding: 40px;
          animation: scaleUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .auth-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .auth-icon {
          font-size: 2.5rem;
          display: block;
          margin-bottom: 10px;
          animation: float 4s ease-in-out infinite;
        }

        .auth-title {
          font-size: 1.8rem;
          font-weight: 800;
          margin-bottom: 6px;
        }

        .auth-subtitle {
          font-size: 0.85rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        .auth-error-alert {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: var(--accent-red);
          padding: 12px 16px;
          border-radius: 10px;
          font-size: 0.85rem;
          margin-bottom: 20px;
          font-weight: 500;
          display: flex;
          align-items: center;
          animation: fadeIn 0.2s ease-out;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .form-group-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-label-field {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .form-input-field {
          padding: 11px 14px;
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid var(--border-glass);
          border-radius: 10px;
          font-size: 0.95rem;
          color: var(--text-primary);
          outline: none;
          transition: var(--transition-fast);
          width: 100%;
        }

        .form-input-field:focus {
          border-color: var(--primary);
          background: rgba(0, 0, 0, 0.3);
          box-shadow: 0 0 8px var(--primary-glow);
        }

        .auth-submit-btn {
          width: 100%;
          padding: 12px;
          font-size: 0.95rem;
          margin-top: 10px;
        }

        .auth-footer-nav {
          text-align: center;
          margin-top: 24px;
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        .auth-nav-link {
          color: var(--primary);
          font-weight: 600;
        }

        .auth-nav-link:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

// Export Register page as default
export default Register;
