// ============================================================================
// 🛒 BOOKKART SHOPPING CART & STRIPE CHECKOUT ROUTE CONTROLLERS
// ============================================================================
// This file coordinates bookstore purchasing systems. It processes shopping cart
// arrays, builds Stripe Checkout sessions (supporting Indian Rupees - INR),
// creates pending database Order structures, handles developer sandbox simulated
// credit card checkouts if Stripe credentials are blank, and verifies payments to
// permanently unlock eBooks inside the customer's virtual library.

const express = require('express'); // Imports the Express framework
const router = express.Router(); // Instantiates Express Router to define endpoints
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_mock_stripe_key_for_development_purposes'); // Configures Stripe SDK with secret keys or fallback sandbox mocks
const Book = require('../models/Book'); // Imports Book mongoose blueprint schema
const Order = require('../models/Order'); // Imports Order mongoose blueprint schema
const User = require('../models/User'); // Imports User mongoose blueprint schema
const { protect } = require('../middleware/auth'); // Imports security protect guard middleware

// POST /api/cart/checkout: Builds a secure billing checkout session.
// Automatically switches to developer simulated checkouts if the server's `.env`
// Stripe keys are set to mocks, bypassing card validation forms for quick testing.
router.post('/checkout', protect, async (req, res, next) => {
  try {
    const { items } = req.body; // Array of { bookId, quantity }

    // 1. Enforce that cart contains items
    if (!items || items.length === 0) {
      res.status(400);
      throw new Error('Cart is empty');
    }

    const lineItems = [];
    const dbItems = [];
    const bookIds = [];

    // 2. Fetch detailed specifications for each book and construct Stripe line-item structures
    for (const item of items) {
      const book = await Book.findById(item.bookId);
      if (!book) {
        res.status(404);
        throw new Error(`Book not found with ID: ${item.bookId}`);
      }

      // Prepare Stripe line-item in Indian Rupees (INR)
      lineItems.push({
        price_data: {
          currency: 'inr', // Set standard transaction currency to Indian Rupees
          product_data: {
            name: book.title,
            description: `By ${book.author}`,
            images: book.imageUrl ? [book.imageUrl] : [],
          },
          unit_amount: Math.round(book.price * 100), // Converted to cents/paise (price * 100)
        },
        quantity: item.quantity,
      });

      // Prepare database item mapping to register order records
      dbItems.push({
        book: book._id,
        quantity: item.quantity,
        price: book.price
      });

      // Track plain string book IDs for library updates
      bookIds.push(book._id.toString());
    }

    // 3. Calculate cumulative total amount for auditing and validation checks
    const totalAmount = dbItems.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);

    // 4. Resolve client success & cancel landing pages redirection URLs
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

    // 5. Verify if a real Stripe credentials key is active
    const isMock = !process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.startsWith('sk_test_mock');

    // Enforce Stripe's 50-cent minimum transaction requirement (approx. ₹45.00 INR) if running real Stripe mode
    if (!isMock && totalAmount < 45) {
      res.status(400);
      throw new Error('Stripe requires a minimum transaction amount of ₹45.00 INR (approx. $0.50 USD) to process payments. Please add more books to your cart or purchase a higher-priced book.');
    }

    let session;
    if (!isMock) {
      // Create real Stripe hosted checkout portals session
      session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: `${clientUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${clientUrl}/cart`,
        metadata: {
          userId: req.user.id,
          bookIds: JSON.stringify(bookIds)
        }
      });
    } else {
      // Bypass: Create mock local session for zero-config developer sandbox testing
      const mockSessionId = 'cs_mock_' + Math.random().toString(36).substr(2, 9);
      session = {
        id: mockSessionId,
        url: `${clientUrl}/success?session_id=${mockSessionId}&mock=true`,
        metadata: {
          userId: req.user.id,
          bookIds: JSON.stringify(bookIds)
        }
      };
    }

    // 6. Write a "pending" Order record to MongoDB Atlas prior to processing payment
    await Order.create({
      user: req.user.id,
      items: dbItems,
      totalAmount,
      stripeSessionId: session.id,
      status: 'pending'
    });

    // 7. Output Stripe redirection link back to React Client
    res.status(200).json({
      success: true,
      url: session.url,
      sessionId: session.id
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/cart/verify-checkout: Audit payment verification gateway. Called post-redirect.
// Inspects Stripe session statuses, registers purchase completions, and adds
// books to the customer's permanent eBook reader library while filtering duplicates.
router.post('/verify-checkout', protect, async (req, res, next) => {
  try {
    const { sessionId } = req.body;

    // 1. Verify session param presence
    if (!sessionId) {
      res.status(400);
      throw new Error('Session ID is required');
    }

    // 2. Locate matching pending order record in MongoDB Atlas
    const order = await Order.findOne({ stripeSessionId: sessionId });
    if (!order) {
      res.status(404);
      throw new Error('Order not found for this checkout session');
    }

    // 3. Skip re-verifications if the order has been archived as completed previously
    if (order.status === 'completed') {
      return res.status(200).json({
        success: true,
        message: 'Order already completed previously',
        order
      });
    }

    // 4. Distinguish between simulated local mocks and live Stripe gateways
    const isMock = sessionId.startsWith('cs_mock_');
    let paymentSuccess = false;

    if (isMock) {
      paymentSuccess = true;
    } else {
      try {
        // Query Stripe API directly using secret keys to audit payment success
        const stripeSession = await stripe.checkout.sessions.retrieve(sessionId);
        if (stripeSession.payment_status === 'paid') {
          paymentSuccess = true;
        }
      } catch (stripeErr) {
        console.error('Stripe retrieve error:', stripeErr.message);
        // Sandbox fallback for development: approve order if Stripe API returns connection errors in dev mode
        if (process.env.NODE_ENV !== 'production') {
          console.log('⚠️ Stripe validation failed. Approving checkout in dev mode.');
          paymentSuccess = true;
        }
      }
    }

    // 5. Complete order and append purchased items to customer profile
    if (paymentSuccess) {
      // Update order status to completed
      order.status = 'completed';
      await order.save();

      // Retrieve User profile matching customer token
      const user = await User.findById(req.user.id);
      
      // Get the book IDs from this order
      const bookIds = order.items.map(item => item.book);

      // Add to user's purchased books if not already in it (converting ObjectIds to string for proper comparison)
      bookIds.forEach(id => {
        const idStr = id.toString();
        const alreadyExists = user.purchasedBooks.some(existingId => existingId.toString() === idStr);
        if (!alreadyExists) {
          user.purchasedBooks.push(id);
        }
      });

      // Save user document changes
      await user.save();

      res.status(200).json({
        success: true,
        message: 'Payment verified and purchase completed successfully!',
        order
      });
    } else {
      // Mark local order status as failed on invalid payment checks
      order.status = 'failed';
      await order.save();
      
      res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }
  } catch (error) {
    next(error);
  }
});

// Export shopping cart payment routes
module.exports = router;
