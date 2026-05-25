// ============================================================================
// BOOKKART NAVIGATION HEADER COMPONENT (Global Navbar)
// ============================================================================
// This component renders the global header bar. It provides responsive routing links,
// dynamically monitors cart contents to render numeric notification bubble badges,
// displays signed-in customer names, supports quick administrative console portals,
// handles logout functions, and renders dynamic glassmorphic styles with responsive
// hamburger menu drop-downs on mobile viewports.

import React, { useContext, useState } from 'react'; // Imports React core hooks
import { Link, useNavigate, useLocation } from 'react-router-dom'; // Imports routing navigation utilities
import { AuthContext } from '../context/AuthContext'; // Imports global Authentication Context to read user metadata
import { CartContext } from '../context/CartContext'; // Imports global Cart Context to display item totals

// Navbar: Renders the central navigation header.
const Navbar = () => {
  const { user, isAdmin, logout } = useContext(AuthContext); // Loads active user states from Auth Context
  const { getCartCount } = useContext(CartContext); // Loads cumulative items quantity from Cart Context
  const navigate = useNavigate(); // Navigation hook to trigger redirects
  const location = useLocation(); // Hook to inspect active URL paths
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false); // Controls responsive mobile menu drawer visibility

  // handleLogout: Cleans up local credentials states, hides mobile menus, and redirects browser to standard Sign In forms.
  const handleLogout = () => {
    logout(); // Resets authentication states
    setMobileMenuOpen(false); // Hides responsive drawer
    navigate('/login'); // Redirects to Login page
  };

  // Helper check: Returns true if the page location route path matches
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="nav-container glass-panel">
      <div className="nav-wrapper">
        
        {/* LOGO: Toggles mobile menu closed and returns user to storefront */}
        <Link to="/" className="nav-logo" onClick={() => setMobileMenuOpen(false)}>
          <span className="logo-icon">📚</span>
          <span className="logo-text">Book<span className="text-gradient">Kart</span></span>
        </Link>

        {/* DESKTOP ROUTING LIST: Renders Explore, My Books, and Admin Dashboards based on roles */}
        <div className="nav-links">
          <Link to="/" className={`nav-item ${isActive('/') ? 'active' : ''}`}>
            Explore
          </Link>
          
          {/* Customer Library Link (Only show if authenticated AND role is NOT admin) */}
          {user && !isAdmin && (
            <Link to="/my-books" className={`nav-item ${isActive('/my-books') ? 'active' : ''}`}>
              My Books
            </Link>
          )}

          {/* Admin Dashboard Entry (Only show if role is explicitly admin) */}
          {isAdmin && (
            <Link to="/admin/dashboard" className={`nav-item admin-badge-nav ${isActive('/admin/dashboard') ? 'active' : ''}`}>
              🛡️ Admin Console
            </Link>
          )}
        </div>

        {/* DESKTOP AUTHENTICATION & SHOPPING CART CONTROLS */}
        <div className="nav-actions">
          {/* Standard Shopping Cart button (hidden from administrative users) */}
          {!isAdmin && (
            <Link to="/cart" className={`cart-btn-nav ${isActive('/cart') ? 'active' : ''}`}>
              <div className="cart-icon-wrapper">
                🛒
                {/* Dynamically renders quantity bubble badge if count is greater than zero */}
                {getCartCount() > 0 && (
                  <span className="cart-counter">{getCartCount()}</span>
                )}
              </div>
              <span className="cart-label">Cart</span>
            </Link>
          )}

          {/* Authentication portal check */}
          {user ? (
            // A. Renders username profile details and secure logout buttons
            <div className="user-profile-nav">
              <span className="welcome-name" title={user.username}>Hi, {user.username}</span>
              <button onClick={handleLogout} className="logout-btn-nav">
                Logout
              </button>
            </div>
          ) : (
            // B. Renders public registration/login CTA links
            <div className="auth-btn-group">
              <Link to="/login" className="login-btn-nav">
                Sign In
              </Link>
              <Link to="/register" className="glow-btn">
                Register
              </Link>
            </div>
          )}
        </div>

        {/* MOBILE MENU TOGGLE BUTTON: Renders hamburgers / close marks based on toggle states */}
        <button className="mobile-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* MOBILE RESPONSIVE DRAWER VIEWPORT: Mounts slide list menus on mobile screens */}
      {mobileMenuOpen && (
        <div className="mobile-menu glass-panel">
          <Link to="/" className={`mobile-item ${isActive('/') ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
            Explore Books
          </Link>
          {user && !isAdmin && (
            <Link to="/my-books" className={`mobile-item ${isActive('/my-books') ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
              My Books
            </Link>
          )}
          {isAdmin && (
            <Link to="/admin/dashboard" className={`mobile-item ${isActive('/admin/dashboard') ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
              🛡️ Admin Console
            </Link>
          )}
          
          <div className="mobile-divider"></div>

          {!isAdmin && (
            <Link to="/cart" className={`mobile-item flex-center ${isActive('/cart') ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)} style={{ gap: '8px' }}>
              🛒 Cart ({getCartCount()})
            </Link>
          )}

          {user ? (
            <div className="mobile-user-section">
              <span className="mobile-username">Signed in as {user.username}</span>
              <button onClick={handleLogout} className="danger-btn" style={{ width: '100%', marginTop: '10px' }}>
                Logout
              </button>
            </div>
          ) : (
            <div className="mobile-auth-group">
              <Link to="/login" className="secondary-btn" style={{ width: '100%' }} onClick={() => setMobileMenuOpen(false)}>
                Sign In
              </Link>
              <Link to="/register" className="glow-btn" style={{ width: '100%' }} onClick={() => setMobileMenuOpen(false)}>
                Register
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Embedded Component Scope CSS Rules */}
      <style>{`
        .nav-container {
          position: sticky;
          top: 15px;
          margin: 15px auto;
          width: 95%;
          max-width: 1400px;
          padding: 10px 24px;
          z-index: 1000;
          border-radius: 20px;
        }

        .nav-wrapper {
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: 50px;
        }

        .nav-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 1.4rem;
          font-weight: 800;
          letter-spacing: -0.5px;
        }

        .logo-icon {
          font-size: 1.6rem;
        }

        .logo-text {
          font-weight: 800;
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .nav-item {
          font-size: 0.95rem;
          font-weight: 500;
          color: var(--text-secondary);
          padding: 8px 16px;
          border-radius: 8px;
          transition: var(--transition-fast);
        }

        .nav-item:hover, .nav-item.active {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.05);
        }

        .admin-badge-nav {
          border: 1px solid rgba(168, 85, 247, 0.3);
          background: rgba(168, 85, 247, 0.05);
        }

        .admin-badge-nav:hover, .admin-badge-nav.active {
          background: rgba(168, 85, 247, 0.15) !important;
          border-color: var(--secondary);
        }

        .nav-actions {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .cart-btn-nav {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          color: var(--text-primary);
          padding: 8px 16px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-glass);
          transition: var(--transition-fast);
        }

        .cart-btn-nav:hover, .cart-btn-nav.active {
          border-color: var(--border-glass-hover);
          background: rgba(255, 255, 255, 0.08);
          transform: translateY(-1px);
        }

        .cart-icon-wrapper {
          position: relative;
          font-size: 1.1rem;
        }

        .cart-counter {
          position: absolute;
          top: -8px;
          right: -10px;
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          color: white;
          font-size: 0.65rem;
          font-weight: 800;
          min-width: 16px;
          height: 16px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2px;
          border: 1px solid var(--bg-deep);
        }

        .user-profile-nav {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .welcome-name {
          font-size: 0.9rem;
          color: var(--text-secondary);
          max-width: 120px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .logout-btn-nav {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-secondary);
          padding: 6px 12px;
          border-radius: 8px;
          cursor: pointer;
          border: 1px solid rgba(255, 255, 255, 0.05);
          transition: var(--transition-fast);
        }

        .logout-btn-nav:hover {
          color: var(--accent-red);
          background: rgba(239, 68, 68, 0.05);
          border-color: rgba(239, 68, 68, 0.2);
        }

        .auth-btn-group {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .login-btn-nav {
          font-weight: 600;
          padding: 10px 18px;
          border-radius: 12px;
          color: var(--text-secondary);
          transition: var(--transition-fast);
        }

        .login-btn-nav:hover {
          color: var(--text-primary);
        }

        .mobile-toggle {
          display: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: var(--text-primary);
        }

        .mobile-menu {
          display: none;
          position: absolute;
          top: 75px;
          left: 0;
          width: 100%;
          padding: 20px;
          flex-direction: column;
          gap: 12px;
          z-index: 999;
          animation: fadeIn 0.2s ease-out;
        }

        .mobile-item {
          padding: 12px;
          border-radius: 10px;
          font-weight: 500;
          color: var(--text-secondary);
          text-align: center;
          transition: var(--transition-fast);
        }

        .mobile-item:hover, .mobile-item.active {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.05);
        }

        .mobile-divider {
          height: 1px;
          background: var(--border-glass);
          margin: 5px 0;
        }

        .mobile-user-section {
          text-align: center;
          padding: 10px;
        }

        .mobile-username {
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        .mobile-auth-group {
          display: flex;
          flex-direction: column;
          gap: 10px;
          width: 100%;
        }

        /* Responsive Breakpoints */
        @media (max-width: 900px) {
          .nav-links, .nav-actions {
            display: none;
          }
          
          .mobile-toggle {
            display: block;
          }
          
          .mobile-menu {
            display: flex;
          }
        }
      `}</style>
    </nav>
  );
};

// Export Navbar component as default
export default Navbar;
