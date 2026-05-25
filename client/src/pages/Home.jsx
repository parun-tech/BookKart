// ============================================================================
// BOOKKART BOOKSTORE EXPLORE CATALOG PAGE (Home Storefront)
// ============================================================================
// This is the central storefront hub. It fetches the books catalog from REST API,
// maintains sidebars containing filter selections (genres category checkboxes, price range sliders),
// performs real-time reactive search filtering, renders itemized BookCard components,
// checks owned books to mark "purchased" stamps, and fires success toast notifications.

import React, { useState, useEffect, useContext } from 'react'; // Imports React core hooks
import { AuthContext } from '../context/AuthContext'; // Imports global Authentication Context to check owned books
import { CartContext } from '../context/CartContext'; // Imports global Cart Context to handle item additions
import BookCard from '../components/BookCard'; // Imports reusable catalog book card component

// Home: Renders the search headers, filters sidebars, and reactive book catalog grids.
const Home = () => {
  const { user } = useContext(AuthContext); // Loads customer details from Auth Context
  const { addToCart } = useContext(CartContext); // Loads addToCart trigger from Cart Context
  const [books, setBooks] = useState([]); // Array of raw book documents from MongoDB database
  const [filteredBooks, setFilteredBooks] = useState([]); // Filtered array after search, category, and price range filters
  const [loading, setLoading] = useState(true); // Flag representing backend query states
  const [error, setError] = useState(null); // Captures API connection warnings or fetching failures
  
  // 1. Search & Filter local states
  const [searchTerm, setSearchTerm] = useState(''); // Text typed inside search input block
  const [selectedCategory, setSelectedCategory] = useState('all'); // Genre category filter selection ('all' or specific)
  const [maxPriceLimit, setMaxPriceLimit] = useState(1000); // dynamic maximum boundary for the slider
  const [priceRange, setPriceRange] = useState(1000); // Maximum pricing threshold (defaults to dynamic maximum limit)
  const [categories, setCategories] = useState(['all']); // Extracted list of unique genres present in books database
  
  // 2. Toast notification state
  const [toastMessage, setToastMessage] = useState(null); // Notification banner contents ('Added to Cart!')

  // Initial Books Catalog Fetch Effect: Fires exactly once on mount. Queries the REST API to fetch all active books,
  // extracts unique categories to build sidebar tags, and loads state.
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/books');
        const data = await res.json();
        
        if (data.success) {
          setBooks(data.books);
          setFilteredBooks(data.books);
          
          // Dynamically extract unique categories and prepend an 'all' fallback choice
          const cats = ['all', ...new Set(data.books.map(b => b.category))];
          setCategories(cats);

          // Find the maximum price in the catalog dynamically to avoid hiding higher-priced books
          if (data.books.length > 0) {
            const maxBookPrice = Math.max(...data.books.map(b => b.price));
            // Round up to nearest 50 or 100 for a clean slider experience
            const cleanMax = Math.ceil(maxBookPrice / 50) * 50;
            const absoluteMax = Math.max(cleanMax, 150); // Keep at least 150 boundary for UI safety
            setMaxPriceLimit(absoluteMax);
            setPriceRange(absoluteMax); // Default maximum price filter to show all books initially
          }
        } else {
          setError(data.message || 'Failed to fetch books');
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Unable to connect to the backend server. Make sure the server is running!');
      } finally {
        setLoading(false); // Catalog loaded
      }
    };

    fetchBooks();
  }, []);

  // Real-Time Search & Filters Effect: Triggers whenever the searchTerm, selectedCategory, priceRange, or books dataset shifts.
  // Systematically filters items dynamically.
  useEffect(() => {
    let result = books;

    // A. Search validation check (scans title and author text fields)
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        book =>
          book.title.toLowerCase().includes(term) ||
          book.author.toLowerCase().includes(term)
      );
    }

    // B. Category selection check
    if (selectedCategory !== 'all') {
      result = result.filter(book => book.category === selectedCategory);
    }

    // C. Pricing range threshold checks
    result = result.filter(book => book.price <= priceRange);

    setFilteredBooks(result);
  }, [searchTerm, selectedCategory, priceRange, books]);

  // handleAddToCart: Dispatches item additions to Cart Context and triggers success toast banners.
  const handleAddToCart = (book) => {
    addToCart(book);
    setToastMessage(`"${book.title}" added to your cart!`); // Display success alert
    setTimeout(() => {
      setToastMessage(null); // Clear success alert after 3 seconds
    }, 3000);
  };

  // isPurchased: Audits the user's library references to check if they already own a book.
  const isPurchased = (bookId) => {
    if (!user || !user.purchasedBooks) return false;
    // Inspect arrays in case MERN loaded populated objects vs plain reference IDs
    return user.purchasedBooks.some(b => {
      if (typeof b === 'object' && b !== null) {
        return b._id === bookId;
      }
      return b === bookId;
    });
  };

  return (
    <div className="home-container">
      
      {/* Dynamic Toast Notification Banner */}
      {toastMessage && (
        <div className="toast-notification glass-panel">
          <span className="toast-icon">🛒</span>
          <span className="toast-text">{toastMessage}</span>
        </div>
      )}

      {/* HERO BANNER SECTION: Search bar inputs */}
      <header className="hero-section glass-panel">
        <div className="hero-content">
          <span className="hero-badge">✨ NEW COLLECTION AVAILABLE</span>
          <h1 className="hero-title">Discover Your Next <span className="text-gradient">Literary Adventure</span></h1>
          <p className="hero-subtitle">
            Explore hundreds of premium bestsellers, technical blueprints, and timeless classics at unbeatable prices.
          </p>
          
          {/* Dynamic Search Box */}
          <div className="search-bar-wrapper glass-panel">
            <span className="search-icon">🔍</span>
            <input 
              type="text" 
              placeholder="Search by book title or author name..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="search-clear-btn">✕</button>
            )}
          </div>
        </div>
      </header>

      {/* STORE FRONT GRID: Filters Sidebars on Left, Book Cards Grid on Right */}
      <div className="store-layout">
        
        {/* FILTERS SIDEBAR */}
        <aside className="filters-sidebar glass-panel">
          <h2 className="sidebar-title">Catalog Filters</h2>
          <div className="filter-divider"></div>

          {/* A. Genres category selector Buttons */}
          <div className="filter-group">
            <h3 className="filter-label">Genres / Categories</h3>
            <div className="category-list">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`category-btn ${selectedCategory === cat ? 'active' : ''}`}
                >
                  <span className="bullet">•</span>
                  <span style={{ textTransform: 'capitalize' }}>{cat}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="filter-divider"></div>

          {/* B. Maximum price range slider input */}
          <div className="filter-group">
            <div className="price-filter-header">
              <h3 className="filter-label">Max Price</h3>
              <span className="price-limit">₹{priceRange}</span>
            </div>
            <input
              type="range"
              min="5"
              max={maxPriceLimit}
              step="5"
              value={priceRange}
              onChange={(e) => setPriceRange(Number(e.target.value))}
              className="price-slider"
            />
            <div className="price-slider-labels">
              <span>₹5</span>
              <span>₹{maxPriceLimit}</span>
            </div>
          </div>
        </aside>

        {/* CATALOG RESULTS GRID PANEL */}
        <main className="catalog-content">
          {loading ? (
            // A. Spinner during background queries
            <div className="catalog-loading flex-center">
              <div className="spinner"></div>
              <p>Fetching curated collection...</p>
            </div>
          ) : error ? (
            // B. Captures Express server connection crashes
            <div className="catalog-error glass-panel flex-center">
              <p className="error-text">⚠️ {error}</p>
            </div>
          ) : filteredBooks.length === 0 ? (
            // C. Zero results alerts with quick reset buttons
            <div className="catalog-empty glass-panel flex-center">
              <h3>No Books Found Matching Filters</h3>
              <p>Try resetting the search terms or widening the price filter range.</p>
              <button 
                onClick={() => { setSearchTerm(''); setSelectedCategory('all'); setPriceRange(maxPriceLimit); }} 
                className="secondary-btn"
                style={{ marginTop: '15px' }}
              >
                Reset Filters
              </button>
            </div>
          ) : (
            // D. Render catalog items
            <div className="books-grid">
              {filteredBooks.map((book) => (
                <BookCard
                  key={book._id}
                  book={book}
                  onAddToCart={handleAddToCart}
                  isPurchased={isPurchased(book._id)}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Embedded Component Scope CSS Rules */}
      <style>{`
        .home-container {
          width: 95%;
          max-width: 1400px;
          margin: 0 auto 50px auto;
          animation: fadeIn 0.4s ease-out;
        }

        .toast-notification {
          position: fixed;
          bottom: 30px;
          right: 30px;
          z-index: 1100;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 24px;
          border-left: 4px solid var(--accent-green);
          background: rgba(10, 8, 19, 0.95);
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
          animation: slideUp 0.3s ease-out;
        }

        @keyframes slideUp {
          from { transform: translateY(50px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .toast-icon {
          font-size: 1.3rem;
        }

        .toast-text {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .hero-section {
          padding: 60px 40px;
          margin-bottom: 30px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: radial-gradient(circle at center, rgba(99, 102, 241, 0.1) 0%, transparent 70%), var(--bg-card);
        }

        .hero-badge {
          background: rgba(99, 102, 241, 0.15);
          border: 1px solid rgba(99, 102, 241, 0.3);
          color: #a5b4fc;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 6px 14px;
          border-radius: 30px;
          margin-bottom: 20px;
          display: inline-block;
          letter-spacing: 1px;
        }

        .hero-title {
          font-size: 2.8rem;
          font-weight: 800;
          line-height: 1.2;
          max-width: 800px;
          margin-bottom: 15px;
        }

        .hero-subtitle {
          font-size: 1.1rem;
          color: var(--text-secondary);
          max-width: 600px;
          margin-bottom: 30px;
          line-height: 1.6;
        }

        .search-bar-wrapper {
          display: flex;
          align-items: center;
          width: 100%;
          max-width: 600px;
          padding: 6px 16px;
          border-radius: 14px;
          background: rgba(6, 4, 10, 0.6);
        }

        .search-icon {
          font-size: 1.1rem;
          color: var(--text-muted);
        }

        .search-input {
          flex-grow: 1;
          padding: 10px 14px;
          font-size: 0.95rem;
          outline: none;
          color: var(--text-primary);
        }

        .search-input::placeholder {
          color: var(--text-muted);
        }

        .search-clear-btn {
          font-size: 0.8rem;
          color: var(--text-muted);
          cursor: pointer;
          padding: 6px;
        }

        .search-clear-btn:hover {
          color: var(--text-primary);
        }

        .store-layout {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 30px;
        }

        .filters-sidebar {
          padding: 24px;
          height: fit-content;
          position: sticky;
          top: 100px;
        }

        .sidebar-title {
          font-size: 1.2rem;
          font-weight: 700;
        }

        .filter-divider {
          height: 1px;
          background: var(--border-glass);
          margin: 20px 0;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .filter-label {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .category-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .category-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 0.95rem;
          font-weight: 500;
          color: var(--text-secondary);
          text-align: left;
          cursor: pointer;
          transition: var(--transition-fast);
        }

        .category-btn .bullet {
          color: var(--text-muted);
          font-size: 1.2rem;
          line-height: 1;
        }

        .category-btn:hover {
          background: rgba(255, 255, 255, 0.03);
          color: var(--text-primary);
        }

        .category-btn.active {
          background: rgba(99, 102, 241, 0.1);
          color: #a5b4fc;
          font-weight: 600;
        }

        .category-btn.active .bullet {
          color: var(--primary);
        }

        .price-filter-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .price-limit {
          font-size: 1rem;
          font-weight: 700;
          color: var(--accent-gold);
        }

        .price-slider {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 5px;
          border-radius: 5px;
          background: #27213c;
          outline: none;
          margin: 10px 0;
        }

        .price-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: var(--primary);
          cursor: pointer;
          box-shadow: 0 0 10px var(--primary-glow);
          transition: var(--transition-fast);
        }

        .price-slider::-webkit-slider-thumb:hover {
          background: var(--secondary);
          box-shadow: 0 0 15px var(--secondary-glow);
        }

        .price-slider-labels {
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .catalog-content {
          min-height: 400px;
        }

        .catalog-loading {
          flex-direction: column;
          gap: 15px;
          height: 300px;
          color: var(--text-secondary);
        }

        .spinner {
          border: 4px solid rgba(255, 255, 255, 0.1);
          border-top: 4px solid var(--primary);
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .catalog-error {
          padding: 40px;
          height: 200px;
        }

        .error-text {
          color: var(--accent-red);
          font-weight: 600;
        }

        .catalog-empty {
          padding: 60px 40px;
          text-align: center;
          flex-direction: column;
          gap: 8px;
        }

        .catalog-empty h3 {
          font-size: 1.4rem;
        }

        .catalog-empty p {
          color: var(--text-secondary);
        }

        .books-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 25px;
        }

        @media (max-width: 1000px) {
          .store-layout {
            grid-template-columns: 1fr;
          }
          .filters-sidebar {
            position: relative;
            top: 0;
            width: 100%;
          }
          .hero-title {
            font-size: 2.2rem;
          }
        }
      `}</style>
    </div>
  );
};

// Export Home storefront component as default
export default Home;
