// ============================================================================
// ⚛️ BOOKKART ADMINISTRATIVE LIFE-CYCLE CONSOLE (Admin Dashboard)
// ============================================================================
// This page serves as the control center for bookstore managers (role: 'admin').
// It provides full CRUD operations: lists all catalog items using the customized
// BookCard in AdminView mode, pops up overlay forms to Add or Edit entries with
// instant form syncs, queries the books API routes, handles deletion safeguards,
// and launches success notifications.

import React, { useState, useEffect } from 'react'; // Imports React core hooks
import BookCard from '../components/BookCard'; // Imports reusable catalog book card component

// AdminDashboard: Renders the management header, catalog grids, and modal overlay forms.
const AdminDashboard = () => {
  const [books, setBooks] = useState([]); // Array of book documents fetched from MERN endpoints
  const [loading, setLoading] = useState(true); // Flag representing database query states
  const [error, setError] = useState(null); // Captures database connection errors
  
  // 1. Overlay Form Modal States
  const [isModalOpen, setIsModalOpen] = useState(false); // Controls CRUD modal form popup visibility
  const [modalMode, setModalMode] = useState('add'); // Form active operation mode: 'add' vs 'edit'
  const [selectedBookId, setSelectedBookId] = useState(null); // Database ID string of the catalog book currently being edited
  
  // 2. Form Variables States
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    price: '',
    imageUrl: '',
    category: '',
    stock: '10',
    rating: '4.5'
  });

  // 3. Success Toast Notifications state
  const [notification, setNotification] = useState(null);

  // fetchBooks: Queries the catalog API to fetch books. Invoked on mount and post-CRUD submits to sync catalog grids immediately.
  const fetchBooks = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/books');
      const data = await res.json();
      if (data.success) {
        setBooks(data.books); // Load catalog array
      } else {
        setError(data.message || 'Failed to fetch books');
      }
    } catch (err) {
      console.error(err);
      setError('Unable to connect to database. Make sure Express server is running!');
    } finally {
      setLoading(false); // Decryption sequence ended
    }
  };

  // Initial Mount Effect: Triggers fetchBooks query immediately during initial console load.
  useEffect(() => {
    fetchBooks();
  }, []);

  // showNotification: Launches success notification banners, fading them out after 3 seconds.
  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null); // Wipes alert from reactive state
    }, 3000);
  };

  // handleOpenAddModal: Resets form values, sets active mode to 'add', and unlocks popup overlays.
  const handleOpenAddModal = () => {
    setModalMode('add');
    setFormData({
      title: '',
      author: '',
      description: '',
      price: '',
      imageUrl: '',
      category: '',
      stock: '10',
      rating: '4.5'
    });
    setIsModalOpen(true); // Open modal overlay
  };

  // handleOpenEditModal: Pre-fills form fields with existing book details, sets active mode to 'edit', locks book ID, and unlocks popup overlays.
  const handleOpenEditModal = (book) => {
    setModalMode('edit');
    setSelectedBookId(book._id); // Lock ID
    setFormData({
      title: book.title,
      author: book.author,
      description: book.description,
      price: book.price.toString(),
      imageUrl: book.imageUrl,
      category: book.category,
      stock: book.stock ? book.stock.toString() : '10',
      rating: book.rating ? book.rating.toString() : '4.5'
    });
    setIsModalOpen(true); // Open modal overlay
  };

  // handleDeleteBook: Prompts secure authorization warning check, pings Express DELETE API endpoints attaching JWT Admin credentials, and refetches catalog lists on success.
  const handleDeleteBook = async (id) => {
    // A. Enforce safety confirm check
    if (!window.confirm('Are you absolutely sure you want to delete this book? This action is irreversible.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token'); // Retrieve authorization credentials
      
      // Ping Express DELETE API router endpoint
      const res = await fetch(`http://localhost:5000/api/books/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}` // Attach authorization token
        }
      });
      const data = await res.json();

      if (data.success) {
        setBooks(books.filter((b) => b._id !== id)); // Remove book immediately from local list
        showNotification('Book successfully removed from bookstore catalog!');
      } else {
        alert(data.message || 'Failed to delete book');
      }
    } catch (err) {
      console.error(err);
      alert('Delete operation failed.');
    }
  };

  // handleInputChange: Syncs changes typed in individual inputs into local state.
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // handleSubmitForm: Resolves target URL endpoint and REST method (POST for addition, PUT for updates) dynamically, submits forms data to backend, pings catalogs, and handles closes.
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token'); // Retrieve auth credentials token
    
    // A. Resolve routing configurations dynamically
    const url = modalMode === 'add' 
      ? 'http://localhost:5000/api/books' 
      : `http://localhost:5000/api/books/${selectedBookId}`;
    
    const method = modalMode === 'add' ? 'POST' : 'PUT';

    try {
      // B. Dispatch request to Express router controller endpoints
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Attach authorization token
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (data.success) {
        setIsModalOpen(false); // Close overlay popup modal
        fetchBooks(); // Refresh catalog grid list immediately
        showNotification(
          modalMode === 'add' 
            ? 'New book added to database successfully!' 
            : 'Book records updated successfully!'
        );
      } else {
        alert(data.message || 'Failed to process book form submission');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred during form submission.');
    }
  };

  return (
    <div className="admin-dashboard-container">
      
      {/* Toast Notification Banner */}
      {notification && (
        <div className="admin-toast glass-panel">
          <span className="toast-icon">✓</span>
          <span className="toast-text">{notification}</span>
        </div>
      )}

      {/* HEADER BAR SECTION */}
      <header className="admin-header glass-panel">
        <div className="admin-header-details">
          <h1 className="admin-title">📚 Bookstore <span className="text-gradient">Manager Console</span></h1>
          <p className="admin-subtitle">Perform full CRUD lifecycle operations on database catalog records.</p>
        </div>
        <button onClick={handleOpenAddModal} className="glow-btn add-book-btn">
          ➕ Add New Book
        </button>
      </header>

      {/* ADMINISTRATIVE BOOKS CATALOG LIST SECTION */}
      <section className="admin-catalog-section">
        {loading ? (
          // A. Spinner during background fetches
          <div className="admin-loading flex-center">
            <div className="spinner"></div>
            <p>Decrypting database catalogs...</p>
          </div>
        ) : error ? (
          // B. Server connection warnings
          <div className="admin-error glass-panel flex-center">
            <p>⚠️ {error}</p>
          </div>
        ) : books.length === 0 ? (
          // C. Zero books in catalog warning dialogs
          <div className="admin-empty glass-panel flex-center">
            <h2>Catalog is Empty</h2>
            <p>There are no books currently stored in the database. Add your very first book catalog entry to get started.</p>
            <button onClick={handleOpenAddModal} className="glow-btn" style={{ marginTop: '15px' }}>
              Add Your First Book
            </button>
          </div>
        ) : (
          // D. Catalog Grid in Admin View mode
          <div className="admin-books-grid">
            {books.map((book) => (
              <BookCard
                key={book._id}
                book={book}
                isAdminView={true} // Enable administrative edit/delete controls
                onEdit={handleOpenEditModal}
                onDelete={handleDeleteBook}
              />
            ))}
          </div>
        )}
      </section>

      {/* CRUD ADD/EDIT OVERLAY MODAL FORM */}
      {isModalOpen && (
        <div className="modal-overlay flex-center">
          <div className="modal-card glass-panel">
            
            {/* Modal Header */}
            <div className="modal-header">
              <h2>{modalMode === 'add' ? '➕ Add Book' : '📝 Edit Book'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="modal-close-btn">✕</button>
            </div>
            
            {/* Modal Input Form */}
            <form onSubmit={handleSubmitForm} className="modal-form">
              <div className="modal-form-grid">
                
                {/* Book Title field */}
                <div className="modal-form-group">
                  <label>Book Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g. Master Clean Code"
                    required
                  />
                </div>

                {/* Author Name field */}
                <div className="modal-form-group">
                  <label>Author</label>
                  <input
                    type="text"
                    name="author"
                    value={formData.author}
                    onChange={handleInputChange}
                    placeholder="e.g. Robert C. Martin"
                    required
                  />
                </div>

                {/* Genre Category field */}
                <div className="modal-form-group">
                  <label>Category / Genre</label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    placeholder="e.g. technology, fiction, science"
                    required
                  />
                </div>

                {/* Pricing field */}
                <div className="modal-form-group">
                  <label>Price (₹ INR)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="e.g. 199.00"
                    required
                  />
                </div>

                {/* Stock Level field */}
                <div className="modal-form-group">
                  <label>Stock Quantity</label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    placeholder="e.g. 10"
                    required
                  />
                </div>

                {/* Rating field */}
                <div className="modal-form-group">
                  <label>Mock Rating (1-5)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    name="rating"
                    value={formData.rating}
                    onChange={handleInputChange}
                    placeholder="e.g. 4.8"
                  />
                </div>

                {/* Cover Artwork URL field */}
                <div className="modal-form-group" style={{ gridColumn: 'span 2' }}>
                  <label>Cover Image URL</label>
                  <input
                    type="url"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleInputChange}
                    placeholder="e.g. https://images.unsplash.com/photo-1543002588-bfa74002ed7e"
                    required
                  />
                  <div className="image-url-tips">
                    💡 Tip: Paste any public image URL or use Unsplash/placeholder URLs.
                  </div>
                </div>

                {/* Synopsis Description field */}
                <div className="modal-form-group" style={{ gridColumn: 'span 2' }}>
                  <label>Book Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Write a brief compelling summary of the book contents..."
                    rows="3"
                    required
                  ></textarea>
                </div>
              </div>

              {/* Action Buttons panel */}
              <div className="modal-actions-bar">
                <button type="button" onClick={() => setIsModalOpen(false)} className="secondary-btn">
                  Cancel
                </button>
                <button type="submit" className="glow-btn">
                  {modalMode === 'add' ? 'Add to Database' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Embedded Component Scope CSS Rules */}
      <style>{`
        .admin-dashboard-container {
          width: 95%;
          max-width: 1400px;
          margin: 0 auto 50px auto;
          animation: fadeIn 0.4s ease-out;
        }

        .admin-toast {
          position: fixed;
          bottom: 30px;
          right: 30px;
          z-index: 1200;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 24px;
          border-left: 4px solid var(--accent-green);
          background: rgba(10, 8, 19, 0.95);
          animation: slideUp 0.3s ease-out;
        }

        .admin-header {
          padding: 30px 40px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 45px;
          background: radial-gradient(circle at top right, rgba(168, 85, 247, 0.1) 0%, transparent 60%), var(--bg-card);
          border-color: rgba(168, 85, 247, 0.2);
        }

        .admin-title {
          font-size: 2.2rem;
          font-weight: 800;
        }

        .admin-subtitle {
          color: var(--text-secondary);
          margin-top: 5px;
        }

        .add-book-btn {
          background: linear-gradient(135deg, var(--secondary), #ec4899);
          box-shadow: 0 4px 15px var(--secondary-glow);
        }

        .add-book-btn:hover {
          box-shadow: 0 6px 20px rgba(236, 72, 153, 0.4);
        }

        .admin-catalog-section {
          min-height: 400px;
        }

        .admin-loading {
          flex-direction: column;
          gap: 15px;
          height: 300px;
          color: var(--text-secondary);
        }

        .admin-error {
          height: 200px;
          color: var(--accent-red);
          font-weight: 600;
        }

        .admin-empty {
          padding: 60px 40px;
          flex-direction: column;
          gap: 12px;
          text-align: center;
        }

        .admin-empty p {
          color: var(--text-secondary);
          max-width: 500px;
          line-height: 1.5;
        }

        .admin-books-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 25px;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(4, 3, 8, 0.85);
          z-index: 2000;
          padding: 20px;
          backdrop-filter: blur(8px);
        }

        .modal-card {
          width: 100%;
          max-width: 700px;
          background: rgba(12, 9, 21, 0.95);
          padding: 30px;
          border-color: rgba(168, 85, 247, 0.2);
          animation: scaleUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--border-glass);
          padding-bottom: 15px;
          margin-bottom: 24px;
        }

        .modal-close-btn {
          cursor: pointer;
          font-size: 1.2rem;
          color: var(--text-secondary);
          padding: 6px;
          border-radius: 50%;
          transition: var(--transition-fast);
        }

        .modal-close-btn:hover {
          color: var(--text-primary);
          background: rgba(255,255,255,0.05);
        }

        .modal-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .modal-form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .modal-form-group label {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .modal-form-group input, .modal-form-group textarea {
          padding: 10px 14px;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid var(--border-glass);
          border-radius: 8px;
          font-size: 0.95rem;
          color: var(--text-primary);
          outline: none;
          transition: var(--transition-fast);
          width: 100%;
        }

        .modal-form-group input:focus, .modal-form-group textarea:focus {
          border-color: var(--secondary);
          background: rgba(0, 0, 0, 0.4);
          box-shadow: 0 0 8px var(--secondary-glow);
        }

        .image-url-tips {
          font-size: 0.7rem;
          color: var(--text-muted);
          margin-top: 4px;
          font-weight: 500;
        }

        .modal-actions-bar {
          display: flex;
          justify-content: flex-end;
          gap: 15px;
          border-top: 1px solid var(--border-glass);
          padding-top: 20px;
          margin-top: 24px;
        }

        @media (max-width: 650px) {
          .modal-form-grid {
            grid-template-columns: 1fr;
          }
          .modal-form-group[style] {
            grid-column: span 1 !important;
          }
          .admin-header {
            flex-direction: column;
            gap: 20px;
            text-align: center;
            padding: 20px;
          }
        }
      `}</style>
    </div>
  );
};

// Export AdminDashboard page component as default
export default AdminDashboard;
