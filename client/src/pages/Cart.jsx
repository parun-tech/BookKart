// ============================================================================
// ⚛️ BOOKKART SHOPPING CART VIEW PAGE
// ============================================================================
// This page visualizes the customer's shopping cart list. It loads cart arrays
// from Cart Context, renders itemized summaries with custom cover graphics,
// supports incrementing/decrementing quantities, computes simulated tax/shipping
// breakdowns (both configured as free), and handles Stripe checkout redirects
// (showing loading indicators) or prompts guests to login before buying.

import React, { useContext } from 'react'; // Imports React core hooks
import { Link } from 'react-router-dom'; // Imports routing hyperlinks
import { CartContext } from '../context/CartContext'; // Imports global Cart Context to execute edits and checkouts
import { AuthContext } from '../context/AuthContext'; // Imports global Authentication Context to read user logins

// Cart: Visualizes active cart lists, order subtotals, and secure checkout CTA triggers.
const Cart = () => {
  // Destructure active variables from Cart Context
  const { cartItems, updateQuantity, removeFromCart, getCartTotal, checkout, checkoutLoading } = useContext(CartContext);
  const { user } = useContext(AuthContext); // Loads customer details from Auth Context

  // 1. Calculate pricing breakdowns
  const subtotal = getCartTotal(); // Cumulative price of books in cart
  const taxSimulated = 0; // Tax is free
  const shippingSimulated = 0; // Shipping is free
  const grandTotal = subtotal + taxSimulated + shippingSimulated; // Grand total (₹)

  // 2. VIEW A: Render empty cart placeholder panel if no items exist
  if (cartItems.length === 0) {
    return (
      <div className="cart-empty-container glass-panel flex-center">
        <span className="empty-cart-icon">🛒</span>
        <h2>Your Shopping Cart is Empty</h2>
        <p>You haven't added any books to your cart yet. Explore our curated selection of top-selling books.</p>
        <Link to="/" className="glow-btn" style={{ marginTop: '20px' }}>
          Explore Books
        </Link>
        <style>{`
          .cart-empty-container {
            width: 90%;
            max-width: 600px;
            margin: 80px auto;
            padding: 50px 30px;
            text-align: center;
            flex-direction: column;
            gap: 12px;
          }
          .empty-cart-icon {
            font-size: 4rem;
            animation: float 3s ease-in-out infinite;
          }
          .cart-empty-container p {
            color: var(--text-secondary);
            line-height: 1.5;
          }
        `}</style>
      </div>
    );
  }

  // 3. VIEW B: Render cart grids carrying listing details and pricing summary breakdown panels
  return (
    <div className="cart-page-container">
      <h1 className="cart-page-title">Shopping <span className="text-gradient">Cart</span></h1>

      <div className="cart-grid">
        
        {/* LEFT COMPONENT: Shopping Cart items array loop */}
        <div className="cart-items-section">
          {cartItems.map((item) => {
            const { book, quantity } = item;
            return (
              <div key={book._id} className="cart-item glass-panel">
                {/* Book cover artwork */}
                <img src={book.imageUrl || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=300'} alt={book.title} className="cart-item-img" />
                
                {/* Book specifications metadata */}
                <div className="cart-item-details">
                  <span className="cart-item-category">{book.category}</span>
                  <h3 className="cart-item-title">{book.title}</h3>
                  <p className="cart-item-author">By {book.author}</p>
                  <p className="cart-item-price">₹{book.price.toFixed(2)} each</p>
                </div>

                {/* Quantitative selectors: increment (+) or decrement (-) selectors */}
                <div className="cart-quantity-selector">
                  <button 
                    onClick={() => updateQuantity(book._id, quantity - 1)}
                    className="quantity-btn"
                  >
                    -
                  </button>
                  <span className="quantity-value">{quantity}</span>
                  <button 
                    onClick={() => updateQuantity(book._id, quantity + 1)}
                    className="quantity-btn"
                  >
                    +
                  </button>
                </div>

                {/* Subtotal cost calculations and deletion trash triggers */}
                <div className="cart-item-actions">
                  <span className="item-total-price">₹{(book.price * quantity).toFixed(2)}</span>
                  <button 
                    onClick={() => removeFromCart(book._id)}
                    className="delete-trash-btn"
                    title="Remove item from cart"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* RIGHT COMPONENT: eCommerce summary ledger details card */}
        <div className="cart-summary-section">
          <div className="cart-summary-card glass-panel">
            <h2 className="summary-title">Order Summary</h2>
            <div className="summary-divider"></div>

            {/* Subtotal row */}
            <div className="summary-row">
              <span>Subtotal ({cartItems.reduce((acc, curr) => acc + curr.quantity, 0)} items)</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            
            {/* Taxes breakdown */}
            <div className="summary-row">
              <span>Estimated Tax</span>
              <span className="tax-green">FREE</span>
            </div>

            {/* Shipping breakdown */}
            <div className="summary-row">
              <span>Shipping Fee</span>
              <span className="shipping-green">FREE</span>
            </div>

            <div className="summary-divider"></div>

            {/* Grand Total cost */}
            <div className="summary-row grand-total-row">
              <span>Total Amount</span>
              <span className="grand-total-price">₹{grandTotal.toFixed(2)}</span>
            </div>

            {/* Minimum Stripe transaction warning */}
            {grandTotal < 45 && (
              <div className="stripe-min-warning">
                ⚠️ Stripe requires a minimum checkout amount of <b>₹45.00 INR</b> (approx. $0.50 USD). Please increase the quantity or add more books to checkout.
              </div>
            )}

            {/* CHECKOUT TRIGGERS: Checks authentication rules dynamically */}
            {user ? (
              // A. Logged in customer -> Renders checkout triggers communicating with Stripe endpoints
              <button 
                onClick={checkout} 
                disabled={checkoutLoading || grandTotal < 45}
                className={`glow-btn checkout-submit-btn ${grandTotal < 45 ? 'btn-disabled' : ''}`}
              >
                {checkoutLoading ? (
                  <>
                    <span className="loading-spinner-small"></span>
                    Redirecting to Stripe...
                  </>
                ) : grandTotal < 45 ? (
                  '⚠️ Minimum ₹45 Total Required'
                ) : (
                  '🔒 Proceed to Secure Checkout'
                )}
              </button>
            ) : (
              // B. Guest -> Prompts credentials registration logins fallbacks prior to checkouts
              <div className="checkout-login-fallback">
                <p>Please log in to complete your checkout purchase.</p>
                <Link to="/login" className="glow-btn" style={{ width: '100%' }} disabled={grandTotal < 45}>
                  Log In & Checkout
                </Link>
              </div>
            )}
            
            {/* Trust badge stamp */}
            <div className="stripe-badges flex-center">
              <span>💳 Powered by <b>Stripe Test Sandbox</b></span>
            </div>
          </div>
        </div>
      </div>

      {/* Embedded Component Scope CSS Rules */}
      <style>{`
        .cart-page-container {
          width: 95%;
          max-width: 1400px;
          margin: 0 auto 50px auto;
          animation: fadeIn 0.4s ease-out;
        }

        .cart-page-title {
          font-size: 2.2rem;
          font-weight: 800;
          margin-bottom: 30px;
        }

        .cart-grid {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 30px;
        }

        .cart-items-section {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .cart-item {
          display: flex;
          align-items: center;
          padding: 20px;
          gap: 20px;
        }

        .cart-item-img {
          width: 80px;
          height: 110px;
          object-fit: contain;
          border-radius: 6px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4);
          background: rgba(255, 255, 255, 0.01);
        }

        .cart-item-details {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .cart-item-category {
          font-size: 0.7rem;
          font-weight: 700;
          color: var(--accent-gold);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .cart-item-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .cart-item-author {
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .cart-item-price {
          font-size: 0.9rem;
          color: var(--text-muted);
          font-weight: 500;
        }

        .cart-quantity-selector {
          display: flex;
          align-items: center;
          gap: 12px;
          border: 1px solid var(--border-glass);
          border-radius: 8px;
          padding: 4px 8px;
          background: rgba(0, 0, 0, 0.2);
        }

        .quantity-btn {
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          color: var(--text-secondary);
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          transition: var(--transition-fast);
        }

        .quantity-btn:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.05);
        }

        .quantity-value {
          font-weight: 700;
          font-size: 0.95rem;
          min-width: 20px;
          text-align: center;
        }

        .cart-item-actions {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 15px;
          min-width: 120px;
        }

        .item-total-price {
          font-size: 1.2rem;
          font-weight: 800;
          color: var(--text-primary);
        }

        .delete-trash-btn {
          font-size: 1.1rem;
          cursor: pointer;
          opacity: 0.6;
          transition: var(--transition-fast);
          padding: 6px;
          border-radius: 6px;
        }

        .delete-trash-btn:hover {
          opacity: 1;
          background: rgba(239, 68, 68, 0.1);
        }

        .cart-summary-card {
          padding: 24px;
          position: sticky;
          top: 100px;
        }

        .summary-title {
          font-size: 1.3rem;
          font-weight: 700;
        }

        .summary-divider {
          height: 1px;
          background: var(--border-glass);
          margin: 16px 0;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.95rem;
          color: var(--text-secondary);
          margin-bottom: 12px;
        }

        .tax-green, .shipping-green {
          color: var(--accent-green);
          font-weight: 700;
        }

        .grand-total-row {
          color: var(--text-primary);
          font-weight: 700;
          margin-bottom: 24px;
        }

        .grand-total-price {
          font-size: 1.4rem;
          font-weight: 800;
          color: var(--text-primary);
        }

        .checkout-submit-btn {
          width: 100%;
          padding: 14px;
          font-size: 1rem;
        }

        .checkout-login-fallback {
          text-align: center;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .checkout-login-fallback p {
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .stripe-badges {
          margin-top: 16px;
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .loading-spinner-small {
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-top: 2px solid #ffffff;
          border-radius: 50%;
          width: 16px;
          height: 16px;
          animation: spin 1s linear infinite;
          display: inline-block;
          margin-right: 8px;
        }

        .stripe-min-warning {
          background: rgba(239, 83, 80, 0.08);
          border: 1px solid rgba(239, 83, 80, 0.15);
          color: #ff5252;
          font-size: 0.8rem;
          line-height: 1.45;
          padding: 12px;
          border-radius: 8px;
          margin: 15px 0 10px 0;
          text-align: left;
        }

        .btn-disabled {
          background: rgba(255, 255, 255, 0.05) !important;
          border: 1px solid rgba(255, 255, 255, 0.08) !important;
          color: var(--text-muted) !important;
          cursor: not-allowed !important;
          box-shadow: none !important;
          transform: none !important;
          pointer-events: none;
        }

        @media (max-width: 1000px) {
          .cart-grid {
            grid-template-columns: 1fr;
          }
          .cart-summary-card {
            position: relative;
            top: 0;
          }
          .cart-item {
            flex-wrap: wrap;
          }
        }

        @media (max-width: 600px) {
          .cart-item {
            flex-direction: column;
            align-items: center;
            text-align: center;
          }
          .cart-item-actions {
            align-items: center;
            min-width: unset;
            width: 100%;
            flex-direction: row;
            justify-content: space-between;
            border-top: 1px solid var(--border-glass);
            padding-top: 15px;
          }
        }
      `}</style>
    </div>
  );
};

// Export Cart page component as default
export default Cart;
