// ============================================================================
// BOOKKART BOOK SCHEMA MODEL
// ============================================================================
// This file defines the Mongoose database schema blueprint for a "Book" entity.
// It governs data types, validation constraints, and default catalog specifications
// for books stored in the MongoDB Atlas cloud database.

const mongoose = require('mongoose'); // Imports the Mongoose ODM library for schema generation

// Book Schema Blueprint: Defines fields, validation error rules, and defaults for a book record.
const BookSchema = new mongoose.Schema({
  // 1. The official name of the book
  title: {
    type: String,
    required: [true, 'Please add a book title'], // Field validation rule: must be present
    trim: true // Data sanitizer: trims trailing and leading whitespaces
  },
  
  // 2. The author/writer who wrote the book
  author: {
    type: String,
    required: [true, 'Please add an author name'], // Field validation rule: must be present
    trim: true // Data sanitizer: trims trailing and leading whitespaces
  },
  
  // 3. High-level synopsis detailing the book's contents
  description: {
    type: String,
    required: [true, 'Please add a description'] // Field validation rule: must be present
  },
  
  // 4. Retail cost of the book in Indian Rupees (₹)
  price: {
    type: Number,
    required: [true, 'Please add a price'] // Field validation rule: must be present
  },
  
  // 5. Image HTTP link hosting the book's cover artwork
  imageUrl: {
    type: String,
    required: [true, 'Please add an image URL'] // Field validation rule: must be present
  },
  
  // 6. Literary genre/classification (e.g. technology, thriller, self-help)
  category: {
    type: String,
    required: [true, 'Please add a category'], // Field validation rule: must be present
    trim: true // Data sanitizer: trims trailing and leading whitespaces
  },
  
  // 7. Average customer feedback star rating (e.g., 4.5 out of 5)
  rating: {
    type: Number,
    default: 4.5 // Assigns default score of 4.5 stars if omitted
  },
  
  // 8. Aggregate number of reviews posted by customers
  reviewsCount: {
    type: Number,
    default: 12 // Assigns default review count of 12 if omitted
  },
  
  // 9. Quantity available in warehouse inventory
  stock: {
    type: Number,
    default: 10 // Assigns default stock level of 10 if omitted
  },
  
  // 10. Date of database creation
  createdAt: {
    type: Date,
    default: Date.now // Automatically logs current timestamp during database write
  }
});

// Compile and export the Book Mongoose Model, registering it to 'books' collection
module.exports = mongoose.model('Book', BookSchema);
