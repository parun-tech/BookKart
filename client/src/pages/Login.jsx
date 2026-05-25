// ============================================================================
// BOOKKART UNIFIED AUTHENTICATION PORTAL (Login Page)
// ============================================================================
// This page consolidates separate Customer and Administrator logins into a single,
// high-quality tab-switching experience. It handles credentials collection,
// switches stylesheets dynamically (Admin console glows purple, user glows blue),
// triggers authentication queries in the Auth Context, shows responsive loading states,
// and directs users to their designated storefront or admin dashboard on success.

import React, { useState, useContext } from 'react'; // Imports React hooks
import { Link, useNavigate } from 'react-router-dom'; // Imports routing navigation utilities
import { AuthContext } from '../context/AuthContext'; // Imports global Authentication Context to submit logins

// Login: Handles unified logins for customers and admin consoles.
const Login = () => {
  const { login, adminLogin } = useContext(AuthContext); // Loads login functions from Auth Context
  const navigate = useNavigate(); // Navigation redirect hook

  // 1. Tab state: 'user' or 'admin' determining form fields and theme variables
  const [activeTab, setActiveTab] = useState('user');
  
  // 2. Initial form inputs local state
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false); // Controls button loading text and disable statuses
  const [errorMsg, setErrorMsg] = useState(null); // Captures authorization errors from the server

  // Destructure state variables
  const { email, password } = formData;

  // handleChange: Syncs changes typed in individual inputs into local state.
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // handleTabChange: Cleans input fields, clears warnings, and toggles active role.
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setErrorMsg(null);
    setFormData({ email: '', password: '' });
  };

  // handleSubmit: Routes submit queries to login() vs adminLogin() depending on active tab status.
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null); // Clear previous errors

    // A. Enforce non-empty credentials validation check
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setLoading(true); // Trigger button spinner loading statuses
    try {
      if (activeTab === 'admin') {
        // Submit administrator authorization handshake
        await adminLogin(email, password);
        
        // Admin success! Navigate to the management console dashboard
        navigate('/admin/dashboard');
      } else {
        // Submit standard customer authorization handshake
        await login(email, password);
        
        // Customer success! Navigate to the bookstore explore listings
        navigate('/');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Invalid credentials. Please verify your email and password.');
    } finally {
      setLoading(false); // Restore button interactions
    }
  };

  return (
    <div className="auth-container flex-center login-page-unified">
      
      {/* THEMED GLASS PANEL: switches border outlines based on active tab roles */}
      <div className={`auth-card glass-panel ${activeTab === 'admin' ? 'admin-theme' : 'user-theme'}`}>
        
        {/* TAB TOGGLES: Switches login views cleanly without page loading shifts */}
        <div className="auth-tabs">
          <button
            onClick={() => handleTabChange('user')}
            className={`auth-tab-btn ${activeTab === 'user' ? 'active-user-tab' : ''}`}
          >
            👤 Customer Sign In
          </button>
          <button
            onClick={() => handleTabChange('admin')}
            className={`auth-tab-btn ${activeTab === 'admin' ? 'active-admin-tab' : ''}`}
          >
            🛡️ Admin Console
          </button>
        </div>

        {/* HEADER BLOCK: Contextual titles and descriptive text */}
        <div className="auth-header">
          <span className="auth-icon">{activeTab === 'admin' ? '🛡️' : '🔐'}</span>
          <h2 className="auth-title">
            {activeTab === 'admin' ? 'Admin Authentication' : 'Welcome Back'}
          </h2>
          <p className="auth-subtitle">
            {activeTab === 'admin' 
              ? 'Authorized dashboard entry. Secure system logs will be audited.' 
              : 'Sign in to your customer account to access your permanent library vault.'}
          </p>
        </div>

        {/* Dynamic Warning Dialog */}
        {errorMsg && (
          <div className={`auth-error-alert ${activeTab === 'admin' ? 'admin-error' : ''}`}>
            <span>⚠️ {errorMsg}</span>
          </div>
        )}

        {/* Unified Login Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          
          {/* Email input field */}
          <div className="form-group-field">
            <label className="form-label-field">
              {activeTab === 'admin' ? 'Admin Email Address' : 'Email Address'}
            </label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={handleChange}
              placeholder={activeTab === 'admin' ? 'admin@bookkart.com' : 'customer@domain.com'}
              required
              className={`form-input-field ${activeTab === 'admin' ? 'admin-input' : ''}`}
            />
          </div>

          {/* Password input field */}
          <div className="form-group-field">
            <label className="form-label-field">Password</label>
            <input
              type="password"
              name="password"
              value={password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              className={`form-input-field ${activeTab === 'admin' ? 'admin-input' : ''}`}
            />
          </div>

          {/* Submit Trigger: Changes layout styling to matching themes */}
          <button 
            type="submit" 
            disabled={loading} 
            className={`glow-btn auth-submit-btn ${activeTab === 'admin' ? 'admin-submit-btn' : ''}`}
          >
            {loading 
              ? (activeTab === 'admin' ? 'Decrypting Access Keys...' : 'Authenticating User...') 
              : (activeTab === 'admin' ? '🔑 Unlock Admin Console' : 'Sign In')}
          </button>
        </form>

        {/* Footnotes navigation and default database demo credentials hints */}
        <div className="auth-footer-nav">
          {activeTab === 'user' ? (
            <p>
              Don't have an account? <Link to="/register" className="auth-nav-link">Create Account</Link>
            </p>
          ) : (
            <div className="admin-demo-tip">
              💡 Demo credentials prefilled in DB seeder:<br/>
              <b>Email:</b> <span style={{ color: '#c084fc' }}>admin@bookkart.com</span><br/>
              <b>Password:</b> <span style={{ color: '#c084fc' }}>admin123</span>
            </div>
          )}
        </div>
      </div>

      {/* Stylesheet Enclosure */}
      <style>{`
        .login-page-unified {
          min-height: 80vh;
          padding: 20px;
          transition: background 0.5s ease;
        }

        .auth-card {
          width: 100%;
          max-width: 450px;
          padding: 40px;
          position: relative;
          overflow: hidden;
          animation: scaleUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        /* Admin console color theme shift overrides */
        .auth-card.admin-theme {
          border-color: rgba(168, 85, 247, 0.3);
          box-shadow: 0 10px 40px rgba(168, 85, 247, 0.2);
          background: rgba(18, 10, 32, 0.85);
        }

        /* Tabs layout styling */
        .auth-tabs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          border-bottom: 1px solid var(--border-glass);
          margin-bottom: 30px;
          margin-top: -15px;
        }

        .auth-tab-btn {
          padding: 12px 6px;
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-secondary);
          cursor: pointer;
          transition: var(--transition-fast);
          border-bottom: 2px solid transparent;
          text-align: center;
        }

        .auth-tab-btn:hover {
          color: var(--text-primary);
        }

        .active-user-tab {
          color: var(--primary) !important;
          border-bottom-color: var(--primary);
        }

        .active-admin-tab {
          color: var(--secondary) !important;
          border-bottom-color: var(--secondary);
        }

        .auth-header {
          text-align: center;
          margin-bottom: 25px;
        }

        .auth-icon {
          font-size: 2.5rem;
          display: block;
          margin-bottom: 8px;
          animation: float 4s ease-in-out infinite;
        }

        .auth-title {
          font-size: 1.8rem;
          font-weight: 800;
          margin-bottom: 6px;
        }

        .auth-subtitle {
          font-size: 0.82rem;
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

        .auth-error-alert.admin-error {
          background: rgba(239, 68, 68, 0.15);
          border-color: rgba(239, 68, 68, 0.4);
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-group-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-label-field {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .form-input-field {
          padding: 12px 16px;
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

        .admin-input:focus {
          border-color: var(--secondary) !important;
          box-shadow: 0 0 8px var(--secondary-glow) !important;
        }

        .auth-submit-btn {
          width: 100%;
          padding: 12px;
          font-size: 0.95rem;
          margin-top: 10px;
        }

        .admin-submit-btn {
          background: linear-gradient(135deg, var(--secondary), #ec4899) !important;
          box-shadow: 0 4px 15px var(--secondary-glow) !important;
        }

        .admin-submit-btn:hover {
          box-shadow: 0 6px 20px rgba(236, 72, 153, 0.5) !important;
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

        .admin-demo-tip {
          font-size: 0.78rem;
          border-top: 1px dashed var(--border-glass);
          padding-top: 15px;
          line-height: 1.6;
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
};

// Export Login page component as default
export default Login;
