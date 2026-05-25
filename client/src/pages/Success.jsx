// ============================================================================
// ⚛️ BOOKKART BILLING CHECKOUT SUCCESS PAGE
// ============================================================================
// This page receives redirects from Stripe Checkouts. It extracts transaction
// session IDs, communicates with payment verification APIs, handles loading/verifying
// states, updates the global customer profile metadata on success (to instantly reveal
// purchased books), clears out front-end cart states, and provides navigation
// links to customer digital libraries.

import React, { useEffect, useState, useContext } from 'react'; // Imports React core hooks
import { Link, useSearchParams } from 'react-router-dom'; // Imports routing and URL search query hooks
import { CartContext } from '../context/CartContext'; // Imports global Cart Context to clear shopping carts
import { AuthContext } from '../context/AuthContext'; // Imports global Authentication Context to refresh customer profiles

// Success: Handles payment verification checks.
const Success = () => {
  const [searchParams] = useSearchParams(); // Hook to extract parameters from landing link (URL)
  const sessionId = searchParams.get('session_id'); // Extract Stripe Session ID variable
  const isMock = searchParams.get('mock') === 'true'; // Flag showing if session was simulated locally in developer sandbox

  const { clearCart } = useContext(CartContext); // Loads clearCart trigger from Cart Context
  const { setUser } = useContext(AuthContext); // Loads setUser profile updates from Auth Context

  // UI state variables
  const [verifying, setVerifying] = useState(true); // Flag representing active background verification handshakes
  const [verified, setVerified] = useState(false); // Flag representing verified transaction approval
  const [errorMsg, setErrorMsg] = useState(null); // Captures server connection warnings or invalid payment errors

  // verifyPayment Effect: Runs exactly once during startup. 
  // Pings the verify-checkout API endpoint, passing the Stripe Session ID to authorize the purchase.
  useEffect(() => {
    const verifyPayment = async () => {
      // A. Terminate early if the required checkout session ID parameter is missing
      if (!sessionId) {
        setVerifying(false);
        setErrorMsg('Checkout Session Identifier is missing.');
        return;
      }

      try {
        const token = localStorage.getItem('token'); // Retrieve authorization session token
        
        // B. Ping Express API verify-checkout endpoint to audit checkout transaction
        const res = await fetch('http://localhost:5000/api/cart/verify-checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ sessionId })
        });
        const data = await res.json();

        if (data.success) {
          setVerified(true);
          clearCart(); // Payment verified successfully! Purge front-end cart items from localStorage
          
          // C. Proactive sync: Refetch customer profile immediately to sync purchasedBooks ObjectIds array
          const profileRes = await fetch('http://localhost:5000/api/auth/profile', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          const profileData = await profileRes.json();
          if (profileData.success) {
            setUser(profileData.user); // Synchronize active state
          }
        } else {
          setErrorMsg(data.message || 'Payment verification failed.');
        }
      } catch (err) {
        console.error(err);
        setErrorMsg('Unable to connect to verification server.');
      } finally {
        setVerifying(false); // verification sequence ended
      }
    };

    verifyPayment();
  }, [sessionId, clearCart, setUser]);

  return (
    <div className="success-page-container flex-center">
      <div className="success-card glass-panel">
        
        {/* VIEW A: Active background verification handshakes */}
        {verifying ? (
          <div className="verifying-content flex-center">
            <div className="glow-spinner"></div>
            <h2>Verifying Stripe Payment...</h2>
            <p>Please wait a moment while we audit your checkout transaction with Stripe API.</p>
          </div>
        ) : errorMsg ? (
          
          // VIEW B: Transaction verification failures
          <div className="error-content flex-center">
            <span className="error-badge-icon">⚠️</span>
            <h2>Checkout Unverified</h2>
            <p className="error-desc">{errorMsg}</p>
            <p className="error-sub">If you believe this is an error, please check your Stripe developer dashboard or contact assistance.</p>
            <div className="action-buttons-group">
              <Link to="/cart" className="glow-btn">
                Return to Cart
              </Link>
              <Link to="/" className="secondary-btn">
                Browse Shop
              </Link>
            </div>
          </div>
        ) : (
          
          // VIEW C: Transaction approved, purchases unlocked!
          <div className="verified-content flex-center">
            <div className="success-tick-circle">
              <span className="tick-mark">✓</span>
            </div>
            <h2 className="success-title">Purchase Completed!</h2>
            <p className="success-subtitle">
              Your Stripe test sandbox payment was successfully authorized. 
              {isMock && " (Simulated Developer Sandbox mode approved.)"}
            </p>
            
            {/* Purchase Details Ticket */}
            <div className="receipt-box glass-panel">
              <div className="receipt-row">
                <span>Stripe Session ID</span>
                <span className="receipt-val">{sessionId.substring(0, 15)}...</span>
              </div>
              <div className="receipt-row">
                <span>Delivery Method</span>
                <span className="receipt-val-green">Instant eBook Library Sync</span>
              </div>
            </div>

            <p className="library-notice">
              Your new books have been immediately added to your vault. Navigate to your digital library to start reading!
            </p>

            <div className="action-buttons-group">
              <Link to="/my-books" className="glow-btn success-cta-btn">
                📖 Open My Digital Library
              </Link>
              <Link to="/" className="secondary-btn">
                Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Embedded Component Scope CSS Rules */}
      <style>{`
        .success-page-container {
          min-height: 80vh;
          padding: 20px;
        }

        .success-card {
          width: 100%;
          max-width: 600px;
          padding: 50px 40px;
          text-align: center;
          background: radial-gradient(circle at center, rgba(16, 185, 129, 0.08) 0%, transparent 70%), var(--bg-card);
          border-color: rgba(16, 185, 129, 0.2);
          box-shadow: 0 10px 40px rgba(16, 185, 129, 0.1);
          animation: scaleUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .verifying-content {
          flex-direction: column;
          gap: 20px;
        }

        .glow-spinner {
          border: 4px solid rgba(255, 255, 255, 0.1);
          border-top: 4px solid var(--primary);
          border-radius: 50%;
          width: 50px;
          height: 50px;
          animation: spin 1s linear infinite;
          box-shadow: 0 0 15px var(--primary-glow);
        }

        .verified-content {
          flex-direction: column;
          gap: 24px;
        }

        .success-tick-circle {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: rgba(16, 185, 129, 0.15);
          border: 2px solid var(--accent-green);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 20px rgba(16, 185, 129, 0.4);
          animation: pulse-glow-green 2s infinite;
        }

        @keyframes pulse-glow-green {
          0%, 100% { box-shadow: 0 0 15px rgba(16, 185, 129, 0.3); }
          50% { box-shadow: 0 0 25px rgba(16, 185, 129, 0.6); }
        }

        .tick-mark {
          font-size: 2.5rem;
          color: var(--accent-green);
          font-weight: 700;
          line-height: 1;
        }

        .success-title {
          font-size: 2rem;
          font-weight: 800;
        }

        .success-subtitle {
          font-size: 0.9rem;
          color: var(--text-secondary);
          max-width: 480px;
          line-height: 1.5;
        }

        .receipt-box {
          width: 100%;
          padding: 16px 20px;
          background: rgba(0,0,0,0.3);
          border: 1px solid var(--border-glass);
          display: flex;
          flex-direction: column;
          gap: 12px;
          text-align: left;
        }

        .receipt-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--text-secondary);
        }

        .receipt-val {
          color: var(--text-primary);
          font-family: monospace;
        }

        .receipt-val-green {
          color: var(--accent-green);
          font-weight: 700;
        }

        .library-notice {
          font-size: 0.95rem;
          line-height: 1.6;
          color: var(--text-primary);
          max-width: 480px;
        }

        .action-buttons-group {
          display: flex;
          gap: 15px;
          width: 100%;
          justify-content: center;
          margin-top: 10px;
        }

        .success-cta-btn {
          background: linear-gradient(135deg, var(--accent-green), #059669);
          box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
        }

        .success-cta-btn:hover {
          box-shadow: 0 6px 20px rgba(16, 185, 129, 0.6);
        }

        .error-content {
          flex-direction: column;
          gap: 20px;
        }

        .error-badge-icon {
          font-size: 3rem;
          animation: float 4s ease-in-out infinite;
        }

        .error-desc {
          font-size: 1.1rem;
          color: var(--accent-red);
          font-weight: 700;
        }

        .error-sub {
          font-size: 0.85rem;
          color: var(--text-muted);
          max-width: 400px;
          line-height: 1.5;
        }

        @media(max-width: 500px) {
          .action-buttons-group {
            flex-direction: column;
            width: 100%;
          }
          .action-buttons-group a {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

// Export Success page as default
export default Success;
