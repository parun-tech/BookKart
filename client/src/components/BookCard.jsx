// ============================================================================
// ⚛️ BOOKKART REUSABLE BOOK CARD COMPONENT (Product Card UI)
// ============================================================================
// This component visualizes a single Book record. Designed with Flipkart-style
// ecommerce badges, dynamic ratings stars, real vs. strike-through mock prices,
// discount labels, stock checks, and smart action triggers (e.g. Add to Cart
// buttons vs Admin Edit/Delete consoles). It also carries reactive cover image
// CORS fallbacks to avoid rendering empty grids on dead image links.

import React from 'react'; // Imports React library

// BookCard: Renders a highly responsive and styled catalog card.
const BookCard = ({ book, isAdminView = false, onEdit, onDelete, onAddToCart, isPurchased = false }) => {
  // Destructure database properties with standard fallbacks
  const { title, author, imageUrl, price, rating = 4.5, reviewsCount = 12, category, stock } = book;

  // handleImageError: Captures broken or access-restricted image URL links.
  // Instantly hot-swaps the source with a default premium Unsplash cover placeholder.
  const handleImageError = (e) => {
    e.target.src = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=400';
  };

  // 1. Calculate simulated original prices to display standard eCommerce strike-through discount tags
  const originalPrice = (price * 1.4).toFixed(2); // Original price is set to price * 1.4
  const discountPercent = 30; // Hardcoded eCommerce catalog 30% off discount representation

  return (
    <div className="book-card glass-panel glass-panel-hover">
      
      {/* CARD MEDIA HEADER: Cover illustration & status badges */}
      <div className="card-media-wrapper">
        <img 
          src={imageUrl || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=300'} 
          alt={title} 
          onError={handleImageError} // Hot-swaps source on loading connection errors
          className="book-cover-img" 
        />
        {/* Category Badge */}
        <span className="category-tag">{category}</span>
        
        {/* Conditional Badges */}
        {stock <= 0 && <span className="sold-out-badge">Out of Stock</span>}
        {isPurchased && <span className="purchased-badge">✓ Purchased</span>}
      </div>

      {/* CARD DETAIL BODY: Metadata specifications and ratings */}
      <div className="card-body">
        <h3 className="book-title" title={title}>{title}</h3>
        <p className="book-author">by {author}</p>
        
        {/* Dynamic Ratings Star Bar */}
        <div className="rating-row">
          <div className="flipkart-badge">
            <span>{rating.toFixed(1)}</span>
            <span style={{ fontSize: '9px', marginLeft: '2px' }}>★</span>
          </div>
          <span className="reviews-count">({reviewsCount} Reviews)</span>
        </div>

        {/* Pricing Layout: Current price, strike-through original cost, discount percent */}
        <div className="price-row">
          <span className="current-price">₹{price.toFixed(2)}</span>
          <span className="original-price">₹{originalPrice}</span>
          <span className="discount-tag">{discountPercent}% off</span>
        </div>

        {/* ACTION PANEL: Renders Admin tools vs standard Add-to-Cart buttons dynamically */}
        <div className="card-actions">
          {isAdminView ? (
            // A. Renders administrator CRUD console tools
            <div className="admin-actions-group">
              <button onClick={() => onEdit(book)} className="secondary-btn edit-btn">
                📝 Edit
              </button>
              <button onClick={() => onDelete(book._id)} className="danger-btn delete-btn">
                🗑️ Delete
              </button>
            </div>
          ) : (
            // B. Renders standard customer catalog checkout tools
            <button 
              onClick={() => onAddToCart(book)} 
              disabled={stock <= 0 || isPurchased} // Disable if out of stock or already purchased
              className={`glow-btn cart-action-btn ${stock <= 0 ? 'disabled' : ''}`}
              style={{ width: '100%' }}
            >
              {isPurchased ? 'Already Owned' : stock <= 0 ? 'Sold Out' : '🛒 Add to Cart'}
            </button>
          )}
        </div>
      </div>

      {/* Embedded Component Scope CSS Rules */}
      <style>{`
        .book-card {
          display: flex;
          flex-direction: column;
          overflow: hidden;
          height: 100%;
          animation: fadeIn 0.4s ease-out;
        }

        .card-media-wrapper {
          position: relative;
          width: 100%;
          height: 220px;
          background: rgba(255, 255, 255, 0.02);
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 15px;
          border-bottom: 1px solid var(--border-glass);
          overflow: hidden;
        }

        .book-cover-img {
          height: 100%;
          width: auto;
          max-width: 100%;
          object-fit: contain;
          border-radius: 6px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
          transition: var(--transition-smooth);
        }

        .book-card:hover .book-cover-img {
          transform: scale(1.05) rotate(1deg);
          box-shadow: 0 8px 24px rgba(99, 102, 241, 0.3);
        }

        .category-tag {
          position: absolute;
          top: 10px;
          left: 10px;
          background: rgba(12, 9, 21, 0.85);
          border: 1px solid var(--border-glass);
          font-size: 0.7rem;
          font-weight: 600;
          color: var(--text-secondary);
          padding: 4px 10px;
          border-radius: 20px;
          text-transform: capitalize;
        }

        .sold-out-badge {
          position: absolute;
          top: 10px;
          right: 10px;
          background: rgba(239, 68, 68, 0.9);
          font-size: 0.7rem;
          font-weight: 700;
          color: #fff;
          padding: 4px 10px;
          border-radius: 6px;
          box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
        }

        .purchased-badge {
          position: absolute;
          top: 10px;
          right: 10px;
          background: rgba(16, 185, 129, 0.9);
          font-size: 0.7rem;
          font-weight: 700;
          color: #fff;
          padding: 4px 10px;
          border-radius: 6px;
          box-shadow: 0 2px 8px rgba(16, 185, 129, 0.4);
        }

        .card-body {
          padding: 20px;
          display: flex;
          flex-direction: column;
          flex-grow: 1;
          gap: 10px;
        }

        .book-title {
          font-size: 1.1rem;
          font-weight: 700;
          line-height: 1.3;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .book-author {
          font-size: 0.85rem;
          color: var(--text-secondary);
          margin-top: -4px;
        }

        .rating-row {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.8rem;
        }

        .reviews-count {
          color: var(--text-muted);
          font-weight: 500;
        }

        .price-row {
          display: flex;
          align-items: baseline;
          gap: 8px;
          margin: 4px 0;
        }

        .current-price {
          font-size: 1.3rem;
          font-weight: 800;
          color: var(--text-primary);
        }

        .original-price {
          font-size: 0.9rem;
          color: var(--text-muted);
          text-decoration: line-through;
        }

        .discount-tag {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--accent-gold);
        }

        .card-actions {
          margin-top: auto;
          padding-top: 10px;
        }

        .admin-actions-group {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .edit-btn, .delete-btn {
          width: 100%;
          padding: 8px 12px;
          font-size: 0.85rem;
        }

        .cart-action-btn.disabled {
          background: rgba(255, 255, 255, 0.05) !important;
          border-color: var(--border-glass) !important;
          color: var(--text-muted) !important;
          cursor: not-allowed;
          box-shadow: none !important;
          transform: none !important;
          filter: none !important;
        }
      `}</style>
    </div>
  );
};

// Export BookCard component as default
export default BookCard;
