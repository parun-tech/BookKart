// ============================================================================
// BOOKKART CLIENT SIDE NAVIGATION WIREFRAME (App Routing Engine)
// ============================================================================
// This component acts as the main shell and router configuration of the React client.
// It mounts global State Providers (Auth & Cart Contexts), sets up browser routing (React Router Dom),
// registers private route safety check wrappers, and maps URLs to specific Page views.

import React from 'react'; // Imports React library
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // Imports React Router components for page navigation

// 1. STATE PROVIDERS (Mount state managers globally to be accessible across any children component)
import { AuthProvider } from './context/AuthContext'; // Persists auth states, handles register, logins, and logouts
import { CartProvider } from './context/CartContext'; // Persists shopping carts, quantity edits, and Stripe redirects

// 2. REUSABLE UI WRAPPERS & PLUGINS
import Navbar from './components/Navbar'; // Global glowing navigation bar visible across all page views
import ProtectedRoute from './components/ProtectedRoute'; // Route wrapper used to redirect unauthorized users to login portals

// 3. STOREFRONT & CUSTOMER PORTAL PAGE VIEWS
import Home from './pages/Home'; // Main Bookstore catalog catalog storefront listing filters
import Cart from './pages/Cart'; // Shopping cart view, list details, quantity edits, and checkout trigger
import MyBooks from './pages/MyBooks'; // Virtual eBook library listing purchased items with interactive readers
import Login from './pages/Login'; // Unified customer and admin login page with tab toggles
import Register from './pages/Register'; // Customer registration screen (blocks browser password manager autocomplete)
import Success from './pages/Success'; // Checkout success page that verifies Stripe checkout session IDs

// 4. MANAGEMENT CONSOLE PORTALS
import AdminDashboard from './pages/AdminDashboard'; // Administrative catalog management CRUD console

// App: Assembles the base wireframe: Wraps all content under Providers, mounts Navbar, and sets up route switches.
function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <div className="app-root-layout">
            
            {/* Header navbar visible globally across the app */}
            <Navbar />
            
            {/* Main content viewport container */}
            <main className="main-content-layout">
              <Routes>
                
                {/* Protected bookstore storefront (Redirects to /login if user is unauthenticated) */}
                <Route 
                  path="/" 
                  element={
                    <ProtectedRoute>
                      <Home />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Public customer and administrator credentials verification gates */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/admin/login" element={<Login />} />
                
                {/* Protected shopping cart list details view */}
                <Route 
                  path="/cart" 
                  element={
                    <ProtectedRoute>
                      <Cart />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Stripe checkout success redirect return landing link */}
                <Route path="/success" element={<Success />} />

                {/* Protected customer virtual eBook reader library */}
                <Route 
                  path="/my-books" 
                  element={
                    <ProtectedRoute>
                      <MyBooks />
                    </ProtectedRoute>
                  } 
                />

                {/* Protected administrative CRUD catalog console (Requires role: 'admin') */}
                <Route 
                  path="/admin/dashboard" 
                  element={
                    <ProtectedRoute adminOnly={true}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  } 
                />
                
              </Routes>
            </main>
          </div>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

// Exports App component as default
export default App;
