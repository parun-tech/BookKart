// ============================================================================
// 📚 BOOKKART BOOKSTORE CATALOG ROUTE CONTROLLERS
// ============================================================================
// This file handles REST endpoints for standard catalog listings, fetching
// purchased volumes, and locks down book Add/Edit/Delete actions under strictly
// protected administrative CORS gates.

const express = require('express'); // Imports the Express framework
const router = express.Router(); // Instantiates Express Router to define endpoints
const Book = require('../models/Book'); // Imports Book mongoose schema blueprint
const User = require('../models/User'); // Imports User mongoose schema blueprint
const { protect, authorize } = require('../middleware/auth'); // Imports JWT and role guards middleware

// GET /api/books: Retrieves the complete bookstore catalog.
// Sorted dynamically by database registration date (latest first).
router.get('/', async (req, res, next) => {
  try {
    // 1. Fetch all book documents from database
    const books = await Book.find().sort({ createdAt: -1 });
    
    // 2. Return catalog array
    res.status(200).json({
      success: true,
      count: books.length,
      books
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/books/my-books: Retrieves the permanently owned eBook library list for the logged-in customer.
// Employs a defensive backend deduplication filter to ensure clean arrays.
router.get('/my-books', protect, async (req, res, next) => {
  try {
    // 1. Retrieve the User profile and resolve populated Book details from referenced ObjectIds
    const user = await User.findById(req.user.id).populate('purchasedBooks');
    
    // 2. Proactive defensive filter: Deduplicate populated book records by string IDs in case of database sync bugs
    const uniqueBooks = [];
    const seenIds = new Set();
    
    user.purchasedBooks.forEach(book => {
      if (book && book._id) {
        const idStr = book._id.toString();
        // Append book card only if its string ID hasn't been logged in the Set
        if (!seenIds.has(idStr)) {
          seenIds.add(idStr);
          uniqueBooks.push(book);
        }
      }
    });

    // 3. Return clean, deduplicated library array
    res.status(200).json({
      success: true,
      count: uniqueBooks.length,
      books: uniqueBooks
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/books/:id: Fetches the detailed catalog specifications for a single book.
router.get('/:id', async (req, res, next) => {
  try {
    // 1. Locate book document using the ID parameter passed in the URL link
    const book = await Book.findById(req.id || req.params.id);
    
    // 2. Return 404 error if no matching catalog entry exists
    if (!book) {
      res.status(404);
      throw new Error(`Book record not found matching ID: ${req.params.id}`);
    }
    
    // 3. Return single book specs
    res.status(200).json({
      success: true,
      book
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/books: Creates a brand new book catalog entry in MongoDB. Requires valid Admin login.
router.post('/', protect, authorize('admin'), async (req, res, next) => {
  try {
    const { title, author, description, price, imageUrl, category, rating, stock } = req.body;

    // 1. Write new book document to database
    const book = await Book.create({
      title,
      author,
      description,
      price: Number(price), // Enforces correct numerical casting
      imageUrl,
      category,
      rating: rating ? Number(rating) : 4.5, // Assigns default star rating if blank
      stock: stock ? Number(stock) : 10      // Assigns default stock level if blank
    });

    // 2. Return created book document
    res.status(201).json({
      success: true,
      book
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/books/:id: Updates an existing book catalog record in MongoDB. Requires valid Admin login.
router.put('/:id', protect, authorize('admin'), async (req, res, next) => {
  try {
    // 1. Audit check: verify book document exists
    let book = await Book.findById(req.params.id);
    if (!book) {
      res.status(404);
      throw new Error(`Book record not found matching ID: ${req.params.id}`);
    }

    // 2. Perform database update, forcing validation rules checks
    book = await Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // Demands Mongoose returns the newly modified document instead of old one
      runValidators: true // Forces Mongoose schema validators to run on updates
    });

    // 3. Return updated book document
    res.status(200).json({
      success: true,
      book
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/books/:id: Removes a book completely from the database catalog inventory. Requires valid Admin login.
router.delete('/:id', protect, authorize('admin'), async (req, res, next) => {
  try {
    // 1. Audit check: verify book presence
    const book = await Book.findById(req.params.id);
    if (!book) {
      res.status(404);
      throw new Error(`Book record not found matching ID: ${req.params.id}`);
    }

    // 2. Execute document deletion
    await book.deleteOne();

    // 3. Return success feedback
    res.status(200).json({
      success: true,
      message: 'Book record successfully deleted and removed from catalog.'
    });
  } catch (error) {
    next(error);
  }
});

// Export bookstore CRUD routes
module.exports = router;
