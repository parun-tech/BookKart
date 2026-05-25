// ============================================================================
// ⚛️ BOOKKART CUSTOMER VIRTUAL LIBRARY PAGE (My Books Catalog)
// ============================================================================
// This page visualizes the customer's permanently unlocked eBook collection.
// It pings the books/my-books GET endpoint using auth session keys, handles library
// loaders, and renders responsive cards containing direct eBook Reader modal triggers.
// It mounts a fully interactive glowing dark-themed eBook reader overlay carrying
// mock page turn selectors, progress percent calculators, and styled layouts.

import React, { useState, useEffect } from 'react'; // Imports React core hooks
import { Link } from 'react-router-dom'; // Imports routing hyperlinks

// MyBooks: Visualizes customer owned books libraries and manages active eBook Reader interfaces.
const MyBooks = () => {
  const [purchasedBooks, setPurchasedBooks] = useState([]); // Array of owned book documents fetched from MERN endpoints
  const [loading, setLoading] = useState(true); // Flag representing backend query loading states
  const [error, setError] = useState(null); // Captures connections warning dialogs or fetch errors

  // 1. Interactive eBook Reader modal overlay states
  const [readerBook, setReaderBook] = useState(null); // The Book document currently open inside the overlay reader (null if closed)
  const [readPage, setReadPage] = useState(1); // Page position indicator track inside the mock viewer

  // Initial Purchased Books Fetch Effect: Fires exactly once on mount. 
  // Queries the REST API using the user token to fetch a list of permanently owned books, and populates local state.
  useEffect(() => {
    const fetchMyBooks = async () => {
      try {
        const token = localStorage.getItem('token'); // Retrieve authorization session token
        
        // Ping Express my-books API endpoint to fetch owned catalog
        const res = await fetch('http://localhost:5000/api/books/my-books', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();

        if (data.success) {
          setPurchasedBooks(data.books);
        } else {
          setError(data.message || 'Failed to fetch purchased books');
        }
      } catch (err) {
        console.error('Fetch my books error:', err);
        setError('Could not connect to server. Please try again later.');
      } finally {
        setLoading(false); // Library vault loaded
      }
    };

    fetchMyBooks();
  }, []);

  // openReader: Opens the full screen mock eBook reader modal for a specific book.
  const openReader = (book) => {
    setReaderBook(book);
    setReadPage(1); // Set reader chapter page back to 1
  };

  // closeReader: Dismounts the mock eBook reader and returns user to library list dashboards.
  const closeReader = () => {
    setReaderBook(null); // Set active book to null to hide modal overlay
  };

  // 2. VIEW A: Renders loading spinner layout during initial connection handshakes
  if (loading) {
    return (
      <div className="mybooks-loading flex-center">
        <div className="spinner"></div>
        <p>Opening your library vault...</p>
        <style>{`
          .mybooks-loading {
            height: 60vh;
            flex-direction: column;
            gap: 15px;
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
        `}</style>
      </div>
    );
  }

  // 3. VIEW B: Renders server connection error panels on connection failures
  if (error) {
    return (
      <div className="mybooks-error glass-panel flex-center">
        <p>⚠️ {error}</p>
        <style>{`
          .mybooks-error {
            width: 90%;
            max-width: 600px;
            margin: 60px auto;
            padding: 40px;
            color: var(--accent-red);
            font-weight: 600;
          }
        `}</style>
      </div>
    );
  }

  // 4. VIEW C: Renders main library screen
  return (
    <div className="mybooks-container">
      <header className="library-header">
        <h1 className="library-title">My Digital <span className="text-gradient">Library</span></h1>
        <p className="library-subtitle">You have permanent, lifetime access to {purchasedBooks.length} purchased volumes.</p>
      </header>

      {purchasedBooks.length === 0 ? (
        
        // Sub-View: Empty library alerts for new accounts
        <div className="library-empty glass-panel flex-center">
          <span className="empty-lib-icon">📚</span>
          <h2>Your Library is Empty</h2>
          <p>You haven't purchased any books yet. Once you complete a checkout using Stripe, your books will instantly appear here!</p>
          <Link to="/" className="glow-btn">
            Browse Bookstore
          </Link>
        </div>
      ) : (
        
        // Sub-View: Grid containing purchased owned eBook cards
        <div className="library-grid">
          {purchasedBooks.map((book) => (
            <div key={book._id} className="owned-book-card glass-panel glass-panel-hover">
              <div className="owned-cover-wrapper">
                <img src={book.imageUrl || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=300'} alt={book.title} className="owned-cover" />
                <span className="owned-badge">✓ OWNED</span>
              </div>
              <div className="owned-details">
                <span className="owned-category">{book.category}</span>
                <h3 className="owned-title" title={book.title}>{book.title}</h3>
                <p className="owned-author">By {book.author}</p>
                <div className="owned-divider"></div>
                <button onClick={() => openReader(book)} className="glow-btn read-btn">
                  📖 Open eBook Reader
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* INTERACTIVE GLOWING DARK-MODE EBOOK READER OVERLAY MODAL */}
      {readerBook && (
        <div className="reader-overlay flex-center">
          <div className="reader-modal glass-panel">
            
            {/* Modal Header */}
            <div className="reader-header">
              <div className="reader-title-info">
                <h3>{readerBook.title}</h3>
                <span>By {readerBook.author}</span>
              </div>
              <button onClick={closeReader} className="reader-close-btn">✕ Close</button>
            </div>

            {/* Modal Body: Left page Chapter synopsis, Right page mock calculations details */}
            <div className="reader-body">
              {/* Left Page (Page N) */}
              <div className="reader-page-left glass-panel">
                <span className="page-num">Page {readPage}</span>
                <h4 className="chapter-title">Chapter 1: The New Horizon</h4>
                <p className="chapter-content">
                  The light filtering through the digital screen was the only source of clarity in the room. Inside the codebase, thousands of scripts danced in unison. MERN stack implementations flourished under the hands of diligent creators.
                </p>
                <p className="chapter-content">
                  "This book holds the ancient secrets of database connection clusters," he read aloud. MONGODB_URI connections stood firm, sending streams of data across the web to waiting React interfaces.
                </p>
              </div>

              {/* Right Page (Page N + 1) */}
              <div className="reader-page-right glass-panel">
                <span className="page-num">Page {readPage + 1}</span>
                <p className="chapter-content">
                  As the checkout completed with Stripe, the system generated tokens of trust. Users in remote portals opened their dashboard libraries, finding the volumes they had acquired.
                </p>
                <p className="chapter-content">
                  "Keep it structured and keep it beautiful," the author wrote in the final paragraphs. Every component, from clean CSS systems to navigation, aligned flawlessly, glowing in a deep indigo dark mode.
                </p>
                <div className="mock-illustration">
                  📚 BookKart Reader v1.0
                </div>
              </div>
            </div>

            {/* Modal Footer Controls: previous pages triggers, percent calculators, next page triggers */}
            <div className="reader-footer">
              <button 
                onClick={() => setReadPage(Math.max(1, readPage - 2))} 
                disabled={readPage === 1}
                className="secondary-btn reader-page-btn"
              >
                ◀ Previous Pages
              </button>
              <span className="reading-progress">Reading Progress: {Math.round((readPage / 20) * 100)}%</span>
              <button 
                onClick={() => setReadPage(Math.min(19, readPage + 2))} 
                disabled={readPage >= 19}
                className="secondary-btn reader-page-btn"
              >
                Next Pages ▶
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Embedded Component Scope CSS Rules */}
      <style>{`
        .mybooks-container {
          width: 95%;
          max-width: 1400px;
          margin: 0 auto 50px auto;
          animation: fadeIn 0.4s ease-out;
        }

        .library-header {
          margin-bottom: 40px;
        }

        .library-title {
          font-size: 2.2rem;
          font-weight: 800;
        }

        .library-subtitle {
          color: var(--text-secondary);
          margin-top: 5px;
        }

        .library-empty {
          padding: 60px 40px;
          text-align: center;
          flex-direction: column;
          gap: 12px;
          margin-top: 30px;
        }

        .empty-lib-icon {
          font-size: 4rem;
          animation: float 3s ease-in-out infinite;
        }

        .library-empty p {
          color: var(--text-secondary);
          max-width: 500px;
          line-height: 1.5;
          margin-bottom: 12px;
          }
        }

        .library-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 30px;
        }

        .owned-book-card {
          display: flex;
          padding: 16px;
          gap: 16px;
          align-items: center;
        }

        .owned-cover-wrapper {
          position: relative;
          width: 100px;
          height: 140px;
          flex-shrink: 0;
        }

        .owned-cover {
          width: 100%;
          height: 100%;
          object-fit: contain;
          border-radius: 6px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.4);
        }

        .owned-badge {
          position: absolute;
          bottom: -8px;
          left: 50%;
          transform: translateX(-50%);
          background: var(--accent-green);
          font-size: 0.6rem;
          font-weight: 800;
          color: white;
          padding: 2px 8px;
          border-radius: 20px;
          white-space: nowrap;
          border: 1px solid var(--bg-deep);
        }

        .owned-details {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 4px;
        }

        .owned-category {
          font-size: 0.7rem;
          color: var(--text-muted);
          text-transform: uppercase;
          font-weight: 700;
        }

        .owned-title {
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .owned-author {
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .owned-divider {
          height: 1px;
          background: var(--border-glass);
          margin: 10px 0;
        }

        .read-btn {
          padding: 10px 24px;
          font-size: 0.85rem;
          width: fit-content;
          border-radius: 10px;
        }

        .reader-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(4, 3, 8, 0.9);
          z-index: 2000;
          padding: 20px;
          backdrop-filter: blur(10px);
        }

        .reader-modal {
          width: 95%;
          max-width: 1100px;
          height: 90vh;
          max-height: 800px;
          display: flex;
          flex-direction: column;
          padding: 24px;
          background: rgba(12, 9, 21, 0.95);
          animation: scaleUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        @keyframes scaleUp {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        .reader-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--border-glass);
          padding-bottom: 15px;
          margin-bottom: 20px;
        }

        .reader-title-info h3 {
          font-size: 1.2rem;
          font-weight: 800;
        }

        .reader-title-info span {
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .reader-close-btn {
          cursor: pointer;
          background: rgba(239, 68, 68, 0.15);
          color: var(--accent-red);
          border: 1px solid rgba(239, 68, 68, 0.2);
          padding: 8px 16px;
          border-radius: 8px;
          font-weight: 600;
          transition: var(--transition-fast);
        }

        .reader-close-btn:hover {
          background: rgba(239, 68, 68, 0.3);
        }

        .reader-body {
          flex-grow: 1;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          overflow-y: auto;
          padding: 10px;
        }

        .reader-page-left, .reader-page-right {
          padding: 30px;
          height: 100%;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 15px;
          position: relative;
          background: rgba(0,0,0,0.4);
          border: 1px solid rgba(255, 255, 255, 0.03);
        }

        .page-num {
          position: absolute;
          bottom: 15px;
          right: 20px;
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 600;
        }

        .reader-page-left .page-num {
          right: unset;
          left: 20px;
        }

        .chapter-title {
          font-size: 1.2rem;
          font-weight: 700;
          color: var(--primary);
          margin-bottom: 10px;
        }

        .chapter-content {
          font-size: 0.95rem;
          line-height: 1.7;
          color: var(--text-primary);
          text-align: justify;
        }

        .mock-illustration {
          margin-top: auto;
          padding: 10px;
          border: 1px dashed var(--border-glass);
          border-radius: 8px;
          text-align: center;
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 700;
          letter-spacing: 1px;
        }

        .reader-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid var(--border-glass);
          padding-top: 15px;
          margin-top: 20px;
        }

        .reader-page-btn {
          padding: 8px 16px;
          font-size: 0.85rem;
        }

        .reader-page-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .reading-progress {
          font-size: 0.85rem;
          color: var(--text-secondary);
          font-weight: 600;
        }

        @media (max-width: 800px) {
          .reader-body {
            grid-template-columns: 1fr;
          }
          .reader-page-right {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

// Export MyBooks page component as default
export default MyBooks;
