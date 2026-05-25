// ============================================================================
// BOOKKART DATABASE SEEDER ENGINE
// ============================================================================
// This script seeds the MongoDB database with initial mock catalog items and
// default administrator login credentials. Run this utility using 'node seed.js'
// in the server folder to restore the database to a clean, known-good testing state.

require('dotenv').config(); // Load environment variables from server/.env file
const mongoose = require('mongoose'); // Imports Mongoose ODM to perform database writes
const Book = require('./models/Book'); // Imports the Book data schema model
const User = require('./models/User'); // Imports the User data schema model

// Mock Bookstore Catalog Dataset: A list of initial books covering multiple categories.
// Each entry includes a premium Unsplash cover image fallback.
const mockBooks = [
  {
    title: "The Silent Patient",
    author: "Alex Michaelides",
    description: "A shocking psychological thriller about a woman's act of violence against her husband—and the therapist obsessed with uncovering her motive.",
    price: 14.99,
    imageUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=400",
    category: "thriller",
    rating: 4.7,
    reviewsCount: 184,
    stock: 12
  },
  {
    title: "Eloquent JavaScript, 3rd Edition",
    author: "Marijn Haverbeke",
    description: "A deep dive into the JavaScript language, showing you how to write beautiful, effective code through interactive exercises and code blocks.",
    price: 29.95,
    imageUrl: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=400",
    category: "technology",
    rating: 4.8,
    reviewsCount: 92,
    stock: 8
  },
  {
    title: "Atomic Habits",
    author: "James Clear",
    description: "An easy and proven way to build good habits and break bad ones, drawing on the most proven ideas from biology, psychology, and neuroscience.",
    price: 16.20,
    imageUrl: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?q=80&w=400",
    category: "self-help",
    rating: 4.9,
    reviewsCount: 420,
    stock: 25
  },
  {
    title: "Dune (Deluxe Edition)",
    author: "Frank Herbert",
    description: "The masterpiece of science fiction about the desert planet Arrakis and the young Paul Atreides, who will lead a revolution to claim his destiny.",
    price: 22.50,
    imageUrl: "https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=400",
    category: "sci-fi",
    rating: 4.6,
    reviewsCount: 215,
    stock: 5
  },
  {
    title: "Zero to One",
    author: "Peter Thiel",
    description: "Notes on start-ups, or how to build the future. How to find singular paths to create new things rather than copying what already exists.",
    price: 18.00,
    imageUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=400",
    category: "business",
    rating: 4.5,
    reviewsCount: 64,
    stock: 15
  }
];

// seedDB: Orchestrates the database seeding process by purging old entries,
// uploading the mock catalog books list, and registering default admin credentials.
const seedDB = async () => {
  try {
    // 1. Fetch connection string from variables
    const connStr = process.env.MONGODB_URI;
    if (!connStr) {
      console.error("❌ Cannot seed database: MONGODB_URI is not defined in server/.env!");
      process.exit(1);
    }

    // 2. Open temporary database connection
    console.log("Connecting to database for seeding...");
    await mongoose.connect(connStr);
    console.log("Connected successfully!");

    // 3. Clear all old book entries from database
    console.log("Clearing existing books catalog...");
    await Book.deleteMany();

    // 4. Populate catalog with fresh mock dataset
    console.log("Seeding new mock books catalog...");
    await Book.insertMany(mockBooks);
    console.log("✅ Catalog successfully seeded!");

    // 5. Purge duplicate or stale admin users to prevent login collision
    console.log("Syncing admin user credentials...");
    await User.deleteMany({ role: 'admin' });

    // 6. Register default administrator login for dashboard verification
    const adminEmail = "admin@bookkart.com";
    console.log("Creating default Admin credentials for testing...");
    await User.create({
      username: "admin",
      email: adminEmail,
      password: "admin123", // Will be automatically encrypted by pre-save middleware
      role: "admin"
    });
    console.log("✅ Default Admin created successfully!");
    console.log(`🔑 Login: ${adminEmail}`);
    console.log("🔑 Password: admin123");

    // 7. Tear down database connection cleanly
    mongoose.connection.close();
    console.log("Database connection closed.");
    process.exit(0); // Exit process with success code 0
  } catch (error) {
    // 8. Capture and log catastrophic database writing crashes
    console.error("❌ Seeding failed with error:", error.message);
    process.exit(1); // Exit process with failure code 1
  }
};

// Initiate seeding sequence!
seedDB();
