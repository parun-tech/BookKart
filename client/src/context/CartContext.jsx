// ============================================================================
// 🛒 BOOKKART SHOPPING CART STATE PROVIDER (Context)
// ============================================================================
// This file coordinates client-side shopping cart state. It handles cart arrays,
// persists selections to user-scoped localStorage containers, performs quantity calculations,
// and handles secure Stripe checkout handshakes with the backend payment endpoints.

import React, { createContext, useState, useEffect, useContext } from 'react'; // Imports React hooks
import { AuthContext } from './AuthContext'; // Imports AuthContext to retrieve active user information

// Instantiate the Cart context hook to be consumed by child components
export const CartContext = createContext();

// Server Endpoint prefix path mapped from local proxy settings
const API_URL = 'http://localhost:5000/api';

// CartProvider: Wraps child components, serving as the single-source-of-truth for cart items.
export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]); // Array of active { book: Object, quantity: Number } entries
  const [checkoutLoading, setCheckoutLoading] = useState(false); // UI state flag representing active Stripe checkout redirections
  const { user } = useContext(AuthContext); // Loads user profile details from Authentication context

  // Initial Cart Restoration Effect: Runs whenever the logged-in User profile shifts. 
  // Checks for user-scoped localStorage cart items and restores active lists to reactive state.
  useEffect(() => {
    // Generate database user-scoped key (e.g. cart_64d23...) to separate customer carts
    const storedCart = localStorage.getItem(user ? `cart_${user.id}` : 'cart_guest');
    if (storedCart) {
      try {
        setCartItems(JSON.parse(storedCart)); // Deserializes cart array
      } catch (err) {
        console.error('Error parsing cart items', err);
        setCartItems([]);
      }
    } else {
      setCartItems([]);
    }
  }, [user]);

  // LocalStorage Cart Sync Effect: Runs whenever the cartItems array or user session changes. 
  // Automatically flushes the reactive cart state into the user-scoped localStorage container.
  useEffect(() => {
    if (user) {
      localStorage.setItem(`cart_${user.id}`, JSON.stringify(cartItems)); // Write user cart
    } else {
      localStorage.setItem('cart_guest', JSON.stringify(cartItems)); // Write guest cart
    }
  }, [cartItems, user]);

  // addToCart: Appends a new book card to the cart list. If the item already exists, it increments its active quantity by 1.
  const addToCart = (book) => {
    setCartItems((prevItems) => {
      // Look up book in active items array
      const existingItem = prevItems.find((item) => item.book._id === book._id);
      
      // A. If already inside cart, increment quantity
      if (existingItem) {
        return prevItems.map((item) =>
          item.book._id === book._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      
      // B. Otherwise, append book to cart with initial quantity of 1
      return [...prevItems, { book, quantity: 1 }];
    });
  };

  // removeFromCart: Removes a book completely from the shopping cart.
  const removeFromCart = (bookId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.book._id !== bookId));
  };

  // updateQuantity: Modifies the quantity of a specific book inside the cart list.
  // If the quantity falls to 0 or below, the item is removed from the cart.
  const updateQuantity = (bookId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(bookId); // Remove book if quantity drops to zero
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.book._id === bookId ? { ...item, quantity } : item
      )
    );
  };

  // clearCart: Wipes out all active cart items, restoring cartItems state to an empty array.
  const clearCart = () => {
    setCartItems([]);
  };

  // getCartTotal: Computes the grand subtotal cost of all books currently inside the cart.
  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + item.book.price * item.quantity, 0);
  };

  // getCartCount: Computes the cumulative physical number of books inside the cart.
  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  // checkout: Triggers cart checkout. Sends cart details to Express endpoints.
  // Redirects the user to secure Stripe hosted payment pages (or mock success URL).
  const checkout = async () => {
    // A. Enforce customer logins prior to checkout redirections
    if (!user) {
      alert('Please log in to complete your purchase.');
      return;
    }
    
    // B. Enforce cart items presence
    if (cartItems.length === 0) {
      alert('Your cart is empty.');
      return;
    }

    setCheckoutLoading(true); // Enable loading spinners on checkout trigger buttons
    try {
      const token = localStorage.getItem('token'); // Retrieve auth session key
      
      // Ping database endpoint with auth headers and cart elements array
      const res = await fetch(`${API_URL}/cart/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          items: cartItems.map((item) => ({
            bookId: item.book._id,
            quantity: item.quantity
          }))
        })
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || 'Checkout failed');
      }

      // Redirect browser viewport to Stripe (or mock local checkout completion handler)
      if (data.url) {
        window.location.href = data.url; // Trigger redirection
      } else {
        throw new Error('Stripe redirect URL not found');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert(`Checkout failed: ${error.message}`);
    } finally {
      setCheckoutLoading(false); // Restore normal button state
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        checkoutLoading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
        checkout
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
